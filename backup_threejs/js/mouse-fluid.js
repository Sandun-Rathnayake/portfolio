/**
 * mouse-fluid.js — GPU-based Fluid Mouse Trail Simulation & Distortion
 * Ported directly from the lusion.co WebGL render pipeline.
 *
 * Implements:
 *  1. Double FBO ping-pong rendering loop for velocity advection simulation.
 *  2. Gaussian blur pass to smooth out velocity vectors.
 *  3. Post-processing shader pass combining:
 *     - Fluid refraction displacement mapping.
 *     - Velocity-driven RGB Chromatic Aberration.
 *     - Dynamic color cycle (RGB sine wave) blended with a custom liquid tint.
 *     - Turbulence/noise displacement using HDR_LA_0.png.
 *
 * Sandun Rathnayake Portfolio
 */
(function () {
  "use strict";

  class MouseFluidEffect {
    /**
     * @param {THREE.WebGLRenderer} renderer
     * @param {THREE.Scene} scene
     * @param {THREE.Camera} camera
     */
    constructor(renderer, scene, camera) {
      this.renderer = renderer;
      this.scene = scene;
      this.camera = camera;
      this.settings = {
        pointer: {
          ease: 0.2,
        },
        flow: {
          radius: 0.02,
          strength: 1.0,
          decay: 0.00242,
          growScale: 1.0,
          advectionStrength: 0.007,
          blurStrength: 0.35,
          blurRadius: 1.0,
          noiseStrength: 0.002,
          noiseScale: 3.0,
        },
        rgb: {
          frequency: 10.0,
          strength: 0.5,
          mix: 0.15,
        },
        liquid: {
          color: new THREE.Color(0.98, 0.985, 1.0),
        },
        aberration: {
          strength: 0.02,
        },
        scene: {
          distortion: 0.015,
        },
      };

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      this.resolution = isMobile ? 256 : 512;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      this.aspectRatio = screenW / screenH;

      this.sceneRenderTarget = new THREE.WebGLRenderTarget(screenW, screenH, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      });

      // Procedural noise texture fallback to prevent CORS file:// protocol errors
      function createNoiseDataTexture() {
        const width = 128;
        const height = 128;
        const size = width * height;
        const data = new Uint8Array(4 * size);
        for (let i = 0; i < size; i++) {
          const stride = i * 4;
          data[stride]     = Math.floor(Math.random() * 255);
          data[stride + 1] = Math.floor(Math.random() * 255);
          data[stride + 2] = Math.floor(Math.random() * 255);
          data[stride + 3] = 255;
        }
        const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        return texture;
      }

      if (window.location.protocol === "file:") {
        this.noiseTexture = createNoiseDataTexture();
      } else {
        this.noiseTexture = new THREE.TextureLoader().load(
          "HDR_LA_0.png",
          undefined,
          undefined,
          () => {
            this.noiseTexture = createNoiseDataTexture();
          }
        );
        this.noiseTexture.wrapS = THREE.RepeatWrapping;
        this.noiseTexture.wrapT = THREE.RepeatWrapping;
      }

      let textureType = THREE.HalfFloatType;
      try {
        const gl = renderer.getContext();
        const isWebGL2 = renderer.capabilities.isWebGL2;
        if (!isWebGL2) {
          const hasHalfFloat =
            gl.getExtension("OES_texture_half_float") &&
            gl.getExtension("OES_texture_half_float_linear");
          const hasFloat =
            gl.getExtension("OES_texture_float") &&
            gl.getExtension("OES_texture_float_linear");
          if (hasHalfFloat) {
            textureType = THREE.HalfFloatType;
          } else if (hasFloat) {
            textureType = THREE.FloatType;
          } else {
            textureType = THREE.UnsignedByteType;
          }
        }
      } catch (e) {
        textureType = THREE.UnsignedByteType;
      }

      const fboOptions = {
        depthBuffer: false,
        stencilBuffer: false,
        type: textureType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      };

      this.velocityFBO1 = new THREE.WebGLRenderTarget(
        this.resolution,
        this.resolution,
        fboOptions,
      );
      this.velocityFBO2 = new THREE.WebGLRenderTarget(
        this.resolution,
        this.resolution,
        fboOptions,
      );
      this.readVelocity = this.velocityFBO1;
      this.writeVelocity = this.velocityFBO2;

      // blur buffer
      this.blurFBO = new THREE.WebGLRenderTarget(
        this.resolution / 2,
        this.resolution / 2,
        fboOptions,
      );

      // ── Post Processing full screen setup ───────────────
      this.fboScene = new THREE.Scene();
      this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      this.fboQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
      this.fboScene.add(this.fboQuad);

      // ── Shader Materials ─────────────────────────────────
      this._initShaders();

      // ── Pointer Tracker ──────────────────────────────────
      this.pointer = {
        current: new THREE.Vector2(0, 0),
        target: new THREE.Vector2(0, 0),
        velocity: new THREE.Vector2(0, 0),
        lastTime: 0,
        isActive: false,
      };

      this._setupEventListeners();

      // ── GUI Control Panel (lil-gui) ────────────────────────
      this._initGUI();
    }

    _initShaders() {
      // 1. Gaussian Blur Shader
      this.blurMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tInput: { value: null },
          uBlurDirection: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader: this._basicVertexShader(),
        fragmentShader: `
          uniform sampler2D tInput;
          uniform vec2 uBlurDirection;
          varying vec2 vUv;
          void main() {
            vec4 sum = vec4(0.0);
            sum += texture2D(tInput, vUv - 4.0 * uBlurDirection) * 0.051;
            sum += texture2D(tInput, vUv - 3.0 * uBlurDirection) * 0.0918;
            sum += texture2D(tInput, vUv - 2.0 * uBlurDirection) * 0.12245;
            sum += texture2D(tInput, vUv - 1.0 * uBlurDirection) * 0.1531;
            sum += texture2D(tInput, vUv) * 0.1633;
            sum += texture2D(tInput, vUv + 1.0 * uBlurDirection) * 0.1531;
            sum += texture2D(tInput, vUv + 2.0 * uBlurDirection) * 0.12245;
            sum += texture2D(tInput, vUv + 3.0 * uBlurDirection) * 0.0918;
            sum += texture2D(tInput, vUv + 4.0 * uBlurDirection) * 0.051;
            gl_FragColor = sum;
          }
        `,
        depthWrite: false,
        depthTest: false,
      });

      // 2. Fluid Simulation Shader
      this.velocityMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tVelocity: { value: null },
          tBlur: { value: null },
          tNoise: { value: this.noiseTexture },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uVelocity: { value: new THREE.Vector2(0, 0) },
          uDeltaTime: { value: 16.6 },
          uRadius: { value: this.settings.flow.radius },
          uStrength: { value: this.settings.flow.strength },
          uDecay: { value: this.settings.flow.decay },
          uGrowScale: { value: this.settings.flow.growScale },
          uAdvectionStrength: { value: this.settings.flow.advectionStrength },
          uBlurStrength: { value: this.settings.flow.blurStrength },
          uNoiseStrength: { value: this.settings.flow.noiseStrength },
          uNoiseScale: { value: this.settings.flow.noiseScale },
          uAspectRatio: { value: this.aspectRatio },
        },
        vertexShader: this._basicVertexShader(),
        fragmentShader: `
          uniform sampler2D tVelocity;
          uniform sampler2D tBlur;
          uniform sampler2D tNoise;
          uniform vec2 uMouse;
          uniform vec2 uVelocity;
          uniform float uDeltaTime;
          uniform float uRadius;
          uniform float uStrength;
          uniform float uDecay;
          uniform float uGrowScale;
          uniform float uAdvectionStrength;
          uniform float uBlurStrength;
          uniform float uNoiseStrength;
          uniform float uNoiseScale;
          uniform float uAspectRatio;
          varying vec2 vUv;

          void main() {
            vec2 ratio = vec2(uAspectRatio, 1.0);
            float fpsScale = uDeltaTime * (60.0 / 1000.0);

            // Splat
            vec2 localUV = vUv * ratio;
            vec2 localMouse = uMouse * ratio;
            float dist = distance(localUV, localMouse);
            float mask = exp(-dist / uRadius);
            vec2 splat = uVelocity * uStrength * mask;

            // Advection
            vec2 center = vec2(0.5, 0.5);
            float growScale = pow(uGrowScale, fpsScale);
            vec2 scaledUV = (vUv - center) / growScale + center;

            vec2 base = texture2D(tVelocity, scaledUV).rg;
            vec2 advectUV = scaledUV - base * uAdvectionStrength * fpsScale;

            // Turbulence noise
            vec2 noiseUV = scaledUV * ratio * uNoiseScale;
            vec2 noiseSampler = texture2D(tNoise, noiseUV).rg;
            vec2 textureNoise = (noiseSampler - vec2(0.5)) * uNoiseStrength;

            vec2 deformedUV = advectUV + textureNoise;

            vec2 advected = texture2D(tVelocity, deformedUV).rg;
            vec2 blurred = texture2D(tBlur, deformedUV).rg;

            float decayFactor = exp(-uDecay * fpsScale);
            vec2 mixed = mix(advected, blurred, uBlurStrength) * decayFactor;

            gl_FragColor = vec4(mixed + splat, 0.0, 1.0);
          }
        `,
        depthWrite: false,
        depthTest: false,
      });

      // 3. Final Compositing Shader (refraction + chromatic aberration + liquid rgb tint)
      this.postScene = new THREE.Scene();
      this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      this.postQuad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
          uniforms: {
            tDiffuse: { value: null },
            tVelocity: { value: null },
            uDistortionStrength: { value: this.settings.scene.distortion },
            uAberrationStrength: { value: this.settings.aberration.strength },
            uRgbFrequency: { value: this.settings.rgb.frequency },
            uRgbStrength: { value: this.settings.rgb.strength },
            uRgbMix: { value: this.settings.rgb.mix },
            uLiquidColor: { value: this.settings.liquid.color },
          },
          vertexShader: this._basicVertexShader(),
          fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform sampler2D tVelocity;
            uniform float uDistortionStrength;
            uniform float uAberrationStrength;
            uniform float uRgbFrequency;
            uniform float uRgbStrength;
            uniform float uRgbMix;
            uniform vec3 uLiquidColor;
            varying vec2 vUv;

            void main() {
              vec2 flowDirection = texture2D(tVelocity, vUv).rg;
              
              float flowLen = length(clamp(flowDirection, -2.0, 2.0));
              float rgbPhase = flowLen * -0.15;
              float phase = rgbPhase * uRgbFrequency * 3.14159265;
              
              vec3 rgb = vec3(
                sin(phase + 0.0) * 0.5 + 0.5,
                sin(phase + 2.0) * 0.5 + 0.5,
                sin(phase + 4.0) * 0.5 + 0.5
              );
              
              float rgbStrength = length(flowDirection) * uRgbStrength;
              vec3 liquidColor = mix(uLiquidColor, rgb, uRgbMix);

              float caStrength = rgbStrength * uAberrationStrength * uDistortionStrength;
              vec2 caOffset = flowDirection * caStrength;

              vec2 uvOffset = flowDirection * (-uDistortionStrength) * length(liquidColor);
              vec2 sceneUV = vUv + uvOffset;

              float r = texture2D(tDiffuse, sceneUV + caOffset).r;
              float g = texture2D(tDiffuse, sceneUV - caOffset).g;
              float b = texture2D(tDiffuse, sceneUV - caOffset).b;
              float a = texture2D(tDiffuse, sceneUV).a;

              vec3 caColor = vec3(r, g, b);
              vec3 finalColor = mix(caColor, liquidColor, rgbStrength);

              // Output alpha channel of the scene so empty background is transparent
              gl_FragColor = vec4(finalColor, a);
            }
          `,
          depthWrite: false,
          depthTest: false,
          transparent: true,
        }),
      );
      this.postScene.add(this.postQuad);
    }

    _basicVertexShader() {
      return `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;
    }

    _setupEventListeners() {
      const handleMove = (clientX, clientY) => {
        const rect = this.renderer.domElement.getBoundingClientRect();

        // Remap to UV space [0, 1]
        const x = (clientX - rect.left) / rect.width;
        const y = 1.0 - (clientY - rect.top) / rect.height; // Flip y for WebGL bottom-up UV coords

        this.pointer.target.set(x, y);

        if (!this.pointer.isActive) {
          this.pointer.current.copy(this.pointer.target);
          this.pointer.velocity.set(0, 0);
          this.pointer.isActive = true;
        }
      };

      window.addEventListener("mousemove", (e) => {
        handleMove(e.clientX, e.clientY);
      });

      window.addEventListener("touchmove", (e) => {
        if (e.touches.length > 0) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      });

      window.addEventListener("touchend", () => {
        this.pointer.isActive = false;
      });
      document.body.addEventListener("mouseleave", () => {
        this.pointer.isActive = false;
      });
    }

    /**
     * Rescales the post-processing buffer size
     */
    resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.aspectRatio = w / h;
      this.sceneRenderTarget.setSize(w, h);
      this.velocityMaterial.uniforms.uAspectRatio.value = this.aspectRatio;
    }

    /**
     * Swap velocity write and read targets
     */
    _swapVelocity() {
      const temp = this.readVelocity;
      this.readVelocity = this.writeVelocity;
      this.writeVelocity = temp;
    }

    /**
     * Perform the fluid simulation steps (blur, advect, splat, decay)
     */
    _stepSimulation(dtMs) {
      // 1. Update pointer coords & velocity
      const now = performance.now();
      const p = this.pointer;

      if (p.isActive && p.lastTime > 0) {
        const dt = now - p.lastTime;
        const lerpFactor =
          1.0 - Math.pow(1.0 - this.settings.pointer.ease, dt / 16.66);

        const prevX = p.current.x;
        const prevY = p.current.y;

        p.current.x = p.current.x + (p.target.x - p.current.x) * lerpFactor;
        p.current.y = p.current.y + (p.target.y - p.current.y) * lerpFactor;

        const vdt = Math.max(dt / 1000, 1e-6);
        p.velocity.set(
          (p.current.x - prevX) / vdt,
          (p.current.y - prevY) / vdt,
        );
      } else {
        p.velocity.set(0, 0);
      }
      p.lastTime = now;

      // 2. Perform Gaussian Blur on readVelocity sampler
      const blurRadius = this.settings.flow.blurRadius;
      const blurDir = new THREE.Vector2(
        blurRadius / this.resolution,
        (blurRadius * this.aspectRatio) / this.resolution,
      );

      // Diagonal blur pass (bi-directional isotropic diffusion)
      this.blurQuad = this.fboQuad;
      this.blurMaterial.uniforms.tInput.value = this.readVelocity.texture;
      this.blurMaterial.uniforms.uBlurDirection.value.copy(blurDir);
      this.fboQuad.material = this.blurMaterial;

      this.renderer.setRenderTarget(this.blurFBO);
      this.renderer.render(this.fboScene, this.fboCamera);

      // 3. Perform velocity simulation pass
      const u = this.velocityMaterial.uniforms;
      u.tVelocity.value = this.readVelocity.texture;
      u.tBlur.value = this.blurFBO.texture;
      u.uMouse.value.copy(p.current);
      // Set velocity in UV units per second
      u.uVelocity.value.set(p.velocity.x, p.velocity.y);
      u.uDeltaTime.value = Math.min(dtMs, 100);

      this.fboQuad.material = this.velocityMaterial;
      this.renderer.setRenderTarget(this.writeVelocity);
      this.renderer.render(this.fboScene, this.fboCamera);
      this.renderer.setRenderTarget(null);

      // Swap read and write velocity targets
      this._swapVelocity();
    }

    /**
     * Render loop wrapper
     */
    render() {
      // Step simulation with fixed step (roughly 60fps delta)
      this._stepSimulation(16.66);

      // Render actual scene to texture
      this.renderer.setRenderTarget(this.sceneRenderTarget);

      // Clear with alpha 0.0 so background of the texture is transparent
      const prevClearAlpha = this.renderer.getClearAlpha();
      this.renderer.setClearAlpha(0.0);
      this.renderer.clear();
      this.renderer.setClearAlpha(prevClearAlpha);

      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(null);

      // Render post processing quad with flow mapping
      this.postQuad.material.uniforms.tDiffuse.value =
        this.sceneRenderTarget.texture;
      this.postQuad.material.uniforms.tVelocity.value =
        this.readVelocity.texture;
      this.renderer.render(this.postScene, this.postCamera);
    }

    /**
     * Updates liquid tint color
     * @param {string|THREE.Color} color
     */
    setLiquidColor(color) {
      if (typeof color === "string") {
        this.settings.liquid.color.set(color);
      } else {
        this.settings.liquid.color.copy(color);
      }
      this.postQuad.material.uniforms.uLiquidColor.value.copy(
        this.settings.liquid.color,
      );
      if (this.guiLiquidColorController) {
        this.guiLiquidColorController.setValue(
          "#" + this.settings.liquid.color.getHexString(),
        );
      }
    }

    /**
     * Initialize dynamic parameter GUI using lil-gui
     */
    _initGUI() {
      const GUI = window.lil?.GUI;
      if (!GUI) return;

      const gui = new GUI({ title: "Fluid Controls" });

      // Styling GUI to fit neatly
      gui.domElement.style.position = "fixed";
      gui.domElement.style.top = "80px";
      gui.domElement.style.right = "20px";
      gui.domElement.style.zIndex = "9999";

      const s = this.settings;

      // Interaction Folder
      const fPointer = gui.addFolder("Interaction");
      fPointer.add(s.pointer, "ease", 0.05, 0.4, 0.01).name("Cursor Easing");

      // Simulation Folder
      const fFlow = gui.addFolder("Simulation");
      fFlow
        .add(s.flow, "radius", 0.005, 0.08, 0.001)
        .name("Splat Radius")
        .onChange((v) => {
          this.velocityMaterial.uniforms.uRadius.value = v;
        });
      fFlow
        .add(s.flow, "strength", 0.1, 4.0, 0.1)
        .name("Flow Strength")
        .onChange((v) => {
          this.velocityMaterial.uniforms.uStrength.value = v;
        });
      fFlow
        .add(s.flow, "decay", 0.0, 0.02, 0.0001)
        .name("Velocity Decay")
        .onChange((v) => {
          this.velocityMaterial.uniforms.uDecay.value = v;
        });
      fFlow
        .add(s.flow, "advectionStrength", 0.0, 0.05, 0.001)
        .name("Advection")
        .onChange((v) => {
          this.velocityMaterial.uniforms.uAdvectionStrength.value = v;
        });
      fFlow
        .add(s.flow, "blurStrength", 0.0, 1.0, 0.05)
        .name("Blur Intensity")
        .onChange((v) => {
          this.velocityMaterial.uniforms.uBlurStrength.value = v;
        });
      fFlow.add(s.flow, "blurRadius", 0.0, 5.0, 0.1).name("Blur Radius");
      fFlow
        .add(s.flow, "noiseStrength", 0.0, 0.02, 0.0001)
        .name("Turbulence")
        .onChange((v) => {
          this.velocityMaterial.uniforms.uNoiseStrength.value = v;
        });
      fFlow
        .add(s.flow, "noiseScale", 0.5, 10.0, 0.1)
        .name("Noise Scale")
        .onChange((v) => {
          this.velocityMaterial.uniforms.uNoiseScale.value = v;
        });

      // Chromatic Effects Folder
      const fRgb = gui.addFolder("Chromatic Effects");
      fRgb
        .add(s.rgb, "frequency", 0.0, 30.0, 0.5)
        .name("Color Shift Freq")
        .onChange((v) => {
          this.postQuad.material.uniforms.uRgbFrequency.value = v;
        });
      fRgb
        .add(s.rgb, "strength", 0.0, 3.0, 0.05)
        .name("Color Intensity")
        .onChange((v) => {
          this.postQuad.material.uniforms.uRgbStrength.value = v;
        });
      fRgb
        .add(s.rgb, "mix", 0.0, 1.0, 0.01)
        .name("Blend Factor")
        .onChange((v) => {
          this.postQuad.material.uniforms.uRgbMix.value = v;
        });

      // Material Folder
      const fLiquid = gui.addFolder("Material");
      const liquidColorHelper = { color: "#" + s.liquid.color.getHexString() };
      this.guiLiquidColorController = fLiquid
        .addColor(liquidColorHelper, "color")
        .name("Liquid Tint")
        .onChange((v) => {
          s.liquid.color.set(v);
          this.postQuad.material.uniforms.uLiquidColor.value.copy(
            s.liquid.color,
          );
        });

      // Environment Folder
      const fEnv = gui.addFolder("Environment");
      fEnv
        .add(s.scene, "distortion", 0.0, 0.1, 0.001)
        .name("Refraction")
        .onChange((v) => {
          this.postQuad.material.uniforms.uDistortionStrength.value = v;
        });
      fEnv
        .add(s.aberration, "strength", 0.0, 0.2, 0.001)
        .name("Aberration")
        .onChange((v) => {
          this.postQuad.material.uniforms.uAberrationStrength.value = v;
        });

      gui.close();
      this.gui = gui;
    }
  }

  window.MouseFluidEffect = MouseFluidEffect;
})();

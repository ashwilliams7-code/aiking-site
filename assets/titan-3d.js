/* ============================================================
   TITAN MARK 1 — Cinematic 3D depth (whole-page, film-grade)
   ------------------------------------------------------------
   A FIXED WebGL layer behind the entire page. As you scroll the
   full document, the camera dollies through a deep-black volume:
   the luminous core anchors the hero, a depth-of-field particle
   field with bokeh + twinkle carries light down every section,
   nebula haze drifts, and a second "bookend" core re-summons the
   glow at the final CTA. Slow, eased, cinematic.

   Fails silent + graceful: no WebGL / no three.js / reduced-motion
   => layer hides, existing 2D scene stands alone.
   ============================================================ */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mount = document.querySelector('[data-titan-3d]');
  if (!mount || reduce) return;

  import('three')
    .then((THREE) => boot(THREE))
    .catch(() => mount.setAttribute('data-titan-3d-failed', ''));

  function boot(THREE) {
    const ACCENT = new THREE.Color(0xd1fe17); // lime signature
    const WHITE = new THREE.Color(0xf1f4ea);
    const COOL = new THREE.Color(0x8ec6d6); // cyan-blue keeps shadows cold

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: mount,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.05);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.set(0, 0, 16);

    const world = new THREE.Group();
    scene.add(world);

    /* ---------- reusable soft radial sprite (bloom) ---------- */
    function glowSprite(size, color, opacity, pos) {
      const cvs = document.createElement('canvas');
      cvs.width = cvs.height = 256;
      const g = cvs.getContext('2d');
      const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      const c = color.getStyle();
      grd.addColorStop(0, c);
      grd.addColorStop(0.16, c);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(cvs);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity,
      });
      const s = new THREE.Sprite(mat);
      s.scale.set(size, size, 1);
      s.position.copy(pos);
      return s;
    }

    function wireCore(radius, detail, color, opacity, pos) {
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(radius, detail),
        new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      m.position.copy(pos);
      return m;
    }

    /* ---------- ambient fill glows (lift hero corners edge-to-edge) ---------- */
    const fill = glowSprite(70, COOL, 0.055, new THREE.Vector3(0, 0, -18));
    // four corner glows so the hero frame never falls to flat black
    const cornerGlows = [
      glowSprite(36, COOL, 0.032, new THREE.Vector3(-13, 8, -14)),
      glowSprite(36, COOL, 0.032, new THREE.Vector3(13, 8, -14)),
      glowSprite(40, COOL, 0.04, new THREE.Vector3(-13, -8, -13)),
      glowSprite(40, COOL, 0.04, new THREE.Vector3(13, -8, -13)),
    ];
    world.add(fill, ...cornerGlows);

    /* ---------- HERO CORE (top of page) ---------- */
    const heroPos = new THREE.Vector3(2.6, -0.2, -7);
    const heroBloomA = glowSprite(9.5, COOL, 0.08, heroPos);
    const heroBloomB = glowSprite(5.4, WHITE, 0.11, heroPos);
    const heroBloomC = glowSprite(2.8, ACCENT, 0.62, heroPos);
    const heroCore = wireCore(2.0, 1, ACCENT, 0.18, heroPos);
    const heroCore2 = wireCore(3.1, 0, WHITE, 0.06, heroPos);
    world.add(heroBloomA, heroBloomB, heroBloomC, heroCore, heroCore2);

    /* ---------- BOOKEND CORE (deep, revealed near final CTA) ---------- */
    const endPos = new THREE.Vector3(-1.8, -0.4, -46);
    const endBloomA = glowSprite(10, COOL, 0.06, endPos);
    const endBloomB = glowSprite(4.4, ACCENT, 0.5, endPos);
    const endCore = wireCore(2.6, 1, ACCENT, 0.14, endPos);
    world.add(endBloomA, endBloomB, endCore);

    /* ---------- DEEP DOF PARTICLE FIELD (spans whole scroll) ---------- */
    const COUNT = Math.min(2800, Math.max(1200, Math.floor(innerWidth * 1.6)));
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);
    const accents = new Float32Array(COUNT);
    const DEPTH = 60; // deep enough to travel through on scroll
    for (let i = 0; i < COUNT; i++) {
      // even depth distribution (no clustering) => no thin patches mid-scroll
      const r = Math.random();
      positions[i * 3 + 0] = (Math.random() - 0.5) * 46; // wider => fills hero corners
      positions[i * 3 + 1] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 2] = -r * DEPTH - 1; // uniform spread through depth
      seeds[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.4 + Math.random() * 2.6;
      accents[i] = Math.random() > 0.86 ? 1 : 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aAccent', new THREE.BufferAttribute(accents, 1));

    const fieldMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAccent: { value: ACCENT },
        uWhite: { value: WHITE },
        uDpr: { value: dpr },
        uFocus: { value: 20.0 },
      },
      vertexShader: `
        attribute float aSeed;
        attribute float aSize;
        attribute float aAccent;
        uniform float uTime;
        uniform float uDpr;
        uniform float uFocus;
        varying float vAccent;
        varying float vFade;
        varying float vBlur;
        varying float vTw;
        void main(){
          vAccent = aAccent;
          vec3 p = position;
          p.x += sin(uTime*0.12 + aSeed) * 0.6;
          p.y += cos(uTime*0.10 + aSeed*1.3) * 0.5;
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          float dist = -mv.z;
          vFade = smoothstep(90.0, 3.0, dist);
          vBlur = clamp(abs(dist - uFocus) / 34.0, 0.0, 1.0);
          vTw = 0.55 + 0.45 * sin(uTime*1.6 + aSeed*4.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uDpr * (150.0/dist) * (1.0 + vBlur*2.2);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uAccent;
        uniform vec3 uWhite;
        varying float vAccent;
        varying float vFade;
        varying float vBlur;
        varying float vTw;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float edge = mix(0.5, 0.02, vBlur);
          float alpha = smoothstep(0.5, edge, d);
          alpha *= vFade;
          alpha *= mix(1.0, 0.35, vBlur);
          alpha *= mix(0.75, 1.0, vTw);
          if(alpha < 0.008) discard;
          vec3 col = mix(uWhite, uAccent, vAccent);
          float glow = mix(0.30, 1.0, vAccent);
          gl_FragColor = vec4(col, alpha * glow);
        }
      `,
    });
    const field = new THREE.Points(geo, fieldMat);
    world.add(field);

    /* ---------- NEBULA HAZE (cold, drifting) ---------- */
    function hazeTexture() {
      const cvs = document.createElement('canvas');
      cvs.width = cvs.height = 512;
      const g = cvs.getContext('2d');
      g.fillStyle = '#000';
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * 512,
          y = Math.random() * 512,
          rad = 40 + Math.random() * 150;
        const grd = g.createRadialGradient(x, y, 0, x, y, rad);
        const a = 0.016 + Math.random() * 0.03;
        grd.addColorStop(0, `rgba(90,130,110,${a})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 512, 512);
      }
      const t = new THREE.CanvasTexture(cvs);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }
    const hazeTex = hazeTexture();
    const hazeLayers = [];
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(130, 90),
        new THREE.MeshBasicMaterial({
          map: hazeTex,
          transparent: true,
          opacity: 0.42 - i * 0.08,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      m.position.set(0, 0, -14 - i * 13);
      m.rotation.z = Math.random() * Math.PI;
      world.add(m);
      hazeLayers.push(m);
    }

    /* ---------- god-ray shaft (hero) ---------- */
    const ray = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 60),
      new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    ray.position.set(1.0, 0, -10);
    ray.rotation.z = 0.22;
    world.add(ray);

    /* ---------- interaction: pointer parallax + FULL-PAGE scroll ---------- */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollN = 0; // 0..1 across the WHOLE document

    addEventListener(
      'pointermove',
      (e) => {
        pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
    addEventListener(
      'deviceorientation',
      (e) => {
        if (e.gamma == null) return;
        pointer.tx = Math.max(-1, Math.min(1, e.gamma / 35));
        pointer.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
      },
      { passive: true }
    );

    const maxScroll = () =>
      Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    const onScroll = () => {
      scrollN = Math.max(0, Math.min(1, window.scrollY / maxScroll()));
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    onScroll();

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      onScroll();
    };
    addEventListener('resize', resize, { passive: true });
    resize();

    /* ---------- render loop ---------- */
    const clock = new THREE.Clock();
    let raf = 0,
      running = true;

    // ease helpers for cinematic falloff
    const smooth = (a, b, t) => a + (b - a) * (t * t * (3 - 2 * t));

    const tick = () => {
      const t = clock.getElapsedTime();
      fieldMat.uniforms.uTime.value = t;

      // buttery eased pointer
      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;

      // ---- CAMERA: travel deep through the volume as you scroll ----
      // z goes from 16 (hero) to -30 (near bookend core) across full page
      const dolly = smooth(16, -30, scrollN);
      camera.position.x = pointer.x * 1.9;
      camera.position.y = -pointer.y * 1.3 - scrollN * 2.0;
      camera.position.z = dolly;

      // look target drifts from hero core toward bookend core
      const lookZ = smooth(heroPos.z, endPos.z + 4, scrollN);
      const lookX = smooth(heroPos.x * 0.4, endPos.x * 0.6, scrollN);
      camera.lookAt(lookX, -scrollN * 2.4, lookZ);

      // focal plane follows the dolly so DOF stays believable
      fieldMat.uniforms.uFocus.value = smooth(20, 8, scrollN);

      // ---- living cores ----
      const pulse = 1 + Math.sin(t * 0.9) * 0.06;
      heroBloomC.scale.setScalar(2.8 * pulse);
      heroBloomA.scale.setScalar(8.5 * (1 + Math.sin(t * 0.5) * 0.04));
      heroCore.rotation.set(t * 0.05, t * 0.08, 0);
      heroCore2.rotation.set(-t * 0.04, -t * 0.06, 0);

      // bookend core intensifies as you approach the bottom
      const endGain = Math.max(0, (scrollN - 0.55) / 0.45);
      endBloomB.material.opacity = 0.5 * endGain;
      endBloomA.material.opacity = 0.06 * endGain;
      endCore.material.opacity = 0.14 * endGain;
      endBloomB.scale.setScalar(4.4 * pulse);
      endCore.rotation.set(-t * 0.05, t * 0.07, 0);

      // ambient fill fades as you scroll past hero (sections have their own depth)
      fill.material.opacity = 0.055 * (1 - scrollN * 0.6);
      const cornerFade = Math.max(0, 1 - scrollN * 2.2); // hero-only
      cornerGlows.forEach((c, i) => {
        const base = i < 2 ? 0.032 : 0.044; // lift bottom corners to match top
        c.material.opacity = base * cornerFade * (0.85 + 0.15 * Math.sin(t * 0.6 + i));
      });
      field.rotation.z = t * 0.006;
      hazeLayers.forEach((m, i) => (m.rotation.z += 0.00008 * (i + 1)));
      ray.material.opacity =
        (0.035 + 0.03 * (Math.sin(t * 0.7) * 0.5 + 0.5)) * (1 - scrollN);

      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(tick);
    };
    tick();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        clock.getDelta();
        tick();
      }
    });
  }
})();

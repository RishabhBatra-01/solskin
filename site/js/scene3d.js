/* ============================================================
   SOLSKIN — 3D core
   ------------------------------------------------------------
   Owns the hero bottle and the molten-bronze cinema backdrop,
   and exposes shared factories on window.SOLSKIN3D so the
   scroll sequence (cinema3d.js) builds the SAME bottle rather
   than a near-copy of it.

   Degrades cleanly: no WebGL or prefers-reduced-motion sets
   .no-webgl on <html> and the CSS falls back to stills.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function webglOK() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
               (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  if (typeof THREE === 'undefined' || !webglOK() || reduced) {
    root.classList.add('no-webgl');
    return;
  }
  root.classList.add('has-webgl');

  var PAL = {
    ink: 0x0E0B0A, bronze: 0xC98A4B, bronzeLit: 0xE8B87A,
    label: '#E4C6A2', labelInk: '#5A3520', ivory: 0xF2EBE1
  };

  /* ==========================================================
     SHARED FACTORIES
     ========================================================== */
  var SHARED = window.SOLSKIN3D = { PAL: PAL };

  /* A small studio of emissive softboxes, pre-filtered into an
     environment map. This is what makes the plastic read as a real
     object instead of a shaded shape. */
  SHARED.studioEnv = function (renderer) {
    var env = new THREE.Scene();
    env.background = new THREE.Color(0x0B0908);

    function box(w, h, d, x, y, z, colour, power) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
        new THREE.MeshBasicMaterial({ color: colour }));
      m.material.color.multiplyScalar(power);
      m.position.set(x, y, z);
      env.add(m);
    }
    env.add(new THREE.Mesh(new THREE.BoxGeometry(24, 16, 24),
      new THREE.MeshBasicMaterial({ color: 0x141010, side: THREE.BackSide })));

    box(10, 0.4, 8,  0,  7.4,  0, 0xFFF2E2, 3.4);
    box(0.4, 8, 7,  -8,  2.0, -2, 0xE8B87A, 3.6);
    box(0.4, 6, 5,   8,  1.0,  1, 0xC98A4B, 2.6);
    box(6, 4, 0.4,   0,  1.5, -9, 0xFFE6C4, 2.0);
    box(5, 3, 0.4,   0, -1.0,  9, 0x9FB6CC, 0.9);

    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var tex = pmrem.fromScene(env, 0.04).texture;
    pmrem.dispose();
    env.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    return tex;
  };

  /* The label, drawn in the real Vanguard CF brand face.
     Canvas X wraps the circumference, canvas Y runs up the bottle, so
     the vertical wordmark is rotated -90deg and sized against HEIGHT. */
  SHARED.labelTexture = function (renderer) {
    var W = 2048, H = 1024;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');

    x.fillStyle = PAL.label; x.fillRect(0, 0, W, H);
    var g = x.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, 'rgba(0,0,0,.16)');
    g.addColorStop(0.26, 'rgba(255,255,255,.13)');
    g.addColorStop(0.5, 'rgba(255,255,255,.03)');
    g.addColorStop(0.74, 'rgba(0,0,0,.07)');
    g.addColorStop(1, 'rgba(0,0,0,.18)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);

    x.save();
    x.translate(W * 0.5, H * 0.5);
    x.rotate(-Math.PI / 2);
    x.fillStyle = PAL.labelInk;
    x.textAlign = 'center'; x.textBaseline = 'middle';

    var target = H * 0.72, size = 300;
    x.font = '700 ' + size + 'px "Vanguard CF", "Arial Narrow", Impact, sans-serif';
    var w = x.measureText('SOLSKIN').width;
    if (w > 0) size = Math.min(340, Math.floor(size * target / w));
    x.font = '700 ' + size + 'px "Vanguard CF", "Arial Narrow", Impact, sans-serif';
    x.fillText('SOLSKIN', 0, 0);

    var small = Math.round(size * 0.155);
    x.font = '500 ' + small + 'px "DM Sans", system-ui, sans-serif';
    x.fillText('T A N N I N G   D A R K   M O U S S E', 0, size * 0.62);
    x.font = '400 ' + Math.round(small * 0.9) + 'px "DM Sans", system-ui, sans-serif';
    x.fillText('200ml', 0, size * 0.92);
    x.restore();

    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.wrapS = THREE.RepeatWrapping;
    return t;
  };

  /* The bottle itself. `nozzle` marks where liquid leaves the pump —
     the cinema hangs the droplet off it. */
  SHARED.makeBottle = function (renderer) {
    var group = new THREE.Group();

    var pts = [
      [0.00, 0.00], [0.68, 0.00], [0.76, 0.05], [0.79, 0.14],
      [0.79, 3.05], [0.785, 3.30], [0.74, 3.52], [0.56, 3.76],
      [0.40, 3.94], [0.37, 4.06], [0.37, 4.18]
    ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });

    var bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0xE9D3B4, roughness: 0.48, metalness: 0.0,
      clearcoat: 0.55, clearcoatRoughness: 0.30, envMapIntensity: 0.85
    });
    var body = new THREE.Mesh(new THREE.LatheGeometry(pts, 128), bodyMat);
    body.castShadow = true; body.receiveShadow = true;
    group.add(body);

    var labelMat = new THREE.MeshPhysicalMaterial({
      map: SHARED.labelTexture(renderer), roughness: 0.6, metalness: 0.0,
      clearcoat: 0.42, clearcoatRoughness: 0.34, envMapIntensity: 0.7,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
    });
    var label = new THREE.Mesh(
      new THREE.CylinderGeometry(0.802, 0.802, 2.55, 128, 1, true), labelMat);
    label.position.y = 1.62; label.castShadow = true;
    group.add(label);

    var capMat = new THREE.MeshPhysicalMaterial({
      color: 0xF4EFE7, roughness: 0.26, metalness: 0.0,
      clearcoat: 0.85, clearcoatRoughness: 0.14, envMapIntensity: 1.0
    });
    [[new THREE.CylinderGeometry(0.42, 0.42, 0.18, 72), 0, 4.26, 0],
     [new THREE.CylinderGeometry(0.35, 0.37, 0.58, 72), 0, 4.64, 0],
     [new THREE.CylinderGeometry(0.24, 0.24, 0.22, 56), 0, 5.02, 0]
    ].forEach(function (d) {
      var m = new THREE.Mesh(d[0], capMat);
      m.position.set(d[1], d[2], d[3]); m.castShadow = true; group.add(m);
    });
    var spout = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.17, 0.24), capMat);
    spout.position.set(-0.19, 5.00, 0); spout.castShadow = true; group.add(spout);

    // the wordmark sits at u ~= 0.537 on the label, i.e. the BACK of the
    // bottle. FRONT turns it to face the camera.
    return { group: group, label: label, FRONT: -3.374, nozzle: new THREE.Vector3(-0.34, 4.92, 0) };
  };

  /* ==========================================================
     1. HERO BOTTLE
     ========================================================== */
  function buildBottle(canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    scene.environment = SHARED.studioEnv(renderer);
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    var rig = new THREE.Group();
    var built = SHARED.makeBottle(renderer);
    var group = built.group;
    rig.add(group); scene.add(rig);
    group.position.y = -2.35;

    var floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.55 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.36; floor.receiveShadow = true;
    rig.add(floor);

    var pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.y = -2.35; rig.add(pool);

    scene.add(new THREE.HemisphereLight(0xE8B87A, 0x0E0B0A, 0.28));
    var key = new THREE.DirectionalLight(0xFFF3E2, 1.9);
    key.position.set(4.5, 8, 5.5); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1; key.shadow.camera.far = 26;
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 8; key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0012; key.shadow.radius = 3;
    scene.add(key);
    var rim = new THREE.PointLight(PAL.bronzeLit, 55, 30);
    rim.position.set(-5, 3.4, -4); scene.add(rim);
    var rim2 = new THREE.PointLight(PAL.bronze, 30, 26);
    rim2.position.set(5.5, 1.2, -3); scene.add(rim2);
    var fill = new THREE.PointLight(0xBFD4E8, 8, 24);
    fill.position.set(2, -2.6, 5.5); scene.add(fill);

    var MOTES = 130;
    var mPos = new Float32Array(MOTES * 3), mSeed = new Float32Array(MOTES);
    for (var i = 0; i < MOTES; i++) {
      mPos[i * 3] = (Math.random() - 0.5) * 9;
      mPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      mPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      mSeed[i] = Math.random() * 6.28;
    }
    var moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
    var motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
      color: 0xE8B87A, size: 0.045, transparent: true, opacity: 0.55,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(motes);

    var FRONT = built.FRONT;
    var dragging = false, lastX = 0, freeSpin = 0, vel = 0;
    var px = 0, py = 0, tx = 0, ty = 0;

    canvas.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!dragging) return;
      var dx = e.clientX - lastX; lastX = e.clientX; vel += dx * 0.006;
    });
    canvas.addEventListener('pointerleave', function () { dragging = false; tx = 0; ty = 0; });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      canvas.addEventListener(ev, function () { dragging = false; });
    });

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
      }
    }

    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; },
        { threshold: 0.01 }).observe(canvas);
    }

    var t0 = null, INTRO = 2100;
    function easeOutExpo(k) { return k >= 1 ? 1 : 1 - Math.pow(2, -10 * k); }

    return {
      frame: function (t) {
        if (!visible) return;
        resize();
        if (t0 === null) { t0 = t; document.body.classList.add('hero-in'); }
        var e = easeOutExpo(Math.min((t - t0) / INTRO, 1));

        camera.position.set(0, 1.55 + (1 - e) * 1.4, 18.5 - e * 6.6);

        vel *= 0.94; freeSpin += vel;
        var sweep = Math.sin(t * 0.00023) * 0.36;
        var scrollSpin = (window.scrollY || 0) * 0.0009;
        group.rotation.y = FRONT + sweep + freeSpin + scrollSpin + (1 - e) * 2.6;
        group.rotation.z = Math.sin(t * 0.0004) * 0.04;
        group.position.y = -2.35 + Math.sin(t * 0.0011) * 0.09;

        px += (tx - px) * 0.06; py += (ty - py) * 0.06;
        rig.rotation.y = px * 0.13; rig.rotation.x = -py * 0.09;
        camera.position.x += px * 0.55;
        camera.position.y += -py * 0.35;
        camera.lookAt(0, -0.25, 0);

        rim.intensity = (44 + Math.sin(t * 0.0016) * 12) * e;
        key.intensity = 1.9 * e;

        var arr = moteGeo.attributes.position.array;
        for (var i = 0; i < MOTES; i++) {
          arr[i * 3 + 1] += 0.0016 + (i % 5) * 0.00035;
          arr[i * 3] += Math.sin(t * 0.0003 + mSeed[i]) * 0.0016;
          if (arr[i * 3 + 1] > 4.2) arr[i * 3 + 1] = -4.2;
        }
        moteGeo.attributes.position.needsUpdate = true;
        motes.material.opacity = 0.55 * e;

        renderer.render(scene, camera);
      }
    };
  }

  /* ==========================================================
     2. CINEMA BACKDROP — molten bronze
     ========================================================== */
  SHARED.moltenFrag = [
    'precision highp float;',
    'uniform vec2  uRes;',
    'uniform float uTime;',
    'uniform float uProg;',
    '',
    'vec2 hash(vec2 p){',
    '  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));',
    '  return -1.0 + 2.0*fract(sin(p)*43758.5453123);',
    '}',
    'float noise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f*f*(3.0-2.0*f);',
    '  return mix(mix(dot(hash(i+vec2(0.0,0.0)), f-vec2(0.0,0.0)),',
    '                 dot(hash(i+vec2(1.0,0.0)), f-vec2(1.0,0.0)), u.x),',
    '             mix(dot(hash(i+vec2(0.0,1.0)), f-vec2(0.0,1.0)),',
    '                 dot(hash(i+vec2(1.0,1.0)), f-vec2(1.0,1.0)), u.x), u.y);',
    '}',
    'float fbm(vec2 p){',
    '  float v = 0.0, a = 0.5;',
    '  for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }',
    '  return v;',
    '}',
    '',
    'void main(){',
    '  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);',
    '  float t = uTime * 0.045;',
    '',
    '  // domain warp — the flow that makes it read as molten metal',
    '  vec2 q = vec2(fbm(uv*1.6 + vec2(0.0, t)), fbm(uv*1.6 + vec2(5.2, 1.3 - t)));',
    '  vec2 r = vec2(fbm(uv*1.9 + 3.0*q + vec2(1.7, 9.2) + 0.35*t),',
    '                fbm(uv*1.9 + 3.0*q + vec2(8.3, 2.8) - 0.28*t));',
    '  float f = fbm(uv*1.5 + 2.4*r);',
    '',
    '  float band = smoothstep(-0.05, 0.78, f + 0.30*length(r));',
    '  band = pow(band, 1.12);',
    '',
    '  vec3 ink    = vec3(0.055, 0.043, 0.039);',
    '  vec3 deep   = vec3(0.322, 0.196, 0.106);',
    '  vec3 bronze = vec3(0.788, 0.541, 0.294);',
    '  vec3 lit    = vec3(0.980, 0.851, 0.678);',
    '',
    '  vec3 col = mix(ink, deep, smoothstep(0.02, 0.46, band));',
    '  col = mix(col, bronze, smoothstep(0.40, 0.80, band));',
    '  col = mix(col, lit,    smoothstep(0.74, 1.00, band) * 0.85);',
    '',
    '  // heat rises with scroll progress through the flight',
    '  col += bronze * uProg * 0.16 * smoothstep(0.25, 1.0, band);',
    '',
    '  // The media card covers the centre, so the flow is mostly read at the',
    '  // edges — keep those alive and only gently settle the middle.',
    '  float d = length(uv);',
    '  col *= 0.78 + 0.44*smoothstep(1.80, 0.40, d);',
    '  col *= 1.70;',
    '  col = clamp(col, 0.0, 1.0);',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function buildFX(canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var uniforms = {
      uRes:  { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uProg: { value: 0 }
    };
    scene.add(new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: 'void main(){ gl_Position = vec4(position,1.0); }',
        fragmentShader: SHARED.moltenFrag
      })
    ));

    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; },
        { threshold: 0.01 }).observe(canvas);
    }

    return {
      setProgress: function (p) { uniforms.uProg.value = p; },
      frame: function (t) {
        if (!visible) return;
        var w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        if (canvas.width !== w || canvas.height !== h) renderer.setSize(w, h, false);
        uniforms.uRes.value.set(canvas.width, canvas.height);
        uniforms.uTime.value = t * 0.001;
        renderer.render(scene, camera);
      }
    };
  }

  /* ==========================================================
     3. One shared loop
     ========================================================== */
  var parts = [];

  function start() {
    var heroCanvas  = document.getElementById('heroCanvas');
    var fxCanvas    = document.getElementById('cinemaFX');
    var cineCanvas  = document.getElementById('cinemaStage3D');

    if (heroCanvas) {
      try { parts.push(buildBottle(heroCanvas)); }
      catch (e) {
        console.error('[solskin] hero 3D failed:', e);
        root.classList.remove('has-webgl'); root.classList.add('no-webgl');
      }
    }
    if (fxCanvas) {
      try { var fx = buildFX(fxCanvas); parts.push(fx); window.__solskinFX = fx; }
      catch (e) { console.warn('[solskin] backdrop failed (decorative):', e); }
    }
    // the scroll sequence lives in cinema3d.js and registers itself on SOLSKIN3D
    if (cineCanvas) {
      if (SHARED.buildCinema) {
        try {
          var cine = SHARED.buildCinema(cineCanvas);
          parts.push(cine); window.__solskinCinema = cine;
        } catch (e) {
          console.error('[solskin] scroll sequence failed:', e);
          document.body.classList.add('cinema-2d');
        }
      } else {
        console.warn('[solskin] cinema3d.js did not register — falling back to stills');
        document.body.classList.add('cinema-2d');
      }
    }
    requestAnimationFrame(loop);
  }

  function loop(t) {
    for (var i = 0; i < parts.length; i++) parts[i].frame(t);
    requestAnimationFrame(loop);
  }

  /* Two things must be true before we build:
       1. the brand face is loaded — the bottle label is drawn to a canvas,
          so building early bakes in a fallback typeface;
       2. every other script tag has executed — cinema3d.js registers
          SHARED.buildCinema, and when the fonts are already cached the
          promise below resolves as a MICROTASK, which drains between
          <script> tags. Without the yield, start() would run before
          cinema3d.js existed and the sequence would silently fall back. */
  function whenReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(cb, 0); });
    } else {
      setTimeout(cb, 0);
    }
  }

  if (document.fonts && document.fonts.load) {
    Promise.race([
      Promise.all([
        document.fonts.load('700 300px "Vanguard CF"'),
        document.fonts.load('500 62px "DM Sans"')
      ]),
      new Promise(function (r) { setTimeout(r, 2500); })
    ]).then(function () { whenReady(start); }, function () { whenReady(start); });
  } else {
    whenReady(start);
  }
})();

/* ============================================================
   SOLSKIN — the scroll sequence
   ------------------------------------------------------------
   BOTTLE -> DROP -> SKIN -> PROOF, as one unbroken 3D take.
   Scroll is the timeline; there are no cuts.

     A  0.00-0.18   the bottle, tilting as the pump presses
     B  0.13-0.33   a drop gathers at the nozzle, stretches, necks
     C  0.30-0.55   it detaches and falls; camera follows it down
     D  0.52-0.68   impact - the drop flattens, ripples spread
     E  0.62-0.86   camera pulls back: it landed on skin. Glow blooms.
     F  0.82-1.00   resolves into the real, unretouched photograph

   Every value is derived from the scroll position, never accumulated
   frame to frame, so the whole thing is seek-safe: scrub up and it
   runs exactly backwards, land mid-fall and it draws the right frame.

   Note on the liquid: real fluid sim (metaballs / marching cubes) is
   far too expensive for a scroll backdrop on a phone. This is a
   deformed sphere with a stretched neck plus expanding ring geometry
   - the same cheat product films use, and it reads as liquid at this
   scale.
   ============================================================ */

(function () {
  'use strict';
  if (!window.SOLSKIN3D) return;

  var SHARED = window.SOLSKIN3D;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function span(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* radial sprite used for the glow bloom and the contact pool */
  function radialTexture(inner, outer) {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, inner);
    g.addColorStop(0.55, outer);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  SHARED.buildCinema = function (canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;

    renderer.autoClear = false;   // we draw the backdrop, then the scene over it

    var scene = new THREE.Scene();
    scene.environment = SHARED.studioEnv(renderer);
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

    /* ---------- molten bronze backdrop ----------
       Drawn as a fullscreen quad in THIS renderer rather than a second
       stacked canvas: one WebGL context for the whole section instead
       of two, which is both cheaper and avoids compositing two
       overlapping GL surfaces. */
    var bgScene = new THREE.Scene();
    var bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var bgU = {
      uRes:  { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uProg: { value: 0 }
    };
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: bgU,
        vertexShader: 'void main(){ gl_Position = vec4(position,1.0); }',
        fragmentShader: SHARED.moltenFrag,
        depthTest: false, depthWrite: false
      })));

    /* ---------- the surface it lands on ----------
       A forearm, deliberately. An earlier cut landed the drop on a torso
       crop with the bloom centred on the chest, which read as something
       this brand should never be selling. A limb is where you actually
       apply and patch-test tan, it is neutral, and it keeps the whole
       sequence about skin rather than about a body. */
    var skinTex = new THREE.TextureLoader().load('img/skin-forearm.jpg');
    skinTex.colorSpace = THREE.SRGBColorSpace;

    var skinMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        map:    { value: skinTex },
        uCov:   { value: 0.0 },   // how far the tan has been worked outward
        uWet:   { value: 0.0 },   // wet product at the frontier
        uStroke:{ value: 0.5 },   // where the hand is, along the surface
        uRub:   { value: 0.0 },   // how much rubbing is happening, 0..1
        uAsp:   { value: 1.558 }  // texture aspect, keeps the spread round
      },
      vertexShader:
        'varying vec2 vUv;' +
        'void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: [
        'uniform sampler2D map;',
        'uniform float uCov; uniform float uWet; uniform float uStroke;',
        'uniform float uRub; uniform float uAsp;',
        'varying vec2 vUv;',
        '',
        'void main(){',
        '  vec3 tex = texture2D(map, vUv).rgb;',
        '',
        '  vec2 d = (vUv - vec2(0.5)) * vec2(uAsp, 1.0);',
        '  // stroke marks: the frontier is worked, not a clean circle',
        '  float wobble = sin(vUv.x * 42.0 + uStroke * 14.0) * 0.014 * uRub;',
        '  float r = length(d) + wobble;',
        '  float cov = smoothstep(uCov, uCov - 0.10, r);',
        '',
        '  // untanned skin reads pale, not grey',
        '  vec3 bare = mix(tex, vec3(0.88, 0.75, 0.68), 0.50);',
        '  vec3 tan_ = mix(tex, vec3(0.72, 0.47, 0.30), 0.16);',
        '  vec3 col = mix(bare, tan_, cov);',
        '',
        '  // wet product sitting at the frontier before it sinks in',
        '  float front = smoothstep(uCov - 0.12, uCov, r) * smoothstep(uCov + 0.09, uCov, r);',
        '  col = mix(col, vec3(0.58, 0.36, 0.18), front * uWet * 0.5);',
        '',
        '  // the hand: a soft band travelling back and forth as she works it in',
        '  float hand = smoothstep(0.13, 0.0, abs(vUv.x - uStroke)) * uRub;',
        '  col += vec3(0.26, 0.17, 0.09) * hand * 0.30;',
        '  col *= 1.0 - hand * 0.10;',
        '',
        '  // dissolve the edges, or the plane reads as a floating rectangle',
        '  float edge = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x)',
        '             * smoothstep(0.0, 0.20, vUv.y) * smoothstep(1.0, 0.80, vUv.y);',
        '  gl_FragColor = vec4(col, edge);',
        '}'
      ].join('\n')
    });

    var skin = new THREE.Mesh(new THREE.PlaneGeometry(30, 19.3, 1, 1), skinMat);
    skin.rotation.x = -Math.PI / 2;
    skin.position.y = 0;
    scene.add(skin);

    /* ---------- the bottle ---------- */
    var built = SHARED.makeBottle(renderer);
    var bottle = built.group;
    bottle.position.set(0, 1.55, 0);
    bottle.rotation.y = built.FRONT;
    scene.add(bottle);

    /* ---------- the drop ---------- */
    var dropMat = new THREE.MeshPhysicalMaterial({
      color: 0xC98A4B, roughness: 0.12, metalness: 0.0,
      clearcoat: 1.0, clearcoatRoughness: 0.06,
      envMapIntensity: 1.9, emissive: 0x2A1608, emissiveIntensity: 0.55
    });
    var drop = new THREE.Mesh(new THREE.SphereGeometry(0.27, 40, 32), dropMat);
    scene.add(drop);

    // the thread of liquid still attached to the nozzle while it necks off
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.11, 1, 20, 1, true), dropMat);
    scene.add(neck);

    var NOZZLE = new THREE.Vector3(-0.19, 1.55 + 4.92, 0);
    var LAND_Y = 0.10;

    /* ---------- impact ripples ---------- */
    var rings = [];
    for (var i = 0; i < 3; i++) {
      var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.72, 96),
        new THREE.MeshBasicMaterial({
          color: 0xE8B87A, transparent: true, opacity: 0,
          side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      scene.add(ring); rings.push(ring);
    }

    /* ---------- the pool the drop becomes ---------- */
    var pool = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0xC98A4B, roughness: 0.16, metalness: 0.0,
        clearcoat: 1.0, clearcoatRoughness: 0.08,
        envMapIntensity: 1.6, transparent: true, opacity: 0
      })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = 0.012;
    scene.add(pool);

    /* ---------- glow bloom sprite ---------- */
    var bloom = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: radialTexture('rgba(255,228,180,.95)', 'rgba(201,138,75,.35)'),
        transparent: true, opacity: 0, depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    bloom.rotation.x = -Math.PI / 2;
    bloom.position.y = 0.05;
    scene.add(bloom);

    /* ---------- light ---------- */
    scene.add(new THREE.HemisphereLight(0xE8B87A, 0x0E0B0A, 0.34));
    var key = new THREE.DirectionalLight(0xFFF3E2, 1.5);
    key.position.set(3.5, 9, 5); scene.add(key);
    var rimL = new THREE.PointLight(0xE8B87A, 40, 26);
    rimL.position.set(-4.5, 4, -3); scene.add(rimL);
    var contact = new THREE.PointLight(0xFFD9A0, 0, 12);
    contact.position.set(0, 0.6, 0); scene.add(contact);

    /* ---------- captions + the final photograph ---------- */
    var caps = {
      bottle: document.querySelector('[data-cap="bottle"]'),
      skin:   document.querySelector('[data-cap="skin"]'),
      glow:   document.querySelector('[data-cap="glow"]')
    };
    var finalShot = document.querySelector('.cinema__final');

    /* ---------- optional: real footage of the rub, scrubbed by scroll ----------
       This is the Scroll World technique proper — scroll position drives
       video.currentTime rather than the clip playing itself. Wire it by
       putting  data-src="video/rub.mp4"  on #cinemaVideo. With no clip the
       shader rub above plays instead, so the page is complete either way.

       The clip MUST be encoded with a keyframe on every frame (-g 1), or
       seeking lands on the nearest keyframe and the scrub stutters badly. */
    var vid = document.getElementById('cinemaVideo');
    var vidReady = false, vidLast = -1;
    var VID_IN = 0.56, VID_OUT = 0.90;

    if (vid && vid.dataset && vid.dataset.src) {
      vid.src = vid.dataset.src;
      ['loadedmetadata', 'loadeddata', 'canplay'].forEach(function (ev) {
        vid.addEventListener(ev, function () {
          if (vidReady || !vid.duration || !isFinite(vid.duration)) return;
          vidReady = true;
          document.body.classList.add('cinema-video-on');
        });
      });
      vid.load();
      vid.addEventListener('error', function () {
        console.warn('[solskin] rub footage failed to load — using the 3D rub');
      });
      // prime the decoder so the first seek is not a cold start
      var prime = vid.play();
      if (prime && prime.then) prime.then(function () { vid.pause(); }, function () {});
    }

    function setCap(el, v) {
      if (!el) return;
      el.style.opacity = v.toFixed(3);
      el.style.visibility = v > 0.02 ? 'visible' : 'hidden';
    }

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

    var P = 0;
    var look = new THREE.Vector3();

    return {
      setProgress: function (p) { P = clamp(p, 0, 1); },
      frame: function (t) {
        if (!visible) return;
        resize();
        var p = P;

        /* ---- A: the bottle, pump pressing ---- */
        var a = span(p, 0.00, 0.18);
        bottle.rotation.z = lerp(0, 0.16, ease(a));
        bottle.rotation.y = built.FRONT + Math.sin(t * 0.0002) * 0.10 + p * 0.5;
        bottle.position.y = lerp(1.55, 1.42, ease(a));
        // the bottle lifts out of frame once the drop is away
        var exit = span(p, 0.34, 0.56);
        bottle.position.y += easeOut(exit) * 7.5;
        bottle.visible = exit < 0.99;

        /* ---- B: a drop gathers and necks off ---- */
        var b = span(p, 0.13, 0.33);
        var c = span(p, 0.30, 0.55);

        // While it is still attached the drop hangs off the live nozzle.
        // Once it lets go it must fall from where it DETACHED — tying it to
        // the nozzle after that drags it upward with the exiting bottle.
        var nozzleY = bottle.position.y + 4.92;
        var DETACH_Y = 1.42 + 4.92 - 0.46;      // nozzle height at p = 0.30
        var dropY, dropScale, stretch;

        if (c <= 0) {
          // still hanging: swells, then stretches downward
          dropY = nozzleY - 0.16 - ease(b) * 0.30;
          dropScale = lerp(0.12, 1.0, ease(b));
          stretch = 1 + ease(b) * 0.85;
        } else {
          // falling: gravity, with the classic teardrop stretch
          var fall = c * c;                       // accelerating
          dropY = lerp(DETACH_Y, LAND_Y, fall);
          dropScale = 1.0;
          stretch = 1 + Math.sin(c * Math.PI) * 1.15;
        }

        var impact = span(p, 0.52, 0.62);
        if (impact > 0) {
          // squash on contact, then the drop hands over to the pool
          dropScale = lerp(1.0, 1.55, ease(impact));
          stretch = lerp(stretch, 0.16, ease(impact));
          dropY = lerp(dropY, LAND_Y * 0.35, ease(impact));
        }

        drop.position.set(NOZZLE.x, dropY, 0);
        drop.scale.set(dropScale * (2 - stretch * 0.55), dropScale * stretch, dropScale * (2 - stretch * 0.55));
        drop.visible = p > 0.10 && span(p, 0.60, 0.66) < 0.98;

        // the thread back to the nozzle, only while it is still attached
        var necking = b > 0.35 && c < 0.22;
        neck.visible = necking;
        if (necking) {
          var top = nozzleY - 0.05, bot = dropY + 0.1 * dropScale;
          var len = Math.max(0.01, top - bot);
          neck.position.set(NOZZLE.x, (top + bot) / 2, 0);
          neck.scale.set(lerp(1, 0.18, c / 0.22), len, lerp(1, 0.18, c / 0.22));
        }

        /* ---- D: ripples ---- */
        var d = span(p, 0.52, 0.70);
        rings.forEach(function (ring, i) {
          var delay = i * 0.13;
          var k = clamp((d - delay) / (1 - delay), 0, 1);
          var s = lerp(0.25, 5.6 + i * 1.5, easeOut(k));
          ring.scale.set(s, s, s);
          ring.material.opacity = k > 0 ? (1 - k) * 0.45 * (1 - span(p, 0.64, 0.72)) : 0;
        });

        /* ---- the pool the drop becomes ---- */
        var poolK = span(p, 0.58, 0.80);
        var ps = lerp(0.18, 2.4, easeOut(poolK));
        pool.scale.set(ps, ps, ps);
        pool.material.opacity = poolK > 0 ? lerp(0, 0.8, span(p, 0.58, 0.64)) * (1 - span(p, 0.68, 0.80)) : 0;

        /* ---- E: the glow blooms across the skin ---- */
        /* ---- E: she rubs it in ----
           The coverage front advances while a hand-band travels back and
           forth over it. Both derive from p, so scrubbing back un-rubs it. */
        var rub = span(p, 0.56, 0.90);
        var tri = Math.abs(((rub * 3.0) % 2) - 1);        // 0..1..0, three passes
        skinMat.uniforms.uStroke.value = lerp(0.30, 0.70, tri);
        skinMat.uniforms.uRub.value = Math.sin(clamp(rub, 0, 1) * Math.PI);
        skinMat.uniforms.uCov.value = lerp(0.0, 0.72, easeOut(rub));
        skinMat.uniforms.uWet.value = Math.sin(clamp(span(p, 0.52, 0.88), 0, 1) * Math.PI);

        var e = span(p, 0.60, 0.90);

        var bs = lerp(1.2, 8.5, easeOut(e));
        bloom.scale.set(bs, bs, 1);
        bloom.material.opacity = Math.sin(clamp(e, 0, 1) * Math.PI) * 0.26;
        contact.intensity = Math.sin(clamp(span(p, 0.52, 0.80), 0, 1) * Math.PI) * 26;

        /* ---- camera: one continuous move ---- */
        var camY, camZ, camX, lookY;
        if (p < 0.30) {
          // the whole bottle in shot, easing in toward the nozzle
          var k1 = span(p, 0.0, 0.30);
          camY = lerp(4.6, 5.4, k1); camZ = lerp(15.0, 10.5, k1);
          camX = 0; lookY = lerp(3.5, 5.0, k1);
        } else if (p < 0.55) {
          // literally ride the drop: the camera tracks its height, so it
          // cannot fall out of frame however the timings are retuned
          var k2 = span(p, 0.30, 0.55);
          camZ = lerp(10.5, 6.4, ease(k2));
          camY = dropY + lerp(1.6, 1.35, ease(k2));
          camX = 0; lookY = dropY;
        } else {
          // pull back and rise to reveal what it landed on
          var k3 = span(p, 0.55, 0.92);
          camY = lerp(1.85, 12.5, easeOut(k3)); camZ = lerp(6.4, 17.5, easeOut(k3));
          camX = lerp(0, 0.5, ease(k3)); lookY = lerp(0.5, 0.0, ease(k3));
        }
        camera.position.set(camX, camY, camZ);
        look.set(0, lookY, 0);
        camera.lookAt(look);

        /* ---- captions ---- */
        setCap(caps.bottle, Math.sin(clamp(span(p, 0.02, 0.28), 0, 1) * Math.PI) * 1.25);
        setCap(caps.skin,   Math.sin(clamp(span(p, 0.32, 0.60), 0, 1) * Math.PI) * 1.25);
        setCap(caps.glow,   Math.sin(clamp(span(p, 0.64, 0.94), 0, 1) * Math.PI) * 1.25);

        /* ---- real footage, if a clip is wired ---- */
        if (vidReady) {
          var vw = span(p, VID_IN, VID_OUT);
          // seek only on a meaningful change; seeking every frame thrashes
          var want = vid.duration * vw;
          // Do NOT gate this on readyState >= 2: with preload the element
          // often sits at HAVE_METADATA until something asks for a frame, so
          // gating means it never seeks and never loads. The seek itself is
          // what pulls the data in; browsers queue it safely.
          if (Math.abs(want - vidLast) > 0.016) {
            try { vid.currentTime = want; vidLast = want; } catch (e) {}
          }
          var vin  = span(p, VID_IN, VID_IN + 0.05);
          var vout = span(p, VID_OUT - 0.04, VID_OUT);
          vid.style.opacity = (vin * (1 - vout)).toFixed(3);
        }

        /* ---- F: hand off to the real photograph ---- */
        // stagger the handover: the 3D dims first, then the photograph
        // rises. Overlapping them equally just makes mud.
        var fade = span(p, 0.82, 0.93);
        var f = span(p, 0.88, 1.0);
        if (finalShot) {
          finalShot.style.opacity = f.toFixed(3);
          finalShot.style.visibility = f > 0.01 ? 'visible' : 'hidden';
          finalShot.style.transform = 'translate(-50%,-50%) scale(' + lerp(1.08, 1, easeOut(f)).toFixed(4) + ')';
        }
        // hand over cleanly: without this the 3D and the photograph
        // double-expose over each other
        var behind = vidReady ? span(p, VID_IN, VID_IN + 0.05) * (1 - span(p, VID_OUT - 0.04, VID_OUT)) * 0.88 : 0;
        canvas.style.opacity = ((1 - fade * 0.94) * (1 - behind)).toFixed(3);

        bgU.uRes.value.set(canvas.width, canvas.height);
        bgU.uTime.value = t * 0.001;
        bgU.uProg.value = p;

        renderer.clear();
        renderer.render(bgScene, bgCam);
        renderer.clearDepth();
        renderer.render(scene, camera);
      }
    };
  };
})();

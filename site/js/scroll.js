/* ============================================================
   SOLSKIN — scroll engine
   ------------------------------------------------------------
   Measures the pinned cinema rail and hands one normalised
   progress value (0..1) to whoever is drawing:

     window.__solskinCinema  the bottle -> drop -> skin sequence (cinema3d.js)
     window.__solskinFX      the molten-bronze backdrop (scene3d.js)

   Keeping the measurement here and the drawing there means the
   sequence stays seek-safe — everything is derived from scroll
   position, nothing accumulates frame to frame.

   Also handles reveal-on-enter and the announcement rotator.
   Degrades: no JS or reduced motion and the cinema falls back to a
   plain stack of stills (see .no-js / .reduced in the CSS).
   ============================================================ */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  // The 3D adds .hero-in when its first frame lands. If WebGL never starts,
  // reveal the hero copy anyway — it must never stay invisible.
  setTimeout(function () { document.body.classList.add('hero-in'); }, 1200);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.documentElement.classList.add('reduced');

  /* ---------------------------------------------------------
     2. Utilities
     --------------------------------------------------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  // ease so the flight accelerates out of a scene and settles into the next
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* ---------------------------------------------------------
     3. The pinned cinema
     --------------------------------------------------------- */
  var rail = document.querySelector('.cinema__rail');
  var bar = document.querySelector('.cinema__prog i');

  if (rail && !reduced) {
    var ticking = false;

    function render() {
      ticking = false;
      var travel = rail.offsetHeight - window.innerHeight;
      if (travel <= 0) return;

      // 0 when the rail top meets the viewport top, 1 when fully scrolled
      var p = clamp(-rail.getBoundingClientRect().top / travel, 0, 1);

      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
      if (window.__solskinFX) window.__solskinFX.setProgress(p);
      if (window.__solskinCinema) window.__solskinCinema.setProgress(p);
    }

    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(render); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();
  }

  /* ---------------------------------------------------------
     4. Reveal-on-enter for the rest of the page
     --------------------------------------------------------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    var targets = document.querySelectorAll('.rv, .reveal-after');
    targets.forEach(function (el) {
      // anything already in view on load reveals immediately
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      else io.observe(el);
    });
    // failsafe: content must never be permanently invisible
    window.setTimeout(function () {
      targets.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.2) el.classList.add('in');
      });
    }, 2500);
  } else {
    document.querySelectorAll('.rv, .reveal-after').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------------------------------------------------
     5. Announcement rotator — the positioning line leads
     --------------------------------------------------------- */
  var msgs = document.querySelectorAll('.announce [data-msg]');
  if (msgs.length > 1 && !reduced) {
    var i = 0;
    setInterval(function () {
      msgs[i].style.display = 'none';
      i = (i + 1) % msgs.length;
      msgs[i].style.display = '';
    }, 4200);
  }
})();

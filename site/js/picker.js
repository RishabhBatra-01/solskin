/* ============================================================
   SOLSKIN — product picker
   ------------------------------------------------------------
   Three questions -> one product, one shade, one price.

   Notes on the "well-optimised" part:
   - No library. ~4KB of JS, no layout shift, no network after load.
   - Answers live in the URL hash, so Back works, a result is
     shareable, and a refresh doesn't wipe the session.
   - Every control is a real <button> with aria-pressed, so it is
     keyboard and screen-reader operable without extra handling.
   - The recommendation is a scored match over the real catalogue,
     not a lookup table, so adding a product doesn't mean rewriting
     the logic.
   ============================================================ */

(function () {
  'use strict';

  var answers = { tone: null, depth: null, speed: null };
  var chosen  = { variant: null, buy: 'one' };

  var steps = [].slice.call(document.querySelectorAll('.step'));
  var bar   = document.getElementById('bar');
  var live  = document.getElementById('live');

  /* ---------- Q1 options are built from the shade table ---------- */
  var q1 = document.getElementById('q1opts');
  Object.keys(SHADES).forEach(function (k) {
    var s = SHADES[k];
    var b = document.createElement('button');
    b.className = 'opt';
    b.type = 'button';
    b.dataset.q = 'tone'; b.dataset.v = s.id;
    b.innerHTML = '<span class="opt__tone" style="background:' + s.hex + '"></span>' +
                  '<span class="opt__hit">' + s.label + '</span>';
    q1.appendChild(b);
  });

  /* ---------- navigation ---------- */
  function show(i) {
    steps.forEach(function (s, n) {
      if (n === i) s.setAttribute('data-active', ''); else s.removeAttribute('data-active');
    });
    bar.style.width = (i / 3 * 100) + '%';
    bar.parentNode.setAttribute('aria-valuenow', String(i));
    var h = steps[i].querySelector('h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function stepFor() {
    if (!answers.tone) return 0;
    if (!answers.depth) return 1;
    if (!answers.speed) return 2;
    return 3;
  }

  function syncHash() {
    var parts = [];
    ['tone', 'depth', 'speed'].forEach(function (k) { if (answers[k]) parts.push(k + '=' + answers[k]); });
    var h = parts.join('&');
    if (h && ('#' + h) !== location.hash) history.pushState(null, '', '#' + h);
    if (!h && location.hash) history.pushState(null, '', location.pathname);
  }

  function readHash() {
    var h = location.hash.replace(/^#/, '');
    answers = { tone: null, depth: null, speed: null };
    h.split('&').forEach(function (kv) {
      var p = kv.split('=');
      if (p.length === 2 && answers.hasOwnProperty(p[0])) answers[p[0]] = p[1];
    });
  }

  /* ---------- the recommendation ----------
     Scored against the real catalogue rather than a lookup table.  */
  function recommend() {
    var best = null, bestScore = -1;

    PRODUCTS.forEach(function (p) {
      var score = 0;

      // speed is what actually decides it
      if (p.speed === answers.speed) score += 5;
      else if (answers.speed === 'tonight' && p.speed !== 'tonight') score -= 4;

      if (p.depth.indexOf(answers.depth) !== -1) score += 3;

      // deep bronze on a fair base is a lot in one go
      if (answers.depth === 'deep' && answers.tone === 'fair' && p.id === 'gradual') score += 2;
      // drops are the control option
      if (answers.depth === 'subtle' && p.id === 'drops') score += 1;

      if (score > bestScore) { bestScore = score; best = p; }
    });

    // shade: match the variant closest to where they want to end up
    var order = ['fair', 'light', 'medium', 'olive', 'deep'];
    var target = answers.depth === 'deep' ? 'deep'
               : answers.depth === 'subtle' ? 'light' : 'medium';
    var v = best.variants.reduce(function (a, b) {
      var da = Math.abs(order.indexOf(a.shade) - order.indexOf(target));
      var db = Math.abs(order.indexOf(b.shade) - order.indexOf(target));
      return db < da ? b : a;
    });
    return { product: best, variant: v };
  }

  function why(p) {
    if (answers.speed === 'tonight') return 'You need it tonight, so this is the one that works instantly and washes off.';
    if (p.id === 'gradual') return 'You want to stay in control, so this builds a little at a time — stop whenever it looks right.';
    if (p.id === 'drops') return 'You want to set the depth yourself, so this mixes into the moisturiser you already use.';
    return 'You want a proper tan by tomorrow, so this develops overnight in one application.';
  }

  /* ---------- render the result ---------- */
  function renderResult() {
    var r = recommend();
    var p = r.product;
    if (!chosen.variant || p.variants.indexOf(chosen.variant) === -1) chosen.variant = r.variant;

    document.getElementById('rimg').src = p.img;
    document.getElementById('rimg').alt = 'SOLSKIN ' + p.name;
    document.getElementById('rname').textContent = p.name;
    document.getElementById('rsize').textContent = p.size + ' · develops ' + p.develops;
    document.getElementById('rwhy').textContent = why(p);

    // shades
    var sw = document.getElementById('rshades');
    document.getElementById('shadeWrap').style.display = p.variants.length > 1 ? '' : 'none';
    sw.innerHTML = '';
    p.variants.forEach(function (v) {
      var b = document.createElement('button');
      b.className = 'swatch'; b.type = 'button';
      b.setAttribute('aria-pressed', String(v === chosen.variant));
      b.innerHTML = '<i style="background:' + SHADES[v.shade].hex + '"></i>' + v.label;
      b.onclick = function () { chosen.variant = v; renderResult(); };
      sw.appendChild(b);
    });

    // buy options — one-off, subscribe, and the one honest bundle
    var bundle = BUNDLES.filter(function (b) { return b.base === p.id; })[0];
    var buys = [
      { id: 'one',  title: 'One bottle',   sub: 'No commitment', price: p.price },
      { id: 'sub',  title: 'Subscribe',    sub: 'Skip or cancel any time', price: p.sub, tag: 'Save 10%' }
    ];
    if (bundle) {
      buys.push({
        id: 'bundle', title: bundle.name,
        sub: 'Everything you need to apply it well',
        price: bundle.price, was: partsTotal(bundle),
        tag: 'Save ' + money(partsTotal(bundle) - bundle.price)
      });
    }

    var wrap = document.getElementById('rbuys');
    wrap.innerHTML = '';
    buys.forEach(function (b) {
      var el = document.createElement('button');
      el.className = 'buy'; el.type = 'button';
      el.setAttribute('aria-pressed', String(b.id === chosen.buy));
      el.innerHTML = '<span>' + (b.tag ? '<span class="tag">' + b.tag + '</span>' : '') +
                     b.title + '<small>' + b.sub + '</small></span><b>' + money(b.price) + '</b>';
      el.onclick = function () { chosen.buy = b.id; renderResult(); };
      wrap.appendChild(el);
    });

    var picked = buys.filter(function (b) { return b.id === chosen.buy; })[0] || buys[0];
    document.getElementById('rtotal').innerHTML =
      money(picked.price) + (picked.was ? ' <s>' + money(picked.was) + '</s>' : '');

    live.textContent = 'Matched: ' + p.name + ', ' + chosen.variant.label + ', ' + money(picked.price);
  }

  /* ---------- wiring ---------- */
  document.addEventListener('click', function (e) {
    var opt = e.target.closest('.opt');
    if (opt) {
      answers[opt.dataset.q] = opt.dataset.v;
      // clear anything downstream so the answer actually changes the result
      if (opt.dataset.q === 'tone')  { answers.depth = null; answers.speed = null; }
      if (opt.dataset.q === 'depth') { answers.speed = null; }
      chosen.variant = null;
      syncHash(); route();
      return;
    }
    var back = e.target.closest('.picker__back');
    if (back) {
      var i = stepFor();
      if (i >= 3) { answers = { tone: null, depth: null, speed: null }; chosen = { variant: null, buy: 'one' }; }
      else if (i === 2) answers.speed = null, answers.depth = null;
      else if (i === 1) answers.depth = null, answers.tone = null;
      syncHash(); route();
    }
  });

  function route() {
    var i = stepFor();
    // reflect current answers on the buttons
    document.querySelectorAll('.opt').forEach(function (b) {
      b.setAttribute('aria-pressed', String(answers[b.dataset.q] === b.dataset.v));
    });
    if (i === 3) renderResult();
    show(i);
  }

  window.addEventListener('popstate', function () { readHash(); route(); });

  readHash();
  route();
})();

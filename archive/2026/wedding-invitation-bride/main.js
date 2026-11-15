/* main.js — Bình Dương & Hồng Vân invitation · bride's side (one screen)
   Guest-name fitting · falling petals. Vanilla JS, no dependencies.
   The entrance fade is pure CSS (driven by `html.ready`, set by the inline
   font gate in <head>); content is fully visible without JS.
   Petals always fall, on every device (OS reduced-motion setting
   intentionally ignored for the petals, like site/); the canvas sits behind
   the content, so petals never drift over the photos. */

(function () {
  'use strict';

  var docEl = document.documentElement;

  /* Instrumentation for verification (petal count / frames drawn). */
  window.__anim = { petals: 0, petalFrames: 0, readyAt: 0, guestFit: 0 };

  /* ============================================================
     1 · Guest name fitting
     The name lives in a fixed-height slot (.guest) so the card never
     grows. Start from the CSS size and step down until the (possibly
     wrapped) name fits the slot; never below 11px. Last resort (a very
     long unbroken name on the smallest phones): tighter line spacing.
     ============================================================ */

  var MIN_GUEST_PX = 11;

  function fitGuest() {
    var el = document.querySelector('.guest-name');
    if (!el || !el.parentNode) return;
    var box = el.parentNode;
    el.style.fontSize = '';
    el.removeAttribute('data-tight');
    var cs = getComputedStyle(box);
    var maxH = box.clientHeight;
    var maxW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var size = parseFloat(getComputedStyle(el).fontSize);
    if (!maxH || !maxW || !size) return;
    var guard = 0;
    function overflows() {
      return el.offsetHeight > maxH + 0.5 || el.scrollWidth > Math.ceil(maxW) + 1;
    }
    while (size > MIN_GUEST_PX && guard++ < 200 && overflows()) {
      size = Math.max(MIN_GUEST_PX, size - 0.5);
      el.style.fontSize = size + 'px';
    }
    if (overflows()) el.setAttribute('data-tight', '');
    window.__anim.guestFit = size;
  }

  /* ============================================================
     2 · Falling petals — single fixed canvas, one rAF loop
     Always animated: no reduced-motion gate (same as site/).
     ============================================================ */

  function initPetals() {
    var canvas = document.createElement('canvas');
    canvas.id = 'petals-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var W = 0;
    var H = 0;
    var petals = [];
    var rafId = null;
    var lastT = 0;
    var frames = 0;

    function makePetal(fromTop) {
      return {
        baseX: Math.random() * W,
        y: fromTop ? -24 - Math.random() * 60 : Math.random() * H,
        size: 8 + Math.random() * 8,               /* 8–16 px */
        speed: 30 + Math.random() * 30,            /* 30–60 px/s */
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.9,     /* gentle drift */
        swayAmp: 18 + Math.random() * 30,
        swayFreq: 0.4 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.11 + Math.random() * 0.05         /* 0.11–0.16: subtle */
      };
    }

    function targetCount() {
      /* ~5–6 petals on small screens, 8–12 on desktop */
      return W < 640 ? 5 + Math.round(Math.random()) : 8 + Math.floor(Math.random() * 5);
    }

    function syncCount() {
      var target = targetCount();
      while (petals.length < target) petals.push(makePetal(false));
      if (petals.length > target) petals.length = target;
      window.__anim.petals = petals.length;
    }

    function drawPetal(p, t) {
      var x = p.baseX + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
      var s = p.size / 10;
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.bezierCurveTo(5.2, -6, 6, 2.5, 0, 7);
      ctx.bezierCurveTo(-6, 2.5, -5.2, -6, 0, -6);
      ctx.closePath();
      ctx.fillStyle = 'rgba(158,27,50,' + p.alpha.toFixed(3) + ')';
      ctx.fill();
      ctx.restore();
    }

    function frame(tMs) {
      rafId = requestAnimationFrame(frame);
      var t = tMs / 1000;
      var dt = t - lastT;
      lastT = t;
      if (dt < 0) dt = 0;
      if (dt > 0.05) dt = 0.05; /* clamp after tab switches */

      ctx.clearRect(0, 0, W, H);
      frames++;
      window.__anim.petalFrames = frames;

      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.y += p.speed * dt;
        p.rot += p.rotSpeed * dt;
        if (p.y > H + 24) {
          petals[i] = makePetal(true); /* respawn above the top edge */
          p = petals[i];
        }
        drawPetal(p, t);
      }
    }

    function start() {
      if (rafId === null) {
        lastT = performance.now() / 1000;
        rafId = requestAnimationFrame(frame);
      }
    }

    function stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncCount();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    window.addEventListener('resize', resize);
    resize();
    start();
  }

  /* ---------- boot ----------
     Petals wait for `site:ready` — fired by the inline loader in <head> as
     the loading overlay begins to fade (its own timeouts, 5s CSS / 10s hard
     cap, guarantee it fires). The guest name is fitted right away and again
     whenever fonts or the viewport change. Local fallback, for a broken
     gate only: gate missing → start now; otherwise at 11s (1s past the
     loader's hard cap) force the overlay away, then start. */

  var started = false;
  function onReady() {
    fitGuest();
    if (started) return;
    started = true;
    window.__anim.readyAt = performance.now();
    initPetals();
  }

  /* Last resort: drop the overlay without a fade, unlock scroll, start. */
  function hardReady() {
    if (started) return;
    var el = document.getElementById('site-loader');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    docEl.classList.remove('loading');
    docEl.classList.add('ready');
    onReady();
  }

  function forceReady() {
    if (started) return;
    var L = window.__loader;
    if (L && typeof L.hide === 'function') {
      try { L.hide('error'); } catch (e) {}
    }
    setTimeout(hardReady, 1000);
  }

  fitGuest();
  window.addEventListener('resize', fitGuest);
  window.addEventListener('orientationchange', fitGuest);
  if (document.fonts) {
    if (document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(fitGuest);
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitGuest);
  }

  if (docEl.classList.contains('ready')) {
    onReady();
  } else if (!window.__siteReady || !window.__loader) {
    hardReady(); /* gate script missing/broken: never leave content hidden */
  } else {
    document.addEventListener('site:ready', onReady);
    window.__siteReady.then(onReady);
    setTimeout(forceReady, Math.max(1000, 11000 - performance.now()));
  }
})();

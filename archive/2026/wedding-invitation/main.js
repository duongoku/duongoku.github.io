/* main.js — Bình Dương & Hồng Vân wedding invitation
   Hero reveal · falling petals · scroll reveals · SVG draw-ons.
   Vanilla JS, no dependencies. Effects always run (OS reduced-motion
   setting intentionally ignored); content is fully visible without JS. */

(function () {
  'use strict';

  var docEl = document.documentElement;

  /* Instrumentation for verification (petal count / frames drawn). */
  window.__anim = { petals: 0, petalFrames: 0, heroInAt: 0 };

  /* ============================================================
     1 · Hero line-by-line reveal
     Initial hidden state lives in CSS behind `.js` (added inline
     in <head> before paint, so no flash). Runs on `site:ready`;
     flips the class after two rAFs so the start state is committed.
     ============================================================ */

  function initHero() {
    window.__anim.heroInAt = performance.now();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        docEl.classList.add('hero-in');
        window.__anim.heroInSettled = performance.now();
      });
    });
  }

  /* ============================================================
     2 · Falling petals — single fixed canvas, one rAF loop
     ============================================================ */

  function initPetals() {
    var canvas = document.createElement('canvas');
    canvas.id = 'petals-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

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
        alpha: 0.13 + Math.random() * 0.05         /* 0.13–0.18 */
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

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncCount();
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

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    window.addEventListener('resize', resize);
    resize();
    start();
  }

  /* ============================================================
     3 · Scroll reveals + hairline draw-ons
     ============================================================ */

  function strokeEls(svg) {
    return Array.prototype.slice.call(svg.querySelectorAll('path, circle, line'));
  }

  /* Pre-set dash lengths so strokes are invisible until drawn. */
  function armDraws() {
    document.querySelectorAll('.tl-icon, .fleuron').forEach(function (svg) {
      strokeEls(svg).forEach(function (el) {
        try {
          var len = el.getTotalLength();
          if (!len || !isFinite(len)) return;
          el.style.strokeDasharray = String(len + 2);
          el.style.strokeDashoffset = String(len + 2);
        } catch (e) {
          /* getTotalLength unsupported → leave stroke visible */
        }
      });
    });
  }

  /* Animate dashoffset → 0 when the owning block enters the viewport. */
  function fireDraws(block) {
    var EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

    if (block.classList.contains('timeline')) {
      block.querySelectorAll('.tl-icon').forEach(function (svg) {
        var idx = Array.prototype.indexOf.call(svg.parentNode.children, svg);
        strokeEls(svg).forEach(function (el, k) {
          el.style.transition =
            'stroke-dashoffset 0.9s ' + EASE + ' ' + (idx * 260 + k * 140) + 'ms';
          el.style.strokeDashoffset = '0';
        });
      });
      return;
    }

    block.querySelectorAll('.fleuron').forEach(function (svg) {
      var i = Array.prototype.indexOf.call(svg.parentNode.children, svg);
      var base = Math.min(i, 12) * 90 + 250; /* start after its fade-up slot */
      strokeEls(svg).forEach(function (el, k) {
        el.style.transition =
          'stroke-dashoffset 1s ' + EASE + ' ' + (base + k * 160) + 'ms';
        el.style.strokeDashoffset = '0';
      });
    });
  }

  /* Strokes are armed immediately (hidden start state, no flash); the
     observer itself starts only on `site:ready` (see boot). */
  var hasIO = 'IntersectionObserver' in window;
  if (hasIO) armDraws();

  function initReveals() {
    var blocks = document.querySelectorAll('.reveal');

    if (!hasIO) {
      blocks.forEach(function (b) {
        b.classList.add('in-view');
        fireDraws(b);
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            fireDraws(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    blocks.forEach(function (b) { io.observe(b); });
  }

  /* ---------- boot ----------
     Hero reveal, petals and the scroll-reveal IntersectionObserver all
     wait for `site:ready` — fired by the inline loader in <head> as the
     loading overlay begins to fade — so sections already on screen
     (e.g. Save-the-Date on mobile) reveal after the overlay, not under
     it. Robust to ready having fired before this deferred script runs.
     The loader's own timeouts (5s CSS / 10s hard cap) guarantee ready
     fires. Local fallback, for a broken gate only:
     - gate missing (no window.__siteReady / window.__loader) → start now;
     - otherwise at 11s after navigation start (1s past the loader's hard
       cap): force the overlay away first (loader's hide() if present, else
       remove it + unlock scroll), then start. A fixed timer shorter than
       the hard cap would start hero/petals/reveals under a legitimately
       waiting overlay; an 11s one can only fire if the gate failed. */

  var started = false;
  function onReady() {
    if (started) return;
    started = true;
    window.__anim.readyAt = performance.now();
    initHero();
    initPetals();
    initReveals();
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
  /* 11s fallback: ask the gate to hide (normal fade + site:ready); if it
     still hasn't fired ~1s later, tear the overlay down ourselves. */
  function forceReady() {
    if (started) return;
    var L = window.__loader;
    if (L && typeof L.hide === 'function') {
      try { L.hide('error'); } catch (e) {}
    }
    setTimeout(hardReady, 1000);
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

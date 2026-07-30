/* ==========================================================================
   INTEGC · comportements partagés (menu, nav tubelight, reveal, compteurs,
   hero laser, scroll-expand projets phares)
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- menu mobile ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuBtn && mobilePanel) {
    menuBtn.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  /* ---------- nav tubelight (lampe qui suit l'onglet actif) ---------- */
  function positionLamp() {
    var nav = document.getElementById('tl-nav');
    var lamp = document.getElementById('tl-lamp');
    if (!nav || !lamp) return;
    var active = nav.querySelector('.tl-item[data-active="true"]');
    if (!active) { lamp.style.opacity = '0'; return; }
    var navRect = nav.getBoundingClientRect();
    var itemRect = active.getBoundingClientRect();
    lamp.style.left = (itemRect.left - navRect.left) + 'px';
    lamp.style.width = itemRect.width + 'px';
    lamp.style.opacity = '1';
  }
  window.addEventListener('resize', positionLamp);
  window.addEventListener('load', positionLamp);
  document.addEventListener('DOMContentLoaded', positionLamp);

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- compteurs animés ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var counted = new WeakSet();
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || counted.has(entry.target)) return;
        counted.add(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- projets phares : scroll-expand media ---------- */
  var pharesEl = document.getElementById('phares-scroll');
  if (pharesEl) {
    var media = document.getElementById('ph-media');
    var overlay = document.getElementById('ph-overlay');
    var caption = document.getElementById('ph-caption');
    var tl = document.getElementById('ph-tl');
    var tr = document.getElementById('ph-tr');
    var hint = document.getElementById('ph-hint');
    var ticking = false;

    function render() {
      ticking = false;
      var total = pharesEl.offsetHeight - window.innerHeight;
      var rect = pharesEl.getBoundingClientRect();
      var p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;

      var minW = Math.min(window.innerWidth * 0.86, 560);
      var maxW = window.innerWidth;
      var minH = Math.min(window.innerHeight * 0.56, 460);
      var maxH = window.innerHeight;
      var w = minW + (maxW - minW) * p;
      var h = minH + (maxH - minH) * p;
      var radius = 18 * (1 - p);

      if (media) {
        media.style.width = w + 'px';
        media.style.height = h + 'px';
        media.style.borderRadius = radius + 'px';
      }
      if (overlay) overlay.style.opacity = String(0.35 + p * 0.5);
      if (caption) {
        caption.style.opacity = String(p);
        caption.style.transform = 'translateY(' + (14 - p * 14) + 'px)';
      }
      if (tl) tl.style.transform = 'translateX(' + (-p * 40) + 'px)';
      if (tr) tr.style.transform = 'translateX(' + (p * 40) + 'px)';
      var titleOpacity = 1 - Math.min(p / 0.5, 1);
      if (tl) tl.style.opacity = String(titleOpacity);
      if (tr) tr.style.opacity = String(titleOpacity);
      if (hint) hint.style.opacity = String(1 - Math.min(p / 0.2, 1));
    }
    function onScroll() {
      if (!ticking) { requestAnimationFrame(render); ticking = true; }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();
  }

  /* ---------- hero laser (bâtiment tracé, canvas plein cadre) ---------- */
  var laserCanvas = document.getElementById('hero-laser');
  if (laserCanvas) {
    var LASER_COLOR = '#FFF000';
    var NODE_COLOR = '#8fb8ec';
    var GRID_COLOR = '#3572B7';
    var DRAW_SPEED = 1.9;
    var HOLD_TIME = 1.1;
    var FADE_TIME = 0.55;

    var nodes = [
      [0.18, 0.06], [0.50, 0.06], [0.82, 0.06],
      [0.18, 0.34], [0.50, 0.34], [0.82, 0.34],
      [0.18, 0.60], [0.50, 0.60], [0.82, 0.60],
      [0.18, 0.82], [0.50, 0.82], [0.82, 0.82],
      [0.50, 0.97]
    ];
    var beams = [
      [0,1],[1,2],
      [0,3],[1,4],[2,5],
      [3,4],[4,5],
      [3,6],[4,7],[5,8],
      [6,7],[7,8],
      [6,9],[7,10],[8,11],
      [9,10],[10,11],
      [9,12],[11,12]
    ];

    var ctx = laserCanvas.getContext('2d');
    var W = 0, H = 0, DPR = 1;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function buildingBox() {
      var portrait = W < H * 1.05;
      var bw = Math.min(W * (portrait ? 0.72 : 0.42), 520);
      var bh = Math.min(H * 0.70, bw * 1.32);
      var cx = portrait ? W * 0.5 : W * 0.72;
      var cy = H * 0.52;
      return { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
    }
    function P(i, box) { return { x: box.x + nodes[i][0] * box.w, y: box.y + (1 - nodes[i][1]) * box.h }; }

    var beamLen = [];
    function computeLengths(box) {
      if (!box || box.w < 2 || box.h < 2) return;
      beamLen = beams.map(function (pair) {
        var p = P(pair[0], box), q = P(pair[1], box);
        return Math.hypot(q.x - p.x, q.y - p.y) / Math.min(box.w, box.h);
      });
    }
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = laserCanvas.clientWidth; H = laserCanvas.clientHeight;
      laserCanvas.width = Math.round(W * DPR);
      laserCanvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      computeLengths(buildingBox());
    }
    window.addEventListener('resize', resize);

    function drawGrid(box, alpha) {
      ctx.save();
      ctx.strokeStyle = GRID_COLOR;
      ctx.globalAlpha = 0.10 * alpha;
      ctx.lineWidth = 1;
      var step = box.w / 8;
      for (var gx = box.x - step; gx <= box.x + box.w + step; gx += step) {
        ctx.beginPath(); ctx.moveTo(gx, box.y - step); ctx.lineTo(gx, box.y + box.h + step); ctx.stroke();
      }
      for (var gy = box.y - step; gy <= box.y + box.h + step; gy += step) {
        ctx.beginPath(); ctx.moveTo(box.x - step, gy); ctx.lineTo(box.x + box.w + step, gy); ctx.stroke();
      }
      ctx.restore();
    }
    function drawBeam(p, q, t) {
      var ex = p.x + (q.x - p.x) * t, ey = p.y + (q.y - p.y) * t;
      ctx.save();
      ctx.strokeStyle = LASER_COLOR; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.shadowColor = LASER_COLOR; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.restore();
      return { ex: ex, ey: ey };
    }
    function drawNode(p) {
      ctx.save();
      ctx.fillStyle = NODE_COLOR; ctx.shadowColor = NODE_COLOR; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.1, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    function drawHead(x, y) {
      if (!isFinite(x) || !isFinite(y)) return;
      ctx.save();
      var g = ctx.createRadialGradient(x, y, 0, x, y, 16);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.35, LASER_COLOR);
      g.addColorStop(1, 'rgba(255,240,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    function drawScanLine(box, progress) {
      var y = box.y + box.h - progress * box.h;
      ctx.save();
      var g = ctx.createLinearGradient(0, y - 40, 0, y + 6);
      g.addColorStop(0, 'rgba(255,240,0,0)');
      g.addColorStop(1, 'rgba(255,240,0,0.5)');
      ctx.fillStyle = g;
      ctx.fillRect(box.x - box.w * 0.15, y - 40, box.w * 1.3, 46);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(box.x - box.w * 0.15, y); ctx.lineTo(box.x + box.w * 1.15, y); ctx.stroke();
      ctx.restore();
    }
    function totalDraw() { return beamLen.reduce(function (s, l) { return s + l; }, 0) / DRAW_SPEED; }

    function render(drawn, opts) {
      var box = buildingBox();
      computeLengths(box);
      if (beamLen.length !== beams.length) return;
      ctx.clearRect(0, 0, W, H);
      var globalAlpha = opts.fade != null ? opts.fade : 1;
      ctx.globalAlpha = 1;
      drawGrid(box, globalAlpha);
      ctx.globalAlpha = globalAlpha;

      var acc = 0, headPos = null;
      var litNodes = {};
      for (var i = 0; i < beams.length; i++) {
        var dur = beamLen[i] / DRAW_SPEED;
        var p = P(beams[i][0], box), q = P(beams[i][1], box);
        var t;
        if (drawn >= acc + dur) t = 1;
        else if (drawn <= acc) t = 0;
        else t = (drawn - acc) / dur;
        if (t > 0) {
          var end = drawBeam(p, q, t);
          litNodes[beams[i][0]] = true;
          if (t >= 1) litNodes[beams[i][1]] = true;
          else headPos = end;
        }
        acc += dur;
      }
      if (opts.scan != null) drawScanLine(box, opts.scan);
      Object.keys(litNodes).forEach(function (idx) { drawNode(P(parseInt(idx, 10), box)); });
      if (headPos) drawHead(headPos.x, headPos.y);
      ctx.globalAlpha = 1;
    }

    resize();
    if (reduced) {
      render(totalDraw() + 1, { scan: null, fade: 1 });
    } else {
      var start = null;
      (function loop(ts) {
        if (start == null) start = ts;
        computeLengths(buildingBox());
        if (beamLen.length !== beams.length) { requestAnimationFrame(loop); return; }
        var elapsed = (ts - start) / 1000;
        var drawDur = totalDraw();
        var cycle = drawDur + HOLD_TIME + FADE_TIME;
        var tc = elapsed % cycle;
        if (tc < drawDur) {
          render(tc, { scan: tc / drawDur, fade: 1 });
        } else if (tc < drawDur + HOLD_TIME) {
          render(drawDur + 999, { scan: null, fade: 1 });
        } else {
          var f = 1 - (tc - drawDur - HOLD_TIME) / FADE_TIME;
          render(drawDur + 999, { scan: null, fade: Math.max(0, f) });
        }
        requestAnimationFrame(loop);
      })();
    }
  }

  /* ---------- boutons "liquid metal" : effet ripple au clic ---------- */
  document.querySelectorAll('.btn-liquid').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.style.cssText = 'position:absolute;z-index:2;left:' + x + 'px;top:' + y + 'px;width:26px;height:26px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0) 70%);animation:lm-ripple .62s ease-out forwards;';
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 650);
    });
  });

  /* ---------- carrousel références (projets phares) ---------- */
  var carousel = document.querySelector('.ref-carousel');
  if (carousel) {
    var track = carousel.querySelector('.ref-carousel-track');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.ref-carousel-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.ref-carousel-dot'));
    var idx = 0;
    var timer = null;
    function renderCarousel() {
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
    }
    function goTo(i) { idx = (i + slides.length) % slides.length; renderCarousel(); }
    function next() { goTo(idx + 1); }
    function prev() { goTo(idx - 1); }
    function restartTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 5000);
    }
    var nextBtn = document.querySelector('[data-carousel-next]');
    var prevBtn = document.querySelector('[data-carousel-prev]');
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartTimer(); });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { goTo(i); restartTimer(); });
    });
    renderCarousel();
    restartTimer();
  }

  /* ---------- filtres références (client-side) ---------- */
  var filterBar = document.querySelector('.ref-filter-bar');
  if (filterBar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.ref-card'));
    var qInput = document.getElementById('f-query');
    var selMission = document.getElementById('f-mission');
    var selDomain = document.getElementById('f-domain');
    var selClient = document.getElementById('f-client');
    var selRegion = document.getElementById('f-region');
    var selYear = document.getElementById('f-year');
    var selSort = document.getElementById('f-sort');
    var resetBtn = document.getElementById('f-reset');
    var countEl = document.getElementById('ref-count-num');
    var missionLabelEl = document.getElementById('ref-count-mission');
    var grid = document.querySelector('.ref-grid');

    function applyFilters() {
      var q = (qInput.value || '').toLowerCase().trim();
      var mission = selMission.value, domain = selDomain.value, client = selClient.value, region = selRegion.value, year = selYear.value;
      var visible = [];
      cards.forEach(function (c) {
        var ok = true;
        if (mission !== 'all' && c.getAttribute('data-mission') !== mission) ok = false;
        if (ok && domain !== 'all' && c.getAttribute('data-domain') !== domain) ok = false;
        if (ok && client !== 'all' && c.getAttribute('data-client') !== client) ok = false;
        if (ok && region !== 'all' && c.getAttribute('data-region') !== region) ok = false;
        if (ok && year !== 'all' && c.getAttribute('data-year') !== year) ok = false;
        if (ok && q) {
          var name = (c.getAttribute('data-name') || '').toLowerCase();
          var cli = (c.getAttribute('data-client') || '').toLowerCase();
          if (name.indexOf(q) === -1 && cli.indexOf(q) === -1) ok = false;
        }
        c.hidden = !ok;
        if (ok) visible.push(c);
      });
      var sort = selSort.value;
      var sorted = visible.slice().sort(function (a, b) {
        if (sort === 'year-desc') return b.getAttribute('data-year') - a.getAttribute('data-year');
        if (sort === 'year-asc') return a.getAttribute('data-year') - b.getAttribute('data-year');
        return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || '');
      });
      sorted.forEach(function (c) { grid.appendChild(c); });
      if (countEl) countEl.textContent = visible.length;
      if (missionLabelEl) {
        var isEn = document.documentElement.lang === 'en';
        var missionLabels = isEn
          ? { all: 'All missions', etude: 'Design & Studies', controle: 'Supervision & Control', moe: 'Project Management' }
          : { all: 'Toutes les missions', etude: 'Études', controle: 'Contrôle & suivi', moe: "Maîtrise d'œuvre" };
        missionLabelEl.textContent = missionLabels[mission] || missionLabels.all;
      }
    }
    [qInput, selMission, selDomain, selClient, selRegion, selYear, selSort].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    });
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        qInput.value = '';
        [selMission, selDomain, selClient, selRegion, selYear].forEach(function (s) { s.value = 'all'; });
        selSort.value = 'year-desc';
        applyFilters();
      });
    }
    var params = new URLSearchParams(window.location.search);
    var missionParam = params.get('mission');
    if (missionParam && selMission) selMission.value = missionParam;
    applyFilters();
  }

  /* ---------- formulaire contact ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = document.getElementById('c-nom');
      var email = document.getElementById('c-email');
      var message = document.getElementById('c-message');
      var ok = true;
      [nom, email, message].forEach(function (f) { f.closest('.form-field').classList.remove('error'); });
      if (!nom.value.trim()) { nom.closest('.form-field').classList.add('error'); ok = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.closest('.form-field').classList.add('error'); ok = false; }
      if (!message.value.trim() || message.value.trim().length < 10) { message.closest('.form-field').classList.add('error'); ok = false; }
      if (!ok) return;
      contactForm.hidden = true;
      document.getElementById('contact-success').hidden = false;
    });
    var contactReset = document.getElementById('contact-reset');
    if (contactReset) {
      contactReset.addEventListener('click', function () {
        contactForm.reset();
        contactForm.hidden = false;
        document.getElementById('contact-success').hidden = true;
      });
    }
  }

  /* ---------- formulaire vivier de talents (carrières) ---------- */
  var talentForm = document.getElementById('talent-form');
  if (talentForm) {
    var talentCountEl = document.getElementById('talent-count');
    function refreshTalentCount() {
      var n = 0;
      try { n = (JSON.parse(localStorage.getItem('integc_talents') || '[]')).length; } catch (e) {}
      if (talentCountEl) talentCountEl.textContent = n;
    }
    refreshTalentCount();
    talentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = document.getElementById('t-nom');
      var email = document.getElementById('t-email');
      var tel = document.getElementById('t-tel');
      var profil = document.getElementById('t-profil');
      var ok = true;
      [nom, email, tel, profil].forEach(function (f) { f.closest('.form-field').classList.remove('error'); });
      if (!nom.value.trim()) { nom.closest('.form-field').classList.add('error'); ok = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.closest('.form-field').classList.add('error'); ok = false; }
      if (!tel.value.trim()) { tel.closest('.form-field').classList.add('error'); ok = false; }
      if (!profil.value) { profil.closest('.form-field').classList.add('error'); ok = false; }
      if (!ok) return;
      try {
        var db = JSON.parse(localStorage.getItem('integc_talents') || '[]');
        db.push({
          nom: nom.value, email: email.value, tel: tel.value, profil: profil.value,
          exp: document.getElementById('t-exp') ? document.getElementById('t-exp').value : '',
          niveau: document.getElementById('t-niveau') ? document.getElementById('t-niveau').value : '',
          region: document.getElementById('t-region') ? document.getElementById('t-region').value : '',
          date: new Date().toISOString()
        });
        localStorage.setItem('integc_talents', JSON.stringify(db));
      } catch (err) {}
      talentForm.hidden = true;
      document.getElementById('talent-success').hidden = false;
    });
    var talentReset = document.getElementById('talent-reset');
    if (talentReset) {
      talentReset.addEventListener('click', function () {
        talentForm.reset();
        talentForm.hidden = false;
        document.getElementById('talent-success').hidden = true;
        refreshTalentCount();
      });
    }
  }
})();

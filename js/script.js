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

  /* ---------- projets phares : scroll-expand + clic → carrousel modal ---------- */
  var PHARES_FR = [
    { cat: 'Autoroutes & Routes', name: 'Autoroute Kribi–Lolabé', client: 'MINTP', region: 'Sud', year: 2015,
      img: 'assets/phare-kribi.jpeg',
      desc: "Maîtrise d'œuvre d'une section autoroutière stratégique reliant le port en eau profonde de Kribi à Lolabé.",
      figures: [['Linéaire', '40 km'], ['Client', 'MINTP'], ['Mission', "Maîtrise d'œuvre"], ['Année', '2015']] },
    { cat: 'Bâtiments', name: 'Siège de la Direction Générale des Impôts', client: 'MINFI', region: 'Centre', year: 2017,
      img: 'assets/phare-dgi.jpg',
      desc: "Maîtrise d'œuvre du nouvel immeuble-siège de la Direction Générale des Impôts, inauguré à Yaoundé le 27 novembre 2020.",
      figures: [['Envergure', 'R+15'], ['Client', 'MINFI'], ['Mission', "Maîtrise d'œuvre"], ['Année', '2017']] },
    { cat: "Ouvrages d'art", name: 'Pont sur la Bénoué', client: 'MINTP', region: 'Nord', year: 2017,
      img: 'assets/phare-benoue.jpg',
      desc: "Étude de réhabilitation du pont sur la Bénoué, un ouvrage de 405,60 m à deux poutres en béton armé sur 12 travées continues de 33,80 m.",
      figures: [['Portée totale', '405,60 m'], ['Travées', '12 × 33,80 m'], ['Largeur', '8 m'], ['Année', '2017']] },
    { cat: 'Eau & Énergie', name: 'Ligne 225 kV Ebolowa–Kribi', client: 'SONATREL', region: 'Sud', year: 2020,
      img: 'assets/phare-ligne.jpg',
      desc: "Maîtrise d'œuvre de la ligne électrique 225 kV reliant Ebolowa à Kribi, pour le compte de SONATREL.",
      figures: [['Tension', '225 kV'], ['Client', 'SONATREL'], ['Mission', "Maîtrise d'œuvre"], ['Année', '2020']] }
  ];
  var PHARES_EN = [
    { cat: 'Highways & Roads', name: 'Kribi–Lolabé Highway', client: 'MINTP', region: 'South', year: 2015,
      img: 'assets/phare-kribi.jpeg',
      desc: 'Project management of a strategic highway section connecting the deep-water port of Kribi to Lolabé.',
      figures: [['Length', '40 km'], ['Client', 'MINTP'], ['Mission', 'Project management'], ['Year', '2015']] },
    { cat: 'Buildings', name: 'General Directorate of Taxation Headquarters', client: 'MINFI', region: 'Centre', year: 2017,
      img: 'assets/phare-dgi.jpg',
      desc: 'Project management of the new General Directorate of Taxation headquarters, inaugurated in Yaoundé on 27 November 2020.',
      figures: [['Scale', '15 floors'], ['Client', 'MINFI'], ['Mission', 'Project management'], ['Year', '2017']] },
    { cat: 'Structural Works', name: 'Bénoué River Bridge', client: 'MINTP', region: 'North', year: 2017,
      img: 'assets/phare-benoue.jpg',
      desc: 'Design review of the rehabilitated Bénoué River bridge, a 405.60 m structure with two reinforced concrete girders across 12 continuous 33.80 m spans.',
      figures: [['Total span', '405.60 m'], ['Spans', '12 × 33.80 m'], ['Width', '8 m'], ['Year', '2017']] },
    { cat: 'Water & Energy', name: '225 kV Ebolowa–Kribi Power Line', client: 'SONATREL', region: 'South', year: 2020,
      img: 'assets/phare-ligne.jpg',
      desc: 'Project management of the 225 kV power line connecting Ebolowa to Kribi, for SONATREL.',
      figures: [['Voltage', '225 kV'], ['Client', 'SONATREL'], ['Mission', 'Project management'], ['Year', '2020']] }
  ];
  var pharesSec = document.getElementById('phares-scroll');
  if (pharesSec) {
    var PHARES = document.documentElement.lang === 'en' ? PHARES_EN : PHARES_FR;
    var phMedia = document.getElementById('ph-media');
    var phTl = document.getElementById('ph-tl'), phTr = document.getElementById('ph-tr');
    var phReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var phTicking = false;

    function phOnScroll() {
      if (phTicking) return;
      phTicking = true;
      requestAnimationFrame(function () {
        var total = pharesSec.offsetHeight - window.innerHeight;
        var p = total > 0 ? Math.min(1, Math.max(0, -pharesSec.getBoundingClientRect().top / total)) : 0;
        var eas = 1 - Math.pow(1 - p, 2);
        if (phMedia) {
          phMedia.style.width = Math.round(360 + eas * 1240) + 'px';
          phMedia.style.height = Math.round(230 + eas * 560) + 'px';
          phMedia.style.borderRadius = Math.round(20 - eas * 8) + 'px';
        }
        var tX = eas * 26;
        if (phTl) phTl.style.transform = 'translateX(-' + tX + 'vw)';
        if (phTr) phTr.style.transform = 'translateX(' + tX + 'vw)';
        phTicking = false;
      });
    }
    if (!phReduced) {
      window.addEventListener('scroll', phOnScroll, { passive: true });
      window.addEventListener('resize', phOnScroll);
      phOnScroll();
    } else if (phMedia) {
      phMedia.style.width = '1200px';
      phMedia.style.height = '560px';
    }

    /* ---- carrousel modal ---- */
    var phModal = document.getElementById('ph-modal');
    var phIdx = 0;
    function phEl(id) { return document.getElementById(id); }
    function phRender() {
      var d = PHARES[phIdx];
      phEl('phm-bg').style.backgroundImage = "url('" + d.img + "')";
      phEl('phm-cat').textContent = d.cat;
      phEl('phm-count').textContent = (document.documentElement.lang === 'en' ? 'PROJECT ' : 'PROJET ') + (phIdx + 1) + ' / ' + PHARES.length;
      phEl('phm-name').textContent = d.name;
      phEl('phm-meta').textContent = d.client + ' · ' + d.region + ' · ' + d.year;
      phEl('phm-desc').textContent = d.desc;
      phEl('phm-figs').innerHTML = d.figures.map(function (f) {
        return '<div class="fig"><div style="font-size:11px;font-weight:700;letter-spacing:.5px;color:#8ea2e8;text-transform:uppercase;">' + f[0] + '</div><div style="font-family:\'Sora\';font-weight:700;font-size:16px;color:#fff;margin-top:4px;">' + f[1] + '</div></div>';
      }).join('');
      phEl('phm-dots').innerHTML = PHARES.map(function (_, k) {
        return '<button class="dot" data-go="' + k + '" style="width:' + (k === phIdx ? 26 : 9) + 'px;background:' + (k === phIdx ? '#FFF000' : 'rgba(255,255,255,.4)') + ';"></button>';
      }).join('');
    }
    function phOpen(i) { phIdx = i; phRender(); if (phModal) { phModal.classList.add('open'); phModal.setAttribute('aria-hidden', 'false'); } }
    function phClose() { if (phModal) { phModal.classList.remove('open'); phModal.setAttribute('aria-hidden', 'true'); } }
    function phNav(delta) { phIdx = (phIdx + delta + PHARES.length) % PHARES.length; phRender(); }

    if (phMedia) phMedia.addEventListener('click', function () { phOpen(0); });
    var phCloseBtn = phEl('phm-close');
    if (phCloseBtn) phCloseBtn.addEventListener('click', phClose);
    if (phModal) {
      phModal.addEventListener('click', function (e) {
        if (e.target === phModal) { phClose(); return; }
        var navBtn = e.target.closest('[data-nav]');
        if (navBtn) phNav(parseInt(navBtn.getAttribute('data-nav'), 10));
        var goBtn = e.target.closest('[data-go]');
        if (goBtn) { phIdx = parseInt(goBtn.getAttribute('data-go'), 10); phRender(); }
      });
    }
    window.addEventListener('keydown', function (e) {
      if (!phModal || !phModal.classList.contains('open')) return;
      if (e.key === 'Escape') phClose();
      if (e.key === 'ArrowRight') phNav(1);
      if (e.key === 'ArrowLeft') phNav(-1);
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-phare]')).forEach(function (el) {
      el.addEventListener('click', function () { phOpen(parseInt(el.getAttribute('data-phare'), 10)); });
    });
  }

  /* ---------- hero réseau de particules (canvas plein cadre, interactif souris) ---------- */
  var laserCanvas = document.getElementById('hero-laser');
  if (laserCanvas) {
    var ctx = laserCanvas.getContext('2d');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var SKY = '53,114,183', ACCENT = '255,240,0', NODE_SKY = '#8fb8ec';
    var W = 0, H = 0, DPR = 1, parts = [];
    var mouse = { x: null, y: null, r: 150 };
    function rand(a, b) { return a + Math.random() * (b - a); }

    function init() {
      parts = [];
      var n = Math.min(120, Math.round((W * H) / 12000));
      for (var i = 0; i < n; i++) {
        var size = rand(1.1, 2.6);
        parts.push({
          x: rand(size * 2, W - size * 2), y: rand(size * 2, H - size * 2),
          vx: rand(-0.22, 0.22), vy: rand(-0.22, 0.22),
          size: size, accent: Math.random() < 0.14
        });
      }
    }
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = laserCanvas.clientWidth; H = laserCanvas.clientHeight;
      laserCanvas.width = Math.round(W * DPR); laserCanvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); init();
    }
    function onMove(e) { var r = laserCanvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }
    function onLeave() { mouse.x = null; mouse.y = null; }

    function drawNode(p) {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7);
      if (p.accent) { ctx.fillStyle = 'rgba(' + ACCENT + ',0.95)'; ctx.shadowColor = 'rgba(' + ACCENT + ',0.8)'; ctx.shadowBlur = 8; }
      else { ctx.fillStyle = NODE_SKY; ctx.shadowColor = 'rgba(' + SKY + ',0.7)'; ctx.shadowBlur = 5; }
      ctx.fill(); ctx.shadowBlur = 0;
    }
    function connect() {
      var maxD = (W / 7) * (H / 7);
      for (var a = 0; a < parts.length; a++) {
        for (var b = a + 1; b < parts.length; b++) {
          var dx = parts[a].x - parts[b].x, dy = parts[a].y - parts[b].y, d = dx * dx + dy * dy;
          if (d < maxD) {
            var op = 1 - d / 22000; if (op <= 0) continue;
            var near = false;
            if (mouse.x != null) { var mdx = parts[a].x - mouse.x, mdy = parts[a].y - mouse.y; near = (mdx * mdx + mdy * mdy) < mouse.r * mouse.r; }
            ctx.strokeStyle = near ? 'rgba(' + ACCENT + ',' + (op * 0.9) + ')' : 'rgba(' + SKY + ',' + (op * 0.55) + ')';
            ctx.lineWidth = near ? 1.4 : 0.9;
            ctx.beginPath(); ctx.moveTo(parts[a].x, parts[a].y); ctx.lineTo(parts[b].x, parts[b].y); ctx.stroke();
          }
        }
      }
    }
    function step(move) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (move) {
          if (p.x > W || p.x < 0) p.vx = -p.vx;
          if (p.y > H || p.y < 0) p.vy = -p.vy;
          if (mouse.x != null) {
            var dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.r + p.size && dist > 0) {
              var f = (mouse.r - dist) / mouse.r;
              p.x -= (dx / dist) * f * 4; p.y -= (dy / dist) * f * 4;
            }
          }
          p.x += p.vx; p.y += p.vy;
        }
        drawNode(p);
      }
      connect();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);

    resize();
    if (reduced) {
      step(false);
    } else {
      (function loop() { step(true); requestAnimationFrame(loop); })();
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

    var touchStartX = null, touchDeltaX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (touchStartX == null) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (touchStartX == null) return;
      if (Math.abs(touchDeltaX) > 40) {
        if (touchDeltaX < 0) next(); else prev();
        restartTimer();
      }
      touchStartX = null; touchDeltaX = 0;
    });

    renderCarousel();
    restartTimer();
  }

  /* ---------- mise en avant de la fiche projet ciblée (lien carrousel / phare-card) ---------- */
  function highlightLinkedCard() {
    var id = window.location.hash.replace('#', '');
    if (!id) return;
    var target = document.getElementById(id);
    if (!target || !target.classList.contains('ref-card')) return;
    target.classList.remove('just-linked');
    void target.offsetWidth;
    target.classList.add('just-linked');
    setTimeout(function () { target.classList.remove('just-linked'); }, 1800);
  }
  if (document.querySelector('.ref-card')) {
    window.addEventListener('hashchange', highlightLinkedCard);
    if (window.location.hash) setTimeout(highlightLinkedCard, 50);
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

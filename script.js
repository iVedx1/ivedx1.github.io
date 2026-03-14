/* ============================================================
   Theme Toggle
   ============================================================ */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

const stored = localStorage.getItem('theme');
if (stored) {
  html.setAttribute('data-theme', stored);
  themeIcon.textContent = stored === 'dark' ? '☀️' : '🌙';
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  html.setAttribute('data-theme', 'dark');
  themeIcon.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeIcon.textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

/* ============================================================
   Mobile hamburger
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ============================================================
   EST Clock + availability dot
   ============================================================ */
window.addEventListener('DOMContentLoaded', function () {
  const clockEl = document.getElementById('estClock');
  const dotEl   = document.getElementById('timeDot');
  const navClockEl = document.getElementById('navClock');
  const navDotEl = document.getElementById('navTimeDot');
  const navClockLabelEl = document.getElementById('navClockLabel');
  if (!clockEl || !dotEl) return;

  function tick() {
    const now = new Date();
    const estStr = now.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour:     'numeric',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   true
    });
    const estHour = parseInt(now.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour:     'numeric',
      hour12:   false
    }), 10);

    clockEl.textContent = estStr;
    const awake = estHour >= 8 && estHour < 23;
    dotEl.className = 'time-dot ' + (awake ? 'active' : 'inactive');

    if (navClockEl) navClockEl.textContent = estStr;
    if (navDotEl) navDotEl.className = 'time-dot ' + (awake ? 'active' : 'inactive');

    if (navClockLabelEl) navClockLabelEl.textContent = 'My Current Time:';
  }

  tick();
  setInterval(tick, 1000);
});

/* ============================================================
   Scroll progress bar — snaps to active nav link
   ============================================================ */
(function () {
  const bar = document.getElementById('navProgress');
  if (!bar) return;

  const navBar = document.querySelector('.navbar');
  const sections = ['about', 'experience', 'projects', 'skills', 'contact'];

  function update() {
    const navEl    = navBar;
    const navH     = navEl ? navEl.offsetHeight : 0;
    const scrollMid = window.scrollY + window.innerHeight / 3;
    const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

    let activeId = sections[0];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop - navH <= scrollMid) activeId = id;
    }

    if (nearBottom) activeId = 'contact';

    const activeLink = document.querySelector(`.nav-links a[href="#${activeId}"]`);
    if (!activeLink) return;

    const navEl2   = navBar;
    const navRect  = navEl2.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    bar.style.left  = (linkRect.left - navRect.left) + 'px';
    bar.style.width = linkRect.width + 'px';
  }

  bar.style.transition = 'left 0.3s ease, width 0.3s ease';

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ============================================================
   Experience Dot Field
   ============================================================ */
(function () {
  const section = document.getElementById('experience');
  const canvas = document.getElementById('experienceDotField');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function parseMutedColor() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      return {
        r: parseInt(raw.slice(1, 3), 16),
        g: parseInt(raw.slice(3, 5), 16),
        b: parseInt(raw.slice(5, 7), 16),
      };
    }
    const m = raw.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
      return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
    }
    return { r: 120, g: 130, b: 150 };
  }

  let muted = parseMutedColor();
  let w = 0;
  let h = 0;
  let rafId = 0;

  function resize() {
    const rect = section.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    const spacing = 28;
    const baseR = 0.9;
    const amp = 1.8;
    const sigma = Math.min(w, h) * 0.2;

    const c1x = (0.28 + 0.16 * Math.sin(t * 0.00022)) * w;
    const c1y = (0.36 + 0.14 * Math.cos(t * 0.00019)) * h;
    const c2x = (0.68 + 0.13 * Math.cos(t * 0.00017)) * w;
    const c2y = (0.62 + 0.12 * Math.sin(t * 0.00021)) * h;

    for (let y = spacing / 2; y <= h; y += spacing) {
      for (let x = spacing / 2; x <= w; x += spacing) {
        const d1 = Math.hypot(x - c1x, y - c1y);
        const d2 = Math.hypot(x - c2x, y - c2y);

        const i1 = Math.exp(-(d1 * d1) / (2 * sigma * sigma));
        const i2 = Math.exp(-(d2 * d2) / (2 * sigma * sigma));

        const wave1 = 0.5 + 0.5 * Math.sin(t * 0.006 + d1 * 0.035);
        const wave2 = 0.5 + 0.5 * Math.sin(t * 0.0052 + d2 * 0.03 + 1.2);
        const influence = i1 * wave1 + i2 * wave2;

        const r = baseR + amp * influence;
        const a = Math.min(0.2, 0.05 + 0.11 * influence);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${muted.r}, ${muted.g}, ${muted.b}, ${a})`;
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  resize();
  rafId = requestAnimationFrame(draw);

  const ro = new ResizeObserver(resize);
  ro.observe(section);

  const mo = new MutationObserver(() => {
    muted = parseMutedColor();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    mo.disconnect();
  });
})();

/* ============================================================
   Three.js DNA helix
   ============================================================ */
(function () {
  const mount = document.getElementById('dnaMount');
  if (!mount || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0, -5, 20);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  const sun = new THREE.DirectionalLight(0xffffff, 0.85);
  sun.position.set(6, 8, 10);
  scene.add(sun);

  const bluePoint = new THREE.PointLight(0x3b82f6, 1.4, 35);
  bluePoint.position.set(-5, 5, 7);
  scene.add(bluePoint);

  const purplePoint = new THREE.PointLight(0x8b5cf6, 1.1, 35);
  purplePoint.position.set(5, -5, 5);
  scene.add(purplePoint);

  const matBlue   = new THREE.MeshLambertMaterial({ color: 0x2563eb });
  const matPurple = new THREE.MeshLambertMaterial({ color: 0x7c3aed });
  const matRung   = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

  const turns  = 2.2;
  const radius = 2.2;
  const length = 28;
  const N      = 160;

  const pts1 = [], pts2 = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * turns * Math.PI * 2;
    const y = (t - 0.5) * length;
    pts1.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    pts2.push(new THREE.Vector3(Math.cos(a + Math.PI) * radius, y, Math.sin(a + Math.PI) * radius));
  }

  function makeTube(pts, mat) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo   = new THREE.TubeGeometry(curve, N, 0.13, 10, false);
    return new THREE.Mesh(geo, mat);
  }

  const outerGroup = new THREE.Group();
  outerGroup.rotation.z =  Math.PI / 4;
  outerGroup.rotation.x = -0.35;
  outerGroup.position.y = -3.4;
  outerGroup.scale.set(1.05, 1.24, 1.05);
  scene.add(outerGroup);

  const spinGroup = new THREE.Group();
  outerGroup.add(spinGroup);

  spinGroup.add(makeTube(pts1, matBlue));
  spinGroup.add(makeTube(pts2, matPurple));

  const rungCount = turns * 8;
  const rungCylGeo = new THREE.CylinderGeometry(0.065, 0.065, 1, 8);

  for (let i = 0; i < rungCount; i++) {
    const t = i / rungCount;
    const a = t * turns * Math.PI * 2;
    const y = (t - 0.5) * length;

    const p1 = new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius);
    const p2 = new THREE.Vector3(Math.cos(a + Math.PI) * radius, y, Math.sin(a + Math.PI) * radius);
    const mid  = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const dist = p1.distanceTo(p2);

    const rung = new THREE.Mesh(rungCylGeo, matRung.clone());
    rung.scale.set(1, dist, 1);
    rung.position.copy(mid);
    rung.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(p1, p2).normalize()
    );
    spinGroup.add(rung);
  }

  let tick = 0;
  function animate() {
    requestAnimationFrame(animate);
    tick += 0.006;
    spinGroup.rotation.y = tick;
    spinGroup.rotation.x = Math.sin(tick / 2) * 0.1;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = mount.clientWidth, h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

/* ============================================================
   Coverflow Carousel  — iPod Classic style
   Side cards: portrait (full text, no image)
   Active card: landscape (text left, image right, wider)
   ============================================================ */
(function () {

  /* ── Project data ── */
  const PROJECTS = [
    {
      badge:  'ML · Healthcare',
      title:  'Endoscopy Cancellation Prediction',
      desc:   'XGBoost model predicting appointment no-shows for Cleveland Clinic Digestive Disease Institute, engineered to reduce large annual losses from cancellations.',
      tags:   ['XGBoost', 'Python', 'Palantir Foundry', 'Matplotlib', 'SKLearn'],
      image:  'assets/projects/ccf.jpg',
      link:   '#',
    },
    {
      badge:  'ML · Diagnostics',
      title:  'IBD Diagnosis AI Model',
      desc:   '95% accuracy classifier identifying IBD from 700+ breath biomarkers. PCA reduced features to 99; SMOTE addressed class imbalance.',
      tags:   ['scikit-learn', 'PCA', 'SMOTE', 'Matplotlib', 'Seaborn'],
      image:  'assets/projects/ibd-model.png',
      link:   '#',
    },
    {
      badge:  'Full-Stack · AI',
      title:  'Theo Health',
      desc:   'AI-powered chronic disease journal with voice and text symptom logging and a physician portal. Backend + AI layer built with Firebase and Gemini API.',
      tags:   ['React Native', 'Firebase', 'Gemini API'],
      image:  'assets/projects/theo.png',
      link:   '#',
    },
    {
      badge:  'CV · Autonomy',
      title:  'Autonomous Driving Detection',
      desc:   'Object detection system for still-image autonomous driving scenarios, developed during an Inspirit AI program.',
      tags:   ['TensorFlow', 'Computer Vision', 'Python'],
      image:  'assets/projects/autonomous-driving.png',
      link:   '#',
    },
    {
      badge:  'Future',
      title:  '& More to Come!',
      desc:   'Ask me about upcoming projects at the intersection of medicine and technology.',
      tags:   ['Stay Tuned'],
      imageEmoji: '🍿',
      link:   '#',
    },
  ];

  /* ─────────────────────────────────────────────────────────────
     Layout config
     CARD_W_SIDE  : portrait width for non-active cards
     CARD_W_ACTIVE: landscape width for the centre card
     SIDE_OFFSET  : translateX for ±1 cards (measured from centre,
                    accounts for half the active card width so the
                    side cards don't overlap it)
  ───────────────────────────────────────────────────────────── */
  const CARD_W_SIDE   = 300;   // px  — portrait
  const CARD_W_ACTIVE = 660;   // px  — landscape
  const SIDE_GAP      = -35;    // px gap between active edge and ±1 card
  const SIDE_OFFSET   = CARD_W_ACTIVE / 2 + SIDE_GAP + CARD_W_SIDE / 2;
  const SIDE_OFFSET2  = SIDE_OFFSET + CARD_W_SIDE + 36;
  const SIDE_ROTEY    = 32;    // deg Y-rotation
  const SIDE_SCALE    = 0.9;
  const SIDE_SCALE2   = 0.76;
  const SIDE_OPACITY  = 0.62;
  const SIDE_OPACITY2 = 0.28;
  const AUTO_DELAY    = 3400;  // ms

  /* ── Rebuild section DOM ── */
  const section = document.getElementById('projects');
  if (!section) return;
  const container = section.querySelector('.container');
  container.innerHTML = `
    <h2 class="section-title">Projects</h2>
    <div class="carousel-wrapper" id="cfWrapper">
      <div class="coverflow-stage" id="cfStage"></div>
      <div class="carousel-dots"   id="cfDots"></div>
      <p class="cf-pause-hint"     id="cfHint">⏸ Auto-scroll paused on hover</p>
    </div>`;

  const stage = document.getElementById('cfStage');
  const dots  = document.getElementById('cfDots');
  const hint  = document.getElementById('cfHint');
  const contactSection = document.getElementById('contact');
  const contactButtons = Array.from(document.querySelectorAll('.contact-card'));
  let contactHighlightTimers = [];

  function clearContactHighlights() {
    contactButtons.forEach(btn => btn.classList.remove('cta-highlight'));
    contactHighlightTimers.forEach(timer => clearTimeout(timer));
    contactHighlightTimers = [];
  }

  function flashContactButtonsInOrder() {
    if (!contactButtons.length) return;
    clearContactHighlights();

    const sequence = [
      { index: 0, delay: 0 },
      { index: 1, delay: 520 },
    ];

    sequence.forEach(({ index, delay }) => {
      const btn = contactButtons[index];
      if (!btn) return;

      const onTimer = setTimeout(() => {
        btn.classList.add('cta-highlight');
        const offTimer = setTimeout(() => {
          btn.classList.remove('cta-highlight');
        }, 900);
        contactHighlightTimers.push(offTimer);
      }, delay);

      contactHighlightTimers.push(onTimer);
    });
  }

  function goToContactAndHighlight() {
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Trigger after the smooth-scroll has had time to settle so the effect is visible.
    const highlightDelay = 650;
    const startTimer = setTimeout(() => {
      flashContactButtonsInOrder();
    }, highlightDelay);
    contactHighlightTimers.push(startTimer);

    pauseAndResume();
  }

  const heroContactBtn = document.querySelector('.hero-actions .btn-outline[href="#contact"]');
  if (heroContactBtn) {
    heroContactBtn.addEventListener('click', e => {
      e.preventDefault();
      goToContactAndHighlight();
    });
  }

  /* ── Build card elements ──
     NOTE: image-wrap comes AFTER cf-body in the DOM so it sits on
     the right in row-direction flex (text left, image right).       */
  const items = PROJECTS.map((p, i) => {
    const el = document.createElement('div');
    el.className = 'cf-item';
    el.style.width = CARD_W_SIDE + 'px';
    const mediaMarkup = p.image
      ? `<img src="${p.image}" alt="${p.title}" class="cf-image">`
      : `<div class="cf-img-placeholder" aria-label="${p.title} image">${p.imageEmoji || '🖼️'}</div>`;
    el.innerHTML = `
      <div class="cf-card">
        <div class="cf-body">
          <span class="card-badge">${p.badge}</span>
          <h3>${p.title}</h3>
          <p class="cf-desc">${p.desc}</p>
          <div class="card-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
          <a href="#contact" class="card-link">View Details →</a>
        </div>
        <div class="cf-image-wrap">
          ${mediaMarkup}
        </div>
      </div>`;
    const detailLink = el.querySelector('.card-link');
    if (detailLink) {
      detailLink.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        goToContactAndHighlight();
      });
    }
    el.addEventListener('click', () => { goTo(i); pauseAndResume(); });
    stage.appendChild(el);
    return el;
  });

  /* ── Dots ── */
  PROJECTS.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to project ${i + 1}`);
    d.addEventListener('click', () => { goTo(i); pauseAndResume(); });
    dots.appendChild(d);
  });

  /* ── Side-zone nav buttons ── */
  ['prev', 'next'].forEach(dir => {
    const btn = document.createElement('button');
    btn.className = `cf-nav cf-nav--${dir}`;
    btn.setAttribute('aria-label', dir === 'prev' ? 'Previous' : 'Next');
    btn.addEventListener('click', () => {
      goTo(active + (dir === 'next' ? 1 : -1));
      pauseAndResume();
    });
    stage.appendChild(btn);
  });

  /* ── State ── */
  let active    = 0;
  let autoTimer = null;
  let hoverPaused = false;

  /* ── Layout ── */
  function layout() {
    items.forEach((el, i) => {
      let rel = i - active;
      const half = items.length / 2;
      if (rel > half) rel -= items.length;
      if (rel < -half) rel += items.length;
      const abs = Math.abs(rel);
      let tx, ry, sc, op, zi, w;

      if (rel === 0) {
        tx = 0;  ry = 0;  sc = 1;  op = 1;  zi = 10;
        w = CARD_W_ACTIVE;
      } else if (abs === 1) {
        tx = rel > 0 ? SIDE_OFFSET  : -SIDE_OFFSET;
        ry = rel > 0 ? -SIDE_ROTEY  :  SIDE_ROTEY;
        sc = SIDE_SCALE;   op = SIDE_OPACITY;   zi = 5;
        w = CARD_W_SIDE;
      } else if (abs === 2) {
        tx = rel > 0 ? SIDE_OFFSET2 : -SIDE_OFFSET2;
        ry = rel > 0 ? -(SIDE_ROTEY * 1.15) : (SIDE_ROTEY * 1.15);
        sc = SIDE_SCALE2;  op = SIDE_OPACITY2;  zi = 2;
        w = CARD_W_SIDE;
      } else {
        tx = rel > 0 ? SIDE_OFFSET2 + 100 : -(SIDE_OFFSET2 + 100);
        ry = rel > 0 ? -55 : 55;
        sc = 0.55;  op = 0;  zi = 0;
        w = CARD_W_SIDE;
      }

      el.style.zIndex    = zi;
      el.style.opacity   = op;
      el.style.width     = w + 'px';
      el.style.transform = `translateX(${tx}px) rotateY(${ry}deg) scale(${sc})`;
      el.classList.toggle('cf-active', rel === 0);
    });

    dots.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === active);
    });
  }

  /* ── Navigate ── */
  function goTo(idx) {
    active = ((idx % items.length) + items.length) % items.length;
    layout();
  }

  /* ── Auto-scroll ── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => { if (!hoverPaused) goTo(active + 1); }, AUTO_DELAY);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function pauseAndResume() {
    // Keep auto-scroll continuous; pausing is controlled only by hover state.
  }

  stage.addEventListener('mouseenter', () => {
    hoverPaused = true;
    hint.classList.add('visible');
  });

  stage.addEventListener('mouseleave', () => {
    hoverPaused = false;
    hint.classList.remove('visible');
  });

  /* ── Touch / drag ── */
  let touchX = null;
  stage.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend',   e => {
    if (touchX === null) return;
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 35) { goTo(active + (dx > 0 ? 1 : -1)); pauseAndResume(); }
    touchX = null;
  });

  let mouseX = null;
  stage.addEventListener('mousedown', e => { mouseX = e.clientX; });
  window.addEventListener('mouseup',  e => {
    if (mouseX === null) return;
    const dx = mouseX - e.clientX;
    if (Math.abs(dx) > 40) { goTo(active + (dx > 0 ? 1 : -1)); pauseAndResume(); }
    mouseX = null;
  });

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { goTo(active + 1); pauseAndResume(); }
    if (e.key === 'ArrowLeft')  { goTo(active - 1); pauseAndResume(); }
  });

  /* ── Init ── */
  layout();
  startAuto();
  window.addEventListener('resize', layout);

})();
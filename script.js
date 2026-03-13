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
   Carousel
   ============================================================ */
const track         = document.getElementById('carouselTrack');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('carouselDots');

let currentIndex = 0;

function getVisibleCount() {
  const vw = window.innerWidth;
  if (vw >= 900) return 3;
  if (vw >= 600) return 2;
  return 1;
}

function totalSlides() { return track.children.length; }
function maxIndex()    { return Math.max(0, totalSlides() - getVisibleCount()); }

function getCardWidth() {
  const card = track.children[0];
  if (!card) return 0;
  const gap = parseFloat(window.getComputedStyle(track).gap) || 20;
  return card.offsetWidth + gap;
}

function goTo(index) {
  currentIndex = Math.max(0, Math.min(index, maxIndex()));
  track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex >= maxIndex();
  updateDots();
}

function buildDots() {
  dotsContainer.innerHTML = '';
  for (let i = 0; i < maxIndex() + 1; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    goTo(Math.min(currentIndex, maxIndex()));
    buildDots();
  }, 150);
});

let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 40) delta > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
});

/* ============================================================
   EST Clock + availability dot
   ============================================================ */
window.addEventListener('DOMContentLoaded', function () {
  const clockEl = document.getElementById('estClock');
  const dotEl   = document.getElementById('timeDot');
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

  const sections = ['about', 'experience', 'projects', 'skills', 'contact'];

  function update() {
    const navEl    = document.querySelector('.navbar');
    const navH     = navEl ? navEl.offsetHeight : 0;
    const scrollMid = window.scrollY + window.innerHeight / 3;

    // Find which section we're currently in
    let activeId = sections[0];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop - navH <= scrollMid) activeId = id;
    }

    // Find the matching nav link <a> element
    const activeLink = document.querySelector(`.nav-links a[href="#${activeId}"]`);
    if (!activeLink) return;

    const nav      = document.querySelector('.nav-links');
    const navRect  = navEl.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    // Position bar to span the width of the active link, aligned to navbar
    bar.style.left  = (linkRect.left - navRect.left) + 'px';
    bar.style.width = linkRect.width + 'px';
  }

  // Override bar to be position:absolute but left-controlled per link
  bar.style.transition = 'left 0.3s ease, width 0.3s ease';

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* — Three.js
   The helix axis runs top-left (far) → bottom-right (near).
   It spins around that axis like a barber pole.
   ============================================================ */
(function () {
  const mount = document.getElementById('dnaMount');
  if (!mount || typeof THREE === 'undefined') return;

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  /* ── Scene & Camera ── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
  // Camera looks straight down -Z. Helix will be tilted into position.
  camera.position.set(0, 0, 20);

  /* ── Lights ── */
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

  /* ── Materials ── */
  const matBlue   = new THREE.MeshLambertMaterial({ color: 0x2563eb });
  const matPurple = new THREE.MeshLambertMaterial({ color: 0x7c3aed });
  const matRung   = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

  /* ── Helix geometry ── */
  const turns  = 2.2;
  const radius = 2.2;
  const length = 28;
  const N      = 160;     // curve resolution

  const pts1 = [], pts2 = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * turns * Math.PI * 2;
    const y = (t - 0.5) * length;   // centred on origin
    pts1.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    pts2.push(new THREE.Vector3(Math.cos(a + Math.PI) * radius, y, Math.sin(a + Math.PI) * radius));
  }

  function makeTube(pts, mat) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo   = new THREE.TubeGeometry(curve, N, 0.13, 10, false);
    return new THREE.Mesh(geo, mat);
  }

  /* ── Outer group: positions & orients the whole helix in world space ──
       The helix axis is Y in local space.
       We want it to point from top-left-back to bottom-right-front.

       Step 1 — tilt the axis 45° around Z so it goes top-left → bottom-right
                in the screen XY plane.
       Step 2 — tilt 20° around the new X axis so the bottom-right end
                comes toward the camera (positive Z).
  ── */
  const outerGroup = new THREE.Group();
  outerGroup.rotation.z =  Math.PI / 4;   // 45° → diagonal in screen plane
  outerGroup.rotation.x = -0.35;          // lean bottom toward camera
  scene.add(outerGroup);

  /* ── Inner group: spins around the helix Y axis ── */
  const spinGroup = new THREE.Group();
  outerGroup.add(spinGroup);

  spinGroup.add(makeTube(pts1, matBlue));
  spinGroup.add(makeTube(pts2, matPurple));

  /* ── Base-pair rungs + endpoint spheres ── */
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
    // Orient cylinder from p1 to p2
    rung.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(p1, p2).normalize()
    );
    spinGroup.add(rung);
  }

  /* ── Animation loop ── */
  let tick = 0;
  function animate() {
    requestAnimationFrame(animate);
    tick += 0.006;
    // Spin around the local Y axis (= the helix axis)
    spinGroup.rotation.y = tick;
    spinGroup.rotation.x = Math.sin(tick / 2) * 0.1;  // subtle up/down bob
    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    const w = mount.clientWidth, h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
/* ============================================================
   Theme Toggle
   ============================================================ */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

// Persist preference
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

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ============================================================
   Carousel
   ============================================================ */
const track      = document.getElementById('carouselTrack');
const prevBtn    = document.getElementById('prevBtn');
const nextBtn    = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('carouselDots');

let currentIndex = 0;

function getVisibleCount() {
  const vw = window.innerWidth;
  if (vw >= 900) return 3;
  if (vw >= 600) return 2;
  return 1;
}

function totalSlides() {
  return track.children.length;
}

function maxIndex() {
  return Math.max(0, totalSlides() - getVisibleCount());
}

function getCardWidth() {
  const card = track.children[0];
  if (!card) return 0;
  const style = window.getComputedStyle(track);
  const gap = parseFloat(style.gap) || 20;
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
  const count = maxIndex() + 1;
  for (let i = 0; i < count; i++) {
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

// Re-init on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    goTo(Math.min(currentIndex, maxIndex()));
    buildDots();
  }, 150);
});

// Touch / swipe support
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 40) {
    delta > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  }
});

// Init
buildDots();
goTo(0);

'use strict';

/* ═══════════════════════════════════════════
   PAGE LOADER
   ═══════════════════════════════════════════ */
(function () {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  function hideLoader() {
    loader.classList.add('loaded');
  }

  // Hide after page loads
  window.addEventListener('load', () => {
    setTimeout(hideLoader, 400);
  });

  // Safety fallback — always hide after 3s no matter what
  setTimeout(hideLoader, 3000);
})();


/* ═══════════════════════════════════════════
   NAVBAR — Scroll Behavior & Active State
   ═══════════════════════════════════════════ */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link highlighting
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ═══════════════════════════════════════════
   MOBILE NAV — Hamburger Toggle
   ═══════════════════════════════════════════ */
(function () {
  const hamburger = document.getElementById('navHamburger');
  const navLinks  = document.getElementById('navLinks');
  const overlay   = document.getElementById('navOverlay');
  if (!hamburger || !navLinks) return;

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    overlay && overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    overlay && overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay && overlay.addEventListener('click', closeMenu);

  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
})();

/* ═══════════════════════════════════════════
   REVEAL ON SCROLL (Intersection Observer)
   ═══════════════════════════════════════════ */
(function () {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════
   COUNTER ANIMATION
   ═══════════════════════════════════════════ */
(function () {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = Math.min(now - start, duration);
      const progress = elapsed / duration;
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ═══════════════════════════════════════════
   HORIZONTAL SCROLL — Drag to Scroll
   ═══════════════════════════════════════════ */
(function () {
  const containers = document.querySelectorAll('.svc-scroll-container, .categories-scroll');

  containers.forEach(container => {
    let isDragging = false;
    let startX, scrollLeft;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      container.classList.add('grabbing');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      containers.forEach(c => c.classList.remove('grabbing'));
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    let touchStartX;
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].pageX;
      scrollLeft = container.scrollLeft;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      const walk = (touchStartX - e.touches[0].pageX) * 1.2;
      container.scrollLeft = scrollLeft + walk;
    }, { passive: true });
  });
})();

/* ═══════════════════════════════════════════
   GALLERY LIGHTBOX
   ═══════════════════════════════════════════ */
(function () {
  const lightbox = document.getElementById('lightbox');
  const lbClose  = document.getElementById('lightboxClose');
  const lbImg    = document.getElementById('lightboxImg');
  const lbPrev   = document.getElementById('lightboxPrev');
  const lbNext   = document.getElementById('lightboxNext');
  const lbThumbs = document.getElementById('lightboxThumbs');

  if (!lightbox) return;

  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentImages = [];
  let currentIndex  = 0;
  let currentAlt    = '';

  function showImage(index) {
    currentIndex = (index + currentImages.length) % currentImages.length;
    lbImg.src = currentImages[currentIndex];
    lbImg.alt = currentAlt;

    lbThumbs.querySelectorAll('img').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentIndex);
    });
  }

  function buildThumbs() {
    lbThumbs.innerHTML = '';
    const multiple = currentImages.length > 1;

    lbThumbs.classList.toggle('is-hidden', !multiple);
    lbPrev.classList.toggle('is-hidden', !multiple);
    lbNext.classList.toggle('is-hidden', !multiple);

    if (!multiple) return;

    currentImages.forEach((src, i) => {
      const thumb = document.createElement('img');
      thumb.src = src;
      thumb.alt = `${currentAlt} — photo ${i + 1}`;
      thumb.addEventListener('click', () => showImage(i));
      lbThumbs.appendChild(thumb);
    });
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');

      // Lift the clicked card forward, above its neighbours, before opening the lightbox
      galleryItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');

      const imagesAttr = item.dataset.images;
      currentImages = imagesAttr
        ? imagesAttr.split(',').map(src => src.trim()).filter(Boolean)
        : [img.src];
      currentAlt = img.alt;

      buildThumbs();
      showImage(0);

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  lbPrev && lbPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
  });

  lbNext && lbNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    galleryItems.forEach(i => i.classList.remove('is-active'));
  }

  lbClose && lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
})();

/* ═══════════════════════════════════════════
   PROCESS SECTION — Curved SVG connector on mobile
   ═══════════════════════════════════════════ */
(function () {
  const flow = document.querySelector('.process-flow');
  if (!flow) return;

  function buildCurve() {
    // Inject on phones and tablets where the process section uses a vertical timeline.
    const isMobile = window.innerWidth <= 1024;

    // Remove any existing SVG we injected
    const existing = flow.querySelector('.process-curve-svg');
    if (existing) existing.remove();

    if (!isMobile) return;

    const nodes = Array.from(flow.querySelectorAll('.process-node'));
    if (nodes.length < 2) return;

    const flowRect = flow.getBoundingClientRect();

    // Collect centre points of each node relative to .process-flow
    const pts = nodes.map(node => {
      const r = node.getBoundingClientRect();
      return {
        x: r.left - flowRect.left + r.width / 2,
        y: r.top  - flowRect.top  + r.height / 2
      };
    });

    // Build a smooth cubic-bezier S-curve through all points
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const midY = (p0.y + p1.y) / 2;
      // Alternate the S-curve direction left/right for a snake feel
      const offset = (i % 2 === 0) ? 38 : -38;
      d += ` C ${p0.x + offset} ${midY}, ${p1.x - offset} ${midY}, ${p1.x} ${p1.y}`;
    }

    const svgH = flowRect.height || 600;
    const svgW = flowRect.width  || 360;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'process-curve-svg');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    svg.setAttribute('aria-hidden', 'true');

    // Gradient definition
    svg.innerHTML = `
      <defs>
        <linearGradient id="mobileCurveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#87A878"/>
          <stop offset="50%"  stop-color="#F5C842"/>
          <stop offset="100%" stop-color="#1A3C2A"/>
        </linearGradient>
      </defs>
      <path d="${d}"/>
    `;

    // Insert as first child so it sits behind steps
    flow.insertBefore(svg, flow.firstChild);
  }

  // Run on load and on resize
  window.addEventListener('DOMContentLoaded', buildCurve);
  window.addEventListener('load', buildCurve);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildCurve, 150);
  }, { passive: true });

  // Also run immediately in case DOM is already ready
  if (document.readyState !== 'loading') buildCurve();
})();

/* ═══════════════════════════════════════════
   GO TO TOP BUTTON
   ═══════════════════════════════════════════ */
(function () {
  const btn = document.getElementById('goTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ═══════════════════════════════════════════
   PARALLAX — Hero image subtle parallax
   ═══════════════════════════════════════════ */
(function () {
  const heroImg = document.querySelector('.hero-main-img img');
  if (!heroImg) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroImg.style.transform = `translateY(${scrollY * 0.15}px)`;
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   TILT EFFECT — Service, Testimonial, and Hero Cards
   ═══════════════════════════════════════════ */
(function () {
  // Skip tilt entirely on touch devices — it causes border-radius flicker
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.svc-card, .testimonial-card, .hero-right-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const baseline = card.classList.contains('hero-right-card')
      ? { x: 1, y: -3 }
      : { x: 0, y: 0 };
    let frameId = null;
    let isHovered = false;
    // Cache rect on mouseenter — calling getBoundingClientRect() inside
    // mousemove forces a layout recalculation on every pointer event.
    let cachedRect = null;

    card.addEventListener('mouseenter', () => {
      isHovered = true;
      cachedRect = card.getBoundingClientRect();
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      cachedRect = null;
      if (frameId) cancelAnimationFrame(frameId);
      card.style.transform = '';
    });

    card.addEventListener('mousemove', (e) => {
      if (!isHovered || !cachedRect) return;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const x = e.clientX - cachedRect.left;
        const y = e.clientY - cachedRect.top;
        // Tighter tilt range (6deg max) to avoid clip-path issues
        const rotateX = ((y / cachedRect.height) - 0.5) * -6;
        const rotateY = ((x / cachedRect.width) - 0.5) * 6;
        card.style.transform = `translateY(-8px) perspective(900px) rotateX(${baseline.x + rotateX}deg) rotateY(${baseline.y + rotateY}deg)`;
      });
    });
  });
})();

/* ═══════════════════════════════════════════
   STAGGER ANIMATION on nav links (on page load)
   ═══════════════════════════════════════════ */
(function () {
  const links = document.querySelectorAll('.nav-links a');
  links.forEach((link, i) => {
    link.style.animationDelay = `${i * 80}ms`;
  });
})();

/* ═══════════════════════════════════════════
   SMOOTH SECTION HIGHLIGHT (subtle flash)
   ═══════════════════════════════════════════ */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();

/* ═══════════════════════════════════════════
   HERO — Automatic Slideshow (center panel)
   ═══════════════════════════════════════════ */
(function () {
  const slideshow = document.getElementById('heroSlideshow');
  if (!slideshow) return;

  const slides = Array.from(slideshow.querySelectorAll('.hero-slide'));
  const dots = Array.from(slideshow.querySelectorAll('.slide-dot'));
  const progressBar = document.getElementById('slideProgressBar');
  let current = 0;
  const INTERVAL = 2000;
  let autoTimer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('hero-slide--active', i === current));
    dots.forEach((d, i) => d.classList.toggle('slide-dot--active', i === current));
    // restart progress bar animation
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      progressBar.offsetWidth;
      progressBar.style.transition = `width ${INTERVAL}ms linear`;
      progressBar.style.width = '100%';
    }
  }

  function next() { showSlide(current + 1); }

  function startAuto() {
    stopAuto();
    // ensure progress bar is visible and animated
    if (progressBar) {
      progressBar.style.transition = `width ${INTERVAL}ms linear`;
      progressBar.style.width = '100%';
    }
    autoTimer = setInterval(next, INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    if (progressBar) { progressBar.style.transition = 'none'; progressBar.style.width = '0%'; }
  }

  // Dot controls
  dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); startAuto(); }));

  // Pause on hover
  slideshow.addEventListener('mouseenter', stopAuto);
  slideshow.addEventListener('mouseleave', startAuto);

  // Debounced resize — without debounce this fires hundreds of times per
  // resize drag, resetting the progress bar and restarting timers on each.
  let _resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      showSlide(current);
      if (autoTimer) startAuto();
    }, 150);
  });

  // Keyboard navigation
  slideshow.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { showSlide(current + 1); startAuto(); }
    if (e.key === 'ArrowLeft') { showSlide(current - 1); startAuto(); }
  });

  // Init
  showSlide(0);
  startAuto();

})();

/* ═══════════════════════════════════════════
   GET IN TOUCH — Quote Gallery Auto-rotate (1s per image)
   Background color shifts with each slide so the image
   blends into the section instead of sitting in a boxed card.
   ═══════════════════════════════════════════ */
(function () {
  const gallery = document.getElementById('quoteGallery');
  if (!gallery) return;

  const section = gallery.closest('.quote-section');
  const slides = Array.from(gallery.querySelectorAll('.quote-slide'));
  if (slides.length === 0) return;

  // One color per slide, in the same order as the images (one.webp → seven.webp)
  const bgColors = ['#fcebd7', '#fae8d5', '#fbe7d5', '#fae8d5', '#ffecd2', '#fee8cb', '#ffecd0'];

  let current = slides.findIndex((s) => s.classList.contains('is-active'));
  if (current === -1) current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    if (section && bgColors[current]) {
      section.style.backgroundColor = bgColors[current];
    }
  }

  showSlide(current);
  // Increased from 1000ms → 3500ms. Changing a section's backgroundColor
  // every second forces a full repaint of that region on every tick.
  setInterval(() => showSlide(current + 1), 3500);
})();

/* ═══════════════════════════════════════════
   MOBILE TOUCH RIPPLE — eco-pillars
   ═══════════════════════════════════════════ */
(function () {
  // Only run on touch devices
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const pillars = document.querySelectorAll('.eco-pillar');
  if (!pillars.length) return;

  pillars.forEach(pillar => {
    pillar.addEventListener('touchstart', () => {
      pillar.classList.add('touch-active');
    }, { passive: true });

    ['touchend', 'touchcancel'].forEach(evt => {
      pillar.addEventListener(evt, () => {
        setTimeout(() => pillar.classList.remove('touch-active'), 250);
      }, { passive: true });
    });
  });
})();

/* ═══════════════════════════════════════════
   MOBILE SCROLL POP — svc-card & eco-pillar
   ═══════════════════════════════════════════ */
(function () {
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const targets = document.querySelectorAll('.svc-card, .eco-pillar');
  if (!targets.length) return;

  // Set initial hidden state
  targets.forEach((el, i) => {
    el.classList.add('pop-hidden');
    // Stagger delay per card index
    el.style.transitionDelay = (i % 4) * 60 + 'ms';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Card in view — pop visible and stop observing.
        // The "else" branch (re-hiding on scroll away) was removed:
        // it triggered dozens of simultaneous box-shadow + transform
        // transitions while scrolling, causing significant mobile jank.
        entry.target.classList.remove('pop-hidden');
        entry.target.classList.add('pop-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -30px 0px'
  });

  targets.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════
   MOBILE/TABLET SCROLL POP — PLANT CARDS
   Smooth popup/popdown animation on scroll
   ═══════════════════════════════════════════ */
(function () {
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const plantCards = document.querySelectorAll('.plant-card');
  if (!plantCards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Card in viewport — pop up once, then stop watching.
        // Re-animating on scroll-away caused mass concurrent transitions
        // on the 50-card grid, which is the primary mobile lag source.
        entry.target.classList.add('scroll-pop');
        entry.target.classList.remove('scroll-past');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  plantCards.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════
   TOUCH PRESS FEEDBACK — svc-card & eco-pillar
   Fires on touchstart/end, works alongside scroll-pop
   ═══════════════════════════════════════════ */
(function () {
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  document.querySelectorAll('.svc-card, .eco-pillar').forEach(card => {
    let touchTimer = null;

    card.addEventListener('touchstart', () => {
      if (touchTimer) clearTimeout(touchTimer);
      card.classList.add('touch-active');
    }, { passive: true });

    ['touchend', 'touchcancel'].forEach(evt => {
      card.addEventListener(evt, () => {
        touchTimer = setTimeout(() => {
          card.classList.remove('touch-active');
        }, 200);
      }, { passive: true });
    });
  });
})();

/* ═══════════════════════════════════════════
   WAVE DASH ANIMATION — pause when off-screen
   The waveDash SVG animation runs on the desktop process section.
   Animating it while it's scrolled out of view burns GPU for nothing.
   ═══════════════════════════════════════════ */
(function () {
  const wavePath = document.querySelector('.process-wave path');
  if (!wavePath) return;
  const section = wavePath.closest('.work-flow-section');
  if (!section) return;
  const observer = new IntersectionObserver(([entry]) => {
    wavePath.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
  }, { threshold: 0.05 });

  observer.observe(section);
})();

console.log('%cGreenSpire Solutions', 'color: #1A3C2A; font-size: 1.2rem; font-weight: bold;');
console.log('%cNature meets design — Built with ❤️', 'color: #87A878; font-size: 0.9rem;');



(function(){

  if(window.innerWidth > 768) return;

  const gallery = document.querySelector('.gallery-fan');

  if(!gallery) return;

  setInterval(() => {

      const cards =
      gallery.querySelectorAll('.gallery-item');

      gallery.prepend(
        cards[cards.length - 1]
      );

  },3000);

})();
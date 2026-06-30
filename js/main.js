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

  window.addEventListener('load', () => {
    setTimeout(hideLoader, 400);
  });

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
   REVEAL ON SCROLL
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

  // Skip animation on low-end devices — just show final number instantly
  if (navigator.hardwareConcurrency <= 4) {
    counters.forEach(el => { el.textContent = el.dataset.target; });
    return;
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = Math.min(now - start, duration);
      const progress = elapsed / duration;
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
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
})();

/* ═══════════════════════════════════════════
   HORIZONTAL SCROLL —
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

    // Touch support — skip for categories-scroll, let it scroll natively
    if (container.classList.contains('categories-scroll')) return;

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
   CATEGORIES 
   ═══════════════════════════════════════════ */
(function () {
  const scroll   = document.getElementById('categoriesScroll');
  const prevBtn  = document.getElementById('catPrev');
  const nextBtn  = document.getElementById('catNext');
  if (!scroll || !prevBtn || !nextBtn) return;

  const MOBILE_BP = 640;

  function isMobile() { return window.innerWidth <= MOBILE_BP; }

  /* ── Scroll exactly one pill at a time ── */
  function getPillStep() {
    const firstPill = scroll.querySelector('.cat-pill');
    if (!firstPill) return 110; // fallback
    const style = window.getComputedStyle(scroll);
    const gap = parseFloat(style.gap) || parseFloat(style.columnGap) || 16;
    return firstPill.offsetWidth + gap;
  }

  prevBtn.addEventListener('click', () => {
    scroll.scrollBy({ left: -getPillStep(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    scroll.scrollBy({ left: getPillStep(), behavior: 'smooth' });
  });

  function updateBtns() {
    if (!isMobile()) return;
    const atStart = scroll.scrollLeft <= 10;
    const atEnd   = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 10;
    prevBtn.style.opacity = atStart ? '0.35' : '1';
    prevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
    nextBtn.style.opacity = atEnd ? '0.35' : '1';
    nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
  }

  scroll.addEventListener('scroll', updateBtns, { passive: true });
  window.addEventListener('resize', updateBtns, { passive: true });

  // Init
  updateBtns();
})();

/* ═══════════════════════════════════════════
   LIGHTBOX
   ═══════════════════════════════════════════ */
(function () {
  const lightbox = document.getElementById('lightbox');
  const lbClose  = document.getElementById('lightboxClose');
  const lbImg    = document.getElementById('lightboxImg');
  const lbPrev   = document.getElementById('lightboxPrev');
  const lbNext   = document.getElementById('lightboxNext');
  const lbThumbs = document.getElementById('lightboxThumbs');
  const lbCaption     = document.getElementById('lightboxCaption');
  const lbCaptionIcon = document.getElementById('lightboxCaptionIcon');
  const lbCaptionText = document.getElementById('lightboxCaptionText');

  if (!lightbox) return;

  const galleryItems = document.querySelectorAll('.gallery-item, .pm-item');
  let currentImages = [];
  let currentIndex  = 0;
  let currentAlt    = '';

  function setCaption(item) {
    if (!lbCaption) return;
    const tagEl = item.querySelector('.pm-tag');
    if (!tagEl) {
      lbCaption.classList.add('is-hidden');
      return;
    }
    const clone = tagEl.cloneNode(true);
    const iconEl = clone.querySelector('.material-symbols-outlined');
    let iconName = '';
    if (iconEl) {
      iconName = iconEl.textContent.trim();
      iconEl.remove();
    }
    lbCaptionIcon.textContent = iconName;
    lbCaptionText.textContent = clone.textContent.trim();
    lbCaption.classList.remove('is-hidden');
  }

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

      galleryItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');

      const imagesAttr = item.dataset.images;
      currentImages = imagesAttr
        ? imagesAttr.split(',').map(src => src.trim()).filter(Boolean)
        : [img.src];
      currentAlt = img.alt;

      setCaption(item);
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
   PROCESS SECTION —
   ═══════════════════════════════════════════ */
(function () {
  const flow = document.querySelector('.process-flow');
  if (!flow) return;

  function buildCurve() {
    const isMobile = window.innerWidth <= 1024;

    const existing = flow.querySelector('.process-curve-svg');
    if (existing) existing.remove();

    if (!isMobile) return;

    const nodes = Array.from(flow.querySelectorAll('.process-node'));
    if (nodes.length < 2) return;

    const flowRect = flow.getBoundingClientRect();

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
    flow.insertBefore(svg, flow.firstChild);
  }

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
   PARALLAX — 
   ═══════════════════════════════════════════ */
(function () {
  const heroImg = document.querySelector('.hero-main-img img');
  if (!heroImg) return;

  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  let rafId = null;
  window.addEventListener('scroll', () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      heroImg.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      rafId = null;
    });
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   TILT EFFECT —
   ═══════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.svc-card, .testimonial-card, .hero-right-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const baseline = card.classList.contains('hero-right-card')
      ? { x: 1, y: -3 }
      : { x: 0, y: 0 };
    let frameId = null;
    let isHovered = false;
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
        const rotateX = ((y / cachedRect.height) - 0.5) * -6;
        const rotateY = ((x / cachedRect.width) - 0.5) * 6;
        card.style.transform = `translateY(-8px) perspective(900px) rotateX(${baseline.x + rotateX}deg) rotateY(${baseline.y + rotateY}deg)`;
      });
    });
  });
})();

/* ═══════════════════════════════════════════
   STAGGER ANIMATION
   ═══════════════════════════════════════════ */
(function () {
  const links = document.querySelectorAll('.nav-links a');
  links.forEach((link, i) => {
    link.style.animationDelay = `${i * 80}ms`;
  });
})();

/* ═══════════════════════════════════════════
   SMOOTH SECTION HIGHLIGHT
   ═══════════════════════════════════════════ */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      // For #get-quote, scroll to the form card itself, not the section header
      const scrollTarget = (href === '#get-quote')
        ? document.getElementById('quoteFormWrap') || document.querySelector(href)
        : document.querySelector(href);

      if (scrollTarget) {
        e.preventDefault();
        const navbar = document.getElementById('navbar');
        const navH   = navbar  ? navbar.offsetHeight  : 72;
        const offset = navH + 16;
        const top    = scrollTarget.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        
        if (href === '#get-quote') {
          setTimeout(() => {
            const firstInput = scrollTarget.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus({ preventScroll: true });
          }, 600);
        }
      }
    });
  });
})();

(function () {
  const slideshow = document.getElementById('heroSlideshow');
  if (!slideshow) return;

  const slides = Array.from(slideshow.querySelectorAll('.hero-slide'));
  const dots = Array.from(slideshow.querySelectorAll('.slide-dot'));
  const progressBar = document.getElementById('slideProgressBar');
  let current = 0;
  const INTERVAL = 4000;
  let autoTimer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('hero-slide--active', i === current));
    dots.forEach((d, i) => d.classList.toggle('slide-dot--active', i === current));
    // restart progress bar animation (rAF avoids forcing a synchronous layout reflow)
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${INTERVAL}ms linear`;
        progressBar.style.width = '100%';
      });
    }
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    if (progressBar) { progressBar.style.transition = 'none'; progressBar.style.width = '0%'; }
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => showSlide(current + 1), INTERVAL);
    if (progressBar) {
      progressBar.style.transition = `width ${INTERVAL}ms linear`;
      progressBar.style.width = '100%';
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAuto();
    } else {
      startAuto();
    }
  });

  dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); startAuto(); }));

  slideshow.addEventListener('mouseenter', stopAuto);
  slideshow.addEventListener('mouseleave', startAuto);

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
    if (e.key === 'ArrowLeft')  { showSlide(current - 1); startAuto(); }
  });

  // Init
  showSlide(0);
  startAuto();
})();

/* ═══════════════════════════════════════════
   GET IN TOUCH 
   ═══════════════════════════════════════════ */
(function () {
  const gallery = document.getElementById('quoteGallery');
  if (!gallery) return;

  const section = gallery.closest('.quote-section');
  const slides = Array.from(gallery.querySelectorAll('.quote-slide'));
  if (slides.length === 0) return;

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
  setInterval(() => showSlide(current + 1), 3000);
})();

/* ═══════════════════════════════════════════
   MOBILE TOUCH RIPPLE
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
   MOBILE SCROLL POP
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
   MOBILE/TABLET SCROLL
   ═══════════════════════════════════════════ */
(function () {
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const plantCards = document.querySelectorAll('.plant-card');
  if (!plantCards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
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
   TOUCH PRESS FEEDBACK —
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
   WAVE DASH ANIMATION 
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

/* ═══════════════════════════════════════════
   MOBILE TESTIMONIALS SLIDER
   ═══════════════════════════════════════════ */
(function () {
  const section = document.querySelector('.testimonials-section');
  const track = document.querySelector('.testimonials-track');
  const dotsContainer = document.getElementById('testimonialsDots');
  const prevBtn = document.getElementById('testimonialsPrev');
  const nextBtn = document.getElementById('testimonialsNext');

  if (!track || !dotsContainer) return;

  function isMobile() { return window.matchMedia('(max-width: 750px)').matches; }

  let currentIndex = 0;
  let cards = [];
  let dots = [];
  let startX = 0, startY = 0, isDragging = false, dragDeltaX = 0;
  let cachedWrapperWidth = 0; // avoids reading offsetWidth (forced reflow) on every drag/slide

  function buildDots(count) {
    dotsContainer.innerHTML = '';
    dots = [];
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonials-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    }
  }

  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  function updateNavBtns() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
  }

  function getOffset(index) {
    if (!cards[index]) return 0;
    return index * cachedWrapperWidth;
  }

  function goTo(index, instant) {
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    track.style.transition = instant ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    track.style.transform = `translateX(-${getOffset(currentIndex)}px)`;
    updateDots();
    updateNavBtns();
  }

  function initSlider() {
    cards = Array.from(track.querySelectorAll('.testimonial-card:not([aria-hidden="true"])'));

    if (!isMobile()) {
      track.style.transform = '';
      track.style.transition = '';
      track.style.animation = '';
      if (section) section.classList.remove('slider-active');
      cards.forEach(c => {
        c.style.width = '';
        c.style.minWidth = '';
      });
      return;
    }
    track.style.animation = 'none';
    cachedWrapperWidth = track.parentElement.offsetWidth; // single read, reused by getOffset()
    const wrapperWidth = cachedWrapperWidth;
    cards.forEach(c => {
      c.style.width = (wrapperWidth - 32) + 'px';
      c.style.minWidth = (wrapperWidth - 32) + 'px';
    });

    buildDots(cards.length);

    if (section) section.classList.add('slider-active');

    currentIndex = 0;
    goTo(0, true);
  }

  function onDragStart(e) {
    if (!isMobile()) return;
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    dragDeltaX = 0;
    track.classList.add('is-dragging');
  }

  function onDragMove(e) {
    if (!isDragging || !isMobile()) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    dragDeltaX = x - startX;

    // Reject vertical scrolling drift
    if (Math.abs(y - startY) > Math.abs(dragDeltaX)) {
      isDragging = false;
      track.classList.remove('is-dragging');
      return;
    }
    if (e.cancelable) e.preventDefault();
    track.style.transition = 'none';
    track.style.transform = `translateX(-${getOffset(currentIndex) - dragDeltaX}px)`;
  }

  function onDragEnd() {
    if (!isDragging || !isMobile()) return;
    isDragging = false;
    track.classList.remove('is-dragging');
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    if (dragDeltaX < -50 && currentIndex < cards.length - 1) goTo(currentIndex + 1);
    else if (dragDeltaX > 50 && currentIndex > 0) goTo(currentIndex - 1);
    else goTo(currentIndex);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  track.addEventListener('touchstart', onDragStart, { passive: true });
  track.addEventListener('touchmove', onDragMove, { passive: false });
  track.addEventListener('touchend', onDragEnd);

  track.addEventListener('mousedown', (e) => {
    onDragStart(e);
    if (isDragging) {
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    }
  });

  initSlider();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initSlider, 150);
  });
})();

console.log('%cGreenSpire Solutions', 'color: #1A3C2A; font-size: 1.2rem; font-weight: bold;');
console.log('%cNature meets design — Built with ❤️', 'color: #87A878; font-size: 0.9rem;');
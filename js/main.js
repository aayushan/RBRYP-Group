/* ─────────────────────────────────────────────────────────────
   RBRYP GROUP — MAIN JAVASCRIPT
   ───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR ──────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');

  // Show mobile menu element (CSS hides it; JS manages open/close)
  if (mobileMenu) mobileMenu.style.display = 'block';
  if (mobileOverlay) mobileOverlay.style.display = 'block';

  // Detect if we're on the homepage (has .hero) vs inner page (has .page-hero)
  const isHomePage = !!document.querySelector('.hero');

  // Transparent → Scrolled (homepage only)
  const handleScroll = () => {
    if (isHomePage) {
      if (window.scrollY > 60) {
        navbar?.classList.add('scrolled');
        navbar?.classList.remove('transparent');
      } else {
        navbar?.classList.remove('scrolled');
        navbar?.classList.add('transparent');
      }
    }
    // Back-to-top button
    const btt = document.getElementById('backToTop');
    if (btt) {
      btt.classList.toggle('visible', window.scrollY > 500);
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Hamburger Toggle
  if (hamburger && mobileMenu && mobileOverlay) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      mobileOverlay.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileOverlay.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Mobile accordion sub-menus
  document.querySelectorAll('.mobile-accordion-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const target = document.getElementById(toggle.dataset.target);
      const isOpen = target?.style.maxHeight && target.style.maxHeight !== '0px';
      document.querySelectorAll('.mobile-sub-content').forEach(el => {
        el.style.maxHeight = '0px';
        el.style.overflow = 'hidden';
      });
      document.querySelectorAll('.mobile-accordion-toggle .acc-arrow').forEach(a => a.style.transform = '');
      if (!isOpen && target) {
        target.style.maxHeight = target.scrollHeight + 'px';
        target.style.overflow = 'hidden';
        const arrow = toggle.querySelector('.acc-arrow');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }
    });
  });

  /* ── SCROLL REVEAL ───────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── COUNTER ANIMATION ───────────────────────────────────── */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 2000;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (eased * target).toFixed(decimals);
      el.textContent = decimals > 0 ? value : Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
    };
    requestAnimationFrame(update);
  }

  /* ── BACK TO TOP ─────────────────────────────────────────── */
  const btt = document.getElementById('backToTop');
  if (btt) {
    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── ACTIVE NAV LINK ─────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === 'index.html' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* ── SMOOTH ANCHOR SCROLL ────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        hamburger?.classList.remove('open');
        mobileMenu?.classList.remove('open');
        mobileOverlay?.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  /* ── FORM SUBMIT ─────────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #226C3F, #2E8B57)';
        contactForm.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3500);
      }, 1500);
    });
  }

  /* ── HERO TYPED TEXT ─────────────────────────────────────── */
  const typedEl = document.getElementById('typedText');
  if (typedEl) {
    const phrases = ['Building Legacy', 'Creating Value', 'Empowering Communities', 'Shaping Futures'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedSpeed = 80;
    const deleteSpeed = 40;
    const pauseTime = 2200;

    function typeEffect() {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        charIndex--;
        typedEl.textContent = currentPhrase.substring(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeEffect, 400);
          return;
        }
        setTimeout(typeEffect, deleteSpeed);
      } else {
        charIndex++;
        typedEl.textContent = currentPhrase.substring(0, charIndex);
        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          setTimeout(typeEffect, pauseTime);
          return;
        }
        setTimeout(typeEffect, typedSpeed);
      }
    }
    setTimeout(typeEffect, 1200);
  }

  /* ── CARD TILT EFFECT (desktop only) ────────────────────── */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.biz-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-10px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

});

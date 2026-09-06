(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Footer year                                                        */
  /* ------------------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Scroll progress bar + nav background + timeline fill               */
  /* ------------------------------------------------------------------ */
  const progressFill = document.getElementById('progressFill');
  const nav = document.getElementById('nav');
  const timeline = document.querySelector('.timeline');
  const timelineFill = document.getElementById('timelineFill');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressFill) progressFill.style.width = pct + '%';

    if (nav) nav.classList.toggle('scrolled', scrollTop > 40);

    if (timeline && timelineFill) {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const total = rect.height + vh * 0.3;
      const progressed = start - rect.top;
      const ratio = Math.min(Math.max(progressed / total, 0), 1);
      timelineFill.style.height = (ratio * 100) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  /* Cursor glow (desktop only)                                         */
  /* ------------------------------------------------------------------ */
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && matchMedia('(hover: hover)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });
    function animateCursor() {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      cursorGlow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    }
    if (!prefersReducedMotion) requestAnimationFrame(animateCursor);
  }

  /* ------------------------------------------------------------------ */
  /* Mobile nav toggle                                                   */
  /* ------------------------------------------------------------------ */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Active section highlight in nav                                     */
  /* ------------------------------------------------------------------ */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinkEls.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ------------------------------------------------------------------ */
  /* Reveal-on-scroll (also triggers skill bars + counters)              */
  /* ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('about__stats')) {
            animateCounters(entry.target);
          }
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  const skillCards = document.querySelectorAll('.skill-card');
  const skillObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  skillCards.forEach((el) => skillObserver.observe(el));

  /* ------------------------------------------------------------------ */
  /* Animated counters                                                   */
  /* ------------------------------------------------------------------ */
  function animateCounters(container) {
    const nums = container.querySelectorAll('.stat__num');
    nums.forEach((num) => {
      const target = parseInt(num.dataset.count, 10) || 0;
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        num.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      if (prefersReducedMotion) {
        num.textContent = target;
      } else {
        requestAnimationFrame(tick);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero typewriter                                                     */
  /* ------------------------------------------------------------------ */
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const words = ['delightful interfaces.', 'resilient systems.', 'fast, accessible apps.', 'things that matter.'];
    if (prefersReducedMotion) {
      typewriterEl.textContent = words[0];
    } else {
      let wordIndex = 0, charIndex = 0, deleting = false;

      function type() {
        const current = words[wordIndex];
        if (!deleting) {
          charIndex++;
          typewriterEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            setTimeout(type, 1800);
            return;
          }
        } else {
          charIndex--;
          typewriterEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
          }
        }
        setTimeout(type, deleting ? 35 : 65);
      }
      type();
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3D tilt card (about section)                                        */
  /* ------------------------------------------------------------------ */
  const card3d = document.getElementById('card3d');
  if (card3d && matchMedia('(hover: hover)').matches && !prefersReducedMotion) {
    const inner = card3d.querySelector('.card-3d__inner');
    card3d.addEventListener('mousemove', (e) => {
      const rect = card3d.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(10px)`;
    });
    card3d.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
    });
  }

  /* ------------------------------------------------------------------ */
  /* Project filters                                                     */
  /* ------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectEls = document.querySelectorAll('.project');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projectEls.forEach((proj) => {
        const match = filter === 'all' || proj.dataset.cat === filter;
        proj.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Contact form (static / no backend — simulated submit)               */
  /* ------------------------------------------------------------------ */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const submitLabel = document.getElementById('submitLabel');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      submitLabel.textContent = 'Sending...';
      setTimeout(() => {
        submitLabel.textContent = 'Send message';
        formNote.textContent = "Thanks for reaching out! I'll get back to you soon.";
        form.reset();
        setTimeout(() => { formNote.textContent = ''; }, 5000);
      }, 900);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Copy email to clipboard (mailto: is a no-op with no mail client)    */
  /* ------------------------------------------------------------------ */
  const emailLink = document.getElementById('emailLink');
  const emailCopied = document.getElementById('emailCopied');
  if (emailLink && emailCopied) {
    let copiedTimeout;
    emailLink.addEventListener('click', () => {
      const email = emailLink.getAttribute('href').replace('mailto:', '');
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(email).then(() => {
        emailCopied.textContent = 'Copied to clipboard';
        emailCopied.classList.add('is-visible');
        clearTimeout(copiedTimeout);
        copiedTimeout = setTimeout(() => emailCopied.classList.remove('is-visible'), 2200);
      }).catch(() => {});
    });
  }

  /* ------------------------------------------------------------------ */
  /* Back to top                                                         */
  /* ------------------------------------------------------------------ */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

})();

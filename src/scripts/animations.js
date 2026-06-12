import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  lerp: 0.08,
  smoothWheel: true,
  smoothTouch: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

ScrollTrigger.normalizeScroll(true);

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function initHero() {
  const section = document.querySelector('[data-animate="hero"]');
  if (!section) return;

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('[data-hero-title]', {
    y: 80,
    opacity: 0,
    duration: 1.4,
  })
    .from('[data-hero-sub]', { y: 40, opacity: 0, duration: 1.0 }, '-=0.6')
    .from('[data-hero-cta]', { y: 30, opacity: 0, duration: 0.8 }, '-=0.4');

  gsap.fromTo(
    section.querySelectorAll('.hero-grid-line'),
    { scaleY: 0, scaleX: 0, transformOrigin: 'center center' },
    {
      scaleY: 1,
      scaleX: 1,
      duration: 2,
      ease: 'power3.out',
      stagger: 0.02,
      delay: 0.3,
    }
  );

  section.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = section.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    const cards = section.querySelectorAll('.hero-dashboard-card');
    cards.forEach((card, i) => {
      const depth = 1 + i * 0.4;
      gsap.to(card, {
        x: x * 30 * (1 / depth),
        y: y * 30 * (1 / depth),
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  });

  gsap.to(section.querySelectorAll('.hero-grid-line:nth-child(odd)'), {
    opacity: 0.03,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    stagger: { each: 0.3, repeat: -1 },
  });
}

function initBentoCards() {
  const cards = document.querySelectorAll('[data-animate="solutions"] .bento-card');
  if (!cards.length) return;

  gsap.from('[data-animate="solutions"] .section-title-block', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '[data-animate="solutions"]',
      start: 'top 82%',
      once: true,
    },
  });

  gsap.from(cards, {
    y: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '[data-animate="solutions"]',
      start: 'top 75%',
      once: true,
    },
  });

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateX: -y * 6,
        rotateY: x * 6,
        duration: 0.6,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    });
  });
}

function initWhyUroo() {
  const section = document.querySelector('[data-animate="why-uroo"]');
  if (!section) return;

  gsap.from('[data-animate="why-uroo"] .section-title-block', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 82%',
      once: true,
    },
  });

  const items = section.querySelectorAll('.review-card');
  gsap.from(items, {
    y: 50,
    opacity: 0,
    scale: 0.95,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      once: true,
    },
  });

  gsap.to('[data-animate="why-uroo"] .cloud-blob-1', {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });

  gsap.to('[data-animate="why-uroo"] .cloud-blob-2', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });
}



function initPortfolio() {
  const section = document.querySelector('[data-animate="portfolio"]');
  const track = section?.querySelector('[data-scroll-track]');
  const container = section?.querySelector('[data-scroll-container]');
  if (!section || !track || !container) return;

  gsap.from('[data-animate="portfolio"] .section-title-block', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 82%',
      once: true,
    },
  });

  const cards = track.querySelectorAll('.horizontal-scroll-card');
  if (!cards.length) return;

  const gap = 24;
  const totalCardsWidth = Array.from(cards).reduce((sum, c) => sum + c.offsetWidth, 0) + (cards.length - 1) * gap;
  const viewportWidth = window.innerWidth;
  const scrollDistance = Math.max(totalCardsWidth - viewportWidth + 48, 0);

  gsap.to(track, {
    x: () => -scrollDistance,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: () => `+=${scrollDistance + container.offsetHeight - window.innerHeight}`,
      pin: true,
      pinSpacing: true,
      scrub: 1.2,
      invalidateOnRefresh: true,
    },
  });

  const progressFill = section.querySelector('.scroll-progress-fill');
  const progressLabel = section.querySelector('.scroll-progress-label');
  if (progressFill || progressLabel) {
    ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: () => `+=${scrollDistance + container.offsetHeight - window.innerHeight}`,
      scrub: 1,
      onUpdate: (self) => {
        const pct = Math.round(self.progress * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressLabel) progressLabel.textContent = `${pct}%`;
      },
    });
  }

  gsap.from(cards, {
    opacity: 0,
    scale: 0.9,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: container,
      start: 'top 80%',
      once: true,
    },
  });
}

function initProcess() {
  const section = document.querySelector('[data-animate="process"]');
  if (!section) return;

  gsap.from('[data-animate="process"] .section-title-block', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 82%',
      once: true,
    },
  });

  const steps = section.querySelectorAll('.process-step');
  const dots = section.querySelectorAll('.process-dot');
  const lineFill = section.querySelector('.process-line-fill');
  const timeline = section.querySelector('.process-timeline');
  if (!timeline || !steps.length || !lineFill) return;

  gsap.set(steps, { opacity: 0, y: 40 });

  gsap.to(steps, {
    y: 0,
    opacity: 1,
    duration: 0.7,
    stagger: 0.18,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: timeline,
      start: 'top 75%',
      end: `+=${steps.length * 200}`,
      toggleActions: 'play none none none',
    },
  });

  gsap.to(lineFill, {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: timeline,
      start: 'top 75%',
      end: 'bottom 25%',
      scrub: 1.2,
    },
  });

  const stepHeight = 100 / steps.length;

  steps.forEach((step, i) => {
    const startPct = i * stepHeight;
    const endPct = (i + 1) * stepHeight;

    ScrollTrigger.create({
      trigger: timeline,
      start: `top ${75 - startPct}%`,
      end: `top ${75 - endPct + 5}%`,
      onEnter: () => {
        steps.forEach((s, j) => {
          if (j <= i) {
            s.classList.add('step-visible');
            s.classList.remove('step-inactive');
          } else {
            s.classList.remove('step-visible');
            s.classList.add('step-inactive');
          }
        });
        dots.forEach((d, j) => {
          if (j < i) {
            gsap.to(d, { scale: 1, opacity: 1, backgroundColor: '#ffffff', duration: 0.4, ease: 'power2.out' });
          } else if (j === i) {
            gsap.to(d, { scale: 1.6, opacity: 1, backgroundColor: '#ffffff', duration: 0.5, ease: 'back.out(2)', boxShadow: '0 0 20px rgba(255,255,255,0.25)' });
          } else {
            gsap.to(d, { scale: 1, opacity: 0.4, backgroundColor: 'rgba(153,153,153,0.4)', duration: 0.4, ease: 'power2.out', boxShadow: 'none' });
          }
        });
      },
      onEnterBack: () => {
        steps.forEach((s, j) => {
          if (j <= i) {
            s.classList.add('step-visible');
            s.classList.remove('step-inactive');
          } else {
            s.classList.remove('step-visible');
            s.classList.add('step-inactive');
          }
        });
        dots.forEach((d, j) => {
          if (j < i) {
            gsap.to(d, { scale: 1, opacity: 1, backgroundColor: '#ffffff', duration: 0.4, ease: 'power2.out' });
          } else if (j === i) {
            gsap.to(d, { scale: 1.6, opacity: 1, backgroundColor: '#ffffff', duration: 0.5, ease: 'back.out(2)', boxShadow: '0 0 20px rgba(255,255,255,0.25)' });
          } else {
            gsap.to(d, { scale: 1, opacity: 0.4, backgroundColor: 'rgba(153,153,153,0.4)', duration: 0.4, ease: 'power2.out', boxShadow: 'none' });
          }
        });
      },
    });
  });
}

function initTestimonials() {
  const section = document.querySelector('[data-animate="testimonials"]');
  if (!section) return;

  gsap.from('[data-animate="testimonials"] .section-title-block', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 82%',
      once: true,
    },
  });

  const cards = section.querySelectorAll('.testimonial-card');
  cards.forEach((card, i) => {
    const dir = i === 0 ? -1 : i === 2 ? 1 : 0;
    gsap.from(card, {
      x: dir * 60,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        once: true,
      },
    });
  });
}

function initFaq() {
  const section = document.querySelector('[data-animate="faq"]');
  if (!section) return;

  gsap.from('[data-animate="faq"] .section-title-block', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 82%',
      once: true,
    },
  });

  const items = section.querySelectorAll('.review-card');
  gsap.from(items, {
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      once: true,
    },
  });
}

function initCta() {
  const section = document.querySelector('[data-animate="cta"]');
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      once: true,
    },
    defaults: { ease: 'power3.out' },
  });

  tl.from('[data-animate="cta"] .section-title-label', { y: 30, opacity: 0, duration: 0.7 })
    .from('[data-animate="cta"] h2', { y: 40, opacity: 0, scale: 0.97, duration: 0.9 }, '-=0.4')
    .from('[data-animate="cta"] p', { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
    .from('[data-animate="cta"] .magnetic-btn', { y: 30, opacity: 0, scale: 0.95, duration: 0.8 }, '-=0.3');
}

function initMagneticButton() {
  const btn = document.querySelector('.magnetic-btn');
  if (!btn) return;

  const inner = btn.querySelector('.magnetic-btn-inner');

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(btn, {
      x: x * 16,
      y: y * 16,
      duration: 0.6,
      ease: 'power2.out',
    });

    if (inner) {
      gsap.to(inner, {
        x: x * 8,
        y: y * 8,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
    if (inner) {
      gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
    }
  });
}

function initFooter() {
  const s = '[data-animate="footer"]';
  if (!document.querySelector(s)) return;

  gsap.from(`${s} .grid > div`, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: s,
      start: 'top 85%',
      once: true,
    },
  });
}

function initFaqAccordion() {
  document.querySelectorAll('.faq-header').forEach((header) => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const icon = header.querySelector('svg');
      const isOpen = body.classList.contains('faq-open');

      document.querySelectorAll('.faq-body').forEach((b) => {
        if (b !== body && b.classList.contains('faq-open')) {
          gsap.to(b, {
            maxHeight: 0,
            duration: 0.35,
            ease: 'power3.out',
            onComplete: () => b.classList.remove('faq-open'),
          });
          const otherIcon = b.previousElementSibling?.querySelector('svg');
          if (otherIcon) {
            gsap.to(otherIcon, { rotation: 0, duration: 0.3 });
          }
        }
      });

      if (!isOpen) {
        gsap.to(body, {
          maxHeight: body.scrollHeight,
          duration: 0.4,
          ease: 'power4.out',
          onComplete: () => body.classList.add('faq-open'),
        });
        if (icon) gsap.to(icon, { rotation: 180, duration: 0.35, ease: 'power3.out' });
      } else {
        gsap.to(body, {
          maxHeight: 0,
          duration: 0.35,
          ease: 'power3.out',
          onComplete: () => body.classList.remove('faq-open'),
        });
        if (icon) gsap.to(icon, { rotation: 0, duration: 0.3 });
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initBentoCards();
    initWhyUroo();
    initPortfolio();
    initProcess();
    initTestimonials();
    initFaq();
    initCta();
    initMagneticButton();
    initFooter();
    initFaqAccordion();
  });
} else {
  initHero();
  initBentoCards();
  initWhyUroo();
  initPortfolio();
  initProcess();
  initTestimonials();
  initFaq();
  initCta();
  initMagneticButton();
  initFooter();
  initFaqAccordion();
}

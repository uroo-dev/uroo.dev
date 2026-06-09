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

function animateHero() {
  const hero = document.querySelector('[data-animate="hero"]');
  if (!hero) return;

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('[data-animate="hero"] h1', {
    y: 100,
    opacity: 0,
    duration: 1.4,
  })
    .from(
      '[data-animate="hero"] p',
      { y: 50, opacity: 0, duration: 1.2 },
      '-=0.7'
    )
    .from(
      '[data-animate="hero"] .pill-button',
      { y: 30, opacity: 0, duration: 0.9 },
      '-=0.5'
    );

  gsap.to('[data-animate="hero"] .cloud-blob-1', {
    yPercent: -25,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-animate="hero"]',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
  gsap.to('[data-animate="hero"] .cloud-blob-2', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-animate="hero"]',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
}

function sectionFadeUp(selector, childSelector, options = {}) {
  const el = document.querySelector(selector);
  if (!el) return;
  const {
    y = 50,
    opacity = 0,
    duration = 0.8,
    stagger = 0.15,
    start = 'top 80%',
    ease = 'power3.out',
  } = options;

  if (childSelector) {
    gsap.from(`${selector} ${childSelector}`, {
      y,
      opacity,
      duration,
      stagger,
      ease,
      scrollTrigger: {
        trigger: selector,
        start,
        once: true,
      },
    });
  }
}

function animateSectionTitle(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  gsap.from(`${selector} .section-title-block`, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: selector,
      start: 'top 82%',
      once: true,
    },
  });
}

function animateSolutions() {
  const s = '[data-animate="solutions"]';
  if (!document.querySelector(s)) return;
  animateSectionTitle(s);
  sectionFadeUp(s, '.showcase-card', { y: 60, stagger: 0.12, start: 'top 75%' });
}

function animateWhyUroo() {
  const s = '[data-animate="why-uroo"]';
  if (!document.querySelector(s)) return;
  animateSectionTitle(s);
  sectionFadeUp(s, '.review-card', { y: 60, stagger: 0.12, start: 'top 75%' });
}

function animateTrusted() {
  const s = '[data-animate="trusted"]';
  if (!document.querySelector(s)) return;
  sectionFadeUp(s, 'p', { y: 40, stagger: 0, start: 'top 85%' });
  sectionFadeUp(s, 'span', { y: 30, stagger: 0.08, start: 'top 80%' });
}

function animatePortfolio() {
  const s = '[data-animate="portfolio"]';
  if (!document.querySelector(s)) return;
  animateSectionTitle(s);
  const cards = gsap.utils.toArray(`${s} .showcase-card`);
  if (cards.length) {
    gsap.from(cards, {
      y: 40,
      opacity: 0,
      scale: 0.93,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: s,
        start: 'top 75%',
        once: true,
      },
    });
  }
}

function animateProcess() {
  const s = '[data-animate="process"]';
  if (!document.querySelector(s)) return;
  animateSectionTitle(s);

  const steps = gsap.utils.toArray(`${s} .process-step`);
  const lineFill = document.querySelector(`${s} .process-line-fill`);
  const dots = gsap.utils.toArray(`${s} .process-dot`);

  if (lineFill && steps.length) {
    ScrollTrigger.create({
      trigger: `${s} .process-timeline`,
      start: 'top 75%',
      end: 'bottom 25%',
      onUpdate: (self) => {
        const progress = self.progress;
        lineFill.style.height = `${progress * 100}%`;
        const activeIndex = Math.min(Math.floor(progress * steps.length), steps.length - 1);
        dots.forEach((dot, i) => {
          if (i <= activeIndex) {
            dot.style.backgroundColor = '#ffffff';
          } else {
            dot.style.backgroundColor = 'rgba(153,153,153,0.4)';
          }
        });
      },
    });
  }

  if (steps.length) {
    gsap.from(steps, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: s,
        start: 'top 72%',
        once: true,
      },
    });

    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        end: 'top 35%',
        onEnter: () => step.classList.add('step-visible'),
        onLeave: () => step.classList.remove('step-visible'),
        onEnterBack: () => step.classList.add('step-visible'),
        onLeaveBack: () => step.classList.remove('step-visible'),
      });
    });
  }
}

function animateTestimonials() {
  const s = '[data-animate="testimonials"]';
  if (!document.querySelector(s)) return;
  animateSectionTitle(s);

  const cards = gsap.utils.toArray(`${s} .review-card`);
  cards.forEach((card, i) => {
    const x = i === 0 ? -50 : i === 2 ? 50 : 0;
    gsap.from(card, {
      x,
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

function animateFaq() {
  const s = '[data-animate="faq"]';
  if (!document.querySelector(s)) return;
  animateSectionTitle(s);
  sectionFadeUp(s, '.review-card', { y: 30, stagger: 0.1, start: 'top 75%' });
}

function animateCta() {
  const s = '[data-animate="cta"]';
  if (!document.querySelector(s)) return;

  gsap.from(`${s} .section-title-label`, {
    y: 30,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: s, start: 'top 82%', once: true },
  });
  gsap.from(`${s} h2`, {
    y: 40,
    opacity: 0,
    scale: 0.97,
    duration: 0.9,
    ease: 'power4.out',
    scrollTrigger: { trigger: s, start: 'top 78%', once: true },
  });
  gsap.from(`${s} p`, {
    y: 30,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: s, start: 'top 74%', once: true },
  });
  gsap.from(`${s} .pill-button`, {
    y: 30,
    opacity: 0,
    scale: 0.95,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: { trigger: s, start: 'top 70%', once: true },
  });
}

function animateFooter() {
  const s = '[data-animate="footer"]';
  if (!document.querySelector(s)) return;
  sectionFadeUp(s, '.grid > div', { y: 50, stagger: 0.12, start: 'top 85%' });
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
    animateHero();
    animateTrusted();
    animateSolutions();
    animateWhyUroo();
    animatePortfolio();
    animateProcess();
    animateTestimonials();
    animateFaq();
    animateCta();
    animateFooter();
    initFaqAccordion();
  });
} else {
  animateHero();
  animateTrusted();
  animateSolutions();
  animateWhyUroo();
  animatePortfolio();
  animateProcess();
  animateTestimonials();
  animateFaq();
  animateCta();
  animateFooter();
  initFaqAccordion();
}

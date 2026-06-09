import { useEffect, useRef } from 'react';

export default function ScrollHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (titleRef.current) {
        tl.fromTo(titleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 });
      }
      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6');
      }
      if (ctaRef.current) {
        tl.fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4');
      }

      if (sectionRef.current) {
        gsap.to(sectionRef.current, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
          scale: 0.95,
          opacity: 0.6,
        });
      }

      if (gradientRef.current) {
        gsap.to(gradientRef.current, {
          scrollTrigger: {
            trigger: gradientRef.current.parentElement,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
          scale: 1.2,
          opacity: 0.5,
        });
      }
    };

    init();
  }, []);

  return (
    <section ref={sectionRef} class="relative min-h-screen flex items-center overflow-hidden bg-obsidian">
      <div class="absolute inset-0 bg-obsidian" />
      <div
        ref={gradientRef}
        class="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.15) 0%, rgba(255,200,150,0.1) 20%, rgba(200,100,80,0.08) 35%, rgba(100,80,150,0.06) 50%, rgba(0,0,0,0) 70%)',
        }}
      />

      <div class="relative z-10 page-container pt-32 pb-20 w-full">
        <div class="max-w-3xl mx-auto text-center">
          <p class="font-space-mono text-sm text-fog mb-8 tracking-wider uppercase">
            Modern Software House
          </p>

          <h1
            ref={titleRef}
            class="heading-serif-light text-display md:text-display-xl leading-display-xl mb-8"
          >
            Custom Software<br />That Drives Growth
          </h1>

          <p
            ref={subtitleRef}
            class="font-switzer text-body-lg text-fog max-w-xl mx-auto mb-10 leading-body-lg"
          >
            We help businesses and startups solve operational and digital challenges through modern, scalable software solutions.
          </p>

          <div ref={ctaRef} class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" class="btn-primary-inverse font-switzer">
              Get Free Consultation
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
            <a href="/portfolio" class="btn-ghost font-switzer">
              Explore Solutions
            </a>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-paper-white to-transparent pointer-events-none" />
    </section>
  );
}

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function LenisProvider({ children }: Props) {
  const lenisRef = useRef<ReturnType<typeof import('lenis').default> | null>(null);

  useEffect(() => {
    let lenis: ReturnType<typeof import('lenis').default>;

    const init = async () => {
      const LenisModule = await import('lenis');
      const Lenis = LenisModule.default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      lenis.on('scroll', ScrollTrigger.update);
    };

    init();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

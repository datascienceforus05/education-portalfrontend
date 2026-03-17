import { useEffect } from 'react';
import Lenis from 'lenis';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP with Lenis - Using GSAP ticker as the single source of RAF
    const update = (time) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <div id="smooth-wrapper" style={{ position: 'relative' }}>
      {children}
    </div>
  );
}

SmoothScroll.propTypes = {
  children: PropTypes.node.isRequired,
};

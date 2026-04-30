import { useEffect, useState } from 'react';

const DEFAULT_BREAKPOINT = 768;

export function isMobileViewport(width: number, breakpoint = DEFAULT_BREAKPOINT) {
  return width < breakpoint;
}

export function useIsMobile(breakpoint = DEFAULT_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return isMobileViewport(window.innerWidth, breakpoint);
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setIsMobile(isMobileViewport(window.innerWidth, breakpoint));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

import { useState, useEffect } from 'react';

/**
 * A custom hook to determine if the current viewport is mobile-sized.
 * @param {number} breakpoint - The width in pixels to consider the mobile breakpoint. Defaults to 768px.
 * @returns {boolean} - True if the window width is less than the breakpoint, false otherwise.
 */
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
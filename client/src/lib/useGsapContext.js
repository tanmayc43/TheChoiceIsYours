import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * useGsapContext - Safely use GSAP in React components
 * @param {Function} callback - Animation setup function (receives context)
 * @param {Array} deps - Dependency array for re-running the animation
 * @returns {React.MutableRefObject}
 */
export function useGsapContext(callback, deps = []) {
  const scope = useRef();

  useLayoutEffect(() => {
    let ctx;
    if (scope.current) {
      ctx = gsap.context(callback, scope);
    }
    return () => ctx && ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
} 
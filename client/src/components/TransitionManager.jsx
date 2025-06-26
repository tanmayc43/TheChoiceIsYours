import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hyperspeed from './Hyperspeed';

const TransitionContext = createContext();

export function useTransition() {
  return useContext(TransitionContext);
}

export function TransitionManager({ children }) {
  const navigate = useNavigate();
  const [transitionState, setTransitionState] = useState({
    active: false,
    color: null,
    targetPath: null,
    phase: null,
    origin: { x: 0, y: 0 }
  });
  const isTransitioningRef = useRef(false);
  const transitionTimeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Main trigger function
  const triggerTransition = useCallback((color, targetPath, origin = { x: window.innerWidth/2, y: window.innerHeight/2 }) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Update state atomically
    setTransitionState({
      active: true,
      color,
      targetPath,
      phase: 'zoom',
      origin
    });

    // Use a single timeout chain to prevent multiple state updates
    transitionTimeoutRef.current = setTimeout(() => {
      setTransitionState(prev => ({ ...prev, phase: 'hyperspeed' }));
      transitionTimeoutRef.current = setTimeout(() => {
        setTransitionState(prev => ({ ...prev, phase: 'circle-grow' }));
        transitionTimeoutRef.current = setTimeout(() => {
          setTransitionState(prev => ({ ...prev, phase: 'circle-shrink' }));
          setTimeout(() => {
            navigate(targetPath);
            setTimeout(() => {
              setTransitionState({ active: false, color: null, targetPath: null, phase: null, origin: { x: 0, y: 0 } });
              isTransitioningRef.current = false;
            }, 500); // <-- This should match your shrink animation duration
          }, 500); // <-- This should match your shrink animation duration
        }, 1000);
      }, 2500);
    }, 1000);
  }, [navigate]);

  // Overlay rendering
  const { active, color, phase, origin } = transitionState;
  const circleColor = color === 'red' ? '#FF0000' : '#0066FF';
  const smoothTransition = { duration: 0.6, ease: [0.4, 0, 0.2, 1] };

  return (
    <TransitionContext.Provider value={{ triggerTransition, isTransitioning: active }}>
      {children}
      <AnimatePresence mode="wait">
        {active && (
          <>
            {/* Zoom Circle Effect */}
            {phase === 'zoom' && (
              <motion.div
                key="zoom-effect"
                className="fixed z-[1000] rounded-full pointer-events-none"
                style={{
                  left: origin.x,
                  top: origin.y,
                  transform: 'translate(-50%, -50%)',
                  background: circleColor,
                  boxShadow: `0 0 50px ${circleColor}80`
                }}
                initial={{ width: 0, height: 0, opacity: 0.8 }}
                animate={{ width: '200vw', height: '200vw', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            )}
            {/* Hyperspeed Effect */}
            {phase === 'hyperspeed' && (
              <motion.div
                key="hyperspeed"
                className="fixed inset-0 z-[1001] bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Hyperspeed effectOptions={{
                  onSpeedUp: () => {},
                  onSlowDown: () => {},
                  distortion: 'turbulentDistortion',
                  length: 400,
                  roadWidth: 10,
                  islandWidth: 2,
                  lanesPerRoad: 4,
                  fov: 90,
                  fovSpeedUp: 150,
                  speedUp: 2,
                  carLightsFade: 0.4,
                  totalSideLightSticks: 20,
                  lightPairsPerRoadWay: 40,
                  shoulderLinesWidthPercentage: 0.05,
                  brokenLinesWidthPercentage: 0.1,
                  brokenLinesLengthPercentage: 0.5,
                  lightStickWidth: [0.12, 0.5],
                  lightStickHeight: [1.3, 1.7],
                  movingAwaySpeed: [60, 80],
                  movingCloserSpeed: [-120, -160],
                  carLightsLength: [400 * 0.03, 400 * 0.2],
                  carLightsRadius: [0.05, 0.14],
                  carWidthPercentage: [0.3, 0.5],
                  carShiftX: [-0.8, 0.8],
                  carFloorSeparation: [0, 5],
                  colors: {
                    roadColor: 0x080808,
                    islandColor: 0x0a0a0a,
                    background: 0x000000,
                    shoulderLines: 0xFFFFFF,
                    brokenLines: 0xFFFFFF,
                    leftCars: color === 'red' ? [0xFF0000, 0xFF4444, 0xFF6666] : [0x0066FF, 0x4488FF, 0x6699FF],
                    rightCars: color === 'red' ? [0xFF0000, 0xFF4444, 0xFF6666] : [0x0066FF, 0x4488FF, 0x6699FF],
                    sticks: color === 'red' ? 0xFF0000 : 0x0066FF,
                  }
                }} />
              </motion.div>
            )}
            {/* Centered Color Circle Grow/Shrink */}
            {(phase === 'circle-grow' || phase === 'circle-shrink') && (
              <motion.div
                key={`seamless-${phase}`}
                className="fixed z-[1002] rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: circleColor,
                  boxShadow: `0 0 100px ${circleColor}80`
                }}
                initial={{
                  width: phase === 'circle-grow' ? 0 : '200vw',
                  height: phase === 'circle-grow' ? 0 : '200vw',
                  opacity: phase === 'circle-grow' ? 0 : 1
                }}
                animate={{
                  width: phase === 'circle-grow' ? '200vw' : 0,
                  height: phase === 'circle-grow' ? '200vw' : 0,
                  opacity: phase === 'circle-grow' ? 1 : 0
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: phase === 'circle-grow' ? 1 : 0.5,
                  ease: 'easeInOut'
                }}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hyperspeed from './Hyperspeed';
import { MatrixRainingLetters } from "react-mdr";
import useIsMobile from '../hooks/useIsMobile';

const TransitionContext = createContext();

export function useTransition() {
  return useContext(TransitionContext);
}

export function TransitionManager({ children }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [transitionState, setTransitionState] = useState({
    active: false,
    color: null,
    targetPath: null,
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

  // Simple trigger function
  const triggerTransition = useCallback((color, targetPath, origin) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Start transition
    setTransitionState({
      active: true,
      color,
      targetPath,
      origin
    });

    // Different transition times for mobile vs desktop
    const transitionTime = isMobile ? 5500 : 6000; // 5.5s for mobile, 6s for desktop

    // Navigate after transition completes
    transitionTimeoutRef.current = setTimeout(() => {
      navigate(targetPath);
      setTimeout(() => {
        setTransitionState({ active: false, color: null, targetPath: null, origin: { x: 0, y: 0 } });
        isTransitioningRef.current = false;
      }, 100);
    }, transitionTime);
  }, [navigate, isMobile]);

  // Overlay rendering
  const { active, color, origin } = transitionState;
  const circleColor = color === 'red' ? '#FF0000' : '#0066FF';

  return (
    <TransitionContext.Provider value={{ triggerTransition, isTransitioning: active }}>
      {children}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Black background that covers everything during transition */}
            <motion.div 
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            
            {/* Circle that emerges from pill - Desktop only */}
            {!isMobile && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: origin.x,
                  top: origin.y,
                  transform: 'translate(-50%, -50%)',
                  background: circleColor,
                  boxShadow: `0 0 50px ${circleColor}`
                }}
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ 
                  width: '200vw', 
                  height: '200vw', 
                  opacity: [1, 1, 0, 0, 0]
                }}
                transition={{ 
                  duration: 6,
                  ease: [0.25, 0.1, 0.25, 1],
                  times: [0, 0.25, 0.35, 0.85, 1]
                }}
              />
            )}
            
            {/* Black screen that fades in */}
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: isMobile ? [0, 1, 0] : [0, 0, 1, 1, 0] }}
              transition={{ 
                duration: isMobile ? 5.5 : 6,
                ease: "easeInOut",
                times: isMobile ? [0, 0.1, 1] : [0, 0.25, 0.35, 0.85, 1]
              }}
            />
            
            {/* Transition Effect - Matrix Rain for Mobile, Hyperspeed for Desktop */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: isMobile ? [0, 1, 0] : [0, 0, 1, 1, 0] }}
              transition={{ 
                duration: isMobile ? 5.5 : 6,
                ease: "easeInOut",
                times: isMobile ? [0, 0.1, 1] : [0, 0.25, 0.35, 0.85, 1]
              }}
            >
              {isMobile ? (
                // Matrix Rain Effect for Mobile
                <MatrixRainingLetters 
                  custom_class="m-0 p-0 fixed inset-0 z-[1000]" 
                  custom_color={color === 'red' ? '#FF0000' : '#0066FF'}
                />
              ) : (
                // Hyperspeed Effect for Desktop
                <Hyperspeed effectOptions={{
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
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
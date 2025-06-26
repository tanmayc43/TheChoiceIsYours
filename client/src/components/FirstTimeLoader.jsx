import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../contexts/AppStateContext';

const MatrixRain = ({ isActive }) => {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    if (!isActive) return;

    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const columns = Math.floor(window.innerWidth / 20);
    
    const newDrops = Array.from({ length: columns }, (_, i) => ({
      id: i,
      x: i * 20,
      y: Math.random() * -1000,
      speed: Math.random() * 3 + 2,
      chars: Array.from({ length: 20 }, () => 
        characters[Math.floor(Math.random() * characters.length)]
      )
    }));
    
    setDrops(newDrops);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {drops.map(drop => (
        <motion.div
          key={drop.id}
          className="absolute text-matrix-green font-mono text-sm opacity-70"
          style={{ left: drop.x }}
          animate={{
            y: [drop.y, window.innerHeight + 100]
          }}
          transition={{
            duration: drop.speed,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {drop.chars.map((char, i) => (
            <div
              key={i}
              className="block leading-tight"
              style={{
                opacity: Math.max(0, 1 - (i * 0.1))
              }}
            >
              {char}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

const TypewriterText = ({ text, onComplete, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50 + delay);
      
      return () => clearTimeout(timer);
    } else if (onComplete) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, onComplete, delay]);

  return (
    <span className="font-mono text-matrix-green">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-2 h-6 bg-matrix-green ml-1"
      />
    </span>
  );
};

const FirstTimeLoader = () => {
  const { hasSeenIntro, markIntroSeen, prefersReducedMotion } = useAppState();
  const [stage, setStage] = useState(0);
  const [showLoader, setShowLoader] = useState(!hasSeenIntro);

  useEffect(() => {
    if (hasSeenIntro || prefersReducedMotion) {
      setShowLoader(false);
      return;
    }

    const stages = [
      () => setTimeout(() => setStage(1), 1000), // Dark screen
      () => setTimeout(() => setStage(2), 2000), // Glyphs
      () => setTimeout(() => setStage(3), 4000), // Matrix rain
      () => setTimeout(() => setStage(4), 6000), // Title reveal
      () => setTimeout(() => {
        setStage(5);
        setTimeout(() => {
          setShowLoader(false);
          markIntroSeen();
        }, 3000);
      }, 9000)
    ];

    stages[stage]?.();
  }, [stage, hasSeenIntro, markIntroSeen, prefersReducedMotion]);

  if (!showLoader) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Stage 1: Dark screen with flicker */}
        {stage >= 1 && (
          <motion.div
            className="absolute inset-0 bg-black"
            animate={{
              opacity: stage === 1 ? [1, 0.8, 1, 0.9, 1] : 1
            }}
            transition={{
              duration: 2,
              times: [0, 0.2, 0.4, 0.6, 1]
            }}
          />
        )}

        {/* Stage 2: Glyphs */}
        {stage >= 2 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 2 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl font-mono text-matrix-green opacity-50">
              {'アイウエオ'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.2,
                    repeat: 2
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stage 3: Matrix Rain */}
        <MatrixRain isActive={stage >= 3 && stage < 5} />

        {/* Stage 4: Title Reveal */}
        {stage >= 4 && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center space-y-8">
              <motion.div
                className="text-6xl md:text-8xl font-mono font-bold"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <TypewriterText 
                  text="MATRIX FILMS" 
                  delay={100}
                />
              </motion.div>
              
              {stage >= 5 && (
                <motion.div
                  className="text-xl font-mono text-matrix-green/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                >
                  <TypewriterText 
                    text="INITIALIZING FILM DISCOVERY PROTOCOL..." 
                    delay={50}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirstTimeLoader;
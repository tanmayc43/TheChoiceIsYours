import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../contexts/AppStateContext';

const Pill = ({ color, onClick, children, description, isSelected }) => {
  const { prefersReducedMotion } = useAppState();

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={!prefersReducedMotion ? { scale: 1.1 } : {}}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Pill container */}
      <motion.div
        className={`
          relative w-32 h-16 rounded-full border-2 overflow-hidden
          ${color === 'red' 
            ? 'bg-gradient-to-r from-red-600 to-red-800 border-red-400' 
            : 'bg-gradient-to-r from-blue-600 to-blue-800 border-blue-400'
          }
        `}
        animate={{
          y: !prefersReducedMotion ? [0, -5, 0] : 0,
          rotateY: !prefersReducedMotion ? [0, 5, -5, 0] : 0
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Pill shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        />

        {/* Pill glow */}
        <motion.div
          className={`
            absolute inset-0 rounded-full blur-md opacity-50
            ${color === 'red' ? 'bg-red-500' : 'bg-blue-500'}
          `}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </motion.div>

      {/* Description */}
      <motion.div
        className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-white font-mono text-lg font-bold mb-2">
          {children}
        </div>
        <div className="text-matrix-green/80 font-mono text-sm max-w-48">
          {description}
        </div>
      </motion.div>

      {/* Selection effect */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-matrix-green"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Choice = () => {
  const navigate = useNavigate();
  const { prefersReducedMotion } = useAppState();
  const [selectedPill, setSelectedPill] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePillClick = (pill, route) => {
    if (isTransitioning) return;
    
    setSelectedPill(pill);
    setIsTransitioning(true);

    setTimeout(() => {
      navigate(route);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 65, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 65, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* Morpheus Quote */}
      <motion.div
        className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center max-w-4xl px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="text-white font-mono text-2xl md:text-4xl mb-4">
          "This is your last chance."
        </div>
        <div className="text-matrix-green font-mono text-lg md:text-xl">
          After this, there is no going back.
        </div>
      </motion.div>

      {/* Pills Container */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center space-y-32 md:space-y-0 md:space-x-32"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Red Pill */}
          <Pill
            color="red"
            onClick={() => handlePillClick('red', '/watchlist')}
            isSelected={selectedPill === 'red'}
            description="Discover films from your personal Letterboxd watchlist"
          >
            RED PILL
          </Pill>

          {/* Blue Pill */}
          <Pill
            color="blue"
            onClick={() => handlePillClick('blue', '/random')}
            isSelected={selectedPill === 'blue'}
            description="Get random curated film recommendations"
          >
            BLUE PILL
          </Pill>
        </motion.div>
      </div>

      {/* Choice Description */}
      <motion.div
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center max-w-2xl px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="text-white/80 font-mono text-sm md:text-base">
          Choose wisely. Each path leads to a different cinematic journey.
        </div>
      </motion.div>

      {/* Transition Effect */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background zoom effect */}
            <motion.div
              className="absolute inset-0 bg-black"
              animate={{
                scale: [1, 1.5],
                opacity: [0, 1]
              }}
              transition={{ duration: 1.5 }}
            />
            
            {/* Matrix code rain */}
            <div className="absolute inset-0">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-matrix-green font-mono text-sm opacity-70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`
                  }}
                  animate={{
                    y: ["0%", "110%"]
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: "linear"
                  }}
                >
                  {String.fromCharCode(0x30A0 + Math.random() * 96)}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient floating particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-matrix-green/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 10, -10, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Choice;
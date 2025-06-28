import React from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../contexts/AppStateContext';

const FloatingPill = ({ color = "red", className = "" }) => {
  const { prefersReducedMotion } = useAppState();

  const pillColor = color === "red" ? "#FF0000" : "#0066FF";
  const glowColor = color === "red" ? "#FF4444" : "#4488FF";

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative"
        animate={{
          y: !prefersReducedMotion ? [0, -20, 0] : 0,
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Main pill */}
        <motion.div
          className="relative w-10 h-5 md:w-16 md:h-8 rounded-full border-2 overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${pillColor}, ${glowColor})`,
            borderColor: pillColor,
            boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40`
          }}
          animate={{
            scale: !prefersReducedMotion ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Pill shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />

          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${glowColor}80 0%, transparent 70%)`
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        </motion.div>

        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
            transform: 'scale(2)'
          }}
          animate={{
            scale: !prefersReducedMotion ? [2, 2.5, 2] : 2,
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)`,
            transform: 'scale(3)'
          }}
          animate={{
            scale: !prefersReducedMotion ? [3, 3.8, 3] : 3,
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Floating particles */}
        {!prefersReducedMotion && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: glowColor,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  x: [0, (i - 1) * 20],
                  y: [0, -30 - i * 10],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default FloatingPill;

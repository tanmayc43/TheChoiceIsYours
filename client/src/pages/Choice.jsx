import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppState } from '../contexts/AppStateContext';
import PalmImage from '../components/PalmImage';
import FloatingPill from '../components/FloatingPill';
import { useTransition } from '../components/TransitionManager';

const Choice = () => {
  const navigate = useNavigate();
  const { prefersReducedMotion } = useAppState();
  const { triggerTransition, isTransitioning } = useTransition();

  // Adjust these values to position the pills above the palms in your image
  const pillPositions = [
    {
      color: 'red',
      style: {
        left: '40%', // adjust as needed
        top: '50%',  // adjust as needed
        transform: 'translate(-50%, -100%)',
      },
      onClick: (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        triggerTransition('red', '/watchlist', { x, y });
      },
    },
    {
      color: 'blue',
      style: {
        left: '60%', // adjust as needed
        top: '50%',  // adjust as needed
        transform: 'translate(-50%, -100%)',
      },
      onClick: (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        triggerTransition('blue', '/random', { x, y });
      },
    },
  ];

  return (
    <div className="min-h-screen bg-black relative flex flex-col items-center justify-center overflow-hidden">
      {/* Matrix Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
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

      {/* Palms Image (from PalmImage component) */}
      <div className="relative z-10 w-full flex justify-center">
        <PalmImage className="mx-auto w-[40rem] md:w-[60rem]" style={{ transform: 'rotate(1.5deg)' }} />

        {/* Floating Pills */}
        {pillPositions.map((pill) => (
          <button
            key={pill.color}
            onClick={pill.onClick}
            disabled={isTransitioning}
            style={{
              position: 'absolute',
              ...pill.style,
              zIndex: 20,
              background: 'none',
              border: 'none',
              cursor: isTransitioning ? 'default' : 'pointer',
            }}
            tabIndex={0}
            aria-label={pill.color === 'red' ? 'Choose Red Pill' : 'Choose Blue Pill'}
          >
            <FloatingPill color={pill.color} />
          </button>
        ))}
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
    </div>
  );
};

export default Choice;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppState } from '../contexts/AppStateContext';
import PalmImage from '../components/PalmImage';
import FloatingPill from '../components/FloatingPill';
import { useTransition } from '../components/TransitionManager';
import useIsMobile from '../hooks/useIsMobile';

// Custom hook for tablet screens (600px - 1024px)
function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(
    window.innerWidth >= 600 && window.innerWidth < 1024
  );
  React.useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 600 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isTablet;
}

// Custom hook for medium screens (md: 768px - 1024px)
function useIsMediumScreen() {
  const [isMedium, setIsMedium] = React.useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );
  React.useEffect(() => {
    const handleResize = () => {
      setIsMedium(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMedium;
}

const Choice = () => {
  const navigate = useNavigate();
  const { prefersReducedMotion } = useAppState();
  const { triggerTransition, isTransitioning } = useTransition();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMedium = useIsMediumScreen();

  // Responsive pill positions
  let pillPositions;
  if (isMobile) {
    pillPositions = [
      {
        color: 'red',
        label: '"The watchlist is real, Neo."',
        style: {
          left: '32%',
          top: '54%',
          transform: 'translate(-50%, -100%)',
        },
        labelStyle: {
          left: '32%',
          top: '85%',
          transform: 'translate(-50%, 0)',
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
        label: '"Say what you want to see — I\'ll make it real."',
        style: {
          left: '68%',
          top: '54%',
          transform: 'translate(-50%, -100%)',
        },
        labelStyle: {
          left: '68%',
          top: '85%',
          transform: 'translate(-50%, 0)',
        },
        onClick: (event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          triggerTransition('blue', '/recommend', { x, y });
        },
      },
    ];
  } else if (isTablet) {
    pillPositions = [
      {
        color: 'red',
        label: '"The watchlist is real, Neo."',
        style: {
          left: '35%',
          top: '53%',
          transform: 'translate(-50%, -100%)',
        },
        labelStyle: {
          left: '35%',
          top: '83%',
          transform: 'translate(-50%, 0)',
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
        label: '"Say what you want to see — I\'ll make it real."',
        style: {
          left: '65%',
          top: '53%',
          transform: 'translate(-50%, -100%)',
        },
        labelStyle: {
          left: '65%',
          top: '83%',
          transform: 'translate(-50%, 0)',
        },
        onClick: (event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          triggerTransition('blue', '/recommend', { x, y });
        },
      },
    ];
  } else if (isMedium) {
    pillPositions = [
      {
        color: 'red',
        label: '"The watchlist is real, Neo."',
        style: {
          left: '38%',
          top: '52%',
          transform: 'translate(-50%, -100%)',
        },
        labelStyle: {
          left: '38%',
          top: '81%',
          transform: 'translate(-50%, 0)',
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
        label: '"Say what you want to see — I\'ll make it real."',
        style: {
          left: '62%',
          top: '52%',
          transform: 'translate(-50%, -100%)',
        },
        labelStyle: {
          left: '62%',
          top: '81%',
          transform: 'translate(-50%, 0)',
        },
        onClick: (event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          triggerTransition('blue', '/recommend', { x, y });
        },
      },
    ];
  } else {
    pillPositions = [
      {
        color: 'red',
        label: '"The watchlist is real, Neo."',
        style: {
          left: '40%',
          top: '50%',
          transform: 'translate(-50%, -100%)',
        },
        labelStyle: {
          left: '40%',
          top: '82%',
          transform: 'translate(-50%, 0)',
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
        label: '"Say what you want to see — I\'ll make it real."',
        style: {
          left: '60%',
          top: '50%',
          transform: 'translate(-50%, -100%)',
        },
        labelStyle: {
          left: '60%',
          top: '82%',
          transform: 'translate(-50%, 0)',
        },
        onClick: (event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          triggerTransition('blue', '/recommend', { x, y });
        },
      },
    ];
  }

  // Determine palmImageWidthClass based on screen size
  let palmImageWidthClass;
  if (isMobile) {
    palmImageWidthClass = 'w-96 sm:w-[36rem] md:w-[40rem] lg:w-[60rem]';
  } else if (isTablet) {
    palmImageWidthClass = 'w-96 sm:w-[36rem] md:w-[40rem] lg:w-[60rem]';
  } else if (isMedium) {
    palmImageWidthClass = 'w-96 sm:w-[36rem] md:w-[40rem] lg:w-[60rem]';
  } else {
    palmImageWidthClass = 'w-96 sm:w-[36rem] md:w-[40rem] lg:w-[60rem]';
  }

  return (
    <motion.div 
      className="min-h-screen bg-black relative flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
    >
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
        <PalmImage className={`mx-auto ${palmImageWidthClass}`} style={{ transform: 'rotate(1.5deg)' }} />

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

        {/* Pill Labels */}
        {pillPositions.map((pill) => (
          <div
            key={pill.color + '-label'}
            className="absolute z-30 text-xs sm:text-sm md:text-base font-mono text-white text-center break-words max-w-[10rem] sm:max-w-[14rem] md:max-w-[18rem] drop-shadow-md pointer-events-none"
            style={pill.labelStyle}
          >
            {pill.label}
          </div>
        ))}
      </div>

      {/* Morpheus Quote */}
      <motion.div
        className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center max-w-6xl px-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.8 }}
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
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center max-w-2xl px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 1.2 }}
      >
        <div className="text-white/80 font-mono text-sm md:text-base">
          Choose wisely. Each path leads to a different cinematic journey.
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Choice;
import React, { createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TransitionContext = createContext({});

export const TransitionPresets = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { type: "spring", stiffness: 260, damping: 20 }
  },
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

export const TransitionProvider = ({ children }) => {
  return (
    <TransitionContext.Provider value={TransitionPresets}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => useContext(TransitionContext);

export const AnimatedComponent = ({ 
  preset = "fade", 
  children, 
  className,
  custom = {}
}) => {
  const presets = useTransition();
  const selectedPreset = presets[preset] || presets.fade;
  
  return (
    <motion.div
      initial={selectedPreset.initial}
      animate={selectedPreset.animate}
      exit={selectedPreset.exit}
      transition={selectedPreset.transition}
      className={className}
      {...custom}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedSwitch = ({ value, children }) => (
  <AnimatePresence mode="wait">
    {children(value)}
  </AnimatePresence>
);
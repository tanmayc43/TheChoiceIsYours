import { motion } from "framer-motion";

export const TransitionPresets = {
  // Standard fade and slide up
  fadeSlide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  // Simple fade for overlays and loaders
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  // 3D flip for cards
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
    // Slower, smoother spring animation
    transition: { type: "spring", stiffness: 80, damping: 22 }
  }
};

// A reusable motion container for applying presets easily
export function MotionContainer({ preset = "fadeSlide", children, className, ...props }) {
  const config = TransitionPresets[preset] || TransitionPresets.fadeSlide;
  
  return (
    <motion.div
      initial={config.initial}
      animate={config.animate}
      exit={config.exit}
      transition={config.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
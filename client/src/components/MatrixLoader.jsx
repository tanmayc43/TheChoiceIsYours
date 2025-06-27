import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MatrixLoader = ({ message = "Loading...", isLoading }) => {
  const smoothTransition = { duration: 0.5 };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={smoothTransition}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        >
          {/* Loading Content */}
          <div className="relative z-10 text-center">
            {/* Rotating Glyph */}
            <motion.div
              className="text-6xl text-matrix-green font-mono mb-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ◉
            </motion.div>

            {/* Loading Message */}
            <motion.div
              className="text-xl text-white font-mono"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {message}
            </motion.div>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-matrix-green rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatrixLoader;
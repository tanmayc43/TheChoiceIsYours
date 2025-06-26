import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MatrixLoader = ({ message = "Loading..." }) => {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const columns = Math.floor(window.innerWidth / 20);
    
    const newDrops = Array.from({ length: columns }, (_, i) => ({
      id: i,
      x: i * 20,
      y: Math.random() * -1000,
      speed: Math.random() * 3 + 2,
      chars: Array.from({ length: 15 }, () => 
        characters[Math.floor(Math.random() * characters.length)]
      )
    }));
    
    setDrops(newDrops);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Matrix Rain */}
      <div className="absolute inset-0 overflow-hidden">
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
    </div>
  );
};

export default MatrixLoader;
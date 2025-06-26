import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../contexts/AppStateContext';

const FilmGrabImage = ({ onImageLoad }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate FilmGrab API call - replace with actual API
    const fetchRandomImage = async () => {
      try {
        // For demo, using a placeholder. Replace with actual FilmGrab API
        const response = await fetch('https://picsum.photos/1920/1080?random=' + Math.random());
        setImageUrl(response.url);
      } catch (error) {
        // Fallback image
        setImageUrl('https://picsum.photos/1920/1080?grayscale');
      }
    };

    fetchRandomImage();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onImageLoad?.();
  };

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 0.3 : 0 }}
      transition={{ duration: 2 }}
    >
      <motion.img
        src={imageUrl}
        alt="Film still"
        className="w-full h-full object-cover filter grayscale"
        onLoad={handleImageLoad}
        animate={{
          x: isLoaded ? [-100, 0, 100] : 0,
          scale: isLoaded ? [1, 1.05, 1] : 1
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity
        }}
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
    </motion.div>
  );
};

const TypewriterText = ({ text, onComplete, className = "" }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 80);
      
      return () => clearTimeout(timer);
    } else if (onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-1 h-6 bg-matrix-green ml-1"
      />
    </span>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { prefersReducedMotion } = useAppState();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFirstLine, setShowFirstLine] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstLine(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnterClick = () => {
    navigate('/choice');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Film Image */}
      <FilmGrabImage onImageLoad={() => setImageLoaded(true)} />

      {/* Matrix Grid Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 65, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 65, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl">
          {/* First Line */}
          <AnimatePresence>
            {showFirstLine && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-4xl md:text-6xl font-mono text-white"
              >
                <TypewriterText
                  text="Confused about what to watch?"
                  onComplete={() => setShowSecondLine(true)}
                  className="block"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Second Line */}
          <AnimatePresence>
            {showSecondLine && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-2xl md:text-4xl font-mono text-matrix-green"
              >
                <TypewriterText
                  text="Click to kick your confusion out."
                  onComplete={() => setShowButton(true)}
                  className="block"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enter Button */}
          <AnimatePresence>
            {showButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className="pt-8"
              >
                <motion.button
                  onClick={handleEnterClick}
                  className="group relative px-12 py-4 bg-transparent border-2 border-matrix-green text-matrix-green font-mono text-xl font-bold tracking-wider overflow-hidden"
                  whileHover={{ 
                    scale: prefersReducedMotion ? 1 : 1.05,
                    boxShadow: "0 0 30px rgba(0, 255, 65, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Button background effect */}
                  <motion.div
                    className="absolute inset-0 bg-matrix-green"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Button text */}
                  <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                    ENTER
                  </span>

                  {/* Glitch effect */}
                  <motion.div
                    className="absolute inset-0 bg-matrix-green opacity-0"
                    animate={{
                      opacity: [0, 0.1, 0],
                      x: [0, 2, -2, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ambient particles */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-matrix-green rounded-full opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
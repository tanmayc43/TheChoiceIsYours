import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../contexts/AppStateContext';
import filmGrabAPI from '../lib/filmGrabApi';

const MatrixRain = ({ isActive }) => {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    if (!isActive) return;

    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const columns = Math.floor(window.innerWidth / 15);
    
    const newDrops = Array.from({ length: columns }, (_, i) => ({
      id: i,
      x: i * 15,
      y: Math.random() * -1000,
      speed: Math.random() * 2 + 3,
      chars: Array.from({ length: 25 }, () => 
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
                opacity: Math.max(0, 1 - (i * 0.08))
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

const FilmGrabImage = ({ onImageLoad }) => {
  const [filmStill, setFilmStill] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchRandomImage = async () => {
      try {
        const still = await filmGrabAPI.getRandomFilmStill();
        setFilmStill(still);
      } catch (error) {
        console.error('Error fetching film still:', error);
        // Fallback to a placeholder
        setFilmStill({
          url: 'https://picsum.photos/1920/1080?grayscale',
          title: 'Film Still',
          year: '2024',
          director: 'Unknown',
          description: 'A beautiful film still'
        });
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
      animate={{ opacity: isLoaded ? 0.6 : 0 }}
      transition={{ duration: 2 }}
    >
      <motion.img
        src={filmStill?.url}
        alt={filmStill?.title || 'Film still'}
        className="w-full h-full object-cover filter grayscale"
        onLoad={handleImageLoad}
        animate={{
          x: isLoaded ? [-50, 0, 50] : 0,
          scale: isLoaded ? [1, 1.02, 1] : 1
        }}
        transition={{
          duration: 30,
          ease: "linear",
          repeat: Infinity
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
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
  const [filmStill, setFilmStill] = useState(null);
  const [showMatrixRain, setShowMatrixRain] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Matrix rain effect for 3 seconds, then transition to content
    const matrixTimer = setTimeout(() => {
      setShowMatrixRain(false);
      setShowContent(true);
    }, 3000);

    return () => clearTimeout(matrixTimer);
  }, []);

  useEffect(() => {
    if (showContent) {
      const timer = setTimeout(() => {
        setShowFirstLine(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showContent]);

  useEffect(() => {
    const fetchFilmStill = async () => {
      try {
        const still = await filmGrabAPI.getRandomFilmStill();
        setFilmStill(still);
      } catch (error) {
        console.error('Error fetching film still:', error);
      }
    };

    fetchFilmStill();
  }, []);

  const handleEnterClick = () => {
    navigate('/choice');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Rain Effect */}
      <AnimatePresence>
        {showMatrixRain && (
          <motion.div
            className="fixed inset-0 bg-black z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <MatrixRain isActive={true} />
            
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

            {/* Loading text */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-2xl font-mono text-matrix-green/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  INITIALIZING...
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
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

            {/* Film Details - Bottom Left */}
            <AnimatePresence>
              {imageLoaded && filmStill && (
                <motion.div
                  className="absolute bottom-8 left-8 max-w-md z-20"
                  initial={{ opacity: 0, x: -50, y: 50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <div className="bg-black/80 backdrop-blur-sm border border-matrix-green/30 p-6 rounded-lg">
                    <h3 className="text-2xl font-mono font-bold text-matrix-green mb-2">
                      {filmStill.title}
                    </h3>
                    <p className="text-white/80 font-mono text-lg mb-2">
                      {filmStill.year} • {filmStill.director}
                    </p>
                    <p className="text-white/60 font-mono text-sm leading-relaxed">
                      {filmStill.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
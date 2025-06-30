import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import { useAppState } from '../contexts/AppStateContext';
import { useGsapContext } from '../lib/useGsapContext';
import { gsap } from 'gsap';
import PowerOffSlide from '../components/smoothui/ui/PowerOffSlide';
import { MatrixRainingLetters } from "react-mdr";



const isMobile = () => window.innerWidth < 640;

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
  const [rainAnimatingOut, setRainAnimatingOut] = useState(false);
  const [showPowerOff, setShowPowerOff] = useState(true);
  const [slideCompleted, setSlideCompleted] = useState(false);
  const [showInitializing, setShowInitializing] = useState(false);

  // GSAP refs
  const gsapScope = useGsapContext(() => {}, []); // will fill in below
  const rainRef = useRef();
  const contentRef = useRef();

  const test = true;

  useEffect(() => {
    // Show Matrix rain for 2.5 seconds, then show content
    const timer = setTimeout(() => {
      setShowMatrixRain(false);
      setShowContent(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Animate rain out and content in only when rainAnimatingOut is true
  useEffect(() => {
    if (rainAnimatingOut && rainRef.current && contentRef.current) {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          setShowMatrixRain(false);
          setShowContent(true);
        }
      });
      tl.to(rainRef.current, {
        y: -120,
        opacity: 0,
        duration: 0.8,
      }, 0)
      .fromTo(contentRef.current, {
        y: -60,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1.1,
      }, 0.2);
    }
  }, [rainAnimatingOut]);

  useEffect(() => {
    if (showContent) {
      const timer = setTimeout(() => {
        setShowFirstLine(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showContent]);


  const handleEnterClick = () => {
    navigate('/choice');
  };

  // Handler for PowerOffSlide completion
  const handlePowerOff = () => {
    setSlideCompleted(true);
    setTimeout(() => {
      setShowInitializing(true);
      setTimeout(() => {
        // Start fade out of initializing screen
        setShowInitializing(false);
        setTimeout(() => {
          navigate('/choice');
        }, 1000); // Wait for fade out to complete
      }, 2000); // Show "initializing" for 2 seconds
    }, 1200); // Wait 1.2s before showing "initializing" (coordinated with PowerOffSlide)
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Bolt Logo Top Right */}
      <a
        href="https://bolt.new" // or your preferred link, or use '#' if none
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 z-[1100]"
        style={{
          // fallback for browsers without Tailwind
          display: 'block',
        }}
        aria-label="Powered by Bolt"
      >
        <img
          src="/bolt.webp"
          alt="Bolt Logo"
          className="w-24 md:w-32 lg:w-40 h-auto object-contain drop-shadow-lg transition-transform duration-200 hover:scale-105"
          style={{
            maxWidth: '30vw',
            minWidth: '64px',
          }}
          draggable={false}
        />
      </a>
      {/* Matrix Rain Effect with smooth fade out */}
      <AnimatePresence>
        {showMatrixRain && (
          <motion.div
            key="matrix-rain"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 z-[1000]"
          >
            <MatrixRainingLetters custom_class="m-0 p-0 w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Home Content with smooth fade in */}
      <AnimatePresence>
        {showContent && !slideCompleted && (
          <motion.div
            key="home-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            {/* Background Film Image */}
            <div className="absolute inset-0 z-0 w-full h-full bg-black">
              <img
                src="/homeimg.jpg"
                alt="Matrix Home"
                className="absolute top-1/2 left-1/2 w-auto h-auto max-w-full max-h-full md:max-w-[90vw] md:max-h-[90vh] object-contain object-center -translate-x-1/2 -translate-y-1/2"
                style={{ filter: 'blur(2px)' }}
                draggable={false}
              />
              {/* Noise overlay using SVG data URI */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-10"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg width="100%25" height="100%25" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%25" height="100%25" filter="url(%23noiseFilter)"/></svg>')`,
                  backgroundSize: 'cover',
                  mixBlendMode: 'overlay'
                }}
              />
            </div>

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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="text-2xl md:text-5xl font-mono text-white"
                >
                  Confused about what to watch?
                </motion.div>
                {/* Second Line */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-lg md:text-3xl font-mono text-matrix-green"
                >
                  The answer lies beyond the choice.
                </motion.div>
                {/* PowerOffSlide replaces Enter button */}
                <div className="pt-8 flex justify-center">
                  <PowerOffSlide
                    onPowerOff={handlePowerOff}
                    label="slide to enter"
                    duration={1200}
                    className=""
                    iconColor="#00FF41"
                    barColor="#00FF41"
                    vertical={isMobile()}
                  />
                </div>
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
      {/* Initializing Screen */}
      <AnimatePresence>
        {showInitializing && (
          <motion.div
            key="initializing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.8, 
              ease: [0.4, 0, 0.2, 1],
              exit: { duration: 1.0, ease: [0.4, 0, 0.2, 1] }
            }}
            className="fixed inset-0 bg-black z-[2000] flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                className="text-2xl md:text-4xl font-mono text-matrix-green"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                initializing
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  ...
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
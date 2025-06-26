import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppState } from '../contexts/AppStateContext';
import MatrixLoader from '../components/MatrixLoader';
import FilmCard from '../components/FilmCard';

const Random = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading, currentFilm, setCurrentFilm, prefersReducedMotion } = useAppState();
  const [error, setError] = useState(false);

  const getRandomMovie = async () => {
    setIsLoading(true);
    setCurrentFilm(null);
    setError(false);
    
    try {
      const res = await fetch('/api/random');
      const data = await res.json();
      
      if (res.ok) {
        setCurrentFilm(data);
        setError(false);
      } else {
        setCurrentFilm({ title: "Could not fetch a movie. Try again!" });
        setError(true);
      }
    } catch (err) {
      setCurrentFilm({ title: "Could not fetch a movie. Try again!" });
      setError(true);
    }
    
    setIsLoading(false);
  };

  const handleBack = () => {
    setCurrentFilm(null);
    setError(false);
  };

  if (isLoading) {
    return <MatrixLoader message="Accessing film database..." />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Grid Background */}
      <div className="absolute inset-0 opacity-5">
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

      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/choice')}
        className="fixed top-6 left-6 z-20 p-3 bg-transparent border border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black transition-all duration-300 font-mono"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10 pt-20">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-mono font-bold text-matrix-green mb-4">
            RANDOM SELECTION
          </h1>
          <p className="text-white/80 font-mono text-lg max-w-2xl mx-auto">
            Let the algorithm choose a curated film from the vast digital library
          </p>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!currentFilm ? (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              {/* Action Button */}
              <motion.div
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={getRandomMovie}
                  disabled={isLoading}
                  className="px-12 py-6 bg-transparent border-2 border-matrix-green text-matrix-green font-mono text-xl font-bold hover:bg-matrix-green hover:text-black transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Button background effect */}
                  <motion.div
                    className="absolute inset-0 bg-matrix-green"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <span className="relative z-10 flex items-center">
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-6 h-6 border-2 border-current border-t-transparent rounded-full mr-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <span className="text-2xl mr-3">🎬</span>
                        EXECUTE RANDOM
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>

              {/* Instruction Text */}
              <motion.p
                className="text-white/60 font-mono text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Click to initiate random film selection protocol
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg"
            >
              <FilmCard 
                film={currentFilm} 
                error={error} 
                onBack={handleBack}
                title={error ? "SYSTEM ERROR" : "RANDOM SELECTION"}
                showNewButton={true}
                onNew={getRandomMovie}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient floating particles */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-matrix-green/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, -10, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
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

export default Random;
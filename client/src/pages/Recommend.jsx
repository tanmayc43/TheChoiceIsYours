import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppState } from '../contexts/AppStateContext';
import MatrixLoader from '../components/MatrixLoader';
import FilmCard from '../components/FilmCard';
import { MotionContainer } from "../components/transition";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Recommend = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading, currentFilm, setCurrentFilm } = useAppState();
  const [error, setError] = useState(false);
  const [prompt, setPrompt] = useState("");

  // Reset currentFilm when component unmounts
  useEffect(() => {
    return () => {
      setCurrentFilm(null);
    };
  }, [setCurrentFilm]);

  const getMovieByPrompt = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setCurrentFilm(null);
    setError(false);
    
    try {
      const res = await fetch(`${API_BASE_URL}/recommend?prompt=${encodeURIComponent(prompt)}`);
      const data = await res.json();
      
      if (res.ok) {
        setCurrentFilm(data);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
      // Log error without exposing sensitive information
      console.error("[Recommend] Failed to fetch recommendation:", {
        message: err.message,
        type: err.name,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentFilm(null);
    setError(false);
    setPrompt("");
  };

  const handleNavBack = () => navigate('/choice');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
      className="min-h-screen bg-black relative overflow-hidden"
    >
      {/* Matrix Loader Overlay */}
      <MatrixLoader message="Consulting the cinematic oracle..." isLoading={isLoading} />

      {/* Back Button */}
      <motion.button
        onClick={handleNavBack}
        className="fixed top-6 left-6 z-20 p-3 bg-transparent border border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black transition-all duration-300 font-mono"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10 pt-20">
        <AnimatePresence mode="wait">
          {/* Show the FilmCard if a film is loaded */}
          {currentFilm && !isLoading ? (
            <FilmCard
              key={currentFilm.slug || 'film-card'}
              film={currentFilm}
              onBack={handleBack}
            />
          ) : (
            // Otherwise, show the input form
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl text-center"
            >
              {/* CHANGED: Title updated to RECOMMEND PROTOCOL */}
              <h1 className="text-4xl font-bold text-matrix-green font-mono mb-4">RECOMMEND PROTOCOL</h1>
              <p className="text-white/80 mb-8">Close your eyes, describe the dream… I'll handle the rest. The more specific, the better.</p>

              <form onSubmit={getMovieByPrompt} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8">
                <Input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="a mind-bending sci-fi thriller"
                  className="flex-grow bg-black border-matrix-green/50 text-white font-mono placeholder:text-white/50 focus:border-matrix-green"
                />
                <Button type="submit" disabled={isLoading || !prompt.trim()} className="bg-matrix-green text-black hover:bg-matrix-dark-green font-mono">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Find Movie
                </Button>
              </form>
              
              {/* Show error message below the form if an error occurs */}
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 font-mono mt-4"
                >
                  The Oracle is silent. No films revealed. Perhaps the blue pill was a mistake. Try again.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Recommend;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, RotateCcw, AlertTriangle } from "lucide-react";
import { useAppState } from '../contexts/AppStateContext';

const FilmCard = ({ film, error, onBack, title, showNewButton = false, onNew }) => {
  const { prefersReducedMotion } = useAppState();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  return (
    <Card className="bg-black/90 border-2 border-matrix-green/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="text-center border-b border-matrix-green/30">
        <CardTitle className="text-2xl font-mono text-matrix-green flex items-center justify-center">
          {error ? (
            <>
              <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
              {title}
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-matrix-green rounded-full mr-3 animate-pulse"></span>
              {title}
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // Initial reveal card
            <motion.div
              key="reveal-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <motion.div
                className="w-full h-64 bg-gradient-to-br from-matrix-green/20 to-black/50 rounded border border-matrix-green/30 flex items-center justify-center cursor-pointer relative overflow-hidden"
                onClick={handleFlip}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Scanning lines effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-matrix-green/20 to-transparent h-8"
                  animate={{ y: ["-2rem", "16rem"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="text-center z-10">
                  <motion.div
                    className="text-4xl font-mono text-matrix-green mb-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ◉
                  </motion.div>
                  <p className="text-white font-mono text-lg">
                    CLICK TO REVEAL
                  </p>
                  <p className="text-matrix-green/80 font-mono text-sm mt-2">
                    Film data encrypted
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            // Film details card
            <motion.div
              key="details-card"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {error ? (
                // Error state
                <div className="text-center space-y-4">
                  <motion.div
                    className="text-6xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    ⚠️
                  </motion.div>
                  <div className="text-red-400 font-mono text-lg">
                    {film?.title || "System malfunction detected"}
                  </div>
                  <div className="text-white/60 font-mono text-sm">
                    Unable to establish connection to film database
                  </div>
                </div>
              ) : (
                // Film details
                <div className="space-y-6">
                  {/* Poster */}
                  {film?.image && film.image !== 'https://watchlistpicker.com/noimagefound.jpg' ? (
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <img
                        src={film.image}
                        alt={film.title || film.name}
                        className="w-full max-w-xs mx-auto rounded border border-matrix-green/30 shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded" />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="w-full h-48 bg-black/50 border border-matrix-green/30 rounded flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎬</div>
                        <div className="text-matrix-green/60 font-mono text-sm">
                          NO IMAGE DATA
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Film Info */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-mono font-bold text-white text-center">
                      {film?.title || film?.name}
                    </h2>

                    {film?.year && (
                      <div className="text-center">
                        <span className="text-matrix-green font-mono">YEAR: </span>
                        <span className="text-white font-mono">{film.year}</span>
                      </div>
                    )}

                    {film?.vote_average && (
                      <div className="text-center">
                        <span className="text-matrix-green font-mono">RATING: </span>
                        <span className="text-white font-mono">{film.vote_average}</span>
                      </div>
                    )}

                    {film?.overview && (
                      <div className="bg-black/30 p-4 rounded border border-matrix-green/20">
                        <p className="text-white/80 font-mono text-sm leading-relaxed">
                          {film.overview}
                        </p>
                      </div>
                    )}

                    {/* External Link */}
                    {film?.slug && (
                      <motion.a
                        href={film.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-transparent border border-matrix-green text-matrix-green font-mono hover:bg-matrix-green hover:text-black transition-all duration-300"
                        whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        VIEW ON LETTERBOXD
                      </motion.a>
                    )}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-3 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onBack}
            className="flex-1 bg-transparent border border-matrix-green/50 text-matrix-green font-mono hover:bg-matrix-green/20 transition-all duration-300"
          >
            BACK TO SEARCH
          </Button>
          
          {showNewButton && (
            <Button
              onClick={onNew}
              className="flex-1 bg-transparent border border-matrix-green text-matrix-green font-mono hover:bg-matrix-green hover:text-black transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              NEW SELECTION
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default FilmCard;
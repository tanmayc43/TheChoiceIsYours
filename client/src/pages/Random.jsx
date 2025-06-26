import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import { Dice6, Film, Sparkles, Star, Bug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Random = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState(false);

  const getRandomMovie = async () => {
    setLoading(true);
    setMovie(null);
    setError(false);
    setIsFlipped(false);
    try{
      const res = await axios.get('/api/random');
      setMovie(res.data);
      setError(false);
    }
    catch (err){
      setMovie({ title: "Could not fetch a movie. Try again!" });
      setError(true);
    }
    setLoading(false);
  };

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleBack = () => {
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        setMovie(null);
        setError(false);
      }, 800); 
    } else {
      setTimeout(() => {
        setMovie(null);
        setError(false);
      }, 150);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-16 w-28 h-28 bg-gradient-to-br from-rose-red/20 to-transparent rounded-full blur-xl float-animation"></div>
        <div className="absolute bottom-40 left-16 w-36 h-36 bg-gradient-to-br from-caribbean-current/15 to-transparent rounded-full blur-2xl float-animation" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-brown-sugar/20 to-transparent rounded-full blur-lg float-animation" style={{animationDelay: '0.5s'}}></div>
      </div>

      <Navbar />
      
      <div className="max-w-2xl mx-auto py-16 px-4 flex flex-col items-center relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <Dice6 className="w-12 h-12 text-rose-red mr-4 glow-effect" />
            <h1 className="text-5xl font-bold gradient-text playfair">I'm Feeling Lucky</h1>
            <Sparkles className="w-8 h-8 text-cream ml-4 float-animation" />
          </div>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Let fate decide your next movie night with our random film generator
          </p>
        </div>

        {/* Action Button */}
        <div className="mb-12 fade-in-up" style={{animationDelay: '0.2s'}}>
          <Button
            onClick={getRandomMovie}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-rose-red to-rose-red/80 hover:from-rose-red/90 hover:to-rose-red text-cream text-lg font-semibold rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 pulse-glow"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cream mr-3"></div>
                Rolling the dice...
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-2xl mr-3">🍿</span>
                Cue the Popcorn!
                <Dice6 className="w-5 h-5 ml-3" />
              </div>
            )}
          </Button>
        </div>

        {/* Movie Result with Flipping Animation */}
        <AnimatePresence mode="wait">
          {movie ? (
            <motion.div
              key="movie-result"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
              <Card className="mt-8 max-w-lg w-full glass-effect texture-overlay border-2 border-rose-red/30 shadow-2xl flex flex-col items-center mx-auto">
                <CardHeader className="text-center w-full">
                  <CardTitle className="text-2xl gradient-text playfair flex items-center justify-center flex-nowrap whitespace-nowrap">
                    {isFlipped && error ? (
                      <div className="flex items-center">
                        <span className="whitespace-nowrap">Oops!</span>
                        <Bug className="w-6 h-6 ml-2 text-destructive flex-shrink-0" />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="whitespace-nowrap">Your random pick is...</span>
                        <Film className="w-6 h-6 ml-2 text-rose-red flex-shrink-0" />
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col items-center">
                  
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      // First Card - Gradient with Text
                      <motion.div 
                        key="gradient-card"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-[320px] h-[420px] rounded-lg overflow-hidden cursor-pointer relative"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(158, 0, 93, 0.8) 0%, rgba(65, 87, 93, 0.6) 100%)'
                        }}
                        onClick={handleFlip}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                          >
                            <h3 className="text-2xl text-cream font-medium playfair mb-3">Tap to reveal your random movie</h3>
                            <p className="text-cream/80 text-sm">Ready to discover something amazing?</p>
                          </motion.div>
                        </div>

                        {/* Pulsing indicator */}
                        <motion.div 
                          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 2
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-cream/30 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-cream/70 flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-rose-red" />
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      // Second Card - Movie Poster with Details
                      <motion.div 
                        key="poster-card"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-[320px] h-[420px] rounded-lg overflow-hidden relative"
                      >
                        {movie.image && movie.image !== 'https://watchlistpicker.com/noimagefound.jpg' ? (
                          // Show full poster as background
                          <div className="w-full h-full relative">
                            <img 
                              src={movie.image} 
                              alt={movie.title || 'Movie poster'}
                              className="w-full h-full object-cover"
                            />
                            {/* Dark overlay for text readability */}
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6">
                              <div className="text-center">
                                <motion.h2 
                                  className="text-2xl playfair font-bold mb-2 text-cream text-center"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  {movie.title}
                                </motion.h2>
                                
                                {movie.release_date && (
                                  <motion.div 
                                    className="mb-2 text-cream/90"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    <strong>Year:</strong> {movie.release_date}
                                  </motion.div>
                                )}
                                
                                {movie.vote_average && (
                                  <motion.div 
                                    className="mb-2 text-cream/90"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    <strong>Rating:</strong> {movie.vote_average}
                                  </motion.div>
                                )}
                                
                                {movie.overview && (
                                  <motion.p 
                                    className="text-cream/80 italic mb-4 text-center text-sm leading-relaxed max-w-xs"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                  >
                                    {movie.overview}
                                  </motion.p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Show error or no image state
                          <div className="w-full h-full bg-background border border-rose-red/30 rounded-lg flex flex-col items-center justify-center p-6">
                            <div className="text-center">
                              {error ? (
                                <motion.div 
                                  className="text-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <h2 className="text-2xl playfair font-bold mb-2 text-destructive">Oops!</h2>
                                  <div className="mb-2 text-foreground">
                                    Could not fetch a movie. Try again!
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <h2 className="text-2xl playfair font-bold mb-2 text-rose-red text-center">
                                    {movie.title}
                                  </h2>
                                  
                                  {movie.release_date && (
                                    <motion.div 
                                      className="mb-2 text-foreground"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.5 }}
                                    >
                                      <strong>Year:</strong> {movie.release_date}
                                    </motion.div>
                                  )}
                                  
                                  {movie.vote_average && (
                                    <motion.div 
                                      className="mb-2 text-foreground"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.5 }}
                                    >
                                      <strong>Rating:</strong> {movie.vote_average}
                                    </motion.div>
                                  )}
                                  
                                  {movie.overview && (
                                    <motion.p 
                                      className="text-muted-foreground italic mb-4 text-center text-sm leading-relaxed"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.6 }}
                                    >
                                      {movie.overview}
                                    </motion.p>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={handleBack}
                      className="mt-6 w-full bg-gradient-to-r from-rose-red to-rose-red/80 hover:from-rose-red/90 hover:to-rose-red text-cream font-semibold py-3 transition-all duration-300 transform hover:scale-105 pulse-glow"
                    >
                      <div className="flex items-center justify-center">
                        <Dice6 className="w-4 h-4 mr-2" />
                        Try Another Movie
                      </div>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Call to action when no movie */}
        {!movie && !loading && (
          <div className="text-center fade-in-up" style={{animationDelay: '0.4s'}}>
            <p className="text-muted-foreground text-lg">
              Ready to discover something amazing? Click the button above!
            </p>
          </div>
        )}
      </div>

      {/* Add this CSS to your global styles or inline style block */}
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #9e005d 0%, #41575d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .playfair {
          font-family: 'Playfair Display', serif;
        }
        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(158, 0, 93, 0.3); }
          50% { box-shadow: 0 0 30px rgba(158, 0, 93, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default Random;
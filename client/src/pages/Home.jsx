import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Film, Sparkles, Star, Bug, StepBack, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedComponent, AnimatedSwitch } from '../components/transition';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";

// Genre options (common movie genres with IDs)
const genreOptions = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" }
];

const Home = () => {
  const [username, setUsername] = useState("");
  const [smallOption, setSmallOption] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [showInputCard, setShowInputCard] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      // Convert selected genres to IDs for the API request
      const genreIds = selectedGenres.map(genre => genre.id).join(',');
      
      const response = await fetch(`/api/watchList?username=${encodeURIComponent(username)}&small=${smallOption}&genres=${genreIds}`);
      const data = await response.json();

      if (response.ok) {
        setRecommendation(data);
        setError(false);
      } else {
        setRecommendation(null);
        setError(true);
      }
      setShowInputCard(false); 
    }
    catch(err) {
      setRecommendation(null);
      setError(true);
      setShowInputCard(false); 
    }
    finally {
      setLoading(false);
    }
  };

  // Update the handleBack function with a smooth transition
  const handleBack = () => {
    // First just flip the card back if it's flipped
    if (isFlipped) {
      setIsFlipped(false);
      
      // Wait for flip animation to complete before showing input card
      setTimeout(() => {
        setShowInputCard(true);
        setRecommendation(null);
        setError(false);
      }, 800); // Match your flip animation duration
    } else {
      // If card isn't flipped, use a shorter fade-out before transitioning
      setTimeout(() => {
        setShowInputCard(true);
        setRecommendation(null);
        setError(false);
      }, 150);
    }
  };

  const handleFlip = () => {
    setIsFlipped(true);
  };

  // Add this function to handle genre selection
  const handleGenreSelect = (genreId) => {
    // Find the genre name based on ID
    const genre = genreOptions.find(g => g.id === parseInt(genreId));
    
    // Don't add if already selected
    if (selectedGenres.some(g => g.id === genre.id)) {
      return;
    }
    
    setSelectedGenres(prev => [...prev, genre]);
  };

  // Add this function to remove a selected genre
  const removeGenre = (genreId) => {
    setSelectedGenres(prev => prev.filter(genre => genre.id !== genreId));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-rose-red/20 to-transparent rounded-full blur-xl float-animation"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-caribbean-current/20 to-transparent rounded-full blur-lg float-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-brown-sugar/15 to-transparent rounded-full blur-2xl float-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />

      <div className="min-h-screen flex flex-col justify-start items-center px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 mt-8 fade-in-up">
          <div className="flex items-center justify-center mb-2">
            {/* <Film className="w-10 h-10 text-rose-red mr-3 glow-effect" /> */}
            <h3 className="text-2xl font-semibold gradient-text playfair tracking-wide">letterboxdPaglu</h3>
            {/* <Sparkles className="w-6 h-6 text-cream ml-3 float-animation" /> */}
          </div>
          <div>
            <h2 className="text-lg text-rose-red font-semibold mb-1 tracking-wide">Tired of your evergrowing watchlist?</h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Say no more! Get personalized film recommendations from your Letterboxd watchlist.
            </p>
          </div>
        </div>

        {/* Main Card or Scratch Card */}
        <AnimatedSwitch value={showInputCard}>
          {(showInput) => (
            showInput ? (
              <AnimatedComponent key="input" preset="slideUp" className="w-full">
                <Card 
                  className="max-w-md w-full glass-effect texture-overlay border-2 border-rose-red/20 shadow-2xl mx-auto"
                  style={{ animationDelay: '0.2s' }}
                  key="input-card" // Add this key to force clean re-render
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl gradient-text playfair flex items-center justify-center">
                      {/* <Star className="w-6 h-6 mr-2 text-rose-red" /> */}
                      Get Your Pick
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-cream font-medium flex items-center">
                          <span className="w-2 h-2 bg-rose-red rounded-full mr-2"></span>
                          Enter your Letterboxd username:
                        </Label>
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          placeholder="e.g. johndoe"
                          required
                          className="bg-input/50 border-border/50 text-cream placeholder:text-muted-foreground focus:border-rose-red focus:ring-rose-red/20 transition-all duration-300 hover:bg-input/70"
                        />
                      </div>

                      {/* Genre selection */}
                      <div className="space-y-3">
                        <Label htmlFor="genres" className="text-cream font-medium flex items-center">
                          <span className="w-2 h-2 bg-rose-red rounded-full mr-2"></span>
                          Filter by genres (optional):
                        </Label>
                        <div className="space-y-2">
                          <Select 
                            onValueChange={handleGenreSelect} 
                            key={`genre-select-${selectedGenres.length}`} // Add this key
                          >
                            <SelectTrigger className="bg-input/50 border-border/50 text-cream">
                              <SelectValue placeholder="Select genres" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Genres</SelectLabel>
                                {genreOptions.map(genre => (
                                  <SelectItem 
                                    key={genre.id} 
                                    value={genre.id.toString()}
                                    disabled={selectedGenres.some(g => g.id === genre.id)}
                                  >
                                    {genre.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          
                          {/* Selected genres */}
                          {selectedGenres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedGenres.map(genre => (
                                <Badge 
                                  key={genre.id} 
                                  className="bg-rose-red/70 text-cream"
                                >
                                  {genre.name}
                                  <button 
                                    type="button" 
                                    className="ml-1 hover:text-cream/70"
                                    onClick={() => removeGenre(genre.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                        <Checkbox
                          id="small"
                          checked={smallOption}
                          onCheckedChange={setSmallOption}
                          className="border-rose-red/50 data-[state=checked]:bg-rose-red data-[state=checked]:border-rose-red"
                        />
                        <Label htmlFor="small" className="text-sm text-cream cursor-pointer">
                          I solemnly swear that i am upto no good.
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-rose-red to-rose-red/80 hover:from-rose-red/90 hover:to-rose-red text-cream font-semibold py-3 transition-all duration-300 transform hover:scale-105 pulse-glow"
                        disabled={loading || !smallOption}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cream mr-2"></div>
                            Searching...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Get Recommendation
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </AnimatedComponent>
            ) : (
              <AnimatedComponent key="recommendation" preset="slideUp" className="w-full">
                <Card 
                  className="mt-8 max-w-lg w-full glass-effect texture-overlay border-2 border-rose-red/30 shadow-2xl flex flex-col items-center mx-auto"
                  key="recommendation-card" // Add this key to force re-render
                >
                  <CardHeader className="text-center w-full">
                    <CardTitle className="text-2xl gradient-text playfair flex items-center justify-center flex-nowrap whitespace-nowrap">
                      {isFlipped && error ? (
                        <div className="flex items-center">
                          <span className="whitespace-nowrap">Oops!</span>
                          <Bug className="w-6 h-6 ml-2 text-destructive flex-shrink-0" />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="whitespace-nowrap">You should watch...</span>
                          <Film className="w-6 h-6 ml-2 text-rose-red flex-shrink-0" />
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 flex flex-col items-center">
                    
                    <div className="w-[320px] h-[420px] perspective-1000">
                      <motion.div 
                        className="w-full h-full relative preserve-3d"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      >
                        {/* Front - Movie Poster */}
                        <motion.div 
                          className="absolute w-full h-full backface-hidden rounded-lg overflow-hidden cursor-pointer"
                          onClick={handleFlip}
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(158, 0, 93, 0.8) 0%, rgba(65, 87, 93, 0.6) 100%)'
                          }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="text-center"
                            >
                              <h3 className="text-2xl text-cream font-medium playfair mb-3">Tap to reveal your recommendation</h3>
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

                        {/* Back - Movie Info */}
                        <motion.div 
                          className="absolute w-full h-full backface-hidden bg-background border border-rose-red/30 rounded-lg overflow-auto rotate-y-180 p-6"
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            {error ? (
                              <motion.div 
                                className="text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                              >
                                <h2 className="text-2xl playfair font-bold mb-2 text-destructive">No Films Found</h2>
                                <div className="mb-2 text-cream">
                                  Are you watching closely?
                                  <br />
                                  Because there's nothing here. 
                                  <br />
                                  (or we just ran into a <Bug className="inline w-5 h-5 text-destructive align-middle" /> )
                                </div>
                              </motion.div>
                            ) : (
                              <>
                                <motion.h2 
                                  className="text-2xl playfair font-bold mb-2 text-rose-red text-center"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  {recommendation?.title || recommendation?.name}
                                </motion.h2>
                                
                                {recommendation?.year && (
                                  <motion.div 
                                    className="mb-2 text-cream"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    <strong>Year:</strong> {recommendation.year}
                                  </motion.div>
                                )}
                                
                                {recommendation?.overview && (
                                  <motion.p 
                                    className="text-muted-foreground italic mb-4 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                  >
                                    {recommendation.overview}
                                  </motion.p>
                                )}
                                
                                <motion.a
                                  href={recommendation?.slug}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-caribbean-current to-caribbean-current/80 hover:from-caribbean-current/90 hover:to-caribbean-current text-cream rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.7 }}
                                >
                                  <span className="mr-2">View on Letterboxd</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </motion.a>
                              </>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                    <Button
                      onClick={handleBack}
                      className="mt-6 w-full bg-gradient-to-r from-rose-red to-rose-red/80 hover:from-rose-red/90 hover:to-rose-red text-cream font-semibold py-3 transition-all duration-300 transform hover:scale-105 pulse-glow"
                    >
                      <div className="flex items-center justify-center">
                        <StepBack className="w-4 h-4 mr-2" />
                        Back to Search
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedComponent>
            )
          )}
        </AnimatedSwitch>
      </div>

      {/* Add this CSS to your global styles or inline style block */}
      <style>{`
        .scratch-override, .scratch-override * {
          cursor: default !important;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Home;
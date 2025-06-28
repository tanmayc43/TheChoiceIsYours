import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, CheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppState } from '../contexts/AppStateContext';
import MatrixLoader from '../components/MatrixLoader';
import FilmCard from '../components/FilmCard';

// Genre options
const genreOptions = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 10770, name: "TV Movie" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" }
];

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Watchlist = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading, currentFilm, setCurrentFilm, prefersReducedMotion } = useAppState();
  const [username, setUsername] = useState("");
  const [smallOption, setSmallOption] = useState(false);
  const [error, setError] = useState(false);
  const [errorType, setErrorType] = useState(""); // "user_not_found" or "no_films_for_genres"
  const [showInputCard, setShowInputCard] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Reset currentFilm when component unmounts
  useEffect(() => {
    return () => {
      setCurrentFilm(null);
    };
  }, [setCurrentFilm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    setErrorType("");

    try {
      const genreIds = selectedGenres.map(genre => genre.id).join(',');
      
      const res = await fetch(`${API_BASE_URL}/api/watchlist?user=${encodeURIComponent(username)}&small=${smallOption}&genres=${genreIds}`);
      const data = await res.json();

      if (res.ok) {
        setCurrentFilm(data);
        setError(false);
      } else {
        setCurrentFilm(null);
        setError(true);
        // Check if it's a genre-specific error
        if (selectedGenres.length > 0 && data.error && data.error.includes("no films")) {
          setErrorType("no_films_for_genres");
        } else {
          setErrorType("user_not_found");
        }
      }
      setShowInputCard(false); 
    }
    catch(err) {
      setCurrentFilm(null);
      setError(true);
      setErrorType("user_not_found");
      setShowInputCard(false); 
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowInputCard(true);
    setCurrentFilm(null);
    setError(false);
    setErrorType("");
  };

  const handleGenreSelect = (genreId) => {
    const genre = genreOptions.find(g => g.id === parseInt(genreId));
    if (selectedGenres.some(g => g.id === genre.id)) {
      return;
    }
    setSelectedGenres(prev => [...prev, genre]);
  };

  const removeGenre = (genreId) => {
    setSelectedGenres(prev => prev.filter(genre => genre.id !== genreId));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
      className="min-h-screen bg-black relative overflow-hidden"
    >
      {/* Matrix Loader Overlay */}
      <MatrixLoader message="Scanning your watchlist..." isLoading={isLoading} />

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
            WATCHLIST PROTOCOL
          </h1>
          <p className="text-white/80 font-mono text-lg max-w-2xl mx-auto">
            Access your Letterboxd watchlist to choose your next cinematic experience. What you see here isn’t just curated, it’s calculated by you.
          </p>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {showInputCard ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="bg-black/80 border-2 border-matrix-green/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-mono text-matrix-green">
                    INITIALIZE CONNECTION
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label htmlFor="username" className="text-white font-mono flex items-center">
                        <span className="w-2 h-2 bg-matrix-green rounded-full mr-2"></span>
                        LETTERBOXD USERNAME:
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="enter.username"
                        required
                        className="bg-black/50 border-matrix-green/50 text-white font-mono placeholder:text-white/50 focus:border-matrix-green focus:ring-matrix-green/20"
                      />
                    </motion.div>

                    {/* Genre Selection */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label className="text-white font-mono flex items-center">
                        <span className="w-2 h-2 bg-matrix-green rounded-full mr-2"></span>
                        GENRE FILTERS (OPTIONAL):
                      </Label>
                      <Select onValueChange={handleGenreSelect}>
                        <SelectTrigger className="bg-black/50 border-matrix-green/50 text-white font-mono">
                          <SelectValue 
                            placeholder="Select genres..." 
                            className="text-white"
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-matrix-green max-h-64 overflow-y-auto" side="top">
                          <SelectGroup>
                            <SelectLabel className="text-matrix-green font-mono">GENRES</SelectLabel>
                            {genreOptions.map(genre => {
                              const isSelected = selectedGenres.some(g => g.id === genre.id);
                              return (
                                <SelectItem 
                                  key={genre.id} 
                                  value={genre.id.toString()}
                                  className="text-white hover:bg-matrix-green/30 hover:text-white focus:bg-matrix-green/30 focus:text-white data-[highlighted]:bg-matrix-green/30 data-[highlighted]:text-white"
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{genre.name}</span>
                                    {isSelected && <CheckIcon className="w-4 h-4 text-matrix-green" />}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Selected Genres Display */}
                    {selectedGenres.length > 0 && (
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Label className="text-white font-mono text-sm">SELECTED GENRES:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedGenres.map(genre => (
                            <Badge 
                              key={genre.id}
                              variant="outline" 
                              className="bg-matrix-green/20 border-matrix-green text-matrix-green font-mono"
                            >
                              {genre.name}
                              <button
                                type="button"
                                onClick={() => removeGenre(genre.id)}
                                className="ml-2 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Small Option */}
                    <motion.div 
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Checkbox
                        id="small"
                        checked={smallOption}
                        onCheckedChange={setSmallOption}
                        className="border-matrix-green data-[state=checked]:bg-matrix-green data-[state=checked]:border-matrix-green"
                      />
                      <Label htmlFor="small" className="text-white font-mono text-sm">
                        Buckle your seatbelt, Dorothy, 'cause Kansas is going bye-bye.
                      </Label>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={!username.trim()}
                        className="w-full bg-matrix-green text-black hover:bg-matrix-dark-green font-mono"
                      >
                        INITIALIZE SCAN
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              {error ? (
                <Card className="bg-black/80 border-2 border-red-500/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <p className="text-red-400 font-mono mb-4">
                      {errorType === "no_films_for_genres" 
                        ? `NO FILMS FOUND FOR SELECTED GENRES: ${selectedGenres.map(g => g.name).join(', ')}`
                        : "CONNECTION FAILED. USER NOT FOUND OR WATCHLIST EMPTY."
                      }
                    </p>
                    <Button onClick={handleBack} className="bg-red-500 hover:bg-red-600 font-mono">
                      RETRY CONNECTION
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <FilmCard film={currentFilm} onBack={handleBack} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Watchlist;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft } from "lucide-react";
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
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" }
];

const Watchlist = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading, currentFilm, setCurrentFilm, prefersReducedMotion } = useAppState();
  const [username, setUsername] = useState("");
  const [smallOption, setSmallOption] = useState(false);
  const [error, setError] = useState(false);
  const [showInputCard, setShowInputCard] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    try {
      const genreIds = selectedGenres.map(genre => genre.id).join(',');
      
      const response = await fetch(`/api/watchlist?username=${encodeURIComponent(username)}&small=${smallOption}&genres=${genreIds}`);
      const data = await response.json();

      if (response.ok) {
        setCurrentFilm(data);
        setError(false);
      } else {
        setCurrentFilm(null);
        setError(true);
      }
      setShowInputCard(false); 
    }
    catch(err) {
      setCurrentFilm(null);
      setError(true);
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

  if (isLoading) {
    return <MatrixLoader message="Scanning your watchlist..." />;
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
            WATCHLIST PROTOCOL
          </h1>
          <p className="text-white/80 font-mono text-lg max-w-2xl mx-auto">
            Access your Letterboxd watchlist and let the algorithm choose your next cinematic experience
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
                          <SelectValue placeholder="select.genres" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-matrix-green">
                          <SelectGroup>
                            <SelectLabel className="text-matrix-green font-mono">GENRES</SelectLabel>
                            {genreOptions.map(genre => (
                              <SelectItem 
                                key={genre.id} 
                                value={genre.id.toString()}
                                disabled={selectedGenres.some(g => g.id === genre.id)}
                                className="text-white font-mono hover:bg-matrix-green/20"
                              >
                                {genre.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      
                      {/* Selected Genres */}
                      <AnimatePresence>
                        {selectedGenres.length > 0 && (
                          <motion.div 
                            className="flex flex-wrap gap-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {selectedGenres.map(genre => (
                              <motion.div
                                key={genre.id} 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                <Badge className="bg-matrix-green/20 text-matrix-green border border-matrix-green/50 font-mono">
                                  {genre.name}
                                  <button 
                                    type="button" 
                                    className="ml-2 hover:text-white transition-colors"
                                    onClick={() => removeGenre(genre.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Checkbox */}
                    <motion.div 
                      className="flex items-center space-x-3 p-3 rounded border border-matrix-green/30 bg-black/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Checkbox
                        id="small"
                        checked={smallOption}
                        onCheckedChange={setSmallOption}
                        className="border-matrix-green data-[state=checked]:bg-matrix-green data-[state=checked]:border-matrix-green"
                      />
                      <Label htmlFor="small" className="text-white font-mono text-sm cursor-pointer">
                        I solemnly swear that I am up to no good.
                      </Label>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-transparent border-2 border-matrix-green text-matrix-green font-mono font-bold py-3 hover:bg-matrix-green hover:text-black transition-all duration-300"
                        disabled={isLoading || !smallOption}
                        whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        EXECUTE SEARCH
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
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
                title={error ? "ACCESS DENIED" : "FILM LOCATED"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Watchlist;
import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import { Dice6, Film, Sparkles, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Random = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRandomMovie = async () => {
    setLoading(true);
    setMovie(null);
    try{
      const res = await axios.get('/api/random');
      setMovie(res.data);
    }
    catch (err){
      setMovie({ title: "Could not fetch a movie. Try again!" });
    }
    setLoading(false);
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

        {/* Movie Result */}
        {movie && (
          <Card className="w-full glass-effect texture-overlay border-2 border-rose-red/30 shadow-2xl fade-in-up">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl gradient-text playfair flex items-center justify-center">
                <Film className="w-8 h-8 mr-3 text-rose-red" />
                {movie.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {/* Movie Details */}
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {movie.release_date && (
                    <div className="flex items-center bg-muted/30 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-rose-red rounded-full mr-2"></span>
                      <span className="text-sm text-cream">{movie.release_date}</span>
                    </div>
                  )}
                  {movie.vote_average && (
                    <div className="flex items-center bg-muted/30 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-rose-red mr-2" />
                      <span className="text-sm text-cream">{movie.vote_average}</span>
                    </div>
                  )}
                </div>

                {/* Movie Poster */}
                {movie.image && (
                  <div className="relative inline-block mb-6">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="rounded-lg shadow-2xl max-w-sm w-full mx-auto transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                  </div>
                )}

                {/* Movie Overview */}
                {movie.overview && (
                  <div className="bg-muted/20 p-6 rounded-xl border border-border/30">
                    <h3 className="text-lg font-semibold text-cream mb-3 flex items-center justify-center">
                      <span className="w-2 h-2 bg-rose-red rounded-full mr-2"></span>
                      Overview
                    </h3>
                    <p className="text-muted-foreground italic leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>
                )}

                {/* Error state styling */}
                {movie.title === "Could not fetch a movie. Try again!" && (
                  <div className="bg-destructive/20 p-6 rounded-xl border border-destructive/30">
                    <p className="text-destructive font-medium">
                      {movie.title}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to action when no movie */}
        {!movie && !loading && (
          <div className="text-center fade-in-up" style={{animationDelay: '0.4s'}}>
            <p className="text-muted-foreground text-lg">
              Ready to discover something amazing? Click the button above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Random;
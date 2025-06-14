import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Film, Sparkles, Star } from "lucide-react";

const Home = () => {
  const [username, setUsername] = useState("");
  const [smallOption, setSmallOption] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try{
      const response = await fetch(`/api/watchList?username=${encodeURIComponent(username)}&small=${smallOption}`);
      const data = await response.json();

      if (response.ok){
        setRecommendation(data);
      }
      else{
        setError(true);
      }
    }
    catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-rose-red/20 to-transparent rounded-full blur-xl float-animation"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-caribbean-current/20 to-transparent rounded-full blur-lg float-animation" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-brown-sugar/15 to-transparent rounded-full blur-2xl float-animation" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />
      
      <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <Film className="w-12 h-12 text-rose-red mr-4 glow-effect" />
            <h1 className="text-6xl font-bold gradient-text playfair">FilmPaglu</h1>
            <Sparkles className="w-8 h-8 text-cream ml-4 float-animation" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover your next favorite film from your Letterboxd watchlist with our intelligent recommendation engine
          </p>
        </div>

        {/* Main Card */}
        <Card className="max-w-md w-full glass-effect texture-overlay border-2 border-rose-red/20 shadow-2xl fade-in-up" style={{animationDelay: '0.2s'}}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text playfair flex items-center justify-center">
              <Star className="w-6 h-6 mr-2 text-rose-red" />
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
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <Checkbox
                  id="small"
                  checked={smallOption}
                  onCheckedChange={setSmallOption}
                  className="border-rose-red/50 data-[state=checked]:bg-rose-red data-[state=checked]:border-rose-red"
                />
                <Label htmlFor="small" className="text-sm text-cream cursor-pointer">
                  Small option (faster results)
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-rose-red to-rose-red/80 hover:from-rose-red/90 hover:to-rose-red text-cream font-semibold py-3 transition-all duration-300 transform hover:scale-105 pulse-glow" 
                disabled={loading}
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

        {/* Error State */}
        {error && (
          <Card className="mt-8 max-w-md w-full glass-effect border-2 border-destructive/50 fade-in-up">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <span className="w-2 h-2 bg-destructive rounded-full mr-2"></span>
                No Films Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground playfair">
                We couldn't find any films in this user's watchlist. Please check the username or try another profile.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendation Result */}
        {recommendation && (
          <Card className="mt-8 max-w-lg w-full glass-effect texture-overlay border-2 border-rose-red/30 shadow-2xl fade-in-up">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text playfair flex items-center justify-center">
                <Film className="w-6 h-6 mr-2 text-rose-red" />
                {recommendation.title || recommendation.name || "Your Recommendation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {recommendation.image && (
                  <div className="relative inline-block">
                    <img
                      src={recommendation.image}
                      alt={recommendation.name}
                      className="rounded-lg shadow-2xl max-w-xs w-full mx-auto transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                  </div>
                )}
                
                <div className="mt-6 space-y-3">
                  {recommendation.year && (
                    <div className="flex items-center justify-center text-muted-foreground">
                      <span className="w-1 h-1 bg-rose-red rounded-full mr-2"></span>
                      <strong className="text-cream mr-2">Year:</strong> 
                      {recommendation.year}
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <a
                      href={recommendation.slug}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-caribbean-current to-caribbean-current/80 hover:from-caribbean-current/90 hover:to-caribbean-current text-cream rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <span className="mr-2">View on Letterboxd</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";


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
    <>
    <Navbar />
    <Card className="max-w-md mx-auto mt-20 p-6">
      <CardHeader>
        <CardTitle>FilmPaglu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Enter your Letterboxd username:</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              required
              className="mt-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="small"
              checked={smallOption}
              onCheckedChange={setSmallOption}
            />
            <Label htmlFor="small" className="text-sm">Small option</Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Get Recommendation"}
          </Button>
        </form>
      </CardContent>
    </Card>
    {error && (
      <Card className="mt-6 bg-red-100">
        <CardHeader>
          <CardTitle>No Films Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            We couldn't find any films in this user's watchlist. Please check the username or try another profile.
          </div>
        </CardContent>
      </Card>
    )}
    {recommendation && (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{recommendation.title || recommendation.name || "Recommendation"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <img
              src={recommendation.image}
              alt={recommendation.name}
              className="mb-2 rounded w-full max-w-xs"
            />
            <div><strong>Year:</strong> {recommendation.year}</div>
            <div>
              <a
                href={recommendation.slug}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View on Letterboxd
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
    </>
  );
};

export default Home;
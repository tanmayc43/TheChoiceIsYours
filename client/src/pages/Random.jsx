import React, { useState } from "react";
import axios from "axios";

const Random = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRandomMovie = async () => {
    setLoading(true);
    setMovie(null);
    try {
      // backend returns a single movie object
      const res = await axios.get("/api/random");
      setMovie(res.data);
    } catch (err) {
      setMovie({ title: "Could not fetch a movie. Try again!" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-16 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">I'm Feeling Lucky</h1>
      <button
        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-lg rounded shadow mb-8 disabled:opacity-50"
        onClick={getRandomMovie}
        disabled={loading}
      >
        {loading ? "Loading..." : "🍿 Cue the Popcorn!"}
      </button>
      {movie && (
        <div className="w-full border rounded p-6 text-center animate-fade-in">
          <div className="text-2xl font-semibold mb-2">{movie.title}</div>
          {movie.release_date && (
            <div className="text-gray-500 mb-2">{movie.release_date}</div>
          )}
          {movie.vote_average && (
            <div className="mb-2">Rating: {movie.vote_average}</div>
          )}
          {movie.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
              className="mx-auto mb-4 rounded shadow"
            />
          )}
          <div className="italic">{movie.overview}</div>
        </div>
      )}
    </div>
  );
};

export default Random;
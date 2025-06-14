import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import axios from "axios";
import Navbar from "../components/navbar";

// Trakt.tv genre slugs
const GENRES = [
	{ slug: "action", name: "Action" },
	{ slug: "adventure", name: "Adventure" },
	{ slug: "animation", name: "Animation" },
	{ slug: "anime", name: "Anime" },
	{ slug: "biography", name: "Biography" },
	{ slug: "children", name: "Children" },
	{ slug: "comedy", name: "Comedy" },
	{ slug: "crime", name: "Crime" },
	{ slug: "documentary", name: "Documentary" },
	{ slug: "drama", name: "Drama" },
	{ slug: "family", name: "Family" },
	{ slug: "fantasy", name: "Fantasy" },
	{ slug: "game-show", name: "Game Show" },
	{ slug: "history", name: "History" },
	{ slug: "holiday", name: "Holiday" },
	{ slug: "horror", name: "Horror" },
	{ slug: "music", name: "Music" },
	{ slug: "musical", name: "Musical" },
	{ slug: "mystery", name: "Mystery" },
	{ slug: "news", name: "News" },
	{ slug: "reality", name: "Reality" },
	{ slug: "romance", name: "Romance" },
	{ slug: "science-fiction", name: "Science Fiction" },
	{ slug: "sport", name: "Sport" },
	{ slug: "supernatural", name: "Supernatural" },
	{ slug: "talk-show", name: "Talk Show" },
	{ slug: "thriller", name: "Thriller" },
	{ slug: "war", name: "War" },
	{ slug: "western", name: "Western" },
];

export default function Recommend() {
	const [selected, setSelected] = useState([]);
	const [recommendations, setRecommendations] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleGenreChange = (value) => {
		setSelected(value);
	};

	const fetchRecommendations = async () => {
		if (selected.length === 0) return;
		setLoading(true);
		try {
			// send selected genre slugs as a comma-separated string
			const genreSlugs = selected.join(",");
			const res = await axios.get(`/api/recommend?genres=${genreSlugs}`);
			setRecommendations(res.data.recommendations || []);
		} catch (err) {
			setRecommendations([]);
		}
		setLoading(false);
	};

	return(
        <>
            <Navbar />
            <div className="max-w-xl mx-auto py-8">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    Get Movie Recommendations
                </h1>
                <ToggleGroup
                    type="multiple"
                    value={selected}
                    onValueChange={handleGenreChange}
                    className="flex flex-wrap gap-2 mb-4 justify-center"
                >
                    {GENRES.map((genre) => (
                        <ToggleGroupItem key={genre.slug} value={genre.slug}>
                            {genre.name}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
                <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 transition mb-6"
                    onClick={fetchRecommendations}
                    disabled={selected.length === 0 || loading}
                >
                    {loading ? "Loading..." : "Get Recommendations"}
                </button>
                <div className="mt-6">
                    {recommendations.length > 0 && (
                        <ul className="space-y-4">
                            {recommendations.map((movie) => (
                                <li
                                    key={movie.ids?.trakt || movie.title}
                                    className="border p-4 rounded shadow bg-white"
                                >
                                    <div className="font-semibold text-lg">{movie.title}</div>
                                    {movie.year && (
                                        <div className="text-sm text-gray-500">{movie.year}</div>
                                    )}
                                    {movie.rating && (
                                        <div className="text-sm mb-2">Rating: {movie.rating}</div>
                                    )}
                                    {movie.images?.poster && (
                                        <img
                                            src={movie.images.poster}
                                            alt={movie.title}
                                            className="mt-2 rounded mx-auto"
                                        />
                                    )}
                                    <div className="mt-2 text-gray-700">{movie.overview}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!loading && recommendations.length === 0 && (
                        <div className="text-center text-gray-500 mt-8">
                            Select genres and click "Get Recommendations"!
                        </div>
                    )}
                </div>
            </div>
        </>
	);
}
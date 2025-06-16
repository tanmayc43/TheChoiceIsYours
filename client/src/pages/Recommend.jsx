import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Navbar from "../components/navbar";
import { Film, Sparkles, Star, Calendar } from "lucide-react";

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
	const [userPrompt, setUserPrompt] = useState("");
	const [parsing, setParsing] = useState(false);

	const handleGenreChange = (value) => {
		setSelected(value);
	};

	const fetchRecommendations = async () => {
		if (selected.length === 0) return;
		setLoading(true);
		try {
			const genreSlugs = selected.join(",");
			const res = await axios.get(`/api/recommend?genres=${genreSlugs}`);
			setRecommendations(res.data.recommendations || []);
		} catch (err) {
			setRecommendations([]);
		}
		setLoading(false);
	};

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-rose-red/15 to-transparent rounded-full blur-xl float-animation"></div>
				<div className="absolute top-60 right-10 w-24 h-24 bg-gradient-to-br from-caribbean-current/20 to-transparent rounded-full blur-lg float-animation" style={{animationDelay: '1s'}}></div>
				<div className="absolute bottom-40 right-1/4 w-40 h-40 bg-gradient-to-br from-brown-sugar/10 to-transparent rounded-full blur-2xl float-animation" style={{animationDelay: '2s'}}></div>
			</div>

			<Navbar />
			
			<div className="max-w-4xl mx-auto py-12 px-4 relative z-10">
				{/* Hero Section */}
				<div className="text-center mb-12 fade-in-up">
					<div className="flex items-center justify-center mb-6">
						<Star className="w-12 h-12 text-rose-red mr-4 glow-effect" />
						<h1 className="text-5xl font-bold gradient-text playfair">Movie Recommendations</h1>
						<Sparkles className="w-8 h-8 text-cream ml-4 float-animation" />
					</div>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						Select your favorite genres and discover curated movie recommendations tailored to your taste
					</p>
				</div>

				{/* Genre Selection */}
				{/* <Card className="mb-8 glass-effect texture-overlay border-2 border-rose-red/20 shadow-xl fade-in-up" style={{animationDelay: '0.2s'}}>
					<CardHeader className="text-center">
						<CardTitle className="text-2xl gradient-text playfair flex items-center justify-center">
							<Film className="w-6 h-6 mr-2 text-rose-red" />
							Choose Your Genres
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<ToggleGroup
							type="multiple"
							value={selected}
							onValueChange={handleGenreChange}
							className="flex flex-wrap gap-3 justify-center"
						>
							{GENRES.map((genre) => (
								<ToggleGroupItem 
									key={genre.slug} 
									value={genre.slug}
									className="px-4 py-2 rounded-full border-2 border-border/50 bg-muted/20 text-cream hover:bg-rose-red/20 hover:border-rose-red/50 data-[state=on]:bg-rose-red data-[state=on]:border-rose-red data-[state=on]:text-cream transition-all duration-300 transform hover:scale-105"
								>
									{genre.name}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
						
						<div className="text-center pt-4">
							<Button
								onClick={fetchRecommendations}
								disabled={selected.length === 0 || loading}
								className="px-8 py-3 bg-gradient-to-r from-rose-red to-rose-red/80 hover:from-rose-red/90 hover:to-rose-red text-cream font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<div className="flex items-center">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cream mr-2"></div>
										Finding Movies...
									</div>
								) : (
									<div className="flex items-center">
										<Sparkles className="w-4 h-4 mr-2" />
										Get Recommendations ({selected.length} genre{selected.length !== 1 ? 's' : ''} selected)
									</div>
								)}
							</Button>
						</div>
					</CardContent>
				</Card> */}

				{/* AI Genre Suggestion */}
				<div className="mb-8 flex gap-2 items-center justify-center">
					<input
						type="text"
						value={userPrompt}
						onChange={e => setUserPrompt(e.target.value)}
						placeholder="Describe the kind of movie you want (e.g. funny space adventure with romance)"
						className="w-full max-w-md p-2 rounded border border-rose-red/40 text-black"
					/>
					<Button
						onClick={async () => {
							if (!userPrompt) return;
							setParsing(true);
							try {
								const res = await axios.post("/api/parse-genres", { prompt: userPrompt });
								setSelected(res.data.genres || []);
							} catch {
								alert("Could not parse genres from your description.");
							}
							setParsing(false);
						}}
						disabled={parsing || !userPrompt}
						className="bg-rose-red text-cream px-4 py-2 rounded"
					>
						{parsing ? "Thinking..." : "AI Suggest"}
					</Button>
				</div>

				{/* Recommendations Results */}
				<div className="space-y-6">
					{recommendations.length > 0 && (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{recommendations.map((movie, index) => (
								<Card
									key={movie.ids?.trakt || movie.title || index}
									className="glass-effect texture-overlay border-2 border-rose-red/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 fade-in-up"
									style={{animationDelay: `${index * 0.1}s`}}
								>
									<CardContent className="p-6 space-y-4">
										<div className="text-center">
											<h3 className="font-bold text-xl text-cream mb-2 playfair">
												{movie.title}
											</h3>
											
											<div className="flex flex-wrap justify-center gap-2 mb-4">
												{movie.year && (
													<div className="flex items-center bg-muted/30 px-2 py-1 rounded-full">
														<Calendar className="w-3 h-3 text-rose-red mr-1" />
														<span className="text-xs text-cream">{movie.year}</span>
													</div>
												)}
												{movie.rating && (
													<div className="flex items-center bg-muted/30 px-2 py-1 rounded-full">
														<Star className="w-3 h-3 text-rose-red mr-1" />
														<span className="text-xs text-cream">{movie.rating}</span>
													</div>
												)}
											</div>

											{movie.images?.poster && (
												<div className="relative mb-4">
													<img
														src={movie.images.poster}
														alt={movie.title}
														className="rounded-lg shadow-lg mx-auto max-h-64 object-cover transition-transform duration-300 hover:scale-105"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
												</div>
											)}

											{movie.overview && (
												<div className="bg-muted/20 p-4 rounded-lg border border-border/30">
													<p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
														{movie.overview}
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{!loading && recommendations.length === 0 && selected.length > 0 && (
						<Card className="glass-effect border-2 border-border/30 fade-in-up">
							<CardContent className="p-8 text-center">
								<Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground text-lg">
									No recommendations found for the selected genres. Try different combinations!
								</p>
							</CardContent>
						</Card>
					)}

					{!loading && recommendations.length === 0 && selected.length === 0 && (
						<Card className="glass-effect border-2 border-border/30 fade-in-up">
							<CardContent className="p-8 text-center">
								<Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground text-lg">
									Select your favorite genres above to get personalized movie recommendations!
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
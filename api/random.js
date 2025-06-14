const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;

export default async function handler(req, res) {
  try {
    // fetches a page of movies (e.g. popular)
    const url = `https://api.watchmode.com/v1/list-titles/?apiKey=${WATCHMODE_API_KEY}&types=movie&limit=100`;
    const { data } = await axios.get(url);

    if (!data.titles || !data.titles.length) {
      return res.status(404).json({ error: "No movies found." });
    }

    // picks a random movie
    const randomIndex = Math.floor(Math.random() * data.titles.length);
    const movie = data.titles[randomIndex];

    // fetch poster image for the movie
    let image = null;
    if (movie && movie.id) {
      try {
        const detailsUrl = `https://api.watchmode.com/v1/title/${movie.id}/details/?apiKey=${WATCHMODE_API_KEY}`;
        const { data: details } = await axios.get(detailsUrl);
        if (details.poster) {
          // If poster is a filename, prepend the CDN URL
          image = details.poster.startsWith('http')
            ? details.poster
            : `https://cdn.watchmode.com/posters/${details.poster}`;
        }
      } catch (imgErr) {
        image = null;
      }
    }

    return res.status(200).json({ ...movie, image });
  } 
  catch(err){
    console.error("Watchmode error:", err.message);
    return res.status(500).json({ error: "Failed to fetch random movie." });
  }
}
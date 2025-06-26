import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  const cacheKey = 'random:movie';
  
  try {
    const url = `https://api.watchmode.com/v1/list-titles/?apiKey=${process.env.WATCHMODE_API_KEY}&types=movie&limit=100`;
    const { data } = await axios.get(url);

    if (!data.titles || !data.titles.length) {
      return res.status(404).json({ error: "No movies found." });
    }

    const randomIndex = Math.floor(Math.random() * data.titles.length);
    const movie = data.titles[randomIndex];

    // Fetch poster image
    let image = null;
    if (movie && movie.id) {
      try {
        const detailsUrl = `https://api.watchmode.com/v1/title/${movie.id}/details/?apiKey=${process.env.WATCHMODE_API_KEY}`;
        const { data: details } = await axios.get(detailsUrl);
        if (details.poster) {
          image = details.poster.startsWith('http')
            ? details.poster
            : `https://cdn.watchmode.com/posters/${details.poster}`;
        }
      } catch (imgErr) {
        image = null;
      }
    }

    const result = { ...movie, image };
    res.json(result);
    
  } catch (err) {
    console.error("Watchmode error:", err.message);
    res.status(500).json({ error: "Failed to fetch random movie." });
  }
});

export default router;
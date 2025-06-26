import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  const { genres, limit = 5 } = req.query;
  
  if (!genres) {
    return res.status(400).json({ 
      error: "genres required (comma-separated genre slugs, e.g. action,comedy)" 
    });
  }

  try {
    const url = `https://api.trakt.tv/movies/popular?genres=${genres}&limit=100`;

    const { data } = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.TRAKT_CLIENT_ID,
      },
    });

    if (!data || !data.length) {
      return res.status(404).json({ error: "No movies found for these genres." });
    }

    const shuffled = data.sort(() => 0.5 - Math.random());
    const result = { recommendations: shuffled.slice(0, limit) };
    
    res.json(result);
    
  } catch (err) {
    console.error("Trakt.tv error:", err.message);
    res.status(500).json({ error: "Failed to fetch recommendations." });
  }
});

export default router;
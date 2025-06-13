const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;

export default async function handler(req, res) {
  try {

    const clientKey = req.headers['x-client-key'];
    if(!clientKey || clientKey !== process.env.MY_SECRET_KEY_HEHE){
        return res.status(401).json({ error: "Forbidden Access." });
    }

    // fetches a page of movies (e.g. popular)
    const url = `https://api.watchmode.com/v1/list-titles/?apiKey=${WATCHMODE_API_KEY}&types=movie&limit=100`;
    const { data } = await axios.get(url);

    if (!data.titles || !data.titles.length) {
      return res.status(404).json({ error: "No movies found." });
    }

    // picks a random movie
    const randomIndex = Math.floor(Math.random() * data.titles.length);
    const movie = data.titles[randomIndex];

    return res.status(200).json(movie);
  } 
  catch(err){
    console.error("Watchmode error:", err.message);
    return res.status(500).json({ error: "Failed to fetch random movie." });
  }
}
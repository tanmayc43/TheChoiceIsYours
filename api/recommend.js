const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;


/*
Trakt.tv genre slugs (use in ?genres=...):

action
adventure
animation
anime
biography
children
comedy
crime
documentary
drama
family
fantasy
game-show
history
holiday
horror
music
musical
mystery
news
reality
romance
science-fiction
sport
supernatural
talk-show
thriller
war
western
*/


export default async function handler(req, res){
    
    const clientKey = req.headers['x-client-key'];
    if(!clientKey || clientKey !== process.env.MY_SECRET_KEY_HEHE){
        return res.status(401).json({ error: "Forbidden Access." });
    }

    const { genres, limit = 5 } = req.query;
    if(!genres){
        return res.status(400).json({ error: "genres required (comma-separated genre slugs, e.g. action,comedy)" });
    }

    try{
        // Trakt.tv expects genre slugs, not IDs (e.g. "action,comedy") unlike Watchmode
        // using the /movies/popular endpoint with genres filter for a broad pool with limit of 100 on free API
        const url = `https://api.trakt.tv/movies/popular?genres=${genres}&limit=100`;

        const { data } = await axios.get(url, {
        headers: {
            "Content-Type": "application/json",
            "trakt-api-version": "2",
            "trakt-api-key": TRAKT_CLIENT_ID,
        },
        });

        if(!data || !data.length){
        return res.status(404).json({ error: "No movies found for these genres." });
        }

        // shuffles the results for randomness
        const shuffled = data.sort(() => 0.5 - Math.random());

        // returning up to 5 recommendations
        return res.status(200).json({ recommendations: shuffled.slice(0, limit) });
    }
    catch(err){
        console.error("Trakt.tv error:", err.message);
        return res.status(500).json({ error: "Failed to fetch recommendations." });
    }
}
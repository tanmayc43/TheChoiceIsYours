import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { callPythonScraper } from '../server.js';

const router = express.Router();

// Genre ID to Letterboxd slug mapping
const genreIdToSlug = {
  28: "action", 12: "adventure", 16: "animation", 35: "comedy",
  80: "crime", 99: "documentary", 18: "drama", 10751: "family",
  14: "fantasy", 36: "history", 27: "horror", 10402: "music",
  9648: "mystery", 10749: "romance", 878: "sci-fi", 53: "thriller",
  10752: "war", 37: "western"
};

const MAX_PAGES = 10;
const MAX_FILMS = 250;

router.get('/', async (req, res) => {
  const { username, genres } = req.query;
  
  if(!username){
    return res.status(400).json({ error: "Username required" });
  }

  // Validate username format
  if (typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: "Invalid username format" });
  }

  // Validate genres if provided
  if (genres) {
    const genreArray = genres.split(',');
    const validGenres = Object.keys(genreIdToSlug).map(id => parseInt(id));
    const invalidGenres = genreArray.filter(genre => !validGenres.includes(parseInt(genre)));
    if (invalidGenres.length > 0) {
      return res.status(400).json({ error: "Invalid genre IDs provided" });
    }
  }

  try {
    // Step 1: Fast scraping with Node.js/Cheerio
    const films = await scrapeWatchlistFast(username, genres);
    
    if (films.length === 0) {
      return res.status(404).json({ 
        error: genres ? "No films found matching the selected genres." : "No films found in watchlist."
      });
    }

    // Step 2: Select random film (fresh selection each time)
    const randomFilm = films[Math.floor(Math.random() * films.length)];
    
    // Step 3: Get poster with Python scraper (async)
    let filmWithPoster = { ...randomFilm };
    
    if (randomFilm.filmPath) {
      try {
        console.log('🐍 Calling Python scraper for:', randomFilm.name);
        const scrapedData = await callPythonScraper(`https://letterboxd.com${randomFilm.filmPath}`);
        
        filmWithPoster = {
          ...randomFilm,
          image: scrapedData.poster || 'https://watchlistpicker.com/noimagefound.jpg',
          overview: scrapedData.overview || randomFilm.overview
        };
      } catch (error) {
        console.error('Python scraper error:', error.message);
        filmWithPoster.image = 'https://watchlistpicker.com/noimagefound.jpg';
      }
    }

    res.json(filmWithPoster);
    
  } catch (error) {
    console.error('Watchlist error:', error.message);
    
    // More specific error messages based on error type
    if (error.message.includes('timeout')) {
      res.status(500).json({ error: "Request timed out. Please try again." });
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      res.status(500).json({ error: "Unable to connect to Letterboxd. Please try again later." });
    } else if (error.message.includes('404')) {
      res.status(404).json({ error: "User not found or watchlist is private." });
    } else {
      res.status(500).json({ error: "Failed to fetch watchlist." });
    }
  }
});

async function scrapeWatchlistFast(username, genres) {
  const selectedGenres = genres ? genres.split(',').map(id => parseInt(id)) : [];
  const hasGenreFilter = selectedGenres.length > 0;

  const client = axios.create({
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    timeout: 10000
  });

  let films = [];
  let page = 1;
  let hasNext = true;

  // Build URL with genre filters
  let baseUrl = `https://letterboxd.com/${username}/watchlist`;
  if (hasGenreFilter) {
    const genreSlugs = selectedGenres
      .map(id => genreIdToSlug[id])
      .filter(slug => slug !== undefined);
    if (genreSlugs.length > 0) {
      const genreParams = genreSlugs.join('+');
      baseUrl = `https://letterboxd.com/${username}/watchlist/genre/${genreParams}`;
    }
  }

  console.log(`🔍 Scraping: ${baseUrl}`);

  // Fast scraping - only get basic film data
  while (hasNext && page <= MAX_PAGES && films.length < MAX_FILMS) {
    const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}/`;
    
    try {
      const { data } = await client.get(url);
      const $ = cheerio.load(data);
      let filmsOnThisPage = 0;

      $(".poster-container").each((_, el) => {
        if (films.length >= MAX_FILMS) return false;

        const poster = $(el).find(".film-poster").first();
        const posterImg = poster.find("img");
        const name = posterImg.attr("alt");

        if (!name) return;

        const link = poster.attr("data-target-link");
        const slug = poster.attr("data-film-slug");
        if (!slug || !link) return;

        // Extract year from URL
        let year = null;
        const yearMatch = link.match(/\/films\/(\d{4})\//);
        if (yearMatch && yearMatch[1]) {
          year = yearMatch[1];
        }

        films.push({
          name,
          slug: `https://letterboxd.com${link}`,
          image: "",
          year,
          filmPath: link,
          overview: ""
        });

        filmsOnThisPage += 1;
      });

      if (filmsOnThisPage === 0) {
        hasNext = false;
        break;
      }

      const nextLink = $('.pagination a.next');
      hasNext = nextLink.length > 0;
      page += 1;

    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      hasNext = false;
    }
  }

  return films;
}

export default router;
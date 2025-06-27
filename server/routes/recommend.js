import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { callPythonScraper } from '../server.js';

dotenv.config();
const router = express.Router();

// --- Gemini AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateMovieRecommendation(userPrompt, res) {
  // --- PROMPT MODIFICATION ---
  // The instructions have been updated to be less strict about popularity.
  const systemPrompt = `
    You are an expert movie recommendation assistant.
    Your task is to find a single, real movie that is a great match for the user's request.

    **CRITICAL RULES:**
    1.  The movie should have a reasonable level of public or critical recognition. Avoid extremely obscure, niche, or hard-to-find films.
    2.  The movie MUST have already been officially released to the public. Do not recommend upcoming, unreleased, or festival-only films.
    3.  You MUST respond with ONLY a valid JSON object. Do not add any other text, explanations, or markdown formatting.

    The JSON object must have the following structure:
    {
      "name": "The Movie Title",
      "year": "YYYY",
      "overview": "A brief, one-sentence summary of the movie.",
      "slug": "The full, valid Letterboxd URL for the movie."
    }
  `;

  try {
    // Step 1: Get the movie identity and Letterboxd URL from Gemini.
    const result = await model.generateContent([systemPrompt, `User prompt: "${userPrompt}"`]);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const movieData = JSON.parse(jsonString);

    // Step 2: Use the Python scraper to get the definitive poster and overview.
    if (movieData.slug && movieData.slug.startsWith('http')) {
      try {
        console.log(`🐍 Calling Python scraper for AI recommendation: ${movieData.name}`);
        const scrapedData = await callPythonScraper(movieData.slug);
        
        movieData.image = scrapedData.poster || 'https://watchlistpicker.com/noimagefound.jpg';
        movieData.overview = scrapedData.overview || movieData.overview;

      } catch (pythonError) {
        console.error('Python scraper error:', pythonError.message);
        movieData.image = 'https://watchlistpicker.com/noimagefound.jpg';
      }
    } else {
      movieData.image = 'https://watchlistpicker.com/noimagefound.jpg';
    }

    // Step 3: Send the final, combined data to the frontend.
    res.json(movieData);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to get a recommendation from the AI model.' });
  }
}

// --- API Endpoint ---
router.get('/', async (req, res) => {
  const { prompt } = req.query;
  const userPrompt = prompt || "Give me a recommendation for a single, interesting, and critically acclaimed movie from any genre or era.";
  return generateMovieRecommendation(userPrompt, res);
});

export default router;
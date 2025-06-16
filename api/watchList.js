const axios = require("axios");
const cheerio = require("cheerio");

// limits prevent excessive requests
const MAX_PAGES = 10;
const MAX_FILMS_WITHOUT_FILTER = 250;

// Genre ID to Letterboxd slug mapping
const genreIdToSlug = {
  28: "action",
  12: "adventure",
  16: "animation",
  35: "comedy",
  80: "crime",
  99: "documentary",
  18: "drama",
  10751: "family",
  14: "fantasy",
  36: "history",
  27: "horror",
  10402: "music",
  9648: "mystery",
  10749: "romance",
  878: "sci-fi",
  53: "thriller",
  10752: "war",
  37: "western"
};

export default async function handler(req, res) {
  const { username, genres } = req.query;
  if(!username){
    return res.status(400).json({ error: "Username required" });
  }

  // parse selected genres if provided
  const selectedGenres = genres ? genres.split(',').map(id => parseInt(id)) : [];
  const hasGenreFilter = selectedGenres.length > 0;

  try{
    const client = axios.create({
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
      timeout: 7000
    });
    
    let films = [];
    let page = 1;
    let hasNext = true;
    
    // base URL (adding genre filters if specified)
    let baseUrl =`https://letterboxd.com/${username}/watchlist`;
    if(hasGenreFilter){
      // genre IDs to Letterboxd slugs
      const genreSlugs = selectedGenres
        .map(id => genreIdToSlug[id])
        .filter(slug => slug !== undefined);
      if(genreSlugs.length > 0){
        // using Letterboxd's built-in genre filtering
        // Format: username/watchlist/genre/drama/genre/action
        const genreParams = genreSlugs.join('+');
        baseUrl = `https://letterboxd.com/${username}/watchlist/genre/${genreParams}`;
      }
    }

    console.log(`Using base URL: ${baseUrl}`);
    
    // fetching films from watchlist/base URL
    while(hasNext && page <= MAX_PAGES && films.length < MAX_FILMS_WITHOUT_FILTER){
      const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}/`;
      
      try{
        const { data } = await client.get(url);
        const $ = cheerio.load(data);
        let filmsOnThisPage = 0;
        
        // selecting film posters from the page - collecting only basic data
        $(".poster-container").each((_, el) => {
          if(films.length >= MAX_FILMS_WITHOUT_FILTER) return false; // Break early if enough
          
          const poster = $(el).find(".film-poster").first();
          const posterImg = poster.find("img");
          const name = posterImg.attr("alt");
          
          if (!name) return; // Skip entries with no name
          
          const link = poster.attr("data-target-link");
          const slug = poster.attr("data-film-slug");
          if (!slug || !link) return; // Skip entries with no slug or link
          
          // Extract year from the film URL if possible
          let year = null;
          const yearMatch = link.match(/\/films\/(\d{4})\//);
          if(yearMatch && yearMatch[1]){
            year = yearMatch[1];
          }
          
          films.push({
            name,
            slug: `https://letterboxd.com${link}`,
            image: "", // We'll fetch this later for the selected film only
            year,
            filmPath: link,
            overview: ""
          });
          
          filmsOnThisPage += 1;
        });

        // pagination and termination logic
        if(filmsOnThisPage === 0){
          hasNext = false;
          break;
        }

        const nextLink = $('.pagination a.next');
        hasNext = nextLink.length > 0;
        page += 1;
        
      }
      catch(error){
        console.error(`Error fetching page ${page}:`, error.message);
        hasNext = false; // Stop on error
      }
    }

    if(films.length === 0){
      return res.status(404).json({ error: hasGenreFilter ? 
        "No films found matching the selected genres." : 
        "No films found in watchlist." 
      });
    }

    // returning a random film from the filtered list
    const randomFilm = films[Math.floor(Math.random() * films.length)];
    
    // Now fetch both the overview AND the poster image for just the random film
    if(randomFilm.filmPath){
      try{
        // Use more browser-like headers
        const filmUrl = `https://letterboxd.com${randomFilm.filmPath}`;
        console.log(`Fetching details from: ${filmUrl}`);
        
        const { data } = await client.get(filmUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://letterboxd.com/",
          }
        });
        
        const $detail = cheerio.load(data);
        
        // Get the overview
        const overview = $detail('.film-text p').first().text().trim();
        if (overview) {
          randomFilm.overview = overview;
        }
        
        // POSTER EXTRACTION - Based on the HTML structure from the image
        console.log(`Extracting poster for: ${randomFilm.name}`);

        // Try multiple selectors based on the HTML structure shown in the image
        let posterUrl = null;

        // Method 1: Look for the poster in the poster-list section
        const posterListLink = $detail('section.poster-list a[data-js-trigger="postermodal"]').first();
        if (posterListLink.length > 0) {
          posterUrl = posterListLink.attr('href');
          console.log(`✓ Found poster via poster-list: ${posterUrl}`);
        }

        // Method 2: Look for poster in the film poster component
        if (!posterUrl) {
          const filmPosterImg = $detail('.film-poster img').first();
          if (filmPosterImg.length > 0) {
            posterUrl = filmPosterImg.attr('src');
            console.log(`✓ Found poster via film-poster img: ${posterUrl}`);
          }
        }

        // Method 3: Look for poster in react component data
        if (!posterUrl) {
          const reactPoster = $detail('.react-component.poster').first();
          if (reactPoster.length > 0) {
            const dataFilmPoster = reactPoster.attr('data-film-poster');
            if (dataFilmPoster) {
              posterUrl = dataFilmPoster;
              console.log(`✓ Found poster via react component: ${posterUrl}`);
            }
          }
        }

        // Method 4: Look for any img with film poster in the src
        if (!posterUrl) {
          $detail('img').each((_, img) => {
            const src = $detail(img).attr('src');
            if (src && (src.includes('image-150') || src.includes('image-230') || src.includes('/film/'))) {
              posterUrl = src;
              console.log(`✓ Found poster via img search: ${posterUrl}`);
              return false; // break the loop
            }
          });
        }

        // Set the poster URL or use default
        if (posterUrl && !posterUrl.includes('empty-poster')) {
          // Ensure it's a full URL
          if (posterUrl.startsWith('//')) {
            posterUrl = 'https:' + posterUrl;
          } else if (posterUrl.startsWith('/')) {
            posterUrl = 'https://letterboxd.com' + posterUrl;
          }
          randomFilm.image = posterUrl;
          console.log(`✓ Final poster URL: ${randomFilm.image}`);
        } else {
          randomFilm.image = 'https://watchlistpicker.com/noimagefound.jpg';
          console.log(`✗ No valid poster found for ${randomFilm.name}, using default`);
        }
      }
      catch (error){
        console.log(`Error fetching film details: ${error.message}`);
        randomFilm.image = 'https://watchlistpicker.com/noimagefound.jpg';
      }
    }
    
    return res.status(200).json(randomFilm);
  }
  catch (err) {
    console.error ("Error in handler:", err.message);
    return res.status(500).json({ error: "Failed to fetch watchlist." });
  }
}
package scraper

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gocolly/colly/v2"
)

type Film struct {
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	Image    string `json:"image"`
	Year     string `json:"year"`
	FilmPath string `json:"filmPath"`
	Overview string `json:"overview"`
}

// ScrapeWatchlist scrapes a Letterboxd watchlist using Colly with high parallelism
func ScrapeWatchlist(username, genres string) ([]Film, error) {
	var films []Film
	var mu sync.Mutex
	processedFilms := make(map[string]bool)
	maxFilms := 50 // Limit to 50 films for performance

	// Build start URL
	startURL := "https://letterboxd.com/" + username + "/watchlist/"
	if genres != "" {
		genreSlugs := convertGenreIDs(genres)
		log.Printf("DEBUG: Converting genres '%s' to slugs: %v", genres, genreSlugs)
		if len(genreSlugs) > 0 {
			startURL = startURL + "genre/" + strings.Join(genreSlugs, "+") + "/"
		} else {
			return nil, fmt.Errorf("no valid genres found for IDs: %s", genres)
		}
	}

	log.Printf("DEBUG: Scraping watchlist from URL: %s", startURL)

	// Secondary collector for AJAX poster endpoints (following original repo pattern)
	ajc := colly.NewCollector(
		colly.Async(true),
	)
	ajc.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 100})

	// Film detail collector for overview and better poster data - OPTIMIZED
	filmCollector := colly.NewCollector(
		colly.Async(true),
	)
	filmCollector.Limit(&colly.LimitRule{
		DomainGlob:  "*letterboxd.com*",
		Parallelism: 20,                     // Reduced from 50 to 20
		RandomDelay: 100 * time.Millisecond, // Reduced from 500ms to 100ms
	})

	// AJAX poster endpoint constants (from original repo)
	const urlscrape = "https://letterboxd.com/ajax/poster"
	const urlEnd = "/std/125x187/"

	// Extract poster data from AJAX endpoint (following original repo pattern exactly)
	ajc.OnHTML("div.film-poster", func(e *colly.HTMLElement) {
		name := e.Attr("data-film-name")
		slug := e.Attr("data-film-link")
		img := e.ChildAttr("img", "src")
		year := e.Attr("data-film-release-year")

		if name == "" || slug == "" {
			return
		}

		fullSlug := "https://letterboxd.com" + slug

		log.Printf("DEBUG: AJAX found poster for %s: %s", name, img)

		// Check if already processed this film
		mu.Lock()
		if processedFilms[fullSlug] {
			mu.Unlock()
			return
		}
		processedFilms[fullSlug] = true
		mu.Unlock()

		// Check if reached the film limit
		mu.Lock()
		if len(films) >= maxFilms {
			mu.Unlock()
			return
		}
		mu.Unlock()

		// Add film to list with real poster URL
		mu.Lock()
		films = append(films, Film{
			Name:     name,
			Slug:     fullSlug,
			Image:    makeBigger(img), // Real poster URL from AJAX
			Year:     year,
			FilmPath: slug,
			Overview: "",
		})
		mu.Unlock()

		// Only visit film page for overview if less than 10 films present coz for performance
		mu.Lock()
		filmCount := len(films)
		mu.Unlock()

		if filmCount <= 10 {
			// Visit film page to get overview and better poster
			filmCollector.Visit(fullSlug)
		}
	})

	// Handle overview extraction from film detail pages
	filmCollector.OnHTML(".film-overview p", func(e *colly.HTMLElement) {
		overview := e.Text

		log.Printf("DEBUG: Found overview for %s: %s", e.Request.URL.String(), overview[:min(len(overview), 50)])

		// Update the film with overview
		mu.Lock()
		for i := range films {
			if films[i].Slug == e.Request.URL.String() {
				films[i].Overview = overview
				break
			}
		}
		mu.Unlock()
	})

	// Try alternative selectors for overview
	filmCollector.OnHTML(".film-overview", func(e *colly.HTMLElement) {
		overview := e.Text
		if overview != "" {
			log.Printf("DEBUG: Found overview (alt selector) for %s: %s", e.Request.URL.String(), overview[:min(len(overview), 50)])

			// Update the film with overview
			mu.Lock()
			for i := range films {
				if films[i].Slug == e.Request.URL.String() {
					films[i].Overview = overview
					break
				}
			}
			mu.Unlock()
		}
	})

	// Try another common selector
	filmCollector.OnHTML("[data-testid='film-overview']", func(e *colly.HTMLElement) {
		overview := e.Text
		if overview != "" {
			log.Printf("DEBUG: Found overview (data-testid) for %s: %s", e.Request.URL.String(), overview[:min(len(overview), 50)])

			// Update the film with overview
			mu.Lock()
			for i := range films {
				if films[i].Slug == e.Request.URL.String() {
					films[i].Overview = overview
					break
				}
			}
			mu.Unlock()
		}
	})

	// Try meta description as fallback
	filmCollector.OnHTML("meta[name='description']", func(e *colly.HTMLElement) {
		overview := e.Attr("content")
		if overview != "" {
			log.Printf("DEBUG: Found meta description for %s: %s", e.Request.URL.String(), overview[:min(len(overview), 50)])

			// Update the film with overview if we don't have one yet
			mu.Lock()
			for i := range films {
				if films[i].Slug == e.Request.URL.String() && films[i].Overview == "" {
					films[i].Overview = overview
					break
				}
			}
			mu.Unlock()
		}
	})

	// Handle og:image extraction (reliable image URLs) from film detail pages
	filmCollector.OnHTML("meta[property='og:image']", func(e *colly.HTMLElement) {
		img := e.Attr("content")

		log.Printf("DEBUG: Found og:image for %s: %s", e.Request.URL.String(), img)

		// Update the film with og:image (reliable image URL)
		mu.Lock()
		for i := range films {
			if films[i].Slug == e.Request.URL.String() {
				films[i].Image = img
				break
			}
		}
		mu.Unlock()
	})

	// Main collector for the watchlist page (following original repo pattern)
	c := colly.NewCollector(
		colly.Async(true),
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)
	c.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 100})

	// HTML selector for containers holding film posters (following original repo pattern exactly)
	c.OnHTML(".poster-container", func(e *colly.HTMLElement) {
		// For every film, find its container (using ForEach like original repo)
		e.ForEach("div.film-poster", func(i int, ein *colly.HTMLElement) {
			slug := ein.Attr("data-target-link")
			if slug != "" {
				log.Printf("DEBUG: Found film with slug: %s", slug)
				ajc.Visit(urlscrape + slug + urlEnd)
			}
		})
	})

	// Handles pagination links (following original repo pattern exactly)
	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		link := e.Attr("href")
		if strings.Contains(link, "/page") {
			log.Printf("DEBUG: Following pagination to: %s", e.Request.AbsoluteURL(link))
			e.Request.Visit(e.Request.AbsoluteURL(link))
		}
	})

	// Start scraping
	log.Printf("DEBUG: Starting Colly watchlist scrape for %s", startURL)
	c.Visit(startURL)
	c.Wait()
	ajc.Wait()
	filmCollector.Wait()

	// Set default poster for films without images
	for i := range films {
		if films[i].Image == "" || isEmptyPoster(films[i].Image) {
			films[i].Image = "https://watchlistpicker.com/noimagefound.jpg"
		}
	}

	log.Printf("DEBUG: Colly scrape complete, found %d films", len(films))
	return films, nil
}

// Helper function for min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// convertGenreIDs converts a comma-separated string of genre IDs to Letterboxd slugs
func convertGenreIDs(genres string) []string {
	genreIdToSlug := map[string]string{
		"28": "action", "12": "adventure", "16": "animation", "35": "comedy",
		"80": "crime", "99": "documentary", "18": "drama", "10751": "family",
		"14": "fantasy", "36": "history", "27": "horror", "10402": "music",
		"9648": "mystery", "10749": "romance", "878": "sci-fi", "53": "thriller",
		"10752": "war", "37": "western", "10770": "tv-movie",
	}
	var slugs []string
	for _, id := range strings.Split(genres, ",") {
		id = strings.TrimSpace(id)
		if slug, ok := genreIdToSlug[id]; ok {
			slugs = append(slugs, slug)
		} else {
			log.Printf("DEBUG: Unknown genre ID: %s", id)
		}
	}
	return slugs
}

// extractYear extracts a 4-digit year from a URL string
func extractYear(link string) string {
	for _, part := range strings.Split(link, "/") {
		if len(part) == 4 {
			for _, c := range part {
				if c < '0' || c > '9' {
					goto notYear
				}
			}
			return part
		}
	notYear:
	}
	return ""
}

// isEmptyPoster checks if URL is an empty poster placeholder
func isEmptyPoster(url string) bool {
	if url == "" {
		return true
	}

	// Don't reject og:image URLs as they are reliable image sources
	if strings.Contains(url, "a.ltrbxd.com/resized") {
		return false
	}

	emptyPatterns := []string{
		"empty-poster",
		"placeholder",
		"default-poster",
		"no-poster",
		"blank-poster",
	}

	for _, pattern := range emptyPatterns {
		if strings.Contains(strings.ToLower(url), pattern) {
			return true
		}
	}
	return false
}

// GetPosterFromTMDB gets movie poster from TMDB API (fast and reliable)
func GetPosterFromTMDB(movieName, year string) (string, error) {
	// TMDB API key - you'll need to get a free one from https://www.themoviedb.org/settings/api
	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	if tmdbAPIKey == "" {
		return "", fmt.Errorf("TMDB_API_KEY not set")
	}

	// Search for the movie
	searchURL := fmt.Sprintf("https://api.themoviedb.org/3/search/movie?api_key=%s&query=%s&year=%s",
		tmdbAPIKey, url.QueryEscape(movieName), year)

	resp, err := http.Get(searchURL)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Results []struct {
			PosterPath string `json:"poster_path"`
		} `json:"results"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Results) > 0 && result.Results[0].PosterPath != "" {
		// Return high quality poster URL
		posterURL := fmt.Sprintf("https://image.tmdb.org/t/p/w500%s", result.Results[0].PosterPath)
		log.Printf("DEBUG: TMDB found poster for %s: %s", movieName, posterURL)
		return posterURL, nil
	}

	return "", fmt.Errorf("no poster found for %s", movieName)
}

// GetPosterFromTMDBByID gets movie poster from TMDB API using the movie ID (most reliable)
func GetPosterFromTMDBByID(tmdbID string) (string, error) {
	// TMDB API key - you'll need to get a free one from https://www.themoviedb.org/settings/api
	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	if tmdbAPIKey == "" {
		return "", fmt.Errorf("TMDB_API_KEY not set")
	}

	// Get movie details directly by ID
	movieURL := fmt.Sprintf("https://api.themoviedb.org/3/movie/%s?api_key=%s",
		tmdbID, tmdbAPIKey)

	resp, err := http.Get(movieURL)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		PosterPath string `json:"poster_path"`
		Title      string `json:"title"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if result.PosterPath != "" {
		// Return high quality poster URL
		posterURL := fmt.Sprintf("https://image.tmdb.org/t/p/w500%s", result.PosterPath)
		log.Printf("DEBUG: TMDB found poster for %s (ID: %s): %s", result.Title, tmdbID, posterURL)
		return posterURL, nil
	}

	return "", fmt.Errorf("no poster found for movie ID %s", tmdbID)
}

// GetPoster scrapes a single poster using the working AJAX approach
func GetPoster(url string) (*PosterData, error) {
	var posterURL, overview string
	var mu sync.Mutex
	var wg sync.WaitGroup
	wg.Add(1)

	// ajax kinda making me wanna play football with my head
	// Extract film slug from URL (e.g., "https://letterboxd.com/film/pierrot-le-fou/" -> "pierrot-le-fou")
	slug := extractSlugFromURL(url)
	if slug == "" {
		return &PosterData{
			PosterURL: "https://watchlistpicker.com/noimagefound.jpg",
			Overview:  "",
		}, nil
	}

	// AJAX poster endpoint constants (same as watchlist)
	const urlscrape = "https://letterboxd.com/ajax/poster"
	const urlEnd = "/std/125x187/"

	// Create a collector for AJAX poster endpoint with timeout
	c := colly.NewCollector(
		colly.Async(true),
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)
	c.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 1})

	// Extract poster data from AJAX endpoint (same as watchlist)
	c.OnHTML("div.film-poster", func(e *colly.HTMLElement) {
		img := e.ChildAttr("img", "src")

		if img != "" {
			mu.Lock()
			posterURL = makeBigger(img) // Apply makeBigger for larger images
			mu.Unlock()
			log.Printf("DEBUG: AJAX found poster for %s: %s", slug, img)
		}

		wg.Done()
	})

	// Visit the AJAX poster endpoint
	ajaxURL := urlscrape + "/" + slug + urlEnd
	log.Printf("DEBUG: Visiting AJAX poster endpoint for %s: %s", slug, ajaxURL)
	c.Visit(ajaxURL)

	// Wait with timeout
	done := make(chan bool, 1)
	go func() {
		c.Wait()
		done <- true
	}()

	select {
	case <-done:
		// AJAX completed
	case <-time.After(5 * time.Second):
		// AJAX timed out, try fallback
		log.Printf("DEBUG: AJAX timed out for %s, trying fallback", slug)
	}

	// If AJAX didn't work, try fallback to og:image from the main page
	if posterURL == "" || isEmptyPoster(posterURL) {
		log.Printf("DEBUG: AJAX failed for %s, trying og:image fallback", slug)

		// Create a new collector for the main film page
		fallbackCollector := colly.NewCollector(
			colly.Async(true),
			colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
		)
		fallbackCollector.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 1})

		// Try to get og:image
		fallbackCollector.OnHTML("meta[property='og:image']", func(e *colly.HTMLElement) {
			img := e.Attr("content")
			if img != "" {
				mu.Lock()
				posterURL = img
				mu.Unlock()
				log.Printf("DEBUG: Found og:image fallback for %s: %s", slug, img)
			}
		})

		fallbackCollector.Visit(url)
		fallbackCollector.Wait()
	}

	// Set default if no poster found
	if posterURL == "" || isEmptyPoster(posterURL) {
		posterURL = "https://watchlistpicker.com/noimagefound.jpg"
		log.Printf("DEBUG: Using default poster URL - no poster found for %s", slug)
	}

	log.Printf("DEBUG: Final poster URL for %s: %s", slug, posterURL)

	return &PosterData{
		PosterURL: posterURL,
		Overview:  overview,
	}, nil
}

// extractSlugFromURL extracts the film slug from a Letterboxd URL
func extractSlugFromURL(url string) string {
	// Handle URLs like "https://letterboxd.com/film/pierrot-le-fou/"
	if strings.Contains(url, "/film/") {
		parts := strings.Split(url, "/film/")
		if len(parts) > 1 {
			slug := strings.TrimSuffix(parts[1], "/")
			return slug
		}
	}
	return ""
}

type PosterData struct {
	PosterURL string `json:"poster"`
	Overview  string `json:"overview"`
}

func makeBigger(img string) string {
	if img == "" {
		return ""
	}

	if strings.Contains(img, "2000") || strings.Contains(img, "3000") {
		return img
	}

	img = strings.ReplaceAll(img, "230", "2000")
	img = strings.ReplaceAll(img, "345", "3000")
	img = strings.ReplaceAll(img, "125", "2000")
	img = strings.ReplaceAll(img, "187", "3000")
	img = strings.ReplaceAll(img, "1000", "2000")
	img = strings.ReplaceAll(img, "1500", "3000")

	return img
}

func GetWatchlist(username string) ([]Film, error) {
	var films []Film
	var mu sync.Mutex
	processedFilms := make(map[string]bool)

	// primary collector for watchlist pages
	c := colly.NewCollector(
		colly.Async(true),
		colly.MaxDepth(2),
	)
	c.Limit(&colly.LimitRule{
		DomainGlob:  "*letterboxd.com*",
		Parallelism: 100,
		RandomDelay: 1 * time.Second,
	})

	// secondary collector for film detail pages for poster data ofc
	filmCollector := colly.NewCollector(
		colly.Async(true),
	)
	filmCollector.Limit(&colly.LimitRule{
		DomainGlob:  "*letterboxd.com*",
		Parallelism: 50,
		RandomDelay: 500 * time.Millisecond,
	})

	// Find film entries on watchlist page
	c.OnHTML("li.poster-container", func(e *colly.HTMLElement) {
		// Get film data from the div.film-poster inside
		filmPoster := e.DOM.Find("div.film-poster")
		name := filmPoster.Find("img").AttrOr("alt", "")
		targetLink := filmPoster.AttrOr("data-target-link", "")
		img := filmPoster.Find("img").AttrOr("src", "")

		if name == "" || targetLink == "" {
			return
		}

		fullSlug := "https://letterboxd.com" + targetLink
		filmPath := targetLink
		year := extractYear(targetLink)

		// Check if already processed film
		mu.Lock()
		if processedFilms[fullSlug] {
			mu.Unlock()
			return
		}
		processedFilms[fullSlug] = true
		mu.Unlock()

		log.Printf("DEBUG: Found film: %s at %s", name, fullSlug)

		// Add film to list with initial data
		mu.Lock()
		films = append(films, Film{
			Name:     name,
			Slug:     fullSlug,
			Image:    makeBigger(img), // Initial image from watchlist
			Year:     year,
			FilmPath: filmPath,
			Overview: "",
		})
		mu.Unlock()

		// Visit film page to get better poster and overview
		filmCollector.Visit(fullSlug)
	})

	// Handle overview extraction from film detail pages
	filmCollector.OnHTML(".film-overview p", func(e *colly.HTMLElement) {
		overview := e.Text

		log.Printf("DEBUG: Found overview for %s: %s", e.Request.URL.String(), overview[:min(len(overview), 50)])

		// Update the film with overview
		mu.Lock()
		for i := range films {
			if films[i].Slug == e.Request.URL.String() {
				films[i].Overview = overview
				break
			}
		}
		mu.Unlock()
	})

	// Handle og:image extraction (reliable image URLs) from film detail pages
	filmCollector.OnHTML("meta[property='og:image']", func(e *colly.HTMLElement) {
		img := e.Attr("content")

		log.Printf("DEBUG: Found og:image for %s: %s", e.Request.URL.String(), img)

		// Update the film with og:image (reliable image URL)
		mu.Lock()
		for i := range films {
			if films[i].Slug == e.Request.URL.String() {
				films[i].Image = img
				break
			}
		}
		mu.Unlock()
	})

	// Pagination
	c.OnHTML("a.next", func(e *colly.HTMLElement) {
		nextPage := e.Attr("href")
		if nextPage != "" {
			log.Printf("DEBUG: Following pagination to: %s", nextPage)
			c.Visit("https://letterboxd.com" + nextPage)
		}
	})

	// Start scraping
	watchlistURL := fmt.Sprintf("https://letterboxd.com/%s/watchlist/", username)
	log.Printf("DEBUG: Starting scrape of %s", watchlistURL)

	err := c.Visit(watchlistURL)
	if err != nil {
		return nil, fmt.Errorf("failed to visit watchlist: %w", err)
	}

	// Wait for both collectors to finish
	c.Wait()
	filmCollector.Wait()

	log.Printf("DEBUG: Colly scrape complete, found %d films", len(films))
	return films, nil
}

// just doesnt work why does tmdb even exist or maybe i just suck at coding
// GetPosterFromTMDBImages gets movie posters from TMDB API using the images endpoint
func GetPosterFromTMDBImages(tmdbID string) (string, error) {
	// TMDB API key - you'll need to get a free one from https://www.themoviedb.org/settings/api
	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	if tmdbAPIKey == "" {
		return "", fmt.Errorf("TMDB_API_KEY not set")
	}

	imagesURL := fmt.Sprintf("https://api.themoviedb.org/3/movie/%s/images", tmdbID)

	resp, err := http.Get(imagesURL)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Posters []struct {
			FilePath    string  `json:"file_path"`
			VoteAverage float64 `json:"vote_average"`
			VoteCount   int     `json:"vote_count"`
			Width       int     `json:"width"`
			Height      int     `json:"height"`
		} `json:"posters"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Posters) == 0 {
		return "", fmt.Errorf("no posters found for movie ID %s", tmdbID)
	}

	// Find the best poster (highest vote average, then highest vote count)
	var bestPoster struct {
		FilePath    string
		VoteAverage float64
		VoteCount   int
	}

	for _, poster := range result.Posters {
		// Skip posters that are too small
		if poster.Width < 500 || poster.Height < 750 {
			continue
		}

		// Choose the poster with highest vote average, then highest vote count
		if poster.VoteAverage > bestPoster.VoteAverage ||
			(poster.VoteAverage == bestPoster.VoteAverage && poster.VoteCount > bestPoster.VoteCount) {
			bestPoster.FilePath = poster.FilePath
			bestPoster.VoteAverage = poster.VoteAverage
			bestPoster.VoteCount = poster.VoteCount
		}
	}

	// If no suitable poster found, use the first one
	if bestPoster.FilePath == "" && len(result.Posters) > 0 {
		bestPoster.FilePath = result.Posters[0].FilePath
	}

	if bestPoster.FilePath != "" {
		// Return high quality poster URL
		posterURL := fmt.Sprintf("https://image.tmdb.org/t/p/w500%s", bestPoster.FilePath)
		log.Printf("DEBUG: TMDB images found poster for movie ID %s: %s (votes: %.1f/%d)",
			tmdbID, posterURL, bestPoster.VoteAverage, bestPoster.VoteCount)
		return posterURL, nil
	}

	return "", fmt.Errorf("no suitable poster found for movie ID %s", tmdbID)
}

package recommend

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"netlify-functions/internal/ai"

	"github.com/gocolly/colly/v2"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	prompt := r.URL.Query().Get("prompt")
	if prompt == "" {
		prompt = "Give me a recommendation for a single, interesting, and critically acclaimed movie from any genre or era."
	}

	// Get the recommendation
	movieData, err := ai.GetRecommendation(prompt)
	if err != nil {
		http.Error(w, `{"error": "Failed to get recommendation"}`, http.StatusInternalServerError)
		return
	}

	// Get poster from Letterboxd og:image
	posterURL := getPosterFromLetterboxdOgImage(movieData.Slug)
	if posterURL != "" {
		movieData.Image = posterURL
		log.Printf("DEBUG: Got poster for %s: %s", movieData.Name, posterURL)
	} else {
		log.Printf("DEBUG: No poster found for %s", movieData.Name)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(movieData)
}

// getPosterFromLetterboxdOgImage extracts og:image from Letterboxd film page
func getPosterFromLetterboxdOgImage(letterboxdURL string) string {
	var posterURL string
	var mu sync.Mutex

	// Create a collector for film detail page
	c := colly.NewCollector(
		colly.Async(true),
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)
	c.Limit(&colly.LimitRule{
		DomainGlob:  "*letterboxd.com*",
		Parallelism: 1,
		RandomDelay: 500 * time.Millisecond,
	})

	// Extract og:image from the film page
	c.OnHTML("meta[property='og:image']", func(e *colly.HTMLElement) {
		img := e.Attr("content")
		if img != "" {
			mu.Lock()
			posterURL = img
			mu.Unlock()
			log.Printf("DEBUG: Found og:image: %s", img)
		}
	})

	// film detail page
	log.Printf("DEBUG: Visiting: %s", letterboxdURL)
	c.Visit(letterboxdURL)
	c.Wait()

	return posterURL
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

// make image bigger and better
func makeBigger(img string) string {
	if img == "" {
		return ""
	}

	if strings.Contains(img, "2000") || strings.Contains(img, "3000") {
		return img
	}

	// replace common size patterns with much higher resolution
	img = strings.ReplaceAll(img, "230", "2000")
	img = strings.ReplaceAll(img, "345", "3000")
	img = strings.ReplaceAll(img, "125", "2000")
	img = strings.ReplaceAll(img, "187", "3000")
	img = strings.ReplaceAll(img, "1000", "2000")
	img = strings.ReplaceAll(img, "1500", "3000")

	return img
}

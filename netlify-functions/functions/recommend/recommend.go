package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"netlify-functions/internal/ai"

	"github.com/gocolly/colly/v2"
)

func handler(w http.ResponseWriter, r *http.Request) {
	// Add panic recovery
	defer func() {
		if r := recover(); r != nil {
			log.Printf("PANIC in handler: %v\n%s", r, debug.Stack())
			http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		}
	}()

	log.Printf("DEBUG: Recommend function called")

	prompt := r.URL.Query().Get("prompt")
	if prompt == "" {
		prompt = "Give me a recommendation for a single, interesting, and critically acclaimed movie from any genre or era."
	}

	log.Printf("DEBUG: Using prompt: %s", prompt)

	// Get the recommendation
	log.Printf("DEBUG: Calling ai.GetRecommendation")
	movieData, err := ai.GetRecommendation(prompt)
	if err != nil {
		log.Printf("ERROR: Failed to get recommendation: %v", err)
		http.Error(w, fmt.Sprintf(`{"error": "Failed to get recommendation: %v"}`, err), http.StatusInternalServerError)
		return
	}

	log.Printf("DEBUG: Got movie data: %+v", movieData)

	// Get poster from Letterboxd og:image
	log.Printf("DEBUG: Getting poster for %s", movieData.Slug)
	posterURL := getPosterFromLetterboxdOgImage(movieData.Slug)
	if posterURL != "" {
		movieData.Image = posterURL
		log.Printf("DEBUG: Got poster for %s: %s", movieData.Name, posterURL)
	} else {
		log.Printf("DEBUG: No poster found for %s", movieData.Name)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(movieData)
	log.Printf("DEBUG: Successfully returned movie data")
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

	// Visit film detail page
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

func main() {
	// Add panic recovery for the entire main function
	defer func() {
		if r := recover(); r != nil {
			log.Printf("PANIC in main: %v\n%s", r, debug.Stack())
		}
	}()

	log.Printf("DEBUG: Starting recommend function")

	// Check if GEMINI_API_KEY is set
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Printf("ERROR: GEMINI_API_KEY not set")
	} else {
		log.Printf("DEBUG: GEMINI_API_KEY is set (length: %d)", len(apiKey))
	}

	// Test the AI module initialization
	log.Printf("DEBUG: Testing AI module initialization")
	_, err := ai.GetRecommendation("test")
	if err != nil {
		log.Printf("ERROR: AI module test failed: %v", err)
	} else {
		log.Printf("DEBUG: AI module test passed")
	}

	http.HandleFunc("/", handler)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Recommend function listening on", port)
	log.Printf("DEBUG: Recommend function ready on port %s", port)
	http.ListenAndServe(":"+port, nil)
}

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"go-backend/internal/ai"
	"go-backend/internal/scraper"

	"github.com/gocolly/colly/v2"
	"golang.org/x/time/rate"
)

type HealthResponse struct {
	Status      string `json:"status"`
	Timestamp   string `json:"timestamp"`
	Service     string `json:"service"`
	Version     string `json:"version"`
	Environment string `json:"environment"`
}

// Rate limiter map
var (
	limiters = make(map[string]*rate.Limiter)
	mu       sync.RWMutex
)

// Get rate limiter for IP
func getLimiter(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	limiter, exists := limiters[ip]
	if !exists {
		// Default: 100 requests per 15 minutes
		requests := 100
		window := 15 * time.Minute

		// Override from environment if set
		if envRequests := os.Getenv("RATE_LIMIT_REQUESTS"); envRequests != "" {
			if r, err := fmt.Sscanf(envRequests, "%d", &requests); err == nil && r == 1 {
				// requests is already set
			}
		}

		limiter = rate.NewLimiter(rate.Every(window/time.Duration(requests)), requests)
		limiters[ip] = limiter
	}

	return limiter
}

// Rate limiting middleware
func withRateLimit(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Skip rate limiting if disabled
		if os.Getenv("ENABLE_RATE_LIMITING") == "false" {
			h(w, r)
			return
		}

		ip := r.RemoteAddr
		if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			ip = strings.Split(forwarded, ",")[0]
		}

		limiter := getLimiter(ip)
		if !limiter.Allow() {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]string{
				"error":   "Rate limit exceeded",
				"message": "Too many requests, please try again later",
			})
			return
		}

		h(w, r)
	}
}

// CORS middleware to handle cross-origin requests
func withCORS(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get allowed origins from environment
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			// Default for development
			allowedOrigins = "http://localhost:5173,http://localhost:3000"
		}

		origin := r.Header.Get("Origin")
		origins := strings.Split(allowedOrigins, ",")

		// Check if origin is allowed
		allowed := false
		for _, allowedOrigin := range origins {
			if strings.TrimSpace(allowedOrigin) == origin {
				allowed = true
				break
			}
		}

		if allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight OPTIONS requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the original handler
		h(w, r)
	}
}

// Logging middleware
func withLogging(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create response writer wrapper to capture status code
		wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		// Call the handler
		h(wrapped, r)

		// Log the request
		duration := time.Since(start)
		log.Printf("INFO: %s %s %d %v %s",
			r.Method,
			r.URL.Path,
			wrapped.statusCode,
			duration,
			r.RemoteAddr,
		)
	}
}

// Response writer wrapper to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:      "OK",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Service:     "Go API Server",
		Version:     "1.0.0",
		Environment: os.Getenv("NODE_ENV"),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func watchlistHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, `{"error": "Username parameter is required"}`, http.StatusBadRequest)
		return
	}

	// Get genres parameter (optional)
	genres := r.URL.Query().Get("genres")

	// Debug logging
	log.Printf("DEBUG: Watchlist request - username: %s, genres: %s", username, genres)

	// Get watchlist using the ScrapeWatchlist function with genres filter
	films, err := scraper.ScrapeWatchlist(username, genres)
	if err != nil {
		log.Printf("DEBUG: ScrapeWatchlist error: %v", err)
		http.Error(w, `{"error": "Failed to get watchlist"}`, http.StatusInternalServerError)
		return
	}

	log.Printf("DEBUG: Found %d films in watchlist", len(films))

	if len(films) == 0 {
		if genres != "" {
			log.Printf("DEBUG: No films found for genres: %s", genres)
			http.Error(w, `{"error": "No films found in watchlist for the selected genres"}`, http.StatusNotFound)
		} else {
			log.Printf("DEBUG: No films found in watchlist")
			http.Error(w, `{"error": "No films found in watchlist"}`, http.StatusNotFound)
		}
		return
	}

	// Random film from the watchlist
	rand.Seed(time.Now().UnixNano())
	randomIndex := rand.Intn(len(films))
	selectedFilm := films[randomIndex]

	log.Printf("DEBUG: Selected film: %s (%s)", selectedFilm.Name, selectedFilm.Year)

	// Return the single film as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(selectedFilm)
}

func recommendHandler(w http.ResponseWriter, r *http.Request) {
	prompt := r.URL.Query().Get("prompt")
	if prompt == "" {
		prompt = "Give me a recommendation for a single, interesting, and critically acclaimed movie from any genre or era."
	}

	log.Printf("DEBUG: Recommend request - prompt: %s", prompt)

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

func main() {
	// Add panic recovery for the entire main function
	defer func() {
		if r := recover(); r != nil {
			log.Printf("PANIC in main: %v", r)
		}
	}()

	// Set up logging based on environment
	env := os.Getenv("NODE_ENV")
	if env == "production" {
		log.SetFlags(log.LstdFlags | log.Lshortfile)
		log.Printf("INFO: Starting Go API server in production mode")
	} else {
		log.Printf("DEBUG: Starting Go API server in development mode")
	}

	// Check if GEMINI_API_KEY is set
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Printf("WARNING: GEMINI_API_KEY not set - AI recommendations will fail")
	} else {
		log.Printf("INFO: GEMINI_API_KEY is set (length: %d)", len(apiKey))
	}

	// Set up routes with production middleware
	http.HandleFunc("/health", withLogging(withCORS(healthHandler)))
	http.HandleFunc("/watchlist", withLogging(withRateLimit(withCORS(watchlistHandler))))
	http.HandleFunc("/recommend", withLogging(withRateLimit(withCORS(recommendHandler))))

	// Default route with CORS
	http.HandleFunc("/", withLogging(withCORS(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":     "Go API Server is running",
			"endpoints":   []string{"/health", "/watchlist", "/recommend"},
			"version":     "1.0.0",
			"environment": env,
		})
	})))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" // Different port from Express server
	}

	log.Printf("INFO: Go API server ready on port %s", port)
	log.Printf("INFO: Environment: %s", env)
	log.Printf("INFO: Available endpoints:")
	log.Printf("  - GET /health")
	log.Printf("  - GET /watchlist?username=<username>&genres=<genres>")
	log.Printf("  - GET /recommend?prompt=<prompt>")

	// Start server with error handling
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Printf("FATAL: Failed to start server: %v", err)
		os.Exit(1)
	}
}

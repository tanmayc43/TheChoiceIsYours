package main

import (
	"log"
	"net/http"
	"os"

	"netlify-functions/functions/health"
	"netlify-functions/functions/recommend"
	"netlify-functions/functions/watchlist"

	"github.com/joho/godotenv"
)

// CORS middleware
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Allow requests from React dev server
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	}
}

func main() {
	// Load environment variables from .env file
	if err := loadEnv(); err != nil {
		log.Printf("Warning: Could not load .env file: %v", err)
	}

	// Setup routes with CORS middleware
	http.HandleFunc("/health", corsMiddleware(health.Handler))
	http.HandleFunc("/recommend", corsMiddleware(recommend.Handler))
	http.HandleFunc("/watchlist", corsMiddleware(watchlist.Handler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Local server running on http://localhost:%s", port)
	log.Printf("Health check: http://localhost:%s/health", port)
	log.Printf("Recommend: http://localhost:%s/recommend", port)
	log.Printf("Watchlist: http://localhost:%s/watchlist", port)
	log.Printf("GEMINI_API_KEY loaded: %s", maskAPIKey(os.Getenv("GEMINI_API_KEY")))
	log.Printf("CORS enabled for: http://localhost:5173")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func loadEnv() error {
	// Load .env file from project root directory
	return godotenv.Load("../../.env")
}

func maskAPIKey(key string) string {
	if len(key) < 8 {
		return "not set"
	}
	return key[:8] + "..."
}

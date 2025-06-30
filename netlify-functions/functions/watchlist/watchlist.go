package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"netlify-functions/internal/scraper"
)

func handler(w http.ResponseWriter, r *http.Request) {
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

func main() {
	http.HandleFunc("/", handler)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Watchlist function listening on", port)
	http.ListenAndServe(":"+port, nil)
}

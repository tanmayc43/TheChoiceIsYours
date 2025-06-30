package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
}

func handler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "OK",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/", handler)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Health function listening on", port)
	http.ListenAndServe(":"+port, nil)
}

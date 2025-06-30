package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type MovieData struct {
	Name     string `json:"name"`
	Year     string `json:"year"`
	Overview string `json:"overview"`
	Slug     string `json:"slug"`
	TMDBID   string `json:"tmdb_id"`
	Image    string `json:"image"`
}

func GetRecommendation(prompt string) (*MovieData, error) {
	// Get Gemini API response
	responseText, err := callGeminiAPI(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to get AI recommendation: %w", err)
	}

	// Parse the JSON response
	movieData, err := parseGeminiResponse(responseText)
	if err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return movieData, nil
}

func callGeminiAPI(prompt string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	// Create Gemini client
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	// Get the model
	model := client.GenerativeModel("gemini-1.5-flash")

	// Prepare the system prompt
	systemPrompt := `
		You are an expert movie recommendation assistant specializing in Letterboxd recommendations.
		Your task is to find a single, excellent movie that perfectly matches the user's request.

		**CRITICAL RULES:**
		1. Recommend movies that are not necessarily critically acclaimed, but are somewhat known and talked about. Try and look for hidden gems as well. Underrated movies if you may.
		2. The movie MUST have already been officially released to the public. Do not recommend upcoming, unreleased, or festival-only films.
		3. You MUST respond with ONLY a valid JSON object. Do not add any other text, explanations, or markdown formatting.
		4. Focus on movies that are well-known enough to have a Letterboxd page and decent ratings.

		**RECOMMENDATION PROCESS:**
		- Consider the user's specific request (genre, mood, era, director, etc.)
		- Choose a movie that is widely recognized and has good ratings
		- Ensure it's a real, released film with cultural significance
		- Provide an accurate Letterboxd URL

		The JSON object must have the following structure:
		{
			"name": "The Movie Title",
			"year": "YYYY",
			"overview": "A compelling, one-sentence summary that captures the essence of the movie.",
			"slug": "The full, valid Letterboxd URL for the movie.",
			"tmdb_id": "The TMDB ID if you know it, otherwise leave empty"
		}

		**EXAMPLES:**
		For "recommend me a classic horror movie", you might return:
		{
			"name": "The Shining",
			"year": "1980",
			"overview": "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence, while his psychic son sees horrific forebodings from both past and future.",
			"slug": "https://letterboxd.com/film/the-shining/",
			"tmdb_id": "694"
		}

		For "recommend me a feel-good comedy", you might return:
		{
			"name": "The Grand Budapest Hotel",
			"year": "2014",
			"overview": "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge.",
			"slug": "https://letterboxd.com/film/the-grand-budapest-hotel/",
			"tmdb_id": "120467"
		}

		For "recommend me an underrated gem", you might return:
		{
			"name": "The Nice Guys",
			"year": "2016",
			"overview": "A mismatched pair of private eyes investigate the apparent suicide of a fading porn star in 1970s Los Angeles.",
			"slug": "https://letterboxd.com/film/the-nice-guys/",
			"tmdb_id": "296098"
		}
	`

	// Set generation config
	model.SetTemperature(0.7)
	model.SetTopP(0.8)
	model.SetTopK(40)
	model.SetMaxOutputTokens(1000)

	// Generate content
	resp, err := model.GenerateContent(ctx, genai.Text(systemPrompt), genai.Text(fmt.Sprintf("User prompt: \"%s\"", prompt)))
	if err != nil {
		return "", fmt.Errorf("Gemini API call failed: %w", err)
	}

	// Extract text from response
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response from Gemini API")
	}

	// Get the text from the first part
	text := ""
	for _, part := range resp.Candidates[0].Content.Parts {
		if textPart, ok := part.(genai.Text); ok {
			text = string(textPart)
			break
		}
	}

	if text == "" {
		return "", fmt.Errorf("empty response from Gemini API")
	}

	return text, nil
}

func parseGeminiResponse(responseText string) (*MovieData, error) {
	// Clean up the response - remove markdown formatting if present
	jsonString := strings.TrimSpace(responseText)
	jsonString = strings.TrimPrefix(jsonString, "```json")
	jsonString = strings.TrimSuffix(jsonString, "```")
	jsonString = strings.TrimSpace(jsonString)

	// Parse JSON
	var movieData MovieData
	if err := json.Unmarshal([]byte(jsonString), &movieData); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	// Validate required fields
	if movieData.Name == "" || movieData.Slug == "" {
		return nil, fmt.Errorf("invalid movie data: missing name or slug")
	}

	return &movieData, nil
}

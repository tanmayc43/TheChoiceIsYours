# ChoiceIsYours

An opinionated movie-picker for the indecisive cinephile, wrapped in a cinematic, Matrix-themed user experience.

---

## Architecture Overview

### Backend (Golang with Colly)
- **Golang Server**: High-performance HTTP server built with Go 1.24, handling API routing and recommendation logic with concurrent subroutines.
- **Colly Web Scraper**: Robust, concurrent web scraping using the Colly framework to fetch high-quality posters, overviews, and release years from Letterboxd with intelligent rate limiting and error handling.
- **AI Integration**: Google Gemini API integration for quick, language-based movie recommendations, designed to transition to a self-hosted, fine-tuned sentence-transformer model (`JJTsao/fine-tuned_movie_retriever-bge-base-en-v1.5`) for enhanced semantic search and vibe-driven suggestions.
- **Docker Containerization**: Fully containerized deployment with multi-stage Docker builds, health checks, and production-ready configurations.
- **Concurrent Processing**: Leverages Go's goroutines and channels for efficient parallel scraping and data processing.

### Frontend (Immersive UX)
- **React 18** with Vite for a modern, fast development experience.
- **Framer Motion** for fluid, complex UI animations and page transitions.
- **Three.js & React Three Fiber** for immersive 3D effects, including the "Matrix rain" and "hyperspeed" transitions.
- **Matrix Theme**: A unique, cohesive visual style applied across the entire application.
- **Responsive Design**: A mobile-first approach ensures a seamless experience on all devices.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Go 1.24+ (for local development)
- Node.js 18+ (for frontend)

### Backend Setup (Docker)
```bash
# Navigate to the go-backend directory
cd go-backend

# Create the environment file
cp .env.example .env

# Add your Google Gemini API key to the new .env file
# GEMINI_API_KEY="YOUR_API_KEY_HERE"

# Build and start the backend with Docker Compose
docker-compose up --build
```

### Backend Setup (Local Development)
```bash
# Navigate to the go-backend directory
cd go-backend

# Install Go dependencies
go mod download

# Create the environment file
cp .env.example .env

# Add your Google Gemini API key to the new .env file
# GEMINI_API_KEY="YOUR_API_KEY_HERE"

# Run the backend locally
go run main.go
```

### Frontend Setup
```bash
# In a new terminal, navigate to the client directory
cd client

# Install Node.js dependencies
npm install

# Start the frontend development server
npm run dev
```
The app will be available at `http://localhost:5173`.

## API Endpoints

### Watchlist Protocol
- **GET** `/api/watchlist?user={username}&genres={genres}`
- Scrapes a user's public Letterboxd watchlist using concurrent Colly scrapers.
- Supports optional genre filtering for targeted recommendations.
- Selects one random film from the list with intelligent rate limiting.
- Enriches the data with high-quality posters and overviews via concurrent scraping.
- Returns a single, detailed film object.

### Random Protocol
- **GET** `/api/random?prompt={prompt}`
- Sends the user's natural language prompt to the Google Gemini AI.
- Receives a movie recommendation and its Letterboxd URL from the AI.
- Enriches the data with high-quality poster and overview via Colly scraping.
- Returns a single, detailed film object.

### Health Check
- **GET** `/health`
- Returns service status, version, and environment information.

## Golang Backend Features

### Concurrent Web Scraping with Colly
The backend uses the Colly framework for efficient, concurrent web scraping:
- **Parallel Processing**: Multiple goroutines handle different scraping tasks simultaneously.
- **Rate Limiting**: Intelligent rate limiting per IP address to respect Letterboxd's servers.
- **Error Handling**: Robust error handling with retry mechanisms and graceful degradation.
- **Timeout Management**: Context-based timeouts to prevent hanging requests.
- **Memory Efficiency**: Optimized memory usage with streaming data processing.

### Key Components
- **`ScrapeWatchlist`**: Concurrent scraping of Letterboxd watchlists with genre filtering.
- **`GetPoster`**: Intelligent poster extraction from multiple sources (Letterboxd, TMDB).
- **Rate Limiting Middleware**: Per-IP rate limiting with configurable limits.
- **CORS Middleware**: Configurable cross-origin request handling.
- **Health Monitoring**: Built-in health checks and monitoring endpoints.

### Docker Configuration
- **Multi-stage Build**: Optimized Docker images with separate build and runtime stages.
- **Security**: Non-root user execution and minimal attack surface.
- **Health Checks**: Automated health monitoring with configurable intervals.
- **Resource Limits**: Production-ready resource constraints and monitoring.
- **Logging**: Structured logging with rotation and size limits.

## Frontend Features

### Immersive Theming & Animation
- **Matrix Theme**: A consistent, dark, green-accented theme across all components.
- **3D Animations**:
    - "Matrix rain" entry screen.
    - "Hyperspeed" warp effect for page transitions.
- **Component Animations**: Smooth entrance/exit animations for cards and UI elements using Framer Motion.
- **Micro-interactions**: Subtle hover and click effects for a more engaging user experience.

### Key Components
- **`MatrixLoader`**: A custom, full-screen loading overlay that maintains the application's theme.
- **`FilmCard`**: A flippable card component to display the final movie recommendation with its details.
- **`SlideToEnter`**: A unique, non-traditional button for entering the main application.
- **`Hyperspeed`**: A reusable component that manages the 3D transition between pages.

## Deployment

This project is designed for modern, containerized deployment strategies.

1.  **Backend (Docker)**
    - The `go-backend` directory contains a complete Docker setup.
    - Multi-stage Docker builds optimize image size and security.
    - Docker Compose configurations for both development and production.
    - Environment variables are managed through `.env` files or container orchestration.

2.  **Frontend (Netlify)**
    - The `client` directory is deployed as a static site.
    - A `netlify.toml` file configures the build process and sets up proxy redirects.
    - All requests from the frontend to `/api/*` are automatically forwarded to the live backend URL.

### Production Deployment
```bash
# Backend deployment
cd go-backend
docker-compose -f docker-compose.prod.yml up -d

# Frontend deployment (via Netlify CLI or Git integration)
cd client
npm run build
```

## Environment Variables

### Backend (`go-backend/.env`)
```env
# The API key for Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Rate limiting configuration (optional)
RATE_LIMIT_REQUESTS=100
ENABLE_RATE_LIMITING=true

# CORS configuration (optional)
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Server configuration (optional)
PORT=8081
NODE_ENV=production
```

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` file for more information.

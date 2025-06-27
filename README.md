# ChoiceIsYours

An opinionated movie-picker for the indecisive cinephile, wrapped in a cinematic, Matrix-themed user experience.

---

## 🏗️ Architecture Overview

### Backend (Hybrid Approach)
- **Express.js Server**: Handles API routing and orchestrates the recommendation logic.
- **Python Scraper**: Uses **Playwright** for robust, dynamic content scraping from Letterboxd to fetch high-quality posters, overviews, and release years.
- **AI Integration**: Currently using the Google Gemini API for quick, language-based movie recommendations, the project is designed to transition to a self-hosted, fine-tuned sentence-transformer model (`JJTsao/fine-tuned_movie_retriever-bge-base-en-v1.5`) for enhanced semantic search and vibe-driven suggestions.
- **Communication**: The Node.js server spawns Python scripts as child processes for seamless integration.

### Frontend (Immersive UX)
- **React 18** with Vite for a modern, fast development experience.
- **Framer Motion** for fluid, complex UI animations and page transitions.
- **Three.js & React Three Fiber** for immersive 3D effects, including the "Matrix rain" and "hyperspeed" transitions.
- **Matrix Theme**: A unique, cohesive visual style applied across the entire application.
- **Responsive Design**: A mobile-first approach ensures a seamless experience on all devices.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- npm & pip

### Backend Setup
```bash
# Navigate to the server directory
cd server

# Install Node.js dependencies
npm install

# Create and set up the Python virtual environment
npm run python:install
npm run python:setup

# Create the environment file from the example
cp .env.example .env

# Add your Google Gemini API key to the new .env file
# GEMINI_API_KEY="YOUR_API_KEY_HERE"

# Start the backend development server
npm run dev
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

## 📡 API Endpoints

### Watchlist Protocol
- **GET** `/api/watchlist?user={username}`
- Scrapes a user's public Letterboxd watchlist.
- Selects one random film from the list.
- Enriches the data with a high-quality poster and overview via the Python scraper.
- Returns a single, detailed film object.

### Random Protocol
- **GET** `/api/random?prompt={prompt}`
- Sends the user's natural language prompt to the Google Gemini AI.
- Receives a movie recommendation and its Letterboxd URL from the AI.
- Enriches the data with a high-quality poster and overview via the Python scraper.
- Returns a single, detailed film object.

## 🐍 Python Scraper

The Python scraper (`server/scrapers/poster_scraper.py`) is a critical component that uses Playwright to:
- Launch a headless browser to handle dynamic, JavaScript-rendered content.
- Extract high-quality poster URLs from meta tags.
- Scrape movie overviews and release years.
- Return structured JSON data to the Node.js parent process.

### Direct Usage
```bash
# From the server/ directory
python scrapers/poster_scraper.py "https://letterboxd.com/film/your-movie-here/"
```

## 🎨 Frontend Features

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

## 🚀 Deployment

This project is designed for a modern, split deployment strategy.

1.  **Backend (Railway)**
    - The `server` directory is deployed as a standalone service.
    - Railway automatically detects the `package.json` and `requirements.txt` to install both Node.js and Python dependencies.
    - Environment variables (like `GEMINI_API_KEY`) are set in the Railway dashboard.

2.  **Frontend (Netlify)**
    - The `client` directory is deployed as a static site.
    - A `netlify.toml` file configures the build process and sets up a proxy redirect.
    - All requests from the frontend to `/api/*` are automatically forwarded to the live Railway backend URL, enabling seamless communication.

## 🔐 Environment Variables

### Backend (`server/.env`)
```env
# The API key for Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

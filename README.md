# FilmPaglu - Hybrid Backend Architecture

A modern movie recommendation app with a hybrid Express.js + Python backend and enhanced React frontend.

## 🏗️ Architecture Overview

### Backend (Hybrid Approach)
- **Express.js Server**: Handles API routing, caching, and fast web scraping
- **Python Scrapers**: Uses Playwright for dynamic content scraping (posters, metadata)
- **Communication**: Child process spawning for Python scripts
- **Caching**: Redis-like in-memory caching with node-cache
- **Performance**: Optimized with compression, rate limiting, and security headers

### Frontend (Enhanced UX)
- **React 18** with modern hooks and context
- **Framer Motion** for smooth animations and page transitions
- **Dual Theme System** (Light/Dark) with smooth transitions
- **Loading States** with custom loading screens
- **Responsive Design** with mobile-first approach

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- pip (Python package manager)

### Backend Setup
```bash
cd server
npm install
npm run python:install
npm run python:setup
cp .env.example .env
# Add your API keys to .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 📡 API Endpoints

### Watchlist API
- **GET** `/api/watchlist?username={username}&genres={genre_ids}`
- Scrapes Letterboxd watchlist
- Filters by genres (optional)
- Returns random film with poster and metadata

### Random Movie API
- **GET** `/api/random`
- Returns random movie from Watchmode API
- Includes poster and basic metadata

### Recommendations API
- **GET** `/api/recommend?genres={genre_slugs}&limit={number}`
- Uses Trakt.tv API for genre-based recommendations
- Supports multiple genres and custom limits

## 🐍 Python Scraper

The Python scraper (`poster_scraper.py`) uses Playwright to:
- Handle dynamic content loading
- Extract high-quality poster URLs
- Scrape movie overviews and metadata
- Return structured JSON data

### Usage
```python
python scrapers/poster_scraper.py "https://letterboxd.com/film/movie-name/"
```

## 🎨 Frontend Features

### Theme System
- Automatic system preference detection
- Smooth transitions between themes
- Persistent theme selection
- Custom color palettes for each theme

### Animations
- Page transitions with Framer Motion
- Component entrance/exit animations
- Interactive hover effects
- Loading state animations
- Micro-interactions for better UX

### Components
- **LoadingScreen**: Custom loading with animated elements
- **ThemeToggle**: Smooth theme switching component
- **PageTransition**: Wrapper for page-level animations
- **Enhanced Navbar**: Responsive with theme toggle

## 🚀 Deployment Options

### Recommended Platforms

1. **Railway** (Recommended)
   - Supports both Node.js and Python
   - Easy environment variable management
   - Automatic deployments from Git

2. **Render**
   - Free tier available
   - Supports multi-language apps
   - Built-in SSL and CDN

3. **DigitalOcean App Platform**
   - Managed platform
   - Supports Docker containers
   - Scalable infrastructure

4. **AWS EC2** (Advanced)
   - Full control over environment
   - Custom server configuration
   - Requires more setup

### Docker Deployment
```dockerfile
# Example Dockerfile for hybrid deployment
FROM node:18-alpine

# Install Python
RUN apk add --no-cache python3 py3-pip

# Copy and install dependencies
COPY server/package*.json ./
RUN npm install

# Install Python dependencies
COPY server/scrapers/requirements.txt ./
RUN pip install -r requirements.txt

# Install Playwright browsers
RUN python -m playwright install --with-deps chromium

# Copy application code
COPY server/ ./

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Performance Optimizations

### Backend
- **Caching**: 5-minute cache for watchlist results
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Compression**: Gzip compression for responses
- **Security**: Helmet.js for security headers
- **Timeout Handling**: 30-second timeout for Python scrapers

### Frontend
- **Code Splitting**: Lazy loading for routes
- **Image Optimization**: Responsive images with fallbacks
- **Animation Performance**: Hardware-accelerated animations
- **Bundle Optimization**: Tree shaking and minification

## 🛠️ Development

### Backend Development
```bash
cd server
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd client
npm run dev  # Starts Vite dev server
```

### Testing Python Scrapers
```bash
cd server
python scrapers/poster_scraper.py "https://letterboxd.com/film/test-movie/"
```

## 📊 Monitoring & Debugging

### Health Checks
- **Backend**: `GET /health` - Returns server status
- **Python Scrapers**: Built-in error handling and logging

### Logging
- Express.js request logging
- Python scraper error tracking
- Performance metrics for cache hits/misses

## 🔐 Environment Variables

### Backend (.env)
```env
WATCHMODE_API_KEY=your_watchmode_key
TRAKT_CLIENT_ID=your_trakt_client_id
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend
No environment variables required for development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
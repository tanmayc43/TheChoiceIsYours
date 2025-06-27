import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import watchlistRoutes from './routes/watchlist.js';
import recommendRoutes from './routes/recommend.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/recommend', recommendRoutes);

// Python scraper communication helper
export const callPythonScraper = (url, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(path.join(__dirname, 'venv', 'bin', 'python'), [
      path.join(__dirname, 'scrapers', 'poster_scraper.py'),
      url
    ]);

    let result = '';
    let error = '';

    const timer = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python scraper timeout'));
    }, timeout);

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        try {
          const parsed = JSON.parse(result.trim());
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${result}`));
        }
      } else {
        reject(new Error(`Python scraper failed: ${error}`));
      }
    });
  });
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
# Use Node.js 18 (Debian slim) as base image
FROM node:18-slim

# Install system dependencies for Python, Playwright, and Chromium
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-venv \
        python3-pip \
        chromium \
        wget \
        ca-certificates \
        fonts-freefont-ttf \
        libnss3 \
        libxss1 \
        libatk-bridge2.0-0 \
        libgtk-3-0 \
        libasound2 \
        libgbm1 \
        libxshmfence1 \
        libdrm2 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libcups2 \
        libxcomposite1 \
        libxcursor1 \
        libxi6 \
        libxtst6 \
        fonts-liberation \
        libappindicator3-1 \
        xdg-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Node.js package files
COPY package*.json ./

# Install Node.js dependencies (production only)
RUN npm ci --only=production

# Copy Python requirements only (for better Docker layer caching)
COPY scrapers/requirements.txt ./scrapers/

# Create a Python virtual environment and install Python requirements + Playwright browser dependencies
RUN python3 -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r scrapers/requirements.txt && \
    # Install Playwright browsers as root first
    /opt/venv/bin/playwright install-deps && \
    /opt/venv/bin/playwright install chromium

# Set Python virtual environment as default
ENV PATH="/opt/venv/bin:$PATH"
ENV VIRTUAL_ENV="/opt/venv"

# Copy the rest of your application code
COPY . .

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nodejs

# Create cache directory for Playwright and set permissions
RUN mkdir -p /home/nodejs/.cache && \
    chown -R nodejs:nodejs /home/nodejs

# Change ownership for security (including Playwright cache)
RUN chown -R nodejs:nodejs /app /opt/venv /home/nodejs

# Switch to the non-root user
USER nodejs

# Set Playwright cache directory for the non-root user
ENV PLAYWRIGHT_BROWSERS_PATH="/home/nodejs/.cache/ms-playwright"

# Install Playwright browsers for the nodejs user
RUN /opt/venv/bin/playwright install chromium

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the Node.js application
CMD ["npm", "start"]
# ============================================
# Markdown to PDF Converter - Docker Image
# ============================================
# 
# A standalone, production-ready service for converting
# Markdown to PDF with perfect KaTeX math formula rendering
# and multilingual support.
#
# Features:
# - Perfect KaTeX math formula rendering
# - Multilingual support (Chinese, Japanese, Korean, etc.)
# - GitHub Flavored Markdown
# - Syntax highlighting
# - RESTful API
# - Health check endpoint
# - Graceful shutdown
#
# Usage:
#   docker build -t markdown-to-pdf .
#   docker run -d -p 3000:3000 --name md-to-pdf markdown-to-pdf
#
# ============================================

FROM node:22-alpine

# Metadata
LABEL maintainer="MathMeow Team"
LABEL description="Markdown to PDF converter with KaTeX math formula support"
LABEL version="1.0.0"

# Install Chromium and dependencies
# - chromium: for Puppeteer
# - nss, freetype, harfbuzz: required libraries
# - ca-certificates: for HTTPS
# - ttf-dejavu: basic fonts (optional)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-dejavu \
    && rm -rf /var/cache/apk/*

# Configure Puppeteer to use system Chromium
# This avoids downloading Chromium during npm install (saves ~300MB)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy package files and tsconfig
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (needed for TypeScript build)
RUN npm ci && \
    npm cache clean --force

# Copy application source files
COPY *.ts ./
COPY index.html ./

# Build TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies after build (keep production deps only)
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1);})"

# Start server (use compiled JavaScript)
CMD ["npm", "start"]


# Multi-stage Dockerfile for the entire application
# This builds both frontend and backend in a single image

# ==================== Stage 1: Frontend Build ====================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files (copy entire directory contents)
# Using JSON array format to handle space in directory name
COPY ["ui/Tax RAG/", "./"]

# Install dependencies
RUN npm ci

# Build the application
RUN npm run build

# ==================== Stage 2: Backend ====================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY api/requirements_api.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy API code
COPY api/ /app/api/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /app/frontend/dist; \
    index index.html; \
    \
    # Serve frontend static files \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Proxy API requests to FastAPI \
    location /api { \
        rewrite ^/api(.*)$ $1 break; \
        proxy_pass http://127.0.0.1:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Proxy auth endpoints \
    location /auth { \
        proxy_pass http://127.0.0.1:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Proxy chat endpoints \
    location /chat { \
        proxy_pass http://127.0.0.1:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_set_header Cache-Control "no-cache"; \
        proxy_buffering off; \
    } \
    \
    # Proxy upload endpoint \
    location /upload { \
        proxy_pass http://127.0.0.1:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        client_max_body_size 50M; \
    } \
    \
    # Proxy session endpoints \
    location /session { \
        proxy_pass http://127.0.0.1:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Proxy documents endpoint \
    location /documents { \
        proxy_pass http://127.0.0.1:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/sites-available/default

# Create startup script
RUN echo '#!/bin/bash\n\
# Start FastAPI in background\n\
cd /app/api && uvicorn app:app --host 127.0.0.1 --port 8000 &\n\
# Start nginx in foreground\n\
nginx -g "daemon off;"\n\
' > /app/start.sh && chmod +x /app/start.sh

# Create directory for indexed documents
RUN mkdir -p /app/api/data

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start both services
CMD ["/app/start.sh"]


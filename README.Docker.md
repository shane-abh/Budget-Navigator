# Docker Setup for Budget Navigator

This guide explains how to build and run the Budget Navigator application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)
- A `.env` file with required environment variables (see below)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PINECONE_API_KEY=your_pinecone_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

> 💡 **Tip**: Generate a secure JWT secret with: `python -c "import secrets; print(secrets.token_hex(32))"`

## Quick Start

### Option 1: Using Docker Compose (Recommended)

This runs both frontend and backend as separate services:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Single Container (All-in-One)

Edit `docker-compose.yml` and uncomment the `app` service, then comment out `api` and `ui` services:

```bash
docker-compose up -d
```

**Access the application:**
- Application: http://localhost:80

### Option 3: Build Individual Services

#### Backend Only

```bash
# Build the API image
docker build -f Dockerfile.api -t budget-navigator-api .

# Run the API container
docker run -d \
  --name budget-navigator-api \
  -p 8000:8000 \
  --env-file .env \
  budget-navigator-api
```

#### Frontend Only

```bash
# Build the UI image
docker build -f Dockerfile.ui -t budget-navigator-ui .

# Run the UI container
docker run -d \
  --name budget-navigator-ui \
  -p 3000:80 \
  -e VITE_API_URL=http://localhost:8000 \
  budget-navigator-ui
```

## Dockerfile Options

### `Dockerfile.api`
- Backend API only
- Python 3.11 with FastAPI
- Runs on port 8000

### `Dockerfile.ui`
- Frontend UI only
- Multi-stage build (Node.js build + Nginx serve)
- Runs on port 80 (mapped to 3000 in docker-compose)

### `Dockerfile`
- All-in-one container
- Includes both frontend and backend
- Uses Nginx as reverse proxy
- Single port (80) for everything

## Development

For development with hot-reload:

```bash
# Backend with volume mount for code changes
docker run -d \
  --name budget-navigator-api-dev \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/api:/app \
  budget-navigator-api \
  uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Production Considerations

1. **Environment Variables**: Never commit `.env` files. Use Docker secrets or environment variable injection in your deployment platform.

2. **HTTPS**: In production, use a reverse proxy (like Traefik or Nginx) with SSL certificates in front of the containers.

3. **Database Persistence**: The `chroma_data` volume persists the ChromaDB data. For production, consider using a managed database service.

4. **Resource Limits**: Add resource limits to docker-compose.yml:
   ```yaml
   services:
     api:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
   ```

5. **Health Checks**: Health checks are configured in the Dockerfiles. Monitor these in production.

6. **Logging**: Configure logging aggregation (e.g., ELK stack, CloudWatch) for production.

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs api
docker-compose logs ui

# Check if ports are already in use
netstat -an | grep 8000
netstat -an | grep 3000
```

### Environment variables not loading
- Ensure `.env` file exists in the root directory
- Check that variable names match exactly (case-sensitive)
- Verify `.env` file is not in `.dockerignore`

### Frontend can't connect to API
- Check that `VITE_API_URL` is set correctly
- If using docker-compose, use service name: `http://api:8000`
- Check CORS settings in `api/app.py`

### Build fails
```bash
# Clean build (no cache)
docker-compose build --no-cache

# Check disk space
docker system df
docker system prune  # Clean unused resources
```

## Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect budget-navigator_api_data

# Remove volumes (⚠️ deletes data)
docker-compose down -v
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Or rebuild specific service
docker-compose build api
docker-compose up -d api
```

## Security Notes

- The JWT_SECRET should be a strong, randomly generated string in production
- Use HTTPS in production (configure reverse proxy with SSL)
- Regularly update base images for security patches
- Use Docker secrets for sensitive data in production environments
- Review and restrict CORS origins in production


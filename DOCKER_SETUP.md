# Docker Setup Guide

This guide explains how to run the VPS Monitor using Docker Compose with support for both PostgreSQL and SQLite databases.

## Quick Start

### Option 1: PostgreSQL (Recommended for Production)

The default docker-compose configuration uses PostgreSQL:

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your settings (or use defaults)
# Make sure DATABASE_TYPE=postgresql

# 3. Start all services
docker-compose up -d

# 4. Create superuser
docker-compose exec backend python manage.py createsuperuser

# 5. Access the application
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# Admin: http://localhost:8000/admin
```

### Option 2: SQLite (Quick Local Development)

SQLite is perfect for quick local testing:

```bash
# 1. Copy SQLite environment file
cp .env.sqlite .env

# 2. Start services (database service will be skipped)
docker-compose up -d

# 3. Create superuser
docker-compose exec backend python manage.py createsuperuser

# 4. Access the application
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

## Environment Variables

### Database Configuration

Choose one of the following:

#### PostgreSQL (DATABASE_TYPE=postgresql)
```env
DATABASE_TYPE=postgresql
DB_NAME=vps_monitor
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=db              # Service name from docker-compose
DB_PORT=5432
```

#### SQLite (DATABASE_TYPE=sqlite)
```env
DATABASE_TYPE=sqlite
DB_PATH=/app/db.sqlite3  # Path inside container
```

### Other Configuration
```env
DJANGO_SECRET_KEY=your-secret-key-change-in-production
DJANGO_DEBUG=True              # Use False in production
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ENCRYPTION_KEY=your-32-char-encryption-key
VITE_API_URL=http://localhost:8000/api/v1
```

## Docker Compose Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop services and remove volumes (deletes data!)
docker-compose down -v

# Rebuild images
docker-compose build

# Rebuild specific service
docker-compose build backend

# Execute command in container
docker-compose exec backend python manage.py shell

# Create database migrations
docker-compose exec backend python manage.py makemigrations

# Apply database migrations
docker-compose exec backend python manage.py migrate
```

## Common Tasks

### Create Django Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Collect Static Files
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

### View Database (PostgreSQL)
```bash
docker-compose exec db psql -U postgres -d vps_monitor
```

### Access Django Shell
```bash
docker-compose exec backend python manage.py shell
```

### Clear Cache
```bash
docker-compose exec redis redis-cli FLUSHDB
```

### View Redis Cache Keys
```bash
docker-compose exec redis redis-cli KEYS '*'
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Docker Network                             │
│                 (vps-monitor-network)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │   Frontend   │   │   Backend    │   │   Database   │     │
│  │  (Vite/React)├──→│  (Django)    ├──→│ (PostgreSQL) │     │
│  │  :5173       │   │  :8000       │   │  :5432       │     │
│  └──────────────┘   └──────┬───────┘   └──────────────┘     │
│                            │                                  │
│                    ┌───────┴────────┐                        │
│                    │    Redis       │                        │
│                    │    :6379       │                        │
│                    └────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Database Connection Error
```bash
# Check if database service is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Ensure DATABASE_TYPE is correct in .env
```

### Redis Connection Error
```bash
# Check Redis status
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Frontend Cannot Connect to Backend
- Verify `CORS_ALLOWED_ORIGINS` includes frontend URL
- Check backend logs: `docker-compose logs backend`
- Verify `VITE_API_URL` in .env matches backend URL

### SQLite Database Not Created
- Ensure `DATABASE_TYPE=sqlite` in .env
- Check backend logs for migration errors
- Verify `DB_PATH` is writable

### Frontend Build Issues
- Clear node_modules and reinstall
```bash
docker-compose exec frontend sh -c "rm -rf node_modules && npm install"
```

### Backend Static Files Missing
```bash
docker-compose exec backend python manage.py collectstatic --noinput --clear
```

## Performance Tips

1. **Use PostgreSQL for Production**: PostgreSQL is more robust than SQLite for multi-user applications
2. **Increase Redis TTL**: Modify cache settings in backend/conf/settings.py for better performance
3. **Enable Django Debug Toolbar**: Set `DJANGO_DEBUG=True` during development for query analysis
4. **Use Docker Volumes**: Persistent volumes keep data between container restarts

## Security Considerations

### Before Production Deployment

1. **Change all default credentials**:
   - `DJANGO_SECRET_KEY`: Generate a new one
   - `DB_PASSWORD`: Use a strong password
   - `ENCRYPTION_KEY`: Generate a new Fernet key

2. **Set DEBUG=False**:
   ```env
   DJANGO_DEBUG=False
   ```

3. **Configure ALLOWED_HOSTS**:
   ```env
   DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

4. **Configure CORS properly**:
   ```env
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   ```

5. **Use environment-specific files**:
   - Development: `.env` with `DEBUG=True`
   - Production: `.env.prod` with secure settings

6. **Enable HTTPS**: Use a reverse proxy like Nginx with SSL certificates

## Next Steps

- Deploy to cloud provider (AWS, DigitalOcean, Contabo, etc.)
- Set up CI/CD pipeline with GitHub Actions
- Configure monitoring and logging (Prometheus, Grafana)
- Set up automated backups for PostgreSQL data

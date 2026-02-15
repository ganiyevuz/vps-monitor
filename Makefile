.PHONY: help install dev test lint format clean

help:
	@echo "Available commands:"
	@echo "  make install     - Install dependencies for both backend and frontend"
	@echo "  make dev         - Run development environment (docker-compose)"
	@echo "  make test        - Run backend tests"
	@echo "  make lint        - Run linting checks"
	@echo "  make format      - Format code with black"
	@echo "  make migrate     - Run database migrations"
	@echo "  make secret-key  - Generate a new Django secret key"
	@echo "  make clean       - Clean up cache and build files"

install:
	@echo "Installing backend dependencies..."
	cd backend && uv sync

dev:
	@echo "Starting development environment..."
	cd deployment/docker && docker-compose up -d

dev-down:
	@echo "Stopping development environment..."
	cd deployment/docker && docker-compose down

test:
	@echo "Running tests..."
	cd backend && python manage.py test

migrate:
	@echo "Running migrations..."
	cd backend && python manage.py makemigrations && python manage.py migrate

secret-key:
	cd backend && python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

lint:
	@echo "Running linting..."
	cd backend && flake8 apps conf

format:
	@echo "Formatting code..."
	cd backend && black apps conf

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find backend -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/.coverage
	@echo "Cleanup complete"

docs-serve:
	@echo "Serving documentation..."
	cd docs && python -m http.server 8000

.PHONY: dev-down docs-serve

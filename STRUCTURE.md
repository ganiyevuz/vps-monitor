# Project Structure

This document describes the organization of the Django project template.

## Directory Layout

```
project-root/
│
├── backend/                          # Django Backend Application
│   ├── apps/                         # Django Applications
│   │   ├── shared/                  # Shared utilities and storage backends
│   │   └── urls.py                  # App URL routing
│   ├── conf/                         # Django Configuration
│   │   ├── settings.py              # Main Django settings
│   │   ├── urls.py                  # Root URL configuration
│   │   ├── wsgi.py                  # WSGI application (production)
│   │   ├── asgi.py                  # ASGI application (websockets)
│   │   └── swagger.py               # DRF Spectacular configuration
│   ├── tests/                        # Backend tests
│   ├── static/                       # Static files (CSS, JS, images)
│   ├── media/                        # User-uploaded media files
│   ├── manage.py                     # Django management CLI
│   ├── .env.example                  # Example environment variables
│   ├── pyproject.toml                # Python project metadata and dependencies
│   └── setup.cfg                     # Setup configuration
│
├── frontend/                         # Frontend Application
│   ├── public/                       # Static public assets
│   ├── src/                          # Source code
│   ├── package.json                  # NPM dependencies
│   └── .env.example                  # Example environment variables
│
├── deployment/                       # Infrastructure and Deployment
│   ├── docker/                       # Docker configuration
│   │   ├── Dockerfile               # Backend Docker image
│   │   ├── docker-compose.yml       # Development docker-compose
│   │   ├── entrypoint.sh            # Container entrypoint script
│   │   └── nginx.conf               # Nginx configuration
│   ├── scripts/                      # Deployment scripts
│   │   └── deploy.sh                # Deployment automation
│   └── k8s/                          # Kubernetes manifests (optional)
│
├── scripts/                          # Utility scripts
│   ├── setup.sh                      # Initial setup script
│   ├── db-init.sh                    # Database initialization
│   └── seed-data.sh                  # Seed database with sample data
│
├── docs/                             # Documentation
│   ├── API.md                        # API documentation
│   ├── SETUP.md                      # Setup and installation guide
│   ├── CONTRIBUTING.md               # Contribution guidelines
│   └── DEPLOYMENT.md                 # Deployment guide
│
├── .editorconfig                     # Editor configuration
├── .env.example                      # Root environment variables template
├── .gitignore                        # Git ignore rules
├── Makefile                          # Project commands
├── README.md                         # Project overview
└── STRUCTURE.md                      # This file
```

## Key Components

### Backend (`/backend`)
- Django project with modular app structure
- Configuration in `conf/` directory
- Database models and APIs in `apps/`
- Testing in `tests/` directory

### Frontend (`/frontend`)
- Modern frontend framework
- Component-based architecture
- API integration with backend

### Deployment (`/deployment`)
- Docker: Containerization for backend and services
- Scripts: Automated deployment procedures
- Kubernetes: Optional container orchestration configs

### Scripts (`/scripts`)
Utility scripts for project setup, initialization, and management.

### Documentation (`/docs`)
- API documentation
- Setup instructions
- Deployment guides
- Contribution guidelines

## Development Workflow

### Quick Start

```bash
make install
cp .env.example .env
make dev
```

### Common Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install backend dependencies |
| `make dev` | Start development environment |
| `make migrate` | Run database migrations |
| `make test` | Run backend tests |

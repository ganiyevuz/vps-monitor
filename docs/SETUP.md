# Setup Guide

## Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd django-project-template
```

### 2. Create Environment File
```bash
cp .env.example .env
```

### 3. Install Dependencies

**Backend:**
```bash
cd backend
uv sync
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Database Setup
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run Development Server

**With Docker:**
```bash
make dev
```

**Locally:**
```bash
cd backend
python manage.py runserver
```

## Production Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Troubleshooting

Check the relevant documentation in `/docs` directory.

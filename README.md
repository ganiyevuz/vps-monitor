# VPS Monitor

A modern, full-stack VPS monitoring dashboard for managing cloud infrastructure across multiple providers (Contabo and DigitalOcean) in one unified interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12+-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)

## ✨ Features

- 🌍 **Multi-Provider Support** - Monitor VPS instances across Contabo and DigitalOcean
- 📊 **Unified Dashboard** - See all instances from all providers in one place
- 🔐 **Secure Credentials** - Encrypted API credentials storage with Fernet encryption
- 🎨 **Modern UI/UX** - Premium design with smooth animations and responsive layout
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-time Sync** - Auto-refresh data every minute with manual sync option
- 🔍 **Advanced Filtering** - Filter instances by provider, status, region, and more
- 📈 **Sortable Tables** - Click column headers to sort ascending/descending
- 🔄 **Smart Caching** - Redis-backed caching for optimal performance
- 🎯 **Toast Notifications** - Non-intrusive, user-friendly notifications
- 🧪 **Connection Testing** - Test provider connections before adding

## 🏗️ Tech Stack

### Backend
- **Framework**: Django 5.2 + Django REST Framework
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT (django-rest-simplejwt)
- **Encryption**: Fernet (cryptography)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand (auth) + React Query (server state)
- **UI Components**: Lucide React icons
- **Routing**: React Router v6

## 📋 Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 12+
- Redis 6+

## 🚀 Quick Start

### Backend Setup

```bash
# Install dependencies
cd backend
uv sync

# Configure environment
cp ../.env.example ../.env

# Generate encryption key
python -c "from cryptography.fernet import Fernet; print('ENCRYPTION_KEY=' + Fernet.generate_key().decode())"

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
# Runs on http://localhost:8000
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
# Runs on http://localhost:5173
```

## 🎯 Usage

### 1. Login
- Navigate to http://localhost:5173
- Enter your admin credentials

### 2. Add a Provider

#### Contabo
1. Go to **Providers** page
2. Click **Add Provider**
3. Fill in:
   - **Name**: My Contabo Account
   - **Type**: Contabo
   - **Client ID**, **Client Secret**, **API User**, **API Password**
4. Click **Connect Account**
5. Test connection with the **Test** button

#### DigitalOcean
1. Go to **Providers** page
2. Click **Add Provider**
3. Fill in:
   - **Name**: My DigitalOcean
   - **Type**: DigitalOcean
   - **API Token**
4. Click **Connect Account**
5. Test connection with the **Test** button

### 3. View Dashboard
- **Dashboard**: See all VPS instances, stats, and metrics
- **Providers**: Manage provider accounts, edit, or delete
- **Sorting**: Click any column header to sort
- **Filtering**: Use provider/status/region filters
- **Refresh**: Manual data sync available

## 📁 Project Structure

```
vps-monitor/
├── backend/
│   ├── apps/
│   │   ├── providers/        # Provider management & OAuth
│   │   ├── vps/              # VPS aggregation service
│   │   └── shared/           # Shared utilities
│   ├── conf/                 # Django settings
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── lib/
│   │   │   ├── api/          # API clients
│   │   │   ├── hooks/        # React Query hooks
│   │   │   ├── stores/       # Zustand stores
│   │   │   └── utils/        # Utilities
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/token/              # Login
POST   /api/v1/token/refresh/      # Refresh token
```

### Providers
```
GET    /api/v1/providers/          # List providers
POST   /api/v1/providers/          # Create provider
PATCH  /api/v1/providers/{id}/     # Update provider
DELETE /api/v1/providers/{id}/     # Delete provider
POST   /api/v1/providers/{id}/test_connection/  # Test connection
```

### VPS Instances
```
GET    /api/v1/vps/                # List all instances
GET    /api/v1/vps/provider/{id}/  # List by provider
POST   /api/v1/vps/refresh/        # Refresh cache
```

## 🔐 Security

- API credentials are encrypted with Fernet symmetric encryption
- JWT tokens for API authentication
- CORS protection for frontend
- Password fields are hidden in forms
- No credentials stored in localStorage
- Secure credential rotation support

## 📊 Caching

- **VPS Instances**: 5-minute TTL, per-provider cache keys
- Manual refresh available to clear cache

## 🎨 UI Features

- **Modern Design**: Premium card-based layout with gradients
- **Dark Mode Ready**: Full Tailwind CSS theming support
- **Smooth Animations**: Fade-in, slide-in, zoom animations
- **Toast Notifications**: Success, error, warning, info types
- **Responsive Grid**: Auto-adjusts to screen size
- **Sortable Tables**: Click headers to sort ascending/descending
- **Human-Readable Dates**: Relative time display (e.g., "2mo ago")
- **Status Badges**: Color-coded instance and sync statuses

## 🚀 Building for Production

### Backend
```bash
cd backend
python manage.py collectstatic
gunicorn conf.wsgi:application
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to CDN or static hosting
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for simplified VPS management across multiple cloud providers.


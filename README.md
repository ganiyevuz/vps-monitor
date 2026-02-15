# Django Project Template

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, production-ready Django project template for scalable web applications using **`uv`** for dependency management.

---

## 🚀 Features

* 🧩 **Modular App Structure**: All Django apps live in `apps/` for easy scalability and separation of concerns.
* 🐳 **Docker & Docker Compose**: Full support for local and production environments with Docker.
* 🗄️ **PostgreSQL & Redis**: Production-grade database and cache/backing store.
* ☁️ **S3/MinIO Storage**: Optional S3-compatible storage for media files.
* 🦾 **REST API**: Built-in Django REST Framework, JWT authentication, filtering, and error handling.
* 🧑‍💻 **Admin UI**: Jazzmin for a beautiful Django admin interface.
* 🧪 **Testing & Linting**: Pytest, Flake8, and Debug Toolbar for robust development.
* 📦 **Makefile**: Common commands for migrations, dependency updates, and secret key generation.
* 📊 **Monitoring**: Integrated Prometheus and Grafana dashboards for metrics and alerting.
* 🔐 **Security**: Django Axes for brute-force protection, CORS, and secure settings.
* 📦 **CI/CD Ready**: Example GitHub Actions workflow for build and deployment.
* 🤖 **Telegram Notifications**: Deployment script can notify via Telegram on success/failure.
* 🌐 **Traefik Reverse Proxy**: Traefik is used for smart routing, HTTPS, and service discovery in Docker.

---

## 🛠️ Tech Stack & Integrations

* **Django 5.2**
* **Django REST Framework**
* **PostgreSQL**
* **Redis**
* **Docker & Docker Compose**
* **Prometheus & Grafana**
* **MinIO (S3-compatible storage)**
* **Celery (with Redis broker)**
* **drf-yasg (Swagger/OpenAPI docs)**
* **django-debug-toolbar**
* **pytest, flake8, pyflakes**
* **Traefik**
* **GitHub Actions**
* **uv** for dependency management

---

## 📁 Project Structure

```
apps/           # All Django apps
conf/           # Project config (settings, urls, wsgi, asgi, swagger)
deployment/     # Docker, Nginx, Prometheus, Grafana, Traefik, CI/CD scripts
requirements/   # Removed in UV workflow
uv.lock         # Locked dependencies managed by uv
pyproject.toml  # uv config file
Makefile        # Common dev commands
example.env     # Example environment variables
```

### 🗂️ Deployment Structure

* **deployment/backend/**: Production Docker Compose, Prometheus, Grafana configs
* **deployment/docker-compose.shared.yml**: Shared services (Traefik, MinIO)
* **deployment/nginx.conf**: Nginx config for static/media
* **deployment/entrypoint.sh**: Entrypoint for Django/Gunicorn container
* **deployment/Dockerfile**: Multi-stage Docker build for Django
* **deployment/deploy.sh**: Bash script for CI/CD and Telegram notifications

---

## ⚡ Getting Started (UV-Based)

### Prerequisites

* Python 3.10+
* Docker & Docker Compose
* `uv` installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

---

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/ganiyevuz/django-project-template.git
   cd django-project-template
   ```

2. Copy the example environment file:

   ```bash
   cp example.env .env
   ```

3. Install dependencies with `uv`:

   ```bash
   uv sync
   ```

   This reads `pyproject.toml` and installs the locked versions in `uv.lock`.

4. Build and start the development environment with Docker:

   ```bash
   cd deployment/dev
   docker-compose up --build
   ```

---

### Running Locally (without Docker)

1. Create a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Sync dependencies via `uv`:

   ```bash
   uv sync
   ```
3. Run migrations and start the server:

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

---

### Production

* Use `uv sync --prod` to install production dependencies.
* Gunicorn is used as the WSGI server (see `deployment/entrypoint.sh`).
* Use `deployment/prod/docker-compose.yml` for production deployment.
* Traefik and MinIO are managed via `deployment/docker-compose.shared.yml`.

---

## 📊 Monitoring & Observability

* Prometheus scrapes metrics from Django, Traefik, Redis, Node Exporter, and more.
* Grafana dashboards for real-time monitoring.
* Alerts and notifications can be configured.

---

## 🔒 Security

* Django Axes for brute-force protection
* CORS and CSRF settings
* Environment-based secrets

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.

---

## 📄 License

MIT



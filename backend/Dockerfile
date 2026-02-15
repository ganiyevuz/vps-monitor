FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies using uv
RUN pip install uv

# Copy pyproject.toml and install dependencies
COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen

# Copy application code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["gunicorn", "conf.wsgi:application", "--bind", "0.0.0.0:8000"]

#!/bin/bash

# Exit on error
set -e

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Start Gunicorn server
echo "Starting Gunicorn..."
exec gunicorn conf.wsgi:application --env DJANGO_SETTINGS_MODULE=conf.settings --bind 0.0.0.0:8000 --workers 4

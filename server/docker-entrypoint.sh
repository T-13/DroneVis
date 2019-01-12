#!/bin/bash

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate

# Load fixtures
echo "Load fixtures"
python manage.py loaddata vis/fixtures/initial_data.json

# Start server
echo "Start server"
python manage.py runserver 0.0.0.0:8000

#!/bin/bash
echo "Starting Flask application..."
echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Starting gunicorn..."
gunicorn --bind 0.0.0.0:$PORT app:app --timeout 120 --workers 1

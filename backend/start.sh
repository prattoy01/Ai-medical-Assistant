#!/bin/bash
set -e

echo "=== Starting Flask Application ==="
echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Files in directory: $(ls -la)"

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Testing app import ==="
python test_app.py

echo "=== Starting gunicorn ==="
python -m gunicorn --bind 0.0.0.0:$PORT app:app --timeout 120 --workers 1 --log-level debug

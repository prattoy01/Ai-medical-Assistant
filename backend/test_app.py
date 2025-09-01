#!/usr/bin/env python3
"""
Test script to verify Flask app can be imported and run
"""
import os
import sys

print("Python version:", sys.version)
print("Current directory:", os.getcwd())
print("Files in current directory:", os.listdir('.'))

try:
    from app import app
    print("✅ Successfully imported Flask app")
    print("App name:", app.name)
    print("App config:", app.config.get('ENV', 'Not set'))
except Exception as e:
    print("❌ Failed to import Flask app:", e)
    sys.exit(1)

if __name__ == "__main__":
    print("✅ Flask app test completed successfully")

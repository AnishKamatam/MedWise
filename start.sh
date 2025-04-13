#!/bin/bash

# Kill any existing processes on port 5002
lsof -ti:5002 | xargs kill -9 2>/dev/null || true

# Start the backend
gunicorn backend.app:app --bind 0.0.0.0:5002 --workers 1 --timeout 120 
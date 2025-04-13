#!/bin/bash

# Install dependencies
cd .. && pip install -r requirements.txt

# Run the application with gunicorn
cd backend && gunicorn app:app --bind 0.0.0.0:5002 --workers 1 --timeout 120 
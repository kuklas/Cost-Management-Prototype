#!/bin/bash

# Simple server to serve the landing page
echo "🚀 Starting landing page server..."
echo "📍 Open http://localhost:8080 in your browser"
echo ""
echo "Press Ctrl+C to stop"

cd "$(dirname "$0")"
python3 -m http.server 8080


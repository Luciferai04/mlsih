#!/bin/bash

# NATPAC Travel Survey Flask API - Run Script
# Smart India Hackathon 2025

echo "=========================================="
echo "NATPAC Travel Survey - Flask API"
echo "Smart India Hackathon 2025"
echo "=========================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p uploads exports logs

# Set environment variables if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Flask API Environment Variables
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=sih-2025-natpac-secret-key
JWT_SECRET_KEY=jwt-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/natpac
PORT=5000
EOF
    echo "✅ .env file created"
fi

# Export environment variables
export $(grep -v '^#' .env | xargs)

# Start the Flask API
echo ""
echo "🚀 Starting Flask API on port ${PORT:-5000}..."
echo "📍 API URL: http://localhost:${PORT:-5000}"
echo "📚 API Docs: http://localhost:${PORT:-5000}/api/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run with gunicorn for production or Flask for development
if [ "$FLASK_ENV" = "production" ]; then
    gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:${PORT:-5000} app:app
else
    python app.py
fi
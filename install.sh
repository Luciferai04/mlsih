#!/bin/bash

# NATPAC Travel Survey App - Installation Script
# Smart India Hackathon 2025
# ===============================================

echo "=========================================="
echo "NATPAC Travel Survey App - Installation"
echo "Smart India Hackathon 2025"
echo "=========================================="
echo ""

# Check Python version
echo "📌 Checking Python version..."
python_version=$(python3 --version 2>&1)
if [[ $? -ne 0 ]]; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi
echo "✅ $python_version"
echo ""

# Check Node.js version
echo "📌 Checking Node.js version..."
node_version=$(node --version 2>&1)
if [[ $? -ne 0 ]]; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi
echo "✅ Node.js $node_version"
echo ""

# Create virtual environment
echo "🔧 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
echo "✅ Virtual environment created"
echo ""

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip
echo "✅ pip upgraded"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
echo "Choose installation type:"
echo "1) Minimal (Essential dependencies only)"
echo "2) Standard (All production dependencies)"
echo "3) Development (All dependencies including dev tools)"
read -p "Enter choice (1/2/3): " install_choice

case $install_choice in
    1)
        echo "Installing minimal requirements..."
        pip install -r requirements-minimal.txt
        ;;
    2)
        echo "Installing standard requirements..."
        pip install -r requirements.txt
        ;;
    3)
        echo "Installing development requirements..."
        pip install -r requirements-dev.txt
        ;;
    *)
        echo "Invalid choice. Installing minimal requirements..."
        pip install -r requirements-minimal.txt
        ;;
esac

echo "✅ Python dependencies installed"
echo ""

# Install Node.js dependencies for main project
echo "📦 Installing Node.js dependencies for main project..."
npm install
echo "✅ Main project dependencies installed"
echo ""

# Install Kerala Travel Companion dependencies
echo "📦 Installing Kerala Travel Companion dependencies..."
cd kerela-travel-companion-app
npm install
cd ..
echo "✅ Kerala Travel Companion dependencies installed"
echo ""

# Install NATPAC Travel App dependencies if needed
if [ -d "natpac-travel-app" ]; then
    echo "📦 Installing NATPAC Travel App dependencies..."
    cd natpac-travel-app
    npm install
    cd ..
    echo "✅ NATPAC Travel App dependencies installed"
    echo ""
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# NATPAC Travel Survey App Environment Variables
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/natpac
JWT_SECRET=your-secret-key-here
ML_SERVICE_URL=http://localhost:5000
GPS_UPDATE_INTERVAL=5000
KERALA_API_KEY=your-kerala-api-key
EOF
    echo "✅ .env file created (Please update with your actual values)"
    echo ""
fi

# Download ML models if needed
echo "🤖 Setting up ML models..."
python3 -c "
import os
os.makedirs('models', exist_ok=True)
print('✅ Models directory created')
"

# Run initial tests
echo "🧪 Running initial tests..."
echo "Testing ML Service..."
node -c "require('./services/mlService.js')" 2>/dev/null
if [[ $? -eq 0 ]]; then
    echo "✅ ML Service is ready"
else
    echo "⚠️ ML Service needs configuration"
fi
echo ""

# Summary
echo "=========================================="
echo "✅ Installation Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Update .env file with your configuration"
echo "3. Start the backend server: npm start"
echo "4. Start Kerala Travel Companion: cd kerela-travel-companion-app && npm run dev"
echo "5. Access the app at http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "- README.md - Main documentation"
echo "- AI_FEATURES_INTEGRATION.md - AI/ML features"
echo "- GITHUB_REPO_INFO.md - Repository information"
echo ""
echo "🏆 Good luck with Smart India Hackathon 2025!"
echo ""
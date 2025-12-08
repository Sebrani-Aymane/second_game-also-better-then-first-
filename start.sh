#!/bin/bash

# Simon Transcendence - Quick Start Script
# This script sets up and runs the game

echo "🚀 Simon Transcendence - Quick Start"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Navigate to backend directory
echo "📦 Installing backend dependencies..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎮 Starting Simon Transcendence Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Server will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start

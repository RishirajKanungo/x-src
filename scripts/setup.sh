#!/bin/bash

# x-src Setup Script
# This script sets up the x-src project with all necessary dependencies

set -e

echo "🎵 Setting up x-src — Cross-Source Music Tools Hub"
echo "=================================================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
else
    echo "✅ pnpm is already installed"
fi

# Check if Node.js version is sufficient
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node --version)"
    echo "Please upgrade Node.js and try again."
    exit 1
else
    echo "✅ Node.js version: $(node --version)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build packages
echo "🔨 Building packages..."
pnpm build

# Set up environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local with your actual credentials"
else
    echo "✅ .env.local already exists"
fi

# Check if PostgreSQL is available
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client found"
    echo "💡 Make sure to set up your DATABASE_URL in .env.local"
else
    echo "⚠️  PostgreSQL client not found"
    echo "💡 You'll need to install PostgreSQL or use a cloud service"
fi

# Check if Redis is available
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis client found"
else
    echo "⚠️  Redis client not found"
    echo "💡 Consider using Upstash Redis for development"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your credentials"
echo "2. Set up your database and run: pnpm db:push"
echo "3. Start development: pnpm dev"
echo "4. Open http://localhost:3000"
echo ""
echo "For more information, see README.md and DEPENDENCIES.md"

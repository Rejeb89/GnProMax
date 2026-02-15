#!/bin/bash

# ERP Starter - Setup Script

set -e

echo "🚀 ERP Starter Template Setup"
echo "=============================="

# Create .env file
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "✅ .env file created. Please update with your values."
else
  echo "✅ .env file already exists"
fi

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -d node_modules ]; then
  npm install
  echo "✅ Backend dependencies installed"
else
  echo "✅ Backend dependencies already installed"
fi

# Initialize Prisma
if [ ! -f prisma/schema.prisma ]; then
  echo "⚙️  Initializing Prisma..."
  npm run prisma:generate
else
  echo "✅ Prisma already initialized"
fi

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

if [ ! -d node_modules ]; then
  npm install
  echo "✅ Frontend dependencies installed"
else
  echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Run 'docker-compose up --build' to start all services"
echo "3. Access the application at http://localhost:5173"
echo ""

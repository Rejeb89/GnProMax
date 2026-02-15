@echo off
REM ERP Starter - Windows Setup Script

echo.
echo 🚀 ERP Starter Template Setup
echo ==============================

REM Create .env file
if not exist .env (
  echo 📝 Creating .env file...
  copy .env.example .env
  echo ✅ .env file created. Please update with your values.
) else (
  echo ✅ .env file already exists
)

REM Setup Backend
echo.
echo 📦 Setting up Backend...
cd backend

if not exist node_modules (
  call npm install
  echo ✅ Backend dependencies installed
) else (
  echo ✅ Backend dependencies already installed
)

REM Initialize Prisma
if not exist prisma\schema.prisma (
  echo ⚙️  Initializing Prisma...
  call npm run prisma:generate
) else (
  echo ✅ Prisma already initialized
)

cd ..

REM Setup Frontend
echo.
echo 🎨 Setting up Frontend...
cd frontend

if not exist node_modules (
  call npm install
  echo ✅ Frontend dependencies installed
) else (
  echo ✅ Frontend dependencies already installed
)

cd ..

echo.
echo ✨ Setup Complete!
echo.
echo Next steps:
echo 1. Update .env file with your configuration
echo 2. Run 'docker-compose up --build' to start all services
echo 3. Access the application at http://localhost:5173
echo.
pause

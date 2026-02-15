# Quick Start Guide

## For the Impatient 🚀

Get the ERP system running in 5 minutes.

### Prerequisites
- Docker & Docker Compose installed
- Git (optional)

### Step 1: Extract and Navigate
```bash
cd erp-starter
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

**Important:** Update these in `.env`:
```env
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
DB_PASSWORD=your_postgres_password
```

### Step 3: Start Everything
```bash
docker-compose up --build -d
```

### Step 4: Wait for Database
```bash
# Check service status
docker-compose ps

# Wait until all services show "Up"
```

### Step 5: Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Database Admin**: http://localhost:5050

### Step 6: Login
```
Email: admin@testcompany.com
Password: Admin@123456
```

## Troubleshooting Quick Fixes

**Services Won't Start?**
```bash
docker-compose down
docker system prune -a
docker-compose up --build -d
```

**Can't Login?**
```bash
# Check if database is ready
docker exec erp-postgres pg_isready -U postgres
```

**Port Already in Use?**
```bash
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000
```

**Need Help?**
See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## Development

### Backend Development
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Local Database Access

**via pgAdmin:**
- URL: http://localhost:5050
- Email: admin@example.com
- Password: admin

**via Command Line:**
```bash
docker exec -it erp-postgres psql -U postgres -d erp_db
```

## Next Steps

1. **Customize** - Modify the system for your needs
2. **Test** - See [TESTING.md](TESTING.md)
3. **Deploy** - See [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Develop** - See [DEVELOPMENT.md](DEVELOPMENT.md)

---

**That's it! You're running a production-ready ERP system.**

# Development Guide

## Local Development Setup

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **PostgreSQL**: 16.x or higher
- **Git**: Latest version

### Database Setup

1. **Install PostgreSQL**
   - macOS: `brew install postgresql@16`
   - Windows: Download from https://www.postgresql.org/download
   - Linux: `sudo apt-get install postgresql-16`

2. **Start PostgreSQL**
   ```bash
   # macOS
   brew services start postgresql@16

   # Linux
   sudo service postgresql start

   # Windows - Usually starts automatically
   ```

3. **Create Database**
   ```bash
   createdb erp_db
   ```

### Backend Development

1. **Setup**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

   Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/erp_db"
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
   NODE_ENV=development
   ```

3. **Initialize Database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate -- --name init

   # Optionally seed data
   npm run seed
   ```

4. **Start Developer Server**
   ```bash
   npm run start:dev
   ```

   Server starts at `http://localhost:3000`

### Frontend Development

1. **Setup**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

   Update `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

3. **Start Developer Server**
   ```bash
   npm run dev
   ```

   Frontend available at `http://localhost:5173`

### Available Scripts

#### Backend

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start             # Start production build
npm run build             # Build TypeScript

# Database
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Create and run migrations
npm run prisma:push       # Push schema changes
npm run prisma:studio     # Open Prisma Studio GUI
npm run prisma:reset      # Reset database (WARNING)
npm run seed              # Seed initial data

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format with Prettier
npm run type-check        # Check TypeScript types

# Testing
npm test                  # Run Jest tests
npm run test:watch       # Test with watch mode
npm run test:cov         # Generate coverage report
```

#### Frontend

```bash
# Development
npm run dev               # Start dev server
npm run build             # Build for production
npm run preview           # Preview production build

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format with Prettier
npm run type-check        # Check TypeScript types

# Testing
npm test                  # Run Vitest
npm run test:ui          # Interactive test UI
npm run test:cov         # Generate coverage report
```

## Development Workflow

### Creating a New Feature

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Backend Development**
   - Create module in `src/modules/feature-name`
   - Add DTOs in `feature-name.dto.ts`
   - Implement service in `feature-name.service.ts`
   - Add controller in `feature-name.controller.ts`
   - Create module in `feature-name.module.ts`
   - Import in `app.module.ts`
   - Update Prisma schema if needed
   - Run migrations: `npm run prisma:migrate -- --name add_feature`

3. **Frontend Development**
   - Create pages in `src/pages/`
   - Create components in `src/components/`
   - Add API service in `src/api/`
   - Create types in `src/types/`
   - Update routing in `App.tsx`

4. **Test Changes**
   - Backend: `npm test`
   - Frontend: `npm run test`
   - Manual testing in browser

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

### Debugging

#### Backend Debugging

1. **Using Chrome DevTools**
   ```bash
   node --inspect-brk dist/main.js
   # Open chrome://inspect in Chrome
   ```

2. **Using VS Code**
   - Add `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Launch Program",
         "program": "${workspaceFolder}/backend/src/main.ts",
         "preLaunchTask": "tsc: build",
         "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
       }
     ]
   }
   ```

3. **Using Prisma Studio**
   ```bash
   cd backend
   npm run prisma:studio
   ```

#### Frontend Debugging

1. **Browser DevTools**
   - Open DevTools (F12)
   - Use Redux DevTools extension (if installed)

2. **React DevTools**
   - Install React DevTools browser extension
   - Inspect component hierarchy and props

3. **Network Debugging**
   - Use Network tab in DevTools
   - Check API requests and responses

## Code Structure

### Backend Module Template

```
modules/feature/
├── dto/
│   └── feature.dto.ts           # Request/Response DTOs
├── feature.service.ts           # Business logic
├── feature.controller.ts        # Route handlers
├── feature.module.ts            # Module definition
└── feature.entity.ts            # Database entity
```

### Frontend Component Template

```
components/Feature/
├── Feature.tsx                  # Component
├── Feature.module.css           # Styles
├── useFeature.ts                # Custom hook
├── Feature.types.ts             # TypeScript types
└── index.ts                     # Exports
```

## Git Workflow

### Commits
- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `test:`, `chore:`
- Example: `feat(auth): add two-factor authentication`

### Branches
- `main` - Production code
- `develop` - Development code
- `feature/name` - Feature development
- `bugfix/name` - Bug fixes
- `hotfix/name` - Urgent fixes

## Database Migrations

### Create Migration
```bash
cd backend

# Make changes to schema.prisma

# Create migration
npm run prisma:migrate -- --name migration_name
```

### Revert Migration
```bash
# Reset to desired state
npm run prisma:migrate -- resolve
```

### Push Schema
```bash
# For development
npm run prisma:push
```

## Testing

### Backend Unit Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Specific test file
npm test -- auth.service

# Coverage
npm run test:cov
```

### Frontend Unit Tests
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage
npm run test:cov
```

### Integration Tests
```bash
# Backend integration tests
npm run test:e2e

# Frontend integration (Playwright)
npm run test:e2e
```

## Performance Profiling

### Backend
1. **Enable profiling**
   ```bash
   node --prof dist/main.js
   ```

2. **Analyze
   ```bash
   node --prof-process isolate-*.log > analysis.txt
   ```

### Frontend
1. **React Profiler**
   - Use React DevTools Profiler tab
   - Record and analyze performance

2. **Lighthouse**
   - Run in Chrome DevTools
   - Analyze performance, accessibility, SEO

## Useful Tools

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Thunder Client (API testing)
- Prisma
- REST Client
- PostgreSQL Explorer

### CLI Tools
```bash
# pgAdmin CLI
psql -U postgres -d erp_db

# Check database size
SELECT pg_database.datname, 
       pg_size_pretty(pg_database_size(pg_database.datname)) 
FROM pg_database;
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check with connection string
psql postgresql://postgres:password@localhost:5432/erp_db
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Node Modules Issues
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Reset database
npm run prisma:reset
```

## Performance Tips

1. **Use Indexes**
   - Add indexes to frequently queried columns
   - Check slow query logs

2. **Implement Caching**
   - Cache API responses in frontend
   - Use Redis for backend caching

3. **Lazy Loading**
   - Implement pagination
   - Load data on demand

4. **Code Splitting**
   - Split React components
   - Use dynamic imports

5. **Database Optimization**
   - Use select() to fetch only needed fields
   - Implement connection pooling

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Follow code style (ESLint, Prettier)
4. Add tests
5. Write clear commit messages
6. Submit pull request

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use `.env.example` for documentation

2. **Secrets Management**
   - Use strong JWT secrets
   - Rotate passwords regularly
   - Use secrets manager in production

3. **Input Validation**
   - Always validate inputs
   - Use DTOs with class-validator

4. **Error Handling**
   - Don't expose stack traces
   - Log errors securely

5. **Dependencies**
   - Keep dependencies updated
   - Run security audits: `npm audit`

---

**Happy coding! 🚀**

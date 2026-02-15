# Troubleshooting Guide

## Common Issues and Solutions

### Docker-Related Issues

#### Services Won't Start

**Problem:** `docker-compose up` fails with errors

**Solutions:**

1. **Check Docker is running**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Verify images exist**
   ```bash
   docker images
   ```

3. **Rebuild images**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

4. **Clear Docker cache**
   ```bash
   docker system prune -a
   docker volume prune
   ```

#### Port Already in Use

**Problem:** `port is already allocated`

**Solution 1: Find and kill the process**
```bash
# Linux/macOS
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution 2: Use different ports**
```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "3001:3000"  # Changed from 3000:3000
```

#### Container Exits Immediately

**Problem:** Container starts then immediately stops

**Solutions:**

1. **Check logs**
   ```bash
   docker-compose logs backend
   docker logs <container-id>
   ```

2. **Verify environment variables**
   ```bash
   docker exec <container-id> env | grep DATABASE_URL
   ```

3. **Check entrypoint**
   ```bash
   docker inspect <container-id> --format='{{.Config.Entrypoint}}'
   ```

### Database Issues

#### Cannot Connect to PostgreSQL

**Problem:** `ECONNREFUSED 127.0.0.1:5432`

**Solutions:**

1. **Verify PostgreSQL is running**
   ```bash
   docker-compose ps postgres
   ```

2. **Check connection string**
   ```env
   # Should be for Docker
   DATABASE_URL="postgresql://postgres:password@postgres:5432/erp_db"
   
   # Not localhost (localhost won't work in Docker)
   # DATABASE_URL="postgresql://postgres:password@localhost:5432/erp_db"
   ```

3. **Test connection manually**
   ```bash
   docker exec erp-postgres psql -U postgres -d erp_db -c "SELECT 1"
   ```

#### Migrations Failed

**Problem:** `npx prisma migrate dev` fails

**Solutions:**

1. **Check database exists**
   ```bash
   docker exec erp-postgres psql -U postgres -l | grep erp_db
   ```

2. **Create database if missing**
   ```bash
   docker exec erp-postgres createdb -U postgres erp_db
   ```

3. **Reset database**
   ```bash
   npm run prisma:reset
   ```

4. **Check migration files**
   ```bash
   ls prisma/migrations/
   ```

#### Prisma Client Out of Sync

**Problem:** `Prisma Client needs to be updated`

**Solution:**
```bash
npm run prisma:generate
# or
npx prisma generate
```

### Backend Issues

#### Backend Won't Start

**Problem:** Backend container exits or logs show errors

**Solutions:**

1. **Check logs**
   ```bash
   docker-compose logs backend -f
   npm run start:dev  # Local development
   ```

2. **Verify environment variables**
   ```bash
   # Check .env file exists and has required variables
   cat .env | grep JWT_SECRET
   ```

3. **Check TypeScript compilation**
   ```bash
   npm run build
   ```

4. **Verify dependencies**
   ```bash
   npm install
   npm audit fix
   ```

#### 500 Internal Server Error

**Problem:** API returns 500 error

**Solutions:**

1. **Check backend logs**
   ```bash
   docker-compose logs backend -f
   ```

2. **Enable debug logging**
   ```typescript
   // main.ts
   if (process.env.NODE_ENV === 'development') {
     app.useLogger(['debug', 'error', 'warn']);
   }
   ```

3. **Test endpoint manually**
   ```bash
   curl -X GET http://localhost:3000/api/v1/health
   ```

#### Authentication Not Working

**Problem:** JWT token invalid or missing

**Solutions:**

1. **Check JWT_SECRET is set**
   ```bash
   docker exec erp-backend echo $JWT_SECRET
   ```

2. **Verify token format**
   ```bash
   # Token should be in Authorization header
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Check token expiration**
   ```bash
   # Tokens expire:
   # - Access Token: 15 minutes (900 seconds)
   # - Refresh Token: 7 days
   ```

4. **Use refresh token to get new token**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken": "your-refresh-token"}'
   ```

#### RBAC/Permissions Not Working

**Problem:** User gets 403 Forbidden despite being logged in

**Solutions:**

1. **Check user's role**
   ```bash
   docker exec erp-postgres psql -U postgres -d erp_db \
     -c "SELECT email, roleId FROM \"User\" WHERE email = 'user@company.com';"
   ```

2. **Check role permissions**
   ```bash
   docker exec erp-postgres psql -U postgres -d erp_db \
     -c "SELECT name, permissions FROM \"Role\" WHERE id = 'role-id';"
   ```

3. **Verify permission exists**
   ```typescript
   // Check your @RequirePermissions decorator
   @RequirePermissions('users.create')  // Must match database
   ```

4. **Add missing permission to role**
   ```bash
   curl -X POST http://localhost:3000/api/v1/roles/:id/permissions/add \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"permissions": ["users.create"]}'
   ```

### Frontend Issues

#### Frontend Won't Load

**Problem:** Browser shows blank page or error

**Solutions:**

1. **Check frontend container**
   ```bash
   docker-compose ps frontend
   ```

2. **Check frontend logs**
   ```bash
   docker-compose logs frontend -f
   ```

3. **Verify port is correct**
   - Should be http://localhost:5173 (dev)
   - Or http://localhost:80 (production)

4. **Check Nginx config**
   ```bash
   docker exec erp-frontend cat /etc/nginx/nginx.conf
   ```

#### Cannot Connect to Backend

**Problem:** Frontend gets CORS or connection errors

**Solutions:**

1. **Check VITE_API_URL**
   ```typescript
   // frontend/.env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

2. **Verify backend is accessible**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

3. **Check CORS configuration**
   ```typescript
   // main.ts (backend)
   app.enableCors({
     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
     credentials: true,
   });
   ```

4. **Check browser console**
   - Press F12, go to Console tab
   - Look for CORS or network errors
   - Check Network tab for failed requests

#### Login Page Blank

**Problem:** Login page shows but no form elements

**Solutions:**

1. **Check console errors**
   - Open Browser DevTools (F12)
   - Go to Console tab
   - Look for JavaScript errors

2. **Verify React is loaded**
   ```bash
   # Check if React fragment is rendering
   // Should show root element
   document.getElementById('root')
   ```

3. **Check CSS is loaded**
   - In DevTools, check Styles tab
   - Should see Tailwind CSS loaded

4. **Clear cache**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (macOS)
   ```

#### Blank Page After Login

**Problem:** Login succeeds but redirected to blank page

**Solutions:**

1. **Check routing**
   ```typescript
   // App.tsx
   // Verify all routes are defined
   <Routes>
     <Route path="/login" element={<LoginPage />} />
     <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
   </Routes>
   ```

2. **Check localStorage**
   - Open DevTools Storage tab
   - Verify token is stored
   - Check if token is valid

3. **Verify page component exists**
   ```bash
   # Check if file exists
   ls src/pages/DashboardPage.tsx
   ```

4. **Check component imports**
   - Verify all imports are correct
   - No missing dependencies

#### API Requests Fail

**Problem:** Axios requests return errors

**Solutions:**

1. **Check auth store**
   ```typescript
   // Verify token is in store
   const authStore = useAuthStore();
   console.log(authStore.token);
   ```

2. **Verify API URL**
   ```typescript
   // Check client.ts
   const API_URL = import.meta.env.VITE_API_URL;
   console.log(API_URL);  // Should be http://localhost:3000/api/v1
   ```

3. **Check HTTP method**
   ```typescript
   // Make sure GET/POST/PUT/DELETE is correct
   fetchEmployees()  // GET
   createEmployee() // POST
   ```

4. **Check payload**
   ```typescript
   // Verify required fields are included
   const dto = {
     employeeId: '',     // Required
     firstName: '',      // Required
     // ...other fields
   };
   ```

### Performance Issues

#### Slow API Response

**Problem:** API endpoints take long to respond

**Solutions:**

1. **Check database performance**
   ```bash
   # Log slow queries
   docker exec erp-postgres psql -U postgres -d erp_db \
     -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"
   ```

2. **Add database indexes**
   ```typescript
   // prisma/schema.prisma
   model User {
     id String @id @default(cuid())
     email String @unique  // Add index
     roleId String
     
     @@index([roleId])  // Add composite index
   }
   ```

3. **Optimize queries**
   ```typescript
   // Instead of fetching all data
   const users = await prisma.user.findMany();
   
   // Use pagination
   const users = await prisma.user.findMany({
     skip: 0,
     take: 10,  // Limit results
     select: {
       id: true,
       email: true,  // Only select needed fields
     },
   });
   ```

4. **Enable caching**
   ```typescript
   // Cache expensive operations
   @UseInterceptors(CacheInterceptor)
   @Get()
   getUsers() {
     return this.service.findAll();
   }
   ```

#### Frontend Slow to Load

**Problem:** React app takes long to render

**Solutions:**

1. **Check bundle size**
   ```bash
   npm run build
   # Check dist/ folder size
   ```

2. **Enable code splitting**
   ```typescript
   // Use React.lazy for route components
   const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
   
   <Suspense fallback={<Loading />}>
     <DashboardPage />
   </Suspense>
   ```

3. **Optimize images**
   - Use compressed images
   - Use WebP format
   - Use appropriate sizes

4. **Remove unused dependencies**
   ```bash
   npm audit
   npm update
   ```

### Security Issues

#### JWT Token Compromised

**Problem:** Need to invalidate all tokens

**Solutions:**

1. **Rotate JWT secret**
   ```env
   # Change in .env
   JWT_SECRET=new_secret_value_here
   ```

2. **Revoke refresh tokens**
   ```bash
   docker exec erp-postgres psql -U postgres -d erp_db \
     -c "DELETE FROM \"RefreshToken\";"
   ```

3. **Restart all services**
   ```bash
   docker-compose restart
   ```

#### SQL Injection Suspected

**Solutions:**

1. **All queries use Prisma** (protected by default)

2. **Never concatenate strings in queries**
   ```typescript
   // Bad
   const users = await prisma.$queryRaw(`SELECT * FROM User WHERE id = '${id}'`);
   
   // Good
   const users = await prisma.user.findUnique({ where: { id } });
   ```

3. **Review recent changes**
   ```bash
   git log --oneline
   git diff HEAD~1
   ```

4. **Check for raw queries**
   ```bash
   grep -r "\$queryRaw" src/
   grep -r "\$executeRaw" src/
   ```

### Development Workflows

#### Hot Reload Not Working

**Problem:** Changes not reflected without restart

**Solutions:**

Backend:
```bash
# Make sure using dev mode
npm run start:dev
```

Frontend:
```bash
# Make sure Vite is running
npm run dev
```

#### Git Conflicts

**Problem:** Merge conflicts in .env or migrations

**Solutions:**

1. **Never commit .env**
   ```bash
   # Check .gitignore
   cat .gitignore | grep .env
   ```

2. **Review migration conflicts**
   ```bash
   git log --oneline prisma/migrations/
   ```

3. **Resolve conflicts**
   ```bash
   # Keep latest migration
   # Delete conflicting old migration
   rm prisma/migrations/conflicting_migration
   ```

#### Node Modules Issues

**Problem:** Weird dependency conflicts

**Solutions:**

```bash
# Clear everything
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Update all
npm update

# Audit
npm audit fix
```

### Getting Help

#### Enable Debug Mode

**Backend:**
```bash
DEBUG=* npm run start:dev
```

**Frontend:**
```bash
# React DevTools
# Vue DevTools
# Open browser console (F12)
```

#### Check Logs

**Docker:**
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**Local Development:**
```bash
# Backend
npm run start:dev  # console.log outputs here

# Frontend
# Open browser console (F12)
```

#### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Service not running | Start service: `docker-compose up -d` |
| `ENOTFOUND` | DNS resolution failed | Check service name in connection string |
| `Port is already allocated` | Port in use | Use `lsof -i :port` and kill process |
| `Authentication failed` | Wrong credentials | Check `.env` for correct values |
| `CORS error` | Cross-origin request blocked | Enable CORS in backend `main.ts` |
| `ValidationError` | Invalid input | Check DTO requirements |
| `Unauthorized (401)` | Missing or invalid token | Refresh token or re-login |
| `Forbidden (403)` | Insufficient permissions | Check user role and permissions |
| `Not Found (404)` | Resource doesn't exist | Verify resource ID is correct |

---

**If issues persist, please check logs and verify configurations before proceeding.**

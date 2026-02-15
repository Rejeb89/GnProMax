# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

1. **Clone and Navigate**
```bash
git clone <repository>
cd erp-starter
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=erp_db
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRATION=900
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_REFRESH_EXPIRATION=604800

# Backend
BACKEND_PORT=3000
NODE_ENV=production

# Frontend
VITE_API_URL=http://localhost:3000/api/v1

# pgAdmin (optional)
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
```

3. **Build and Start**
```bash
docker-compose up --build -d
```

4. **Verify Services**
```bash
docker-compose ps
```

All services should show "Up".

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:3000/api/v1 | - |
| pgAdmin | http://localhost:5050 | admin@example.com / admin |

### Database Migrations

First time setup:

```bash
# Run migrations
docker exec erp-backend npm run prisma:migrate -- --name init

# Or push schema directly
docker exec erp-backend npm run prisma:push

# Optionally seed data
docker exec erp-backend npm run seed
```

### Logs and Monitoring

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Backup and Restore

**Backup Database**
```bash
docker exec erp-postgres pg_dump -U postgres erp_db > backup.sql
```

**Restore Database**
```bash
docker exec -i erp-postgres psql -U postgres erp_db < backup.sql
```

### Scaling

For production, consider using additional containers:

```bash
docker-compose up -d --scale backend=2
```

### Production Considerations

1. **Environment Variables**
   - Use strong JWT secrets (minimum 32 characters)
   - Use strong database passwords
   - Set `NODE_ENV=production`

2. **Database**
   - Regular backups
   - Monitor disk space
   - Connection pooling if needed

3. **Frontend**
   - Update `VITE_API_URL` to production backend URL
   - Enable HTTPS via reverse proxy

4. **Security**
   - Use HTTPS/SSL certificates
   - Implement rate limiting
   - Set secure CORS headers
   - Use environment-specific secrets

5. **Monitoring**
   - Set up logging aggregation
   - Monitor container health
   - Set up alerts for failures

### Stopping Services

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: Deletes data)
docker-compose down -v

# Stop without removing containers
docker-compose stop

# Restart services
docker-compose restart
```

## Server Deployment (AWS/Azure/GCP)

### Using AWS ECS

1. **Build and Push Images**
```bash
# Build images
docker-compose build

# Tag for ECR
docker tag erp-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/erp-backend:latest
docker tag erp-frontend:latest <account>.dkr.ecr.<region>.amazonaws.com/erp-frontend:latest

# Push to ECR
docker push <account>.dkr.ecr.<region>.amazonaws.com/erp-backend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/erp-frontend:latest
```

2. **Create ECS Task Definition**
```json
{
  "family": "erp-backend",
  "containerDefinitions": [
    {
      "name": "erp-backend",
      "image": "<account>.dkr.ecr.<region>.amazonaws.com/erp-backend:latest",
      "portMappings": [{
        "containerPort": 3000,
        "hostPort": 3000
      }],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "DB_HOST", "value": "rds-endpoint"},
        {"name": "JWT_SECRET", "value": "your-secret"}
      ]
    }
  ]
}
```

### Using Kubernetes

1. **Create Secrets**
```bash
kubectl create secret generic erp-secrets \
  --from-literal=jwt-secret=your-secret \
  --from-literal=db-password=your-password
```

2. **Deploy Manifests**
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: erp-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: erp-backend
  template:
    metadata:
      labels:
        app: erp-backend
    spec:
      containers:
      - name: erp-backend
        image: erp-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: erp-secrets
              key: jwt-secret
```

### Using Heroku

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Apps**
```bash
heroku create erp-backend
heroku create erp-frontend
```

3. **Add PostgreSQL** 
```bash
heroku addons:create heroku-postgresql:standard-0 --app erp-backend
```

4. **Deploy Backend**
```bash
cd backend
heroku git:remote -a erp-backend
git push heroku main
```

5. **Run Migrations**
```bash
heroku run npm run prisma:push --app erp-backend
```

## Health Checks

Services include health checks:

```bash
# Check backend health
curl http://localhost:3000/api/v1/health

# Check database
docker exec erp-postgres pg_isready -U postgres
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Recreate services
docker-compose down
docker-compose up --build
```

### Database connection errors
```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres
```

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:3000/api/v1/health`
- Check VITE_API_URL in .env
- Check browser console for CORS errors

### Out of disk space
```bash
# Clean up Docker
docker system prune -a --volumes
```

## Performance Optimization

1. **Database**
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Monitor slow queries

2. **Backend**
   - Enable caching for reports
   - Use pagination for large datasets
   - Implement rate limiting

3. **Frontend**
   - Enable compression (Nginx already configured)
   - Lazy load routes
   - Cache API responses

4. **Infrastructure**
   - Use CDN for static assets
   - Load balance multiple backend instances
   - Monitor resource usage

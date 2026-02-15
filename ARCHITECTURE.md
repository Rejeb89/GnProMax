# Architecture Guide

## System Architecture Overview

This ERP system is built using a distributed, modular architecture with clear separation of concerns across frontend and backend layers.

## Architecture Principles

1. **Modular Design**: Each feature is a self-contained module
2. **Clean Architecture**: Clear separation between controllers, services, and data access
3. **Multi-Tenancy**: Data isolation by company and branch
4. **RBAC**: Permission-based access control
5. **Scalability**: Horizontal scaling support through containerization

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│                   (React + Vite + Tailwind)                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                    HTTP/HTTPS with JWT
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────┐                  ┌──────────────────┐
│  Nginx (Frontend)│                  │  NestJS Backend  │
│  Port: 5173/80   │                  │  Port: 3000      │
└──────────────────┘                  └────────┬─────────┘
                                              │
                                    ┌─────────┴────────┐
                                    │                  │
                                    ▼                  ▼
                            ┌──────────────┐  ┌──────────────┐
                            │  PostgreSQL  │  │    Redis     │
                            │   Database   │  │   (Optional) │
                            └──────────────┘  └──────────────┘
```

## Backend Architecture

### Layer Architecture

```
┌────────────────────────────────────────────────────────┐
│                    API Endpoints                        │
│              (Controller Layer)                         │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│  Guards          │      │  Filters         │
│  - JwtAuthGuard  │      │  - Exception     │
│  - RolesGuard    │      └──────────────────┘
│  - BranchGuard   │
└────────────────┬─┘
                 │
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│  Decorators      │  │  Interceptors    │
│  - CurrentUser   │  │  - Logging       │
│  - Permissions   │  └──────────────────┘
│  - AllowBranches │
└──────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│  Services        │      │  DTOs            │
│  - Business      │      │  - Validation    │
│  - Data Access   │      │  - Transformation│
└────────────────┬─┘      └──────────────────┘
                 │
        ┌────────┴─────────────┐
        │                      │
        ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│  Prisma ORM      │  │  Common Services │
│  - Database      │  │  - QR Code       │
│  - Migrations    │  │  - PDF           │
│  - Transactions  │  │  - Excel         │
└────────────────┬─┘  │  - Encryption    │
                 │    └──────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  PostgreSQL DB   │
        └──────────────────┘
```

### Module Structure

Each feature module follows this structure:

```
modules/feature-name/
├── dto/
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── feature-response.dto.ts
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── feature.entity.ts (optional, if using entities)
```

### Data Flow

```
Request
  │
  ├─> Middleware (Authentication, Parsing, etc.)
  │
  ├─> Route Matching
  │
  ├─> Guards Execution
  │   ├─ JwtAuthGuard: Verify JWT token
  │   ├─ RolesGuard: Verify permissions
  │   └─ BranchGuard: Verify branch access
  │
  ├─> Controller Method
  │   ├─ DTO Validation & Transformation
  │   └─ Call Service
  │
  ├─> Service Layer
  │   ├─ Business Logic
  │   ├─ Prisma Query
  │   └─ Audit Logging
  │
  ├─> Database Operation
  │
  ├─> Response Transformation
  │   └─ Interceptor Processing
  │
  └─> Response (with metadata)
```

## Frontend Architecture

### Component Hierarchy

```
App.tsx
├── ProtectedRoute
│   └── Layout
│       ├── Sidebar (Navigation)
│       └── Main Content
│           ├── DashboardPage
│           ├── EmployeesPage
│           ├── VehiclesPage
│           ├── EquipmentPage
│           └── FinancePage
├── LoginPage
└── RegisterPage
```

### State Management Flow

```
┌─────────────────────────────┐
│    User Interaction         │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│    Component Handler        │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│    API Service Call         │
│    (Axios + token)          │
└──────────────┬──────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    Success      Error
        │             │
        ├─────┬───────┤
        │     │       │
        ▼     ▼       ▼
    Store  Update  Handle
    State  State   Error
        │     │       │
        └─────┴───────┘
            │
        ┌───▼────┐
        │ Render │
        └────────┘
```

### API Integration Pattern

```typescript
// pages/EmployeesPage.tsx
const EmployeesPage = () => {
  // 1. Get auth from Zustand store
  const { user, token } = useAuthStore();
  
  // 2. Make API call
  const { data, error } = useAPI(() =>
    employeeService.getAll(token)
  );
  
  // 3. Update local state
  const [employees, setEmployees] = useState(data);
  
  // 4. Render UI
  return <EmployeeList employees={employees} />;
};
```

## Database Architecture

### Entity Relationship Model

```
┌─────────────┐
│   Company   │◄──────────────────┐
└──────┬──────┘                   │
       │                          │
       ├──────────┬──────────┐    │
       │          │          │    │
       ▼          ▼          ▼    │
    Branch    Role       User ────┘
       │          ▲        ▲
       │          │        │
       ├──────────┘        │
       │                   │
    Employee           UserBranch
       │                   │
       └─────► Vehicle ◄───┘
              Equipment
              Budget
              Expense
              Revenue
              
    AuditLog (logs all actions)
    RefreshToken (auth)
    EquipmentTransaction (tracking)
```

### Multi-Tenancy Data Isolation

```
Data Isolation Strategy:
1. Company Level: Every record includes companyId
2. Branch Level: Scoped queries by user's assigned branches
3. User Level: Audit logs track who did what

Query Example:
SELECT * FROM employees
WHERE companyId = :userCompanyId
  AND branchId IN (:userBranchIds)
```

## Security Architecture

### Authentication Flow

```
1. User Registration
   └─> Create User + Password Hash + Admin Role
       └─> Return Access Token + Refresh Token

2. User Login
   └─> Verify Email + Password Match
       └─> Return Access Token (15min) + Refresh Token (7d)

3. API Request
   └─> Include Authorization: Bearer <token>
       └─> JwtAuthGuard validates token
           └─> Extract user info from JWT payload

4. Token Refresh
   └─> Use Refresh Token
       └─> Generate new Access Token
           └─> Return new Access Token
```

### Authorization Flow

```
1. Permission Check
   ├─> User request includes required permission
   ├─> RolesGuard retrieves user's role
   ├─> Check if role has permission
   ├─> If permission exists: Allow
   └─> Otherwise: Return 403 Forbidden

2. Branch Access Control
   ├─> Get requested resource's branchId
   ├─> Check user's branchIds
   ├─> If user has access: Allow
   └─> Otherwise: Return 403 Forbidden

3. Company Isolation
   └─> All queries scoped to user's companyId
       └─> Prevents data leakage across companies
```

## Scaling Considerations

### Horizontal Scaling

```
Load Balancer (Nginx/HAProxy)
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
Backend1 Backend2 Backend3
    │    │    │
    └────┼────┘
         │
    PostgreSQL (Primary)
         │
    PostgreSQL (Replica) - for read scaling
```

### Database Scaling

```
Write Operations:
└─> Single PostgreSQL primary

Read Operations:
├─> Primary (strong consistency)
└─> Replica (eventual consistency)

Connection Pooling:
└─> PgBouncer or similar
    └─> Manage connection limits
```

### Caching Strategy

```
Frontend:
├─> Browser Cache (static assets)
├─> LocalStorage (auth tokens)
└─> Memory Cache (API responses)

Backend:
├─> Query Result Cache (Redis)
│   └─> Expires on data update
├─> Session Cache (Redis)
│   └─> Stores user sessions
└─> Rate Limiting Cache (Redis)
    └─> API rate limit tracking
```

## Deployment Architecture

### Docker Deployment

```
Docker Compose Services:
│
├─> PostgreSQL Container
│   ├─ Persistent Volume (data)
│   ├─ Health Check (pg_isready)
│   └─ Port: 5432
│
├─> Backend Container (NestJS)
│   ├─ Multi-stage Build (optimization)
│   ├─ Health Check (/:health endpoint)
│   ├─ Environment Variables
│   └─ Port: 3000
│
├─> Frontend Container (Nginx)
│   ├─ Multi-stage Build (optimization)
│   ├─ SPA Routing Config
│   ├─ Gzip Compression
│   └─ Port: 80/5173
│
└─> pgAdmin Container (optional)
    ├─ Database Management
    ├─ Environment Variables
    └─ Port: 5050
```

### CI/CD Pipeline

```
Source Code Commit
    │
    ▼
Code Quality Check
├─ Linting (ESLint)
├─ Type Check (TypeScript)
└─ Tests (Jest)
    │
    ▼
Build Artifacts
├─ Backend Build
├─ Frontend Build
└─ Docker Images
    │
    ▼
Push to Registry
└─ Docker Hub / ECR / etc
    │
    ▼
Deploy to Staging
├─ Run Migrations
├─ Run Seeds
└─ Smoke Tests
    │
    ▼
Deploy to Production
├─ Blue-Green Deployment
├─ Health Checks
└─ Rollback on Failure
```

## Performance Optimization

### Backend Optimization

1. **Database Queries**
   - Use select() to fetch only needed fields
   - Implement pagination for large datasets
   - Add indexes on frequently queried columns
   - Use connection pooling

2. **Caching**
   - Cache role permissions
   - Cache report data
   - Cache frequently accessed entities

3. **API Optimization**
   - Implement request/response compression
   - Use pagination
   - Rate limiting to prevent abuse

### Frontend Optimization

1. **Code Splitting**
   - Lazy load route components
   - Dynamic imports for large libraries
   - Tree-shaking to remove dead code

2. **Asset Optimization**
   - Minify CSS/JS
   - Compress images
   - Use CDN for static assets

3. **Runtime Optimization**
   - Memoize expensive computations
   - Debounce search inputs
   - Paginate data lists

## Error Handling Architecture

```
Error Occurrence
    │
    ▼
Error Type Detection
├─> Validation Error
├─> Authentication Error
├─> Authorization Error
├─> Business Logic Error
├─> Database Error
└─> Unknown Error
    │
    ▼
Error Handler (Guard/Filter)
    │
    ├─> Log Error
    ├─> Sanitize Response
    └─> Return Appropriate HTTP Status
        │
        ├─> 400: Bad Request
        ├─> 401: Unauthorized
        ├─> 403: Forbidden
        ├─> 404: Not Found
        ├─> 500: Internal Server Error
        └─> User Readable Message
```

## Monitoring & Logging Architecture

```
Application
    │
    ├─> Structured Logging
    │   └─> Request/Response logs with correlation IDs
    │
    ├─> Error Tracking
    │   ├─> Error rate monitoring
    │   ├─ Exception details
    │   └─> Stack traces
    │
    ├─> Performance Monitoring
    │   ├─ Response times
    │   ├─ Query performance
    │   └─> Resource utilization
    │
    ├─> Audit Trail
    │   ├─ User actions
    │   ├─ Data changes
    │   └─> System events
    │
    └─> Alerts
        ├─ Error rate threshold
        ├─ Response time threshold
        └─> Database health
```

---

**This architecture provides a solid foundation for building scalable, maintainable, and secure enterprise applications.**

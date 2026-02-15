# Testing Guide

## Testing Strategy

This ERP system uses a multi-level testing approach:

1. **Unit Tests**: Test individual functions and services
2. **Integration Tests**: Test modules working together
3. **E2E Tests**: Test complete user workflows
4. **Load Tests**: Test performance under load

## Backend Testing

### Setup

```bash
cd backend
npm install
```

### Unit Tests

#### Test Structure

```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const input = {
        email: 'test@company.com',
        password: 'Password123',
        roleId: 'role-id',
        companyId: 'company-id',
      };

      const result = await service.create(input);

      expect(result.email).toBe(input.email);
      expect(result.id).toBeDefined();
    });

    it('should throw if email already exists', async () => {
      // Test setup
      // Test execution
      // Test assertion
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.service

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

### Test Examples

#### Auth Service Tests

```typescript
describe('AuthService', () => {
  describe('register', () => {
    it('should create user and company', async () => {
      const dto = {
        email: 'newuser@company.com',
        password: 'SecurePass123',
        companyName: 'New Company',
      };

      const result = await service.register(dto);

      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const dto = {
        email: 'user@company.com',
        password: 'CorrectPassword123',
      };

      const result = await service.login(dto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw on wrong password', async () => {
      const dto = {
        email: 'user@company.com',
        password: 'WrongPassword',
      };

      await expect(service.login(dto)).rejects.toThrow();
    });
  });
});
```

#### RBAC Tests

```typescript
describe('RolesGuard', () => {
  it('should allow user with required permission', async () => {
    const user = {
      id: 'user-id',
      roleId: 'admin-role-id',
      // admin has all permissions
    };

    const context = createMockContext(user);
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny user without required permission', async () => {
    const user = {
      id: 'user-id',
      roleId: 'employee-role-id',
      // employee lacks admin-only permissions
    };

    const context = createMockContext(user);
    const result = await guard.canActivate(context);

    expect(result).toBeFalsy();
  });
});
```

## Frontend Testing

### Setup

```bash
cd frontend
npm install
npm install --save-dev vitest @vitest/ui
```

### Unit Tests

#### Test Structure

```typescript
// store/authStore.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  it('should set user and token', () => {
    const store = useAuthStore();
    const user = { id: '1', email: 'test@example.com' };

    store.setUser(user);
    store.setToken('access-token');

    expect(store.user).toEqual(user);
    expect(store.token).toBe('access-token');
    expect(store.isAuthenticated).toBe(true);
  });

  it('should clear auth on logout', () => {
    const store = useAuthStore();
    store.setUser({ id: '1', email: 'test@example.com' });
    store.setToken('token');

    store.logout();

    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});
```

### Component Tests

```typescript
// pages/LoginPage.spec.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);

    expect(screen.getByText('Login')).toBeDefined();
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
  });

  it('should submit form with credentials', async () => {
    const mockLogin = vi.fn();
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Login'));

    // Wait for form submission
    expect(mockLogin).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage report
npm run test:cov
```

## Integration Tests

### Backend Integration Tests

```typescript
// tests/auth.integration.spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('POST /auth/register', () => {
    it('should register and login user', async () => {
      const signupDto = {
        email: 'test@company.com',
        password: 'TestPassword123',
        companyName: 'Test Company',
      };

      // Register
      const signupRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(signupDto)
        .expect(201);

      expect(signupRes.body.data.accessToken).toBeDefined();
      expect(signupRes.body.data.user.email).toBe(signupDto.email);

      // Login
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: signupDto.email,
          password: signupDto.password,
        })
        .expect(200);

      expect(loginRes.body.data.accessToken).toBeDefined();
    });
  });

  describe('GET /users', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401);
    });

    it('should return users with valid token', async () => {
      // Get token
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@testcompany.com',
          password: 'Admin@123456',
        });

      const token = loginRes.body.data.accessToken;

      // Get users
      const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/employee-workflow.e2e.spec.ts
describe('Employee Management Workflow (E2E)', () => {
  let authToken: string;
  let employeeId: string;

  it('should complete full employee workflow', async () => {
    // 1. Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@testcompany.com',
        password: 'Admin@123456',
      })
      .expect(200);

    authToken = loginRes.body.data.accessToken;

    // 2. Create employee
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@company.com',
        phone: '+1234567890',
        department: 'Operations',
        designation: 'Manager',
        dateOfJoining: '2024-01-01',
        branchId: 'branch-id',
      })
      .expect(201);

    employeeId = createRes.body.data.id;

    // 3. Get employee
    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/employees/${employeeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getRes.body.data.firstName).toBe('John');

    // 4. Update employee
    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/employees/${employeeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        designation: 'Senior Manager',
      })
      .expect(200);

    expect(updateRes.body.data.designation).toBe('Senior Manager');

    // 5. Delete employee
    await request(app.getHttpServer())
      .delete(`/api/v1/employees/${employeeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
```

## Load Testing

### Using Artillery

```bash
# Install
npm install -g artillery

# Create test file: load-test.yml
```

**load-test.yml:**
```yaml
config:
  target: http://localhost:3000
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up"
    - duration: 60
      arrivalRate: 100
      name: "Spike"

scenarios:
  - name: "Employee CRUD Operations"
    flow:
      - post:
          url: /api/v1/auth/login
          json:
            email: "admin@testcompany.com"
            password: "Admin@123456"
            
      - get:
          url: /api/v1/employees
          headers:
            Authorization: "Bearer {{ $randomString(200) }}"
            
      - think: 30
      
      - get:
          url: /api/v1/employees/{{ randomId }}
          headers:
            Authorization: "Bearer {{ token }}"
```

```bash
# Run load test
artillery run load-test.yml

# Generate report
artillery run load-test.yml --output report.json
artillery report report.json --output report.html
```

## Test Coverage

### Backend Coverage

```bash
npm run test:cov

# Output example:
# =============================== Coverage summary ===============================
# Statements   : 85.5% ( 920/1076 )
# Branches     : 78.3% ( 756/965 )
# Functions    : 81.2% ( 234/288 )
# Lines        : 86.1% ( 892/1036 )
```

### Frontend Coverage

```bash
npm run test:cov

# Coverage goals:
# - Statements: > 80%
# - Branches: > 75%
# - Functions: > 80%
# - Lines: > 80%
```

## Best Practices

### Unit Testing

1. **Follow AAA Pattern**
   - Arrange: Set up test data
   - Act: Execute the code
   - Assert: Verify results

2. **Use Descriptive Names**
   ```typescript
   // Good
   it('should throw error when email already exists', () => {})
   
   // Bad
   it('throws error', () => {})
   ```

3. **Mock External Dependencies**
   ```typescript
   const mockPrisma = {
     user: {
       create: jest.fn(),
       findUnique: jest.fn(),
     },
   };
   ```

4. **Test Edge Cases**
   - Empty inputs
   - Null/undefined values
   - Boundary conditions
   - Error scenarios

### Integration Testing

1. **Use Test Databases**
   - Separate database for testing
   - Clean state between tests
   - Run migrations before tests

2. **Test Realistic Scenarios**
   - Complete user workflows
   - Multi-step operations
   - Data persistence

3. **Clean Up After Tests**
   ```typescript
   afterEach(async () => {
     await prisma.user.deleteMany();
     await prisma.company.deleteMany();
   });
   ```

### E2E Testing

1. **Test Happy Paths**
   - Normal user workflows
   - Expected data flows

2. **Test Error Paths**
   - Invalid inputs
   - Unauthorized access
   - Missing resources

3. **Test Cross-Module Interactions**
   - Auth + Users
   - Users + Branches
   - Finance + Audit

## Continuous Testing

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run lint
        run: npm run lint
        
      - name: Run tests
        run: npm test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Debugging Tests

### Backend

```typescript
// Add debug logging
describe('UsersService', () => {
  it('should create user', async () => {
    console.log('Test starting');
    
    const result = await service.create(dto);
    
    console.log('Result:', result);
    expect(result).toBeDefined();
  });
});

// Run with logging
npm test -- --verbose
```

### Frontend

```typescript
// Use Vitest debug
import { debug } from '@testing-library/react';

it('should render user list', () => {
  const { container } = render(<UserList />);
  debug(container); // Prints rendered HTML
});

// Run with UI
npm run test:ui
```

---

**Testing ensures reliability, maintainability, and confidence in your codebase.**

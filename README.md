# ERP Starter Template

A complete, production-ready enterprise ERP (Enterprise Resource Planning) starter template built with modern technologies.

## 🏗️ Architecture

### Technology Stack

#### Backend
- **Framework**: NestJS 10
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Security**: bcrypt password hashing, role-based access control
- **File Generation**: PDF (pdfkit), Excel (xlsx)
- **QR Codes**: qrcode library
- **API Validation**: class-validator & class-transformer

#### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Database Admin**: pgAdmin (included)

## 📋 Features

### Core Modules

1. **Authentication & Authorization**
   - JWT-based authentication with refresh tokens
   - User registration and login
   - Role-based access control (RBAC)
   - Permission management

2. **User Management**
   - User creation and management
   - Role assignment
   - Multi-branch access control
   - User branch assignment

3. **Organization Structure**
   - Multi-company support
   - Multi-branch management
   - Branch hierarchy and management

4. **Human Resources**
   - Employee management
   - Employee profiles with contact information
   - Department and designation tracking
   - Active/inactive status

5. **Fleet Management**
   - Vehicle registration and tracking
   - Driver assignment
   - QR code generation for tracking
   - Vehicle status and maintenance tracking
   - Fuel consumption monitoring

6. **Equipment Management**
   - Equipment inventory tracking
   - Serial number and QR code management
   - Equipment transactions (in/out/maintenance)
   - Condition and status tracking
   - Location management

7. **Financial Management**
   - Budget creation and management
   - Expense tracking and approval
   - Revenue recording
   - Financial summary and reporting
   - Category-based organization

8. **Reporting**
   - PDF report generation
   - Excel export functionality
   - Expense reports
   - Revenue reports
   - Equipment inventory reports
   - Employee reports
   - Vehicle fleet reports

9. **Audit Logging**
   - Comprehensive audit trail
   - User activity tracking
   - Change history
   - Module-based filtering
   - Resource-based tracking

10. **Dashboard**
    - Overview statistics
    - Quick access to key metrics
    - Recent activity monitoring

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 16+ (for local development)

### Setup with Docker

1. **Clone the repository**
```bash
cd erp-starter
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Start services**
```bash
docker-compose up --build
```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/v1
   - pgAdmin: http://localhost:5050 (admin@example.com / admin)

### Local Development Setup

#### Backend Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
```

3. **Setup database**
```bash
npm run prisma:migrate
```

4. **Start development server**
```bash
npm run start:dev
```

#### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start development server**
```bash
npm run dev
```

## 📁 Project Structure

```
erp-starter/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── users/         # User management
│   │   │   ├── roles/         # Role management
│   │   │   ├── branches/      # Branch management
│   │   │   ├── employees/     # Employee management
│   │   │   ├── vehicles/      # Fleet management
│   │   │   ├── equipment/     # Equipment management
│   │   │   ├── finance/       # Financial management
│   │   │   ├── reports/       # Report generation
│   │   │   ├── audit/         # Audit logging
│   │   │   └── prisma/        # Database service
│   │   ├── common/
│   │   │   ├── guards/        # Auth & RBAC guards
│   │   │   ├── decorators/    # Custom decorators
│   │   │   ├── filters/       # Exception filters
│   │   │   ├── interceptors/  # Logging interceptors
│   │   │   └── services/      # Shared services
│   │   ├── main.ts
│   │   └── app.module.ts
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── api/              # API client services
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## 🗄️ Database Schema

### Core Entities
- **Company**: Organization/tenant
- **Branch**: Company branch
- **User**: System users with roles
- **Role**: Access control roles with permissions
- **UserBranch**: User-branch relationship

### HR Entities
- **Employee**: Employee records
- **Vehicle**: Fleet management

### Asset Management
- **Equipment**: Equipment inventory
- **EquipmentTransaction**: Equipment tracking history

### Finance Entities
- **Budget**: Budget allocation
- **Expense**: Expense tracking
- **Revenue**: Revenue recording

### System Entities
- **AuditLog**: Comprehensive audit trail
- **RefreshToken**: JWT refresh tokens

## 🔐 Security Features

1. **Authentication**
   - JWT access tokens (15 minutes expiration)
   - JWT refresh tokens (7 days expiration)
   - Secure token storage

2. **Authorization**
   - Role-based access control (RBAC)
   - Permission-based guards
   - Branch-based access control

3. **Data Protection**
   - Password hashing with bcrypt
   - SQL injection prevention via Prisma
   - Input validation with class-validator
   - CORS configuration

4. **Audit Trail**
   - All user actions logged
   - Change history tracking
   - User activity monitoring

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/users/change-password` - Change password
- `POST /api/v1/users/:id/branches` - Assign branch
- `DELETE /api/v1/users/:id/branches/:branchId` - Remove branch

### Roles
- `GET /api/v1/roles` - List roles
- `POST /api/v1/roles` - Create role
- `GET /api/v1/roles/:id` - Get role
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role
- `POST /api/v1/roles/:id/permissions/add` - Add permissions
- `POST /api/v1/roles/:id/permissions/remove` - Remove permissions

### Branches
- `GET /api/v1/branches` - List branches
- `POST /api/v1/branches` - Create branch
- `GET /api/v1/branches/:id` - Get branch
- `PUT /api/v1/branches/:id` - Update branch
- `DELETE /api/v1/branches/:id` - Delete branch

### Employees
- `GET /api/v1/employees` - List employees
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees/:id` - Get employee
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee
- `GET /api/v1/employees/branch/:branchId` - List by branch

### Vehicles
- `GET /api/v1/vehicles` - List vehicles
- `POST /api/v1/vehicles` - Create vehicle
- `GET /api/v1/vehicles/:id` - Get vehicle
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle
- `POST /api/v1/vehicles/:id/driver` - Assign driver
- `DELETE /api/v1/vehicles/:id/driver` - Remove driver

### Equipment
- `GET /api/v1/equipment` - List equipment
- `POST /api/v1/equipment` - Create equipment
- `GET /api/v1/equipment/:id` - Get equipment
- `PUT /api/v1/equipment/:id` - Update equipment
- `DELETE /api/v1/equipment/:id` - Delete equipment
- `POST /api/v1/equipment/transaction` - Record transaction
- `GET /api/v1/equipment/:id/transactions` - Get transaction history

### Finance
- `GET /api/v1/finance/budgets` - List budgets
- `POST /api/v1/finance/budgets` - Create budget
- `GET /api/v1/finance/expenses` - List expenses
- `POST /api/v1/finance/expenses` - Create expense
- `POST /api/v1/finance/expenses/:id/approve` - Approve expense
- `GET /api/v1/finance/revenues` - List revenues
- `POST /api/v1/finance/revenues` - Create revenue
- `GET /api/v1/finance/summary` - Financial summary

### Reports
- `GET /api/v1/reports/expenses` - Expense report
- `GET /api/v1/reports/expenses/pdf` - Export PDF
- `GET /api/v1/reports/expenses/excel` - Export Excel
- `GET /api/v1/reports/revenues` - Revenue report
- `GET /api/v1/reports/equipment` - Equipment report
- `GET /api/v1/reports/employees` - Employee report
- `GET /api/v1/reports/vehicles` - Vehicle report

### Audit
- `GET /api/v1/audit/logs` - List audit logs
- `GET /api/v1/audit/logs/module/:module` - Logs by module
- `GET /api/v1/audit/logs/user/:userId` - Logs by user
- `GET /api/v1/audit/logs/resource/:resourceId` - Logs by resource

## 🔄 Deployment

### Production Deployment

1. **Environment Setup**
```bash
cp .env.example .env
# Update .env with production values
```

2. **Build and Deploy**
```bash
docker-compose -f docker-compose.yml up -d --build
```

3. **Database Migrations**
```bash
docker exec erp-backend npm run prisma:push
```

4. **Monitoring**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📝 Default Admin Account

After running migrations, an admin role is created with all permissions.

**Create your first user via the registration endpoint.**

## 🛠️ Development Tips

### Backend Development
- Use `npm run start:dev` for hot-reload
- Prisma Studio: `npm run prisma:studio`
- Database reset: `npm run prisma:reset`

### Frontend Development
- Use `npm run dev` for hot-reload
- Build: `npm run build`
- Preview build: `npm run preview`

### Database Debugging
- pgAdmin access: http://localhost:5050
- Connect with PostgreSQL credentials from `.env`

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Docker Documentation](https://docs.docker.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Happy coding! 🚀**

# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All endpoints (except `/auth/login` and `/auth/register`) require JWT authentication.

Include the access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Format

All responses follow this format:

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Responses

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "BadRequest",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Create a new user and company.

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "securePassword123",
  "companyName": "My Company"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@company.com",
      "roleId": "uuid",
      "companyId": "uuid"
    }
  }
}
```

### Login

**POST** `/auth/login`

Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@company.com",
      "branchIds": ["uuid"],
      "roleId": "uuid",
      "companyId": "uuid"
    }
  }
}
```

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Users Endpoints

### List Users

**GET** `/users`

Retrieve all users for the current company.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "email": "user@company.com",
      "roleId": "uuid",
      "companyId": "uuid",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create User

**POST** `/users`

Create a new user. Requires `users.create` permission.

**Request:**
```json
{
  "email": "newuser@company.com",
  "password": "securePassword123",
  "roleId": "uuid",
  "branchIds": ["uuid"]
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "newuser@company.com",
    "roleId": "uuid",
    "companyId": "uuid"
  }
}
```

### Get User

**GET** `/users/:id`

Get a specific user by ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@company.com",
    "roleId": "uuid",
    "branchIds": ["uuid"],
    "role": {
      "id": "uuid",
      "name": "Admin",
      "permissions": ["users.create", "users.read", ...]
    }
  }
}
```

### Update User

**PUT** `/users/:id`

Update user information. Requires `users.update` permission.

**Request:**
```json
{
  "email": "newemail@company.com"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "newemail@company.com"
  }
}
```

### Delete User

**DELETE** `/users/:id`

Delete a user. Requires `users.delete` permission. Cannot delete own account.

**Response:**
```json
{
  "statusCode": 200,
  "message": "User deleted successfully",
  "data": {
    "id": "uuid"
  }
}
```

### Change Password

**POST** `/users/change-password`

Change the current user's password.

**Request:**
```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newPassword123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": {}
}
```

### Assign Branch to User

**POST** `/users/:id/branches`

Assign a branch access to a user. Requires `users.update` permission.

**Request:**
```json
{
  "branchId": "uuid"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Branch assigned successfully",
  "data": {}
}
```

### Remove Branch from User

**DELETE** `/users/:id/branches/:branchId`

Remove branch access from a user. Requires `users.update` permission.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Branch removed successfully",
  "data": {}
}
```

## Roles Endpoints

### List Roles

**GET** `/roles`

Retrieve all roles.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Admin",
      "permissions": ["*"],
      "systemRole": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Role

**POST** `/roles`

Create a new role. Requires `roles.create` permission.

**Request:**
```json
{
  "name": "Manager",
  "permissions": [
    "users.read",
    "employees.create",
    "employees.update",
    "vehicles.read"
  ]
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Role created successfully",
  "data": {
    "id": "uuid",
    "name": "Manager",
    "permissions": [...]
  }
}
```

### Get Role

**GET** `/roles/:id`

Get a specific role by ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Role retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Admin",
    "permissions": ["*"],
    "systemRole": true
  }
}
```

### Update Role

**PUT** `/roles/:id`

Update role information. Requires `roles.update` permission. Cannot modify system roles.

**Request:**
```json
{
  "name": "Updated Manager"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Role updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Manager"
  }
}
```

### Delete Role

**DELETE** `/roles/:id`

Delete a role. Requires `roles.delete` permission. Cannot delete system roles or roles with users assigned.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Role deleted successfully",
  "data": {
    "id": "uuid"
  }
}
```

### Add Permissions to Role

**POST** `/roles/:id/permissions/add`

Add permissions to a role. Requires `roles.update` permission.

**Request:**
```json
{
  "permissions": [
    "equipment.create",
    "equipment.update"
  ]
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Permissions added successfully",
  "data": {}
}
```

### Remove Permissions from Role

**POST** `/roles/:id/permissions/remove`

Remove permissions from a role. Requires `roles.update` permission.

**Request:**
```json
{
  "permissions": [
    "equipment.delete"
  ]
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Permissions removed successfully",
  "data": {}
}
```

## Branches Endpoints

### List Branches

**GET** `/branches`

Retrieve all branches for current company.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Branches retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "code": "BRANCH001",
      "name": "Main Branch",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "active": true,
      "companyId": "uuid",
      "managerId": "uuid",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Branch

**POST** `/branches`

Create a new branch. Requires `branches.create` permission.

**Request:**
```json
{
  "code": "BRANCH002",
  "name": "Secondary Branch",
  "city": "Los Angeles",
  "state": "CA",
  "country": "USA",
  "managerId": "uuid"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Branch created successfully",
  "data": {
    "id": "uuid",
    "code": "BRANCH002",
    "name": "Secondary Branch",
    "active": true
  }
}
```

### Get Branch

**GET** `/branches/:id`

Get a specific branch by ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Branch retrieved successfully",
  "data": {
    "id": "uuid",
    "code": "BRANCH001",
    "name": "Main Branch",
    "employees": 45,
    "vehicles": 12,
    "equipment": 120
  }
}
```

### Update Branch

**PUT** `/branches/:id`

Update branch information. Requires `branches.update` permission.

**Request:**
```json
{
  "name": "Updated Branch Name",
  "active": false
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Branch updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Branch Name"
  }
}
```

### Delete Branch

**DELETE** `/branches/:id`

Delete a branch. Requires `branches.delete` permission. Cannot delete if resources assigned.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Branch deleted successfully",
  "data": {
    "id": "uuid"
  }
}
```

## Employees Endpoints

### List Employees

**GET** `/employees`

Retrieve all employees. Filtered by user's branch access.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)
- `branchId`: uuid (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Employees retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phone": "+1234567890",
      "department": "Operations",
      "designation": "Manager",
      "dateOfJoining": "2023-01-15",
      "branchId": "uuid",
      "active": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Employee

**POST** `/employees`

Create a new employee. Requires `employees.create` permission.

**Request:**
```json
{
  "employeeId": "EMP002",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1234567891",
  "department": "HR",
  "designation": "Officer",
  "dateOfJoining": "2024-01-15",
  "branchId": "uuid"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Employee created successfully",
  "data": {
    "id": "uuid",
    "employeeId": "EMP002",
    "firstName": "Jane",
    "lastName": "Smith",
    "active": true
  }
}
```

### Get Employee

**GET** `/employees/:id`

Get a specific employee by ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Employee retrieved successfully",
  "data": {
    "id": "uuid",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "branch": {
      "id": "uuid",
      "name": "Main Branch"
    },
    "vehicles": [
      {
        "id": "uuid",
        "registrationNumber": "ABC-123"
      }
    ]
  }
}
```

### Update Employee

**PUT** `/employees/:id`

Update employee information. Requires `employees.update` permission.

**Request:**
```json
{
  "email": "john.newemail@company.com",
  "designation": "Senior Manager",
  "active": true
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Employee updated successfully",
  "data": {
    "id": "uuid",
    "email": "john.newemail@company.com"
  }
}
```

### Delete Employee

**DELETE** `/employees/:id`

Delete an employee. Requires `employees.delete` permission. Cannot delete if assigned as vehicle driver.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Employee deleted successfully",
  "data": {
    "id": "uuid"
  }
}
```

### List Employees by Branch

**GET** `/employees/branch/:branchId`

Get all employees in a specific branch.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Employees retrieved successfully",
  "data": [...]
}
```

## Vehicles Endpoints

### List Vehicles

**GET** `/vehicles`

Retrieve all vehicles. Filtered by user's branch access.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)
- `status`: string (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "registrationNumber": "ABC-123",
      "make": "Toyota",
      "model": "Camry",
      "year": 2023,
      "type": "Sedan",
      "status": "active",
      "driverId": "uuid",
      "qrCode": "data:image/png;base64...",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Vehicle

**POST** `/vehicles`

Create a new vehicle. Requires `vehicles.create` permission.

**Request:**
```json
{
  "registrationNumber": "XYZ-789",
  "make": "Honda",
  "model": "Accord",
  "year": 2024,
  "type": "Sedan",
  "color": "Black",
  "vin": "12345678901234567",
  "fuelType": "Petrol",
  "engineCapacity": 2.0,
  "branchId": "uuid"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Vehicle created successfully",
  "data": {
    "id": "uuid",
    "registrationNumber": "XYZ-789",
    "qrCode": "data:image/png;base64...",
    "status": "active"
  }
}
```

### Get Vehicle

**GET** `/vehicles/:id`

Get a specific vehicle by ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Vehicle retrieved successfully",
  "data": {
    "id": "uuid",
    "registrationNumber": "ABC-123",
    "make": "Toyota",
    "model": "Camry",
    "driver": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "branch": {
      "id": "uuid",
      "name": "Main Branch"
    }
  }
}
```

### Update Vehicle

**PUT** `/vehicles/:id`

Update vehicle information. Requires `vehicles.update` permission.

**Request:**
```json
{
  "status": "maintenance",
  "currentMileage": 45000
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Vehicle updated successfully",
  "data": {
    "id": "uuid",
    "status": "maintenance"
  }
}
```

### Delete Vehicle

**DELETE** `/vehicles/:id`

Delete a vehicle. Requires `vehicles.delete` permission.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Vehicle deleted successfully",
  "data": {
    "id": "uuid"
  }
}
```

### Assign Driver

**POST** `/vehicles/:id/driver`

Assign a driver to a vehicle.

**Request:**
```json
{
  "driverId": "uuid"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Driver assigned successfully",
  "data": {}
}
```

### Remove Driver

**DELETE** `/vehicles/:id/driver`

Remove the current driver from a vehicle.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Driver removed successfully",
  "data": {}
}
```

## Equipment Endpoints

### List Equipment

**GET** `/equipment`

Retrieve all equipment. Filtered by user's branch access.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)
- `category`: string (optional)
- `status`: string (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Equipment retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Laptop Computer",
      "category": "IT",
      "serialNumber": "SN123456",
      "status": "available",
      "qrCode": "data:image/png;base64...",
      "purchaseDate": "2023-01-15",
      "warranty": true,
      "warrantyExpiry": "2025-01-15",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Equipment

**POST** `/equipment`

Create a new equipment record. Requires `equipment.create` permission.

**Request:**
```json
{
  "name": "Desktop Computer",
  "category": "IT",
  "serialNumber": "SN789012",
  "description": "Dell Windows Desktop",
  "purchaseDate": "2024-01-15",
  "purchasePrice": 1200.00,
  "warranty": true,
  "warrantyExpiry": "2026-01-15",
  "condition": "good",
  "branchId": "uuid"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Equipment created successfully",
  "data": {
    "id": "uuid",
    "name": "Desktop Computer",
    "qrCode": "data:image/png;base64...",
    "status": "available"
  }
}
```

### Get Equipment

**GET** `/equipment/:id`

Get a specific equipment by ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Equipment retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Laptop Computer",
    "serialNumber": "SN123456",
    "status": "available",
    "branch": {
      "id": "uuid",
      "name": "Main Branch"
    },
    "transactions": [
      {
        "id": "uuid",
        "type": "in",
        "date": "2024-01-15",
        "notes": "Equipment received"
      }
    ]
  }
}
```

### Update Equipment

**PUT** `/equipment/:id`

Update equipment information. Requires `equipment.update` permission.

**Request:**
```json
{
  "status": "in-use",
  "condition": "excellent"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Equipment updated successfully",
  "data": {
    "id": "uuid",
    "status": "in-use"
  }
}
```

### Delete Equipment

**DELETE** `/equipment/:id`

Delete equipment. Requires `equipment.delete` permission.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Equipment deleted successfully",
  "data": {
    "id": "uuid"
  }
}
```

### Record Transaction

**POST** `/equipment/transaction`

Record an equipment transaction. Requires `equipment.update` permission.

**Request:**
```json
{
  "equipmentId": "uuid",
  "type": "out",
  "assignedTo": "uuid",
  "date": "2024-01-15",
  "notes": "Equipment issued to user"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Transaction recorded successfully",
  "data": {
    "id": "uuid",
    "type": "out",
    "date": "2024-01-15"
  }
}
```

### Get Transaction History

**GET** `/equipment/:id/transactions`

Get the transaction history of an equipment.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Transaction history retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "type": "in",
      "date": "2024-01-15",
      "notes": "Equipment received",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

## Finance Endpoints

### List Budgets

**GET** `/finance/budgets`

Retrieve all budgets. Filtered by user's branch access.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)
- `branchId`: uuid (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Budgets retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Q1 Operations",
      "amount": 50000.00,
      "spent": 25000.00,
      "category": "Operations",
      "startDate": "2024-01-01",
      "endDate": "2024-03-31",
      "branchId": "uuid",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Budget

**POST** `/finance/budgets`

Create a new budget. Requires `finance.create` permission.

**Request:**
```json
{
  "name": "Q2 Marketing",
  "amount": 100000.00,
  "category": "Marketing",
  "startDate": "2024-04-01",
  "endDate": "2024-06-30",
  "branchId": "uuid"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Budget created successfully",
  "data": {
    "id": "uuid",
    "name": "Q2 Marketing",
    "amount": 100000.00
  }
}
```

### Get Budget

**GET** `/finance/budgets/:id`

Get a specific budget by ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Budget retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Q1 Operations",
    "amount": 50000.00,
    "spent": 25000.00,
    "remaining": 25000.00,
    "percentage": 50
  }
}
```

### Update Budget

**PUT** `/finance/budgets/:id`

Update budget information. Requires `finance.update` permission.

**Request:**
```json
{
  "amount": 75000.00,
  "endDate": "2024-04-30"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Budget updated successfully",
  "data": {
    "id": "uuid",
    "amount": 75000.00
  }
}
```

### Delete Budget

**DELETE** `/finance/budgets/:id`

Delete a budget. Requires `finance.delete` permission.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Budget deleted successfully",
  "data": {
    "id": "uuid"
  }
}
```

### List Expenses

**GET** `/finance/expenses`

Retrieve all expenses. Filtered by user's branch access.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)
- `status`: string (optional - pending, approved, rejected)
- `branchId`: uuid (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Expenses retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "description": "Office Supplies",
      "amount": 500.00,
      "category": "Supplies",
      "status": "pending",
      "date": "2024-01-15",
      "submittedBy": "uuid",
      "branchId": "uuid",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Expense

**POST** `/finance/expenses`

Create a new expense. Requires `finance.create` permission.

**Request:**
```json
{
  "description": "Equipment Purchase",
  "amount": 2500.00,
  "category": "Equipment",
  "date": "2024-01-15",
  "branchId": "uuid",
  "notes": "New office equipment"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Expense created successfully",
  "data": {
    "id": "uuid",
    "description": "Equipment Purchase",
    "amount": 2500.00,
    "status": "pending"
  }
}
```

### Approve Expense

**POST** `/finance/expenses/:id/approve`

Approve a pending expense. Requires `finance.approve` permission.

**Request:**
```json
{
  "approved": true,
  "notes": "Approved by manager"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Expense approved successfully",
  "data": {
    "id": "uuid",
    "status": "approved"
  }
}
```

### List Revenues

**GET** `/finance/revenues`

Retrieve all revenues. Filtered by user's branch access.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)
- `branchId`: uuid (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Revenues retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "description": "Service Revenue",
      "amount": 5000.00,
      "category": "Services",
      "date": "2024-01-15",
      "branchId": "uuid",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Revenue

**POST** `/finance/revenues`

Create a new revenue record. Requires `finance.create` permission.

**Request:**
```json
{
  "description": "Consulting Fee",
  "amount": 10000.00,
  "category": "Services",
  "date": "2024-01-15",
  "branchId": "uuid"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Revenue created successfully",
  "data": {
    "id": "uuid",
    "description": "Consulting Fee",
    "amount": 10000.00
  }
}
```

### Financial Summary

**GET** `/finance/summary`

Get financial summary. Optional month and year filtering.

**Query Parameters:**
- `month`: number (1-12, optional)
- `year`: number (optional)
- `branchId`: uuid (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Financial summary retrieved successfully",
  "data": {
    "totalBudget": 150000.00,
    "totalExpenses": 35000.00,
    "totalRevenues": 50000.00,
    "netProfit": 15000.00,
    "budgetUtilization": 23.33
  }
}
```

## Reports Endpoints

### Expense Report

**GET** `/reports/expenses`

Get expense report. Supports date range filtering.

**Query Parameters:**
- `startDate`: date (optional)
- `endDate`: date (optional)
- `branchId`: uuid (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Expense report generated successfully",
  "data": {
    "totalExpenses": 35000.00,
    "approvedExpenses": 32000.00,
    "pendingExpenses": 3000.00,
    "categoryBreakdown": {
      "Operations": 15000.00,
      "Equipment": 12000.00,
      "Supplies": 8000.00
    },
    "expenses": [...]
  }
}
```

### Export Expense Report (PDF)

**GET** `/reports/expenses/pdf`

Export expense report as PDF file.

**Query Parameters:**
- `startDate`: date (optional)
- `endDate`: date (optional)
- `branchId`: uuid (optional)

**Response:** PDF file

### Export Expense Report (Excel)

**GET** `/reports/expenses/excel`

Export expense report as Excel file.

**Query Parameters:**
- `startDate`: date (optional)
- `endDate`: date (optional)
- `branchId`: uuid (optional)

**Response:** Excel file

### Revenue Report

**GET** `/reports/revenues`

Get revenue report.

**Query Parameters:**
- `startDate`: date (optional)
- `endDate`: date (optional)
- `branchId`: uuid (optional)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Revenue report generated successfully",
  "data": {
    "totalRevenues": 50000.00,
    "categoryBreakdown": {...},
    "revenues": [...]
  }
}
```

### Equipment Inventory Report

**GET** `/reports/equipment`

Get equipment inventory report.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Equipment report generated successfully",
  "data": {
    "totalEquipment": 120,
    "available": 95,
    "inUse": 20,
    "maintenance": 5,
    "categoryBreakdown": {...}
  }
}
```

### Employee Report

**GET** `/reports/employees`

Get employee report.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Employee report generated successfully",
  "data": {
    "totalEmployees": 50,
    "byDepartment": {...},
    "byDesignation": {...},
    "activeEmployees": 48
  }
}
```

### Vehicle Fleet Report

**GET** `/reports/vehicles`

Get vehicle fleet report.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Vehicle report generated successfully",
  "data": {
    "totalVehicles": 25,
    "active": 20,
    "maintenance": 3,
    "inactive": 2,
    "byType": {...}
  }
}
```

## Audit Endpoints

### List Audit Logs

**GET** `/audit/logs`

Retrieve audit logs with pagination.

**Query Parameters:**
- `skip`: number (default: 0)
- `take`: number (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "action": "UPDATE",
      "module": "employees",
      "resourceId": "uuid",
      "userId": "uuid",
      "oldValues": {"email": "old@company.com"},
      "newValues": {"email": "new@company.com"},
      "timestamp": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Logs by Module

**GET** `/audit/logs/module/:module`

Get audit logs for a specific module.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Module logs retrieved successfully",
  "data": [...]
}
```

### Logs by User

**GET** `/audit/logs/user/:userId`

Get audit logs for a specific user.

**Response:**
```json
{
  "statusCode": 200,
  "message": "User logs retrieved successfully",
  "data": [...]
}
```

### Logs by Resource

**GET** `/audit/logs/resource/:resourceId`

Get audit logs for a specific resource.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Resource logs retrieved successfully",
  "data": [...]
}
```

---

**Last Updated:** January 2024


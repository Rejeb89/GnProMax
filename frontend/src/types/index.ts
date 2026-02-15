export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  companyId: string;
  roleId: string;
  role?: string;
  isActive?: boolean;
  branches?: UserBranch[];
}

export interface UserBranch {
  userId: string;
  branchId: string;
  branch?: Branch;
}

export interface Branch {
  id: string;
  companyId: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  designation?: string;
  department?: string;
  email?: string;
  phone?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  status: string;
  currentDriver?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: string;
  condition?: string;
  location?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
  status: string;
}

export interface Revenue {
  id: string;
  source: string;
  amount: number;
  revenueDate: string;
  status: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalVehicles: number;
  totalEquipment: number;
  totalExpenses: number;
  totalRevenues: number;
}

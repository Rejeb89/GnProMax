import apiClient from './client';

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  branchIds?: string[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'manager' | 'user';
  branchIds?: string[];
  isActive?: boolean;
}

export const usersService = {
  // Get all users (admin only)
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Get user by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create new user (admin only)
  create: async (userData: CreateUserData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Update user (admin only)
  update: async (id: string, userData: UpdateUserData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Get all branches
  getBranches: async () => {
    const response = await apiClient.get('/branches');
    return response.data;
  },

  // Assign user to branches
  assignToBranches: async (userId: string, branchIds: string[]) => {
    const response = await apiClient.post(`/users/${userId}/branches`, { branchIds });
    return response.data;
  },

  // Deactivate user (admin only)
  deactivate: async (id: string) => {
    const response = await apiClient.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  // Activate user (admin only)
  activate: async (id: string) => {
    const response = await apiClient.patch(`/users/${id}/activate`);
    return response.data;
  },
};

export default usersService;

import apiClient from './client';
import { Employee } from '@/types';

export const employeeService = {
  getAll: async (skip = 0, take = 10) => {
    const response = await apiClient.get('/employees', { params: { skip, take } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: Partial<Employee> & { branchId: string }) => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Employee>) => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/employees/${id}`);
  },

  getByBranch: async (branchId: string) => {
    const response = await apiClient.get(`/employees/branch/${branchId}`);
    return response.data;
  },
};

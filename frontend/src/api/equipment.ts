import apiClient from './client';

export const equipmentService = {
  getAll: async (params?: { skip?: number; take?: number; includeInactive?: boolean }) => {
    const response = await apiClient.get('/equipment', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/equipment/${id}`);
    return response.data;
  },

  getLowStock: async (take: number = 5) => {
    const response = await apiClient.get(`/equipment/low-stock/dashboard?take=${take}`);
    return response.data;
  },

  create: async (payload: any) => {
    const response = await apiClient.post('/equipment', payload);
    return response.data;
  },

  update: async (id: string, payload: any) => {
    const response = await apiClient.put(`/equipment/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/equipment/${id}`);
    return response.data;
  },

  recordTransaction: async (payload: any) => {
    const response = await apiClient.post('/equipment/transaction', payload);
    return response.data;
  },

  getTransactions: async (equipmentId: string) => {
    const response = await apiClient.get(`/equipment/${equipmentId}/transactions`);
    return response.data;
  },
};

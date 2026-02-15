import apiClient from './client';

export const settingsService = {
  get: async () => {
    const res = await apiClient.get('/settings');
    return res.data;
  },
  update: async (settings: any) => {
    const res = await apiClient.put('/settings', { settings });
    return res.data;
  },
};

export default settingsService;

import apiClient from './client';

export const dashboardService = {
  getStats: async () => {
    try {
      const [employees, vehicles, equipment] = await Promise.all([
        apiClient.get('/employees?take=1'),
        apiClient.get('/vehicles?take=1'),
        apiClient.get('/equipment?take=1'),
      ]);

      return {
        totalEmployees: employees.data.total || 0,
        totalVehicles: vehicles.data.total || 0,
        totalEquipment: equipment.data.total || 0,
        totalExpenses: 0,
        totalRevenues: 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalEmployees: 0,
        totalVehicles: 0,
        totalEquipment: 0,
        totalExpenses: 0,
        totalRevenues: 0,
      };
    }
  },

  getFinancialSummary: async (month?: number, year?: number) => {
    const response = await apiClient.get('/finance/summary', {
      params: { month, year },
    });
    return response.data;
  },
};

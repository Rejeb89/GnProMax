import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { dashboardService } from '@/api/dashboard';
import { DashboardStats } from '@/types';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalVehicles: 0,
    totalEquipment: 0,
    totalExpenses: 0,
    totalRevenues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: number; icon: string }> = ({
    title,
    value,
    icon,
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl text-blue-500">{icon}</div>
      </div>
    </div>
  );

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Employees" value={stats.totalEmployees} icon="👥" />
          <StatCard title="Vehicles" value={stats.totalVehicles} icon="🚗" />
          <StatCard title="Equipment" value={stats.totalEquipment} icon="🔧" />
          <StatCard title="Expenses" value={stats.totalExpenses} icon="💸" />
          <StatCard title="Revenues" value={stats.totalRevenues} icon="💰" />
        </div>
      )}

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-gray-600 text-center py-12">
          <p>No recent activity</p>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;

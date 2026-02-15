import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { dashboardService } from '@/api/dashboard';
import { equipmentService } from '@/api/equipment';
import { DashboardStats } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

interface LowStockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
  serialNumber: string;
}

const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalVehicles: 0,
    totalEquipment: 0,
    totalExpenses: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadLowStock();
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

  const loadLowStock = async () => {
    try {
      setLowStockLoading(true);
      const data = await equipmentService.getLowStock(5);
      setLowStockItems(data);
    } catch (error) {
      console.error('Error loading low stock items:', error);
    } finally {
      setLowStockLoading(false);
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
    <Layout title={t('dashboard')}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">{t('loading')}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title={t('totalEmployees')} value={stats.totalEmployees} icon="👥" />
          <StatCard title={t('totalVehicles')} value={stats.totalVehicles} icon="🚗" />
          <StatCard title={t('totalEquipment')} value={stats.totalEquipment} icon="🔧" />
          <StatCard title={t('totalExpenses')} value={stats.totalExpenses} icon="💸" />
        </div>
      )}

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
        <div className="text-gray-600 text-center py-12">
          <p>{t('noData')}</p>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('lowStockItems')}</h3>
        {lowStockLoading ? (
          <div className="text-center text-gray-600 py-8">{t('loading')}</div>
        ) : lowStockItems.length === 0 ? (
          <div className="text-center text-gray-600 py-8">{t('noData')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">{t('name')}</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">{t('category')}</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">{t('currentStock')}</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">{t('threshold')}</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">حالة المخزون</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900 text-right">{item.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{item.category}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{item.lowStockThreshold}</td>
                    <td className="px-6 py-3 text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ {t('lowStock')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { equipmentService } from '@/api/equipment';

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  branchId: string;
  status: string;
  quantity: number;
  availableQuantity: number;
  lowStockThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

const EquipmentPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalItems = equipment.length;
  const totalStock = equipment.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const availableStock = equipment.reduce((acc, item) => acc + (item.availableQuantity || 0), 0);
  const distributedStock = totalStock - availableStock;

  // Fetch equipment on component mount
  const fetchEquipment = useCallback(async () => {
    try {
      console.log('Fetching equipment...');
      setLoading(true);
      const response = await equipmentService.getAll();
      console.log('Equipment response received:', response);
      
      // Extract array from response object
      const equipmentArray = response?.data || [];
      console.log('Equipment array extracted:', equipmentArray);
      console.log('Is array?', Array.isArray(equipmentArray));
      
      setEquipment(equipmentArray);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch equipment:', err);
      console.error('Error response:', err?.response);
      console.error('Error data:', err?.response?.data);
      setError(err?.response?.data?.message || 'فشل في جلب التجهيزات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التجهيز؟')) {
      return;
    }

    try {
      await equipmentService.delete(id);
      setEquipment(equipment.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('Failed to delete equipment:', err);
      alert(err?.response?.data?.message || 'فشل في حذف التجهيز');
    }
  };

  const handleHandover = async () => {
    if (!handoverData.equipmentId || !handoverData.recipientName || handoverData.quantity <= 0) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await equipmentService.recordTransaction({
        equipmentId: handoverData.equipmentId,
        transactionType: 'OUT',
        quantity: handoverData.quantity,
        notes: `تسليم لـ: ${handoverData.recipientName}. ${handoverData.notes}`,
        reference: `HANDOVER-${Date.now()}`,
      });

      setShowHandoverModal(false);
      setHandoverData({ equipmentId: '', quantity: 0, recipientName: '', notes: '' });
      fetchEquipment(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to record handover:', err);
      alert(err?.response?.data?.message || 'فشل في تسليم التجهيز');
    }
  };

  return (
    <Layout title={t('equipment')}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border-r-4 border-blue-500">
            <p className="text-sm text-gray-500 font-medium">إجمالي أنواع التجهيزات</p>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-r-4 border-green-500">
            <p className="text-sm text-gray-500 font-medium">إجمالي الكمية المستلمة</p>
            <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-r-4 border-amber-500">
            <p className="text-sm text-gray-500 font-medium">الكمية المتوفرة حالياً</p>
            <p className="text-2xl font-bold text-gray-900">{availableStock}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-r-4 border-purple-500">
            <p className="text-sm text-gray-500 font-medium">الكمية الموزعة</p>
            <p className="text-2xl font-bold text-gray-900">{distributedStock}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-sm font-medium text-gray-700 mb-1">البحث في التجهيزات</label>
            <input
              type="text"
              placeholder="ابحث بالاسم، الصنف، أو الرقم التسلسلي..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/equipment/add')}
              className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> استلام تجهيزات
            </button>
            <button
              onClick={() => navigate('/equipment/handover')}
              className="flex-1 md:flex-none px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-bold flex items-center justify-center gap-2"
            >
              <span className="text-xl">⇄</span> توزيع تجهيزات
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">جاري التحميل...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="text-red-600 mb-4">{error}</div>
                      <button
                        onClick={fetchEquipment}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  ) : filteredEquipment.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">
                      <p>{t('noItemsFound')}</p>
                      <button
                        onClick={() => navigate('/equipment/add')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        {t('addEquipment')}
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 border-b">
                          <tr>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">التجهيز</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الصنف</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الرقم التسلسلي</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">الكمية الكلية</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">المتوفر</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">الحالة</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredEquipment.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50 transition">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500">{new Date(item.purchaseDate).toLocaleDateString('ar-SA')}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {item.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                {item.serialNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                                <span className={item.availableQuantity <= (item.lowStockThreshold || 0) ? 'text-red-600' : 'text-green-600'}>
                                  {item.availableQuantity}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                {item.availableQuantity <= 0 ? (
                                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">منتهي</span>
                                ) : item.availableQuantity <= (item.lowStockThreshold || 5) ? (
                                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">منخفض</span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">متوفر</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => navigate(`/equipment/${item.id}/edit`)}
                                    className="text-blue-600 hover:text-blue-900"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </Layout>
);
};
export default EquipmentPage;

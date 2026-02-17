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
  quantity?: number;
  lowStockThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

interface HandoverItem {
  equipmentId: string;
  quantity: number;
  recipientName: string;
  notes: string;
}

const EquipmentPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverData, setHandoverData] = useState<HandoverItem>({
    equipmentId: '',
    quantity: 0,
    recipientName: '',
    notes: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <div className="flex justify-between items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('equipmentList')}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/equipment/add')}
                      className="btn-primary"
                    >
                      {t('addEquipment')}
                    </button>
                    <button
                      onClick={() => navigate('/equipment/handover')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                    >
                      تسليم تجهيزات
                    </button>
                  </div>
                </div>
        
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
        
                <div className="bg-white rounded-lg shadow">
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
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              اسم التجهيز
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              الصنف
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              الرقم التسلسلي
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              تاريخ الشراء
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              الحالة
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              الإجراءات
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredEquipment.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <button
                                  onClick={() => navigate(`/equipment/${item.id}`)}
                                  className="text-blue-600 hover:text-blue-900 hover:underline"
                                >
                                  {item.name}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.serialNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(item.purchaseDate).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                                </span>
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { equipmentService } from '@/api/equipment';
import useAuthStore from '@/store/authStore';

interface AddEquipmentFormData {
  equipmentName: string;
  equipmentCategory: string;
  quantity: number;
  lowStockThreshold: number;
  sendingEntity: string;
  date: string;
  notes: string;
  recipientUser?: string; // New field for recipient user
}

const AddEquipmentPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<AddEquipmentFormData>({
    equipmentName: '',
    equipmentCategory: '',
    quantity: 0,
    lowStockThreshold: 5,
    sendingEntity: '',
    date: '',
    notes: '',
    recipientUser: '', // Initialize new field
  });
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [operationNumber, setOperationNumber] = useState<string | null>(null);
  const [nameSearch, setNameSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const handleRegister = async () => {
    // محاولة مطابقة قيم البحث مع الخيارات المتاحة
    let finalName = formData.equipmentName || nameSearch;
    let finalCategory = formData.equipmentCategory || categorySearch;

    // التحقق من جميع الحقول المطلوبة
    if (!finalName || !finalName.trim()) {
      setError('يرجى اختيار اسم التجهيز');
      return;
    }
    if (!finalCategory || !finalCategory.trim()) {
      setError('يرجى اختيار صنف التجهيز');
      return;
    }
    if (!formData.date) {
      setError('يرجى اختيار التاريخ');
      return;
    }

    setRegistering(true);
    setError(null);

    try {
      const updatedFormData = {
        ...formData,
        equipmentName: finalName.trim(),
        equipmentCategory: finalCategory.trim(),
      };

      // توليد رقم عملية تلقائي يستخدم كمرجع للوصل
      const generatedNumber = `EQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setOperationNumber(generatedNumber);

      // احصل على فرع المستخدم الأول إن وجد
      const auth = useAuthStore.getState();
      const branchId = auth.user?.branches?.[0]?.branchId || 'main-branch-001';
      if (!branchId) {
        setError('لم يتم تحديد فرع للمستخدم. يرجى ضبط الفرع أولاً.');
        setRegistering(false);
        return;
      }

      // تجهيز الحمولة لإنشاء التجهيز
      const createPayload = {
        name: updatedFormData.equipmentName,
        description: updatedFormData.notes,
        category: updatedFormData.equipmentCategory,
        serialNumber: `SN-${Date.now()}`,
        purchaseDate: updatedFormData.date ? new Date(updatedFormData.date).toISOString() : null,
        branchId,
        lowStockThreshold: Number(updatedFormData.lowStockThreshold) || 5,
      };

      const created = await equipmentService.create(createPayload);

      // بعد إنشاء التجهيز، نسجل عملية دخول (transaction)
      const transactionPayload = {
        equipmentId: created.id,
        transactionType: 'IN',
        quantity: Number(updatedFormData.quantity) || 0,
        notes: updatedFormData.notes,
        reference: generatedNumber,
      };

      await equipmentService.recordTransaction(transactionPayload);

      setSuccess(true);
      setTimeout(() => {
        navigate('/equipment');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || t('error'));
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Layout title={t('addEquipment')}>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('addEquipment')}</h2>
          <button
            onClick={() => navigate('/equipment')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← {t('back')}
          </button>
        </div>

        {/* Success Message */}
        {success && operationNumber && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-4 rounded">
            <p className="font-bold">{t('equipmentRegistered')}</p>
            <p>
              {t('operationNumber')}: <span className="font-mono">{operationNumber}</span>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded">
            {error}
          </div>
        )}

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Name with Search Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('equipmentName')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('equipmentName')}
                  value={nameSearch || formData.equipmentName}
                  onChange={(e) => {
                    setNameSearch(e.target.value);
                    setFormData({ ...formData, equipmentName: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                />
              </div>
            </div>

            {/* Equipment Category with Search Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('equipmentCategory')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('equipmentCategory')}
                  value={categorySearch || formData.equipmentCategory}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setFormData({ ...formData, equipmentCategory: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('quantity')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
              />
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('lowStockThreshold')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
              />
            </div>

            {/* Current User Display */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                المستخدم الحالي
              </label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName} (${user.email})`
                  : user?.email || 'غير معروف'
                }
              </div>
            </div>

            {/* Sending Entity (Auto-save) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('sendingEntity')} <span className="text-amber-600 text-xs">(محفوظ تلقائيا)</span>
              </label>
              <input
                type="text"
                value={formData.sendingEntity}
                onChange={(e) =>
                  setFormData({ ...formData, sendingEntity: e.target.value })
                }
                placeholder="اسم الجهة المرسلة"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
              />
              <p className="text-xs text-gray-500 mt-1">✓ يتم حفظ هذه البيانات تلقائيا</p>
            </div>

            {/* Recipient User Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                الترقيم الإداري
              </label>
              <input
                type="text"
                placeholder="أدخل الترقيم الإداري"
                value={formData.recipientUser}
                onChange={(e) =>
                  setFormData({ ...formData, recipientUser: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
              />
              <p className="text-xs text-gray-500 mt-1">أدخل الترقيم الإداري يدوياً</p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('date')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
              />
            </div>

            {/* Notes - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
              />
            </div>
          </div>

          {/* Register Button */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => navigate('/equipment')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleRegister}
              disabled={registering}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {registering ? t('registering') : t('registerEquipment')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddEquipmentPage;

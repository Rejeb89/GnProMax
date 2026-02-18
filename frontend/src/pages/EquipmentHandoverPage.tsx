import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { equipmentService } from '@/api/equipment';
import useAuthStore from '@/store/authStore';

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
  availableQuantity?: number;
  lowStockThreshold?: number;
  manufacturer?: string;
  model?: string;
  location?: string;
  assignedTo?: string;
  condition?: string;
  warrantyExpiry?: string;
  maintenanceDate?: string;
  notes?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface HandoverData {
  equipmentId: string;
  equipmentName: string;
  category: string;
  quantity: number;
  unit: string;
  handoverDate: string;
  recipient: string;
  notes: string;
}

const EquipmentHandoverPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [handoverData, setHandoverData] = useState<HandoverData>({
    equipmentId: '',
    equipmentName: '',
    category: '',
    quantity: 1,
    unit: 'وحدة',
    handoverDate: new Date().toISOString().split('T')[0],
    recipient: '',
    notes: ''
  });

  const units = ['وحدة', 'قطعة', 'صندوق', 'كرتونة', 'طقم', 'مجموعة', 'حزمة', 'عبوة'];

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = equipment.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipment(filtered);
      setShowDropdown(true);
    } else {
      setFilteredEquipment([]);
      setShowDropdown(false);
    }
  }, [searchTerm, equipment]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await equipmentService.getAll();
      setEquipment(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch equipment:', err);
      setError(err?.response?.data?.message || 'فشل في جلب التجهيزات');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentSelect = (item: Equipment) => {
    setSelectedEquipment(item);
    setSearchTerm(item.name);
    setShowDropdown(false);
    setHandoverData(prev => ({
      ...prev,
      equipmentId: item.id,
      equipmentName: item.name,
      category: item.category,
      quantity: 1
    }));
  };

  const handleInputChange = (field: keyof HandoverData, value: any) => {
    setHandoverData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!handoverData.equipmentId) {
      setError('يرجى اختيار التجهيز');
      return false;
    }
    if (!handoverData.quantity || handoverData.quantity <= 0) {
      setError('يرجى إدخال كمية صحيحة');
      return false;
    }
    if (!handoverData.handoverDate) {
      setError('يرجى اختيار تاريخ التسليم');
      return false;
    }
    if (!handoverData.recipient) {
      setError('يرجى إدخال اسم المتسلم');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Create handover transaction
      // The backend will automatically update quantities or delete the equipment if it's a handover
      await equipmentService.recordTransaction({
        equipmentId: handoverData.equipmentId,
        transactionType: 'HANDOVER',
        quantity: handoverData.quantity,
        fromLocation: selectedEquipment?.location || 'المخزن',
        toLocation: handoverData.recipient,
        notes: handoverData.notes,
        reference: `تسليم ${handoverData.equipmentName}`,
        createdBy: user?.id
      });
      
      // Reset form
      setHandoverData({
        equipmentId: '',
        equipmentName: '',
        category: '',
        quantity: 1,
        unit: 'وحدة',
        handoverDate: new Date().toISOString().split('T')[0],
        recipient: '',
        notes: ''
      });
      setSelectedEquipment(null);
      setSearchTerm('');
      
      alert('تم تسليم التجهيز بنجاح');
      
    } catch (err: any) {
      console.error('Failed to handover equipment:', err);
      setError(err?.response?.data?.message || 'فشل في تسليم التجهيز');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/equipment');
  };

  if (loading) {
    return (
      <Layout title="تسليم التجهيزات">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="توزيع التجهيزات">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900">توزيع التجهيزات (تسليم للموظفين/الجهات)</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <span>→</span> {t('back')}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-r-4 border-red-500 text-red-700 px-4 py-4 rounded shadow">
            {error}
          </div>
        )}

        {/* Handover Form */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-orange-500">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">بيانات أمر التوزيع / التسليم</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم التجهيز *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="ابحث عن التجهيز..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {showDropdown && filteredEquipment.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredEquipment.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleEquipmentSelect(item)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.serialNumber} - {item.category}
                        </div>
                        <div className="text-sm text-green-600">
                          الكمية المتوفرة: {item.availableQuantity || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صنف التجهيز
              </label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                {handoverData.category || 'غير محدد'}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكمية *
              </label>
              <input
                type="number"
                min="1"
                max={selectedEquipment?.availableQuantity || 1}
                value={handoverData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {selectedEquipment && (
                <p className="text-sm text-gray-500 mt-1">
                  الكمية المتوفرة: {selectedEquipment.availableQuantity || 0}
                </p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوحدة المستخدمة
              </label>
              <select
                value={handoverData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Handover Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ التسليم *
              </label>
              <input
                type="date"
                value={handoverData.handoverDate}
                onChange={(e) => handleInputChange('handoverDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المتسلم *
              </label>
              <input
                type="text"
                value={handoverData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                placeholder="اسم الشخص المتسلم"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                value={handoverData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="أي ملاحظات إضافية..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end border-t pt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-10 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-lg shadow-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
            >
              {submitting ? 'جاري تسجيل التوزيع...' : 'تأكيد التوزيع والتسليم'}
            </button>
          </div>
        </div>

        {/* Selected Equipment Details */}
        {selectedEquipment && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل التجهيز المختار</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الرقم التسلسلي</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                  {selectedEquipment.serialNumber}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الموقع الحالي</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                  {selectedEquipment.location || 'غير محدد'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedEquipment.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedEquipment.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكمية المتوفرة</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                  {selectedEquipment.availableQuantity || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EquipmentHandoverPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EquipmentDetailsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      if (!id) {
        setError('لم يتم تحديد معرف التجهيز');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await equipmentService.getById(id);
        setEquipment(response);
      } catch (err: any) {
        console.error('Failed to fetch equipment details:', err);
        setError(err?.response?.data?.message || 'فشل في جلب تفاصيل التجهيز');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentDetails();
  }, [id]);

  const handleBack = () => {
    navigate('/equipment');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const handleExportPDF = async () => {
    try {
      // Create a simple print-friendly HTML version
      const printContent = `
        <html>
        <head>
          <title>تفاصيل التجهيز - ${equipment?.name}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              direction: rtl; 
              margin: 20px; 
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #333;
              margin: 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              padding: 10px;
              border: 1px solid #ddd;
            }
            .info-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #333;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تفاصيل التجهيز</h1>
            <h2>${equipment?.name}</h2>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">الرقم التسلسلي:</div>
              <div class="info-value">${equipment?.serialNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الصنف:</div>
              <div class="info-value">${equipment?.category}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الحالة:</div>
              <div class="info-value">${equipment?.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الكمية المتوفرة:</div>
              <div class="info-value">${equipment?.availableQuantity || 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">الكمية الإجمالية:</div>
              <div class="info-value">${(equipment?.availableQuantity || 0) + (equipment?.quantity || 0)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">حد المخزون المنخفض:</div>
              <div class="info-value">${equipment?.lowStockThreshold || 0}</div>
            </div>
          </div>
          
          <div class="section">
            <h2>معلومات الشراء</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">تاريخ الشراء:</div>
                <div class="info-value">${equipment?.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">الفرع:</div>
                <div class="info-value">${equipment?.branchId || 'غير محدد'}</div>
              </div>
            </div>
          </div>
          
          ${equipment?.description ? `
          <div class="section">
            <h2>الوصف</h2>
            <div class="info-item">
              <div class="info-value">${equipment?.description}</div>
            </div>
          </div>
          ` : ''}
          
          <div class="section">
            <h2>معلومات إضافية</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">المصنع:</div>
                <div class="info-value">${equipment?.manufacturer || 'غير محدد'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">الموديل:</div>
                <div class="info-value">${equipment?.model || 'غير محدد'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">الموقع:</div>
                <div class="info-value">${equipment?.location || 'غير محدد'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">المسند إلي:</div>
                <div class="info-value">${equipment?.assignedTo || 'غير محدد'}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>معلومات الضمان</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">رقم التعريف:</div>
                <div class="info-value">${equipment?.qrCode}</div>
              </div>
              <div class="info-item">
                <div class="info-label">تاريخ انتهاء الضمان:</div>
                <div class="info-value">${equipment?.warrantyExpiry ? new Date(equipment.warrantyExpiry).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">تاريخ الصيانة:</div>
                <div class="info-value">${equipment?.maintenanceDate ? new Date(equipment.maintenanceDate).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">الحالة:</div>
                <div class="info-value">${equipment?.condition || 'جيد'}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>ملاحظات</h2>
            <div class="info-item">
              <div class="info-value">${equipment?.notes || 'لا توجد ملاحظات'}</div>
            </div>
          </div>
          
          <div class="section">
            <h2>معلومات الوقت</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">تاريخ الإنشاء:</div>
                <div class="info-value">${equipment?.createdAt ? new Date(equipment.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">آخر تحديث:</div>
                <div class="info-value">${equipment?.updatedAt ? new Date(equipment.updatedAt).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('فشل في إنشاء PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      // Create CSV content
      const csvContent = [
        ['الرقم التسلسلي', 'الصنف', 'الكمية المتوفرة', 'الكمية الإجمالية', 'حد المخزون المنخفض', 'تاريخ الشراء', 'الفرع', 'المصنع', 'الموديل', 'الموقع', 'المسند إلي', 'تاريخ انتهاء الضمان', 'تاريخ الصيانة', 'الحالة', 'تاريخ الإنشاء', 'آخر تحديث', 'الملاحظات'],
        [
          equipment?.serialNumber || '',
          equipment?.category || '',
          equipment?.availableQuantity || 0,
          equipment?.quantity || 0,
          `${equipment?.availableQuantity || 0}`,
          `${equipment?.lowStockThreshold || 0}`,
          equipment?.branchId || '',
          equipment?.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString('ar-SA') : '',
          equipment?.manufacturer || '',
          equipment?.model || '',
          equipment?.location || '',
          equipment?.assignedTo || '',
          equipment?.warrantyExpiry ? new Date(equipment.warrantyExpiry).toLocaleDateString('ar-SA') : '',
          equipment?.maintenanceDate ? new Date(equipment.maintenanceDate).toLocaleDateString('ar-SA') : '',
          equipment?.condition || 'جيد',
          equipment?.notes || '',
          equipment?.createdAt ? new Date(equipment.createdAt).toLocaleDateString('ar-SA') : '',
          equipment?.updatedAt ? new Date(equipment.updatedAt).toLocaleDateString('ar-SA') : ''
        ]
      ];
      
      // Create CSV string
      const csvString = csvContent.map(row => row.join(',')).join('\n');
      
      // Create download link
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تفاصيل_${equipment?.name}_${Date.now()}.csv`;
      link.click();
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('فشل في تصدير Excel');
    }
  };

  if (loading) {
    return (
      <Layout title={t('equipmentDetails')}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={t('equipmentDetails')}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="text-lg font-bold mb-2">خطأ</h2>
            <p>{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              العودة
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!equipment) {
    return (
      <Layout title={t('equipmentDetails')}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <h2 className="text-lg font-bold mb-2">التجهيز غير موجود</h2>
            <p>لم يتم العثور على التجهيز المطلوب</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            >
              العودة
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('equipmentDetails')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل التجهيز</h1>
          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ← العودة
            </button>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                &#128438; طباعة
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                &#128195; PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                &#128196; Excel
              </button>
            </div>
          </div>
        </div>

        {/* Equipment Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم التجهيز</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الصنف</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.category}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرقم التسلسلي</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.serialNumber}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      equipment.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {equipment.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الكمية المتوفرة</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.availableQuantity || 0}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الكمية الإجمالية</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {(equipment.availableQuantity || 0) + (equipment.quantity || 0)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حد المخزون المنخفض</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.lowStockThreshold || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الشراء</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الشراء</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الفرع</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.branchId}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h2>
              
              {equipment.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.description}
                  </div>
                </div>
              )}

              {equipment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الوقت</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإنشاء</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.createdAt ? new Date(equipment.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">آخر تحديث</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-right">
                    {equipment.updatedAt ? new Date(equipment.updatedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EquipmentDetailsPage;

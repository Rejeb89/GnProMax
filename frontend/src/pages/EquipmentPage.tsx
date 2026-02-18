import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
            <Button onClick={() => navigate('/equipment/add')}>{t('addEquipment')}</Button>
            <Button variant="secondary" onClick={() => navigate('/equipment/handover')}>تسليم تجهيزات</Button>
          </div>
        </div>

        <div className="mb-4">
          <Input placeholder="ابحث بالاسم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <Card>
          <CardContent>
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('name')}</TableHead>
                            <TableHead>{t('category')}</TableHead>
                            <TableHead>{t('serialNumber')}</TableHead>
                            <TableHead>{t('purchaseDate')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead>{t('actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEquipment.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Button variant="link" onClick={() => navigate(`/equipment/${item.id}`)}>{item.name}</Button>
                              </TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>{item.serialNumber}</TableCell>
                              <TableCell>{new Date(item.purchaseDate).toLocaleDateString('ar-SA')}</TableCell>
                              <TableCell>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>{item.status === 'ACTIVE' ? 'نشط' : 'غير نشط'}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="link" onClick={() => navigate(`/equipment/${item.id}/edit`)}>{t('edit')}</Button>
                                  <Button variant="destructive" onClick={() => handleDelete(item.id)}>{t('delete')}</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
};

export default EquipmentPage;

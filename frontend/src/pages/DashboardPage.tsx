import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { dashboardService } from '@/api/dashboard';
import { equipmentService } from '@/api/equipment';
import { DashboardStats } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Car, Wrench, DollarSign, Package, TrendingDown, AlertTriangle, Activity } from 'lucide-react';

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
    totalRevenues: 0,
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

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; description?: string }> = ({
    title,
    value,
    icon,
    description,
  }) => (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2 truncate">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{description}</p>
            )}
          </div>
          <div className="text-3xl sm:text-4xl text-muted-foreground flex-shrink-0 mr-2 sm:mr-4">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout title={t('dashboard')}>
      <div className="space-y-4 sm:space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">{t('loading')}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard title={t('totalEmployees')} value={stats.totalEmployees} icon={<Users className="h-6 w-6 sm:h-8 sm:w-8" />} description="الموظفين النشطين" />
            <StatCard title={t('totalVehicles')} value={stats.totalVehicles} icon={<Car className="h-6 w-6 sm:h-8 sm:w-8" />} description="المركبات المتاحة" />
            <StatCard title={t('totalEquipment')} value={stats.totalEquipment} icon={<Wrench className="h-6 w-6 sm:h-8 sm:w-8" />} description="عدد المعدات" />
            <StatCard title={t('totalExpenses')} value={stats.totalExpenses} icon={<DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />} description="إجمالي المصروفات" />
          </div>
        )}

        {/* Recent Activity */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base">{t('noData')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('lowStockItems')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="text-center text-muted-foreground py-6 sm:py-8">
                <p className="text-sm sm:text-base">{t('loading')}</p>
              </div>
            ) : lowStockItems.length === 0 ? (
              <Alert>
                <AlertDescription className="text-sm sm:text-base">
                  لا توجد مواد منخفضة المخزون حالياً
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right text-xs sm:text-sm">{t('name')}</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">{t('category')}</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">{t('currentStock')}</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">{t('threshold')}</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">حالة المخزون</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => {
                      const stockPercentage = (item.quantity / item.lowStockThreshold) * 100;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{item.name}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{item.category}</TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-xs">{item.quantity}</Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{item.lowStockThreshold}</TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <Progress value={Math.min(stockPercentage, 100)} className="w-16 sm:w-20 h-2" />
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {t('lowStock')}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;

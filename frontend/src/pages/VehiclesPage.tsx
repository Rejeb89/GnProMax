import React from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VehiclesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Layout title={t('vehicles')}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{t('vehicleList')}</h3>
          <Button>{t('addVehicle')}</Button>
        </div>

        <Card>
          <CardContent>
            <div className="text-center text-gray-600 py-12">
              <p>{t('noItemsFound')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VehiclesPage;

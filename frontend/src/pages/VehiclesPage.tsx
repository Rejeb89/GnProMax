import React from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';

const VehiclesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Layout title={t('vehicles')}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{t('vehicleList')}</h3>
          <button className="btn-primary">{t('addVehicle')}</button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-600 py-12">
            <p>{t('noItemsFound')}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VehiclesPage;

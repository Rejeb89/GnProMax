import React from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';

const FinancePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Layout title={t('finance')}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('expenses')}</h3>
          <div className="text-center text-gray-600 py-12">
            <p>{t('noItemsFound')}</p>
          </div>
        </div>

        {/* Revenues */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('revenues')}</h3>
          <div className="text-center text-gray-600 py-12">
            <p>{t('noItemsFound')}</p>
          </div>
        </div>

        {/* Budgets */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('budgets')}</h3>
          <div className="text-center text-gray-600 py-12">
            <p>{t('noItemsFound')}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FinancePage;

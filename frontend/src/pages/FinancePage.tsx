import React from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const FinancePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Layout title={t('finance')}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('expenses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-600 py-12">{t('noItemsFound')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('revenues')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-600 py-12">{t('noItemsFound')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('budgets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-600 py-12">{t('noItemsFound')}</div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FinancePage;

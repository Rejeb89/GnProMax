import React from 'react';
import Layout from '@/components/Layout';

const FinancePage: React.FC = () => {
  return (
    <Layout title="Finance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
          <div className="text-center text-gray-600 py-12">
            <p>No expenses found</p>
          </div>
        </div>

        {/* Revenues */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenues</h3>
          <div className="text-center text-gray-600 py-12">
            <p>No revenues found</p>
          </div>
        </div>

        {/* Budgets */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budgets</h3>
          <div className="text-center text-gray-600 py-12">
            <p>No budgets found</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FinancePage;

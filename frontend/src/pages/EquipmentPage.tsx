import React from 'react';
import Layout from '@/components/Layout';

const EquipmentPage: React.FC = () => {
  return (
    <Layout title="Equipment">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Equipment List</h3>
          <button className="btn-primary">Add Equipment</button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-600 py-12">
            <p>No equipment found</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EquipmentPage;

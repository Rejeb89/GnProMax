import React from 'react';
import Layout from '@/components/Layout';

const VehiclesPage: React.FC = () => {
  return (
    <Layout title="Vehicles">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Vehicle List</h3>
          <button className="btn-primary">Add Vehicle</button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-600 py-12">
            <p>No vehicles found</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VehiclesPage;

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { employeeService } from '@/api/employees';
import { Employee } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

const EmployeesPage: React.FC = () => {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll();
      setEmployees(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={t('employees')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{t('employeeList')}</h3>
          <button className="btn-primary">{t('addEmployee')}</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-600">{t('loading')}</div>
          ) : employees.length === 0 ? (
            <div className="p-6 text-center text-gray-600">{t('noItemsFound')}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    {t('name')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    {t('employeeId')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    {t('designation')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    {t('department')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    {t('email')}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900 text-right">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{emp.employeeId}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{emp.designation}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{emp.department}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{emp.email}</td>
                    <td className="px-6 py-3 text-sm space-x-2 text-right">
                      <button className="text-blue-600 hover:text-blue-900">{t('edit')}</button>
                      <button className="text-red-600 hover:text-red-900">{t('delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>{t('total')}: {total} {t('employees')}</p>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeesPage;

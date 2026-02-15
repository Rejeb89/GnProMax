import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { employeeService } from '@/api/employees';
import { Employee } from '@/types';

const EmployeesPage: React.FC = () => {
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
    <Layout title="Employees">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Employee List</h3>
          <button className="btn-primary">Add Employee</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No employees found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{emp.employeeId}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{emp.designation}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{emp.department}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{emp.email}</td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>Total: {total} employees</p>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeesPage;

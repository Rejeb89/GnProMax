import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{t('employeeList')}</h3>
          <Button>{t('addEmployee')}</Button>
        </div>

        <Card>
          <CardContent>
            {loading ? (
              <div className="p-6 text-center text-gray-600">{t('loading')}</div>
            ) : employees.length === 0 ? (
              <div className="p-6 text-center text-gray-600">{t('noItemsFound')}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('employeeId')}</TableHead>
                    <TableHead>{t('designation')}</TableHead>
                    <TableHead>{t('department')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell>{emp.employeeId}</TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="link">{t('edit')}</Button>
                          <Button variant="destructive">{t('delete')}</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>{t('total')}: {total} {t('employees')}</p>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeesPage;

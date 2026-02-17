import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import usersService from '@/api/users';
import useAuthStore from '@/store/authStore';
import { User, Branch } from '@/types';

interface NewUser {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  branchIds?: string[];
}

function UsersPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    branchIds: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  useEffect(() => {
    loadUsers();
    if (isAdmin) {
      loadBranches();
    }
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getAll();
      const normalizedUsers = (response?.data || []).map((apiUser: any) => {
        const normalizedRole =
          apiUser?.role?.name?.toLowerCase?.() ||
          (typeof apiUser?.role === 'string' ? apiUser.role.toLowerCase() : undefined) ||
          (typeof apiUser?.roleId === 'string' ? apiUser.roleId.toLowerCase() : undefined) ||
          'user';

        return {
          ...apiUser,
          role: normalizedRole,
        };
      });

      setUsers(normalizedUsers);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await usersService.getBranches();
      setBranches(response);
    } catch (err: any) {
      console.error('Failed to load branches:', err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await usersService.create({
        ...newUser,
        roleId:
          newUser.role === 'admin'
            ? 'cmlnkm5020001js0q8zzq7z2w'
            : newUser.role === 'manager'
              ? 'cmlnye1k40000sgcc4mlfh78w'
              : 'cmlnye1ke0001sgccjr2f6omy'
      });
      setShowAddUserModal(false);
      setNewUser({
        email: '',
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user',
        branchIds: []
      });
      loadUsers();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      setLoading(true);
      await usersService.delete(userId);
      loadUsers();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'فشل في حذف المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchToggle = (branchId: string) => {
    setNewUser(prev => ({
      ...prev,
      branchIds: prev.branchIds?.includes(branchId)
        ? prev.branchIds.filter(id => id !== branchId)
        : [...(prev.branchIds || []), branchId]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout title="إدارة المستخدمين">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
          {isAdmin && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              إضافة مستخدم جديد
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">قائمة المستخدمين</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">لا يوجد مستخدمون</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الفروع
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' ? 'مدير' :
                           user.role === 'manager' ? 'مدير فرعي' : 'مستخدم'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.branches?.map(userBranch => userBranch.branch?.name).filter(Boolean).join(', ') || '-'}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddUserModal && isAdmin && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة مستخدم جديد</h3>
                
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الأخير
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الدور
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'manager' | 'user'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="user">مستخدم</option>
                      <option value="manager">مدير فرعي</option>
                      <option value="admin">مدير</option>
                    </select>
                  </div>

                  {branches.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الفروع
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {branches.map((branch) => (
                          <label key={branch.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newUser.branchIds?.includes(branch.id) || false}
                              onChange={() => handleBranchToggle(branch.id)}
                              className="ml-2"
                            />
                            <span className="text-sm">{branch.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'جاري الإنشاء...' : 'إنشاء'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UsersPage;

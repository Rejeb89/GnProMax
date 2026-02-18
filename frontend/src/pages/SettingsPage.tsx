import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import settingsService from '@/api/settings';
import usersService, { CreateUserData } from '@/api/users';
import useAuthStore from '@/store/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { User, UserBranch, Branch } from '@/types';

interface NewUser {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  branchIds?: string[];
}

function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t, language, setLanguage } = useLanguage();
  
  const [siteName, setSiteName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [enableFeatureX, setEnableFeatureX] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // User Management States
  const [activeTab, setActiveTab] = useState<'settings' | 'users'>('settings');
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
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = user?.role === 'admin' || 
                 user?.role === 'Admin' ||
                 (typeof user?.role === 'object' && user?.role.name?.toLowerCase() === 'admin');
  
  // Only log once when user changes
  useEffect(() => {
    if (user) {
      console.log('SettingsPage rendering, user:', user);
      console.log('Is admin check:', { isAdmin, userEmail: user?.email });
    }
  }, [user?.id]);

  useEffect(() => {
    (async () => {
      try {
        const data = await settingsService.get();
        setSiteName(data.siteName || '');
        setSupportEmail(data.supportEmail || '');
        setItemsPerPage(data.itemsPerPage || 20);
        setEnableFeatureX(!!data.enableFeatureX);
      } catch (err: any) {
        setError(t('failedToLoadSettings'));
      }
    })();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      loadUsers();
    }
  }, [activeTab, isAdmin]);

  const loadUsers = async () => {
    try {
      // Use actual API call now
      const usersData = await usersService.getAll();
      console.log('Users API response:', usersData);
      
      // Transform API data to match User interface
      const transformedUsers = (usersData?.data || []).map((apiUser: any) => ({
        id: apiUser.id,
        email: apiUser.email,
        username: apiUser.username,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        companyId: apiUser.companyId,
        roleId: apiUser.roleId,
        role: apiUser.role?.name?.toLowerCase() || 'user', // Get role name from role object
        isActive: apiUser.isActive,
        branches: apiUser.branches || []
      }));
      
      console.log('Transformed users:', transformedUsers);
      setUsers(transformedUsers);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setUsers([]);
      setUserError(err?.response?.data?.message || 'فشل في تحميل المستخدمين');
    }
  };

  const validate = () => {
    if (supportEmail && !/^[^@\s]+@[^\s@]+\.[^@\s]+$/.test(supportEmail)) {
      setError(t('invalidEmail'));
      return false;
    }
    if (!Number.isInteger(itemsPerPage) || itemsPerPage < 1) {
      setError(t('invalidItemsPerPage'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      await settingsService.update({ siteName, supportEmail, itemsPerPage, enableFeatureX });
    } catch (err: any) {
      setError(err?.response?.data?.message || t('failedToSaveSettings'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const validateNewUser = () => {
    if (!newUser.email || !newUser.username || !newUser.password) {
      setUserError('جميع الحقول مطلوبة');
      return false;
    }
    if (!/^[^@\s]+@[^\s@]+\.[^@\s]+$/.test(newUser.email)) {
      setUserError('البريد الإلكتروني غير صالح');
      return false;
    }
    return true;
  };

  const handleCreateUser = async () => {
    if (!validateNewUser()) return;
    setUserLoading(true);
    setUserError(null);
    
    try {
      // Convert NewUser to CreateUserDto format - use actual role IDs from database
      const createUserData = {
        email: newUser.email,
        username: newUser.username,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        roleId: newUser.role === 'admin' ? 'cmlnkm5020001js0q8zzq7z2w' : 
                 newUser.role === 'manager' ? 'cmlnye1k40000sgcc4mlfh78w' : 
                 'cmlnye1ke0001sgccjr2f6omy', // Use actual role IDs from database
      };
      
      console.log('Creating user with data:', createUserData);
      await usersService.create(createUserData);
      
      // Reset form
      setNewUser({
        email: '',
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user',
        branchIds: []
      });
      setShowAddUserModal(false);
      
      // Reload users list
      loadUsers();
    } catch (err: any) {
      setUserError(err?.response?.data?.message || 'فشل في إنشاء المستخدم');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      await usersService.delete(userId);
      loadUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل في حذف المستخدم');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await usersService.deactivate(userId);
      loadUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل في تعطيل المستخدم');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await usersService.activate(userId);
      loadUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل في تفعيل المستخدم');
    }
  };

  const getRoleDisplay = (role?: string | { name: string }) => {
    if (!role) return 'غير محدد';
    
    const roleName = typeof role === 'string' ? role : role.name;
    
    switch (roleName.toLowerCase()) {
      case 'admin': return 'مدير النظام';
      case 'manager': return 'مدير';
      case 'user': return 'مستخدم';
      default: return roleName;
    }
  };

  const getStatusDisplay = (isActive?: boolean) => {
    return isActive ? 'نشط' : 'غير نشط';
  };

  const getStatusColor = (isActive?: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Layout title={t('settings')}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow p-2">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              الإعدادات العامة
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                إدارة المستخدمين
              </button>
            )}
          </div>
        </div>

        {activeTab === 'settings' && (
          <>
            {/* Application Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">{t('applicationSettings')}</h2>
              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
              <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t('siteName')}
                  </label>
                  <input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t('supportEmail')}
                  </label>
                  <input
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t('itemsPerPage')}
                  </label>
                  <input
                    type="number"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value || '0', 10))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featureX"
                    checked={enableFeatureX}
                    onChange={(e) => setEnableFeatureX(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="featureX" className="mr-2 text-sm font-medium text-gray-900">
                    {t('enableFeatureX')}
                  </label>
                </div>
                <div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? t('saving') : t('save')}
                  </button>
                </div>
              </div>
            </div>

            
            {/* Language Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">إعدادات اللغة</h2>
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  اختر اللغة
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">إدارة المستخدمين</h2>
              <div className="space-y-4">
                <p className="text-gray-600">يمكنك الاطلاع على قائمة المستخدمين من خلال صفحة إدارة المستخدمين. إنشاء/حذف المستخدمين متاح فقط للمسؤول.</p>
                <button
                  onClick={() => navigate('/users')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  الذهاب إلى إدارة المستخدمين
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && isAdmin && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                إضافة مستخدم جديد
              </button>
            </div>

            {userError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {userError}
              </div>
            )}

            {/* Users List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم الكامل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users && users.length > 0 && users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.firstName} {userItem.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {getRoleDisplay(userItem.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(userItem.isActive)}`}>
                          {getStatusDisplay(userItem.isActive)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeactivateUser(userItem.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            تعطيل
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Current user row */}
                  {user && (
                    <tr key={user.id} className="hover:bg-gray-50 bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {getRoleDisplay(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                          {getStatusDisplay(user.isActive)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <span className="text-gray-400">مدير النظام</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة مستخدم جديد</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المستخدم
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="كلمة المرور"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="الاسم الأول"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العائلة
                  </label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="اسم العائلة"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'manager' | 'user' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
                  >
                    <option value="user">مستخدم عادي</option>
                    <option value="manager">مدير</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={userLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {userLoading ? 'جاري الإنشاء...' : 'إنشاء مستخدم'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SettingsPage;

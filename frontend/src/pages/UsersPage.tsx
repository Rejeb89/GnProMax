import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import usersService from '@/api/users';
import useAuthStore from '@/store/authStore';
import { User, Branch } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Building } from '@/lib/icons';

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
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
  const isAdmin = user?.role === 'admin' || 
                 user?.role === 'Admin' ||
                 (typeof user?.role === 'object' && user?.role.name?.toLowerCase() === 'admin');

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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      email: user.email,
      username: user.username,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: typeof user.role === 'string' ? user.role as 'admin' | 'manager' | 'user' : 
            (user.role as any)?.name?.toLowerCase() || 'user',
      branchIds: user.branches?.map(ub => ub.branchId) || []
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      setLoading(true);
      await usersService.update(editingUser.id, {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        branchIds: newUser.branchIds,
      });
      setShowEditUserModal(false);
      setEditingUser(null);
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
      setError(err.message || 'فشل في تحديث المستخدم');
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
          {isAdmin && (
            <Button onClick={() => setShowAddUserModal(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              إضافة مستخدم جديد
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              <span className="truncate">قائمة المستخدمين</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-500">لا يوجد مستخدمون</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الاسم</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">اسم المستخدم</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الدور</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الفروع</TableHead>
                      {isAdmin && (
                        <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <span className="block sm:hidden">{user.firstName} {user.lastName}</span>
                          <span className="hidden sm:block">{user.firstName} {user.lastName}</span>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <span className="block truncate max-w-[120px] sm:max-w-none">{user.email}</span>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{user.username}</TableCell>
                        <TableCell>
                          <Badge variant={
                            (typeof user.role === 'string' ? user.role : (user.role as any)?.name) === 'admin' ? 'destructive' :
                            (typeof user.role === 'string' ? user.role : (user.role as any)?.name) === 'manager' ? 'secondary' :
                            'default'
                          } className="text-xs">
                            {(typeof user.role === 'string' ? user.role : (user.role as any)?.name) === 'admin' ? 'مدير' :
                             (typeof user.role === 'string' ? user.role : (user.role as any)?.name) === 'manager' ? 'مدير فرعي' : 'مستخدم'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <span className="block truncate max-w-[100px] sm:max-w-none">
                            {user.branches?.map(userBranch => userBranch.branch?.name).filter(Boolean).join(', ') || '-'}
                          </span>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="text-xs h-8 px-2"
                              >
                                <Edit className="h-3 w-3" />
                                <span className="hidden sm:inline mr-1">تعديل</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-xs h-8 px-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="hidden sm:inline mr-1">حذف</span>
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add User Modal */}
        <Dialog open={showAddUserModal && isAdmin} onOpenChange={setShowAddUserModal}>
          <DialogContent className="sm:max-w-md max-w-[95vw]">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">إضافة مستخدم جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">الاسم الأخير</Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm">الدور</Label>
                <Select value={newUser.role} onValueChange={(value: 'admin' | 'manager' | 'user') => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue className="text-sm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user" className="text-sm">مستخدم</SelectItem>
                    <SelectItem value="manager" className="text-sm">مدير فرعي</SelectItem>
                    <SelectItem value="admin" className="text-sm">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {branches.length > 0 && (
                <div>
                  <Label className="mb-2 block text-sm">الفروع</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {branches.map((branch) => (
                      <div key={branch.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`branch-${branch.id}`}
                          checked={newUser.branchIds?.includes(branch.id) || false}
                          onCheckedChange={() => handleBranchToggle(branch.id)}
                        />
                        <Label htmlFor={`branch-${branch.id}`} className="text-sm flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{branch.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddUserModal(false)} className="w-full sm:w-auto">
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'جاري الإنشاء...' : 'إنشاء'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={showEditUserModal && isAdmin && !!editingUser} onOpenChange={(open) => {
          if (!open) {
            setShowEditUserModal(false);
            setEditingUser(null);
            setNewUser({
              email: '',
              username: '',
              password: '',
              firstName: '',
              lastName: '',
              role: 'user',
              branchIds: []
            });
          }
        }}>
          <DialogContent className="sm:max-w-md max-w-[95vw]">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">تعديل مستخدم</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName" className="text-sm">الاسم الأول</Label>
                  <Input
                    id="edit-firstName"
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-lastName" className="text-sm">الاسم الأخير</Label>
                  <Input
                    id="edit-lastName"
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  required
                  value={newUser.email}
                  disabled
                  className="bg-gray-100 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-sm">اسم المستخدم</Label>
                <Input
                  id="edit-username"
                  type="text"
                  required
                  value={newUser.username}
                  disabled
                  className="bg-gray-100 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-sm">كلمة المرور (اتركها فارغة للحفاظ على الحالية)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-sm">الدور</Label>
                <Select value={newUser.role} onValueChange={(value: 'admin' | 'manager' | 'user') => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue className="text-sm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user" className="text-sm">مستخدم</SelectItem>
                    <SelectItem value="manager" className="text-sm">مدير فرعي</SelectItem>
                    <SelectItem value="admin" className="text-sm">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {branches.length > 0 && (
                <div>
                  <Label className="mb-2 block text-sm">الفروع</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {branches.map((branch) => (
                      <div key={branch.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`edit-branch-${branch.id}`}
                          checked={newUser.branchIds?.includes(branch.id) || false}
                          onCheckedChange={() => handleBranchToggle(branch.id)}
                        />
                        <Label htmlFor={`edit-branch-${branch.id}`} className="text-sm flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{branch.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                  setNewUser({
                    email: '',
                    username: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    role: 'user',
                    branchIds: []
                  });
                }} className="w-full sm:w-auto">
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'جاري التحديث...' : 'تحديث'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default UsersPage;

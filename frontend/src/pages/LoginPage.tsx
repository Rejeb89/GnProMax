import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/api/auth';
import useAuthStore from '@/store/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Mail, Lock, UserPlus } from '@/lib/icons';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken, setRefreshToken } = useAuthStore();
  const { t, language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData.email.trim(), formData.password.trim());
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('invalidEmailOrPassword'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-3xl font-bold text-gray-900">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="hidden sm:inline">نظام إدارة الوحدات الجهوية للحرس الوطني</span>
              <span className="sm:hidden">نظام إدارة الحرس</span>
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">تخطيط موارد المؤسسة</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('email')}
                    required
                    className="text-right pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('password')}
                    required
                    className="text-right pl-10 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-sm"
              >
                {loading ? t('saving') : t('loginButton')}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                ليس لديك حساب؟{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 justify-center">
                  <UserPlus className="h-4 w-4" />
                  {t('registerButton')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

};

export default LoginPage;

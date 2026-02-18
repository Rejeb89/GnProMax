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
import { Shield, Mail, Lock, User, Building, LogIn } from '@/lib/icons';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken, setRefreshToken } = useAuthStore();
  const { t, language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
  });
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
      const response = await authService.register(formData);
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('registrationFailed'));
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
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">{t('registerYourCompany')}</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t('email')}
                    value={formData.email}
                    onChange={handleChange}
                    className="text-right pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm">{t('username')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder={t('username')}
                    value={formData.username}
                    onChange={handleChange}
                    className="text-right pl-10 text-sm"
                    required
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
                    placeholder={t('password')}
                    value={formData.password}
                    onChange={handleChange}
                    className="text-right pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">{t('firstName')}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder={t('firstName')}
                    value={formData.firstName}
                    onChange={handleChange}
                    className="text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">{t('lastName')}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder={t('lastName')}
                    value={formData.lastName}
                    onChange={handleChange}
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm">{t('companyName')}</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    type="text"
                    name="companyName"
                    placeholder={t('companyName')}
                    value={formData.companyName}
                    onChange={handleChange}
                    className="text-right pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-4 text-sm"
              >
                {loading ? t('registering') : t('registerButton')}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                {t('alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 justify-center">
                  <LogIn className="h-4 w-4" />
                  {t('loginButton')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

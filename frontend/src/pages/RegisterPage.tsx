import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/auth';
import useAuthStore from '@/store/authStore';
import { useLanguage } from '@/i18n/LanguageContext';

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-600">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex-1 text-center">نظام إدارة الوحدات الجهوية للحرس الوطني</h1>
          </div>
          <p className="text-center text-gray-600 mb-8">{t('registerYourCompany')}</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              name="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              required
            />
            <input
              type="text"
              name="username"
              placeholder={t('username')}
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              required
            />
            <input
              type="password"
              name="password"
              placeholder={t('password')}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              required
            />
            <input
              type="text"
              name="firstName"
              placeholder={t('firstName')}
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder={t('lastName')}
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              required
            />
            <input
              type="text"
              name="companyName"
              placeholder={t('companyName')}
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 mt-4"
            >
              {loading ? t('registering') : t('registerButton')}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            {t('alreadyHaveAccount')}{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              {t('loginButton')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

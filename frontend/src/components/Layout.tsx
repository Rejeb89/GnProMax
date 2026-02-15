import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { useLanguage } from '@/i18n/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t, isRTL } = useLanguage();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">نظام ERP</h1>
        </div>
        <nav className="mt-6">
          <a onClick={() => navigate('/dashboard')} className="block px-6 py-3 hover:bg-gray-800 cursor-pointer">
            {t('dashboard')}
          </a>
          <a onClick={() => navigate('/employees')} className="block px-6 py-3 hover:bg-gray-800 cursor-pointer">
            {t('employees')}
          </a>
          <a onClick={() => navigate('/vehicles')} className="block px-6 py-3 hover:bg-gray-800 cursor-pointer">
            {t('vehicles')}
          </a>
          <a onClick={() => navigate('/equipment')} className="block px-6 py-3 hover:bg-gray-800 cursor-pointer">
            {t('equipment')}
          </a>
          <a onClick={() => navigate('/finance')} className="block px-6 py-3 hover:bg-gray-800 cursor-pointer">
            {t('finance')}
          </a>
          <a onClick={() => navigate('/settings')} className="block px-6 py-3 hover:bg-gray-800 cursor-pointer">
            {t('settings')}
          </a>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="text-sm">
            <p className="font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{title || t('dashboard')}</h2>
              <div>
                <button onClick={() => navigate('/settings')} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {t('settings')}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

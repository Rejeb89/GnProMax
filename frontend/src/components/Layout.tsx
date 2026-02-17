import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { useLanguage } from '@/i18n/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t, isRTL } = useLanguage();
  const location = useLocation();
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);
  const userPopoverRef = useRef<HTMLDivElement | null>(null);
  const userButtonRef = useRef<HTMLButtonElement | null>(null);
  const [userPopoverStyle, setUserPopoverStyle] = useState<React.CSSProperties>({});
  
  // Check if we're on equipment details page
  const isEquipmentDetailsPage = location.pathname.startsWith('/equipment/') && location.pathname !== '/equipment';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userPopoverRef.current) return;
      if (!userPopoverRef.current.contains(event.target as Node)) {
        setIsUserPopoverOpen(false);
      }
    };

    if (isUserPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserPopoverOpen]);

  useEffect(() => {
    if (!isUserPopoverOpen) return;
    if (!userButtonRef.current) return;

    const updatePosition = () => {
      const rect = userButtonRef.current!.getBoundingClientRect();
      const popoverWidth = 288; // w-72
      const margin = 12;

      const desiredLeft = rect.right - popoverWidth;
      const clampedLeft = Math.min(
        Math.max(desiredLeft, margin),
        window.innerWidth - popoverWidth - margin,
      );

      setUserPopoverStyle({
        top: rect.bottom + 8,
        left: clampedLeft,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isUserPopoverOpen]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    setIsUserPopoverOpen(false);
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-center">نظام إدارة الوحدات الجهوية للحرس الوطني</h1>
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
          <a onClick={() => navigate('/equipment')} className={`block px-6 py-3 hover:bg-gray-800 cursor-pointer ${isEquipmentDetailsPage ? 'bg-gray-800' : ''}`}>
            {t('equipment')}
          </a>
          <a onClick={() => navigate('/finance')} className="block px-6 py-3 hover:bg-gray-800 cursor-pointer">
            {t('finance')}
          </a>
          <a onClick={() => navigate('/settings')} className="block px-6 py-3 hover:bg-gray-800 cursor-pointer">
            {t('settings')}
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex-1 text-center">{title || t('dashboard')}</h2>

              <div className="relative" ref={userPopoverRef}>
                <button
                  type="button"
                  ref={userButtonRef}
                  onClick={() => setIsUserPopoverOpen((v) => !v)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  aria-label="Current user"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-700"
                  >
                    <path
                      d="M20 21a8 8 0 10-16 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 13a4 4 0 100-8 4 4 0 000 8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isUserPopoverOpen && (
                  <div
                    className="fixed w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                    style={userPopoverStyle}
                  >
                    <div className="space-y-2">
                      <div className="text-sm text-gray-900 font-semibold">
                        {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}
                      </div>
                      <div className="text-sm text-gray-700">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.username}</div>
                      <div className="text-xs text-gray-500">{(user.role || '').toString()}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center"
                        aria-label={t('logout')}
                        title={t('logout')}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-red-700"
                        >
                          <path
                            d="M10 17l-1 0c-1.1046 0-2-.8954-2-2V9c0-1.1046.8954-2 2-2h1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 7l4 5-4 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18 12H10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
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

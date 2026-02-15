import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">ERP</h1>
        </div>
        <nav className="mt-6">
          <a href="/dashboard" className="block px-6 py-3 hover:bg-gray-800">
            Dashboard
          </a>
          <a href="/employees" className="block px-6 py-3 hover:bg-gray-800">
            Employees
          </a>
          <a href="/vehicles" className="block px-6 py-3 hover:bg-gray-800">
            Vehicles
          </a>
          <a href="/equipment" className="block px-6 py-3 hover:bg-gray-800">
            Equipment
          </a>
          <a href="/finance" className="block px-6 py-3 hover:bg-gray-800">
            Finance
          </a>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="text-sm mb-4">
            <p className="font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">{title || 'Dashboard'}</h2>
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

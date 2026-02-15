import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import SettingsPage from '@/pages/SettingsPage';
import EmployeesPage from '@/pages/EmployeesPage';
import VehiclesPage from '@/pages/VehiclesPage';
import EquipmentPage from '@/pages/EquipmentPage';
import AddEquipmentPage from '@/pages/AddEquipmentPage';
import FinancePage from '@/pages/FinancePage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import useAuthStore from '@/store/authStore';
import { authService } from '@/api/auth';

function AppContent() {
  const { isRTL } = useLanguage();
  const { token, user, setUser, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []); // Remove initializeAuth from dependencies to prevent infinite loop

  // Restore user on app load if token exists but no user data
  useEffect(() => {
    const restoreUser = async () => {
      if (token && !user) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response);
        } catch (error) {
          console.error('Failed to restore user:', error);
          logout();
        }
      }
    };

    restoreUser();
  }, [token, user, setUser, logout]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/employees"
          element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>}
        />
        <Route
          path="/vehicles"
          element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>}
        />
        <Route
          path="/equipment"
          element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>}
        />
        <Route
          path="/equipment/add"
          element={<ProtectedRoute><AddEquipmentPage /></ProtectedRoute>}
        />
        <Route
          path="/finance"
          element={<ProtectedRoute><FinancePage /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;

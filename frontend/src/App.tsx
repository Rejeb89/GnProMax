import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import EmployeesPage from '@/pages/EmployeesPage';
import VehiclesPage from '@/pages/VehiclesPage';
import EquipmentPage from '@/pages/EquipmentPage';
import FinancePage from '@/pages/FinancePage';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
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
          path="/finance"
          element={<ProtectedRoute><FinancePage /></ProtectedRoute>}
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

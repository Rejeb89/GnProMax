import React, { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token, initializeAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize auth state on component mount
    initializeAuth();
    // Set a small delay to ensure auth state is properly initialized
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Remove initializeAuth from dependencies to prevent infinite loop

  // Memoize the authentication check to prevent re-renders
  const isAuthorized = useMemo(() => {
    return isAuthenticated || token || localStorage.getItem('token');
  }, [isAuthenticated, token]);

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

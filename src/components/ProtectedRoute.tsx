import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User['role'];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center recipe-detail-loading"
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>
            You don't have permission to access this page.{' '}
            {requiredRole === 'admin' ? 'Admin' : 'User'} role required.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

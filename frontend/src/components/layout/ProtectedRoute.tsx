import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppStore((state: any) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RoleBoundary = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
  const user = useAppStore((state: any) => state.user);

  if (!user) return null;
  
  if (user.role === 'Super Admin') {
    return <>{children}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-status-critical/10 border border-status-critical/20 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-status-critical mb-2">Access Denied</h2>
          <p className="text-sm text-on-surface-variant">Your current role ({user.role}) does not have permission to view this section.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

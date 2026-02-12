
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-night-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/" state={{ from: location }} replace />;
    return children;
};
  
export const RequireSuperAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-night-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
            </div>
        );
    }

    if (user?.role !== 'SUPER_ADMIN') return <Navigate to="/tenant/browse" replace />;
    return children;
};

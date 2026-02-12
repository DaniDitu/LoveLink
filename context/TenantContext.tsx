
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Tenant } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../services/db';

interface TenantContextType {
  currentTenant: Tenant | null;
  setTenantById: (id: string) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const { user, isLoading: authLoading } = useAuth(); // Wait for Auth (and DB) init
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tenants on load - only after Auth/DB is ready
  useEffect(() => {
    if (authLoading) return;

    const fetchTenants = async () => {
        setIsLoading(true);
        try {
            let res = await db.getAllTenants();

            // Fallback for default tenant if DB is empty or restricted
            // We do NOT attempt to write to DB here anymore as rules forbid it for standard users.
            const defaultTenantId = 'default-tenant';
            let defaultTenant = res.find(t => t.id === defaultTenantId);

            if (!defaultTenant) {
                defaultTenant = {
                    id: defaultTenantId,
                    name: 'App Principale',
                    domain: 'app.lovelink.com',
                    status: 'ACTIVE',
                    subscriptionPlan: 'ENTERPRISE',
                    primaryColor: 'rose',
                    userCount: 0,
                    mrr: 0,
                    chatSettings: { maxConsecutiveMessages: 2, womenCanMessageFreely: true }
                };
                // Just use in memory, do not save to DB
                res.push(defaultTenant);
            }

            setTenants(res);
        } catch (e) {
            console.error("Failed to load tenants", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchTenants();
  }, [authLoading, user]);

  // Bind tenant based on User
  useEffect(() => {
    // If tenants are loaded and we have a user
    if (!isLoading && tenants.length > 0 && user) {
        if (user.role === 'SUPER_ADMIN') {
            setCurrentTenant(null);
        } else if (user.tenantId) {
            // Find the specific tenant for this user
            const t = tenants.find(t => t.id === user.tenantId);
            if (t) {
                setCurrentTenant(t);
            } else {
                console.warn(`User ${user.uid} belongs to non-existent tenant: ${user.tenantId}`);
            }
        }
    }
  }, [user, tenants, isLoading]);

  const setTenantById = (id: string) => {
    const t = tenants.find(t => t.id === id);
    if (t) setCurrentTenant(t);
  };

  return (
    <TenantContext.Provider value={{ currentTenant, setTenantById, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
      return { 
          currentTenant: null, 
          setTenantById: () => {}, 
          isLoading: false 
      };
  }
  return context;
};

import { Tenant, AuditLog } from '../types';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'default-tenant',
    name: 'App Principale',
    domain: 'app.lovescale.com',
    status: 'ACTIVE',
    subscriptionPlan: 'ENTERPRISE',
    primaryColor: 'rose',
    userCount: 1,
    mrr: 0,
    chatSettings: {
      maxConsecutiveMessages: 2,
      womenCanMessageFreely: true
    }
  }
];

export const MOCK_LOGS: AuditLog[] = [
  { id: 'l1', tenantId: 'SYSTEM', action: 'LOGIN', details: 'Accesso effettuato da SuperAdmin', timestamp: new Date().toISOString() },
];
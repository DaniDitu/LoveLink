
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { ThemeProvider } from './context/ThemeContext';
import { DialogProvider } from './context/DialogContext';

import SuperAdminDashboard from './pages/superadmin/Dashboard';
import UserManagement from './pages/superadmin/UserManagement';
import TenantManagement from './pages/superadmin/TenantManagement';
import LandingEditor from './pages/superadmin/LandingEditor';
import SystemMessages from './pages/superadmin/SystemMessages';
import InsertionManagement from './pages/superadmin/InsertionManagement';
import Browse from './pages/tenant/Browse';
import Profile from './pages/tenant/Profile';
import Messages from './pages/tenant/Messages';
import LikesReceived from './pages/tenant/LikesReceived';
import MyLikes from './pages/tenant/MyLikes';
import MyMatches from './pages/tenant/MyMatches';
import InstallApp from './pages/tenant/InstallApp'; // NEW IMPORT
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { TermsPage } from './pages/legal/TermsPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { Layout } from './components/Layout';
import { RequireAuth, RequireSuperAdmin } from './components/ProtectedRoute';

// Helper component to scope TenantProvider to specific routes
const TenantScope = () => (
  <TenantProvider>
    <Outlet />
  </TenantProvider>
);

// React Query & Persistence
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// --- CONFIGURAZIONE CACHE ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minuti di validità cache (RIDUZIONE LETTURE)
      gcTime: 1000 * 60 * 60 * 24, // 24 ore di garbage collection
      refetchOnWindowFocus: false, // Disabilita refetch al cambio tab/focus
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const App: React.FC = () => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <AuthProvider>
        <ThemeProvider>
          <DialogProvider>
            <Router>
              <Routes>
                {/* PUBLIC ROUTE - No TenantProvider needed */}
                <Route path="/" element={<Layout><LandingPage /></Layout>} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />

                {/* PROTECTED ROUTES - Wrapped in TenantProvider */}
                <Route element={<TenantScope />}>

                  {/* SUPER ADMIN ROUTES */}
                  <Route path="/superadmin" element={
                    <RequireAuth>
                      <RequireSuperAdmin>
                        <Layout><SuperAdminDashboard /></Layout>
                      </RequireSuperAdmin>
                    </RequireAuth>
                  } />

                  <Route path="/superadmin/users" element={
                    <RequireAuth>
                      <RequireSuperAdmin>
                        <Layout><UserManagement /></Layout>
                      </RequireSuperAdmin>
                    </RequireAuth>
                  } />

                  <Route path="/superadmin/tenants" element={
                    <RequireAuth>
                      <RequireSuperAdmin>
                        <Layout><TenantManagement /></Layout>
                      </RequireSuperAdmin>
                    </RequireAuth>
                  } />

                  <Route path="/superadmin/insertions" element={
                    <RequireAuth>
                      <RequireSuperAdmin>
                        <Layout><InsertionManagement /></Layout>
                      </RequireSuperAdmin>
                    </RequireAuth>
                  } />

                  <Route path="/superadmin/messages" element={
                    <RequireAuth>
                      <RequireSuperAdmin>
                        <Layout><SystemMessages /></Layout>
                      </RequireSuperAdmin>
                    </RequireAuth>
                  } />

                  <Route path="/superadmin/landing-editor" element={
                    <RequireAuth>
                      <RequireSuperAdmin>
                        <Layout><LandingEditor /></Layout>
                      </RequireSuperAdmin>
                    </RequireAuth>
                  } />

                  {/* TENANT / USER ROUTES */}
                  <Route path="/tenant/browse" element={
                    <RequireAuth>
                      <Layout><Browse /></Layout>
                    </RequireAuth>
                  } />
                  <Route path="/tenant/profile" element={
                    <RequireAuth>
                      <Layout><Profile /></Layout>
                    </RequireAuth>
                  } />
                  <Route path="/tenant/messages" element={
                    <RequireAuth>
                      <Layout><Messages /></Layout>
                    </RequireAuth>
                  } />
                  <Route path="/tenant/likes-received" element={
                    <RequireAuth>
                      <Layout><LikesReceived /></Layout>
                    </RequireAuth>
                  } />
                  <Route path="/tenant/my-likes" element={
                    <RequireAuth>
                      <Layout><MyLikes /></Layout>
                    </RequireAuth>
                  } />
                  <Route path="/tenant/my-matches" element={
                    <RequireAuth>
                      <Layout><MyMatches /></Layout>
                    </RequireAuth>
                  } />
                  <Route path="/tenant/install" element={
                    <RequireAuth>
                      <Layout><InstallApp /></Layout>
                    </RequireAuth>
                  } />

                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </Router>
          </DialogProvider>
        </ThemeProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
};

export default App;

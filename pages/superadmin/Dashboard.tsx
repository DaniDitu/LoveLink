
import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, ShieldAlert, Activity, ArrowUpRight, Heart, Layout as LayoutIcon } from 'lucide-react';
import { MOCK_TENANTS, MOCK_LOGS } from '../../services/mockStore';
import { db } from '../../services/db';
import { Link } from 'react-router-dom';
import { Insertion } from '../../types';

const SuperAdminDashboard: React.FC = () => {
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [insertions, setInsertions] = useState<Insertion[]>([]);
  const totalMRR = MOCK_TENANTS.reduce((acc, t) => acc + t.mrr, 0);
  const totalUsers = MOCK_TENANTS.reduce((acc, t) => acc + t.userCount, 0);

  useEffect(() => {
    const fetchStats = async () => {
      const [reps, ads] = await Promise.all([
          db.getReports('PENDING'),
          db.getInsertions()
      ]);
      setPendingReportsCount(reps.length);
      setInsertions(ads);
    };
    fetchStats();
  }, []);

  const totalSponsorLikes = insertions.reduce((acc, ad) => acc + (ad.likedUserIds?.length || 0), 0);

  return (
    <div className="p-8 bg-slate-50 dark:bg-night-950 min-h-screen text-slate-900 dark:text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Panoramica Control Plane</h1>
        <p className="text-slate-500 dark:text-night-200">Sistema di Gestione SaaS Globale</p>
      </header>

      {/* Alert Section */}
      {pendingReportsCount > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-xl p-4 mb-8 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-full text-orange-600 dark:text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-orange-800 dark:text-orange-300">Attenzione Richiesta</h3>
              <p className="text-sm text-orange-700 dark:text-orange-200">Ci sono {pendingReportsCount} segnalazioni utente in attesa di revisione.</p>
            </div>
          </div>
          <Link to="/superadmin/users" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors">
            Gestisci Segnalazioni
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-night-200">MRR Totale</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">€{totalMRR.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center mt-3 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" /> +12% vs mese scorso
          </span>
        </div>

        <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-night-200">Tenant Attivi</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{MOCK_TENANTS.filter(t => t.status === 'ACTIVE').length}</h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-night-200">Utenti Finali Totali</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totalUsers.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-night-200">Like Sponsor Totali</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totalSponsorLikes}</h3>
            </div>
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-night-200">Avvisi di Sistema</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">3</h3>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tenants & Ad Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Tenants Table */}
        <div className="xl:col-span-2 bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-night-700 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Elenco Tenant</h3>
            <Link to="/superadmin/tenants" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Vedi Tutti</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-night-900 text-slate-500 dark:text-night-200">
                <tr>
                    <th className="px-6 py-3 font-medium">Nome</th>
                    <th className="px-6 py-3 font-medium">Stato</th>
                    <th className="px-6 py-3 font-medium">Piano</th>
                    <th className="px-6 py-3 font-medium text-right">Entrate</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-night-700">
                {MOCK_TENANTS.map(tenant => (
                    <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-night-700">
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{tenant.name}</div>
                        <div className="text-slate-500 dark:text-night-200 text-xs">{tenant.domain}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {tenant.status === 'ACTIVE' ? 'ATTIVO' : tenant.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-night-200">{tenant.subscriptionPlan}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">€{tenant.mrr}</td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>

        {/* Sponsor Performance Report */}
        <div className="bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-night-700 flex justify-between items-center">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutIcon className="w-5 h-5 text-indigo-500" /> Performance Sponsor
                </h3>
                <Link to="/superadmin/insertions" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Gestisci</Link>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px]">
                {insertions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Nessuna inserzione attiva.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-night-900 text-slate-500 dark:text-night-200 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 font-medium">Sponsor</th>
                                <th className="px-4 py-2 font-medium text-center">Like</th>
                                <th className="px-4 py-2 font-medium text-right">Stato</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-night-700">
                            {insertions.sort((a,b) => (b.likedUserIds?.length || 0) - (a.likedUserIds?.length || 0)).map(ad => (
                                <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-night-700">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-800 dark:text-white truncate max-w-[120px]" title={ad.title}>{ad.title}</div>
                                        <div className="text-[10px] text-slate-400">{ad.tenantId === 'GLOBAL' ? 'Global' : 'Local'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="inline-flex items-center gap-1 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-full font-bold text-xs">
                                            <Heart className="w-3 h-3 fill-current" /> {ad.likedUserIds?.length || 0}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className={`text-[10px] font-bold ${ad.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                                            {ad.isActive ? 'ATTIVO' : 'PAUSA'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {/* Audit Logs */}
        <div className="xl:col-span-3 bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-night-700">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Registro Audit in Tempo Reale</h3>
          </div>
          <div className="p-0">
            {MOCK_LOGS.map(log => (
              <div key={log.id} className="p-4 border-b border-slate-50 dark:border-night-700 flex items-start space-x-3 last:border-0">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-900 dark:text-white font-medium">{log.action}</p>
                  <p className="text-xs text-slate-500 dark:text-night-200">{log.details}</p>
                  <p className="text-xs text-slate-400 dark:text-night-600 mt-1">{log.tenantId} • {new Date(log.timestamp).toLocaleTimeString('it-IT')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

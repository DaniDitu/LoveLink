import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Report, User } from '../../types';

interface ReportsListProps {
    reports: Report[];
    users: User[];
    onOpenWarning: (report: Report) => void;
    onSuspend: (uid: string) => void;
    onResolve: (id: string, action: 'RESOLVED' | 'DISMISSED') => void;
}

export const ReportsList: React.FC<ReportsListProps> = ({ reports, users, onOpenWarning, onSuspend, onResolve }) => {
    if (reports.length === 0) return null;

    return (
        <div className="mb-10 animate-in slide-in-from-top-4 fade-in">
            <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Segnalazioni Pendenti ({reports.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map(report => {
                    const reporter = users.find(u => u.uid === report.reporterId);
                    return (
                      <div key={report.id} className="bg-white dark:bg-night-800 p-5 rounded-xl border border-orange-200 dark:border-orange-900 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                          <div className="mb-3">
                              <div className="text-sm text-slate-500 dark:text-night-200 mb-1">
                                  <span className="font-bold text-slate-700 dark:text-white">Contro:</span> {report.targetUserName}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-night-200">
                                  <span className="font-bold text-slate-700 dark:text-white">Da:</span> {reporter ? reporter.displayName : report.reporterId}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">{new Date(report.timestamp).toLocaleDateString()}</div>
                          </div>
                          
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-sm text-orange-900 dark:text-orange-200 mb-4 italic">
                              "{report.reason}"
                          </div>
                          <div className="flex gap-2">
                              <button 
                                  onClick={() => onOpenWarning(report)}
                                  className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                  Avvisa
                              </button>
                              <button 
                                  onClick={() => { onSuspend(report.targetUserId); onResolve(report.id, 'RESOLVED'); }}
                                  className="flex-1 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
                              >
                                  Sospendi
                              </button>
                              <button 
                                  onClick={() => onResolve(report.id, 'DISMISSED')}
                                  className="px-3 py-2 bg-white dark:bg-night-700 border border-slate-200 dark:border-night-600 text-slate-600 dark:text-white text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-night-600"
                              >
                                  Ignora
                              </button>
                          </div>
                      </div>
                    );
                })}
            </div>
        </div>
    );
};
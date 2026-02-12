import React from 'react';
import { User, GenderType, Tenant } from '../../types';
import { Users, Search, Filter, Trash2, Edit, Ban, CheckCircle, Database } from 'lucide-react';

interface UserTableProps {
    users: User[];
    tenants?: Tenant[];
    selectedUserIds: Set<string>;
    onToggleSelect: (uid: string) => void;
    onSelectAll: (checked: boolean) => void;
    onBulkDelete: () => void;
    onEdit: (user: User) => void;
    onSuspend: (uid: string, status?: string) => void;
    onBan: (uid: string) => void;
    
    // Filters State & Setters
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    filterGender: GenderType | 'ALL';
    setFilterGender: (g: GenderType | 'ALL') => void;
    filterTenant?: string;
    setFilterTenant?: (t: string) => void;
    filterCity: string;
    setFilterCity: (s: string) => void;
    filterRegion: string;
    setFilterRegion: (s: string) => void;
    filterAgeMin: string;
    setFilterAgeMin: (s: string) => void;
    filterAgeMax: string;
    setFilterAgeMax: (s: string) => void;
    showFilters: boolean;
    setShowFilters: (b: boolean) => void;
}

export const UserTable: React.FC<UserTableProps> = (props) => {
    return (
        <div className="bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 dark:border-night-700">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                        <Users className="w-5 h-5 text-slate-400" />
                        Elenco Utenti
                    </h3>
                    <div className="flex gap-2">
                         <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Cerca nome/email..." 
                              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 w-64"
                              value={props.searchTerm}
                              onChange={(e) => props.setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                          onClick={() => props.setShowFilters(!props.showFilters)}
                          className={`px-3 py-2 border rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${props.showFilters ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-white dark:bg-night-800 border-slate-200 dark:border-night-600 text-slate-600 dark:text-white'}`}
                        >
                            <Filter className="w-4 h-4" /> Filtri
                        </button>
                        {props.selectedUserIds.size > 0 && (
                          <button 
                              onClick={props.onBulkDelete}
                              className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-sm font-bold hover:bg-red-100 flex items-center"
                          >
                              <Trash2 className="w-4 h-4 mr-2" /> Elimina ({props.selectedUserIds.size})
                          </button>
                      )}
                    </div>
                </div>

                {props.showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-slate-100 dark:border-night-700 animate-in slide-in-from-top-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-night-200 mb-1">Genere</label>
                            <select 
                              className="w-full p-2 border border-slate-200 dark:border-night-600 rounded-lg text-sm bg-white dark:bg-night-900 dark:text-white outline-none"
                              value={props.filterGender}
                              onChange={(e) => props.setFilterGender(e.target.value as GenderType | 'ALL')}
                            >
                                <option value="ALL">Tutti</option>
                                <option value="MAN">Uomini</option>
                                <option value="WOMAN">Donne</option>
                                <option value="COUPLE">Coppie</option>
                            </select>
                        </div>
                        {props.setFilterTenant && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-night-200 mb-1">App / Tenant</label>
                                <select 
                                  className="w-full p-2 border border-slate-200 dark:border-night-600 rounded-lg text-sm bg-white dark:bg-night-900 dark:text-white outline-none"
                                  value={props.filterTenant}
                                  onChange={(e) => props.setFilterTenant && props.setFilterTenant(e.target.value)}
                                >
                                    <option value="ALL">Tutte le App</option>
                                    {props.tenants?.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.id === 'default-tenant' ? 'Main Platform' : t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-night-200 mb-1">Età (Min - Max)</label>
                            <div className="flex gap-2">
                                <input 
                                  type="number" placeholder="Min" className="w-full p-2 border border-slate-200 dark:border-night-600 rounded-lg text-sm bg-white dark:bg-night-900 dark:text-white outline-none"
                                  value={props.filterAgeMin} onChange={(e) => props.setFilterAgeMin(e.target.value)}
                                />
                                <input 
                                  type="number" placeholder="Max" className="w-full p-2 border border-slate-200 dark:border-night-600 rounded-lg text-sm bg-white dark:bg-night-900 dark:text-white outline-none"
                                  value={props.filterAgeMax} onChange={(e) => props.setFilterAgeMax(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-night-200 mb-1">Città</label>
                            <input 
                              type="text" placeholder="Es. Milano" className="w-full p-2 border border-slate-200 dark:border-night-600 rounded-lg text-sm bg-white dark:bg-night-900 dark:text-white outline-none"
                              value={props.filterCity} onChange={(e) => props.setFilterCity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-night-200 mb-1">Regione</label>
                            <input 
                              type="text" placeholder="Es. Lombardia" className="w-full p-2 border border-slate-200 dark:border-night-600 rounded-lg text-sm bg-white dark:bg-night-900 dark:text-white outline-none"
                              value={props.filterRegion} onChange={(e) => props.setFilterRegion(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-night-900 text-slate-500 dark:text-night-200">
                <tr>
                  <th className="px-6 py-3 w-10">
                      <input type="checkbox" onChange={(e) => props.onSelectAll(e.target.checked)} />
                  </th>
                  <th className="px-6 py-3 font-medium">Utente</th>
                  <th className="px-6 py-3 font-medium">Demografia</th>
                  <th className="px-6 py-3 font-medium">Località</th>
                  <th className="px-6 py-3 font-medium">Stato</th>
                  <th className="px-6 py-3 font-medium">Iscritto il</th>
                  <th className="px-6 py-3 font-medium text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-night-700">
                {props.users.map(user => {
                  const isDeleted = user.status === 'DELETED';
                  const tenantName = props.tenants?.find(t => t.id === user.tenantId)?.name || user.tenantId;

                  return (
                    <tr key={user.uid} className={`hover:bg-slate-50 dark:hover:bg-night-700 ${user.status === 'SUSPENDED' ? 'bg-red-50/50 dark:bg-red-900/10' : ''} ${isDeleted ? 'opacity-60 bg-gray-50 dark:bg-night-900' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                            type="checkbox" 
                            checked={props.selectedUserIds.has(user.uid)}
                            onChange={() => props.onToggleSelect(user.uid)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            {user.isVerified && (
                                <span title="Verificato">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                </span>
                            )}
                            <div>
                                <div className={`font-medium ${isDeleted ? 'text-slate-500 line-through dark:text-night-600' : 'text-slate-900 dark:text-white'}`}>{user.displayName}</div>
                                <div className="text-slate-500 dark:text-night-200 text-xs">{user.email}</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <Database className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] text-slate-400 dark:text-night-600 font-mono bg-slate-100 dark:bg-night-900 px-1 rounded">
                                        {user.tenantId === 'default-tenant' ? 'System Core' : tenantName}
                                    </span>
                                </div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex flex-col">
                              <span className="font-bold text-slate-700 dark:text-white">{user.age ? `${user.age} anni` : 'N/D'}</span>
                              <span className="text-xs text-slate-500 dark:text-night-200 lowercase bg-slate-100 dark:bg-night-600 px-1.5 py-0.5 rounded w-fit mt-1">
                                  {user.type === 'MAN' ? 'Uomo' : user.type === 'WOMAN' ? 'Donna' : 'Coppia'}
                              </span>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex flex-col">
                               <span className="text-slate-900 dark:text-white font-medium">{user.city || '-'}</span>
                               <span className="text-xs text-slate-500 dark:text-night-200">{user.region || user.location || '-'}</span>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${user.status === 'SUSPENDED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                            user.status === 'BANNED' ? 'bg-gray-800 text-white' : 
                            user.status === 'DELETED' ? 'bg-gray-200 text-gray-500 dark:bg-night-900 dark:text-night-600' : 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                          {user.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-night-200 text-xs">
                          {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                             onClick={() => props.onEdit(user)}
                             className="p-1.5 bg-white dark:bg-night-800 border border-slate-200 dark:border-night-600 rounded-md text-slate-500 dark:text-white hover:text-blue-600 hover:border-blue-200"
                             title="Modifica Dettagli"
                        >
                             <Edit className="w-4 h-4" />
                        </button>
                        
                        {!isDeleted && (
                            <button 
                                onClick={() => props.onSuspend(user.uid, user.status)}
                                className={`p-1.5 rounded-md border transition-colors ${user.status === 'SUSPENDED' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'}`}
                                title={user.status === 'SUSPENDED' ? 'Riattiva' : 'Sospendi'}
                            >
                                {user.status === 'SUSPENDED' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                        )}
  
                        <button 
                            onClick={() => props.onBan(user.uid)}
                            className="p-1.5 bg-white dark:bg-night-800 border border-slate-200 dark:border-night-600 rounded-md text-slate-400 dark:text-night-200 hover:text-red-600 hover:border-red-200 transition-colors"
                            title="Elimina Definitivamente (Hard Delete)"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {props.users.length === 0 && (
                    <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400">Nessun utente trovato con questi filtri.</td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
    );
};
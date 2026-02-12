import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Tenant } from '../../types';
import { Plus, Edit2, Trash2, Globe, Server, CheckCircle2, XCircle, AlertCircle, Lock, Shield, MessageSquare } from 'lucide-react';

interface ActionModalState {
  isOpen: boolean;
  type: 'CONFIRM' | 'ALERT';
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
}

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Partial<Tenant> | null>(null);

  // Custom Modal State
  const [modalState, setModalState] = useState<ActionModalState>({
    isOpen: false,
    type: 'CONFIRM',
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await db.getAllTenants();
      setTenants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    // Validation
    if (!editingTenant.name || !editingTenant.domain) {
        setModalState({
            isOpen: true,
            type: 'ALERT',
            title: 'Campi Mancanti',
            description: 'Nome e Dominio sono obbligatori per creare o modificare un tenant.',
            confirmText: 'Ho Capito',
            isDanger: false,
            onConfirm: () => setModalState(prev => ({...prev, isOpen: false}))
        });
        return;
    }

    const tenantToSave: Tenant = {
      id: editingTenant.id || `tenant-${Date.now()}`,
      name: editingTenant.name,
      domain: editingTenant.domain,
      status: editingTenant.status || 'ACTIVE',
      subscriptionPlan: editingTenant.subscriptionPlan || 'BASIC',
      primaryColor: editingTenant.primaryColor || 'rose',
      userCount: editingTenant.userCount || 0,
      mrr: editingTenant.mrr || 0,
      chatSettings: editingTenant.chatSettings || {
          maxConsecutiveMessages: 2,
          womenCanMessageFreely: true
      }
    };

    await db.saveTenant(tenantToSave);
    setIsModalOpen(false);
    setEditingTenant(null);
    fetchTenants();
  };

  const handleDelete = (id: string) => {
    setModalState({
        isOpen: true,
        type: 'CONFIRM',
        title: 'Elimina Tenant',
        description: "Sei sicuro? Eliminando il tenant potresti rendere orfani gli utenti associati e perdere i dati.",
        confirmText: 'Elimina Definitivamente',
        cancelText: 'Annulla',
        isDanger: true,
        onConfirm: async () => {
            await db.deleteTenant(id);
            fetchTenants();
            setModalState(prev => ({...prev, isOpen: false}));
        }
    });
  };

  const openNew = () => {
    setEditingTenant({ 
        status: 'ACTIVE', 
        subscriptionPlan: 'BASIC', 
        primaryColor: 'rose',
        chatSettings: { maxConsecutiveMessages: 2, womenCanMessageFreely: true }
    });
    setIsModalOpen(true);
  };

  const openEdit = (t: Tenant) => {
    // Ensure nested object exists if editing old data
    const safeTenant = {
        ...t,
        chatSettings: t.chatSettings || { maxConsecutiveMessages: 2, womenCanMessageFreely: true }
    };
    setEditingTenant(safeTenant);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 bg-slate-50 dark:bg-night-950 min-h-screen text-slate-900 dark:text-white relative">
      
      {/* CUSTOM ACTION MODAL */}
      {modalState.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-night-700 transform transition-all animate-in zoom-in-95 duration-200">
                  <div className={`p-6 border-b border-slate-100 dark:border-night-700 flex items-center gap-3 ${modalState.isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-night-900'}`}>
                      <div className={`p-2 rounded-full ${modalState.isDanger ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-200 dark:bg-night-700 text-slate-600 dark:text-white'}`}>
                          {modalState.type === 'ALERT' ? <AlertCircle className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
                      </div>
                      <h3 className={`font-bold text-lg ${modalState.isDanger ? 'text-red-900 dark:text-red-300' : 'text-slate-900 dark:text-white'}`}>
                          {modalState.title}
                      </h3>
                  </div>
                  
                  <div className="p-6">
                      <p className="text-slate-600 dark:text-night-200 text-sm leading-relaxed">
                          {modalState.description}
                      </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-night-900 border-t border-slate-100 dark:border-night-700 flex gap-3">
                      {modalState.type !== 'ALERT' && (
                          <button 
                              onClick={() => setModalState(prev => ({...prev, isOpen: false}))}
                              className="flex-1 py-2.5 bg-white dark:bg-night-800 border border-slate-300 dark:border-night-600 text-slate-700 dark:text-night-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-night-700 transition-colors"
                          >
                              {modalState.cancelText || 'Annulla'}
                          </button>
                      )}
                      <button 
                          onClick={modalState.onConfirm}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${modalState.isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                          {modalState.confirmText || 'Ok'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestione Tenant</h1>
          <p className="text-slate-500 dark:text-night-200">Configura le istanze dell'applicazione e i piani di abbonamento.</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Nuovo Tenant
        </button>
      </div>

      <div className="bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-night-900 text-slate-500 dark:text-night-200">
            <tr>
              <th className="px-6 py-4 font-medium">Nome App</th>
              <th className="px-6 py-4 font-medium">Dominio</th>
              <th className="px-6 py-4 font-medium">Piano</th>
              <th className="px-6 py-4 font-medium">Chat Rules</th>
              <th className="px-6 py-4 font-medium">Stato</th>
              <th className="px-6 py-4 font-medium text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-night-700">
            {tenants.map(t => {
              const isDefault = t.id === 'default-tenant';
              return (
              <tr key={t.id} className={`hover:bg-slate-50 dark:hover:bg-night-700 ${isDefault ? 'bg-slate-50/50 dark:bg-night-700/30' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 dark:text-white">
                          {isDefault ? 'Piattaforma Principale (System)' : t.name}
                      </div>
                      {isDefault && <Shield className="w-3 h-3 text-slate-400" />}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-night-200 font-mono">ID: {t.id}</div>
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                   <Globe className="w-4 h-4 text-slate-400" /> {t.domain}
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border 
                        ${t.subscriptionPlan === 'ENTERPRISE' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' : 
                          t.subscriptionPlan === 'PRO' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-night-900 text-gray-700 dark:text-night-200 border-gray-200 dark:border-night-600'}`}>
                        {t.subscriptionPlan}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col text-xs text-slate-500 dark:text-night-200">
                        <span>Max Msg: <strong>{t.chatSettings?.maxConsecutiveMessages ?? 2}</strong></span>
                        <span>Donne Free: <strong>{t.chatSettings?.womenCanMessageFreely ? 'Sì' : 'No'}</strong></span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    {t.status === 'ACTIVE' ? (
                        <span className="flex items-center text-green-600 dark:text-green-400 text-xs font-bold gap-1"><CheckCircle2 className="w-4 h-4"/> Attivo</span>
                    ) : (
                        <span className="flex items-center text-red-600 dark:text-red-400 text-xs font-bold gap-1"><XCircle className="w-4 h-4"/> Sospeso</span>
                    )}
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(t)} className="p-2 text-slate-500 dark:text-white hover:bg-slate-100 dark:hover:bg-night-600 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        {isDefault ? (
                            <button disabled className="p-2 text-slate-300 dark:text-night-600 cursor-not-allowed rounded-lg" title="Impossibile eliminare il tenant di sistema">
                                <Lock className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={() => handleDelete(t.id)} className="p-2 text-red-400 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {tenants.length === 0 && !loading && (
            <div className="p-10 text-center text-slate-400">Nessun tenant trovato.</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-night-700">
                <div className="p-6 border-b border-slate-100 dark:border-night-700 flex justify-between items-center bg-slate-50 dark:bg-night-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {editingTenant.id ? 'Modifica Tenant' : 'Nuovo Tenant'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)}><XCircle className="w-6 h-6 text-slate-400 dark:text-white hover:text-slate-600" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Nome Applicazione</label>
                        <input 
                            type="text" required 
                            className="w-full border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editingTenant.name || ''}
                            onChange={e => setEditingTenant({...editingTenant, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Dominio</label>
                            <input 
                                type="text" required 
                                className="w-full border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editingTenant.domain || ''}
                                onChange={e => setEditingTenant({...editingTenant, domain: e.target.value})}
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Colore Brand</label>
                             <select 
                                className="w-full border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg p-2.5 outline-none bg-white"
                                value={editingTenant.primaryColor}
                                onChange={e => setEditingTenant({...editingTenant, primaryColor: e.target.value})}
                             >
                                 <option value="rose">Rose (Default)</option>
                                 <option value="violet">Violet</option>
                                 <option value="indigo">Indigo</option>
                                 <option value="blue">Blue</option>
                             </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Piano</label>
                             <select 
                                className="w-full border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg p-2.5 outline-none bg-white"
                                value={editingTenant.subscriptionPlan}
                                onChange={e => setEditingTenant({...editingTenant, subscriptionPlan: e.target.value as any})}
                             >
                                 <option value="BASIC">Basic</option>
                                 <option value="PRO">Pro</option>
                                 <option value="ENTERPRISE">Enterprise</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Stato</label>
                             <select 
                                className="w-full border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg p-2.5 outline-none bg-white"
                                value={editingTenant.status}
                                onChange={e => setEditingTenant({...editingTenant, status: e.target.value as any})}
                             >
                                 <option value="ACTIVE">Attivo</option>
                                 <option value="SUSPENDED">Sospeso</option>
                                 <option value="PENDING">In Attesa</option>
                             </select>
                        </div>
                    </div>

                    {/* Chat Rules Section */}
                    <div className="bg-slate-50 dark:bg-night-900 p-4 rounded-xl border border-slate-200 dark:border-night-600">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Regole Chat</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Max Messaggi Consecutivi</label>
                                <input 
                                    type="number" min="1" max="10"
                                    className="w-full border border-slate-300 dark:border-night-600 dark:bg-night-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingTenant.chatSettings?.maxConsecutiveMessages ?? 2}
                                    onChange={e => setEditingTenant({
                                        ...editingTenant, 
                                        chatSettings: {
                                            ...editingTenant.chatSettings!,
                                            maxConsecutiveMessages: parseInt(e.target.value)
                                        }
                                    })}
                                />
                                <p className="text-[10px] text-slate-400 dark:text-night-200 mt-1">Quanti messaggi prima della risposta.</p>
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white dark:bg-night-800 border border-slate-200 dark:border-night-600 rounded-lg">
                                    <input 
                                        type="checkbox"
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                        checked={editingTenant.chatSettings?.womenCanMessageFreely ?? true}
                                        onChange={e => setEditingTenant({
                                            ...editingTenant,
                                            chatSettings: {
                                                ...editingTenant.chatSettings!,
                                                womenCanMessageFreely: e.target.checked
                                            }
                                        })}
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-white">Donne Illimitate</span>
                                </label>
                                <p className="text-[10px] text-slate-400 dark:text-night-200 mt-1">Se attivo, le donne ignorano il limite.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex gap-3">
                        <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700">
                            Salva Configurazione
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
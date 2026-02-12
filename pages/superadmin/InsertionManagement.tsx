
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Insertion, Tenant } from '../../types';
import { Plus, Trash2, Edit, Save, X, Megaphone, Image as ImageIcon, Link as LinkIcon, Eye, EyeOff, Globe, Layout as LayoutIcon, ArrowUp, Calendar } from 'lucide-react';
import { useDialog } from '../../context/DialogContext';

const InsertionManagement: React.FC = () => {
    const { showConfirm, showAlert } = useDialog();
    const [insertions, setInsertions] = useState<Insertion[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [currentAd, setCurrentAd] = useState<Partial<Insertion>>({
        title: '',
        subtitle: 'Sponsor',
        description: '',
        imageUrl: '',
        externalLink: '',
        buttonText: 'Scopri di più',
        isActive: true,
        tenantId: 'GLOBAL',
        priority: 0,
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [adsData, tenantsData] = await Promise.all([
                db.getInsertions(),
                db.getAllTenants()
            ]);
            setInsertions(adsData);
            setTenants(tenantsData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setCurrentAd({
            title: '',
            subtitle: 'Sponsor',
            description: '',
            imageUrl: '',
            externalLink: '',
            buttonText: 'Scopri di più',
            isActive: true,
            tenantId: 'GLOBAL',
            priority: 0,
            startDate: '',
            endDate: ''
        });
        setIsEditing(true);
    };

    const handleEdit = (ad: Insertion) => {
        setCurrentAd(ad);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm({
            title: 'Elimina Inserzione',
            description: 'Sei sicuro di voler eliminare questa pubblicità? Non verrà più mostrata agli utenti.',
            isDanger: true,
            confirmText: 'Elimina'
        });

        if (confirmed) {
            await db.deleteInsertion(id);
            fetchData();
        }
    };

    const convertDriveLink = (url: string): string | null => {
        try {
          if (!url.includes('http')) return null;
          let id = '';
          const matchStandard = url.match(/\/d\/([-\w]+)/);
          if (matchStandard) {
            id = matchStandard[1];
          } else {
            const matchQuery = url.match(/id=([-\w]+)/);
            if (matchQuery) id = matchQuery[1];
          }
          if (id) return `https://lh3.googleusercontent.com/d/${id}=s1000`; 
          return null;
        } catch (e) {
          return null;
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentAd.title || !currentAd.imageUrl || !currentAd.externalLink) {
            await showAlert({ title: 'Errore', description: 'Titolo, Immagine e Link sono obbligatori.', isDanger: true });
            return;
        }

        const adToSave: Insertion = {
            id: currentAd.id || `ad-${Date.now()}`,
            title: currentAd.title,
            subtitle: currentAd.subtitle || 'Sponsor',
            description: currentAd.description || '',
            imageUrl: convertDriveLink(currentAd.imageUrl) || currentAd.imageUrl,
            externalLink: currentAd.externalLink,
            buttonText: currentAd.buttonText || 'Scopri di più',
            isActive: currentAd.isActive !== undefined ? currentAd.isActive : true,
            tenantId: currentAd.tenantId || 'GLOBAL',
            priority: currentAd.priority || 0,
            createdAt: currentAd.createdAt || new Date().toISOString(),
            startDate: currentAd.startDate,
            endDate: currentAd.endDate
        };

        try {
            await db.saveInsertion(adToSave);
            setIsEditing(false);
            fetchData();
            await showAlert({ title: 'Salvato', description: 'Inserzione salvata con successo.' });
        } catch (error) {
            console.error(error);
            await showAlert({ title: 'Errore', description: 'Impossibile salvare l\'inserzione.', isDanger: true });
        }
    };

    return (
        <div className="p-8 bg-slate-50 dark:bg-night-950 min-h-screen text-slate-900 dark:text-white relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LayoutIcon className="w-8 h-8 text-indigo-500" /> Inserzioni Pubblicitarie
                    </h1>
                    <p className="text-slate-500 dark:text-night-200">
                        Crea schede pubblicitarie che appaiono nel browse degli utenti.
                    </p>
                </div>
                <button onClick={handleCreateNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-all">
                    <Plus className="w-4 h-4" /> Nuova Inserzione
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-10 text-slate-400">Caricamento...</div>
                ) : insertions.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-night-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-night-700">
                        <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500">Nessuna inserzione configurata.</p>
                    </div>
                ) : (
                    insertions.map(ad => (
                        <div key={ad.id} className={`bg-white dark:bg-night-800 rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all ${!ad.isActive ? 'opacity-60 border-slate-200' : 'border-indigo-100 dark:border-indigo-900/50 hover:shadow-md'}`}>
                            <div className="relative h-48 bg-slate-100 dark:bg-night-900">
                                <img src={ad.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ad.tenantId === 'GLOBAL' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>
                                        {ad.tenantId === 'GLOBAL' ? 'Global' : 'Tenant Specific'}
                                    </span>
                                </div>
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button onClick={() => handleEdit(ad)} className="p-2 bg-white/90 dark:bg-black/60 text-slate-600 dark:text-white rounded-full hover:bg-white transition-colors shadow-sm">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(ad.id)} className="p-2 bg-white/90 dark:bg-black/60 text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate" title={ad.title}>{ad.title}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{ad.subtitle}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-night-200 line-clamp-3 mb-4 italic">"{ad.description}"</p>
                                
                                {(ad.startDate || ad.endDate) && (
                                    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 dark:text-night-400 bg-slate-50 dark:bg-night-900 p-2 rounded-lg">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {ad.startDate ? new Date(ad.startDate).toLocaleDateString() : '...'} - {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : '...'}
                                        </span>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-night-700 flex justify-between items-center text-xs font-medium">
                                    <div className="flex items-center gap-1 text-blue-500">
                                        <LinkIcon className="w-3 h-3" />
                                        <span className="truncate max-w-[150px]">{ad.externalLink}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {ad.isActive ? 'ATTIVA' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* EDITOR MODAL */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-night-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-night-700 flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 dark:border-night-700 flex justify-between items-center bg-slate-50 dark:bg-night-900 rounded-t-3xl">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-indigo-500" />
                                {currentAd.id ? 'Modifica Inserzione' : 'Nuova Inserzione Pubblicitaria'}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-night-700 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Titolo (Nome Card)</label>
                                        <input 
                                            type="text" required 
                                            className="w-full p-3 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                            value={currentAd.title}
                                            onChange={e => setCurrentAd({...currentAd, title: e.target.value})}
                                            placeholder="Es. Nike Store"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sottotitolo (Ubicazione Card)</label>
                                        <input 
                                            type="text"
                                            className="w-full p-3 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={currentAd.subtitle}
                                            onChange={e => setCurrentAd({...currentAd, subtitle: e.target.value})}
                                            placeholder="Es. Sponsorizzato"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Tenant</label>
                                        <select 
                                            className="w-full p-3 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-xl outline-none"
                                            value={currentAd.tenantId}
                                            onChange={e => setCurrentAd({...currentAd, tenantId: e.target.value})}
                                        >
                                            <option value="GLOBAL">🌎 Visibile a Tutti (Global)</option>
                                            {tenants.map(t => (
                                                <option key={t.id} value={t.id}>🏠 Solo: {t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Priorità (0-999)</label>
                                        <div className="flex items-center gap-3">
                                            <ArrowUp className="w-4 h-4 text-slate-400" />
                                            <input 
                                                type="number" 
                                                className="w-full p-3 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-xl outline-none"
                                                value={currentAd.priority}
                                                onChange={e => setCurrentAd({...currentAd, priority: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4"/> URL Immagine Pubblicitaria
                                </label>
                                <input 
                                    type="text" required
                                    className="w-full p-3 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                                    value={currentAd.imageUrl || ''}
                                    onChange={e => setCurrentAd({...currentAd, imageUrl: e.target.value})}
                                    placeholder="Incolla link pubblico o Google Drive..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4"/> Link Esterno
                                    </label>
                                    <input 
                                        type="url" required
                                        className="w-full p-3 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-blue-600"
                                        value={currentAd.externalLink || ''}
                                        onChange={e => setCurrentAd({...currentAd, externalLink: e.target.value})}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Testo del Bottone</label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={currentAd.buttonText}
                                        onChange={e => setCurrentAd({...currentAd, buttonText: e.target.value})}
                                        placeholder="Es. Scopri di più"
                                    />
                                </div>
                            </div>

                            {/* DATE RANGE FIELDS */}
                            <div className="p-4 bg-slate-50 dark:bg-night-900 rounded-xl border border-slate-200 dark:border-night-600">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4"/> Periodo di Validità (Opzionale)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Da Giorno</label>
                                        <input 
                                            type="date"
                                            className="w-full p-2 border border-slate-200 dark:border-night-600 dark:bg-night-800 dark:text-white rounded-lg outline-none text-sm"
                                            value={currentAd.startDate || ''}
                                            onChange={e => setCurrentAd({...currentAd, startDate: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">A Giorno</label>
                                        <input 
                                            type="date"
                                            className="w-full p-2 border border-slate-200 dark:border-night-600 dark:bg-night-800 dark:text-white rounded-lg outline-none text-sm"
                                            value={currentAd.endDate || ''}
                                            onChange={e => setCurrentAd({...currentAd, endDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Messaggio Pubblicitario (Bio)</label>
                                <textarea 
                                    className="w-full p-4 border border-slate-200 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none italic"
                                    value={currentAd.description}
                                    onChange={e => setCurrentAd({...currentAd, description: e.target.value})}
                                    placeholder="Scrivi qui il testo pubblicitario..."
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                                <div className="flex-1">
                                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">Stato Pubblicazione</h4>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-400">Attiva per rendere l'inserzione visibile nel navegador.</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setCurrentAd({...currentAd, isActive: !currentAd.isActive})}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${currentAd.isActive ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-slate-200 text-slate-500 dark:bg-night-700'}`}
                                >
                                    {currentAd.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    {currentAd.isActive ? 'ATTIVA' : 'BOZZA'}
                                </button>
                            </div>

                        </form>

                        <div className="p-6 bg-slate-50 dark:bg-night-900 border-t border-slate-100 dark:border-night-700 flex justify-end gap-3 rounded-b-3xl">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-slate-600 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-night-700 rounded-xl transition-all">
                                Annulla
                            </button>
                            <button onClick={handleSave} className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none flex items-center gap-2 transition-all active:scale-95">
                                <Save className="w-4 h-4" /> Pubblica Inserzione
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsertionManagement;

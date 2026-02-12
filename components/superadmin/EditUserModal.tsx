import React from 'react';
import { User } from '../../types';
import { X, Save, Image as ImageIcon } from 'lucide-react';

interface EditUserModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (user: User) => void;
    setUser: (u: User) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave, setUser }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col border border-slate-100 dark:border-night-700">
                <div className="p-6 border-b border-slate-100 dark:border-night-700 flex justify-between items-center bg-slate-50 dark:bg-night-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        Modifica Utente: {user.displayName}
                    </h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400 dark:text-white hover:text-slate-600" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <form id="editForm" onSubmit={(e) => { e.preventDefault(); onSave(user); }} className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Display Name</label>
                                 <input type="text" className="w-full border dark:border-night-600 p-2 rounded-lg dark:bg-night-900 dark:text-white" value={user.displayName} 
                                    onChange={e => setUser({...user, displayName: e.target.value})} />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Email</label>
                                 <input type="email" className="w-full border dark:border-night-600 p-2 rounded-lg dark:bg-night-900 dark:text-white" value={user.email} 
                                    onChange={e => setUser({...user, email: e.target.value})} />
                             </div>
                         </div>

                         <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-night-900 p-4 rounded-xl">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Età</label>
                                 <input type="number" className="w-full border dark:border-night-600 p-2 rounded-lg dark:bg-night-800 dark:text-white" value={user.age || ''} 
                                    onChange={e => setUser({...user, age: parseInt(e.target.value)})} />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Città</label>
                                 <input type="text" className="w-full border dark:border-night-600 p-2 rounded-lg dark:bg-night-800 dark:text-white" value={user.city || ''} 
                                    onChange={e => setUser({...user, city: e.target.value})} />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Regione</label>
                                 <input type="text" className="w-full border dark:border-night-600 p-2 rounded-lg dark:bg-night-800 dark:text-white" value={user.region || ''} 
                                    onChange={e => setUser({...user, region: e.target.value})} />
                             </div>
                         </div>

                         <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                             <div className="flex-1">
                                 <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Stato Verifica</h4>
                                 <p className="text-xs text-blue-700 dark:text-blue-200">La spunta blu indica che il profilo è autentico.</p>
                             </div>
                             <button 
                              type="button"
                              onClick={() => setUser({...user, isVerified: !user.isVerified})}
                              className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${user.isVerified ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-night-700 text-slate-500 dark:text-white border-slate-300 dark:border-night-600'}`}
                             >
                                 {user.isVerified ? 'VERIFICATO' : 'NON VERIFICATO'}
                             </button>
                         </div>

                         <div>
                             <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-2">Bio</label>
                             <textarea className="w-full border dark:border-night-600 p-2 rounded-lg h-24 dark:bg-night-900 dark:text-white" value={user.bio || ''} 
                                onChange={e => setUser({...user, bio: e.target.value})} />
                         </div>

                         <div>
                             <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-2 flex items-center gap-2">
                                 <ImageIcon className="w-4 h-4"/> Foto Caricate (Moderazione)
                             </label>
                             <div className="grid grid-cols-4 gap-2">
                                 {user.photos && user.photos.length > 0 ? user.photos.map((url, idx) => (
                                     <a key={idx} href={url} target="_blank" rel="noreferrer" className="aspect-square bg-slate-100 dark:bg-night-900 rounded-lg overflow-hidden border border-slate-200 dark:border-night-700 hover:opacity-80">
                                         <img src={url} alt="User" className="w-full h-full object-cover" />
                                     </a>
                                 )) : <p className="text-sm text-slate-400 col-span-4">Nessuna foto caricata.</p>}
                             </div>
                         </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-night-700 bg-slate-50 dark:bg-night-900 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-night-700 rounded-lg font-bold">Annulla</button>
                    <button type="submit" form="editForm" className="px-6 py-2 bg-slate-900 dark:bg-rose-600 text-white rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-rose-700 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Salva Modifiche
                    </button>
                </div>
            </div>
        </div>
    );
};
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { ProfileHeader } from '../../components/tenant/ProfileHeader';
import { ProfileDetails } from '../../components/tenant/ProfileDetails';
import { ProfilePhotos } from '../../components/tenant/ProfilePhotos';

const Profile: React.FC = () => {
  const { user, updateUser, deleteAccount, error: authError } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await deleteAccount(deletePassword);
    if (success) {
      setShowDeleteModal(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 relative overflow-hidden">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Il Mio Profilo</h1>
          <p className="text-slate-500 dark:text-night-200">Gestisci i tuoi dati personali, la bio e le foto.</p>
        </div>
        <button 
          onClick={() => setShowOnboarding(true)}
          className="group flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-full font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center font-serif italic font-bold">
            i
          </div>
          <span className="text-sm">Come funzionano le foto?</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1 space-y-6">
            <ProfileHeader user={user} updateUser={updateUser} />
        </div>

        <div className="md:col-span-2 space-y-6">
          <ProfileDetails user={user} updateUser={updateUser} />
          
          <ProfilePhotos user={user} updateUser={updateUser} />

          <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-red-100 dark:border-red-900/30">
              <h3 className="text-red-600 dark:text-red-400 font-bold text-lg mb-2">Zona Pericolo</h3>
              <p className="text-sm text-slate-600 dark:text-night-200 mb-4">
                  Se cancelli il tuo account, il tuo profilo non sarà più visibile a nessuno. 
                  Questa azione è reversibile solo dall'amministratore.
              </p>
              <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm"
              >
                  Cancella il mio Account
              </button>
          </div>
        </div>
      </div>

      <div 
        className={`fixed inset-0 z-50 flex justify-end transition-visibility duration-500 ${showOnboarding ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
      >
        <div 
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-500 ${showOnboarding ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setShowOnboarding(false)}
        ></div>

        <div 
          className={`relative w-full max-w-md bg-white dark:bg-night-800 h-full shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${showOnboarding ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="p-6 border-b border-slate-100 dark:border-night-700 flex justify-between items-center bg-rose-50 dark:bg-night-900">
            <h2 className="text-xl font-bold text-rose-900 dark:text-rose-400 flex items-center">
              <Lock className="w-5 h-5 mr-2" /> Privacy Totale
            </h2>
            <button onClick={() => setShowOnboarding(false)} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-full text-rose-800 dark:text-rose-400 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 dark:text-night-100">
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Le tue foto, il tuo Cloud.</h3>
              <p className="text-slate-600 dark:text-night-200 leading-relaxed">
                A differenza di altre app di incontri, <strong>non salviamo le tue foto sui nostri server</strong>. 
                Rispettiamo la tua privacy al 100%. Le tue immagini rimangono al sicuro nel tuo Google Drive personale.
              </p>
            </section>

            <section className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" /> Come incollare il link
              </h3>
              <p className="text-sm text-slate-700 dark:text-blue-100 leading-relaxed mb-4">
                Affinché gli altri utenti possano vedere la tua foto, <strong>devi rendere il file accessibile pubblicamente</strong> su Google Drive. Se il link è privato, l'immagine apparirà rotta.
              </p>
              <div className="space-y-3">
              <div className="flex gap-3 items-start">
                      <div className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">0</div>
                      <p className="text-sm text-slate-700 dark:text-blue-100">Trucco veloce, vai nel tuo Drive, crea una cartella e rendila visibile con "Chiunque abbia il link". NB in ogni caso nessuno potrà vedere le tue foto, perché il link non è pubblico.
                      Love link non renderà mai pubblici i tui link.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                      <div className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                      <p className="text-sm text-slate-700 dark:text-blue-100">Carica la foto sul tuo Google Drive.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                      <div className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                      <p className="text-sm text-slate-700 dark:text-blue-100">Clicca sui tre puntini o tasto destro sul file e scegli <strong>Condividi</strong>.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                      <div className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                      <p className="text-sm text-slate-700 dark:text-blue-100">Sotto "Accesso generale", cambia da "Con restrizioni" a <strong>"Chiunque abbia il link"</strong>.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                      <div className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                      <p className="text-sm text-slate-700 dark:text-blue-100">Copia il link e incollalo qui su LoveLink.</p>
                  </div>
              </div>
            </section>
          </div>
          
          <div className="p-6 border-t border-slate-100 dark:border-night-700 bg-slate-50 dark:bg-night-900">
             <button 
               onClick={() => setShowOnboarding(false)}
               className="w-full py-3 bg-slate-900 dark:bg-rose-600 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-rose-700 transition-colors"
             >
               Ho Capito, Iniziamo
             </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-night-700">
                <div className="p-6 border-b border-slate-100 dark:border-night-700 bg-red-50 dark:bg-red-900/10 flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-red-900 dark:text-red-300">Sei sicuro?</h3>
                </div>
                
                <form onSubmit={handleDeleteSubmit} className="p-6">
                    <p className="text-slate-600 dark:text-night-200 text-sm mb-4">
                        Stai per cancellare il tuo account. Per confermare, inserisci la password utilizzata durante la registrazione.
                    </p>

                    <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-2">Conferma Password</label>
                    <input 
                        type="password" 
                        required
                        className="w-full p-3 border border-slate-300 dark:border-night-700 dark:bg-night-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-2"
                        placeholder="La tua password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                    />
                    {authError && <p className="text-red-500 text-xs mb-4">{authError}</p>}

                    <div className="flex gap-3 mt-4">
                        <button 
                            type="button" 
                            onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                            className="flex-1 py-3 bg-gray-100 dark:bg-night-700 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-night-600"
                        >
                            Annulla
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 dark:shadow-none"
                        >
                            Conferma Cancellazione
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
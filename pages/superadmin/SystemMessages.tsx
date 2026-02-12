
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { db } from '../../services/db';
import { SystemMessage } from '../../types';
import { Plus, Trash2, Edit, Save, X, Megaphone, AlertCircle, Info, AlertTriangle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useDialog } from '../../context/DialogContext';

const SystemMessages: React.FC = () => {
    const { showConfirm, showAlert } = useDialog();
    const [messages, setMessages] = useState<SystemMessage[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [currentMessage, setCurrentMessage] = useState<Partial<SystemMessage>>({
        title: '',
        content: '',
        bannerUrl: '',
        priority: 'INFO',
        isActive: true
    });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const data = await db.getSystemMessages();
            setMessages(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setCurrentMessage({
            title: '',
            content: '',
            bannerUrl: '',
            priority: 'INFO',
            isActive: true
        });
        setIsEditing(true);
    };

    const handleEdit = (msg: SystemMessage) => {
        setCurrentMessage(msg);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm({
            title: 'Elimina Messaggio',
            description: 'Sei sicuro di voler eliminare questo annuncio? Non sarà più visibile agli utenti.',
            isDanger: true,
            confirmText: 'Elimina'
        });

        if (confirmed) {
            await db.deleteSystemMessage(id);
            fetchMessages();
        }
    };

    const handleRepublish = async (id: string) => {
        const confirmed = await showConfirm({
            title: 'Ripubblica Messaggio',
            description: 'Questo aggiornerà la data del messaggio e lo mostrerà nuovamente a TUTTI gli utenti, anche a chi lo aveva chiuso. Procedere?',
            confirmText: 'Ripubblica Ora'
        });

        if (confirmed) {
            try {
                await db.republishSystemMessage(id);
                await showAlert({ title: 'Successo', description: 'Messaggio ripubblicato.' });
                fetchMessages();
            } catch (e) {
                console.error(e);
                await showAlert({ title: 'Errore', description: 'Impossibile ripubblicare.', isDanger: true });
            }
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
        
        if (!currentMessage.title || !currentMessage.content) {
            await showAlert({ title: 'Errore', description: 'Titolo e contenuto sono obbligatori.', isDanger: true });
            return;
        }

        const msgToSave: SystemMessage = {
            id: currentMessage.id || `sys-msg-${Date.now()}`,
            title: currentMessage.title,
            content: currentMessage.content,
            bannerUrl: currentMessage.bannerUrl ? (convertDriveLink(currentMessage.bannerUrl) || currentMessage.bannerUrl) : undefined,
            priority: currentMessage.priority || 'INFO',
            isActive: currentMessage.isActive !== undefined ? currentMessage.isActive : true,
            createdAt: currentMessage.createdAt || new Date().toISOString(),
            republishedAt: currentMessage.republishedAt // Preserve existing if updating
        };

        try {
            await db.saveSystemMessage(msgToSave);
            setIsEditing(false);
            fetchMessages();
            await showAlert({ title: 'Salvato', description: 'Messaggio pubblicato con successo.' });
        } catch (error) {
            console.error(error);
            await showAlert({ title: 'Errore', description: 'Impossibile salvare il messaggio.', isDanger: true });
        }
    };

    // Quill Toolbar Configuration
    const modules = {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'}],
          ['link', 'clean'] // removed image handler, we use bannerUrl for main image
        ],
    };

    return (
        <div className="p-8 bg-slate-50 dark:bg-night-950 min-h-screen text-slate-900 dark:text-white relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Megaphone className="w-8 h-8 text-blue-500" /> Comunicazioni Globali
                    </h1>
                    <p className="text-slate-500 dark:text-night-200">
                        Invia messaggi di servizio, aggiornamenti o avvisi a tutti gli utenti della piattaforma.
                    </p>
                </div>
                <button onClick={handleCreateNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg">
                    <Plus className="w-4 h-4" /> Nuovo Messaggio
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LISTA MESSAGGI */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-10 text-slate-400">Caricamento messaggi...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700">
                            <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-500">Nessun messaggio attivo.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`bg-white dark:bg-night-800 rounded-xl border shadow-sm overflow-hidden flex flex-col md:flex-row ${!msg.isActive ? 'opacity-60 border-slate-200 dark:border-night-700' : 'border-slate-200 dark:border-night-600'}`}>
                                {msg.bannerUrl && (
                                    <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100 dark:bg-night-900 shrink-0">
                                        <img src={msg.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {msg.priority === 'ALERT' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                            {msg.priority === 'WARNING' && <AlertCircle className="w-5 h-5 text-orange-500" />}
                                            {msg.priority === 'INFO' && <Info className="w-5 h-5 text-blue-500" />}
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{msg.title}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleRepublish(msg.id)}
                                                className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                title="Ripubblica (Mostra di nuovo a tutti)"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEdit(msg)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-night-700 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(msg.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-night-200 line-clamp-2" dangerouslySetInnerHTML={{ __html: msg.content }} />
                                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 font-medium">
                                        <span className={`px-2 py-1 rounded-full ${msg.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-night-700 dark:text-gray-400'}`}>
                                            {msg.isActive ? 'PUBBLICATO' : 'BOZZA / NASCOSTO'}
                                        </span>
                                        <span>Pubblicato: {new Date(msg.createdAt).toLocaleDateString()}</span>
                                        {msg.republishedAt && (
                                            <span className="text-orange-500">Ripubblicato: {new Date(msg.republishedAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* EDITOR MODAL / PANEL */}
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-night-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-night-700 flex flex-col max-h-[90vh] animate-in zoom-in-95">
                            <div className="p-5 border-b border-slate-100 dark:border-night-700 flex justify-between items-center bg-slate-50 dark:bg-night-900 rounded-t-2xl">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                    {currentMessage.id ? 'Modifica Messaggio' : 'Nuovo Messaggio'}
                                </h3>
                                <button onClick={() => setIsEditing(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600 dark:text-white" /></button>
                            </div>
                            
                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Titolo Annuncio</label>
                                        <input 
                                            type="text" required 
                                            className="w-full p-3 border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                            value={currentMessage.title}
                                            onChange={e => setCurrentMessage({...currentMessage, title: e.target.value})}
                                            placeholder="Es. Manutenzione Programmata"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Priorità / Tipo</label>
                                        <select 
                                            className="w-full p-3 border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg outline-none"
                                            value={currentMessage.priority}
                                            onChange={e => setCurrentMessage({...currentMessage, priority: e.target.value as any})}
                                        >
                                            <option value="INFO">Informazione (Blu)</option>
                                            <option value="WARNING">Avviso (Arancio)</option>
                                            <option value="ALERT">Urgente (Rosso)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Stato</label>
                                        <select 
                                            className="w-full p-3 border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg outline-none"
                                            value={currentMessage.isActive ? 'active' : 'inactive'}
                                            onChange={e => setCurrentMessage({...currentMessage, isActive: e.target.value === 'active'})}
                                        >
                                            <option value="active">Visibile (Pubblico)</option>
                                            <option value="inactive">Nascosto (Bozza)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4"/> Immagine Banner (Opzionale)
                                    </label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 border border-slate-300 dark:border-night-600 dark:bg-night-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={currentMessage.bannerUrl || ''}
                                        onChange={e => setCurrentMessage({...currentMessage, bannerUrl: e.target.value})}
                                        placeholder="Incolla link pubblico di Google Drive..."
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Supporta link diretti di Google Drive. L'immagine apparirà in cima al messaggio.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-2">Contenuto Messaggio</label>
                                    <div className="bg-white dark:bg-night-900 dark:text-white rounded-lg overflow-hidden border border-slate-300 dark:border-night-600">
                                        <ReactQuill 
                                            theme="snow"
                                            value={currentMessage.content}
                                            onChange={(content) => setCurrentMessage({...currentMessage, content})}
                                            modules={modules}
                                            className="h-48 mb-10 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                            </form>

                            <div className="p-5 bg-slate-50 dark:bg-night-900 border-t border-slate-100 dark:border-night-700 flex justify-end gap-3 rounded-b-2xl">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-night-700 rounded-lg">
                                    Annulla
                                </button>
                                <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Salva e Pubblica
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemMessages;

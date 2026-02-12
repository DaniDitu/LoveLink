import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';
import { AlertCircle, Calendar, Mail, Lock, X, ShieldCheck } from 'lucide-react';
import { GenderType, LandingPageConfig } from '../types';

interface AuthCardProps {
    config: LandingPageConfig;
    defaultMode?: 'LOGIN' | 'REGISTER';
}

export const AuthCard: React.FC<AuthCardProps> = ({ config, defaultMode = 'LOGIN' }) => {
    const { login, register } = useAuth();
    const { showAlert } = useDialog();

    const [isRegisterMode, setIsRegisterMode] = useState(defaultMode === 'REGISTER');
    
    // Sync state if prop changes (e.g. navigation via URL param)
    useEffect(() => {
        setIsRegisterMode(defaultMode === 'REGISTER');
    }, [defaultMode]);

    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');
    const [regType, setRegType] = useState<GenderType | null>(null);
    const [birthDate, setBirthDate] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [privacyModalAccepted, setPrivacyModalAccepted] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const calculateAge = (dateString: string): number => {
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null); 

      if (isRegisterMode) {
        if (!regType) {
            setFormError("Seleziona chi sei (Uomo, Donna o Coppia) per proseguire.");
            return;
        }

        if (!displayName.trim() || !city.trim() || !region.trim() || !birthDate) {
            setFormError("Tutti i campi sono obbligatori per la registrazione.");
            return;
        }

        const age = calculateAge(birthDate);
        if (age < 18) {
            setFormError("Devi essere maggiorenne per iscriverti.");
            return;
        }

        if (!privacyAccepted) {
          setFormError("Per favore accetta le condizioni di privacy per procedere.");
          return;
        }
        
        await register({ 
            email, 
            password, 
            displayName, 
            type: regType, 
            city, 
            region,
            age,
            birthDate 
        });
      } else {
        await login(email, password);
      }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) return;
        
        await showAlert({
            title: 'Email Inviata',
            description: `È stata inviata un'email a ${resetEmail} con le istruzioni per reimpostare la password.`
        });
        
        setResetEmail('');
        setShowForgotModal(false);
    };

    const toggleMode = () => {
      setIsRegisterMode(!isRegisterMode);
      setFormError(null);
    };

    return (
        <div className="w-full max-w-md mx-auto" id="auth-card">
            <div className="bg-white dark:bg-night-800 rounded-3xl shadow-2xl shadow-rose-100/50 dark:shadow-none border border-slate-100 dark:border-night-700 p-8 relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-purple-600"></div>
                
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isRegisterMode ? "Inizia il viaggio" : config.authCardTitle}
                    </h2>
                    <p className="text-slate-500 dark:text-night-200 text-sm mt-1">
                        {isRegisterMode ? "Registrati in pochi secondi." : config.authCardSubtitle}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegisterMode && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-night-200 uppercase mb-2">Sono *</label>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {['MAN', 'WOMAN', 'COUPLE'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setRegType(t as GenderType)}
                                className={`py-2 rounded-lg text-xs font-bold border transition-all ${regType === t ? 'bg-slate-900 dark:bg-rose-600 text-white border-slate-900 dark:border-rose-600' : 'bg-white dark:bg-night-900 text-slate-500 dark:text-night-200 border-slate-200 dark:border-night-700 hover:border-slate-300'}`}
                            >
                                {t === 'MAN' ? 'Uomo' : t === 'WOMAN' ? 'Donna' : 'Coppia'}
                            </button>
                            ))}
                        </div>
                        
                        <input 
                            type="text" 
                            required={isRegisterMode}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-night-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm mb-3 dark:text-white"
                            placeholder={regType === 'COUPLE' ? 'Nome Coppia' : 'Il tuo Nome'}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                        
                        <div className="mb-3 relative">
                            <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1 ml-1">Data di nascita *</label>
                            <div className="relative">
                            <input 
                                type="date"
                                required={isRegisterMode}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-night-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm dark:text-white"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <Calendar className="absolute right-4 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-1">
                        <input 
                            type="text" 
                            required={isRegisterMode}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-night-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm dark:text-white"
                            placeholder="Città"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <input 
                            type="text" 
                            required={isRegisterMode}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-night-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm dark:text-white"
                            placeholder="Provincia"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                        />
                        </div>
                    </div>
                    )}

                    <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-night-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm dark:text-white"
                        placeholder="Il tuo indirizzo email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="space-y-1">
                    <input 
                            type="password" 
                            required
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-night-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm dark:text-white"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    {!isRegisterMode && (
                        <div className="text-right">
                            <button 
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
                            >
                                Password dimenticata?
                            </button>
                        </div>
                    )}
                    </div>

                    {isRegisterMode && (
                        <div className="space-y-2">
                        {formError && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 flex items-start gap-2 text-red-600 dark:text-red-300 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span className="text-xs font-bold leading-tight">{formError}</span>
                            </div>
                        )}
                        <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${formError ? 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800' : 'bg-slate-50 dark:bg-night-900 border-transparent'}`}>
                            <input 
                            type="checkbox" 
                            required
                            className={`mt-1 rounded ${formError ? 'text-red-600 focus:ring-red-500' : 'text-rose-600 focus:ring-rose-500'}`} 
                            checked={privacyAccepted}
                            onChange={(e) => {
                                setPrivacyAccepted(e.target.checked);
                                if (e.target.checked) setFormError(null);
                            }}
                            />
                            <span className={`text-xs leading-tight ${formError ? 'text-red-800 dark:text-red-300' : 'text-slate-500 dark:text-night-200'}`}>
                            Accetto i <strong className="text-slate-900 dark:text-white">Termini e Condizioni</strong> e confermo di aver letto la <button type="button" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-rose-600 hover:underline font-bold">Privacy Policy</button>.
                            </span>
                        </label>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-200 dark:shadow-none transition-all">
                    {isRegisterMode ? "Registrati Gratuitamente" : config.authButtonText}
                    </button>
                </form>

                <div className="mt-6 text-center pt-4 border-t border-slate-100 dark:border-night-700">
                <button 
                    onClick={toggleMode}
                    className="text-sm font-semibold text-slate-500 dark:text-night-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                    {isRegisterMode 
                    ? "Hai già un account? Accedi" 
                    : "Non hai un account? Registrati"}
                </button>
                </div>
            </div>

            {/* PRIVACY MODAL */}
            {showPrivacyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-night-700 transform transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-night-700 bg-slate-50 dark:bg-night-900 flex justify-between items-center">
                                <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-rose-500" /> Privacy & Sicurezza
                                </h3>
                                <button onClick={() => setShowPrivacyModal(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-night-700 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-500 dark:text-white" />
                                </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6 text-slate-600 dark:text-night-200 text-sm leading-relaxed">
                            <section>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">1. I tuoi dati sono al sicuro</h4>
                                <p>
                                    A differenza delle grandi piattaforme tecnologiche, LoveLink adotta una filosofia di isolamento dei dati. 
                                    <strong> Non cediamo, vendiamo o condividiamo i tuoi dati personali con terze parti</strong>.
                                </p>
                            </section>
                            {/* ... Content ... */}
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-night-700 bg-slate-50 dark:bg-night-900">
                            <label className="flex items-center gap-3 cursor-pointer mb-4 p-3 bg-white dark:bg-night-800 border border-slate-200 dark:border-night-600 rounded-xl hover:border-rose-300 transition-colors">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                                    checked={privacyModalAccepted}
                                    onChange={(e) => setPrivacyModalAccepted(e.target.checked)}
                                />
                                <span className="font-medium text-slate-700 dark:text-white text-sm">
                                    Ho letto, compreso e accetto le condizioni di privacy.
                                </span>
                            </label>
                            <button 
                                disabled={!privacyModalAccepted}
                                onClick={() => {
                                    setPrivacyAccepted(true); 
                                    setShowPrivacyModal(false);
                                }}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${privacyModalAccepted ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none' : 'bg-slate-200 dark:bg-night-700 text-slate-400 dark:text-night-500 cursor-not-allowed'}`}
                            >
                                Conferma e Chiudi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FORGOT PASSWORD MODAL */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-night-700">
                        <div className="p-6 border-b border-slate-100 dark:border-night-700 bg-rose-50 dark:bg-night-900 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-rose-900 dark:text-rose-400 flex items-center gap-2">
                                <Lock className="w-5 h-5" /> Recupero Password
                            </h3>
                            <button onClick={() => setShowForgotModal(false)}><X className="w-5 h-5 text-slate-400 dark:text-night-200 hover:text-slate-600" /></button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <p className="text-sm text-slate-600 dark:text-night-200 leading-relaxed">
                                Inserisci l'email associata al tuo account. Ti invieremo un link per creare una nuova password.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        required 
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-night-600 bg-white dark:bg-night-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                                        placeholder="nome@esempio.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 dark:bg-rose-600 text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-rose-700">
                                Invia Link di Reset
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

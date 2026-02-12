
import React from 'react';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { Download, Share, PlusSquare, MoreVertical, Smartphone, Monitor, Apple, CheckCircle2 } from 'lucide-react';

const InstallApp: React.FC = () => {
    const { isInstallable, install } = usePwaInstall();

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                    <Smartphone className="w-8 h-8 text-rose-500" />
                    Installa l'App
                </h1>
                <p className="text-slate-500 dark:text-night-200">
                    Ottieni l'esperienza completa di LoveLink installando l'applicazione sul tuo dispositivo.
                </p>
            </div>

            {/* Main Action Card */}
            <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Installa LoveLink</h2>
                        <p className="text-rose-100 max-w-lg">
                            Accedi più velocemente, ricevi notifiche migliori e usa l'app a schermo intero senza la barra del browser.
                        </p>
                    </div>
                    {isInstallable ? (
                        <button 
                            onClick={install}
                            className="bg-white text-rose-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-rose-50 transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap"
                        >
                            <Download className="w-5 h-5" /> Installa Ora
                        </button>
                    ) : (
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">App Installata o non supportata</span>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Come installare manualmente</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* iOS Instructions */}
                <div className="bg-white dark:bg-night-800 p-6 rounded-2xl border border-slate-200 dark:border-night-700 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-night-900 rounded-full flex items-center justify-center mb-4 text-2xl">
                        🍎
                    </div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">iPhone / iPad</h4>
                    <ol className="space-y-4 text-sm text-slate-600 dark:text-night-200 flex-1">
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">1.</span>
                            <span>Apri <strong>Safari</strong>.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">2.</span>
                            <span>Tocca il pulsante <span className="inline-flex items-center text-blue-500 font-bold"><Share className="w-3 h-3 mx-1" /> Condividi</span>.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">3.</span>
                            <span>Scorri e seleziona <span className="inline-flex items-center text-slate-700 dark:text-white font-bold"><PlusSquare className="w-3 h-3 mx-1" /> Aggiungi alla Home</span>.</span>
                        </li>
                    </ol>
                </div>

                {/* Android Instructions */}
                <div className="bg-white dark:bg-night-800 p-6 rounded-2xl border border-slate-200 dark:border-night-700 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-night-900 rounded-full flex items-center justify-center mb-4 text-2xl">
                        🤖
                    </div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Android</h4>
                    <ol className="space-y-4 text-sm text-slate-600 dark:text-night-200 flex-1">
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">1.</span>
                            <span>Apri <strong>Chrome</strong>.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">2.</span>
                            <span>Tocca il menu <span className="inline-flex items-center font-bold"><MoreVertical className="w-3 h-3" /></span> in alto a destra.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">3.</span>
                            <span>Seleziona <strong>Installa App</strong> o <strong>Aggiungi a schermata Home</strong>.</span>
                        </li>
                    </ol>
                </div>

                {/* Desktop Instructions */}
                <div className="bg-white dark:bg-night-800 p-6 rounded-2xl border border-slate-200 dark:border-night-700 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-night-900 rounded-full flex items-center justify-center mb-4">
                        <Monitor className="w-6 h-6 text-slate-600 dark:text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">PC / Mac</h4>
                    <ol className="space-y-4 text-sm text-slate-600 dark:text-night-200 flex-1">
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">1.</span>
                            <span>Usa <strong>Chrome</strong> o <strong>Edge</strong>.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">2.</span>
                            <span>Cerca l'icona <span className="inline-flex items-center font-bold"><Download className="w-3 h-3 mx-1" /></span> nella barra degli indirizzi (destra).</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-slate-900 dark:text-white">3.</span>
                            <span>Clicca e seleziona <strong>Installa</strong>.</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default InstallApp;

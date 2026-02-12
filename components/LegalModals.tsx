import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface LegalModalProps {
    type: 'TERMS' | 'PRIVACY' | null;
    onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
    if (!type) return null;

    const isTerms = type === 'TERMS';

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 dark:border-night-700 flex flex-col max-h-[85vh] relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-night-700 bg-slate-50 dark:bg-night-900 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                        {isTerms ? <FileText className="w-6 h-6 text-blue-500" /> : <Shield className="w-6 h-6 text-green-500" />}
                        {isTerms ? 'Termini di Servizio' : 'Privacy Policy'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-night-700 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500 dark:text-white" />
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto space-y-6 text-slate-600 dark:text-night-200 text-sm leading-relaxed">
                    {isTerms ? <TermsContent /> : <PrivacyContent />}
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-night-700 bg-slate-50 dark:bg-night-900 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 dark:bg-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Ho Capito
                    </button>
                </div>
            </div>
        </div>
    );
};

const TermsContent = () => (
    <div className="space-y-6">
        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">1. Natura del servizio</h4>
            <p>Lovelink è un <strong>gioco sociale anonimo e temporaneo</strong> utilizzabile esclusivamente all’interno di locali aderenti.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>non è un social network</li>
                <li>non è una piattaforma di dating</li>
                <li>non è una chat persistente</li>
                <li>non è un servizio di messaggistica tradizionale</li>
            </ul>
            <p className="mt-2">Il servizio è progettato come <strong>esperienza ludica, anonima e limitata nel tempo</strong>.</p>
        </section>
        
        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">2. Durata del servizio</h4>
            <p>L’accesso a Lovelink è valido solo durante la singola serata/evento ed è associato a una sessione temporanea che non prevede profili permanenti.</p>
            <p className="mt-2">Alla chiusura dell’evento:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>i dati della chat vengono eliminati</li>
                <li>le sessioni vengono invalidate</li>
                <li>non è possibile recuperare conversazioni o contatti</li>
            </ul>
            <p className="mt-2">Se un utente esce volontariamente dalla chat, chiude la sessione o perde la connessione, la sessione viene considerata terminata e <strong>non è garantito il rientro</strong>.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">3. Anonimato e identità</h4>
            <p>Gli utenti sono identificati esclusivamente tramite numeri temporanei e avatar generici.</p>
            <p className="mt-2">Lovelink non richiede:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>nome o cognome</li>
                <li>email o numero di telefono</li>
                <li>profili social</li>
            </ul>
            <p className="mt-2">L’identità reale degli utenti non viene raccolta né visualizzata.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">4. Regole di comportamento</h4>
            <p>Lovelink è un gioco sociale basato sul rispetto reciproco. È vietato condividere numeri di telefono, contatti social, invitare utenti a piattaforme esterne, usare linguaggio offensivo o discriminatorio.</p>
            <p className="mt-2">I messaggi possono essere filtrati o moderati. Gli utenti che violano le regole possono essere espulsi.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">5. Moderazione</h4>
            <p>Lovelink utilizza filtri automatici e moderazione umana. Le decisioni di moderazione sono <strong>insindacabili</strong>.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">6. Funzionalità di gioco</h4>
            <p>Le funzionalità (chat, drink simbolici, termometro interesse) sono esclusivamente meccaniche di gioco e non costituiscono impegni reali.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">7. Limitazione di responsabilità</h4>
            <p>Lovelink non garantisce incontri o compatibilità. Gli utenti partecipano sotto la propria responsabilità.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">8. Disponibilità del servizio</h4>
            <p>Il servizio può essere modificato, sospeso o limitato in qualsiasi momento per motivi tecnici o di sicurezza.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">9. Età minima</h4>
            <p>L’utilizzo di Lovelink è consentito solo a utenti maggiorenni.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">10. Modifiche ai termini</h4>
            <p>I Termini di Servizio possono essere aggiornati in qualsiasi momento.</p>
        </section>
    </div>
);

const PrivacyContent = () => (
    <div className="space-y-6">
        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">1. Principio fondamentale</h4>
            <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-4">
                "Nessun profilo. Nessun dato personale. Nessuna cronologia."
            </blockquote>
            <p>L’app è pensata per funzionare in modo anonimo, temporaneo e locale.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">2. Dati raccolti</h4>
            <p>Lovelink <strong>non raccoglie dati personali identificativi</strong> (nome, email, telefono, foto, social). Gli utenti sono identificati solo tramite un numero temporaneo.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">3. Dati tecnici temporanei</h4>
            <p>Durante l’utilizzo possono essere trattati ID sessione, numero utente, preferenze anonime e messaggi. Questi dati non identificano direttamente la persona.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">4. Durata della conservazione</h4>
            <p>I dati del gioco esistono solo per la durata dell’evento e vengono eliminati automaticamente a fine serata. Non esiste archivio storico.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">5. Moderazione e sicurezza</h4>
            <p>Per garantire sicurezza, i messaggi possono essere analizzati da sistemi automatici o moderatori.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">6. Localizzazione</h4>
            <p>Non viene effettuato tracciamento GPS continuo degli utenti.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">7. Cookie e tecnologie locali</h4>
            <p>Lovelink utilizza storage locale e cookie tecnici solo per il funzionamento dell’app e della sessione temporanea.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">8. Diritti degli utenti (GDPR)</h4>
            <p>Gli utenti hanno diritto a richiedere informazioni o cancellazione, ma dato che i dati vengono eliminati a fine evento, non esiste un archivio permanente.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">9. Titolare del trattamento</h4>
            <p>Il titolare è il gestore della piattaforma Lovelink.</p>
        </section>

        <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">10. Aggiornamenti</h4>
            <p>La presente informativa può essere aggiornata per motivi legali o tecnici.</p>
        </section>
    </div>
);
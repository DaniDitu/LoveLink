import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-night-950 text-slate-900 dark:text-night-100">
      <div className="max-w-3xl mx-auto py-12 px-6 prose dark:prose-invert">
        <Link to="/" className="no-underline inline-flex items-center text-rose-600 hover:text-rose-700 mb-8 font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Torna alla Home
        </Link>

        <h1>TERMINI DI SERVIZIO — LOVELINK</h1>

        <h2>1. Natura del servizio</h2>
        <p>Lovelink è un <strong>gioco sociale anonimo e temporaneo</strong> utilizzabile esclusivamente all’interno di locali aderenti.</p>
        <p>Lovelink:</p>
        <ul>
          <li>non è un social network</li>
          <li>non è una piattaforma di dating</li>
          <li>non è una chat persistente</li>
          <li>non è un servizio di messaggistica tradizionale</li>
        </ul>
        <p>Il servizio è progettato come <strong>esperienza ludica, anonima e limitata nel tempo</strong>.</p>

        <hr />

        <h2>2. Durata del servizio</h2>
        <p>L’accesso a Lovelink:</p>
        <ul>
          <li>è valido solo durante la singola serata/evento</li>
          <li>è associato a una sessione temporanea</li>
          <li>non prevede profili permanenti</li>
        </ul>
        <p>Alla chiusura dell’evento:</p>
        <ul>
          <li>i dati della chat vengono eliminati</li>
          <li>le sessioni vengono invalidate</li>
          <li>non è possibile recuperare conversazioni o contatti</li>
        </ul>
        <p>Se un utente:</p>
        <ul>
          <li>esce volontariamente dalla chat</li>
          <li>chiude la sessione</li>
          <li>o perde la connessione</li>
        </ul>
        <p>la sessione viene considerata terminata e <strong>non è garantito il rientro</strong>.</p>

        <hr />

        <h2>3. Anonimato e identità</h2>
        <p>Gli utenti sono identificati esclusivamente tramite:</p>
        <ul>
          <li>numeri temporanei</li>
          <li>avatar generici</li>
        </ul>
        <p>Lovelink non richiede:</p>
        <ul>
          <li>nome</li>
          <li>cognome</li>
          <li>email</li>
          <li>numero di telefono</li>
          <li>profili social</li>
        </ul>
        <p>L’identità reale degli utenti non viene raccolta né visualizzata.</p>

        <hr />

        <h2>4. Regole di comportamento</h2>
        <p>Lovelink è un gioco sociale basato sul rispetto reciproco.</p>
        <p>È vietato:</p>
        <ul>
          <li>condividere numeri di telefono</li>
          <li>condividere contatti social</li>
          <li>invitare utenti a piattaforme esterne</li>
          <li>usare linguaggio offensivo, volgare o discriminatorio</li>
          <li>molestare o intimidire altri partecipanti</li>
          <li>aggirare i filtri del sistema</li>
        </ul>
        <p>I messaggi possono essere:</p>
        <ul>
          <li>filtrati automaticamente</li>
          <li>bloccati</li>
          <li>inviati in moderazione</li>
          <li>eliminati</li>
        </ul>
        <p>Gli utenti che violano le regole possono essere:</p>
        <ul>
          <li>silenziati</li>
          <li>espulsi dalla serata</li>
          <li>bloccati dal locale</li>
        </ul>

        <hr />

        <h2>5. Moderazione</h2>
        <p>Lovelink utilizza:</p>
        <ul>
          <li>filtri automatici</li>
          <li>sistemi di moderazione</li>
          <li>moderatori umani nominati dal locale</li>
        </ul>
        <p>I contenuti possono essere:</p>
        <ul>
          <li>approvati</li>
          <li>modificati</li>
          <li>rifiutati</li>
          <li>eliminati</li>
        </ul>
        <p>Le decisioni di moderazione sono <strong>insindacabili</strong> per garantire un ambiente sicuro.</p>

        <hr />

        <h2>6. Funzionalità di gioco</h2>
        <p>Lovelink include funzionalità ludiche come:</p>
        <ul>
          <li>chat globale</li>
          <li>chat privata</li>
          <li>offerte simboliche di drink</li>
          <li>giochi di abbinamento</li>
          <li>termometro di interesse</li>
        </ul>
        <p>Queste funzioni:</p>
        <ul>
          <li>non rappresentano impegni reali</li>
          <li>non costituiscono servizi di dating</li>
          <li>sono esclusivamente meccaniche di gioco</li>
        </ul>

        <hr />

        <h2>7. Limitazione di responsabilità</h2>
        <p>Lovelink:</p>
        <ul>
          <li>non garantisce incontri</li>
          <li>non garantisce compatibilità tra utenti</li>
          <li>non è responsabile delle interazioni tra persone nel mondo reale</li>
        </ul>
        <p>Gli utenti partecipano:</p>
        <ul>
          <li>volontariamente</li>
          <li>sotto la propria responsabilità</li>
          <li>nel rispetto delle leggi e delle regole del locale.</li>
        </ul>

        <hr />

        <h2>8. Disponibilità del servizio</h2>
        <p>Il servizio:</p>
        <ul>
          <li>può essere modificato o sospeso in qualsiasi momento</li>
          <li>può essere limitato per singoli locali o eventi</li>
          <li>può essere disattivato per motivi tecnici o di sicurezza</li>
        </ul>

        <hr />

        <h2>9. Età minima</h2>
        <p>L’utilizzo di Lovelink è consentito solo a:</p>
        <ul>
          <li>utenti maggiorenni</li>
          <li>o all’età minima prevista dalla legge locale.</li>
        </ul>

        <hr />

        <h2>10. Modifiche ai termini</h2>
        <p>I Termini di Servizio possono essere aggiornati in qualsiasi momento.<br />L’uso continuato del servizio implica l’accettazione delle modifiche.</p>
      </div>
    </div>
  );
};
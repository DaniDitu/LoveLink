import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-night-950 text-slate-900 dark:text-night-100">
      <div className="max-w-3xl mx-auto py-12 px-6 prose dark:prose-invert">
        <Link to="/" className="no-underline inline-flex items-center text-rose-600 hover:text-rose-700 mb-8 font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Torna alla Home
        </Link>

        <h1>PRIVACY POLICY — LOVELINK</h1>

        <h2>1. Principio fondamentale</h2>
        <p>Lovelink è progettato secondo il principio:</p>
        <blockquote>
          <p><strong>Nessun profilo. Nessun dato personale. Nessuna cronologia.</strong></p>
        </blockquote>
        <p>L’app è pensata per funzionare in modo:</p>
        <ul>
          <li>anonimo</li>
          <li>temporaneo</li>
          <li>locale</li>
        </ul>

        <hr />

        <h2>2. Dati raccolti</h2>
        <p>Lovelink <strong>non raccoglie dati personali identificativi</strong> come:</p>
        <ul>
          <li>nome</li>
          <li>cognome</li>
          <li>email</li>
          <li>numero di telefono</li>
          <li>foto profilo</li>
          <li>account social</li>
        </ul>
        <p>Gli utenti sono identificati solo tramite:</p>
        <ul>
          <li>un numero temporaneo</li>
          <li>dati di sessione anonimi</li>
        </ul>

        <hr />

        <h2>3. Dati tecnici temporanei</h2>
        <p>Durante l’utilizzo del servizio possono essere trattati:</p>
        <ul>
          <li>ID sessione temporaneo</li>
          <li>numero utente nella serata</li>
          <li>preferenze anonime (es. drink o interessi)</li>
          <li>messaggi della chat</li>
        </ul>
        <p>Questi dati:</p>
        <ul>
          <li>non identificano direttamente la persona</li>
          <li>sono utilizzati solo per il funzionamento del gioco</li>
        </ul>

        <hr />

        <h2>4. Durata della conservazione</h2>
        <p>I dati del gioco:</p>
        <ul>
          <li>esistono solo per la durata dell’evento</li>
          <li>vengono eliminati automaticamente a fine serata</li>
        </ul>
        <p>Non esiste:</p>
        <ul>
          <li>archivio storico delle chat</li>
          <li>cronologia accessibile</li>
          <li>profilo permanente</li>
        </ul>

        <hr />

        <h2>5. Moderazione e sicurezza</h2>
        <p>Per garantire un ambiente sicuro:</p>
        <ul>
          <li>i messaggi possono essere analizzati da sistemi automatici</li>
          <li>possono essere controllati da moderatori umani</li>
          <li>possono essere filtrati o bloccati</li>
        </ul>
        <p>Questo trattamento avviene esclusivamente per:</p>
        <ul>
          <li>sicurezza</li>
          <li>prevenzione abusi</li>
          <li>rispetto delle regole</li>
        </ul>

        <hr />

        <h2>6. Localizzazione</h2>
        <p>La piattaforma può utilizzare:</p>
        <ul>
          <li>dati di posizione del locale</li>
          <li>coordinate inserite dal gestore</li>
        </ul>
        <p>Non viene effettuato:</p>
        <ul>
          <li>tracciamento GPS continuo degli utenti</li>
          <li>geolocalizzazione individuale persistente</li>
        </ul>

        <hr />

        <h2>7. Cookie e tecnologie locali</h2>
        <p>Lovelink può utilizzare:</p>
        <ul>
          <li>storage locale</li>
          <li>database offline (IndexedDB)</li>
          <li>cookie tecnici</li>
        </ul>
        <p>Solo per:</p>
        <ul>
          <li>funzionamento dell’app</li>
          <li>sessione temporanea</li>
          <li>preferenze non personali</li>
        </ul>

        <hr />

        <h2>8. Diritti degli utenti (GDPR)</h2>
        <p>Gli utenti hanno diritto a:</p>
        <ul>
          <li>richiedere informazioni sui dati trattati</li>
          <li>richiedere la cancellazione dei dati</li>
          <li>opporsi al trattamento</li>
        </ul>
        <p>Tuttavia:</p>
        <ul>
          <li>i dati vengono eliminati automaticamente a fine evento</li>
          <li>quindi non esiste un archivio permanente.</li>
        </ul>

        <hr />

        <h2>9. Titolare del trattamento</h2>
        <p>Il titolare del trattamento è:</p>
        <ul>
          <li>il gestore della piattaforma Lovelink</li>
          <li>i cui dati saranno indicati nella versione ufficiale del servizio.</li>
        </ul>

        <hr />

        <h2>10. Aggiornamenti della privacy policy</h2>
        <p>La presente informativa può essere aggiornata:</p>
        <ul>
          <li>per motivi legali</li>
          <li>per miglioramenti tecnici</li>
          <li>per nuove funzionalità</li>
        </ul>
        <p>La versione aggiornata sarà sempre disponibile nella landing.</p>
      </div>
    </div>
  );
};
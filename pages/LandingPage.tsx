
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDialog } from '../context/DialogContext';
import { db } from '../services/db';
import { LandingPageConfig } from '../types';
import { useNavigate } from 'react-router-dom';
import { Heart, Sun, Moon, Sparkles, Smartphone, CheckCircle2, ShieldCheck, Download, Share, MoreVertical, PlusSquare, Shield, Globe, Zap, MessageCircle, Lock, Search, Users } from 'lucide-react';
import { AuthCard } from '../components/AuthCard';
import { LegalModal } from '../components/LegalModals';
import { Footer } from '../components/layout/Footer';

const LoveLinkLogo = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="lgrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#ff4d88"/>
      <stop offset="100%" stopColor="#7b2cff"/>
    </linearGradient>
  </defs>
  <path d="M8 5v10c0 2.5 1.5 4 4 4h4"
        fill="none"
        stroke="url(#lgrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"/>
</svg>
);

const DEFAULT_CONFIG: LandingPageConfig = {
    navLoginVisible: true,
    navRegisterVisible: true,
    heroVisible: true,
    heroTitle: "Appuntamenti in tutta tranquillità.",
    heroSubtitle: "Ti aiutiamo a mostrarti per quello che sei, per farti conoscere persone che ti fanno sentire a tuo agio. Unisciti a Noi",
    // Changed URL to query param based registration
    heroButtons: [
        { id: 'btn-1', text: "Crea un Account", url: "/auth?mode=register", style: "PRIMARY" }
    ],
    heroImageRight: "", 
    heroImageLeft: "",
    
    // Auth Card Defaults
    authCardVisible: true,
    authCardTitle: "Bentornato",
    authCardSubtitle: "Accedi per continuare a chattare.",
    authButtonText: "Accedi",

    // Features Defaults
    featuresVisible: true,
    featuresTitle: "Perché scegliere LoveLink?",
    features: [
        { id: 'f1', icon: 'SHIELD', title: 'Sicurezza Totale', description: 'I tuoi dati sono protetti con crittografia end-to-end e non vengono mai ceduti a terzi.' },
        { id: 'f2', icon: 'USERS', title: 'Community Reale', description: 'Profili verificati e moderazione attiva 24/7 per garantirti incontri autentici.' },
        { id: 'f3', icon: 'HEART', title: 'Matching Intelligente', description: 'Il nostro algoritmo ti connette con persone compatibili basandosi sui tuoi interessi reali.' }
    ],

    // Stories Defaults
    storiesVisible: false,
    storiesTitle: "LoveLink: Storie di Successo",
    storiesCtaText: "Dai un'occhiata ad altre storie di successo",
    successStories: [
        {
            id: 's1',
            names: 'Kevin & Barbara',
            quote: "Ho ricevuto il suo messaggio 10 minuti dopo aver completato la registrazione. Non credevo fosse così veloce.",
            image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1000&auto=format&fit=crop",
            tag: "Sposati nel 2023"
        },
        {
            id: 's2',
            names: 'Enrique & David',
            quote: "Era il mio primo pensiero al mio risveglio. LoveLink ci ha permesso di trovarci nonostante la distanza.",
            image: "https://images.unsplash.com/photo-1516575150278-77136aed6920?q=80&w=1000&auto=format&fit=crop",
            tag: "Convivono da 2 anni"
        },
        {
            id: 's3',
            names: 'Chris & Marine',
            quote: "È proprio grazie a LoveLink che io e Marine possiamo goderci questa bellissima vita insieme.",
            image: "https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=1000&auto=format&fit=crop",
            tag: "In attesa del primo figlio"
        }
    ],

    // App Defaults
    appVisible: true,
    appTitle: "Porta LoveLink sempre con te",
    appSubtitle: "LoveLink è una Progressive Web App (PWA). Puoi installarla direttamente dal tuo browser senza passare dagli store, risparmiando spazio sul tuo dispositivo.",

    // Footer Defaults
    footerVisible: true,
    footerColumns: [
        {
            title: "Panoramica",
            links: [
                { label: "Chi siamo", url: "#" },
                { label: "Carriere", url: "#" },
                { label: "Blog", url: "#" },
                { label: "Termini di Servizio", url: "/terms" },
                { label: "Privacy Policy", url: "/privacy" }
            ]
        },
        {
            title: "Comunità",
            links: [
                { label: "Linee Guida", url: "#" },
                { label: "Sicurezza", url: "#" },
                { label: "Supporto", url: "#" }
            ]
        },
        {
            title: "Partner",
            links: [
                { label: "Affiliati", url: "#" },
                { label: "Pubblicità", url: "#" }
            ]
        }
    ],

    sectionOrder: ['FEATURES', 'STORIES', 'APP']
};

export const LandingPage: React.FC = () => {
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    
    // Config State
    const [config, setConfig] = useState<LandingPageConfig>(DEFAULT_CONFIG);
    const [legalModalOpen, setLegalModalOpen] = useState<'TERMS' | 'PRIVACY' | null>(null);
  
    useEffect(() => {
      // Load Dynamic Content
      const fetchConfig = async () => {
          try {
              const data = await db.getLandingPageConfig();
              if (data) {
                  // Ensure array exists for legacy configs
                  const safeData = {
                      ...DEFAULT_CONFIG,
                      ...data,
                      navLoginVisible: data.navLoginVisible !== undefined ? data.navLoginVisible : true,
                      navRegisterVisible: data.navRegisterVisible !== undefined ? data.navRegisterVisible : true,
                      footerColumns: data.footerColumns || DEFAULT_CONFIG.footerColumns,
                      sectionOrder: data.sectionOrder || DEFAULT_CONFIG.sectionOrder,
                      heroButtons: data.heroButtons || DEFAULT_CONFIG.heroButtons, // Ensure buttons exist
                      heroVisible: data.heroVisible !== undefined ? data.heroVisible : true, // Default visible
                      authCardVisible: data.authCardVisible !== undefined ? data.authCardVisible : true,
                      featuresVisible: data.featuresVisible !== undefined ? data.featuresVisible : true,
                      features: data.features || DEFAULT_CONFIG.features,
                      featuresTitle: data.featuresTitle || DEFAULT_CONFIG.featuresTitle
                  };
                  setConfig(safeData);
              }
          } catch (e) {
              console.warn("Could not load landing config, using defaults.");
          }
      };
      fetchConfig();

      if (user) {
        if (user.role === 'SUPER_ADMIN') {
          navigate('/superadmin');
        } else {
          navigate('/tenant/browse');
        }
      }
    }, [user, navigate]);
  
    const scrollToAuth = () => {
      document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToApp = () => {
      document.getElementById('app-install')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleHeroButtonClick = (url: string, text: string) => {
        let finalUrl = url;

        // SMART FIX: If URL is generic '/auth' but button says "Create Account", force register mode.
        // This handles legacy configurations stored in DB that might point to login.
        if ((finalUrl === '/auth' || finalUrl === '/auth/') && text.toLowerCase().includes('crea')) {
            finalUrl = '/auth?mode=register';
        }

        if (finalUrl.startsWith('#')) {
            // Internal Scroll
            if (finalUrl === '#auth') scrollToAuth();
            if (finalUrl === '#app') scrollToApp();
        } else if (finalUrl.startsWith('/')) {
            // Internal Route (like /auth)
            navigate(finalUrl);
        } else {
            // External Link
            window.location.href = finalUrl;
        }
    };

    const handleFooterLinkClick = (e: React.MouseEvent, url: string) => {
        // If url is internal link to page, navigate
        if (url.startsWith('/')) {
            e.preventDefault();
            navigate(url);
            return;
        }

        // Legacy Modal Support (if needed)
        if (url === '#terms') {
            e.preventDefault();
            setLegalModalOpen('TERMS');
        } else if (url === '#privacy') {
            e.preventDefault();
            setLegalModalOpen('PRIVACY');
        }
    };

    // --- RENDER SECTIONS ---

    const FeaturesSection = () => {
        const getIcon = (iconName: string) => {
            switch(iconName) {
                case 'SHIELD': return <Shield className="w-8 h-8 text-blue-500" />;
                case 'HEART': return <Heart className="w-8 h-8 text-rose-500 fill-current" />;
                case 'GLOBE': return <Globe className="w-8 h-8 text-green-500" />;
                case 'ZAP': return <Zap className="w-8 h-8 text-yellow-500" />;
                case 'SMARTPHONE': return <Smartphone className="w-8 h-8 text-purple-500" />;
                case 'MESSAGE': return <MessageCircle className="w-8 h-8 text-indigo-500" />;
                case 'LOCK': return <Lock className="w-8 h-8 text-slate-500" />;
                case 'SEARCH': return <Search className="w-8 h-8 text-blue-400" />;
                case 'USERS': return <Users className="w-8 h-8 text-orange-500" />;
                default: return <Sparkles className="w-8 h-8 text-rose-500" />;
            }
        };

        return (
            <div className="py-20 bg-slate-50 dark:bg-night-900 border-t border-slate-100 dark:border-night-700">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                            {config.featuresTitle}
                        </h2>
                        <div className="w-20 h-1.5 bg-rose-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {config.features.map((feature) => (
                            <div key={feature.id} className="bg-white dark:bg-night-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-night-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 p-4 bg-slate-50 dark:bg-night-900 rounded-2xl inline-block">
                                    {getIcon(feature.icon)}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-night-200 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const StoriesSection = () => (
        <div className="py-20 bg-white dark:bg-night-950" id="success-stories">
           <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-12">
                  {config.storiesTitle}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {config.successStories.map((story) => (
                     <div key={story.id} className="bg-white dark:bg-night-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-100 dark:shadow-none border border-slate-100 dark:border-night-700 group hover:-translate-y-2 transition-transform duration-300">
                        <div className="h-64 overflow-hidden relative">
                            <img 
                                src={story.image || 'https://placehold.co/600x400?text=No+Image'} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                alt={story.names} 
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Broken+Link'}
                            />
                            <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full">{story.names}</div>
                        </div>
                        <div className="p-8">
                            <p className="text-lg text-slate-700 dark:text-night-100 font-medium leading-relaxed">
                            "{story.quote}"
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-rose-500 dark:text-rose-400">
                                <Heart className="w-4 h-4 fill-current" />
                                <span className="text-xs font-bold uppercase tracking-wider">{story.tag}</span>
                            </div>
                        </div>
                     </div>
                 ))}
              </div>
  
              <div className="mt-12 text-center">
                  <a href="#" onClick={(e) => { e.preventDefault(); scrollToAuth(); }} className="text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-white hover:text-rose-600 hover:border-rose-600 dark:hover:text-rose-400 dark:hover:border-rose-400 transition-colors">
                      {config.storiesCtaText}
                  </a>
              </div>
           </div>
        </div>
    );

    const AppInstallSection = () => (
        <div id="app-install" className="py-20 bg-slate-50 dark:bg-night-900 border-t border-slate-200 dark:border-night-700">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide border border-blue-200 dark:border-blue-800 mb-6">
                    <Download className="w-3 h-3" /> Progressive Web App
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
                    {config.appTitle}
                </h2>
                <p className="text-lg text-slate-600 dark:text-night-200 max-w-2xl mx-auto mb-12">
                    {config.appSubtitle}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                    {/* iOS Guide */}
                    <div className="bg-white dark:bg-night-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-night-700 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-night-700 rounded-full flex items-center justify-center">
                                <span className="font-bold text-xl">🍏</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Installazione su iOS</h3>
                        </div>
                        <ol className="space-y-4 text-slate-600 dark:text-night-200 text-sm leading-relaxed flex-1">
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900 dark:text-white min-w-[20px]">1.</span>
                                <span>Apri LoveLink su <strong>Safari</strong>.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900 dark:text-white min-w-[20px]">2.</span>
                                <span className="flex items-center flex-wrap gap-1">
                                    Tocca il pulsante <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-night-700 rounded border border-slate-200 dark:border-night-600 font-bold text-blue-600 text-xs"><Share className="w-3 h-3 mr-1" /> Condividi</span> nella barra in basso.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900 dark:text-white min-w-[20px]">3.</span>
                                <span className="flex items-center flex-wrap gap-1">
                                    Scorri e seleziona <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-night-700 rounded border border-slate-200 dark:border-night-600 font-bold text-slate-700 dark:text-white text-xs"><PlusSquare className="w-3 h-3 mr-1" /> Aggiungi alla schermata Home</span>.
                                </span>
                            </li>
                        </ol>
                    </div>

                    {/* Android Guide */}
                    <div className="bg-white dark:bg-night-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-night-700 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-night-700 rounded-full flex items-center justify-center">
                                <span className="font-bold text-xl">🤖</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Installazione su Android</h3>
                        </div>
                        <ol className="space-y-4 text-slate-600 dark:text-night-200 text-sm leading-relaxed flex-1">
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900 dark:text-white min-w-[20px]">1.</span>
                                <span>Apri LoveLink su <strong>Chrome</strong>.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900 dark:text-white min-w-[20px]">2.</span>
                                <span className="flex items-center flex-wrap gap-1">
                                    Tocca il menu <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-night-700 rounded border border-slate-200 dark:border-night-600 font-bold text-slate-700 dark:text-white text-xs"><MoreVertical className="w-3 h-3" /></span> in alto a destra.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900 dark:text-white min-w-[20px]">3.</span>
                                <span className="flex items-center flex-wrap gap-1">
                                    Seleziona <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-night-700 rounded border border-slate-200 dark:border-night-600 font-bold text-slate-700 dark:text-white text-xs"><Download className="w-3 h-3 mr-1" /> Installa App</span> o "Aggiungi a schermata Home".
                                </span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
  
    return (
      <div className="flex flex-col font-sans text-gray-900 dark:text-night-100 bg-white dark:bg-night-950 transition-colors duration-300">
        
        {/* LEGAL MODAL RENDER (Still kept for backward compatibility if needed by old config links) */}
        <LegalModal type={legalModalOpen} onClose={() => setLegalModalOpen(null)} />

        <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-rose-900/20">
                  <LoveLinkLogo className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">LoveLink</span>
           </div>
           
           <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600 dark:text-night-200 items-center">
              {config.appVisible && <a href="#app-install" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">Scarica App</a>}
              <button onClick={toggleTheme} className="hover:text-rose-600 dark:hover:text-rose-400">
                  {isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
              </button>
           </div>

           <div className="flex items-center gap-3">
               {(config.navLoginVisible ?? true) && (
                   <button onClick={scrollToAuth} className="hidden sm:block px-5 py-2 rounded-full border border-slate-200 dark:border-night-700 hover:border-slate-900 dark:hover:border-night-200 hover:bg-slate-50 dark:hover:bg-night-800 transition-all font-medium text-sm">
                      Accedi
                   </button>
               )}
               {(config.navRegisterVisible ?? true) && (
                   <button onClick={() => navigate('/auth?mode=register')} className="px-5 py-2 rounded-full bg-slate-900 dark:bg-rose-600 text-white hover:bg-slate-800 dark:hover:bg-rose-700 transition-all font-medium text-sm shadow-lg shadow-slate-200 dark:shadow-none">
                      Registrati
                   </button>
               )}
           </div>
        </nav>
  
        <div className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
           {/* Dynamic Background Colors via Config */}
           <div 
                className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full blur-3xl opacity-50 dark:opacity-20 z-0" 
                style={{ backgroundColor: config.heroImageRight || '#fff1f2' }}
           ></div>
           <div 
                className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full blur-3xl opacity-50 dark:opacity-20 z-0"
                style={{ backgroundColor: config.heroImageLeft || '#f5f3ff' }}
           ></div>
  
           <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
              
              {/* Conditional Hero Section */}
              {config.heroVisible && (
                  <div className="lg:w-1/2 text-center lg:text-left space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-night-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wide border border-purple-200 dark:border-night-700">
                          <Sparkles className="w-3 h-3" /> Piattaforma #1 in Italia
                      </div>
                      <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1]">
                          {config.heroTitle}
                      </h1>
                      <p className="text-xl text-slate-600 dark:text-night-200 leading-relaxed max-w-lg mx-auto lg:mx-0">
                          {config.heroSubtitle}
                      </p>
                      
                      {/* Dynamic Buttons */}
                      <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                           {config.heroButtons.map((btn) => {
                               // Styles map
                               const styles = {
                                   'PRIMARY': 'bg-slate-900 dark:bg-rose-600 text-white hover:bg-slate-800 dark:hover:bg-rose-700 shadow-xl shadow-slate-200 dark:shadow-none border-transparent',
                                   'SECONDARY': 'bg-white dark:bg-transparent text-slate-900 dark:text-white border-slate-200 dark:border-night-700 hover:bg-slate-50 dark:hover:bg-night-800',
                                   'OUTLINE': 'bg-transparent border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10'
                               };
                               
                               return (
                                   <button 
                                     key={btn.id}
                                     onClick={() => handleHeroButtonClick(btn.url, btn.text)}
                                     className={`px-8 py-4 rounded-full font-bold text-lg transition-all border flex items-center justify-center gap-2 ${styles[btn.style]}`}
                                   >
                                      {btn.text}
                                   </button>
                               );
                           })}
                      </div>
      
                      <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 dark:text-night-600 font-medium">
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Profili Verificati</span>
                          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-purple-500" /> Privacy Protetta</span>
                      </div>
                  </div>
              )}
  
              {/* AUTH CARD with Visibility Toggle */}
              {config.authCardVisible && (
                  <div className={`w-full max-w-md mx-auto ${config.heroVisible ? 'lg:w-1/2' : 'lg:w-full flex justify-center'}`}>
                     <AuthCard config={config} defaultMode="LOGIN" />
                  </div>
              )}
           </div>
        </div>

        {/* --- DYNAMIC SECTION RENDERING BASED ON ORDER --- */}
        {config.sectionOrder.map((sectionKey) => {
            if (sectionKey === 'FEATURES' && config.featuresVisible) {
                return <FeaturesSection key="features" />;
            }
            if (sectionKey === 'STORIES' && config.storiesVisible) {
                return <StoriesSection key="stories" />;
            }
            if (sectionKey === 'APP' && config.appVisible) {
                return <AppInstallSection key="app" />;
            }
            return null;
        })}
  
        {config.footerVisible && (
            <footer className="bg-white dark:bg-night-950 border-t border-slate-100 dark:border-night-700 py-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {config.footerColumns.map((col, idx) => (
                        <div key={idx}>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">{col.title}</h4>
                            <ul className="space-y-2 text-sm text-slate-500 dark:text-night-200">
                                {col.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <a 
                                            href={link.url} 
                                            onClick={(e) => handleFooterLinkClick(e, link.url)}
                                            className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Social</h4>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-night-800 rounded-full flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900 text-slate-600 dark:text-night-200 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors">FB</div>
                            <div className="w-8 h-8 bg-slate-100 dark:bg-night-800 rounded-full flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900 text-slate-600 dark:text-night-200 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors">IG</div>
                            <div className="w-8 h-8 bg-slate-100 dark:bg-night-800 rounded-full flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900 text-slate-600 dark:text-night-200 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors">TW</div>
                        </div>
                    </div>
                </div>
            </footer>
        )}

        <Footer />
      </div>
    );
};

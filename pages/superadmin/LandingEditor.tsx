
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { LandingPageConfig, SuccessStory, FooterColumn, FooterLink, HeroButton, FeatureItem } from '../../types';
import { Save, Plus, Trash2, LayoutTemplate, Image as ImageIcon, Heart, Info, Smartphone, Grid, Lock, ArrowUp, ArrowDown, Eye, EyeOff, Link as LinkIcon, X, MousePointerClick, Navigation, Star, Zap, Globe, Shield, MessageCircle, Search, Users } from 'lucide-react';
import { useDialog } from '../../context/DialogContext';

const DEFAULT_CONFIG: LandingPageConfig = {
    navLoginVisible: true,
    navRegisterVisible: true,
    heroVisible: true,
    heroTitle: "Appuntamenti in tutta tranquillità.",
    heroSubtitle: "Ti aiutiamo a mostrarti per quello che sei, per farti conoscere persone che ti fanno sentire a tuo agio. Unisciti a Noi",
    heroButtons: [
        { id: 'btn-1', text: "Crea un Account", url: "/auth?mode=register", style: "PRIMARY" }
    ],
    heroImageRight: "", 
    heroImageLeft: "",
    
    authCardVisible: true,
    authCardTitle: "Bentornato",
    authCardSubtitle: "Accedi per continuare a chattare.",
    authButtonText: "Accedi",

    featuresVisible: true,
    featuresTitle: "Perché scegliere LoveLink?",
    features: [
        { id: 'f1', icon: 'SHIELD', title: 'Sicurezza Totale', description: 'I tuoi dati sono protetti con crittografia end-to-end e non vengono mai ceduti a terzi.' },
        { id: 'f2', icon: 'USERS', title: 'Community Reale', description: 'Profili verificati e moderazione attiva 24/7 per garantirti incontri autentici.' },
        { id: 'f3', icon: 'HEART', title: 'Matching Intelligente', description: 'Il nostro algoritmo ti connette con persone compatibili basandosi sui tuoi interessi reali.' }
    ],

    storiesVisible: true,
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

    appVisible: true,
    appTitle: "Porta LoveLink sempre con te",
    appSubtitle: "LoveLink è una Progressive Web App (PWA). Puoi installarla direttamente dal tuo browser senza passare dagli store, risparmiando spazio sul tuo dispositivo.",

    footerVisible: true,
    footerColumns: [
        {
            title: "Panoramica",
            links: [
                { label: "Chi siamo", url: "#" },
                { label: "Carriere", url: "#" },
                { label: "Blog", url: "#" },
                { label: "Termini di Servizio", url: "#terms" },
                { label: "Privacy Policy", url: "#privacy" }
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

const LandingEditor: React.FC = () => {
    const { showAlert } = useDialog();
    const [config, setConfig] = useState<LandingPageConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'HERO' | 'FEATURES' | 'STORIES' | 'APP' | 'FOOTER' | 'ORDERING'>('HERO');

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await db.getLandingPageConfig();
                if (data) {
                    setConfig({ 
                        ...DEFAULT_CONFIG, 
                        ...data,
                        navLoginVisible: data.navLoginVisible !== undefined ? data.navLoginVisible : true,
                        navRegisterVisible: data.navRegisterVisible !== undefined ? data.navRegisterVisible : true,
                        footerColumns: data.footerColumns || DEFAULT_CONFIG.footerColumns,
                        sectionOrder: data.sectionOrder || DEFAULT_CONFIG.sectionOrder,
                        heroButtons: data.heroButtons || DEFAULT_CONFIG.heroButtons,
                        heroVisible: data.heroVisible !== undefined ? data.heroVisible : true,
                        successStories: data.successStories || DEFAULT_CONFIG.successStories,
                        authCardVisible: data.authCardVisible !== undefined ? data.authCardVisible : true,
                        featuresVisible: data.featuresVisible !== undefined ? data.featuresVisible : true,
                        features: data.features || DEFAULT_CONFIG.features,
                        featuresTitle: data.featuresTitle || DEFAULT_CONFIG.featuresTitle
                    });
                }
            } catch (e) {
                console.error("Failed to load landing config", e);
            } finally {
                setLoading(false);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        try {
            const cleanConfig = JSON.parse(JSON.stringify(config));
            await db.saveLandingPageConfig(cleanConfig);
            await showAlert({
                title: 'Modifiche Salvate',
                description: 'La Landing Page è stata aggiornata con successo. Le modifiche sono visibili pubblicamente.'
            });
        } catch (e) {
            console.error(e);
            await showAlert({
                title: 'Errore',
                description: 'Impossibile salvare le modifiche. Verifica che i dati siano corretti.',
                isDanger: true
            });
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

    // --- Hero Helpers ---
    const addHeroButton = () => {
        const newBtn: HeroButton = {
            id: `btn-${Date.now()}`,
            text: 'Nuovo Bottone',
            url: '#',
            style: 'SECONDARY'
        };
        setConfig({ ...config, heroButtons: [...config.heroButtons, newBtn] });
    };

    const removeHeroButton = (id: string) => {
        setConfig({ ...config, heroButtons: config.heroButtons.filter(b => b.id !== id) });
    };

    const updateHeroButton = (id: string, field: keyof HeroButton, value: any) => {
        setConfig({
            ...config,
            heroButtons: config.heroButtons.map(b => b.id === id ? { ...b, [field]: value } : b)
        });
    };

    // --- Helpers for Arrays ---
    const handleStoryChange = (index: number, field: keyof SuccessStory, value: string) => {
        const newStories = [...config.successStories];
        let finalValue = value;
        if (field === 'image') {
             const converted = convertDriveLink(value);
             if (converted) finalValue = converted;
        }
        newStories[index] = { ...newStories[index], [field]: finalValue };
        setConfig({ ...config, successStories: newStories });
    };

    const addStory = () => {
        const newStory: SuccessStory = {
            id: `story-${Date.now()}`,
            names: 'Nuova Coppia',
            quote: 'Scrivi qui la loro storia...',
            image: '',
            tag: 'Nuovo Match'
        };
        setConfig({ ...config, successStories: [...config.successStories, newStory] });
    };

    const removeStory = (index: number) => {
        const newStories = config.successStories.filter((_, i) => i !== index);
        setConfig({ ...config, successStories: newStories });
    };

    // --- Features Helpers ---
    const handleFeatureChange = (index: number, field: keyof FeatureItem, value: string) => {
        const newFeatures = [...config.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setConfig({ ...config, features: newFeatures });
    };

    const addFeature = () => {
        const newFeature: FeatureItem = {
            id: `feat-${Date.now()}`,
            icon: 'SHIELD',
            title: 'Nuova Funzionalità',
            description: 'Descrivi qui il vantaggio per l\'utente...'
        } as FeatureItem;
        setConfig({ ...config, features: [...config.features, newFeature] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = config.features.filter((_, i) => i !== index);
        setConfig({ ...config, features: newFeatures });
    };

    const handleFooterColChange = (colIdx: number, field: string, value: string) => {
        const newCols = [...config.footerColumns];
        if (field === 'title') newCols[colIdx].title = value;
        setConfig({ ...config, footerColumns: newCols });
    };

    const handleFooterLinkChange = (colIdx: number, linkIdx: number, field: keyof FooterLink, value: string) => {
        const newCols = [...config.footerColumns];
        newCols[colIdx].links[linkIdx] = { ...newCols[colIdx].links[linkIdx], [field]: value };
        setConfig({ ...config, footerColumns: newCols });
    };

    const addFooterLink = (colIdx: number) => {
        const newCols = [...config.footerColumns];
        newCols[colIdx].links.push({ label: 'Nuovo Link', url: '#' });
        setConfig({ ...config, footerColumns: newCols });
    };

    const removeFooterLink = (colIdx: number, linkIdx: number) => {
        const newCols = [...config.footerColumns];
        newCols[colIdx].links = newCols[colIdx].links.filter((_, i) => i !== linkIdx);
        setConfig({ ...config, footerColumns: newCols });
    };

    const addFooterColumn = () => {
        setConfig({
            ...config,
            footerColumns: [...config.footerColumns, { title: "Nuova Colonna", links: [] }]
        });
    };

    const removeFooterColumn = (idx: number) => {
        setConfig({
            ...config,
            footerColumns: config.footerColumns.filter((_, i) => i !== idx)
        });
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...config.sectionOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setConfig({ ...config, sectionOrder: newOrder });
    };

    if (loading) return <div className="p-8 text-center">Caricamento configurazione...</div>;

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-night-200'}`}
        >
            <Icon className="w-4 h-4"/> {label}
        </button>
    );

    const VisibilityToggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
        <div className="flex items-center justify-between bg-slate-50 dark:bg-night-900 p-4 rounded-xl border border-slate-200 dark:border-night-700 mb-6">
            <span className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                {checked ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                {label}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );

    return (
        <div className="p-8 bg-slate-50 dark:bg-night-950 min-h-screen text-slate-900 dark:text-white pb-32">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Editor Landing Page</h1>
                    <p className="text-slate-500 dark:text-night-200">Gestisci contenuti, layout e visibilità.</p>
                </div>
                <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all sticky top-4 z-50">
                    <Save className="w-5 h-5" /> Salva Pubblicazione
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-night-700 overflow-x-auto">
                <TabButton id="HERO" label="Hero & Auth" icon={LayoutTemplate} />
                <TabButton id="FEATURES" label="Funzionalità" icon={Star} />
                <TabButton id="STORIES" label="Storie" icon={Heart} />
                <TabButton id="APP" label="App & PWA" icon={Smartphone} />
                <TabButton id="FOOTER" label="Footer" icon={Grid} />
                <TabButton id="ORDERING" label="Struttura" icon={ArrowUp} />
            </div>

            <div className="animate-in fade-in max-w-5xl">
                
                {/* HERO TAB */}
                {activeTab === 'HERO' && (
                    <div className="space-y-6">
                        
                        {/* NAVIGATION SETTINGS */}
                        <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-600">
                                <Navigation className="w-5 h-5" /> Navigazione Superiore
                            </h3>
                            <div className="space-y-2">
                                <VisibilityToggle label="Mostra Bottone Accedi" checked={config.navLoginVisible ?? true} onChange={(v) => setConfig({...config, navLoginVisible: v})} />
                                <VisibilityToggle label="Mostra Bottone Registrati" checked={config.navRegisterVisible ?? true} onChange={(v) => setConfig({...config, navRegisterVisible: v})} />
                            </div>
                        </div>

                        <VisibilityToggle label="Mostra Intera Sezione Hero" checked={config.heroVisible} onChange={(v) => setConfig({...config, heroVisible: v})} />

                        {config.heroVisible && (
                        <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-purple-600">
                                <LayoutTemplate className="w-5 h-5" /> Contenuti Hero
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo Principale</label>
                                    <input type="text" className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white"
                                        value={config.heroTitle} onChange={(e) => setConfig({...config, heroTitle: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sottotitolo</label>
                                    <textarea className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white h-24"
                                        value={config.heroSubtitle} onChange={(e) => setConfig({...config, heroSubtitle: e.target.value})} />
                                </div>
                                
                                {/* Dynamic Buttons */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bottoni CTA</label>
                                    <div className="space-y-3">
                                        {config.heroButtons.map((btn, idx) => (
                                            <div key={btn.id} className="flex flex-col md:flex-row gap-3 p-3 bg-slate-50 dark:bg-night-900 rounded-lg border border-slate-200 dark:border-night-700 items-start md:items-center">
                                                <div className="flex-1 w-full">
                                                    <input 
                                                        type="text" placeholder="Testo Bottone"
                                                        className="w-full p-2 border rounded dark:bg-night-800 dark:border-night-600 dark:text-white text-sm"
                                                        value={btn.text} onChange={(e) => updateHeroButton(btn.id, 'text', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <input 
                                                        type="text" placeholder="Link (es. /auth o https://...)"
                                                        className="w-full p-2 border rounded dark:bg-night-800 dark:border-night-600 dark:text-white text-sm font-mono text-blue-600"
                                                        value={btn.url} onChange={(e) => updateHeroButton(btn.id, 'url', e.target.value)}
                                                    />
                                                    <div className="text-[10px] text-slate-400 mt-1">Usa <strong>/auth?mode=register</strong> per Registrazione.</div>
                                                </div>
                                                <div className="w-full md:w-auto">
                                                    <select 
                                                        className="w-full p-2 border rounded dark:bg-night-800 dark:border-night-600 dark:text-white text-sm"
                                                        value={btn.style} onChange={(e) => updateHeroButton(btn.id, 'style', e.target.value)}
                                                    >
                                                        <option value="PRIMARY">Primario (Scuro/Rose)</option>
                                                        <option value="SECONDARY">Secondario (Chiaro)</option>
                                                        <option value="OUTLINE">Bordo (Outline)</option>
                                                    </select>
                                                </div>
                                                <button onClick={() => removeHeroButton(btn.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addHeroButton} className="mt-3 text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                        <Plus className="w-4 h-4" /> Aggiungi Bottone
                                    </button>
                                </div>
                            </div>
                        </div>
                        )}

                        <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-rose-600">
                                    <Lock className="w-5 h-5" /> Testi Form di Login/Registrazione
                                </h3>
                                <VisibilityToggle label="Mostra Modulo Login" checked={config.authCardVisible} onChange={(v) => setConfig({...config, authCardVisible: v})} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo Card</label>
                                    <input type="text" className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white"
                                        value={config.authCardTitle} onChange={(e) => setConfig({...config, authCardTitle: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sottotitolo Card</label>
                                    <input type="text" className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white"
                                        value={config.authCardSubtitle} onChange={(e) => setConfig({...config, authCardSubtitle: e.target.value})} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Testo Bottone Accedi</label>
                                    <input type="text" className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white"
                                        value={config.authButtonText} onChange={(e) => setConfig({...config, authButtonText: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FEATURES TAB (NEW) */}
                {activeTab === 'FEATURES' && (
                    <div className="space-y-6">
                        <VisibilityToggle label="Mostra Sezione Funzionalità" checked={config.featuresVisible} onChange={(v) => setConfig({...config, featuresVisible: v})} />
                        
                        {config.featuresVisible && (
                            <>
                                <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo Sezione</label>
                                    <input type="text" className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white mb-4"
                                        value={config.featuresTitle} onChange={(e) => setConfig({...config, featuresTitle: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {config.features.map((feature, index) => (
                                        <div key={feature.id} className="bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm p-4 space-y-3 relative group">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 bg-slate-100 dark:bg-night-700 rounded-lg">
                                                    {/* Icon Selector Preview */}
                                                    {feature.icon === 'SHIELD' && <Shield className="w-6 h-6 text-slate-600 dark:text-slate-300" />}
                                                    {feature.icon === 'HEART' && <Heart className="w-6 h-6 text-rose-500" />}
                                                    {feature.icon === 'GLOBE' && <Globe className="w-6 h-6 text-blue-500" />}
                                                    {feature.icon === 'ZAP' && <Zap className="w-6 h-6 text-yellow-500" />}
                                                    {feature.icon === 'SMARTPHONE' && <Smartphone className="w-6 h-6 text-slate-600 dark:text-slate-300" />}
                                                    {feature.icon === 'MESSAGE' && <MessageCircle className="w-6 h-6 text-purple-500" />}
                                                    {feature.icon === 'LOCK' && <Lock className="w-6 h-6 text-slate-600 dark:text-slate-300" />}
                                                    {feature.icon === 'SEARCH' && <Search className="w-6 h-6 text-blue-400" />}
                                                    {feature.icon === 'USERS' && <Users className="w-6 h-6 text-orange-500" />}
                                                </div>
                                                <button onClick={() => removeFeature(index)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Icona</label>
                                                <select 
                                                    className="w-full border rounded p-1 text-sm dark:bg-night-900 dark:border-night-600 dark:text-white"
                                                    value={feature.icon}
                                                    onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                                                >
                                                    <option value="SHIELD">Sicurezza (Shield)</option>
                                                    <option value="HEART">Cuore (Heart)</option>
                                                    <option value="GLOBE">Mondo (Globe)</option>
                                                    <option value="ZAP">Fulmine (Zap)</option>
                                                    <option value="SMARTPHONE">Telefono (Smartphone)</option>
                                                    <option value="MESSAGE">Messaggio (Message)</option>
                                                    <option value="LOCK">Lucchetto (Lock)</option>
                                                    <option value="SEARCH">Lente (Search)</option>
                                                    <option value="USERS">Utenti (Users)</option>
                                                </select>
                                            </div>

                                            <input type="text" className="w-full border-b bg-transparent py-1 text-sm outline-none font-bold" value={feature.title} onChange={(e) => handleFeatureChange(index, 'title', e.target.value)} placeholder="Titolo Funzionalità" />
                                            <textarea className="w-full border rounded bg-transparent p-2 text-sm outline-none h-20 resize-none" value={feature.description} onChange={(e) => handleFeatureChange(index, 'description', e.target.value)} placeholder="Descrizione..." />
                                        </div>
                                    ))}
                                    <button onClick={addFeature} className="h-full min-h-[250px] border-2 border-dashed border-slate-300 dark:border-night-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-colors">
                                        <Plus className="w-8 h-8 mb-2" /> Aggiungi Feature
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* STORIES TAB */}
                {activeTab === 'STORIES' && (
                    <div className="space-y-6">
                        <VisibilityToggle label="Mostra Sezione Storie di Successo" checked={config.storiesVisible} onChange={(v) => setConfig({...config, storiesVisible: v})} />
                        
                        {config.storiesVisible && (
                            <>
                                <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo Sezione</label>
                                    <input type="text" className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white mb-4"
                                        value={config.storiesTitle} onChange={(e) => setConfig({...config, storiesTitle: e.target.value})} />
                                    
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Testo Link Finale</label>
                                    <input type="text" className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white"
                                        value={config.storiesCtaText} onChange={(e) => setConfig({...config, storiesCtaText: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {config.successStories.map((story, index) => (
                                        <div key={story.id} className="bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm overflow-hidden group">
                                            <div className="h-40 bg-slate-100 relative">
                                                <img src={story.image} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image'} />
                                                <button onClick={() => removeStory(index)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <input type="text" className="w-full border-b bg-transparent py-1 text-sm outline-none font-bold" value={story.names} onChange={(e) => handleStoryChange(index, 'names', e.target.value)} placeholder="Nomi" />
                                                <input type="text" className="w-full border-b bg-transparent py-1 text-sm outline-none" value={story.image} onChange={(e) => handleStoryChange(index, 'image', e.target.value)} placeholder="URL Immagine" />
                                                <input type="text" className="w-full border-b bg-transparent py-1 text-sm outline-none text-rose-500" value={story.tag} onChange={(e) => handleStoryChange(index, 'tag', e.target.value)} placeholder="Tag" />
                                                <textarea className="w-full border rounded bg-transparent p-2 text-sm outline-none h-20" value={story.quote} onChange={(e) => handleStoryChange(index, 'quote', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addStory} className="h-full min-h-[300px] border-2 border-dashed border-slate-300 dark:border-night-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-colors">
                                        <Plus className="w-8 h-8 mb-2" /> Aggiungi Storia
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* APP TAB */}
                {activeTab === 'APP' && (
                    <div className="space-y-6">
                        <VisibilityToggle label="Mostra Sezione Installazione App" checked={config.appVisible} onChange={(v) => setConfig({...config, appVisible: v})} />
                        
                        {config.appVisible && (
                            <div className="bg-white dark:bg-night-800 p-6 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-600">
                                    <Smartphone className="w-5 h-5" /> Contenuti Sezione App
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo</label>
                                        <input type="text" className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white"
                                            value={config.appTitle} onChange={(e) => setConfig({...config, appTitle: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrizione</label>
                                        <textarea className="w-full border dark:border-night-600 p-3 rounded-lg dark:bg-night-900 dark:text-white h-24"
                                            value={config.appSubtitle} onChange={(e) => setConfig({...config, appSubtitle: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* FOOTER TAB */}
                {activeTab === 'FOOTER' && (
                    <div className="space-y-6">
                        <VisibilityToggle label="Mostra Footer" checked={config.footerVisible} onChange={(v) => setConfig({...config, footerVisible: v})} />
                        
                        {config.footerVisible && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {config.footerColumns.map((col, colIdx) => (
                                    <div key={colIdx} className="bg-white dark:bg-night-800 p-5 rounded-xl border border-slate-200 dark:border-night-700 shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <input 
                                                type="text" 
                                                className="font-bold text-lg bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full dark:text-white"
                                                value={col.title}
                                                onChange={(e) => handleFooterColChange(colIdx, 'title', e.target.value)}
                                            />
                                            <button onClick={() => removeFooterColumn(colIdx)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                        <div className="space-y-3">
                                            {col.links.map((link, linkIdx) => (
                                                <div key={linkIdx} className="flex gap-2 items-center bg-slate-50 dark:bg-night-900 p-2 rounded">
                                                    <div className="flex-1 space-y-1">
                                                        <input 
                                                            type="text" 
                                                            className="w-full bg-transparent text-sm font-medium outline-none dark:text-white"
                                                            value={link.label}
                                                            onChange={(e) => handleFooterLinkChange(colIdx, linkIdx, 'label', e.target.value)}
                                                            placeholder="Label Link"
                                                        />
                                                        <div className="flex items-center gap-1">
                                                            <LinkIcon className="w-3 h-3 text-slate-400"/>
                                                            <input 
                                                                type="text" 
                                                                className="w-full bg-transparent text-xs text-blue-500 outline-none"
                                                                value={link.url}
                                                                onChange={(e) => handleFooterLinkChange(colIdx, linkIdx, 'url', e.target.value)}
                                                                placeholder="https://"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeFooterLink(colIdx, linkIdx)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addFooterLink(colIdx)} className="w-full py-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                                + Aggiungi Link
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addFooterColumn} className="min-h-[200px] border-2 border-dashed border-slate-300 dark:border-night-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-colors">
                                    <Plus className="w-8 h-8 mb-2" /> Aggiungi Colonna
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ORDERING TAB */}
                {activeTab === 'ORDERING' && (
                    <div className="space-y-6 max-w-lg">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 mb-4 flex items-start gap-2">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>Qui puoi cambiare l'ordine in cui appaiono le sezioni centrali della pagina. L'Hero è sempre in alto e il Footer in basso.</p>
                        </div>

                        <div className="bg-white dark:bg-night-800 rounded-xl border border-slate-200 dark:border-night-700 overflow-hidden divide-y divide-slate-100 dark:divide-night-700">
                            {config.sectionOrder.map((section, index) => (
                                <div key={section} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-night-900">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-night-700 rounded-lg text-slate-500">
                                            {section === 'STORIES' && <Heart className="w-5 h-5"/>}
                                            {section === 'APP' && <Smartphone className="w-5 h-5"/>}
                                            {section === 'FEATURES' && <Star className="w-5 h-5"/>}
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-white">
                                            {section === 'STORIES' && 'Storie di Successo'}
                                            {section === 'APP' && 'Installazione App'}
                                            {section === 'FEATURES' && 'Funzionalità'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => moveSection(index, 'up')} 
                                            disabled={index === 0}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-night-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ArrowUp className="w-4 h-4"/>
                                        </button>
                                        <button 
                                            onClick={() => moveSection(index, 'down')} 
                                            disabled={index === config.sectionOrder.length - 1}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-night-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ArrowDown className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LandingEditor;

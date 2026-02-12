
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { AuthCard } from '../components/AuthCard';
import { LandingPageConfig } from '../types';
import { ArrowLeft } from 'lucide-react';

export const AuthPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [config, setConfig] = useState<LandingPageConfig | null>(null);

    // Determine default mode from query param
    const defaultMode = new URLSearchParams(location.search).get('mode') === 'register' ? 'REGISTER' : 'LOGIN';

    useEffect(() => {
        if (user) {
            if (user.role === 'SUPER_ADMIN') {
                navigate('/superadmin');
            } else {
                navigate('/tenant/browse');
            }
        }

        const fetchConfig = async () => {
            try {
                const data = await db.getLandingPageConfig();
                if (data) {
                    setConfig(data);
                }
            } catch (e) {
                console.warn("Could not load landing config, using defaults.");
            }
        };
        fetchConfig();
    }, [user, navigate]);

    // Fallback config matching LandingPage defaults
    const defaultConfig: LandingPageConfig = {
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
        features: [],
        storiesVisible: false,
        storiesTitle: "",
        storiesCtaText: "",
        successStories: [],
        appVisible: false,
        appTitle: "",
        appSubtitle: "",
        footerVisible: false,
        footerColumns: [],
        sectionOrder: []
    };

    const effectiveConfig = config || defaultConfig;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-night-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 bg-rose-100 dark:bg-rose-900/20 z-0"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full blur-3xl opacity-30 bg-purple-100 dark:bg-purple-900/20 z-0"></div>

            <div className="relative z-10 w-full max-w-md">
                <button 
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center text-slate-500 hover:text-rose-600 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Torna alla Home
                </button>

                <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-600 rounded-xl text-white shadow-lg shadow-rose-200 dark:shadow-none mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                          <defs>
                            <linearGradient id="lgrad" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#ff4d88"/>
                              <stop offset="100%" stopColor="#7b2cff"/>
                            </linearGradient>
                          </defs>
                          <path d="M8 5v10c0 2.5 1.5 4 4 4h4" fill="none" stroke="url(#lgrad)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                     </div>
                     <h1 className="text-3xl font-bold text-slate-900 dark:text-white">LoveLink</h1>
                </div>

                <AuthCard config={effectiveConfig} defaultMode={defaultMode} />
            </div>
        </div>
    );
};

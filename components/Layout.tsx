
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { getProfileStatus, SystemMessage } from '../types';
import { getUserAvatar } from '../utils/placeholders';
import { Shield, LayoutDashboard, Search, MessageCircle, Settings, LogOut, Menu, Sun, Moon, Server, Heart, Sparkles, UserCog, PencilRuler, UserCheck, Flame, AlertTriangle, Clock, Megaphone, Layout as LayoutIcon, X, AlertCircle, Info, Download } from 'lucide-react';
// import { usePwaInstall } from '../hooks/usePwaInstall'; // Removed from here as it is used in the page

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

const AlertModal = ({ error, clearError }: { error: string | null, clearError: () => void }) => {
    if (!error) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-night-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 dark:border-night-700 transform transition-all animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-night-100 mb-2">Attenzione</h3>
                    <p className="text-slate-600 dark:text-night-200 text-sm mb-6 leading-relaxed">
                        {error}
                    </p>
                    <button 
                        onClick={clearError}
                        className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-200/20 transition-all"
                    >
                        Ho capito
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, error, clearError } = useAuth();
    const { currentTenant } = useTenant();
    const { isDark, toggleTheme } = useTheme();
    // const { isInstallable, install } = usePwaInstall(); // Moved logic to page
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const [pendingReportsCount, setPendingReportsCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [incomingLikesCount, setIncomingLikesCount] = useState(0);
    const [pendingPhotoRequestsCount, setPendingPhotoRequestsCount] = useState(0);
    
    const [activeSystemMessage, setActiveSystemMessage] = useState<SystemMessage | null>(null);
    
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const profileStatus = user ? getProfileStatus(user) : { status: 'COMPLETE', daysRemaining: 0 };
  
    // 1. Presence Logic
    useEffect(() => {
        if (!user || isSuperAdmin) return;

        // Immediate Presence Update
        db.updateLastActive(user.uid);

        // Heartbeat
        const heartbeat = setInterval(() => {
            db.updateLastActive(user.uid);
        }, 60 * 1000); 

        return () => clearInterval(heartbeat);
    }, [location.pathname, user, isSuperAdmin]);

    // 2. Real-time Listeners for Badges
    useEffect(() => {
      if (isSuperAdmin) {
          // Poll reports for admin (lower frequency fine)
          const checkReports = async () => {
              const reps = await db.getReports('PENDING');
              setPendingReportsCount(reps.length);
          };
          checkReports();
          const interval = setInterval(checkReports, 10000);
          return () => clearInterval(interval);
      } else if (user) {
          // Listener 1: Unread Messages
          const unsubMessages = db.subscribeToUnreadCount(user.uid, (count) => {
              setUnreadMessagesCount(count);
          });

          // Listener 2: Photo Requests
          const unsubRequests = db.subscribeToPhotoRequests(user.uid, 'INCOMING', (reqs) => {
              const pending = reqs.filter(r => r.status === 'PENDING').length;
              setPendingPhotoRequestsCount(pending);
          });

          // Listener 3: System Messages
          const unsubSysMsg = db.subscribeToSystemMessages(true, (msgs) => {
              if (msgs.length > 0) {
                  const topMsg = msgs[0];
                  const dismissKey = `dismissed_sys_msg_${user.uid}_${topMsg.id}`;
                  const storedTimestamp = localStorage.getItem(dismissKey);
                  const currentTimestamp = topMsg.republishedAt || topMsg.createdAt;

                  if (!storedTimestamp || storedTimestamp !== currentTimestamp) {
                      setActiveSystemMessage(topMsg);
                  } else {
                      setActiveSystemMessage(null);
                  }
              } else {
                  setActiveSystemMessage(null);
              }
          });

          // Polling for Incoming Likes (Optimized for Quota)
          const checkLikes = async () => {
              try {
                  // Targeted query: only get users who liked me
                  const usersWhoLikedMe = await db.getUsersWhoLikedMe(user.uid);
                  
                  // Filter out users I have already liked back (matches)
                  const incoming = usersWhoLikedMe.filter(u => 
                      !user.likedUserIds?.includes(u.uid)
                  );
                  setIncomingLikesCount(incoming.length);
              } catch (e) {
                  console.warn("Failed to check likes", e);
              }
          };
          checkLikes();
          // Poll every 60 seconds instead of 10 to save read quota
          const intervalLikes = setInterval(checkLikes, 60000);

          return () => {
              unsubMessages();
              unsubRequests();
              unsubSysMsg();
              clearInterval(intervalLikes);
          };
      }
    }, [user, isSuperAdmin]);

    const dismissSystemMessage = () => {
        if (!activeSystemMessage || !user) return;
        const dismissKey = `dismissed_sys_msg_${user.uid}_${activeSystemMessage.id}`;
        const currentTimestamp = activeSystemMessage.republishedAt || activeSystemMessage.createdAt;
        localStorage.setItem(dismissKey, currentTimestamp);
        setActiveSystemMessage(null);
    };
  
    if (!user) {
      return (
          <div className="min-h-screen bg-white dark:bg-night-950 flex flex-col font-sans relative">
              <AlertModal error={error} clearError={clearError} />
              {children}
          </div>
      );
    }
  
    const bgColor = isSuperAdmin 
      ? 'bg-slate-900 dark:bg-night-900' 
      : 'bg-white dark:bg-night-900';
      
    const textColor = isSuperAdmin 
      ? 'text-slate-300 dark:text-night-200' 
      : 'text-gray-600 dark:text-night-200';
      
    const activeClass = isSuperAdmin 
      ? 'bg-slate-800 text-white dark:bg-night-800 dark:text-white' 
      : 'bg-rose-50 text-rose-600 dark:bg-night-800 dark:text-rose-400';
      
    const logoColor = isSuperAdmin 
      ? 'text-white' 
      : 'text-rose-500';
  
    const userAvatar = getUserAvatar(user);
  
    const NavItem = ({ to, icon: Icon, label, badge, dot }: { to: string, icon: any, label: string, badge?: number, dot?: boolean }) => (
      <Link 
        to={to} 
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-colors relative ${location.pathname === to ? activeClass : `hover:${isSuperAdmin ? 'bg-slate-800 dark:hover:bg-night-800' : 'bg-gray-50 dark:hover:bg-night-800'}`}`}
      >
        <Icon className={`w-5 h-5 mr-3`} />
        <span className="font-medium flex-1">{label}</span>
        {badge && badge > 0 ? (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
        ) : null}
        {dot && (
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
        )}
      </Link>
    );

    const bottomNavLinks = isSuperAdmin ? [
        { to: "/superadmin", icon: LayoutDashboard, label: "Dash" },
        { to: "/superadmin/tenants", icon: Server, label: "Tenant" },
        { to: "/superadmin/insertions", icon: LayoutIcon, label: "Ads" },
        { to: "/superadmin/users", icon: UserCog, label: "Utenti", badge: pendingReportsCount },
        { to: "/superadmin/landing-editor", icon: PencilRuler, label: "Web" },
    ] : [
        { to: "/tenant/browse", icon: Search, label: "Cerca" },
        { to: "/tenant/likes-received", icon: Heart, label: "Like", dot: incomingLikesCount > 0 },
        { to: "/tenant/my-matches", icon: Flame, label: "Match", badge: pendingPhotoRequestsCount },
        { to: "/tenant/messages", icon: MessageCircle, label: "Chat", dot: unreadMessagesCount > 0 },
        { to: "/tenant/profile", icon: Settings, label: "Profilo" },
    ];
  
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-night-950 overflow-hidden relative text-slate-900 dark:text-night-100">
        <AlertModal error={error} clearError={clearError} />
        
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
  
        <aside className={`fixed inset-y-0 left-0 z-[120] w-64 ${bgColor} ${textColor} transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 border-r border-gray-200 dark:border-night-700`}>
          <div className="h-full flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-200/10 dark:border-night-700">
              {isSuperAdmin ? (
                <div className="flex items-center text-white font-bold text-xl">
                  <Shield className="w-6 h-6 mr-2 text-blue-400" /> Control Plane
                </div>
              ) : (
                <div className={`flex items-center font-bold text-xl ${logoColor}`}>
                  <LoveLinkLogo className="w-6 h-6 mr-2 fill-current" /> {currentTenant?.name || 'Dating App'}
                </div>
              )}
            </div>
  
            <div className={`px-6 py-6 border-b ${isSuperAdmin ? 'border-slate-800 dark:border-night-800' : 'border-gray-100 dark:border-night-700'}`}>
              <div className="flex items-center">
                <div className="relative group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border-2 border-white/20 shadow-sm overflow-hidden mr-3 bg-slate-100 dark:bg-night-800">
                    <img src={userAvatar} alt="Me" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className={`absolute bottom-0 right-3 w-3 h-3 rounded-full border-2 border-white dark:border-night-900 ${unreadMessagesCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  
                  {unreadMessagesCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-night-900">
                          {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                      </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isSuperAdmin ? 'text-white' : 'text-slate-900 dark:text-white'} truncate`}>{user.displayName}</p>
                  <p className="text-xs truncate opacity-70">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                   <Link to="/tenant/profile" className={`flex-1 text-xs text-center py-1.5 rounded-md border transition-colors ${isSuperAdmin ? 'border-slate-700 hover:bg-slate-800 dark:border-night-700 dark:hover:bg-night-800' : 'border-gray-200 hover:bg-gray-50 dark:border-night-700 dark:hover:bg-night-800'}`}>
                      Profilo
                   </Link>
                   <button onClick={logout} className={`p-1.5 rounded-md border transition-colors ${isSuperAdmin ? 'border-slate-700 hover:bg-slate-800 dark:border-night-700 dark:hover:bg-night-800' : 'border-gray-200 hover:bg-gray-50 dark:border-night-700 dark:hover:bg-night-800'}`}>
                      <LogOut className="w-4 h-4" />
                   </button>
              </div>
            </div>
  
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {isSuperAdmin ? (
                <>
                  <NavItem to="/superadmin" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem to="/superadmin/tenants" icon={Server} label="Gestione Tenant" />
                  <NavItem to="/superadmin/insertions" icon={LayoutIcon} label="Inserzioni (Ads)" />
                  <NavItem to="/superadmin/users" icon={UserCog} label="Gestione Utenti" badge={pendingReportsCount} />
                  <NavItem to="/superadmin/messages" icon={Megaphone} label="Messaggi Globali" />
                  <NavItem to="/superadmin/landing-editor" icon={PencilRuler} label="Editor Website" />
                </>
              ) : (
                <>
                  <NavItem to="/tenant/browse" icon={Search} label="Cerca Match" />
                  <NavItem to="/tenant/likes-received" icon={Heart} label="Like Ricevuti" dot={incomingLikesCount > 0} />
                  <NavItem to="/tenant/my-likes" icon={Sparkles} label="I Miei Like" />
                  <NavItem to="/tenant/my-matches" icon={Flame} label="I Miei Match" badge={pendingPhotoRequestsCount} />
                  <NavItem 
                      to="/tenant/messages" 
                      icon={MessageCircle} 
                      label="Messaggi" 
                      dot={unreadMessagesCount > 0} 
                  />
                  <NavItem to="/tenant/profile" icon={Settings} label="Impostazioni" />
                </>
              )}
              
              {/* Always show Install App link in menu, removed conditional button logic */}
              <NavItem to="/tenant/install" icon={Download} label="Installa App" />
            </nav>
            
            <div className="px-6 py-4 border-t border-gray-200/10 dark:border-night-700">
              <button 
                  onClick={toggleTheme}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${isSuperAdmin ? 'bg-slate-800 hover:bg-slate-700 dark:bg-night-800 dark:hover:bg-night-700' : 'bg-gray-100 hover:bg-gray-200 dark:bg-night-800 dark:hover:bg-night-700'}`}
              >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? 'Modo Giorno' : 'Modo Notte'}
              </button>
            </div>
          </div>
        </aside>
  
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="md:hidden bg-white dark:bg-night-900 border-b border-gray-200 dark:border-night-700 h-16 flex items-center px-4 justify-between shrink-0 z-20">
             <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-night-700 shadow-sm bg-slate-100 dark:bg-night-800">
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover object-top" />
                 </div>
                 <span className="font-bold text-gray-900 dark:text-white text-lg truncate max-w-[160px]">
                    {user.displayName}
                 </span>
             </div>
             <div className="flex items-center gap-3">
                 {unreadMessagesCount > 0 && !isSuperAdmin && (
                     <Link to="/tenant/messages" className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 p-2 rounded-full">
                         <MessageCircle className="w-5 h-5 fill-current" />
                     </Link>
                 )}
                 <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                   <Menu className="w-6 h-6" />
                 </button>
             </div>
          </header>
          
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0 scroll-smooth">
            {/* SYSTEM MESSAGE BANNER */}
            {activeSystemMessage && !isSuperAdmin && (
                <div className={`relative z-30 shadow-lg ${
                    activeSystemMessage.priority === 'ALERT' ? 'bg-red-600 text-white' : 
                    activeSystemMessage.priority === 'WARNING' ? 'bg-orange-500 text-white' : 
                    'bg-blue-600 text-white'
                }`}>
                    <div className="px-4 py-4 md:px-6 md:py-5 max-w-7xl mx-auto">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                    {activeSystemMessage.priority === 'ALERT' ? <AlertTriangle className="w-5 h-5" /> : 
                                    activeSystemMessage.priority === 'WARNING' ? <AlertCircle className="w-5 h-5" /> : 
                                    <Info className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-base uppercase tracking-wider leading-none">{activeSystemMessage.title}</h4>
                                    <span className="text-[10px] opacity-80 font-medium tracking-wide">COMUNICAZIONE UFFICIALE</span>
                                </div>
                            </div>
                            <button onClick={dismissSystemMessage} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="text-sm md:text-base opacity-95 prose prose-invert max-w-none leading-relaxed mb-4" 
                            dangerouslySetInnerHTML={{ __html: activeSystemMessage.content }} 
                        />

                        {activeSystemMessage.bannerUrl && (
                            <div className="w-full rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black/20">
                                <img 
                                    src={activeSystemMessage.bannerUrl} 
                                    alt="Event Banner" 
                                    className="w-full h-48 md:h-auto max-h-[400px] object-cover object-center transform hover:scale-[1.02] transition-transform duration-500" 
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PROFILE STATUS BANNERS */}
            {!isSuperAdmin && (
                <>
                    {/* 1. WARNING BANNER (Yellow) */}
                    {profileStatus.status === 'WARNING' && (
                        <div 
                            onClick={() => navigate('/tenant/profile')}
                            className="bg-yellow-500 text-white p-3 text-center text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors shadow-md z-30"
                        >
                            <Clock className="w-4 h-4" />
                            Il tuo profilo è incompleto. Hai {profileStatus.daysRemaining} giorni per completarlo ed evitare il blocco.
                        </div>
                    )}

                    {/* 2. BLOCK BANNER (Red) */}
                    {profileStatus.status === 'BLOCKED' && (
                        <div 
                            onClick={() => navigate('/tenant/profile')}
                            className="bg-red-600 text-white p-3 text-center text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-md z-30 animate-pulse"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Profilo incompleto. Le funzionalità social sono bloccate. Clicca per completare.
                        </div>
                    )}
                </>
            )}
  
            {children}
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white dark:bg-night-900 border-t border-gray-200 dark:border-night-700 h-16 flex items-center justify-around z-[100] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none px-2">
              {bottomNavLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  const Icon = link.icon;
                  const iconColor = isSuperAdmin 
                    ? (isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-night-400')
                    : (isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-night-400');

                  return (
                      <Link 
                        key={link.to} 
                        to={link.to} 
                        className={`flex flex-col items-center justify-center w-full h-full transition-transform active:scale-95`}
                      >
                          <div className="relative">
                              <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={isActive ? 2.5 : 2} />
                              
                              {link.badge && link.badge > 0 && (
                                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white dark:border-night-900">
                                      {link.badge > 9 ? '9+' : link.badge}
                                  </span>
                              )}
                              
                              {link.dot && (
                                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-night-900"></span>
                              )}
                          </div>
                          <span className={`text-[10px] font-medium mt-1 ${iconColor}`}>
                              {link.label}
                          </span>
                      </Link>
                  );
              })}
          </div>
        </main>
      </div>
    );
};

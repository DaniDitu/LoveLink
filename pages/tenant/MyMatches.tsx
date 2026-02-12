
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { db } from '../../services/db';
import { User, PhotoRequest, AccessDuration, GalleryPhoto } from '../../types';
import { getUserAvatar } from '../../utils/placeholders';
import { MessageCircle, X, MapPin, CheckCircle2, Flame, Search, ArrowRight, Lock, Eye, EyeOff, Clock, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, Ruler, Weight, Palette, ChevronsUp, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WatermarkImage } from '../../components/WatermarkImage';

// --- USER DETAIL MODAL COMPONENT ---
const UserDetailModal = ({ user, onClose, currentUserId, currentUserName, onNext, onPrev }: { user: User | null, onClose: () => void, currentUserId: string, currentUserName: string, onNext?: () => void, onPrev?: () => void }) => {
    const [requests, setRequests] = useState<PhotoRequest[]>([]);
    const [activePhotoIdx, setActivePhotoIdx] = useState(0);
    const [isRequesting, setIsRequesting] = useState(false);
    
    // Gesture State
    const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
    const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
    const [isImageTouch, setIsImageTouch] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchReqs = async () => {
            try {
                const myRequests = await db.getPhotoRequests(currentUserId, 'OUTGOING');
                const relevant = myRequests.filter(r => r.ownerId === user.uid);
                setRequests(relevant);
            } catch (e) {
                console.warn("Error fetching requests", e);
            }
        };
        fetchReqs();
        setActivePhotoIdx(0);
    }, [user, currentUserId]);

    if (!user) return null;

    const getPhotoAccessStatus = (photo: GalleryPhoto) => {
        if (photo.visibility === 'PUBLIC') return 'APPROVED';
        const req = requests.find(r => r.photoId === photo.id);
        return req ? req.status : 'NONE';
    };

    const handleRequestAccess = async (photo: GalleryPhoto) => {
        setIsRequesting(true);
        try {
            const newReq: PhotoRequest = {
                id: `req-${Date.now()}`,
                requesterId: currentUserId,
                requesterName: currentUserName,
                ownerId: user.uid,
                photoId: photo.id,
                photoUrl: photo.url,
                status: 'PENDING',
                timestamp: new Date().toISOString()
            };
            await db.requestPhotoAccess(newReq);
            setRequests([...requests, newReq]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRequesting(false);
        }
    };

    const displayPhotos = user.gallery || (user.photos || []).map((url, i) => ({ id: `legacy-${i}`, url, visibility: 'PUBLIC' } as GalleryPhoto));
    const mainAvatar = getUserAvatar(user);
    const allDisplayPhotos = [{ url: mainAvatar, id: 'main', visibility: 'PUBLIC' } as GalleryPhoto, ...displayPhotos];
    
    const activePhoto = allDisplayPhotos[activePhotoIdx] || allDisplayPhotos[0];
    const accessStatus = getPhotoAccessStatus(activePhoto);
    const isLocked = activePhoto.visibility !== 'PUBLIC' && accessStatus !== 'APPROVED';

    const isCouple = user.type === 'COUPLE';

    // --- SWIPE GESTURE LOGIC ---
    const minSwipeDistance = 50; 

    const onTouchStart = (e: React.TouchEvent, isImageArea: boolean = false) => {
        setTouchEnd(null);
        setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
        setIsImageTouch(isImageArea);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const xDiff = touchStart.x - touchEnd.x;
        const yDiff = touchStart.y - touchEnd.y;
        
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (Math.abs(xDiff) > minSwipeDistance) {
                if (xDiff > 0) {
                    if (onNext) onNext();
                } else {
                    if (onPrev) onPrev();
                }
            }
        } else {
            if (isImageTouch && Math.abs(yDiff) > minSwipeDistance) {
                if (yDiff > 0) {
                    onClose();
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="bg-white dark:bg-night-800 rounded-3xl w-full max-w-4xl max-h-[85vh] md:max-h-[80vh] shadow-2xl flex flex-col md:flex-row relative overflow-hidden my-auto" 
                onClick={e => e.stopPropagation()}
                onTouchStart={(e) => onTouchStart(e, false)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <button onClick={onClose} className="absolute top-4 right-4 z-[60] p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer shadow-lg">
                    <X className="w-5 h-5" />
                </button>

                <div 
                    className="w-full md:w-1/2 h-[50vh] md:h-auto md:min-h-0 bg-black relative flex items-center justify-center overflow-hidden shrink-0 group cursor-grab active:cursor-grabbing"
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        onTouchStart(e, true);
                    }}
                    onTouchMove={(e) => {
                        e.stopPropagation();
                        onTouchMove(e);
                    }}
                    onTouchEnd={(e) => {
                        e.stopPropagation();
                        onTouchEnd();
                    }}
                >
                    {isLocked ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-white p-6 text-center z-10">
                            <Lock className="w-12 h-12 mb-4 text-rose-500" />
                            <h3 className="text-xl font-bold mb-2">Foto Privata</h3>
                            <p className="text-sm text-slate-300 mb-6">
                                Questa foto è {activePhoto.visibility === 'SUPER_SECRET' ? 'super segreta' : 'privata'}.
                                {accessStatus === 'PENDING' ? ' Richiesta inviata.' : ' Richiedi accesso per vederla.'}
                            </p>
                            {accessStatus === 'NONE' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRequestAccess(activePhoto); }}
                                    disabled={isRequesting}
                                    className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold transition-colors"
                                >
                                    {isRequesting ? 'Richiesta...' : 'Richiedi Accesso'}
                                </button>
                            )}
                            {accessStatus === 'PENDING' && (
                                <div className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full font-bold text-sm flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> In Attesa
                                </div>
                            )}
                            {accessStatus === 'REJECTED' && (
                                <div className="px-4 py-2 bg-red-500/20 text-red-300 rounded-full font-bold text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Accesso Negato
                                </div>
                            )}
                            <img src={activePhoto.url} alt="Locked" className="absolute inset-0 w-full h-full object-cover opacity-10 blur-xl pointer-events-none -z-10" />
                        </div>
                    ) : (
                        <>
                            {/* Blurred Background Layer for better fit */}
                            <div className="absolute inset-0 z-0">
                                <img 
                                    src={activePhoto.url} 
                                    alt="Blur BG" 
                                    className="w-full h-full object-cover opacity-30 blur-2xl scale-110" 
                                />
                            </div>
                            <WatermarkImage 
                                src={activePhoto.url} 
                                alt="Profile" 
                                className="object-contain w-full h-full relative z-10" 
                                containerClassName="w-full h-full relative z-10" 
                            />
                        </>
                    )}
                    
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity md:hidden pointer-events-none">
                        <div className="text-white/90 flex flex-col items-center animate-bounce">
                            <ChevronsUp className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-widest shadow-sm">Swipe Up to Close</span>
                        </div>
                    </div>

                    {allDisplayPhotos.length > 1 && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); setActivePhotoIdx(prev => prev === 0 ? allDisplayPhotos.length - 1 : prev - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors z-30">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActivePhotoIdx(prev => prev === allDisplayPhotos.length - 1 ? 0 : prev + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors z-30">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                                {allDisplayPhotos.map((_, idx) => (
                                    <div key={idx} className={`w-2 h-2 rounded-full ${idx === activePhotoIdx ? 'bg-white' : 'bg-white/40'}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="w-full md:w-1/2 p-6 md:p-8 bg-white dark:bg-night-800 flex-1 overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                            {user.displayName}, {user.age}
                            {user.isVerified && <CheckCircle2 className="w-6 h-6 text-blue-500 fill-current bg-white rounded-full" />}
                        </h2>
                        <div className="flex items-center text-slate-500 dark:text-night-200">
                            <MapPin className="w-4 h-4 mr-1" />
                            {user.city ? `${user.city}, ${user.region}` : user.location}
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-night-900 rounded-xl p-4 mb-6 border border-slate-100 dark:border-night-700">
                        {isCouple ? (
                            <div className="grid grid-cols-2 gap-6 relative">
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-night-700 -ml-px"></div>
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase text-purple-600 tracking-wider mb-2">Partner 1</h4>
                                    <StatRow icon={Ruler} label="Altezza" value={user.height ? `${user.height} cm` : '--'} />
                                    <StatRow icon={Weight} label="Peso" value={user.weight ? `${user.weight} kg` : '--'} />
                                </div>
                                <div className="space-y-3 pl-2">
                                    <h4 className="text-xs font-bold uppercase text-purple-600 tracking-wider mb-2">Partner 2</h4>
                                    <StatRow icon={Ruler} label="Altezza" value={user.partnerDetails?.height ? `${user.partnerDetails.height} cm` : '--'} />
                                    <StatRow icon={Weight} label="Peso" value={user.partnerDetails?.weight ? `${user.partnerDetails.weight} kg` : '--'} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <StatRow icon={Ruler} label="Altezza" value={user.height ? `${user.height} cm` : '--'} />
                                <StatRow icon={Weight} label="Peso" value={user.weight ? `${user.weight} kg` : '--'} />
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-400 dark:text-night-200 uppercase mb-2">Biografia</h3>
                        <p className="text-slate-700 dark:text-white text-sm leading-relaxed italic">"{user.bio || "Nessuna descrizione disponibile."}"</p>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-400 dark:text-night-200 uppercase mb-2">Interessi</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.interests?.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-100 dark:border-rose-900">{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <Link 
                            to="/tenant/messages" 
                            state={{ newMatchId: user.uid }}
                            className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 dark:shadow-none"
                        >
                            <MessageCircle className="w-5 h-5" /> Invia Messaggio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400 dark:text-night-200" />
        <div>
            <p className="text-[10px] text-slate-400 dark:text-night-600 uppercase font-bold leading-none">{label}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-white leading-tight">{value}</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const MyMatches: React.FC = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [matches, setMatches] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
        const tenantId = user?.tenantId || currentTenant?.id;
        if (!user || !tenantId) return;
        
        setIsLoading(true);
        try {
            // My matches are users who I liked AND who liked me
            if (!user.likedUserIds || user.likedUserIds.length === 0) {
                setMatches([]);
                return;
            }

            // Fetch users who liked me
            const likers = await db.getUsersWhoLikedMe(user.uid);
            
            // Filter to keep only those I also liked
            const mutual = likers.filter(u => user.likedUserIds?.includes(u.uid));
            setMatches(mutual);
        } catch (e) {
            console.error("Error fetching matches", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchMatches();
  }, [user, currentTenant]);

  if (!user) return null;

  const handleNextUser = () => {
      if (!selectedUser) return;
      const currentIdx = matches.findIndex(u => u.uid === selectedUser.uid);
      if (currentIdx !== -1 && currentIdx < matches.length - 1) {
          setSelectedUser(matches[currentIdx + 1]);
      }
  };

  const handlePrevUser = () => {
      if (!selectedUser) return;
      const currentIdx = matches.findIndex(u => u.uid === selectedUser.uid);
      if (currentIdx > 0) {
          setSelectedUser(matches[currentIdx - 1]);
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          currentUserId={user.uid}
          currentUserName={user.displayName}
          onNext={handleNextUser}
          onPrev={handlePrevUser}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Flame className="w-7 h-7 text-rose-500 fill-current" /> I Miei Match
        </h1>
        <p className="text-gray-500 dark:text-night-200">
            Qui trovi le persone con cui c'è stato un "It's a Match!". Puoi chattare liberamente.
        </p>
      </div>

      {isLoading ? (
          <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
              <p className="mt-4 text-slate-500">Caricamento match...</p>
          </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-night-800 rounded-xl shadow-sm border border-gray-200 dark:border-night-700">
          <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-night-900 rounded-full flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-rose-300 dark:text-rose-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ancora nessun match</h3>
          <p className="text-gray-500 dark:text-night-200 mt-2 mb-6">Continua a esplorare e mettere like per trovare l'anima gemella!</p>
          <Link to="/tenant/browse" className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors flex items-center justify-center w-fit mx-auto gap-2">
            <Search className="w-4 h-4" /> Esplora Profili
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {matches.map((match) => (
              <div 
                key={match.uid} 
                className="bg-white dark:bg-night-800 rounded-2xl shadow-sm border border-gray-100 dark:border-night-700 overflow-hidden relative group transition-all duration-300 hover:shadow-md cursor-pointer"
                onClick={() => setSelectedUser(match)}
              >
                <div className="relative h-64 bg-gray-200 dark:bg-night-900">
                  <WatermarkImage 
                    src={getUserAvatar(match)} 
                    alt={match.displayName} 
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                     <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{match.displayName}, {match.age}</h3>
                        {match.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-400 fill-current bg-white rounded-full" />}
                     </div>
                     <div className="flex items-center text-sm opacity-90">
                        <MapPin className="w-3 h-3 mr-1" />
                        {match.city || match.location}
                     </div>
                  </div>
                </div>

                <div className="p-4">
                   <p className="text-sm text-gray-600 dark:text-night-200 line-clamp-2 italic mb-4 min-h-[2.5rem]">
                       "{match.bio || 'Nessuna bio...'}"
                   </p>

                   <div className="flex gap-2">
                       <Link 
                         to="/tenant/messages" 
                         state={{ newMatchId: match.uid }}
                         onClick={(e) => e.stopPropagation()}
                         className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-rose-100 dark:shadow-none"
                       >
                         <MessageCircle className="w-4 h-4" /> Chat
                       </Link>
                       <button 
                         onClick={() => setSelectedUser(match)}
                         className="px-3 py-2.5 bg-slate-100 dark:bg-night-700 text-slate-600 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-night-600 transition-colors"
                         title="Vedi Profilo"
                       >
                           <Search className="w-4 h-4" />
                       </button>
                   </div>
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMatches;

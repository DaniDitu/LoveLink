
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useDialog } from '../../context/DialogContext';
import { isMatchCompatible, isUserOnline } from '../../config/matchRules.config';
import { db } from '../../services/db'; 
import { User, getProfileStatus, Insertion, GenderType } from '../../types';
import { getUserAvatar } from '../../utils/placeholders';
import { Heart, X, MapPin, CheckCircle2, EyeOff, Search, Sparkles, Filter, Flag, Users as UsersIcon, ChevronLeft, ChevronRight, Share2, ExternalLink, Link as LinkIcon, Ruler, Weight, Palette, Lock, Maximize2, ChevronsUp, RefreshCw } from 'lucide-react';
import { WatermarkImage } from '../../components/WatermarkImage';

// --- AD DETAIL MODAL ---
const AdDetailModal = ({ ad, onClose, currentUserId }: { ad: Insertion | null, onClose: () => void, currentUserId: string }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (ad) {
            setIsLiked(ad.likedUserIds?.includes(currentUserId) || false);
            setLikeCount(ad.likedUserIds?.length || 0);
        }
    }, [ad, currentUserId]);

    if (!ad) return null;

    const handleLike = async () => {
        const newState = !isLiked;
        setIsLiked(newState);
        setLikeCount(prev => newState ? prev + 1 : prev - 1);
        await db.toggleInsertionLike(ad.id, currentUserId);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-night-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
                
                <div className="relative h-[50vh] bg-slate-900">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-contain" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h2 className="text-2xl font-bold text-white">{ad.title}</h2>
                        <span className="text-white/80 text-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {ad.subtitle}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 dark:text-night-200 text-lg leading-relaxed mb-6 italic">
                        "{ad.description}"
                    </p>
                    
                    <div className="flex gap-4 items-center">
                        <button 
                            onClick={handleLike}
                            className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${isLiked ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                        >
                            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="font-bold">{likeCount}</span>
                        </button>
                        
                        <a 
                            href={ad.externalLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-center flex items-center justify-center gap-2 shadow-lg"
                        >
                            {ad.buttonText} <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- AD CARD COMPONENT ---
const AdvertisementCard: React.FC<{ ad: Insertion, currentUserId: string, onExpand: () => void }> = ({ ad, currentUserId, onExpand }) => {
    const [isLiked, setIsLiked] = useState(ad.likedUserIds?.includes(currentUserId) || false);
    const [likeCount, setLikeCount] = useState(ad.likedUserIds?.length || 0);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newState = !isLiked;
        setIsLiked(newState);
        setLikeCount(prev => newState ? prev + 1 : prev - 1);
        await db.toggleInsertionLike(ad.id, currentUserId);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: ad.title,
                    text: ad.description,
                    url: ad.externalLink
                });
            } catch (err) {
                console.log("Share skipped", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(ad.externalLink);
                alert("Link copiato negli appunti!");
            } catch (err) {
                console.error("Clipboard failed", err);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-night-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-indigo-100 dark:border-indigo-900/30 group relative">
            <div 
                className="relative h-64 bg-slate-100 dark:bg-night-900 cursor-pointer"
                onClick={onExpand}
            >
                <WatermarkImage 
                    src={ad.imageUrl} 
                    alt={ad.title}
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    containerClassName="w-full h-full"
                    noWatermark={true} 
                />
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                        <Maximize2 className="w-6 h-6" />
                    </div>
                </div>
                
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start pointer-events-none">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 ring-2 ring-white">
                        <Sparkles className="w-3 h-3" /> {ad.subtitle}
                    </span>
                </div>

                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
                    <button 
                        onClick={handleShare}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pointer-events-none">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white text-xl font-bold">{ad.title}</h3>
                        <ExternalLink className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex items-center text-white/90 text-sm mt-1">
                        <LinkIcon className="w-3 h-3 mr-1" /> Promozione
                    </div>
                </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
                <p className="text-gray-600 dark:text-night-200 text-sm line-clamp-3 mb-4 italic min-h-[3rem]">
                    "{ad.description}"
                </p>

                <div className="mt-auto flex items-center gap-3">
                    <button 
                        onClick={handleLike}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${isLiked ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        {likeCount > 0 && <span className="text-xs font-bold">{likeCount}</span>}
                    </button>

                    <a 
                        href={ad.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-center block hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
                    >
                        {ad.buttonText}
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- USER DETAIL MODAL COMPONENT ---
const UserDetailModal = ({ user, onClose, onNext, onPrev }: { user: User | null, onClose: () => void, onNext?: () => void, onPrev?: () => void }) => {
    const [activePhotoIdx, setActivePhotoIdx] = useState(0);
    const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
    const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
    const [isImageTouch, setIsImageTouch] = useState(false);

    useEffect(() => {
        setActivePhotoIdx(0);
    }, [user]);

    if (!user) return null;

    const displayPhotos = user.gallery 
        ? user.gallery.filter(p => p.visibility === 'PUBLIC') 
        : (user.photos || []).map(url => ({ url, id: url, visibility: 'PUBLIC' }));
    
    const mainAvatar = getUserAvatar(user);
    const allDisplayPhotos = [{ url: mainAvatar, id: 'main', visibility: 'PUBLIC' }, ...displayPhotos];
    const activePhoto = allDisplayPhotos[activePhotoIdx] || allDisplayPhotos[0];

    const isCouple = user.type === 'COUPLE';

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
                if (xDiff > 0) { if (onNext) onNext(); } else { if (onPrev) onPrev(); }
            }
        } else {
            if (isImageTouch && Math.abs(yDiff) > minSwipeDistance) { if (yDiff > 0) onClose(); }
        }
    };

    const getOrientationLabel = (val?: string) => {
        switch(val) {
            case 'HETERO': return 'Eterosessuale';
            case 'GAY': return 'Omosessuale';
            case 'BISEXUAL': return 'Bisessuale';
            default: return 'Non specificato';
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
                    onTouchStart={(e) => { e.stopPropagation(); onTouchStart(e, true); }}
                    onTouchMove={(e) => { e.stopPropagation(); onTouchMove(e); }}
                    onTouchEnd={(e) => { e.stopPropagation(); onTouchEnd(); }}
                >
                    <div className="absolute inset-0 z-0">
                        <img src={activePhoto.url} alt="Blur BG" className="w-full h-full object-cover opacity-30 blur-2xl scale-110" />
                    </div>

                    <WatermarkImage src={activePhoto.url} alt="Profile" className="object-contain w-full h-full relative z-10" containerClassName="w-full h-full relative z-10" />
                    
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

                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-night-600 uppercase tracking-wider mb-2">Preferenze</h4>
                        {isCouple && user.couplePreferences ? (
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                                    Lui: {getOrientationLabel(user.couplePreferences.man)}
                                </span>
                                <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800">
                                    Lei: {getOrientationLabel(user.couplePreferences.woman)}
                                </span>
                            </div>
                        ) : (
                            <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800 inline-block">
                                {getOrientationLabel(user.sexualOrientation)}
                            </span>
                        )}
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
const Browse: React.FC = () => {
  const { user, blockUser, toggleLike, reportUser } = useAuth();
  const { currentTenant } = useTenant();
  const { showConfirm, showPrompt } = useDialog();

  const [candidates, setCandidates] = useState<User[]>([]);
  const [insertions, setInsertions] = useState<Insertion[]>([]);
  const [hiddenProfileIds, setHiddenProfileIds] = useState<Set<string>>(new Set());
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
      searchTerm: '',
      selectedCategory: '',
      selectedGender: '' as GenderType | '',
      interactionFilter: 'ALL' 
  });
  
  const [animatingMatchId, setAnimatingMatchId] = useState<string | null>(null);
  const [matchIsMutual, setMatchIsMutual] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAd, setSelectedAd] = useState<Insertion | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = async (isLoadMore = false) => {
      if (!user) return;
      const tenantId = user.tenantId || currentTenant?.id || 'default-tenant';
      if (!isLoadMore) { setIsLoadingUsers(true); setHasMore(true); setLastDoc(null); } else { setIsFetchingMore(true); }

      try {
          const result = await db.getBrowsableUsers(tenantId, 20, isLoadMore ? lastDoc : undefined);
          
          // HOTFIX: Infinite Loop Prevention
          // If we receive no pagination cursor (fallback mode) or very few items, we must stop asking for more.
          if (!result.lastDoc || result.users.length < 20) {
              setHasMore(false);
          }

          if (isLoadMore) {
              setCandidates(prev => {
                  const existingIds = new Set(prev.map(u => u.uid));
                  const newUsers = result.users.filter(u => !existingIds.has(u.uid) && u.uid !== user.uid);
                  return [...prev, ...newUsers];
              });
          } else {
              setCandidates(result.users.filter(u => u.uid !== user.uid));
              const ads = await db.getInsertions(tenantId, true);
              setInsertions(ads);
          }
          setLastDoc(result.lastDoc);
      } catch (e) { 
          console.error("Failed to load browse data", e); 
          setHasMore(false); 
      } finally { 
          setIsLoadingUsers(false); 
          setIsFetchingMore(false); 
      }
  };

  useEffect(() => { loadData(false); }, [user, currentTenant]);

  useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingUsers && !isFetchingMore) loadData(true);
      }, { root: null, rootMargin: '200px', threshold: 0.1 });
      if (loaderRef.current) observer.observe(loaderRef.current);
      return () => { if (loaderRef.current) observer.unobserve(loaderRef.current); };
  }, [hasMore, isLoadingUsers, isFetchingMore, lastDoc]);

  const profileStatus = user ? getProfileStatus(user) : { status: 'COMPLETE', daysRemaining: 0 };
  const isBlocked = profileStatus.status === 'BLOCKED';

  const isNewUser = (joinedAt?: string) => {
      if (!joinedAt) return false;
      return (Date.now() - new Date(joinedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  };

  const getGenderStyle = (type?: string) => {
      switch (type) {
          case 'MAN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
          case 'WOMAN': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
          case 'COUPLE': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
          default: return 'bg-gray-100 text-gray-700 dark:bg-night-700 dark:text-gray-300';
      }
  };

  const translateGender = (type?: string) => {
      switch (type) {
          case 'MAN': return 'UOMO';
          case 'WOMAN': return 'DONNA';
          case 'COUPLE': return 'COPPIA';
          default: return type;
      }
  };

  const translateOrientation = (orientation?: string) => {
    switch (orientation) {
        case 'HETERO': return 'ETERO';
        case 'GAY': return 'GAY';
        case 'BISEXUAL': return 'BI';
        default: return orientation || '...';
    }
  };

  const getOrientationStyle = (orientation?: string) => {
    switch (orientation) {
        case 'HETERO': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
        case 'GAY': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800';
        case 'BISEXUAL': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
        default: return 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-night-700 dark:text-gray-400';
    }
  };

  const handleBlock = async (targetUid: string, name: string) => {
      if (await showConfirm({ title: 'Nascondi Profilo', description: `Vuoi nascondere ${name}? Non vi vedrete più.`, isDanger: true })) {
          await blockUser(targetUid);
          setHiddenProfileIds(prev => new Set(prev).add(targetUid));
      }
  };

  const handleReport = async (targetUid: string, name: string) => {
      const reason = await showPrompt({ title: 'Segnala Utente', description: 'Perché stai segnalando questo utente?', inputPlaceholder: 'Motivo...' });
      if (reason) { await reportUser(targetUid, name, reason); setHiddenProfileIds(prev => new Set(prev).add(targetUid)); }
  };

  const handleMatchRequest = async (targetUser: User) => {
      if (!user) return;
      if (isBlocked) { alert("Completa il tuo profilo per mettere like!"); return; }
      setAnimatingMatchId(targetUser.uid);
      const isMutual = targetUser.likedUserIds?.includes(user.uid);
      setMatchIsMutual(!!isMutual);
      await toggleLike(targetUser.uid);
      setTimeout(() => { setAnimatingMatchId(null); setMatchIsMutual(false); }, 2000);
  };

  const displayItems = useMemo(() => {
    if (!user) return [];
    let matches = candidates.filter(targetUser => isMatchCompatible(user, targetUser));
    matches = matches.filter(m => !hiddenProfileIds.has(m.uid) && m.status !== 'SUSPENDED' && m.status !== 'BANNED' && m.status !== 'DELETED' && m.role !== 'SUPER_ADMIN');

    if (filters.interactionFilter === 'NEW') matches = matches.filter(u => !user.likedUserIds?.includes(u.uid));
    else if (filters.interactionFilter === 'LIKED_ME') matches = matches.filter(u => u.likedUserIds?.includes(user.uid) && !user.likedUserIds?.includes(u.uid));
    else if (filters.interactionFilter === 'HISTORY') matches = matches.filter(u => user.likedUserIds?.includes(u.uid));
    
    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase();
      matches = matches.filter(u => (u.displayName?.toLowerCase().includes(term)) || (u.city?.toLowerCase().includes(term)) || (u.region?.toLowerCase().includes(term)));
    }
    if (filters.selectedCategory) matches = matches.filter(u => u.interests?.includes(filters.selectedCategory));
    if (filters.selectedGender) matches = matches.filter(u => u.type === filters.selectedGender);

    const now = new Date();
    const activeAds = insertions.filter(ad => ad.isActive && (!ad.startDate || new Date(ad.startDate) <= now) && (!ad.endDate || new Date(ad.endDate) >= now));
    const AD_INTERVAL = 4;
    const result: (User | Insertion)[] = [];
    let adIdx = 0;
    matches.forEach((m, idx) => {
        result.push(m);
        if ((idx + 1) % AD_INTERVAL === 0 && adIdx < activeAds.length) { result.push(activeAds[adIdx]); adIdx++; }
    });
    while (adIdx < activeAds.length && result.length < 10) { result.push(activeAds[adIdx]); adIdx++; }
    return result;
  }, [user, filters, hiddenProfileIds, candidates, insertions]);

  const usersList = useMemo(() => displayItems.filter(item => !('externalLink' in item)) as User[], [displayItems]);
  const handleNextUser = () => { if (!selectedUser) return; const idx = usersList.findIndex(u => u.uid === selectedUser.uid); if (idx < usersList.length - 1) setSelectedUser(usersList[idx + 1]); };
  const handlePrevUser = () => { if (!selectedUser) return; const idx = usersList.findIndex(u => u.uid === selectedUser.uid); if (idx > 0) setSelectedUser(usersList[idx - 1]); };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} onNext={handleNextUser} onPrev={handlePrevUser} />
        <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} currentUserId={user!.uid} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">Esplora<span className="text-rose-500 text-4xl">.</span></h1>
                <p className="text-slate-500 dark:text-night-200">Scopri nuove persone o eventi intorno a te.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none md:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Cerca nome, città..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-night-800 border border-slate-200 dark:border-night-700 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none dark:text-white" value={filters.searchTerm} onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))} />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl border transition-colors ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white dark:bg-night-800 border-slate-200 dark:border-night-700 text-slate-500'}`}><Filter className="w-5 h-5" /></button>
                <button onClick={() => loadData(false)} disabled={isLoadingUsers} className="p-2 rounded-xl border bg-white dark:bg-night-800 border-slate-200 dark:border-night-700 text-slate-500 hover:text-blue-500 transition-colors"><RefreshCw className={`w-5 h-5 ${isLoadingUsers ? 'animate-spin' : ''}`} /></button>
            </div>
        </div>

        {showFilters && (
            <div className="bg-white dark:bg-night-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-night-700 mb-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stato</label><select className="w-full p-2 text-sm bg-slate-50 dark:bg-night-900 border-none rounded-lg" value={filters.interactionFilter} onChange={(e) => setFilters(prev => ({ ...prev, interactionFilter: e.target.value }))}><option value="ALL">Tutti</option><option value="NEW">Nuovi</option><option value="LIKED_ME">Mi hanno messo Like</option><option value="HISTORY">Già piaciuti</option></select></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Genere</label><select className="w-full p-2 text-sm bg-slate-50 dark:bg-night-900 border-none rounded-lg" value={filters.selectedGender} onChange={(e) => setFilters(prev => ({ ...prev, selectedGender: e.target.value as GenderType }))}><option value="">Tutti</option><option value="MAN">Uomini</option><option value="WOMAN">Donne</option><option value="COUPLE">Coppie</option></select></div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((item) => {
            if ('externalLink' in item) return <AdvertisementCard key={item.id} ad={item as Insertion} currentUserId={user!.uid} onExpand={() => setSelectedAd(item as Insertion)} />;
            const match = item as User;
            const isLiked = user?.likedUserIds?.includes(match.uid);
            const hasLikedMe = match.likedUserIds?.includes(user!.uid);
            const isOnline = isUserOnline(match);

            return (
            <div key={match.uid} className={`bg-white dark:bg-night-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border group relative cursor-pointer ${isLiked ? 'ring-2 ring-green-500 border-transparent' : 'border-gray-100 dark:border-night-700'}`} onClick={() => setSelectedUser(match)}>
                {animatingMatchId === match.uid && (
                <div className="absolute inset-0 z-50 bg-rose-500/90 flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setAnimatingMatchId(null); }}>
                    <Sparkles className="w-16 h-16 mb-4 animate-spin-slow" /><span className="text-3xl font-extrabold tracking-tight animate-bounce">{matchIsMutual ? "It's a Match!" : "Like Inviato!"}</span>
                    <div className="mt-2 text-rose-100 font-medium">{matchIsMutual ? "Puoi iniziare a chattare." : "In attesa di risposta..."}</div>
                </div>
                )}
                <div className="relative h-64 bg-gray-200 dark:bg-night-900">
                    <WatermarkImage src={getUserAvatar(match)} alt={match.displayName} className="object-cover object-top transition-transform duration-500 group-hover:scale-105" containerClassName="w-full h-full" />
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start pointer-events-none">
                        {isNewUser(match.joinedAt) && <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse ring-2 ring-white">Nuovo</span>}
                        {hasLikedMe && !isLiked && <span className="bg-white text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 animate-bounce"><Heart className="w-3 h-3 fill-current" /> Ti ha messo Like!</span>}
                    </div>
                    <div className="absolute top-4 right-4 z-10">{match.isVerified && <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Verificato</span>}</div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-white text-xl font-bold">{match.displayName}, {match.age}</h3>
                                {isOnline && <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_#22c55e]" title="Online"></div>}
                            </div>
                            {isLiked && <Heart className="w-5 h-5 text-green-500 fill-current animate-pulse" />}
                        </div>
                        <div className="flex items-center text-white/90 text-sm mt-1"><MapPin className="w-3 h-3 mr-1" /> {match.city ? `${match.city}, ${match.region || ''}` : match.location || 'Posizione sconosciuta'}</div>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className={`px-2 py-1 text-[10px] rounded-md uppercase font-bold tracking-wider border ${getGenderStyle(match.type)}`}>
                            {translateGender(match.type)}
                        </span>
                        <span className={`px-2 py-1 text-[10px] rounded-md uppercase font-bold tracking-wider border ${getOrientationStyle(match.sexualOrientation)}`}>
                            {translateOrientation(match.sexualOrientation)}
                        </span>
                    </div>
                    <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleBlock(match.uid, match.displayName)} className="py-3 px-3 rounded-xl border border-gray-200 dark:border-night-700 text-gray-400 dark:text-night-600 hover:bg-gray-50 transition-colors" title="Nascondi"><EyeOff className="w-5 h-5" /></button>
                        <button onClick={() => handleReport(match.uid, match.displayName)} className="py-3 px-3 rounded-xl border border-gray-200 dark:border-night-700 text-gray-400 dark:text-night-600 hover:bg-red-50 hover:text-red-500 transition-colors" title="Segnala"><Flag className="w-5 h-5" /></button>
                        <button onClick={() => setHiddenProfileIds(prev => new Set(prev).add(match.uid))} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-night-700 text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center"><X className="w-5 h-5" /></button>
                        <button onClick={() => handleMatchRequest(match)} className={`flex-1 py-3 rounded-xl shadow-lg transition-all transform flex items-center justify-center active:scale-95 ${isLiked ? 'bg-green-500 text-white shadow-green-200' : hasLikedMe ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-orange-200 animate-pulse' : 'bg-white border-2 border-rose-500 text-rose-500 shadow-rose-100 hover:bg-rose-50'} ${isBlocked ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`} disabled={isBlocked}>{isLiked ? <Heart className="w-6 h-6 fill-current" /> : <Heart className="w-6 h-6" />}</button>
                    </div>
                </div>
            </div>
            );
        })}
        </div>
        <div ref={loaderRef} className="py-8 text-center">{(isLoadingUsers || isFetchingMore) && <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>}{!hasMore && candidates.length > 0 && !isLoadingUsers && <p className="text-sm text-slate-400 mt-4">Hai visto tutti i profili disponibili.</p>}</div>
    </div>
  );
};

export default Browse;

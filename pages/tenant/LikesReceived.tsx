
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { db } from '../../services/db';
import { User } from '../../types';
import { getUserAvatar } from '../../utils/placeholders';
import { Heart, X, MapPin, CheckCircle2, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WatermarkImage } from '../../components/WatermarkImage';

const LikesReceived: React.FC = () => {
  const { user, toggleLike } = useAuth();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [likers, setLikers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikers = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            // OPTIMIZATION: Only fetch users who have 'user.uid' in their likedUserIds array
            // This massively reduces data consumption compared to getAllUsers()
            const usersWhoLikedMe = await db.getUsersWhoLikedMe(user.uid);
            
            // Further filter: Exclude those I ALREADY liked (Matches) and removed ones
            const incoming = usersWhoLikedMe.filter(u => 
                !user.likedUserIds?.includes(u.uid) &&    // I haven't liked them back yet
                !removedIds.has(u.uid)                    // Not locally passed
            );
            setLikers(incoming);
        } catch (e) {
            console.error("Error fetching likers:", e);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchLikers();
  }, [user, currentTenant, removedIds]);

  const handlePass = (uid: string) => {
    setRemovedIds(prev => new Set(prev).add(uid));
  };

  const handleMatch = async (uid: string, name: string) => {
    // Show animation immediately
    setMatchedIds(prev => new Set(prev).add(uid));
    
    // Persist to DB
    await toggleLike(uid);
    
    // Redirect to Messages immediately with the new match ID to highlight it
    setTimeout(() => {
        navigate('/tenant/messages', { state: { newMatchId: uid } });
    }, 500);
  };

  const translateGender = (type?: string) => {
    switch (type) {
        case 'MAN': return 'UOMO';
        case 'WOMAN': return 'DONNA';
        case 'COUPLE': return 'COPPIA';
        default: return type;
    }
  };

  const getGenderStyle = (type?: string) => {
    switch (type) {
        case 'MAN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        case 'WOMAN': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        case 'COUPLE': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        default: return 'bg-gray-100 text-gray-700 dark:bg-night-700 dark:text-gray-300';
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-current" /> Like Ricevuti
        </h1>
        <p className="text-gray-500 dark:text-night-200">Persone che hanno mostrato interesse per il tuo profilo.</p>
      </div>

      {isLoading ? (
          <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
              <p className="mt-4 text-slate-500">Caricamento like...</p>
          </div>
      ) : likers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-night-800 rounded-xl shadow-sm border border-gray-200 dark:border-night-700">
          <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-night-900 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-rose-300 dark:text-rose-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nessun nuovo like</h3>
          <p className="text-gray-500 dark:text-night-200 mt-2 mb-6">Migliora il tuo profilo o aggiungi nuove foto per farti notare!</p>
          <Link to="/tenant/profile" className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">
            Modifica Profilo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likers.map((liker) => {
             const isJustMatched = matchedIds.has(liker.uid);

             return (
              <div key={liker.uid} className="bg-white dark:bg-night-800 rounded-2xl shadow-sm border border-gray-100 dark:border-night-700 overflow-hidden relative group transition-all duration-300 hover:shadow-md">
                
                {/* Match Overlay Animation (Card Level) */}
                {isJustMatched && (
                    <div className="absolute inset-0 z-50 bg-rose-500/90 flex flex-col items-center justify-center text-white animate-in fade-in zoom-in duration-300">
                        <Sparkles className="w-12 h-12 mb-2 animate-bounce" />
                        <span className="text-2xl font-bold">It's a Match!</span>
                    </div>
                )}

                <div className="relative h-72 bg-gray-200 dark:bg-night-900">
                  <WatermarkImage 
                    src={getUserAvatar(liker)} 
                    alt={liker.displayName} 
                    className="object-cover object-top"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                     <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{liker.displayName}, {liker.age}</h3>
                        {liker.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                     </div>
                     <div className="flex items-center text-sm opacity-90">
                        <MapPin className="w-3 h-3 mr-1" />
                        {liker.city || liker.location}
                     </div>
                  </div>
                </div>

                <div className="p-4">
                   <div className="mb-4 min-h-[4rem]">
                        <div className="mb-2">
                            <span className={`px-2 py-0.5 text-[10px] rounded-md uppercase font-bold tracking-wider border ${getGenderStyle(liker.type)}`}>
                                {translateGender(liker.type)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-night-200 line-clamp-2 italic">"{liker.bio || 'Nessuna bio'}"</p>
                        {liker.interests && liker.interests.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                                {liker.interests.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-md">{tag}</span>
                                ))}
                            </div>
                        )}
                   </div>

                   <div className="flex gap-3">
                      <button 
                        onClick={() => handlePass(liker.uid)}
                        className="flex-1 py-2.5 border border-gray-200 dark:border-night-700 rounded-xl text-gray-500 dark:text-night-200 hover:bg-gray-50 dark:hover:bg-night-900 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" /> No
                      </button>
                      <button 
                        onClick={() => handleMatch(liker.uid, liker.displayName)}
                        disabled={isJustMatched}
                        className={`flex-1 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 ${isJustMatched ? 'bg-green-500 text-white' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200 dark:shadow-none'}`}
                      >
                        {isJustMatched ? <CheckCircle2 className="w-4 h-4"/> : <Heart className="w-4 h-4 fill-current" />}
                        {isJustMatched ? 'Fatto!' : 'Accetta'}
                      </button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LikesReceived;

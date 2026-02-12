
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { db } from '../../services/db';
import { User } from '../../types';
import { getUserAvatar } from '../../utils/placeholders';
import { Heart, HeartOff, MapPin, CheckCircle2, Search, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WatermarkImage } from '../../components/WatermarkImage';

const MyLikes: React.FC = () => {
  const { user, toggleLike } = useAuth();
  const { currentTenant } = useTenant();
  const [myLikedUsers, setMyLikedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyLikes = async () => {
        const tenantId = user?.tenantId || currentTenant?.id;
        if (!user || !tenantId) return;
        
        setIsLoading(true);
        try {
            // Ensure we have the list of IDs I LIKED
            const likedIds = user.likedUserIds || [];
            
            if (likedIds.length === 0) {
                setMyLikedUsers([]);
                return;
            }

            const allUsers = await db.getAllUsers(tenantId);
            
            // Filter users included in my likedUserIds
            const filtered = allUsers.filter(u => likedIds.includes(u.uid));
            setMyLikedUsers(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchMyLikes();
  }, [user, currentTenant]); // Depend on user to refresh if likedUserIds changes

  const handleRemoveLike = async (uid: string) => {
    await toggleLike(uid);
    // Optimistic update
    setMyLikedUsers(prev => prev.filter(u => u.uid !== uid));
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-current" /> Like Inviati
        </h1>
        <p className="text-gray-500 dark:text-night-200">
            Persone a cui hai mostrato interesse. Qui vedi sia i like in attesa che i match confermati.
        </p>
      </div>

      {isLoading ? (
          <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
              <p className="mt-4 text-slate-500">Caricamento like inviati...</p>
          </div>
      ) : myLikedUsers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-night-800 rounded-xl shadow-sm border border-gray-200 dark:border-night-700">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-night-900 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-gray-300 dark:text-night-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Non hai ancora messo like a nessuno</h3>
          <p className="text-gray-500 dark:text-night-200 mt-2 mb-6">Torna alla home per esplorare nuovi profili!</p>
          <Link to="/tenant/browse" className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors flex items-center justify-center w-fit mx-auto gap-2">
            <Search className="w-4 h-4" /> Esplora Profili
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myLikedUsers.map((likedUser) => {
             // Determine Status: Did they like me back?
             const isMatch = likedUser.likedUserIds?.includes(user.uid);

             return (
              <div key={likedUser.uid} className={`bg-white dark:bg-night-800 rounded-2xl shadow-sm border overflow-hidden relative group transition-all duration-300 hover:shadow-md ${isMatch ? 'border-green-200 dark:border-green-900 ring-1 ring-green-500/20' : 'border-gray-100 dark:border-night-700'}`}>
                
                <div className="relative h-64">
                  <WatermarkImage 
                    src={getUserAvatar(likedUser)} 
                    alt={likedUser.displayName} 
                    className="object-cover object-top"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                      {isMatch ? (
                          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-lg animate-in fade-in zoom-in">
                              <Sparkles className="w-3 h-3 mr-1 fill-current" /> MATCH
                          </span>
                      ) : (
                          <span className="bg-white/90 backdrop-blur-md text-slate-600 px-2 py-1 rounded-full text-[10px] font-bold flex items-center shadow-sm">
                              <Clock className="w-3 h-3 mr-1" /> IN ATTESA
                          </span>
                      )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                     <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{likedUser.displayName}, {likedUser.age}</h3>
                        {likedUser.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-400 fill-current bg-white rounded-full" />}
                     </div>
                     <div className="flex items-center text-sm opacity-90">
                        <MapPin className="w-3 h-3 mr-1" />
                        {likedUser.city || likedUser.location}
                     </div>
                  </div>
                </div>

                <div className="p-4">
                   <div className="mb-4 min-h-[2.5rem]">
                        <p className="text-sm text-gray-600 dark:text-night-200 line-clamp-2 italic">
                            "{likedUser.bio || 'Nessuna bio...'}"
                        </p>
                   </div>

                   <button 
                     onClick={() => handleRemoveLike(likedUser.uid)}
                     className="w-full py-2.5 border border-slate-200 dark:border-night-600 bg-white dark:bg-night-900 text-slate-500 dark:text-night-200 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 text-sm"
                   >
                     <HeartOff className="w-4 h-4" /> 
                     {isMatch ? 'Annulla Match' : 'Ritira Like'}
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLikes;

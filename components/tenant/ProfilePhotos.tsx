
import React, { useState, useEffect } from 'react';
import { User, GalleryPhoto, PhotoVisibility, PhotoRequest } from '../../types';
import { Cloud, Lock, Plus, Eye, Trash2, Shield, EyeOff, Star, CheckCircle2, XCircle } from 'lucide-react';
import { WatermarkImage } from '../WatermarkImage';
import { db } from '../../services/db';

interface ProfilePhotosProps {
    user: User;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

export const ProfilePhotos: React.FC<ProfilePhotosProps> = ({ user, updateUser }) => {
    const [newPhotoLink, setNewPhotoLink] = useState('');
    const [selectedVisibility, setSelectedVisibility] = useState<PhotoVisibility>('PUBLIC');
    const [error, setError] = useState('');
    const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<PhotoRequest[]>([]);

    // Migration logic on mount: Convert legacy string[] photos to GalleryPhoto[]
    useEffect(() => {
        if (user.gallery) {
            setGallery(user.gallery);
        } else if (user.photos && user.photos.length > 0) {
            // Migrating legacy photos to Public Gallery
            const migrated: GalleryPhoto[] = user.photos.map(url => ({
                id: `legacy-${Math.random().toString(36).substr(2, 9)}`,
                url,
                visibility: 'PUBLIC',
                createdAt: new Date().toISOString()
            }));
            setGallery(migrated);
            // We don't save immediately to avoid implicit writes, but next save will persist structure
        } else {
            setGallery([]);
        }
    }, [user]);

    // Load Requests
    useEffect(() => {
        const loadRequests = async () => {
            const reqs = await db.getPhotoRequests(user.uid, 'INCOMING');
            setIncomingRequests(reqs.filter(r => r.status === 'PENDING'));
        };
        loadRequests();
    }, [user.uid]);

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

    const handleAddPhoto = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newPhotoLink) return;
        const directLink = convertDriveLink(newPhotoLink);
        if (!directLink) {
          setError('Link non valido. Assicurati che sia un link di Google Drive.');
          return;
        }
        
        const newPhoto: GalleryPhoto = {
            id: `photo-${Date.now()}`,
            url: directLink,
            visibility: selectedVisibility,
            createdAt: new Date().toISOString()
        };

        const updatedGallery = [...gallery, newPhoto];
        setGallery(updatedGallery);
        updateUser({ gallery: updatedGallery });
        setNewPhotoLink('');
    };
    
    const handleRemovePhoto = (id: string) => {
        const updatedGallery = gallery.filter(p => p.id !== id);
        setGallery(updatedGallery);
        updateUser({ gallery: updatedGallery });
    };

    const handleChangeVisibility = (id: string, newVisibility: PhotoVisibility) => {
        const updatedGallery = gallery.map(p => 
            p.id === id ? { ...p, visibility: newVisibility } : p
        );
        setGallery(updatedGallery);
        updateUser({ gallery: updatedGallery });
    };

    const handleRequestDecision = async (reqId: string, decision: 'APPROVED' | 'REJECTED') => {
        await db.updatePhotoRequestStatus(reqId, decision);
        setIncomingRequests(prev => prev.filter(r => r.id !== reqId));
    };

    const getVisibilityIcon = (v: PhotoVisibility) => {
        switch(v) {
            case 'PUBLIC': return <Eye className="w-3 h-3 text-green-600" />;
            case 'SECRET': return <EyeOff className="w-3 h-3 text-orange-500" />;
            case 'SUPER_SECRET': return <Shield className="w-3 h-3 text-red-600" />;
        }
    };

    const getVisibilityLabel = (v: PhotoVisibility) => {
        switch(v) {
            case 'PUBLIC': return 'Pubblica';
            case 'SECRET': return 'Privata';
            case 'SUPER_SECRET': return 'Super Segreta';
        }
    };

    return (
        <div className="bg-white dark:bg-night-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-night-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Cloud className="w-5 h-5 text-rose-500" />
                Galleria Foto
              </h3>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md flex items-center">
                <Lock className="w-3 h-3 mr-1" /> Privacy Protetta
              </span>
            </div>

            {/* --- REQUESTS SECTION --- */}
            {incomingRequests.length > 0 && (
                <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800">
                    <h4 className="text-sm font-bold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4" /> Richieste di Accesso ({incomingRequests.length})
                    </h4>
                    <div className="space-y-3">
                        {incomingRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between bg-white dark:bg-night-900 p-3 rounded-lg border border-orange-200 dark:border-orange-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                                        <img src={req.photoUrl} className="w-full h-full object-cover opacity-50 blur-[2px]" alt="Request" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{req.requesterName}</p>
                                        <p className="text-xs text-slate-500">Vuole vedere questa foto Segreta</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRequestDecision(req.id, 'APPROVED')} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleRequestDecision(req.id, 'REJECTED')} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleAddPhoto} className="mb-8 p-4 bg-slate-50 dark:bg-night-900 rounded-xl border border-slate-200 dark:border-night-700">
              <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">
                        Link Foto (Google Drive)
                    </label>
                    <input 
                        type="text" 
                        placeholder="https://drive.google.com/file/d/..." 
                        className="w-full px-4 py-2 bg-white dark:bg-night-800 border border-slate-200 dark:border-night-600 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none dark:text-white text-sm"
                        value={newPhotoLink}
                        onChange={(e) => setNewPhotoLink(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 dark:text-night-200 uppercase mb-1">
                            Visibilità
                        </label>
                        <select 
                            className="w-full px-3 py-2 bg-white dark:bg-night-800 border border-slate-200 dark:border-night-600 rounded-xl outline-none dark:text-white text-sm"
                            value={selectedVisibility}
                            onChange={(e) => setSelectedVisibility(e.target.value as PhotoVisibility)}
                        >
                            <option value="PUBLIC">Pubblica (Tutti)</option>
                            <option value="SECRET">Segreta (Solo su richiesta)</option>
                            <option value="SUPER_SECRET">Super Segreta (Solo in Chat)</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button 
                            type="submit"
                            className="bg-rose-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-rose-700 transition-colors flex items-center h-[38px]"
                        >
                            <Plus className="w-5 h-5 mr-1" /> Aggiungi
                        </button>
                      </div>
                  </div>
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((photo) => (
                <div key={photo.id} className="group relative aspect-square bg-slate-100 dark:bg-night-900 rounded-xl overflow-hidden border border-slate-200 dark:border-night-700">
                  
                  {/* Using Watermark Component */}
                  <WatermarkImage 
                    src={photo.url} 
                    alt="Gallery" 
                    className="object-cover object-top"
                    containerClassName="w-full h-full"
                    isBlurred={false} // Owner always sees their photos unblurred
                  />
                  
                  {/* Visibility Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/90 dark:bg-black/70 backdrop-blur-md shadow-sm flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-white z-10 pointer-events-auto cursor-pointer group-hover:opacity-100 transition-opacity">
                      {getVisibilityIcon(photo.visibility)}
                      <select 
                        value={photo.visibility}
                        onChange={(e) => handleChangeVisibility(photo.id, e.target.value as PhotoVisibility)}
                        className="bg-transparent outline-none appearance-none cursor-pointer w-full absolute inset-0 opacity-0"
                      >
                          <option value="PUBLIC">Pubblica</option>
                          <option value="SECRET">Segreta</option>
                          <option value="SUPER_SECRET">Super Segreta</option>
                      </select>
                      <span>{getVisibilityLabel(photo.visibility)}</span>
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                    <a href={photo.url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 pointer-events-auto">
                      <Eye className="w-5 h-5" />
                    </a>
                    <button 
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 pointer-events-auto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="col-span-full py-10 text-center text-slate-400 dark:text-night-600 border-2 border-dashed border-slate-200 dark:border-night-700 rounded-xl">
                  <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nessuna foto nella galleria.</p>
                </div>
              )}
            </div>
        </div>
    );
};

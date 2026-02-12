
import React, { useState } from 'react';
import { User } from '../../types';
import { Camera, MapPin } from 'lucide-react';
import { getUserAvatar } from '../../utils/placeholders';
import { WatermarkImage } from '../WatermarkImage';

interface ProfileHeaderProps {
    user: User;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, updateUser }) => {
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [avatarLink, setAvatarLink] = useState('');

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

    const handleUpdateAvatar = (e: React.FormEvent) => {
        e.preventDefault();
        if (!avatarLink) return;
        const converted = convertDriveLink(avatarLink);
        const finalUrl = converted || avatarLink;
        updateUser({ photoURL: finalUrl });
        setAvatarLink('');
        setIsEditingAvatar(false);
    };

    const currentAvatar = getUserAvatar(user);

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

    return (
        <div className="bg-white dark:bg-night-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-night-700 text-center relative">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 dark:border-night-900 shadow-inner bg-slate-100 dark:bg-night-900">
                    <WatermarkImage 
                        src={currentAvatar} 
                        alt="Profile Main" 
                        className="object-cover object-top"
                        containerClassName="w-full h-full"
                    />
                </div>
                <button 
                    onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                    className="absolute bottom-1 right-1 p-2 bg-slate-900 dark:bg-rose-600 text-white rounded-full hover:bg-rose-500 transition-colors shadow-md"
                    title="Modifica Foto Profilo"
                >
                    <Camera className="w-4 h-4" />
                </button>
            </div>

            {isEditingAvatar && (
                <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleUpdateAvatar} className="flex flex-col gap-2">
                        <input 
                            type="text" 
                            placeholder="Incolla URL immagine..." 
                            className="w-full px-3 py-2 text-black bg-white dark:bg-night-900 dark:text-white dark:border-night-700 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                            value={avatarLink}
                            onChange={(e) => setAvatarLink(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-slate-900 dark:bg-rose-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-rose-700">Salva</button>
                            <button type="button" onClick={() => setIsEditingAvatar(false)} className="px-3 bg-gray-100 dark:bg-night-700 text-gray-600 dark:text-night-200 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-night-600">Annulla</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex flex-col items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{user.displayName}</h2>
                
                {/* Category Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getGenderStyle(user.type)}`}>
                    {translateGender(user.type)}
                </span>
            </div>

            <p className="text-sm text-slate-500 dark:text-night-200 mb-4">{user.email}</p>
            
            <div className="flex justify-center gap-4 text-xs font-medium text-slate-600 dark:text-night-200 bg-slate-50 dark:bg-night-900 py-3 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-slate-400 dark:text-night-600 uppercase tracking-wider text-[10px]">Età</span>
                    <span className="text-base">{user.age || '--'}</span>
                </div>
                 <div className="w-px bg-slate-200 dark:bg-night-700"></div>
                <div className="flex flex-col">
                    <span className="text-slate-400 dark:text-night-600 uppercase tracking-wider text-[10px]">Altezza</span>
                    <span className="text-base">{user.height ? `${user.height}cm` : '--'}</span>
                </div>
                 <div className="w-px bg-slate-200 dark:bg-night-700"></div>
                <div className="flex flex-col">
                    <span className="text-slate-400 dark:text-night-600 uppercase tracking-wider text-[10px]">Match</span>
                    <span className="text-base">{user.likedUserIds ? user.likedUserIds.length : 0}</span>
                </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center text-slate-500 dark:text-night-200 text-sm">
                <MapPin className="w-4 h-4 mr-1 text-rose-500" />
                {user.city || user.region ? (
                    <span>{user.city}{user.region ? `, ${user.region}` : ''}</span>
                ) : (
                    <span className="italic">Nessuna posizione</span>
                )}
            </div>
        </div>
    );
};

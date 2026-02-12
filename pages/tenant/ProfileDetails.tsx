
import React, { useState } from 'react';
import { User, PartnerDetails } from '../../types';
import { User as UserIcon, Edit2, MapPin, Save, X, Ruler, Weight, Palette, Eye, Tag, Users as UsersIcon } from 'lucide-react';

interface ProfileDetailsProps {
    user: User;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user, updateUser }) => {
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<'MAIN' | 'PARTNER2'>('MAIN');

    // Initialize form with User data (and potentially Partner 2 data)
    const [formData, setFormData] = useState<Partial<User>>({
        displayName: user.displayName,
        age: user.age,
        location: user.location, 
        city: user.city,
        region: user.region,
        bio: user.bio,
        height: user.height,
        weight: user.weight,
        hairColor: user.hairColor,
        eyeColor: user.eyeColor,
        interests: user.interests || [],
        partnerDetails: user.partnerDetails || {}
    });
    
    const [interestInput, setInterestInput] = useState('');

    const handleSaveDetails = (e: React.FormEvent) => {
        e.preventDefault();
        const locString = formData.city && formData.region ? `${formData.city}, ${formData.region}` : formData.location;
        updateUser({ ...formData, location: locString });
        setIsEditingDetails(false);
    };
    
    const handleAddInterest = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && interestInput.trim()) {
          e.preventDefault();
          const currentInterests = formData.interests || [];
          if (!currentInterests.includes(interestInput.trim())) {
            setFormData({ ...formData, interests: [...currentInterests, interestInput.trim()] });
          }
          setInterestInput('');
        }
    };
    
    const removeInterest = (tag: string) => {
        const currentInterests = formData.interests || [];
        setFormData({ ...formData, interests: currentInterests.filter(t => t !== tag) });
    };

    // Helper to update main user fields
    const updateMain = (field: keyof User, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Helper to update Partner 2 fields
    const updatePartner2 = (field: keyof PartnerDetails, value: any) => {
        setFormData(prev => ({
            ...prev,
            partnerDetails: { ...prev.partnerDetails, [field]: value }
        }));
    };

    const isCouple = user.type === 'COUPLE';

    return (
        <div className="bg-white dark:bg-night-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-night-700">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    {isCouple ? <UsersIcon className="w-5 h-5 text-purple-500" /> : <UserIcon className="w-5 h-5 text-rose-500" />}
                    {isCouple ? 'Dettagli Coppia' : 'Dettagli & Preferenze'}
                </h3>
                <button 
                    onClick={() => isEditingDetails ? document.getElementById('details-form')?.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true})) : setIsEditingDetails(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isEditingDetails ? 'hidden' : 'bg-slate-100 dark:bg-night-700 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-night-600'}`}
                >
                    <Edit2 className="w-4 h-4" /> Modifica
                </button>
             </div>

             {isEditingDetails ? (
                 <form id="details-form" onSubmit={handleSaveDetails} className="space-y-6 animate-in fade-in">
                    
                    {/* General Location & Bio Section (Shared) */}
                    <div className="bg-slate-50 dark:bg-night-900 p-4 rounded-xl border border-slate-200 dark:border-night-700 mb-4">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-3 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-rose-500" /> Località Incontro
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Regione *</label>
                                <input type="text" placeholder="Es. Lombardia" required className="w-full p-2 text-black dark:text-white bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" 
                                    value={formData.region || ''} onChange={e => updateMain('region', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Città *</label>
                                <input type="text" placeholder="Es. Milano" required className="w-full p-2 text-black dark:text-white bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" 
                                    value={formData.city || ''} onChange={e => updateMain('city', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Bio / Descrizione</label>
                        <textarea 
                            className="w-full p-3 text-black dark:text-white bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none min-h-[100px] text-sm"
                            placeholder="Descriviti, scrivi cosa cerchi e le tue passioni..."
                            value={formData.bio || ''}
                            onChange={e => updateMain('bio', e.target.value)}
                        />
                    </div>

                    {/* Dynamic Form Sections based on Type */}
                    {isCouple && (
                        <div className="flex gap-2 border-b border-slate-200 dark:border-night-700 mb-4">
                            <button type="button" onClick={() => setActiveTab('MAIN')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'MAIN' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-night-200'}`}>
                                Partner 1
                            </button>
                            <button type="button" onClick={() => setActiveTab('PARTNER2')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'PARTNER2' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-night-200'}`}>
                                Partner 2
                            </button>
                        </div>
                    )}

                    <div className="bg-slate-50 dark:bg-night-900 p-4 rounded-xl border border-slate-200 dark:border-night-700">
                        {activeTab === 'MAIN' ? (
                            <>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Dettagli Fisici (Partner 1 / Main)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Età *</label>
                                        <input type="number" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.age || ''} onChange={e => updateMain('age', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Altezza (cm) *</label>
                                        <input type="number" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.height || ''} onChange={e => updateMain('height', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Peso (kg) *</label>
                                        <input type="number" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.weight || ''} onChange={e => updateMain('weight', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Capelli *</label>
                                        <input type="text" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.hairColor || ''} onChange={e => updateMain('hairColor', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Occhi *</label>
                                        <input type="text" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.eyeColor || ''} onChange={e => updateMain('eyeColor', e.target.value)} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Dettagli Fisici (Partner 2)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Nome (Opzionale)</label>
                                        <input type="text" className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.partnerDetails?.name || ''} onChange={e => updatePartner2('name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Altezza (cm) *</label>
                                        <input type="number" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.partnerDetails?.height || ''} onChange={e => updatePartner2('height', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Peso (kg) *</label>
                                        <input type="number" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.partnerDetails?.weight || ''} onChange={e => updatePartner2('weight', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Capelli *</label>
                                        <input type="text" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.partnerDetails?.hairColor || ''} onChange={e => updatePartner2('hairColor', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Occhi *</label>
                                        <input type="text" required className="w-full p-2 bg-white dark:bg-night-800 border dark:border-night-700 rounded-lg dark:text-white" value={formData.partnerDetails?.eyeColor || ''} onChange={e => updatePartner2('eyeColor', e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-night-200 mb-1">Interessi (Premi Invio per aggiungere)</label>
                        <div className="flex flex-wrap gap-2 p-3 border dark:border-night-700 rounded-lg bg-slate-50 dark:bg-night-900 min-h-[50px] items-center">
                            {formData.interests?.map((tag, idx) => (
                                <span key={idx} className="bg-white dark:bg-night-800 border border-slate-200 dark:border-night-700 px-2 py-1 rounded-md text-sm flex items-center gap-1 text-slate-700 dark:text-white">
                                    {tag} <button type="button" onClick={() => removeInterest(tag)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                                </span>
                            ))}
                            <input 
                                type="text" 
                                className="bg-transparent outline-none flex-1 min-w-[120px] text-sm dark:text-white"
                                placeholder="Es. Sport, Cinema, Viaggi..."
                                value={interestInput}
                                onChange={e => setInterestInput(e.target.value)}
                                onKeyDown={handleAddInterest}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Aggiungi almeno 3 interessi per migliorare il matching.</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex items-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700 transition-colors">
                            <Save className="w-4 h-4" /> Salva Modifiche
                        </button>
                        <button type="button" onClick={() => setIsEditingDetails(false)} className="px-4 py-2 text-slate-500 dark:text-night-200 hover:bg-slate-100 dark:hover:bg-night-700 rounded-xl font-medium">
                            Annulla
                        </button>
                    </div>
                 </form>
             ) : (
                 <div className="space-y-6">
                    <p className="text-slate-600 dark:text-night-100 italic leading-relaxed">
                        "{user.bio || 'Nessuna descrizione inserita. Modifica il profilo per farti conoscere!'}"
                    </p>
                    
                    {/* Details Grid - Adaptive for Couples */}
                    <div className={`grid gap-6 ${isCouple ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                        
                        {/* Partner 1 / Main Block */}
                        <div className="bg-slate-50 dark:bg-night-900 p-4 rounded-xl border border-slate-100 dark:border-night-700">
                             {isCouple && <h5 className="font-bold text-sm text-purple-600 mb-3 uppercase tracking-wider">Partner 1</h5>}
                             <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Età" value={user.age ? `${user.age} anni` : '--'} />
                                <DetailItem label="Altezza" value={user.height ? `${user.height} cm` : '--'} />
                                <DetailItem label="Peso" value={user.weight ? `${user.weight} kg` : '--'} />
                                <DetailItem label="Capelli" value={user.hairColor || '--'} />
                                <DetailItem label="Occhi" value={user.eyeColor || '--'} />
                             </div>
                        </div>

                        {/* Partner 2 Block */}
                        {isCouple && (
                             <div className="bg-slate-50 dark:bg-night-900 p-4 rounded-xl border border-slate-100 dark:border-night-700">
                                <h5 className="font-bold text-sm text-purple-600 mb-3 uppercase tracking-wider">Partner 2 ({user.partnerDetails?.name || 'Senza Nome'})</h5>
                                <div className="grid grid-cols-2 gap-4">
                                   <DetailItem label="Altezza" value={user.partnerDetails?.height ? `${user.partnerDetails.height} cm` : '--'} />
                                   <DetailItem label="Peso" value={user.partnerDetails?.weight ? `${user.partnerDetails.weight} kg` : '--'} />
                                   <DetailItem label="Capelli" value={user.partnerDetails?.hairColor || '--'} />
                                   <DetailItem label="Occhi" value={user.partnerDetails?.eyeColor || '--'} />
                                </div>
                             </div>
                        )}
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 dark:text-night-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Interessi
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {user.interests && user.interests.length > 0 ? (
                                user.interests.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-full text-sm font-medium border border-rose-100 dark:border-rose-900">
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 dark:text-night-600 text-sm">Nessun interesse specificato.</span>
                            )}
                        </div>
                    </div>
                 </div>
             )}
        </div>
    );
};

const DetailItem = ({ label, value }: { label: string, value: string }) => (
    <div>
        <p className="text-xs text-slate-400 dark:text-night-600 font-bold uppercase">{label}</p>
        <p className="font-semibold text-slate-700 dark:text-white">{value}</p>
    </div>
);


import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useDialog } from '../../context/DialogContext';
import { db } from '../../services/db';
import { Send, MoreVertical, Search, EyeOff, ChevronLeft, CheckCircle2, Lock, Trash2, AlertTriangle, Info, X, ShieldCheck, MessageSquare, Heart, Check, CheckCheck, Timer, Flame, Paperclip, Image as ImageIcon } from 'lucide-react';
import { User, Message, getProfileStatus, GalleryPhoto } from '../../types';
import { getUserAvatar } from '../../utils/placeholders';
import { useNavigate, useLocation } from 'react-router-dom';
import { isUserOnline } from '../../config/matchRules.config';

// --- SUB-COMPONENT: Protected Image ---
interface ProtectedImageProps {
    src: string;
    message: Message;
    isMe: boolean;
    onDelete: () => void;
    canDelete: boolean;
    currentUserId: string;
}

const ProtectedImage: React.FC<ProtectedImageProps> = ({ src, message, isMe, onDelete, canDelete, currentUserId }) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const touchTimer = useRef<any>(null);

    // Initial check for expiration and trigger viewedAt
    useEffect(() => {
        if (!message.selfDestruct) return;

        // If I am the receiver and I haven't "viewed" it yet, trigger the timestamp
        if (!isMe && !message.viewedAt && currentUserId === message.receiverId) {
            const markViewed = async () => {
                await db.markMessageAsViewed(message.id);
            };
            markViewed();
        }

        const checkTimer = () => {
            if (message.viewedAt) {
                const viewedTime = new Date(message.viewedAt).getTime();
                const now = new Date().getTime();
                const expiryTime = viewedTime + (message.selfDestruct! * 1000);
                const remaining = Math.ceil((expiryTime - now) / 1000);

                if (remaining <= 0) {
                    setIsExpired(true);
                    setTimeLeft(0);
                } else {
                    setTimeLeft(remaining);
                }
            } else if (message.selfDestruct) {
                // Not viewed yet, full time remains
                setTimeLeft(message.selfDestruct);
            }
        };

        checkTimer();
        const interval = setInterval(checkTimer, 1000);
        return () => clearInterval(interval);

    }, [message, isMe, currentUserId]);

    const handleTouchStart = () => {
        if (!canDelete) return;
        touchTimer.current = setTimeout(() => {
            onDelete();
        }, 800); // 800ms long press
    };

    const handleTouchEnd = () => {
        if (touchTimer.current) clearTimeout(touchTimer.current);
    };

    if (isExpired) {
        return (
            <div className="w-64 h-64 bg-slate-100 dark:bg-night-900 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 dark:border-night-700 select-none">
                <Flame className="w-8 h-8 mb-2 text-orange-400" />
                <span className="text-xs font-bold uppercase">Distrutta</span>
            </div>
        );
    }

    return (
        <div
            className="relative group rounded-lg overflow-hidden select-none"
            onContextMenu={(e) => e.preventDefault()} // No Right Click
        >
            {/* Image Layer - Pointer Events None prevents dragging/interaction */}
            <img
                src={src}
                alt="Protected"
                className="max-h-64 object-cover object-top w-full pointer-events-none filter blur-none transition-all"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />

            {/* Countdown Overlay */}
            {message.selfDestruct && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-20">
                    <Timer className="w-3 h-3 animate-pulse text-orange-400" />
                    {timeLeft !== null ? `${timeLeft}s` : '...'}
                </div>
            )}

            {/* Delete Overlay (Desktop Hover) */}
            {canDelete && (
                <div
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30 shadow-lg"
                    onClick={onDelete}
                    title="Elimina"
                >
                    <Trash2 className="w-4 h-4" />
                </div>
            )}

            {/* Interaction Layer (Mobile Long Press & Click Block) */}
            <div
                className="absolute inset-0 z-10 bg-transparent"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            />
        </div>
    );
};

// --- SUB-COMPONENT: Media Picker Modal ---
const MediaPickerModal = ({ isOpen, onClose, onSelect, photos }: { isOpen: boolean, onClose: () => void, onSelect: (url: string) => void, photos: GalleryPhoto[] }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-night-700 flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 dark:border-night-700 flex justify-between items-center bg-slate-50 dark:bg-night-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-red-500" /> Galleria Super Segreta
                    </h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400 dark:text-white" /></button>
                </div>
                <div className="p-4 overflow-y-auto grid grid-cols-3 gap-2">
                    {photos.length === 0 ? (
                        <div className="col-span-3 text-center py-8 text-slate-400 text-sm">
                            Nessuna foto Super Segreta trovata nel tuo profilo.
                        </div>
                    ) : (
                        photos.map(photo => (
                            <div
                                key={photo.id}
                                onClick={() => onSelect(photo.url)}
                                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-slate-200 dark:border-night-700 relative group"
                            >
                                <img src={photo.url} alt="Secret" className="w-full h-full object-cover object-top" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Send className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const Messages: React.FC = () => {
    const { user, blockUser } = useAuth();
    const { currentTenant } = useTenant();
    const { showAlert } = useDialog();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showChatRules, setShowChatRules] = useState(false);
    const [chatUsers, setChatUsers] = useState<User[]>([]);
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Highlight State for New Match
    const [highlightedMatchId, setHighlightedMatchId] = useState<string | null>(null);

    const [timerSetting, setTimerSetting] = useState<30 | 60 | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmText: string;
        cancelText: string;
        isDanger: boolean;
        onConfirm: () => Promise<void>;
    }>({
        isOpen: false,
        title: '',
        description: '',
        confirmText: '',
        cancelText: '',
        isDanger: false,
        onConfirm: async () => { },
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const profileStatus = user ? getProfileStatus(user) : { status: 'COMPLETE', daysRemaining: 0 };
    const isBlocked = profileStatus.status === 'BLOCKED';

    const superSecretPhotos = user?.gallery?.filter(p => p.visibility === 'SUPER_SECRET') || [];

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputText]);

    // Handle incoming new match redirect
    useEffect(() => {
        if (location.state?.newMatchId) {
            const newId = location.state.newMatchId;
            setActiveMatchId(newId);
            setHighlightedMatchId(newId);

            // Clear highlight after 3 seconds
            const timer = setTimeout(() => {
                setHighlightedMatchId(null);
                window.history.replaceState({}, document.title);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Fetch Conversation List (Optimized)
    // --- REACT QUERY FOR CONVERSATIONS ---
    const { data: conversationData } = useQuery({
        queryKey: ['conversations', user?.uid],
        queryFn: async () => {
            if (!user || !user.tenantId) return { chatUsers: [], unreadCounts: {} };

            const convSummary = await db.getConversationsSummary(user.uid);
            const interactedUserIds = Object.keys(convSummary);

            const allUsers = await db.getAllUsers(user.tenantId);

            const filtered = allUsers.filter(u => {
                if (u.uid === user.uid) return false;
                if (user.blockedUserIds?.includes(u.uid)) return false;
                const isMutualMatch = user.likedUserIds?.includes(u.uid) && u.likedUserIds?.includes(user.uid);
                const hasHistory = interactedUserIds.includes(u.uid);
                return isMutualMatch || hasHistory;
            });

            return { chatUsers: filtered, unreadCounts: convSummary };
        },
        refetchInterval: 60000, // Reduced to 60s to save quota
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        enabled: !!user
    });

    useEffect(() => {
        if (conversationData) {
            setChatUsers(conversationData.chatUsers);
            setUnreadCounts(conversationData.unreadCounts);
        }
    }, [conversationData]);

    // REALTIME MESSAGES SUBSCRIPTION
    useEffect(() => {
        if (!user || !activeMatchId || isDeleting) return;

        const matchUser = chatUsers.find(m => m.uid === activeMatchId);
        setActiveUser(matchUser || null);

        // Mark read locally first
        if (unreadCounts[activeMatchId]) {
            db.markConversationAsRead(user.uid, activeMatchId);
            setUnreadCounts(prev => ({ ...prev, [activeMatchId]: 0 }));
        }

        // Subscribe
        const unsubscribe = db.subscribeToMessages(user.uid, activeMatchId, (newMessages) => {
            if (!isDeleting) {
                setMessages(newMessages);
            }
        });

        return () => unsubscribe();
    }, [activeMatchId, user, isDeleting, chatUsers]);

    const maxConsecutive = currentTenant?.chatSettings?.maxConsecutiveMessages ?? 2;
    const womenFree = currentTenant?.chatSettings?.womenCanMessageFreely ?? true;

    let consecutiveCount = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].senderId === user?.uid) {
            consecutiveCount++;
        } else {
            break;
        }
    }

    let isWaitingForReply = false;
    if (!user) {
        isWaitingForReply = true;
    } else if (user.type === 'WOMAN' && womenFree) {
        isWaitingForReply = false;
    } else {
        isWaitingForReply = consecutiveCount >= maxConsecutive;
    }

    const sendMessageInternal = async (text: string, imageUrl?: string) => {
        if (!activeMatchId || !user || isSending) return;

        setIsSending(true);
        try {
            const newMessage: Message = {
                id: `msg-${Date.now()}`,
                senderId: user.uid,
                receiverId: activeMatchId,
                text: text,
                timestamp: new Date().toISOString(),
                isRead: false,
                selfDestruct: imageUrl && timerSetting ? timerSetting : null,
                viewedAt: null,
                ...(imageUrl ? { imageUrl } : {})
            };

            await db.saveMessage(newMessage);
            // Optimistic update not strictly needed with listener, but makes UI snappier
            setInputText('');
            setTimerSetting(null);
            setShowMediaPicker(false);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (e) {
            console.error("Error sending message", e);
            await showAlert({
                title: "Errore Invio",
                description: "Impossibile inviare il messaggio.",
                isDanger: true
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleSendText = (e: React.FormEvent) => {
        e.preventDefault();
        if (isBlocked || isWaitingForReply || !inputText.trim()) return;
        const imageLink = convertDriveLink(inputText.trim());
        sendMessageInternal(inputText.trim(), imageLink || undefined);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText(e);
        }
    };

    const handleMediaSelect = (url: string) => {
        sendMessageInternal("📷 Foto Super Segreta", url);
    };

    const handleDeleteMessage = (msgId: string, isImage = false) => {
        setConfirmModal({
            isOpen: true,
            title: isImage ? 'Elimina Immagine' : 'Elimina Messaggio',
            description: isImage ? "Vuoi eliminare questa immagine?" : "Vuoi cancellare questo messaggio?",
            confirmText: 'Elimina',
            cancelText: 'Annulla',
            isDanger: true,
            onConfirm: async () => {
                await db.deleteMessage(msgId);
                // Listener will update UI
            }
        });
    };

    const handleBlockActiveUser = () => {
        if (!activeUser) return;
        setConfirmModal({
            isOpen: true,
            title: 'Nascondi Profilo',
            description: `Vuoi nascondere il tuo profilo a ${activeUser.displayName}? La conversazione verrà rimossa e non sarete più visibili l'uno all'altro.`,
            confirmText: 'Nascondi',
            cancelText: 'Annulla',
            isDanger: true,
            onConfirm: async () => {
                if (!activeUser) return;
                await blockUser(activeUser.uid);
                setActiveMatchId(null);
                setActiveUser(null);
                setShowMenu(false);
                setChatUsers(prev => prev.filter(m => m.uid !== activeUser!.uid));
            }
        });
    };

    const handleDeleteConversation = () => {
        if (!activeUser || !user) return;
        setConfirmModal({
            isOpen: true,
            title: 'Elimina Conversazione',
            description: `Sei sicuro di voler eliminare definitivamente tutti i messaggi con ${activeUser.displayName}? Questa azione non può essere annullata.`,
            confirmText: 'Elimina Tutto',
            cancelText: 'Annulla',
            isDanger: true,
            onConfirm: async () => {
                if (!user || !activeUser) return;
                setIsDeleting(true);
                setMessages([]);
                await db.deleteConversation(user.uid, activeUser.uid);
                setShowMenu(false);
                setTimeout(() => setIsDeleting(false), 2000);
            }
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const executeConfirmAction = async () => {
        await confirmModal.onConfirm();
        closeConfirmModal();
    };

    const toggleTimer = () => {
        if (timerSetting === null) setTimerSetting(30);
        else if (timerSetting === 30) setTimerSetting(60);
        else setTimerSetting(null);
    };

    const isButtonDisabled = !inputText.trim() || isWaitingForReply || isSending || isBlocked;

    return (
        <div className="flex h-full md:h-screen bg-white dark:bg-night-950 relative">

            {/* CUSTOM CONFIRMATION MODAL */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-night-700 transform transition-all animate-in zoom-in-95 duration-200">
                        <div className={`p-6 border-b border-slate-100 dark:border-night-700 flex items-center gap-3 ${confirmModal.isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-night-900'}`}>
                            <div className={`p-2 rounded-full ${confirmModal.isDanger ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-200 dark:bg-night-700 text-slate-600 dark:text-white'}`}>
                                {confirmModal.isDanger ? <AlertTriangle className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
                            </div>
                            <h3 className={`font-bold text-lg ${confirmModal.isDanger ? 'text-red-900 dark:text-red-300' : 'text-slate-900 dark:text-white'}`}>
                                {confirmModal.title}
                            </h3>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-600 dark:text-night-200 text-sm leading-relaxed">
                                {confirmModal.description}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-night-900 border-t border-slate-100 dark:border-night-700 flex gap-3">
                            <button
                                onClick={closeConfirmModal}
                                className="flex-1 py-2.5 bg-white dark:bg-night-800 border border-slate-300 dark:border-night-600 text-slate-700 dark:text-night-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-night-700 transition-colors"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                onClick={executeConfirmAction}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${confirmModal.isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                photos={superSecretPhotos}
                onSelect={handleMediaSelect}
            />

            {/* GATEKEEPING OVERLAY - HARD BLOCK */}
            {isBlocked && (
                <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-night-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-200 dark:border-night-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl"></div>

                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Profilo Incompleto</h2>
                        <p className="text-slate-600 dark:text-night-200 mb-8 leading-relaxed">
                            Hai superato il periodo di grazia. Non puoi inviare messaggi finché non completi il tuo profilo (Altezza, Peso, Capelli, Occhi, Interessi).
                        </p>
                        <button
                            onClick={() => navigate('/tenant/profile')}
                            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 dark:shadow-none"
                        >
                            Completa Profilo
                        </button>
                    </div>
                </div>
            )}

            {/* ... (Rest of component maintained layout) ... */}

            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r border-gray-200 dark:border-night-700 flex flex-col ${activeMatchId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-night-700 bg-white dark:bg-night-900">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Conversazioni</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-night-200" />
                        <input
                            type="text"
                            placeholder="Cerca conversazione..."
                            className="w-full bg-gray-50 dark:bg-night-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 dark:text-white dark:placeholder-night-200"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-night-900">
                    {chatUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Nessuna conversazione attiva.<br />Fai match per iniziare!
                        </div>
                    ) : (
                        chatUsers.map(match => {
                            const isBlinking = match.uid === highlightedMatchId;
                            const isActive = activeMatchId === match.uid;

                            return (
                                <div
                                    key={match.uid}
                                    onClick={() => setActiveMatchId(match.uid)}
                                    className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-night-800 transition-all relative 
                    ${isActive ? 'bg-rose-50 dark:bg-night-800 border-r-4 border-rose-500' : ''}
                    ${isBlinking ? 'animate-pulse bg-rose-100 dark:bg-rose-900/30 ring-2 ring-inset ring-rose-300 dark:ring-rose-700' : ''}
                `}
                                >
                                    <div className="relative">
                                        <img
                                            src={getUserAvatar(match)}
                                            alt={match.displayName}
                                            className="w-12 h-12 rounded-full object-cover object-top border border-gray-200 dark:border-night-700"
                                        />
                                        {match.isVerified && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-night-900"></div>}
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{match.displayName}</h3>
                                            {unreadCounts[match.uid] > 0 && (
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200"></div>
                                            )}
                                            {isBlinking && (
                                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-1.5 rounded ml-2">NUOVO</span>
                                            )}
                                        </div>
                                        <p className={`text-sm truncate ${unreadCounts[match.uid] > 0 ? 'font-bold text-slate-800 dark:text-white' : 'text-gray-500 dark:text-night-200'}`}>
                                            {unreadCounts[match.uid] > 0 ? `${unreadCounts[match.uid]} nuovi messaggi` : (isBlinking ? 'Nuovo Match! Di Ciao 👋' : 'Apri per chattare')}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!activeMatchId ? 'hidden md:flex' : 'flex'}`}>
                {activeMatchId && activeUser ? (
                    <>
                        <div className="h-16 border-b border-gray-100 dark:border-night-700 flex items-center justify-between px-4 bg-white dark:bg-night-900 shrink-0 shadow-sm z-10">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setActiveMatchId(null)}
                                    className="md:hidden mr-3 flex items-center text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-night-800 px-2 py-1.5 rounded-lg transition-colors group"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-1 group-active:-translate-x-1 transition-transform" />
                                    <span className="text-sm font-bold">Chat</span>
                                </button>
                                <div className="relative">
                                    <img
                                        src={getUserAvatar(activeUser)}
                                        alt={activeUser.displayName}
                                        className="w-10 h-10 rounded-full object-cover object-top border border-gray-200 dark:border-night-700"
                                    />
                                    {activeUser.isVerified && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-night-900"></div>}
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{activeUser.displayName}</h3>
                                        {activeUser.isVerified && (
                                            <CheckCircle2 className="w-4 h-4 text-blue-500 fill-current bg-white dark:bg-transparent rounded-full" />
                                        )}
                                    </div>
                                    <p className={`text-xs font-medium ${isUserOnline(activeUser) ? 'text-green-500' : 'text-gray-400'}`}>
                                        {isUserOnline(activeUser) ? 'Online ora' : (activeUser.lastActiveAt ? `Visto: ${new Date(activeUser.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Offline')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowChatRules(true)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                    title="Regole Chat"
                                >
                                    <Info className="w-5 h-5" />
                                </button>

                                <div className="relative">
                                    <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-night-800">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {showMenu && (
                                        <div className="absolute right-0 top-10 w-48 bg-white dark:bg-night-800 border border-gray-100 dark:border-night-700 shadow-xl rounded-xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2">
                                            <button className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-night-200 hover:bg-gray-50 dark:hover:bg-night-700 flex items-center">
                                                <Search className="w-4 h-4 mr-2" /> Cerca nella chat
                                            </button>
                                            <button
                                                onClick={handleDeleteConversation}
                                                className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-night-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 flex items-center border-t border-gray-50 dark:border-night-700"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Elimina Chat
                                            </button>
                                            <button
                                                onClick={handleBlockActiveUser}
                                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center border-t border-gray-50 dark:border-night-700"
                                            >
                                                <EyeOff className="w-4 h-4 mr-2" /> Nascondi Profilo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-night-950 flex flex-col gap-2 pb-20 md:pb-4">
                            {isDeleting ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-pulse">
                                    <Trash2 className="w-12 h-12 mb-4" />
                                    <p className="font-bold">Cancellazione in corso...</p>
                                </div>
                            ) : messages.map(msg => {
                                const isMe = msg.senderId === user?.uid;
                                const imageLink = convertDriveLink(msg.text);
                                const finalImage = msg.imageUrl || imageLink; // Backward compatibility

                                const canDelete = isMe || (!!finalImage && user.type === 'WOMAN');

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative group max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm break-words ${isMe ? 'bg-rose-500 text-white rounded-tr-sm' : 'bg-white dark:bg-night-800 text-slate-800 dark:text-white border border-gray-100 dark:border-night-700 rounded-tl-sm'}`}>

                                            {finalImage ? (
                                                <ProtectedImage
                                                    src={finalImage}
                                                    message={msg}
                                                    isMe={isMe}
                                                    canDelete={canDelete}
                                                    onDelete={() => handleDeleteMessage(msg.id, true)}
                                                    currentUserId={user.uid}
                                                />
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap leading-snug">{msg.text}</p>
                                            )}

                                            <div className="flex justify-end items-center mt-1 gap-1 select-none opacity-80">
                                                {/* Delete Button for Text Messages (Images handled in component) */}
                                                {canDelete && !finalImage && (
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full mr-1 ${isMe ? 'hover:bg-rose-600 text-rose-100' : 'hover:bg-gray-100 dark:hover:bg-night-700 text-gray-400'}`}
                                                        title="Elimina"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <p className={`text-[9px] ${isMe ? 'text-rose-100' : 'text-gray-400 dark:text-night-200'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {isMe && (
                                                    <span className="flex items-center ml-0.5">
                                                        {msg.isRead ? (
                                                            <CheckCheck className="w-3 h-3 text-white" />
                                                        ) : (
                                                            <Check className="w-3 h-3 text-white/70" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {messages.length === 0 && !isDeleting && (
                                <div className="text-center py-10 mt-auto mb-auto">
                                    <div className="w-16 h-16 bg-rose-100 dark:bg-night-800 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 text-2xl">👋</div>
                                    <p className="text-slate-500 dark:text-night-200 font-medium">Non ci sono messaggi qui.</p>
                                    <p className="text-sm text-slate-400 mt-1">Rompi il ghiaccio con {activeUser.displayName}!</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendText} className="p-3 bg-white dark:bg-night-900 border-t border-gray-100 dark:border-night-700" autoComplete="off">
                            <div className="flex items-end gap-2 relative">
                                {/* Overlay if waiting for reply */}
                                {isWaitingForReply && (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-night-900/60 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-full border border-slate-100 dark:border-night-700">
                                        <span className="text-xs font-bold text-slate-500 dark:text-night-200 flex items-center gap-2">
                                            <Lock className="w-3 h-3" /> Attendi risposta ({consecutiveCount}/{maxConsecutive})
                                        </span>
                                    </div>
                                )}

                                <div className="flex gap-2 items-center mb-1">
                                    {/* Media Attachment Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaPicker(true)}
                                        className={`p-2.5 rounded-full transition-colors shrink-0 ${showMediaPicker ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 dark:bg-night-800'}`}
                                        disabled={isBlocked || isWaitingForReply}
                                        title="Invia Foto Super Segreta"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>

                                    {/* Timer Toggle Button */}
                                    <button
                                        type="button"
                                        onClick={toggleTimer}
                                        className={`p-2.5 rounded-full transition-colors flex items-center gap-1 shrink-0 ${timerSetting ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-gray-100 text-gray-400 dark:bg-night-800'}`}
                                        title="Autodistruzione Immagine"
                                        disabled={isBlocked}
                                    >
                                        <Timer className="w-5 h-5" />
                                        {timerSetting && <span className="text-xs font-bold">{timerSetting}s</span>}
                                    </button>
                                </div>

                                <textarea
                                    ref={textareaRef}
                                    name="message_body"
                                    autoComplete="off"
                                    inputMode="text"
                                    enterKeyHint="send"
                                    rows={1}
                                    placeholder={isWaitingForReply ? "Attendi risposta..." : "Scrivi..."}
                                    className="flex-1 bg-gray-50 dark:bg-night-800 border-gray-200 dark:border-night-700 rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all disabled:opacity-50 dark:text-white text-sm resize-none overflow-y-auto max-h-[120px] min-h-[44px]"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isWaitingForReply || isBlocked}
                                />
                                <button
                                    type="submit"
                                    className={`p-3 rounded-full transition-all shrink-0 mb-1 ${!isButtonDisabled ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600' : 'bg-gray-100 dark:bg-night-800 text-gray-400 cursor-not-allowed'}`}
                                    disabled={isButtonDisabled}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            {timerSetting && (
                                <p className="text-[10px] text-orange-500 mt-2 ml-14 animate-in slide-in-from-top-1">
                                    <Flame className="w-3 h-3 inline mr-1" />
                                    Le immagini inviate si autodistruggeranno {timerSetting} secondi dopo la visualizzazione.
                                </p>
                            )}
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-night-950 text-slate-400">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-night-900 rounded-full flex items-center justify-center mb-6">
                            <Send className="w-8 h-8 opacity-50 dark:text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-night-100">I tuoi messaggi</h3>
                        <p className="max-w-xs mt-2 text-slate-400">Seleziona una conversazione dalla lista per iniziare a chattare.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;

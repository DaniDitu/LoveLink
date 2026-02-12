import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { User, Report, GenderType, Message, Tenant } from '../../types';
import { RefreshCcw, Trash2, MessageSquare, Send } from 'lucide-react';
import { ActionModal, ActionModalProps } from '../../components/ActionModal';
import { UserStatistics } from '../../components/superadmin/UserStatistics';
import { ReportsList } from '../../components/superadmin/ReportsList';
import { UserTable } from '../../components/superadmin/UserTable';
import { EditUserModal } from '../../components/superadmin/EditUserModal';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]); // Load tenants for filtering
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<GenderType | 'ALL'>('ALL');
  const [filterTenant, setFilterTenant] = useState<string>('ALL'); // NEW: Tenant Filter
  const [filterCity, setFilterCity] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterAgeMin, setFilterAgeMin] = useState<string>('');
  const [filterAgeMax, setFilterAgeMax] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Custom Modal State
  const [modalState, setModalState] = useState<Omit<ActionModalProps, 'onCancel'>>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Warning Modal State
  const [warningModal, setWarningModal] = useState<{
      isOpen: boolean;
      targetUserId: string;
      targetUserName: string;
      reportId: string;
  } | null>(null);
  
  const PREDEFINED_WARNINGS = [
      "Il tuo comportamento viola le nostre linee guida. Per favore, mantieni un linguaggio rispettoso.",
      "Abbiamo ricevuto segnalazioni sul tuo profilo. Ti invitiamo a rivedere le regole della community.",
      "Questa è un'ammonizione formale. Ulteriori violazioni porteranno alla sospensione dell'account.",
      "Ti ricordiamo che è vietato condividere informazioni sensibili o spam. Grazie per la collaborazione.",
      "La tua foto profilo non è conforme. Per favore cambiala per evitare blocchi."
  ];

  const [selectedWarning, setSelectedWarning] = useState<string>(PREDEFINED_WARNINGS[0]);

  const refreshData = async () => {
    setLoading(true);
    try {
        const [allUsers, allTenants] = await Promise.all([
            db.getAllUsers(),
            db.getAllTenants()
        ]);
        setUsers(allUsers.filter(u => u.role !== 'SUPER_ADMIN'));
        setTenants(allTenants);
        const pendingReports = await db.getReports('PENDING');
        setReports(pendingReports);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Filtering Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
        const matchesSearch = u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGender = filterGender === 'ALL' || u.type === filterGender;
        const matchesTenant = filterTenant === 'ALL' || u.tenantId === filterTenant; // Tenant Filter
        const matchesCity = !filterCity || (u.city && u.city.toLowerCase().includes(filterCity.toLowerCase()));
        const matchesRegion = !filterRegion || (u.region && u.region.toLowerCase().includes(filterRegion.toLowerCase()));
        const age = u.age || 0;
        const matchesMinAge = !filterAgeMin || age >= parseInt(filterAgeMin);
        const matchesMaxAge = !filterAgeMax || age <= parseInt(filterAgeMax);

        return matchesSearch && matchesGender && matchesTenant && matchesCity && matchesRegion && matchesMinAge && matchesMaxAge;
    });
  }, [users, searchTerm, filterGender, filterTenant, filterCity, filterRegion, filterAgeMin, filterAgeMax]);

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    const total = filteredUsers.length;
    if (total === 0) return null;

    const men = filteredUsers.filter(u => u.type === 'MAN').length;
    const women = filteredUsers.filter(u => u.type === 'WOMAN').length;
    const couples = filteredUsers.filter(u => u.type === 'COUPLE').length;
    const totalAge = filteredUsers.reduce((sum, u) => sum + (u.age || 0), 0);
    const avgAge = Math.round(totalAge / total);
    
    const regionCounts: Record<string, number> = {};
    filteredUsers.forEach(u => {
        if (u.region) regionCounts[u.region] = (regionCounts[u.region] || 0) + 1;
    });
    const topRegion = Object.entries(regionCounts).sort((a,b) => b[1] - a[1])[0];

    return { total, men, women, couples, avgAge, topRegion };
  }, [filteredUsers]);

  const handleSuspend = async (uid: string, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    await db.updateUser(uid, { status: newStatus as any });
    refreshData();
  };

  const handleBan = (uid: string) => {
    setModalState({
        isOpen: true,
        type: 'CONFIRM',
        title: 'Hard Delete Utente',
        description: "Sei sicuro di voler cancellare definitivamente questo utente dal database? Questa azione è irreversibile e cancellerà tutti i dati.",
        confirmText: 'Cancella Definitivamente',
        cancelText: 'Annulla',
        isDanger: true,
        onConfirm: async () => {
            await db.deleteUser(uid);
            refreshData();
            setModalState(prev => ({...prev, isOpen: false}));
        }
    });
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.size === 0) return;
    setModalState({
        isOpen: true,
        type: 'CONFIRM',
        title: 'Eliminazione Multipla',
        description: `Stai per eliminare definitivamente ${selectedUserIds.size} utenti. Questa azione è irreversibile. Procedere?`,
        confirmText: `Elimina ${selectedUserIds.size} Utenti`,
        cancelText: 'Annulla',
        isDanger: true,
        onConfirm: async () => {
            for (const uid of selectedUserIds) {
                await db.deleteUser(uid);
            }
            setSelectedUserIds(new Set());
            refreshData();
            setModalState(prev => ({...prev, isOpen: false}));
        }
    });
  };

  const handleDeleteAll = () => {
      setModalState({
          isOpen: true,
          type: 'PROMPT',
          title: 'RESET COMPLETO PIATTAFORMA',
          description: "ATTENZIONE: Stai per eliminare TUTTI gli utenti della piattaforma. Scrivi 'CANCELLA TUTTO' per confermare.",
          validationString: 'CANCELLA TUTTO',
          confirmText: 'DISTRUGGI DATABASE UTENTI',
          cancelText: 'Annulla',
          isDanger: true,
          inputValue: '',
          onConfirm: async (val) => {
              if (val === 'CANCELLA TUTTO') {
                  await db.deleteAllUsers();
                  refreshData();
                  setModalState(prev => ({...prev, isOpen: false}));
              }
          }
      });
  };

  const resolveReport = async (reportId: string, action: 'RESOLVED' | 'DISMISSED') => {
      await db.updateReportStatus(reportId, action);
      refreshData();
  };

  const openWarningModal = (report: Report) => {
    setWarningModal({
        isOpen: true,
        targetUserId: report.targetUserId,
        targetUserName: report.targetUserName,
        reportId: report.id
    });
    setSelectedWarning(PREDEFINED_WARNINGS[0]);
  };

  const handleSendWarning = async () => {
    if (!warningModal || !currentUser || !selectedWarning) return;
    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.uid,
        receiverId: warningModal.targetUserId,
        text: `[AVVISO AMMINISTRATORE]: ${selectedWarning}`,
        timestamp: new Date().toISOString(),
        isRead: false
    };
    try {
        await db.saveMessage(newMessage);
        setWarningModal(null);
        alert("Messaggio di avviso inviato con successo.");
    } catch (e) {
        console.error("Failed to send warning", e);
    }
  };

  const toggleSelectUser = (uid: string) => {
      const newSet = new Set(selectedUserIds);
      if (newSet.has(uid)) newSet.delete(uid);
      else newSet.add(uid);
      setSelectedUserIds(newSet);
  };

  const saveUserChanges = async (u: User) => {
      await db.updateUser(u.uid, u);
      setEditingUser(null);
      refreshData();
  };

  return (
    <div className="p-8 bg-slate-50 dark:bg-night-950 min-h-screen text-slate-900 dark:text-white relative">
      <ActionModal 
        {...modalState} 
        onCancel={() => setModalState(prev => ({...prev, isOpen: false}))} 
        onInputChange={(val) => setModalState(prev => ({...prev, inputValue: val}))}
      />

      {/* WARNING MESSAGE MODAL */}
      {warningModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-night-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-night-700 transform transition-all animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 dark:border-night-700 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300">Invia Avviso a {warningModal.targetUserName}</h3>
                          <p className="text-xs text-blue-700 dark:text-blue-200">Scegli un messaggio predefinito da inviare all'utente.</p>
                      </div>
                  </div>
                  <div className="p-6 space-y-4">
                      {PREDEFINED_WARNINGS.map((msg, idx) => (
                          <label key={idx} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedWarning === msg ? 'bg-blue-50 border-blue-500 shadow-sm dark:bg-blue-900/20 dark:border-blue-500' : 'bg-white dark:bg-night-900 border-slate-200 dark:border-night-600 hover:border-blue-300'}`}>
                              <input 
                                type="radio" 
                                name="warning_msg"
                                className="mt-1"
                                checked={selectedWarning === msg}
                                onChange={() => setSelectedWarning(msg)}
                              />
                              <span className="text-sm text-slate-700 dark:text-white leading-relaxed">{msg}</span>
                          </label>
                      ))}
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-night-900 border-t border-slate-100 dark:border-night-700 flex gap-3">
                      <button 
                          onClick={() => setWarningModal(null)}
                          className="px-6 py-2.5 bg-white dark:bg-night-800 border border-slate-300 dark:border-night-600 text-slate-700 dark:text-night-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-night-700 transition-colors"
                      >
                          Annulla
                      </button>
                      <button 
                          onClick={handleSendWarning}
                          className="flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                          <Send className="w-4 h-4" /> Invia Messaggio
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestione Utenti & Statistiche</h1>
            <p className="text-slate-500 dark:text-night-200">Analizza i dati demografici e modera la piattaforma.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={refreshData} className="p-2 bg-white dark:bg-night-800 border border-slate-200 dark:border-night-700 rounded-lg hover:bg-slate-50 dark:hover:bg-night-700">
                <RefreshCcw className="w-5 h-5 text-slate-600 dark:text-white" />
            </button>
            <button onClick={handleDeleteAll} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-sm text-sm flex items-center">
                <Trash2 className="w-4 h-4 mr-2" /> Elimina TUTTI
            </button>
        </div>
      </div>

      <UserStatistics stats={stats} />
      
      <ReportsList 
          reports={reports} 
          users={users} 
          onOpenWarning={openWarningModal} 
          onSuspend={(uid) => handleSuspend(uid, 'ACTIVE')} 
          onResolve={resolveReport} 
      />

      <UserTable 
          users={filteredUsers}
          tenants={tenants}
          selectedUserIds={selectedUserIds}
          onToggleSelect={toggleSelectUser}
          onSelectAll={(checked) => setSelectedUserIds(checked ? new Set(filteredUsers.map(u => u.uid)) : new Set())}
          onBulkDelete={handleBulkDelete}
          onEdit={setEditingUser}
          onSuspend={handleSuspend}
          onBan={handleBan}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterGender={filterGender} setFilterGender={setFilterGender}
          filterTenant={filterTenant} setFilterTenant={setFilterTenant}
          filterCity={filterCity} setFilterCity={setFilterCity}
          filterRegion={filterRegion} setFilterRegion={setFilterRegion}
          filterAgeMin={filterAgeMin} setFilterAgeMin={setFilterAgeMin}
          filterAgeMax={filterAgeMax} setFilterAgeMax={setFilterAgeMax}
          showFilters={showFilters} setShowFilters={setShowFilters}
      />

      <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={saveUserChanges} 
          setUser={setEditingUser} 
      />
    </div>
  );
};

export default UserManagement;
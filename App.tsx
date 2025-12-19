import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { 
  LayoutDashboard, Wallet, CheckCircle2, Plus, Trash2, Pencil, Flame,
  Clock, FileText, User as UserIcon, LogOut, Coffee, Car, ShoppingBag,
  CreditCard, MoreHorizontal, ShieldCheck, Mail, Lock,
  ArrowLeft, Bell, Heart, Gamepad2, Inbox, Calendar, Languages, Save, TrendingDown,
  X, Check, CalendarDays, Loader, ChevronRight // <--- ADDED CHEVRONRIGHT
} from 'lucide-react';
// Pastikan file types.ts ada. Jika tidak, definisikan interface di sini.
import { Expense, Habit, Note, AppTab, Language } from './types';
import { User } from '@supabase/supabase-js';

// --- Error Boundary Component (Untuk Mencegah White Screen) ---
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: any) { console.error("App Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong.</h2>
          <p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-black text-white rounded-lg">Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Translations ---
const translations = {
  en: {
    overview: "Overview", wallet: "Wallet", habits: "Habits", journal: "Journal",
    lastSevenDays: "Weekly", thisMonth: "Monthly", today: "Daily",
    account: "Account", preferences: "Preferences", hello: "Hello",
    totalSpend: "Total Spend", bestStreak: "Best Streak", records: "Records",
    recentActivity: "Recent activity", todaysGoals: "in A day", financeFIlter: "weekly",
    manage: "Manage", viewAll: "View All", logTransaction: "Log Transaction",
    desc: "Description", amount: "Amount", category: "Category", add: "Add",
    habitsTitle: "Habit Name", startTracking: "Add Habit",
    myJournal: "My Journal", newEntry: "New Entry", untitled: "Untitled Entry",
    beginThoughts: "Start writing...", words: "Words", saved: "Saved",
    delete: "Delete", signOut: "Sign Out", language: "Language",
    cloudSync: "Cloud Sync", notifications: "Notifications", privacy: "Privacy",
    theme: "Theme", placeholderJournal: "Reflect on your day, ideas, or dreams...",
    back: "Back", confirmDelete: "Delete this entry?", currency: "Rp",
    update: "Update", cancel: "Cancel", created: "Created", edited: "Edited",
    streak: "Streak", time: "Time", enableNotif: "Enable Notifications", notifEnabled: "Notifications Active",
    installApp: "Install App",
    categories: {
      Food: "Food", Transport: "Transport", Shopping: "Shopping",
      Bills: "Bills", Health: "Health", Entertainment: "Entertainment", Others: "Others"
    }
  },
  id: {
    overview: "Ringkasan", wallet: "Dompet", habits: "Kebiasaan", journal: "Jurnal",
    account: "Akun", preferences: "Preferensi", hello: "Halo", 
    lastSevenDays: "Mingguan", thisMonth: "Bulanan", today: "Harian",
    totalSpend: "Total Pengeluaran", bestStreak: "Streak Terbaik", records: "Catatan",
    recentActivity: "Aktivitas Terbaru", todaysGoals: "Target Hari Ini",
    manage: "Atur", viewAll: "Lihat Semua", logTransaction: "Catat Transaksi",
    desc: "Deskripsi", amount: "Jumlah", category: "Kategori", add: "Tambah",
    habitsTitle: "Nama Kebiasaan", startTracking: "Tambah Kebiasaan",
    myJournal: "Jurnal Saya", newEntry: "Catatan Baru", untitled: "Judul Kosong",
    beginThoughts: "Mulai menulis...", words: "Kata", saved: "Tersimpan",
    delete: "Hapus", signOut: "Keluar", language: "Bahasa",
    cloudSync: "Sinkronisasi Cloud", notifications: "Notifikasi", privacy: "Privasi",
    theme: "Tema", placeholderJournal: "Renungkan harimu, ide, atau mimpimu...",
    back: "Kembali", confirmDelete: "Hapus entri ini?", currency: "Rp",
    update: "Perbarui", cancel: "Batal", created: "Dibuat", edited: "Diedit",
    streak: "Streak", time: "Waktu", enableNotif: "Aktifkan Notifikasi", notifEnabled: "Notifikasi Aktif",
    installApp: "Instal Aplikasi",
    categories: {
      Food: "Makanan", Transport: "Transportasi", Shopping: "Belanja",
      Bills: "Tagihan", Health: "Kesehatan", Entertainment: "Hiburan", Others: "Lainnya"
    }
  }
};

// --- Authentication Screen ---
const AuthScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } }
        });
        if (error) throw error;
        else alert(lang === 'id' ? 'Cek email Anda untuk verifikasi!' : 'Check email for verification!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[340px] animate-in fade-in">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-[#1D1D1F] rounded-2xl flex items-center justify-center text-white mb-6 shadow-sm"><FileText size={32} /></div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Zenith</h1>
          <p className="text-[#86868B] text-sm mt-1">{lang === 'id' ? 'Sederhanakan rutinitas harianmu.' : 'Simplify your daily routine.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && <input className="apple-input w-full" placeholder={lang === 'id' ? 'Nama Lengkap' : 'Full Name'} value={name} onChange={e => setName(e.target.value)} required />}
          <input className="apple-input w-full" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="apple-input w-full" type="password" placeholder={lang === 'id' ? 'Kata Sandi' : 'Password'} value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-[13px] text-center font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="apple-button w-full py-3.5 mt-6 disabled:opacity-50">
            {loading ? <Loader className="animate-spin mx-auto" size={20}/> : isLogin ? (lang === 'id' ? 'Masuk' : 'Sign In') : (lang === 'id' ? 'Gabung' : 'Join')}
          </button>
        </form>
        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#007AFF] font-semibold text-[14px]">
            {isLogin ? (lang === 'id' ? "Buat akun baru" : "Create an account") : (lang === 'id' ? "Kembali ke Masuk" : "Back to Sign In")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---
const MainApp: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('zenith_lang') as Language) || 'id');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notifPermission, setNotifPermission] = useState(Notification.permission);
  
  // Data States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Filter State
  const [financeFilter, setFinanceFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // UI States
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Others' });
  const [newHabit, setNewHabit] = useState({ name: '', time: '' });
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isMobileNoteEditing, setIsMobileNoteEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingHabits, setProcessingHabits] = useState<string[]>([]);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const t = translations[lang];

  // --- NOTIFICATION LOGIC ---
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        new Notification('Zenith', { body: lang === 'id' ? 'Notifikasi diaktifkan!' : 'Notifications enabled!' });
      }
    } catch (e) {
      console.error("Notif error", e);
    }
  };

  useEffect(() => {
    if (notifPermission !== 'granted' || habits.length === 0) return;
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      habits.forEach(h => {
        if (h.reminder_time === currentTimeString) {
           new Notification(`Zenith: ${h.name}`, {
             body: lang === 'id' ? `Waktunya untuk: ${h.name}` : `It's time for: ${h.name}`,
           });
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [habits, notifPermission, lang]);

  // --- Helper Functions ---
  const last7Days = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    return dates;
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val).replace('IDR', 'Rp');
  
  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatShortDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });
  };

  // --- Filter Logic Optimized ---
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    // Pre-calculate filter boundaries to avoid doing it inside the loop
    const todayStr = now.toDateString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter(e => {
      const itemDate = new Date(e.date);
      if (financeFilter === 'daily') {
        return itemDate.toDateString() === todayStr;
      } else if (financeFilter === 'weekly') {
        return itemDate.getTime() >= oneWeekAgo;
      } else {
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }
    });
  }, [expenses, financeFilter]);

  const totalSpentFiltered = useMemo(() => 
    filteredExpenses.reduce((a, b) => a + (b.amount || 0), 0), 
  [filteredExpenses]);

  // --- Auth & Data Lifecycle ---
  const fetchData = async (userId: string) => {
    const [exp, hab, not] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('habits').select('*').order('created_at', { ascending: false }), 
      supabase.from('notes').select('*').order('updated_at', { ascending: false })
    ]);
    if (exp.data) setExpenses(exp.data);
    if (hab.data) setHabits(hab.data);
    if (not.data) setNotes(not.data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) fetchData(session.user.id);
      else { setExpenses([]); setHabits([]); setNotes([]); }
    });

    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    
    // Fix: Define handler outside to allow proper removal
    const handleBeforePrompt = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    
    return () => { subscription.unsubscribe(); window.removeEventListener('beforeinstallprompt', handleBeforePrompt); };
  }, []);

  useEffect(() => { localStorage.setItem('zenith_lang', lang); }, [lang]);

  // --- SUPABASE REALTIME ---
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase.channel('public:habits')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, () => {
        // Simple refetch strategy
        if(currentUser) fetchData(currentUser.id);
    })
    .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setExpenses([]); setHabits([]); setNotes([]); setActiveTab('dashboard');
  };

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert(lang === 'id' ? "Gunakan menu 'Share' Safari dan 'Add to Home Screen'." : "Use Safari 'Share' and 'Add to Home Screen'.");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  // --- CRUD FUNCTIONS (Keep logic mostly same, ensure types) ---
  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount) {
      const payload = {
        description: newExpense.description, 
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        user_id: currentUser!.id,
      };

      if (editingExpenseId) {
        const { data, error } = await supabase.from('expenses').update({...payload, updated_at: new Date().toISOString()}).eq('id', editingExpenseId).select();
        if (!error && data) {
           setExpenses(expenses.map(e => e.id === editingExpenseId ? data[0] : e));
           cancelEditExpense(); 
        }
      } else {
        const { data, error } = await supabase.from('expenses').insert([{...payload, date: new Date().toISOString()}]).select();
        if (!error && data) { 
           setExpenses([data[0], ...expenses]); 
           setNewExpense({ description: '', amount: '', category: 'Others' }); 
        }
      }
    }
  };

  const startEditingExpense = (e: Expense) => {
    setEditingExpenseId(e.id);
    setNewExpense({ description: e.description, amount: e.amount.toString(), category: e.category });
  };
  const cancelEditExpense = () => { setEditingExpenseId(null); setNewExpense({ description: '', amount: '', category: 'Others' }); };
  const deleteExpense = async (id: string) => { if (!(await supabase.from('expenses').delete().eq('id', id)).error) { setExpenses(expenses.filter(x => x.id !== id)); if (editingExpenseId === id) cancelEditExpense(); } };

  const handleAddHabit = async () => {
    if(newHabit.name) {
      if (editingHabitId) {
        const { data, error } = await supabase.from('habits').update({ name: newHabit.name, reminder_time: newHabit.time, updated_at: new Date().toISOString() }).eq('id', editingHabitId).select();
        if (!error && data) { setHabits(habits.map(h => h.id === editingHabitId ? data[0] : h)); cancelEditHabit(); }
      } else {
        const { data, error } = await supabase.from('habits').insert([{ name: newHabit.name, streak: 0, completed_dates: [], reminder_time: newHabit.time, user_id: currentUser!.id }]).select();
        if (!error && data) { setHabits([data[0], ...habits]); setNewHabit({name:'', time:''}); }
      }
    }
  };
  const startEditingHabit = (h: Habit) => { setEditingHabitId(h.id); setNewHabit({ name: h.name, time: h.reminder_time || '' }); };
  const cancelEditHabit = () => { setEditingHabitId(null); setNewHabit({ name: '', time: '' }); };
  
  const toggleHabit = async (h: Habit) => {
    if (processingHabits.includes(h.id)) return;
    setProcessingHabits(prev => [...prev, h.id]);

    const today = new Date().toLocaleDateString();
    const alreadyDone = h.completed_dates?.includes(today);
    const updatedDates = alreadyDone ? h.completed_dates.filter(d => d !== today) : [...(h.completed_dates || []), today];
    const uniqueDates = Array.from(new Set(updatedDates));
    
    // Optimistic Update
    setHabits(habits.map(item => item.id === h.id ? { ...item, completed_dates: uniqueDates, streak: alreadyDone ? Math.max(0, h.streak - 1) : h.streak + 1 } : item));

    const { error } = await supabase.from('habits').update({ 
      completed_dates: uniqueDates, 
      streak: alreadyDone ? Math.max(0, h.streak - 1) : h.streak + 1,
      updated_at: new Date().toISOString()
    }).eq('id', h.id);

    if (error) fetchData(currentUser!.id); // Revert on error
    setProcessingHabits(prev => prev.filter(id => id !== h.id));
  };
  
  const deleteHabit = async (id: string) => { if (!(await supabase.from('habits').delete().eq('id', id)).error) { setHabits(habits.filter(x => x.id !== id)); if (editingHabitId === id) cancelEditHabit(); } };

  const handleSaveNoteManual = async () => {
    if (!activeNote || !currentUser) return;
    setIsSaving(true);
    const noteData = { title: activeNote.title || t.untitled, content: activeNote.content || '', user_id: currentUser.id, updated_at: new Date().toISOString() };
    const { data, error } = activeNote.id && activeNote.id.length > 15 
      ? await supabase.from('notes').update(noteData).eq('id', activeNote.id).select()
      : await supabase.from('notes').insert([noteData]).select();
    
    if (!error && data) {
      setNotes(activeNote.id && activeNote.id.length > 15 ? notes.map(n => n.id === activeNote.id ? data[0] : n) : [data[0], ...notes]);
      setActiveNote(data[0]);
    }
    setIsSaving(false);
  };
  const deleteNote = async (id: string) => { if(window.confirm(t.confirmDelete) && !(await supabase.from('notes').delete().eq('id', id)).error) { setNotes(notes.filter(n => n.id !== id)); setActiveNote(null); setIsMobileNoteEditing(false); } };

  const getCategoryIcon = (cat: string) => {
    const icons: any = { Food: <Coffee size={16}/>, Transport: <Car size={16}/>, Shopping: <ShoppingBag size={16}/>, Bills: <CreditCard size={16}/>, Health: <Heart size={16}/>, Entertainment: <Gamepad2 size={16}/> };
    return icons[cat] || <MoreHorizontal size={16}/>;
  };

  if (authLoading) return <div className="h-screen w-screen flex items-center justify-center font-bold text-[#1D1D1F] animate-pulse">Zenith...</div>;
  if (!currentUser) return <AuthScreen lang={lang} />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white w-full overflow-x-hidden safe-area-bottom">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-[#F2F2F7] fixed h-full flex-col p-8 z-50">
        <div className="flex items-center space-x-3.5 mb-12 px-2">
          <div className="w-9 h-9 bg-[#1D1D1F] rounded-xl flex items-center justify-center text-white shadow-sm"><FileText size={20} /></div>
          <h1 className="text-xl font-bold tracking-tight">Zenith</h1>
        </div>
        <nav className="space-y-1.5 flex-1">
          {(['dashboard', 'finance', 'habits', 'notes'] as const).map(key => (
            <button key={key} onClick={() => { setActiveTab(key); setActiveNote(null); }} className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-xl w-full transition-all ${activeTab === key ? 'bg-[#F2F2F7] text-[#007AFF]' : 'text-[#86868B]'}`}>
                {key === 'dashboard' && <LayoutDashboard size={18}/>}
                {key === 'finance' && <Wallet size={18}/>}
                {key === 'habits' && <CheckCircle2 size={18}/>}
                {key === 'notes' && <Pencil size={18}/>}
                <span className="font-semibold capitalize">{t[key === 'finance' ? 'wallet' : key === 'notes' ? 'journal' : key]}</span>
            </button>
          ))}
        </nav>
        <div className="pt-6 border-t border-[#F2F2F7]">
           <button onClick={() => setActiveTab('settings')} className="flex items-center space-x-3 w-full px-2 mb-8 text-left group">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] font-bold text-sm group-hover:bg-[#E5E5EA] transition-colors">{currentUser.user_metadata?.full_name?.[0] || 'U'}</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[14px] font-bold truncate">{currentUser.user_metadata?.full_name || 'User'}</p>
                <p className="text-[11px] font-semibold text-[#86868B] uppercase">{t.account}</p>
              </div>
           </button>
           <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-2 py-3 text-red-500 font-bold hover:opacity-70 transition-opacity"><LogOut size={16}/><span>{t.signOut}</span></button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[260px] pb-32 md:pb-12 pt-6 md:pt-16 px-6 md:px-16 w-full max-w-[1280px]">
        <header className={`py-6 md:py-10 flex justify-between items-center ${isMobileNoteEditing ? 'hidden md:flex' : 'flex'}`}>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] tracking-tight">
              {activeTab === 'dashboard' && `${t.hello}, ${currentUser.user_metadata?.full_name?.split(' ')[0] || 'User'}`}
              {activeTab === 'finance' && t.wallet} {activeTab === 'habits' && t.habits}
              {activeTab === 'notes' && t.journal} {activeTab === 'settings' && t.preferences}
            </h2>
            <p className="text-[#86868B] text-[15px] font-semibold mt-1">{new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <button 
             onClick={requestNotificationPermission} 
             className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${notifPermission === 'granted' ? 'bg-[#F2F2F7] text-[#007AFF]' : 'bg-[#FF3B30] text-white animate-pulse'}`}
          >
             <Bell size={20} className={notifPermission === 'granted' ? '' : 'fill-current'} />
          </button>
        </header>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-12 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="apple-card p-8"><div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#007AFF] mb-6"><Wallet size={20}/></div><p className="text-[11px] font-bold text-[#86868B] uppercase mb-1.5">{t.totalSpend}</p><h3 className="text-2xl font-bold truncate">{formatCurrency(totalSpentFiltered)}</h3></div>
              <div className="apple-card p-8"><div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#FF9500] mb-6"><Flame size={20}/></div><p className="text-[11px] font-bold text-[#86868B] uppercase mb-1.5">{t.bestStreak}</p><h3 className="text-3xl font-bold">{habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0} <span className="text-base text-[#86868B]">Days</span></h3></div>
              <div className="apple-card p-8"><div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#5856D6] mb-6"><Pencil size={20}/></div><p className="text-[11px] font-bold text-[#86868B] uppercase mb-1.5">{t.records}</p><h3 className="text-3xl font-bold">{notes.length}</h3></div>
            </div>
            <div className="apple-card p-8"><h4 className="font-bold text-xl mb-8">{t.recentActivity}</h4>
                {expenses.slice(0, 4).map(e => (
                  <div key={e.id} className="flex justify-between items-center mb-6 last:mb-0">
                    <div className="flex items-center space-x-4"><div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center">{getCategoryIcon(e.category)}</div><div><p className="font-bold">{e.description}</p><p className="text-[12px] text-[#86868B] uppercase">{t.categories[e.category] || e.category}</p></div></div>
                    <p className="font-bold">-{formatCurrency(e.amount)}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-8 fade-in">
            <div className="flex bg-[#F2F2F7] p-1 rounded-xl w-full max-w-sm mx-auto shadow-inner">
              {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                <button key={f} onClick={() => setFinanceFilter(f)} className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all ${financeFilter === f ? 'bg-white text-[#007AFF] shadow-sm' : 'text-[#86868B]'}`}>
                  {f === 'daily' ? (lang === 'id' ? 'Hari' : 'Daily') : f === 'weekly' ? (lang === 'id' ? 'Minggu' : 'Weekly') : (lang === 'id' ? 'Bulan' : 'Monthly')}
                </button>
              ))}
            </div>

            <div className="apple-card p-8 bg-[#007AFF] text-white border-none relative overflow-hidden">
               <TrendingDown className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-10 rotate-[-15deg]" />
               <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1">
                Total {financeFilter === 'daily' ? t.today : financeFilter === 'weekly' ? t.lastSevenDays : t.thisMonth}
              </p>
               <h3 className="text-4xl font-extrabold">{formatCurrency(totalSpentFiltered)}</h3>
            </div>

            <div className={`apple-card p-8 border-none transition-colors duration-300 ${editingExpenseId ? 'bg-[#FFF8E6] border-2 border-[#FFD60A]' : 'bg-[#F9F9FB]'}`}>
                {editingExpenseId && <p className="text-xs font-bold text-[#FF9500] uppercase mb-3">{t.update} Transaction</p>}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <input className="md:col-span-5 apple-input bg-white" placeholder={t.desc} value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}/>
                    <input className="md:col-span-3 apple-input bg-white" type="number" placeholder="0" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}/>
                    <select className="md:col-span-3 apple-input bg-white" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>{Object.entries(t.categories).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}</select>
                    <div className="md:col-span-1 flex space-x-2">
                          {editingExpenseId ? (
                             <>
                                <button onClick={handleAddExpense} className="apple-button h-11 flex-1 bg-[#34C759] hover:bg-[#2DA84E]"><Check size={20}/></button>
                                <button onClick={cancelEditExpense} className="apple-button h-11 flex-1 bg-[#86868B] hover:bg-[#636366]"><X size={20}/></button>
                             </>
                          ) : (
                             <button onClick={handleAddExpense} className="apple-button h-11 w-full"><Plus size={20}/></button>
                          )}
                    </div>
                </div>
            </div>

            <div className="apple-card overflow-hidden divide-y divide-[#F2F2F7]">
              {filteredExpenses.map(e => (
                <div key={e.id} className={`p-5 flex items-center group transition-colors ${editingExpenseId === e.id ? 'bg-[#F2F2F7]' : 'hover:bg-[#F9F9FB]'}`}>
                  <div className="flex-1 flex items-center space-x-4">
                      <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center">{getCategoryIcon(e.category)}</div>
                      <div><p className="font-bold">{e.description}</p><p className="text-[12px] text-[#86868B]">{t.categories[e.category]} • {new Date(e.date).toLocaleDateString()}</p></div>
                  </div>
                  <div className="flex items-center space-x-6">
                      <p className="font-bold">-{formatCurrency(e.amount)}</p>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => startEditingExpense(e)} className="text-[#007AFF] p-2 hover:bg-blue-50 rounded-lg"><Pencil size={16}/></button>
                         <button onClick={() => deleteExpense(e.id)} className="text-[#D1D1D6] hover:text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                  </div>
                </div>
              ))}
              {filteredExpenses.length === 0 && <EmptyState message={lang === 'id' ? 'Catatan periode ini kosong.' : 'No records for this period.'} />}
            </div>
          </div>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div className="space-y-8 fade-in">
            <div className={`apple-card p-6 border-none flex flex-col md:flex-row gap-4 transition-colors duration-300 ${editingHabitId ? 'bg-[#FFF8E6]' : 'bg-[#F9F9FB]'}`}>
              <div className="flex-1 flex flex-col md:flex-row gap-3">
                  <input className="apple-input flex-1 bg-white" placeholder={t.habitsTitle} value={newHabit.name} onChange={e => setNewHabit({...newHabit, name: e.target.value})}/>
                  <input type="time" className="apple-input w-full md:w-32 bg-white" value={newHabit.time} onChange={e => setNewHabit({...newHabit, time: e.target.value})}/>
              </div>
              {editingHabitId ? (
                   <div className="flex space-x-2">
                       <button onClick={handleAddHabit} className="apple-button flex-1 md:flex-none px-5 h-12 bg-[#34C759] hover:bg-[#2DA84E] font-semibold text-sm">{t.update}</button>
                       <button onClick={cancelEditHabit} className="apple-button w-12 h-12 bg-[#86868B] hover:bg-[#636366] text-white flex items-center justify-center"><X size={20}/></button>
                   </div>
              ) : (
                  <button onClick={handleAddHabit} className="apple-button w-full md:w-auto px-6 h-12 font-semibold text-sm whitespace-nowrap">{t.startTracking}</button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {habits.map(h => {
                const today = new Date().toLocaleDateString();
                const done = h.completed_dates?.includes(today);
                const isProcessing = processingHabits.includes(h.id);

                return (
                  <div key={h.id} className={`apple-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between group relative transition-all duration-300 ${editingHabitId === h.id ? 'ring-2 ring-[#007AFF]' : 'hover:shadow-md'}`}>
                    <div className="flex items-center space-x-4 w-full md:w-auto mb-4 md:mb-0 pr-12 md:pr-0">
                      <button onClick={() => toggleHabit(h)} disabled={isProcessing} className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform active:scale-90 ${done ? 'bg-[#34C759] border-[#34C759] text-white shadow-sm' : 'border-[#E5E5EA] hover:border-[#34C759] text-transparent'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {isProcessing ? <Loader className="animate-spin" size={20} /> : <Check strokeWidth={4} size={20} />}
                      </button>
                      <div className="min-w-0">
                        <h4 className={`text-[17px] font-bold text-[#1D1D1F] truncate ${done ? 'opacity-50 line-through decoration-2 decoration-[#D1D1D6]' : ''}`}>{h.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {h.reminder_time && (
                                <span className="flex items-center text-[10px] font-bold bg-[#F2F2F7] text-[#86868B] px-2 py-0.5 rounded-md whitespace-nowrap"><Clock size={10} className="mr-1"/> {h.reminder_time}</span>
                            )}
                            <span className="flex items-center text-[10px] font-bold bg-[#FFF5E5] text-[#FF9500] px-2 py-0.5 rounded-md whitespace-nowrap"><Flame size={10} className="mr-1"/> {h.streak} {t.streak}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 ml-0 md:ml-auto mr-0 md:mr-8 pl-[64px] md:pl-0 w-full md:w-auto overflow-x-auto hide-scrollbar">
                        {last7Days.map((d, i) => {
                           const dString = d.toLocaleDateString();
                           const isDone = h.completed_dates?.includes(dString);
                           const isToday = dString === today;
                           return (<div key={i} className={`flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all ${isDone ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'} ${isToday && !isDone ? 'ring-2 ring-[#34C759] ring-offset-1 bg-white' : ''}`} title={dString}/>)
                        })}
                    </div>

                    <div className="absolute top-4 right-4 md:static md:flex items-center space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => startEditingHabit(h)} className="text-[#007AFF] p-2 hover:bg-blue-50 rounded-lg"><Pencil size={18}/></button>
                         <button onClick={() => deleteHabit(h.id)} className="text-[#D1D1D6] hover:text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                    </div>
                  </div>
              )})}
            </div>
          </div>
        )}

        {/* Journal Tab */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-12 gap-0 md:gap-8 h-[calc(100vh-280px)] fade-in overflow-hidden">
            <div className={`col-span-12 md:col-span-4 flex flex-col space-y-3 overflow-y-auto pr-2 custom-scrollbar ${isMobileNoteEditing ? 'hidden md:flex' : 'flex'}`}>
              <button onClick={() => { setActiveNote({ title: '', content: '', user_id: currentUser.id } as any); setIsMobileNoteEditing(true); }} className="apple-button w-full py-4 mb-2 shadow-sm flex items-center justify-center"><Plus size={18} className="mr-2"/> {t.newEntry}</button>
              {notes.map(n => (
                <div key={n.id} onClick={() => { setActiveNote(n); setIsMobileNoteEditing(true); }} className={`apple-card p-5 cursor-pointer border-none transition-all group ${activeNote?.id === n.id ? 'bg-[#F2F2F7] ring-1 ring-[#E5E5EA]' : 'hover:bg-[#F9F9FB]'}`}>
                  <h5 className={`font-bold truncate text-[15px] ${activeNote?.id === n.id ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>{n.title || t.untitled}</h5>
                  <p className="text-[13px] text-[#86868B] line-clamp-2 mt-1.5 leading-relaxed">{n.content || t.beginThoughts}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F2F2F7] opacity-60 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wide flex items-center"><CalendarDays size={10} className="mr-1"/> {formatShortDate(n.updated_at || n.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`col-span-12 md:col-span-8 flex-col h-full apple-card p-0 border-none bg-white relative overflow-hidden shadow-sm ${isMobileNoteEditing ? 'flex' : 'hidden md:flex'}`}>
               <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F2F7] bg-white z-10">
                  <button onClick={() => setIsMobileNoteEditing(false)} className="md:hidden text-[#007AFF] font-bold flex items-center"><ArrowLeft size={20} className="mr-1" /> {t.back}</button>
                  <div className="flex items-center space-x-2 ml-auto">
                    {activeNote && (
                      <>
                        <button onClick={handleSaveNoteManual} disabled={isSaving} className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${isSaving ? 'bg-gray-100 text-gray-400' : 'bg-[#007AFF] text-white hover:bg-[#0062CC]'}`}>
                          <Save size={14} className="mr-2"/> {isSaving ? '...' : t.saved}
                        </button>
                        <button onClick={() => deleteNote(activeNote.id)} className="text-[#D1D1D6] hover:text-red-500 p-2.5 rounded-xl hover:bg-red-50 transition-colors"><Trash2 size={18}/></button>
                      </>
                    )}
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 md:p-10">
                 {activeNote && (
                    <div className="max-w-3xl mx-auto">
                        {activeNote.id && (
                           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-8 text-[11px] text-[#86868B] font-semibold uppercase tracking-widest">
                              <span className="flex items-center"><Calendar size={12} className="mr-1.5"/> {t.created}: {formatDateTime(activeNote.created_at)}</span>
                              {activeNote.updated_at && activeNote.updated_at !== activeNote.created_at && (<span className="flex items-center"><Pencil size={12} className="mr-1.5"/> {t.edited}: {formatDateTime(activeNote.updated_at)}</span>)}
                           </div>
                        )}
                        <input className="text-3xl md:text-5xl font-extrabold bg-transparent outline-none mb-6 w-full text-[#1D1D1F] placeholder-gray-300" placeholder={t.untitled} value={activeNote?.title || ''} onChange={e => setActiveNote(prev => prev ? {...prev, title: e.target.value} : {title: e.target.value, content: '', user_id: currentUser!.id} as any)} />
                        <textarea className="w-full bg-transparent outline-none resize-none text-[17px] md:text-[19px] leading-relaxed text-[#424245] placeholder-gray-300 min-h-[400px]" placeholder={t.placeholderJournal} value={activeNote?.content || ''} onChange={e => setActiveNote(prev => prev ? {...prev, content: e.target.value} : {title: '', content: e.target.value, user_id: currentUser!.id} as any)} />
                    </div>
                 )}
                 {!activeNote && (<div className="h-full flex flex-col items-center justify-center text-[#D1D1D6]"><Pencil size={48} className="mb-4 opacity-20"/><p className="text-[#86868B] font-medium">{t.beginThoughts}</p></div>)}
               </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-10 fade-in pt-10">
             <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#F5F5F7] border flex items-center justify-center text-[#1D1D1F] text-3xl font-bold mx-auto mb-6">{currentUser.user_metadata?.full_name?.[0] || 'U'}</div>
                <h3 className="text-2xl font-bold">{currentUser.user_metadata?.full_name || 'User'}</h3>
                <p className="text-[#86868B] font-semibold">{currentUser.email}</p>
             </div>
             <div className="apple-card overflow-hidden bg-white divide-y">
                <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setLang(lang === 'id' ? 'en' : 'id')}>
                  <div className="flex items-center space-x-5"><div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center"><Languages size={18} className="text-[#007AFF]"/></div><div><span className="font-bold text-[16px] block">{t.language}</span><span className="text-[12px] text-[#86868B]">{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</span></div></div>
                  <div className="w-10 h-5 bg-[#E5E5EA] rounded-full relative"><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${lang === 'id' ? 'right-0.5' : 'left-0.5'}`}></div></div>
                </div>
                {!isInstalled && (
                  <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-[#F9F9FB]" onClick={handleInstallClick}>
                    <div className="flex items-center space-x-5"><div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center"><Plus size={18} className="text-[#007AFF]"/></div><div><span className="font-bold text-[16px] block">{t.installApp}</span><span className="text-[12px] text-[#86868B]">Add to Home Screen</span></div></div>
                    <ChevronRight size={18} className="text-[#D1D1D6]"/>
                  </div>
                )}
             </div>
             <div className="text-center pt-8"><button onClick={handleLogout} className="px-10 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all text-sm uppercase tracking-widest">{t.signOut}</button></div>
          </div>
        )}
      </main>

      {/* Tab Bar Mobile with Safe Area */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 glass-nav flex justify-around items-start pt-3 px-4 z-50 transition-all duration-300 pb-[env(safe-area-inset-bottom)] h-[calc(60px+env(safe-area-inset-bottom))] ${isMobileNoteEditing ? 'translate-y-full opacity-0' : ''}`}>
        {[ { id: 'dashboard', label: t.overview, icon: <LayoutDashboard/> }, { id: 'finance', label: t.wallet, icon: <Wallet/> }, { id: 'habits', label: t.habits, icon: <CheckCircle2/> }, { id: 'notes', label: t.journal, icon: <Pencil/> }, { id: 'settings', label: t.account, icon: <UserIcon/> } ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id as AppTab); setIsMobileNoteEditing(false); }} className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === tab.id ? 'text-[#007AFF]' : 'text-[#86868B]'}`}>
            {React.cloneElement(tab.icon as any, { size: 22, strokeWidth: activeTab === tab.id ? 2.5 : 2 })}<span className="text-[10px] mt-1.5 font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (<div className="flex flex-col items-center justify-center py-20 text-center fade-in"><div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#D1D1D6] mb-4"><Inbox size={24} /></div><p className="text-[#86868B] font-semibold text-[15px]">{message}</p></div>);

const App = () => (
    <ErrorBoundary>
        <MainApp />
    </ErrorBoundary>
);

export default App;
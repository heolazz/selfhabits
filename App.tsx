import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { 
  LayoutDashboard, Wallet, CheckCircle2, Plus, Trash2, ChevronRight, Pencil, Flame,
  Clock, FileText, User as UserIcon, LogOut, Coffee, Car, ShoppingBag,
  CreditCard, MoreHorizontal, Heart, Gamepad2, Inbox, Calendar, Languages, Save, TrendingDown,
  X, Check, CalendarDays, ArrowLeft
} from 'lucide-react';
// --- NEW IMPORTS FOR VISUALIZATION & GAMIFICATION ---
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import confetti from 'canvas-confetti';
import { Expense, Habit, Note, AppTab, Language } from './types';

// --- Translations ---
const translations = {
  en: {
    overview: "Overview", wallet: "Wallet", habits: "Habits", journal: "Journal",
    lastSevenDays: "weekly expense", thisMonth: "monthly expense", today: "daily expense",
    account: "Account", preferences: "Preferences", hello: "Hello",
    totalSpend: "Total Spend", bestStreak: "Best Streak", records: "Records",
    recentActivity: "Recent activity", todaysGoals: "in A day", financeFIlter: "weekly",
    manage: "Manage", viewAll: "View All", logTransaction: "Log Transaction",
    desc: "Description", amount: "Amount", category: "Category", add: "Add",
    habitsTitle: "New Habit Goal", startTracking: "Start Tracking",
    myJournal: "My Journal", newEntry: "New Entry", untitled: "Untitled Entry",
    beginThoughts: "Start writing...", words: "Words", saved: "Saved",
    delete: "Delete", signOut: "Sign Out", language: "Language",
    cloudSync: "Cloud Sync", notifications: "Notifications", privacy: "Privacy",
    theme: "Theme", placeholderJournal: "Reflect on your day, ideas, or dreams...",
    back: "Back", confirmDelete: "Delete this entry?", currency: "Rp",
    update: "Update", cancel: "Cancel", created: "Created", edited: "Edited",
    spendingBreakdown: "Spending Breakdown", topCategory: "Top Category",
    categories: {
      Food: "Food", Transport: "Transport", Shopping: "Shopping",
      Bills: "Bills", Health: "Health", Entertainment: "Entertainment", Others: "Others"
    }
  },
  id: {
    overview: "Ringkasan", wallet: "Dompet", habits: "Kebiasaan", journal: "Jurnal",
    account: "Akun", preferences: "Preferensi", hello: "Halo", 
    lastSevenDays: "7 Hari Terakhir", thisMonth: "Bulan Ini", today: "Hari Ini",
    totalSpend: "Total Pengeluaran", bestStreak: "Streak Terbaik", records: "Catatan",
    recentActivity: "Aktivitas Terbaru", todaysGoals: "Target Hari Ini",
    manage: "Atur", viewAll: "Lihat Semua", logTransaction: "Catat Transaksi",
    desc: "Deskripsi", amount: "Jumlah", category: "Kategori", add: "Tambah",
    habitsTitle: "Target Kebiasaan Baru", startTracking: "Mulai Lacak",
    myJournal: "Jurnal Saya", newEntry: "Catatan Baru", untitled: "Judul Kosong",
    beginThoughts: "Mulai menulis...", words: "Kata", saved: "Tersimpan",
    delete: "Hapus", signOut: "Keluar", language: "Bahasa",
    cloudSync: "Sinkronisasi Cloud", notifications: "Notifikasi", privacy: "Privasi",
    theme: "Tema", placeholderJournal: "Renungkan harimu, ide, atau mimpimu...",
    back: "Kembali", confirmDelete: "Hapus entri ini?", currency: "Rp",
    update: "Perbarui", cancel: "Batal", created: "Dibuat", edited: "Diedit",
    spendingBreakdown: "Analisa Pengeluaran", topCategory: "Kategori Terbesar",
    categories: {
      Food: "Makanan", Transport: "Transportasi", Shopping: "Belanja",
      Bills: "Tagihan", Health: "Kesehatan", Entertainment: "Hiburan", Others: "Lainnya"
    }
  }
};

// --- CHART COLORS (Apple Style) ---
const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#5856D6', '#AF52DE', '#8E8E93'];

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
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } }
      });
      if (error) setError(error.message);
      else alert(lang === 'id' ? 'Cek email Anda untuk verifikasi!' : 'Check email for verification!');
    }
    setLoading(false);
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
            {loading ? '...' : isLogin ? (lang === 'id' ? 'Masuk' : 'Sign In') : (lang === 'id' ? 'Gabung' : 'Join')}
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
const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('zenith_lang') as Language) || 'id');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
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

  // --- EDITING STATE ---
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const t = translations[lang];

  // --- Filter Logic ---
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const itemDate = new Date(e.date);
      if (financeFilter === 'daily') {
        return itemDate.toDateString() === now.toDateString();
      } else if (financeFilter === 'weekly') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= oneWeekAgo;
      } else {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }
    });
  }, [expenses, financeFilter]);

  const totalSpentFiltered = useMemo(() => 
    filteredExpenses.reduce((a, b) => a + b.amount, 0), 
  [filteredExpenses]);

  // --- CHART DATA PREPARATION ---
  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    // Convert to array for Recharts & sort by value desc
    return Object.keys(categoryTotals)
      .map(cat => ({ name: t.categories[cat as keyof typeof t.categories] || cat, value: categoryTotals[cat], key: cat }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, t]);

  // --- Auth & Data Lifecycle ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    const handleBeforePrompt = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    return () => { subscription.unsubscribe(); window.removeEventListener('beforeinstallprompt', handleBeforePrompt); };
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser]);
  useEffect(() => { localStorage.setItem('zenith_lang', lang); }, [lang]);

  const fetchData = async () => {
    if (!currentUser) return;
    
    // Updated Sorting Logic
    const [exp, hab, not] = await Promise.all([
      // Expenses: Sort by date (transaction date)
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      // Habits: Sort by created_at (Newest first)
      supabase.from('habits').select('*').order('created_at', { ascending: false }), 
      // Notes: Sort by updated_at (Last modified first)
      supabase.from('notes').select('*').order('updated_at', { ascending: false })
    ]);
    
    if (exp.data) setExpenses(exp.data);
    if (hab.data) setHabits(hab.data);
    if (not.data) setNotes(not.data);
  };

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

  // --- HELPER FORMAT DATE ---
  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatShortDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric', month: 'short'
    });
  };

  // --- HELPER FOR HABITS ---
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const isHabitDoneOnDate = (habit: Habit, date: Date) => {
    return habit.completed_dates?.includes(date.toLocaleDateString());
  };

  // --- EXPENSE CRUD ---
  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount) {
      if (editingExpenseId) {
        const { data, error } = await supabase.from('expenses').update({
            description: newExpense.description, 
            amount: parseFloat(newExpense.amount),
            category: newExpense.category,
            updated_at: new Date().toISOString() 
        }).eq('id', editingExpenseId).select();
        
        if (!error && data) {
            setExpenses(expenses.map(e => e.id === editingExpenseId ? data[0] : e));
            cancelEditExpense(); 
        }
      } else {
        const { data, error } = await supabase.from('expenses').insert([{
          description: newExpense.description, amount: parseFloat(newExpense.amount),
          category: newExpense.category, user_id: currentUser.id, date: new Date().toISOString()
        }]).select();
        if (!error && data) { 
            setExpenses([data[0], ...expenses]); 
            setNewExpense({ description: '', amount: '', category: 'Others' }); 
        }
      }
    }
  };

  const startEditingExpense = (e: Expense) => {
    setEditingExpenseId(e.id);
    setNewExpense({
        description: e.description,
        amount: e.amount.toString(),
        category: e.category
    });
  };

  const cancelEditExpense = () => {
    setEditingExpenseId(null);
    setNewExpense({ description: '', amount: '', category: 'Others' });
  };

  const deleteExpense = async (id: string) => { 
      if (!(await supabase.from('expenses').delete().eq('id', id)).error) {
        setExpenses(expenses.filter(x => x.id !== id));
        if (editingExpenseId === id) cancelEditExpense();
      }
  };

  // --- HABIT CRUD & GAMIFICATION ---
  const handleAddHabit = async () => {
    if(newHabit.name) {
      if (editingHabitId) {
        const { data, error } = await supabase.from('habits').update({
            name: newHabit.name,
            reminder_time: newHabit.time,
            updated_at: new Date().toISOString()
        }).eq('id', editingHabitId).select();

        if (!error && data) {
            setHabits(habits.map(h => h.id === editingHabitId ? data[0] : h));
            cancelEditHabit();
        }
      } else {
        const { data, error } = await supabase.from('habits').insert([{ name: newHabit.name, streak: 0, completed_dates: [], reminder_time: newHabit.time, user_id: currentUser.id }]).select();
        if (!error && data) { setHabits([data[0], ...habits]); setNewHabit({name:'', time:''}); }
      }
    }
  };

  const startEditingHabit = (h: Habit) => {
    setEditingHabitId(h.id);
    setNewHabit({
        name: h.name,
        time: h.reminder_time || ''
    });
  };

  const cancelEditHabit = () => {
    setEditingHabitId(null);
    setNewHabit({ name: '', time: '' });
  };

  const toggleHabit = async (h: Habit) => {
    const today = new Date().toLocaleDateString();
    const alreadyDone = h.completed_dates?.includes(today);
    const updatedDates = alreadyDone ? h.completed_dates.filter(d => d !== today) : [...(h.completed_dates || []), today];
    
    // --- GAMIFICATION: Trigger Confetti if Marking as Done ---
    if (!alreadyDone) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 }, // Start from bottom-ish
        colors: ['#007AFF', '#34C759', '#FF9500', '#FF2D55']
      });
    }

    const { data, error } = await supabase.from('habits').update({ 
      completed_dates: updatedDates, 
      streak: alreadyDone ? Math.max(0, h.streak - 1) : h.streak + 1,
      updated_at: new Date().toISOString()
    }).eq('id', h.id).select();

    if (!error && data) setHabits(habits.map(item => item.id === h.id ? data[0] : item));
  };
  
  const deleteHabit = async (id: string) => { 
      if (!(await supabase.from('habits').delete().eq('id', id)).error) {
          setHabits(habits.filter(x => x.id !== id));
          if (editingHabitId === id) cancelEditHabit();
      }
  };

  // --- Note CRUD (Manual) ---
  const handleSaveNoteManual = async () => {
    if (!activeNote || !currentUser) return;
    setIsSaving(true);
    const noteData = { 
        title: activeNote.title || t.untitled, 
        content: activeNote.content || '', 
        user_id: currentUser.id, 
        updated_at: new Date().toISOString() 
    };
    
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

  // UI Helpers
  const totalSpentGlobal = useMemo(() => expenses.reduce((a, b) => a + b.amount, 0), [expenses]);
  const formatCurrency = (val: number) => new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val).replace('IDR', 'Rp');
  const getCategoryIcon = (cat: string) => {
    const icons: any = { Food: <Coffee size={16}/>, Transport: <Car size={16}/>, Shopping: <ShoppingBag size={16}/>, Bills: <CreditCard size={16}/>, Health: <Heart size={16}/>, Entertainment: <Gamepad2 size={16}/> };
    return icons[cat] || <MoreHorizontal size={16}/>;
  };

  if (authLoading) return <div className="h-screen w-screen flex items-center justify-center font-bold">Zenith...</div>;
  if (!currentUser) return <AuthScreen lang={lang} />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-[#F2F2F7] fixed h-full flex-col p-8 z-50">
        <div className="flex items-center space-x-3.5 mb-12 px-2">
          <div className="w-9 h-9 bg-[#1D1D1F] rounded-xl flex items-center justify-center text-white shadow-sm"><FileText size={20} /></div>
          <h1 className="text-xl font-bold tracking-tight">Zenith</h1>
        </div>
        <nav className="space-y-1.5 flex-1">
          <button onClick={() => { setActiveTab('dashboard'); setActiveNote(null); }} className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-xl w-full transition-all ${activeTab === 'dashboard' ? 'bg-[#F2F2F7] text-[#007AFF]' : 'text-[#86868B]'}`}><LayoutDashboard size={18}/> <span className="font-semibold">{t.overview}</span></button>
          <button onClick={() => { setActiveTab('finance'); setActiveNote(null); }} className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-xl w-full transition-all ${activeTab === 'finance' ? 'bg-[#F2F2F7] text-[#007AFF]' : 'text-[#86868B]'}`}><Wallet size={18}/> <span className="font-semibold">{t.wallet}</span></button>
          <button onClick={() => { setActiveTab('habits'); setActiveNote(null); }} className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-xl w-full transition-all ${activeTab === 'habits' ? 'bg-[#F2F2F7] text-[#007AFF]' : 'text-[#86868B]'}`}><CheckCircle2 size={18}/> <span className="font-semibold">{t.habits}</span></button>
          <button onClick={() => { setActiveTab('notes'); setActiveNote(null); }} className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-xl w-full transition-all ${activeTab === 'notes' ? 'bg-[#F2F2F7] text-[#007AFF]' : 'text-[#86868B]'}`}><Pencil size={18}/> <span className="font-semibold">{t.journal}</span></button>
        </nav>
        <div className="pt-6 border-t border-[#F2F2F7]">
           <button onClick={() => setActiveTab('settings')} className="flex items-center space-x-3 w-full px-2 mb-8 text-left">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] font-bold text-sm">{currentUser.user_metadata?.full_name?.[0] || 'U'}</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[14px] font-bold truncate">{currentUser.user_metadata?.full_name || 'User'}</p>
                <p className="text-[11px] font-semibold text-[#86868B] uppercase">{t.account}</p>
              </div>
           </button>
           <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-2 py-3 text-red-500 font-bold hover:opacity-70 transition-opacity"><LogOut size={16}/><span>{t.signOut}</span></button>
        </div>
      </aside>

      <main className="flex-1 md:ml-[260px] pb-24 md:pb-12 pt-safe px-6 md:px-16 w-full max-w-[1280px]">
        <header className={`py-10 md:py-20 flex justify-between items-center ${isMobileNoteEditing ? 'hidden md:flex' : 'flex'}`}>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] tracking-tight">
              {activeTab === 'dashboard' && `${t.hello}, ${currentUser.user_metadata?.full_name?.split(' ')[0] || 'User'}`}
              {activeTab === 'finance' && t.wallet} {activeTab === 'habits' && t.habits}
              {activeTab === 'notes' && t.journal} {activeTab === 'settings' && t.preferences}
            </h2>
            <p className="text-[#86868B] text-[15px] font-semibold mt-1">{new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-12 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="apple-card p-8"><div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#007AFF] mb-6"><Wallet size={20}/></div><p className="text-[11px] font-bold text-[#86868B] uppercase mb-1.5">{t.totalSpend}</p><h3 className="text-2xl font-bold truncate">{formatCurrency(totalSpentGlobal)}</h3></div>
              <div className="apple-card p-8"><div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#FF9500] mb-6"><Flame size={20}/></div><p className="text-[11px] font-bold text-[#86868B] uppercase mb-1.5">{t.bestStreak}</p><h3 className="text-3xl font-bold">{habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0} <span className="text-base text-[#86868B]">Days</span></h3></div>
              <div className="apple-card p-8"><div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#5856D6] mb-6"><Pencil size={20}/></div><p className="text-[11px] font-bold text-[#86868B] uppercase mb-1.5">{t.records}</p><h3 className="text-3xl font-bold">{notes.length}</h3></div>
            </div>
            {/* Aktivitas Terbaru (Global) */}
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
            {/* Segmented Control */}
            <div className="flex bg-[#F2F2F7] p-1 rounded-xl w-full max-w-sm mx-auto shadow-inner">
              {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFinanceFilter(f)}
                  className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                    financeFilter === f ? 'bg-white text-[#007AFF] shadow-sm' : 'text-[#86868B]'
                  }`}
                >
                  {f === 'daily' ? (lang === 'id' ? 'Hari' : 'Daily') : f === 'weekly' ? (lang === 'id' ? 'Minggu' : 'Weekly') : (lang === 'id' ? 'Bulan' : 'Monthly')}
                </button>
              ))}
            </div>

            {/* Filter Summary */}
            <div className="apple-card p-8 bg-[#007AFF] text-white border-none relative overflow-hidden">
               <TrendingDown className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-10 rotate-[-15deg]" />
               <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1">
                Total {
                  financeFilter === 'daily' ? t.today : 
                  financeFilter === 'weekly' ? t.lastSevenDays : 
                  t.thisMonth
                }
              </p>
               <h3 className="text-4xl font-extrabold">{formatCurrency(totalSpentFiltered)}</h3>
            </div>

            {/* --- NEW: SPENDING VISUALIZATION (CHART) --- */}
            {chartData.length > 0 && (
                <div className="apple-card p-6 flex flex-col md:flex-row items-center justify-between min-h-[250px] relative overflow-visible">
                    <div className="absolute top-6 left-6 text-[11px] font-bold text-[#86868B] uppercase tracking-widest">{t.spendingBreakdown}</div>
                    
                    {/* Chart Area */}
                    <div className="w-full md:w-1/2 h-[220px] relative mt-4 md:mt-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-4">
                         <span className="text-[10px] text-[#86868B] uppercase font-bold">{t.topCategory}</span>
                         <span className="font-bold text-[#1D1D1F] mt-0.5">{chartData[0]?.name}</span>
                    </div>
                    </div>

                    {/* Legend Area */}
                    <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-8 space-y-3">
                    {chartData.slice(0, 4).map((entry, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="font-semibold text-[#1D1D1F]">{entry.name}</span>
                            </div>
                            <span className="text-[#86868B] font-medium text-xs bg-[#F5F5F7] px-2 py-1 rounded-md">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                    {chartData.length > 4 && (
                        <p className="text-xs text-center text-[#86868B] pt-2 font-medium bg-[#F5F5F7] py-2 rounded-lg cursor-pointer hover:bg-[#E5E5EA] transition-colors">+ {chartData.length - 4} {lang === 'id' ? 'kategori lainnya' : 'categories more'}</p>
                    )}
                    </div>
                </div>
            )}

            {/* Input / Edit Form */}
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

        {/* Habits Tab (IMPROVED UI & GAMIFIED) */}
        {activeTab === 'habits' && (
        <div className="space-y-8 fade-in pb-20">
            
            {/* 1. Input Section */}
            <div className={`p-6 md:p-8 rounded-3xl transition-all duration-300 shadow-sm border border-[#F2F2F7] ${editingHabitId ? 'bg-[#FFF8E6] ring-2 ring-[#FFD60A]' : 'bg-white'}`}>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#86868B]">
                        <CheckCircle2 size={20} />
                    </div>
                    <input 
                        className="w-full bg-[#F5F5F7] text-[#1D1D1F] font-semibold text-[16px] placeholder-[#86868B] rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#007AFF] transition-all" 
                        placeholder={t.habitsTitle} 
                        value={newHabit.name} 
                        onChange={e => setNewHabit({...newHabit, name: e.target.value})}
                    />
                </div>
                
                <div className="flex w-full md:w-auto gap-3">
                    <input 
                        type="time" 
                        className="bg-[#F5F5F7] text-[#1D1D1F] font-bold rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-[#007AFF] transition-all w-full md:w-auto" 
                        value={newHabit.time} 
                        onChange={e => setNewHabit({...newHabit, time: e.target.value})}
                    />
                    {editingHabitId ? (
                        <>
                            <button onClick={handleAddHabit} className="bg-[#34C759] hover:bg-[#2DA84E] text-white font-bold rounded-2xl px-6 py-4 transition-all shadow-md active:scale-95"><Check size={20}/></button>
                            <button onClick={cancelEditHabit} className="bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#86868B] font-bold rounded-2xl px-6 py-4 transition-all active:scale-95"><X size={20}/></button>
                        </>
                    ) : (
                        <button onClick={handleAddHabit} className="bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold rounded-2xl px-8 py-4 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap w-full md:w-auto">
                            <Plus size={20} strokeWidth={3} />
                            <span className="hidden md:inline">{t.add}</span>
                        </button>
                    )}
                </div>
            </div>
            </div>

            {/* 2. Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(h => {
                const todayStr = new Date().toLocaleDateString();
                const doneToday = h.completed_dates?.includes(todayStr);
                const weekDays = getLast7Days();

                return (
                <div key={h.id} className={`group relative bg-white p-6 rounded-[24px] border border-[#F2F2F7] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${editingHabitId === h.id ? 'ring-2 ring-[#007AFF]' : ''}`}>
                    
                    {/* Header: Title & Edit Actions */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 pr-4">
                            <h4 className={`text-[18px] font-bold tracking-tight mb-1 ${doneToday ? 'text-[#86868B] line-through decoration-2' : 'text-[#1D1D1F]'}`}>
                                {h.name}
                            </h4>
                            <div className="flex items-center space-x-3">
                                {h.reminder_time && (
                                    <span className="flex items-center text-[12px] font-semibold text-[#86868B] bg-[#F5F5F7] px-2 py-1 rounded-lg">
                                        <Clock size={12} className="mr-1"/> {h.reminder_time}
                                    </span>
                                )}
                                <span className="flex items-center text-[12px] font-bold text-[#FF9500]">
                                    <Flame size={12} className="mr-1 fill-current"/> {h.streak}
                                </span>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-1">
                            <button onClick={() => startEditingHabit(h)} className="p-2 rounded-full text-[#86868B] hover:bg-[#F2F2F7] hover:text-[#007AFF] transition-colors">
                                <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteHabit(h.id)} className="p-2 rounded-full text-[#86868B] hover:bg-[#FFF0F0] hover:text-[#FF3B30] transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Middle: Progress Visualization (Last 7 Days) */}
                    <div className="flex justify-between items-center mb-6 px-1">
                        {weekDays.map((date, idx) => {
                            const isDone = isHabitDoneOnDate(h, date);
                            const isToday = date.toDateString() === new Date().toDateString();
                            const dayName = date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'narrow' });
                            
                            return (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-[#007AFF]' : 'text-[#C7C7CC]'}`}>
                                        {dayName}
                                    </span>
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isDone ? 'bg-[#34C759] scale-110' : 'bg-[#E5E5EA]'}`}></div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer: Main Toggle Button */}
                    <button 
                        onClick={() => toggleHabit(h)} 
                        className={`w-full py-3.5 rounded-2xl flex items-center justify-center font-bold text-[15px] transition-all active:scale-[0.98] ${
                            doneToday 
                            ? 'bg-[#F2F2F7] text-[#86868B] hover:bg-[#E5E5EA]' 
                            : 'bg-[#1D1D1F] text-white hover:bg-[#000] shadow-lg shadow-gray-200'
                        }`}
                    >
                        {doneToday ? (
                            <><Check size={18} className="mr-2" strokeWidth={3}/> {lang === 'id' ? 'Selesai' : 'Completed'}</>
                        ) : (
                            <><CheckCircle2 size={18} className="mr-2"/> {lang === 'id' ? 'Tandai Selesai' : 'Mark Done'}</>
                        )}
                    </button>

                </div>
                )
            })}
            
            {habits.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50 dashed border-2 border-[#E5E5EA] rounded-3xl">
                    <Flame size={48} className="text-[#E5E5EA] mb-4" />
                    <p className="font-semibold text-[#86868B]">{lang === 'id' ? 'Belum ada kebiasaan. Mulai sekarang!' : 'No habits yet. Start tracking today!'}</p>
                </div>
            )}
            </div>
        </div>
        )}

        {/* Journal Tab */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-12 gap-0 md:gap-8 h-[calc(100vh-280px)] fade-in overflow-hidden">
            {/* Sidebar List */}
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

            {/* Editor Area */}
            <div className={`col-span-12 md:col-span-8 flex-col h-full apple-card p-0 border-none bg-white relative overflow-hidden shadow-sm ${isMobileNoteEditing ? 'flex' : 'hidden md:flex'}`}>
               {/* Editor Toolbar */}
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
               
               {/* Editor Content */}
               <div className="flex-1 overflow-y-auto p-6 md:p-10">
                 {activeNote && (
                    <div className="max-w-3xl mx-auto">
                        {/* Metadata Header */}
                        {activeNote.id && (
                           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-8 text-[11px] text-[#86868B] font-semibold uppercase tracking-widest">
                              <span className="flex items-center"><Calendar size={12} className="mr-1.5"/> {t.created}: {formatDateTime(activeNote.created_at)}</span>
                              {activeNote.updated_at && activeNote.updated_at !== activeNote.created_at && (
                                <span className="flex items-center"><Pencil size={12} className="mr-1.5"/> {t.edited}: {formatDateTime(activeNote.updated_at)}</span>
                              )}
                           </div>
                        )}

                        <input 
                            className="text-3xl md:text-5xl font-extrabold bg-transparent outline-none mb-6 w-full text-[#1D1D1F] placeholder-gray-300" 
                            placeholder={t.untitled} 
                            value={activeNote?.title || ''} 
                            onChange={e => setActiveNote(prev => prev ? {...prev, title: e.target.value} : {title: e.target.value, content: '', user_id: currentUser.id} as any)} 
                        />
                        <textarea 
                            className="w-full bg-transparent outline-none resize-none text-[17px] md:text-[19px] leading-relaxed text-[#424245] placeholder-gray-300 min-h-[400px]" 
                            placeholder={t.placeholderJournal} 
                            value={activeNote?.content || ''} 
                            onChange={e => setActiveNote(prev => prev ? {...prev, content: e.target.value} : {title: '', content: e.target.value, user_id: currentUser.id} as any)} 
                        />
                    </div>
                 )}
                 {!activeNote && (
                    <div className="h-full flex flex-col items-center justify-center text-[#D1D1D6]">
                        <Pencil size={48} className="mb-4 opacity-20"/>
                        <p className="text-[#86868B] font-medium">{t.beginThoughts}</p>
                    </div>
                 )}
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
                    <div className="flex items-center space-x-5"><div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center"><Plus size={18} className="text-[#007AFF]"/></div><div><span className="font-bold text-[16px] block">{lang === 'id' ? 'Instal Aplikasi' : 'Install App'}</span><span className="text-[12px] text-[#86868B]">Add to Home Screen</span></div></div>
                    <ChevronRight size={18} className="text-[#D1D1D6]"/>
                  </div>
                )}
             </div>
             <div className="text-center pt-8"><button onClick={handleLogout} className="px-10 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all text-sm uppercase tracking-widest">{t.signOut}</button></div>
          </div>
        )}
      </main>

      {/* Tab Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-[88px] glass-nav flex justify-around items-start pt-3 px-4 z-50 transition-all duration-300 ${isMobileNoteEditing ? 'translate-y-full opacity-0' : ''}`}>
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

export default App;
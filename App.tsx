import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { 
  LayoutGrid, Wallet, CheckCircle2, Plus, Trash2, ChevronRight, Pencil, Flame,
  Clock, FileText, User as UserIcon, LogOut, Coffee, Car, ShoppingBag,
  CreditCard, MoreHorizontal, Heart, Gamepad2, Inbox, Calendar, Languages, Save, TrendingDown,
  X, Check, CalendarDays, ArrowLeft, Target, BarChart3, PiggyBank, TrendingUp, Trophy, Download, Smartphone,
  PieChart as PieIcon, Coins, Sun, Moon, ArrowUpRight, Zap, Grip, Receipt
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import confetti from 'canvas-confetti';
import { Expense, Habit, Note, AppTab, Language, Budget, Saving, Theme } from './types';

// --- CSS Variables Injection (Modern Theme) ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --bg-body: #ffffff;
      --bg-sidebar: #F9FAFB;
      --bg-card: #ffffff;
      --bg-input: #F3F4F6;
      --text-main: #111827;
      --text-muted: #6B7280;
      --border: #E5E7EB;
      --success: #10B981;
      --danger: #EF4444;
      --warning: #F59E0B;
      --primary: #2563EB; /* Blue-600 */
    }
    .dark {
      --bg-body: #09090b;
      --bg-sidebar: #18181b;
      --bg-card: #18181b;
      --bg-input: #27272a;
      --text-main: #FAFAFA;
      --text-muted: #A1A1AA;
      --border: #27272a;
      --success: #34D399;
      --danger: #F87171;
      --warning: #FBBF24;
      --primary: #3B82F6; /* Blue-500 */
    }
    body { background-color: var(--bg-body); color: var(--text-main); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .apple-card { background-color: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; transition: all 0.3s ease; }
    .apple-input { width: 100%; background-color: var(--bg-input); color: var(--text-main); border-radius: 12px; padding: 12px 16px; font-size: 14px; font-weight: 500; outline: none; transition: all 0.2s; }
    .apple-input:focus { ring: 2px solid var(--primary); }
    .apple-button { background-color: var(--text-main); color: var(--bg-body); border-radius: 12px; font-weight: 600; transition: opacity 0.2s; }
    .apple-button:hover { opacity: 0.9; }
    .glass-nav { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-top: 1px solid var(--border); }
    .dark .glass-nav { background: rgba(9, 9, 11, 0.9); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--border); border-radius: 20px; }
    .fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

// --- Translations ---
const translations = {
  en: {
    overview: "Dashboard", wallet: "Wallet", habits: "Habits", journal: "Journal",
    lastSevenDays: "Weekly", thisMonth: "Monthly", today: "Today",
    account: "Account", preferences: "Preferences", hello: "Good Morning", helloAfternoon: "Good Afternoon", helloEvening: "Good Evening",
    totalSpend: "Total Spent", bestStreak: "Streak", totalSavings: "Savings",
    records: "Entries", recentActivity: "Recent Activity", logTransaction: "Log Transaction",
    desc: "Description", amount: "Amount", category: "Category", add: "Add Item",
    habitsTitle: "New Habit", untitled: "Untitled", newEntry: "New Entry",
    beginThoughts: "Start typing...", saved: "Saved",
    delete: "Delete", signOut: "Sign Out", language: "Language",
    placeholderJournal: "What's on your mind today?",
    back: "Back", confirmDelete: "Delete this item permanently?", currency: "Rp",
    spendingBreakdown: "Breakdown", topCategory: "Top Category",
    budgeting: "Budget", analytics: "Analytics",
    setBudget: "Set Budget", weeklyTrend: "Activity",
    savingsGoals: "Goals", newGoal: "New Goal", goalName: "Goal Name",
    targetAmount: "Target Amount", save: "Save Changes", cancel: "Cancel",
    installApp: "Install App", installDesc: "Add to Home Screen for the best experience",
    installed: "App Installed",
    theme: "Appearance", created: "Created", edited: "Edited",
    subTabs: { expenses: "Expenses", savings: "Savings", budget: "Budget" },
    categories: {
      Food: "Food", Transport: "Transport", Shopping: "Shopping",
      Bills: "Bills", Health: "Health", Entertainment: "Entertainment", Others: "Others"
    }
  },
  id: {
    overview: "Dashboard", wallet: "Dompet", habits: "Kebiasaan", journal: "Jurnal",
    account: "Akun", preferences: "Pengaturan", hello: "Selamat Pagi", helloAfternoon: "Selamat Siang", helloEvening: "Selamat Malam",
    lastSevenDays: "Mingguan", thisMonth: "Bulanan", today: "Hari Ini",
    totalSpend: "Pengeluaran", bestStreak: "Streak", totalSavings: "Tabungan",
    records: "Catatan", recentActivity: "Aktivitas Terbaru", logTransaction: "Catat Transaksi",
    desc: "Deskripsi", amount: "Jumlah", category: "Kategori", add: "Tambah",
    habitsTitle: "Kebiasaan Baru", untitled: "Tanpa Judul", newEntry: "Entri Baru",
    beginThoughts: "Mulai menulis...", saved: "Tersimpan",
    delete: "Hapus", signOut: "Keluar", language: "Bahasa",
    placeholderJournal: "Apa yang ada di pikiranmu?",
    back: "Kembali", confirmDelete: "Hapus item ini permanen?", currency: "Rp",
    spendingBreakdown: "Analisis", topCategory: "Kategori Terbesar",
    budgeting: "Anggaran", analytics: "Analitik",
    setBudget: "Atur Anggaran", weeklyTrend: "Aktivitas",
    savingsGoals: "Target", newGoal: "Target Baru", goalName: "Nama Target",
    targetAmount: "Target (Rp)", save: "Simpan", cancel: "Batal",
    installApp: "Install Aplikasi", installDesc: "Tambahkan ke Layar Utama untuk akses cepat",
    installed: "Aplikasi Terinstall",
    theme: "Tampilan", created: "Dibuat", edited: "Diedit",
    subTabs: { expenses: "Pengeluaran", savings: "Tabungan", budget: "Anggaran" },
    categories: {
      Food: "Makanan", Transport: "Transportasi", Shopping: "Belanja",
      Bills: "Tagihan", Health: "Kesehatan", Entertainment: "Hiburan", Others: "Lainnya"
    }
  }
};

// --- COLOR PALETTE (VIBRANT & DISTINCT) ---
const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

// --- Auth Screen ---
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)] px-6">
      <GlobalStyles />
      <div className="w-full max-w-[360px] animate-in fade-in">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20">
             <Zap size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">Zenith</h1>
          <p className="text-[var(--text-muted)] text-sm mt-2">{lang === 'id' ? 'Simpel. Elegan. Terorganisir.' : 'Simple. Elegant. Organized.'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <input className="apple-input w-full" placeholder={lang === 'id' ? 'Nama Lengkap' : 'Full Name'} value={name} onChange={e => setName(e.target.value)} required />}
            <input className="apple-input w-full" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="apple-input w-full" type="password" placeholder={lang === 'id' ? 'Kata Sandi' : 'Password'} value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-[var(--danger)] text-xs text-center font-medium">{error}</p>}
            <button type="submit" disabled={loading} className="apple-button w-full py-3.5 text-sm mt-2 bg-[var(--primary)]">
              {loading ? '...' : isLogin ? (lang === 'id' ? 'Masuk' : 'Sign In') : (lang === 'id' ? 'Buat Akun' : 'Create Account')}
            </button>
        </form>
        
        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[var(--text-muted)] text-xs hover:text-[var(--primary)] transition-colors">
            {isLogin ? (lang === 'id' ? "Belum punya akun? Daftar" : "New here? Create account") : (lang === 'id' ? "Sudah punya akun? Masuk" : "Have an account? Sign in")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---
const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('zenith_lang') as Language) || 'id');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('zenith_theme') as Theme) || 'light');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [financeSubTab, setFinanceSubTab] = useState<'expenses' | 'savings' | 'budget'>('expenses');
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);

  const [financeFilter, setFinanceFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  // FIX: Initialize with Local Date String to match user's day correctly (avoids UTC issue)
  const [selectedDate, setSelectedDate] = useState(() => {
     // Returns YYYY-MM-DD in local time
     const offset = new Date().getTimezoneOffset() * 60000;
     return new Date(Date.now() - offset).toISOString().split('T')[0];
  });

  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Others' });
  const [newHabit, setNewHabit] = useState({ name: '', time: '' });
  const [newSaving, setNewSaving] = useState({ name: '', target: '' });
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isMobileNoteEditing, setIsMobileNoteEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isEditingSavings, setIsEditingSavings] = useState(false);

  const t = translations[lang];

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('zenith_lang', lang);
    localStorage.setItem('zenith_theme', theme);
    document.documentElement.className = theme;
  }, [lang, theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); });
    if (window.matchMedia('(display-mode: standalone)').matches) setIsAppInstalled(true);
  }, []);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    const [exp, hab, not, bud, sav] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('habits').select('*').order('created_at', { ascending: false }), 
      supabase.from('notes').select('*').order('updated_at', { ascending: false }),
      supabase.from('budgets').select('*'),
      supabase.from('savings').select('*').order('created_at', { ascending: true })
    ]);
    if (exp.data) setExpenses(exp.data);
    if (hab.data) setHabits(hab.data);
    if (not.data) setNotes(not.data);
    if (bud.data) setBudgets(bud.data);
    if (sav.data) setSavings(sav.data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setExpenses([]); setHabits([]); setNotes([]); setBudgets([]); setSavings([]); setActiveTab('dashboard');
  };

  // --- Helpers ---
  const formatCurrency = (val: number) => {
  // Pastikan val adalah number, jika NaN/null ganti jadi 0
  const safeVal = val || 0; 
  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
  }).format(safeVal).replace('IDR', 'Rp');
};
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.hello;
    if (hour < 18) return t.helloAfternoon;
    return t.helloEvening;
  }

  const navigateDate = (direction: 'next' | 'prev') => {
    const current = new Date(selectedDate);
    if (financeFilter === 'daily') current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
    else if (financeFilter === 'weekly') current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    else if (financeFilter === 'monthly') current.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
    // Use ISO string split to ensure YYYY-MM-DD format consistency
    const offset = current.getTimezoneOffset() * 60000;
    const localISODate = new Date(current.getTime() - offset).toISOString().split('T')[0];
    setSelectedDate(localISODate);
  };

  const getCategoryIcon = (cat: string) => {
    const icons: any = { Food: <Coffee size={18}/>, Transport: <Car size={18}/>, Shopping: <ShoppingBag size={18}/>, Bills: <CreditCard size={18}/>, Health: <Heart size={18}/>, Entertainment: <Gamepad2 size={18}/> };
    return icons[cat] || <MoreHorizontal size={18}/>;
  };

  const formatShortDate = (iso: string) => new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });

  // --- Logic Computations ---
  const filteredExpenses = useMemo(() => {
    const target = new Date(selectedDate);
    
    return expenses.filter(e => {
      const itemDate = new Date(e.date);
      
      // Compare based on local date string to avoid UTC mismatches
      if (financeFilter === 'daily') {
         return itemDate.toDateString() === target.toDateString();
      }
      
      if (financeFilter === 'weekly') { 
         const diffTime = Math.abs(target.getTime() - itemDate.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
         // Check if within same week range logic can be complex, simplifying to +/- 3 days from target or simple diff
         // Simple 7 day lookback from target date:
         const diff = (target.getTime() - itemDate.getTime()) / (86400000); 
         return diff >= 0 && diff < 7; 
      }
      
      return itemDate.getMonth() === target.getMonth() && itemDate.getFullYear() === target.getFullYear();
    });
  }, [expenses, financeFilter, selectedDate]);

  const totalSpentFiltered = useMemo(() => filteredExpenses.reduce((a, b) => a + b.amount, 0), [filteredExpenses]);
  const totalSpentGlobal = useMemo(() => expenses.reduce((a, b) => a + b.amount, 0), [expenses]);

  const chartData = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach(e => totals[e.category] = (totals[e.category] || 0) + e.amount);
    return Object.keys(totals).map(cat => ({ name: t.categories[cat as keyof typeof t.categories] || cat, value: totals[cat] })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, t]);

  const weeklyTrendData = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      // Using local date string matching
      const dateStr = d.toDateString();
      return {
        name: d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' }),
        amount: expenses.filter(e => new Date(e.date).toDateString() === dateStr).reduce((s, e) => s + e.amount, 0)
      };
    });
  }, [expenses, lang]);

  const budgetAnalysis = useMemo(() => {
    const target = new Date(selectedDate);
    return Object.keys(t.categories).map(cat => {
      const spent = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear() && e.category === cat; }).reduce((s, e) => s + e.amount, 0);
      const budget = budgets.find(b => b.category === cat)?.amount || 0;
      return { category: cat, spent, budget, percent: budget > 0 ? (spent / budget) * 100 : 0 };
    }).sort((a, b) => b.percent - a.percent);
  }, [expenses, budgets, t.categories, selectedDate]);

  // --- CRUD Handlers ---
  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount) {
      if (editingExpenseId) {
        const { data } = await supabase.from('expenses').update({ description: newExpense.description, amount: parseFloat(newExpense.amount), category: newExpense.category, updated_at: new Date().toISOString() }).eq('id', editingExpenseId).select();
        if (data) { setExpenses(expenses.map(e => e.id === editingExpenseId ? data[0] : e)); setEditingExpenseId(null); setNewExpense({ description: '', amount: '', category: 'Others' }); }
      } else {
        const { data } = await supabase.from('expenses').insert([{ description: newExpense.description, amount: parseFloat(newExpense.amount), category: newExpense.category, user_id: currentUser.id, date: new Date().toISOString() }]).select();
        if (data) { setExpenses([data[0], ...expenses]); setNewExpense({ description: '', amount: '', category: 'Others' }); }
      }
    }
  };

  const deleteExpense = async (id: string) => { if (!(await supabase.from('expenses').delete().eq('id', id)).error) setExpenses(expenses.filter(x => x.id !== id)); };

  const handleAddHabit = async () => {
    if(newHabit.name) {
      if (editingHabitId) {
        const { data } = await supabase.from('habits').update({ name: newHabit.name, reminder_time: newHabit.time }).eq('id', editingHabitId).select();
        if (data) { setHabits(habits.map(h => h.id === editingHabitId ? data[0] : h)); setEditingHabitId(null); setNewHabit({ name: '', time: '' }); }
      } else {
        const { data } = await supabase.from('habits').insert([{ name: newHabit.name, streak: 0, completed_dates: [], reminder_time: newHabit.time, user_id: currentUser.id }]).select();
        if (data) { setHabits([data[0], ...habits]); setNewHabit({name:'', time:''}); }
      }
    }
  };

  const toggleHabit = async (h: Habit) => {
    const today = new Date().toLocaleDateString();
    const alreadyDone = h.completed_dates?.includes(today);
    const updatedDates = alreadyDone ? h.completed_dates.filter(d => d !== today) : [...(h.completed_dates || []), today];
    if (!alreadyDone) confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 }, colors: ['#10B981', '#3B82F6'] });
    const { data } = await supabase.from('habits').update({ completed_dates: updatedDates, streak: alreadyDone ? Math.max(0, h.streak - 1) : h.streak + 1 }).eq('id', h.id).select();
    if (data) setHabits(habits.map(item => item.id === h.id ? data[0] : item));
  };

  const deleteHabit = async (id: string) => { if (!(await supabase.from('habits').delete().eq('id', id)).error) setHabits(habits.filter(x => x.id !== id)); };

  const saveNote = async () => {
    if (!activeNote || !currentUser) return;
    setIsSaving(true);
    const noteData = { title: activeNote.title || t.untitled, content: activeNote.content || '', user_id: currentUser.id, updated_at: new Date().toISOString() };
    const { data } = activeNote.id && activeNote.id.length > 15 
        ? await supabase.from('notes').update(noteData).eq('id', activeNote.id).select()
        : await supabase.from('notes').insert([noteData]).select();
    if (data) { 
        setNotes(activeNote.id && activeNote.id.length > 15 ? notes.map(n => n.id === activeNote.id ? data[0] : n) : [data[0], ...notes]); 
        setActiveNote(data[0]); 
    }
    setIsSaving(false);
  };

  const deleteNote = async (id: string) => { 
    if(window.confirm(t.confirmDelete) && !(await supabase.from('notes').delete().eq('id', id)).error) { 
        setNotes(notes.filter(n => n.id !== id)); 
        setActiveNote(null); 
        setIsMobileNoteEditing(false); 
    } 
  };

  const handleAddSaving = async () => {
    if (!newSaving.name || !newSaving.target) return;
    const { data } = await supabase.from('savings').insert([{ user_id: currentUser.id, name: newSaving.name, target: parseFloat(newSaving.target), current: 0 }]).select();
    if (data) { setSavings([...savings, data[0]]); setNewSaving({ name: '', target: '' }); setIsEditingSavings(false); }
  };

  const updateSavingAmount = async (id: string, addAmount: number) => {
    const save = savings.find(s => s.id === id);
    if (!save) return;
    const newCurrent = save.current + addAmount;
    if (newCurrent >= save.target && save.current < save.target) confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#10B981', '#3B82F6'] });
    const { data } = await supabase.from('savings').update({ current: newCurrent }).eq('id', id).select();
    if (data) setSavings(savings.map(s => s.id === id ? data[0] : s));
  };

  const deleteSaving = async (id: string) => { if (window.confirm(t.confirmDelete) && !(await supabase.from('savings').delete().eq('id', id)).error) setSavings(savings.filter(s => s.id !== id)); };

  const saveBudget = async (category: string, amount: number) => {
    if (!currentUser) return;
    const existing = budgets.find(b => b.category === category);
    if (existing) await supabase.from('budgets').update({ amount }).eq('id', existing.id);
    else await supabase.from('budgets').insert([{ user_id: currentUser.id, category, amount, month_year: selectedDate.slice(0, 7) }]);
    fetchData();
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => { if (choice.outcome === 'accepted') setIsAppInstalled(true); setDeferredPrompt(null); });
    }
  };

  if (authLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-body)] text-[var(--text-muted)]">Zenith...</div>;
  if (!currentUser) return <AuthScreen lang={lang} />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg-body)] text-[var(--text-main)] transition-colors duration-500">
      <GlobalStyles />
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-[260px] bg-[var(--bg-sidebar)] border-r border-[var(--border)] fixed h-full flex-col p-6 z-50">
        <div className="mb-10 px-2 mt-4">
          <h1 className="text-3xl font-extrabold tracking-tighter text-[var(--text-main)]">Zenith<span className="text-[var(--primary)]">.</span></h1>
        </div>
        <nav className="space-y-1.5 flex-1">
          {[
            { id: 'dashboard', label: t.overview, icon: <LayoutGrid size={18}/> },
            { id: 'finance', label: t.wallet, icon: <Wallet size={18}/> },
            { id: 'habits', label: t.habits, icon: <CheckCircle2 size={18}/> },
            { id: 'notes', label: t.journal, icon: <Pencil size={18}/> }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as AppTab); setActiveNote(null); }} className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-xl w-full transition-all duration-200 ${activeTab === item.id ? 'bg-[var(--bg-body)] text-[var(--primary)] font-semibold shadow-sm border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[rgba(0,0,0,0.03)]'}`}>
              <span className={activeTab === item.id ? 'text-[var(--primary)]' : ''}>{item.icon}</span>
              <span className="text-[14px]">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="pt-6 border-t border-[rgba(0,0,0,0.05)]">
            <button onClick={() => setActiveTab('settings')} className="flex items-center space-x-3 w-full px-3 py-2 mb-2 rounded-xl hover:bg-[rgba(0,0,0,0.03)] transition-colors group">
              <div className="w-8 h-8 rounded-full bg-[var(--text-main)] flex items-center justify-center text-[var(--bg-body)] font-bold text-xs">{currentUser.user_metadata?.full_name?.[0] || 'U'}</div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-[13px] font-semibold truncate text-[var(--text-main)]">{currentUser.user_metadata?.full_name || 'User'}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{t.account}</p>
              </div>
            </button>
            <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-4 py-2 text-[var(--text-muted)] hover:text-[var(--danger)] text-sm font-medium transition-colors"><LogOut size={16}/><span>{t.signOut}</span></button>
        </div>
      </aside>

      <main className="flex-1 md:ml-[260px] pb-24 md:pb-12 pt-safe px-4 md:px-12 w-full max-w-[1280px]">
        <header className={`py-6 md:py-10 flex justify-between items-center ${isMobileNoteEditing ? 'hidden md:flex' : 'flex'}`}>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">
              {activeTab === 'dashboard' ? `${getGreeting()}, ${currentUser.user_metadata?.full_name?.split(' ')[0]}` : t[activeTab as keyof typeof t]}
            </h2>
            <p className="text-[var(--text-muted)] text-[13px] font-medium mt-1">{new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-[var(--text-main)] hover:bg-[var(--bg-sidebar)] transition-colors">
            {theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
          </button>
        </header>

        {/* --- Dashboard --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: t.totalSpend, val: formatCurrency(totalSpentGlobal), icon: <Receipt size={18}/>, footer: <div className="flex items-center mt-2 text-[12px] font-medium text-[var(--success)]"><ArrowUpRight size={12} className="mr-1" /> <span>Updates live</span></div> },
                { label: t.totalSavings, val: formatCurrency(savings.reduce((acc, curr) => acc + curr.current, 0)), icon: <PiggyBank size={18}/>, footer: <div className="w-full bg-[var(--bg-input)] h-1.5 mt-3 rounded-full overflow-hidden"><div className="bg-[var(--success)] h-full w-[65%] rounded-full"></div></div> },
                { label: t.bestStreak, val: habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0, sub: 'days', icon: <Zap size={18}/>, footer: <div className="flex gap-1 mt-3">{[1,2,3,4,5].map(i => (<div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 3 ? 'bg-[var(--warning)]' : 'bg-[var(--bg-input)]'}`}></div>))}</div> }
              ].map((card, i) => (
                <div key={i} className="apple-card p-6 flex flex-col justify-between h-[150px] hover:border-[var(--text-muted)]/20">
                   <div className="flex justify-between items-start">
                      <span className="text-[13px] font-medium text-[var(--text-muted)]">{card.label}</span>
                      <div className="text-[var(--text-muted)]">{card.icon}</div>
                   </div>
                   <div>
                      <div className="flex items-baseline space-x-1">
                        <h3 className="text-3xl font-semibold tracking-tight text-[var(--text-main)] mt-1">{card.val}</h3>
                        {card.sub && <span className="text-sm text-[var(--text-muted)]">{card.sub}</span>}
                      </div>
                      {card.footer}
                   </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="apple-card p-6">
                <div className="flex justify-between items-center mb-6"><h4 className="font-semibold text-sm text-[var(--text-main)]">{t.weeklyTrend}</h4></div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyTrendData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 500}} dy={10} />
                      <RechartsTooltip cursor={{fill: 'var(--bg-input)', radius: 4}} contentStyle={{borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', padding: '8px 12px', fontSize: '12px'}} labelStyle={{display:'none'}} formatter={(value: number) => [formatCurrency(value), '']} />
                      {/* Added color to bars */}
                      <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 4, 4]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="apple-card p-6">
                <div className="flex justify-between items-center mb-6"><h4 className="font-semibold text-sm text-[var(--text-main)]">{t.budgeting}</h4></div>
                <div className="space-y-5">
                  {budgetAnalysis.slice(0, 4).map(item => (
                    <div key={item.category}>
                      <div className="flex justify-between text-[12px] font-medium mb-2">
                        <span className="text-[var(--text-main)]">{t.categories[item.category as keyof typeof t.categories]}</span>
                        <span className="text-[var(--text-muted)]">{Math.round(item.percent)}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ease-out rounded-full ${item.percent > 100 ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'}`} style={{ width: `${Math.min(item.percent, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                  {budgetAnalysis.length === 0 && <div className="h-[160px] flex items-center justify-center text-[var(--text-muted)] text-sm">{t.setBudget}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Finance Tab --- */}
        {activeTab === 'finance' && (
          <div className="space-y-6 fade-in">
            
            {/* 1. Header Deskripsi */}
            <div className="mb-2 px-1">
              <h3 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                {financeSubTab === 'expenses' ? (lang === 'id' ? 'Arus Kas' : 'Cash Flow') : 
                 financeSubTab === 'savings' ? (lang === 'id' ? 'Tabungan' : 'Savings') : 
                 (lang === 'id' ? 'Perencanaan' : 'Budgeting')}
              </h3>
              <p className="text-[var(--text-muted)] text-sm font-medium mt-1">
                {financeSubTab === 'expenses' 
                    ? (lang === 'id' ? 'Pantau pemasukan dan pengeluaran harianmu.' : 'Track your daily income and expenses.')
                    : (financeSubTab === 'savings' 
                        ? (lang === 'id' ? 'Wujudkan impianmu sedikit demi sedikit.' : 'Achieve your dreams step by step.')
                        : (lang === 'id' ? 'Atur batasan agar keuangan tetap sehat.' : 'Set limits to keep your finances healthy.')
                      )
                }
              </p>
            </div>

            {/* 2. Tombol Navigasi Sub-Tab (SUDAH DIKEMBALIKAN) */}
            <div className="flex bg-[var(--bg-input)] p-1 rounded-xl w-full max-w-sm mx-auto mb-8">
              {(['expenses', 'savings', 'budget'] as const).map((tab) => (
                <button key={tab} onClick={() => setFinanceSubTab(tab)} className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-2 ${financeSubTab === tab ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                   {t.subTabs[tab]}
                </button>
              ))}
            </div>

            {/* 3. Konten Expenses */}
            {financeSubTab === 'expenses' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex bg-[var(--bg-input)] p-1 rounded-lg w-full sm:w-auto">
                      {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                      <button key={f} onClick={() => { setFinanceFilter(f); setSelectedDate(new Date().toISOString().split('T')[0]); }} className={`flex-1 sm:flex-none px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all ${financeFilter === f ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
                          {f === 'daily' ? t.today : (f === 'weekly' ? t.lastSevenDays : t.thisMonth)}
                      </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-2">
                      <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-[var(--bg-input)] rounded-full text-[var(--text-muted)]"><ArrowLeft size={16} /></button>
                      <span className="text-sm font-semibold text-[var(--text-main)] text-center min-w-[120px]">{financeFilter === 'monthly' ? new Date(selectedDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' }) : new Date(selectedDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                      <button onClick={() => navigateDate('next')} className="p-2 hover:bg-[var(--bg-input)] rounded-full text-[var(--text-muted)]"><ChevronRight size={16} /></button>
                    </div>
                </div>

                {/* Banner Gradient Baru */}
                <div className="apple-card p-6 sm:p-8 bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white border-none shadow-lg shadow-blue-500/25 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-32 pointer-events-none transform group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Wallet size={14} className="opacity-80" />
                                {financeFilter === 'daily' ? t.today : (financeFilter === 'weekly' ? t.lastSevenDays : t.thisMonth)}
                            </p>
                            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                {filteredExpenses.length} {t.records}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm my-1">
                                {formatCurrency(totalSpentFiltered || 0)}
                            </h3>
                            <p className="text-blue-100 text-xs font-medium opacity-90">
                                {lang === 'id' ? 'Total Pengeluaran' : 'Total Expenses'}
                            </p>
                        </div>
                    </div>
                </div>

                {chartData.length > 0 && (
                    <div className="apple-card p-6 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="var(--bg-card)" strokeWidth={2} />))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize:'12px', fontWeight: 600 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-3">
                        <h5 className="font-bold text-sm mb-4 text-[var(--text-main)]">{t.spendingBreakdown}</h5>
                        {chartData.slice(0, 4).map((entry, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div><span className="font-medium text-[var(--text-main)]">{entry.name}</span></div>
                                <span className="text-[var(--text-muted)] font-medium text-xs">{formatCurrency(entry.value)}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                <div className={`apple-card p-6 transition-all duration-300 ${editingExpenseId ? 'ring-1 ring-[var(--text-main)]' : ''}`}>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input className="w-full apple-input bg-[var(--bg-input)]" placeholder={t.desc} value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}/>
                            <input className="w-full sm:w-1/3 apple-input bg-[var(--bg-input)]" type="number" placeholder="0" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}/>
                        </div>
                        <div className="flex gap-3">
                            <select className="flex-1 apple-input bg-[var(--bg-input)]" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>{Object.entries(t.categories).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}</select>
                            <button onClick={handleAddExpense} className={`apple-button px-6 flex items-center justify-center ${editingExpenseId ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}`}>{editingExpenseId ? <Check size={20}/> : <Plus size={20}/>}</button>
                            {editingExpenseId && <button onClick={() => { setEditingExpenseId(null); setNewExpense({description:'', amount:'', category:'Others'}) }} className="apple-button bg-[var(--text-muted)] px-4 flex items-center justify-center"><X size={20}/></button>}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                {filteredExpenses.map(e => (
                    <div key={e.id} className="apple-card p-4 flex items-center justify-between group hover:scale-[1.005] cursor-default transition-transform">
                    <div className="flex-1 flex items-center gap-3 overflow-hidden">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-main)]">{getCategoryIcon(e.category)}</div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-[var(--text-main)] truncate pr-2">{e.description}</p>
                            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{t.categories[e.category as keyof typeof t.categories]}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <p className="font-bold text-sm text-[var(--text-main)] whitespace-nowrap">-{formatCurrency(e.amount)}</p>
                        <div className="flex space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingExpenseId(e.id); setNewExpense({ description: e.description, amount: e.amount.toString(), category: e.category }) }} className="text-[var(--text-muted)] hover:text-[var(--primary)]"><Pencil size={14}/></button>
                            <button onClick={() => deleteExpense(e.id)} className="text-[var(--text-muted)] hover:text-[var(--danger)]"><Trash2 size={14}/></button>
                        </div>
                    </div>
                    </div>
                ))}
                {filteredExpenses.length === 0 && <div className="text-center py-12 text-[var(--text-muted)] text-sm font-medium">No transactions for this period.</div>}
                </div>
              </div>
            )}

            {/* 4. Konten Savings */}
            {financeSubTab === 'savings' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg text-[var(--text-main)]">{t.savingsGoals}</h4>
                    <button onClick={() => setIsEditingSavings(!isEditingSavings)} className="text-xs font-bold text-[var(--text-main)] px-3 py-1.5 bg-[var(--bg-input)] rounded-lg hover:bg-gray-200 transition-colors">{isEditingSavings ? t.cancel : t.newGoal}</button>
                </div>
                {isEditingSavings && (
                    <div className="apple-card p-5 bg-[var(--bg-body)] border-2 border-dashed border-[var(--border)] animate-in scale-in">
                        <div className="flex flex-col md:flex-row gap-3">
                            <input className="apple-input flex-1" placeholder={t.goalName} value={newSaving.name} onChange={e => setNewSaving({...newSaving, name: e.target.value})} />
                            <input className="apple-input flex-1" type="number" placeholder={t.targetAmount} value={newSaving.target} onChange={e => setNewSaving({...newSaving, target: e.target.value})} />
                            <button onClick={handleAddSaving} className="apple-button bg-[var(--success)] px-6 py-3">{t.save}</button>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                    {savings.map(save => {
                    const percentage = Math.min((save.current / save.target) * 100, 100);
                    return (
                        <div key={save.id} className="apple-card p-6 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-main)]"><Trophy size={18}/></div>
                                    <div><h5 className="font-bold text-[var(--text-main)]">{save.name}</h5><p className="text-xs font-medium text-[var(--text-muted)]">{formatCurrency(save.current)} of {formatCurrency(save.target)}</p></div>
                                </div>
                                <button onClick={() => deleteSaving(save.id)} className="text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            </div>
                            <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden mb-4 relative z-10">
                                <div className="h-full bg-[var(--success)] transition-all duration-1000 ease-out rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="flex gap-2 relative z-10">
                                <button onClick={() => updateSavingAmount(save.id, 50000)} className="flex-1 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">+ 50k</button>
                                <button onClick={() => updateSavingAmount(save.id, 100000)} className="flex-1 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">+ 100k</button>
                                <button onClick={() => { const amt = prompt('Amount:'); if(amt) updateSavingAmount(save.id, parseFloat(amt)); }} className="py-2 px-3 bg-[var(--text-main)] text-[var(--bg-card)] rounded-lg text-xs font-bold"><Plus size={14} /></button>
                            </div>
                        </div>
                    );
                    })}
                </div>
              </div>
            )}

            {/* 5. Konten Budget */}
            {financeSubTab === 'budget' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg text-[var(--text-main)]">{t.budgeting}</h4>
                    <button onClick={() => setIsEditingBudget(!isEditingBudget)} className="text-xs font-bold text-[var(--text-main)] px-3 py-1.5 bg-[var(--bg-input)] rounded-lg hover:bg-gray-200 transition-colors">{isEditingBudget ? t.saved : t.setBudget}</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(t.categories).map(cat => (
                    <div key={cat} className="apple-card p-4 flex flex-col items-center text-center justify-center min-h-[100px] hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">{t.categories[cat as keyof typeof t.categories]}</p>
                    {isEditingBudget ? (
                        <input type="number" className="w-full text-center font-bold text-lg outline-none border-b border-[var(--text-main)] pb-1 bg-transparent text-[var(--text-main)]" placeholder="0" defaultValue={budgets.find(b => b.category === cat)?.amount || ''} onBlur={(e) => saveBudget(cat, parseFloat(e.target.value) || 0)} />
                    ) : (
                        <p className="font-bold text-lg text-[var(--text-main)]">{formatCurrency(budgets.find(b => b.category === cat)?.amount || 0)}</p>
                    )}
                    </div>
                ))}
                </div>
                <div className="space-y-3">
                    {budgetAnalysis.map(item => (
                        <div key={item.category} className="apple-card p-4 flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-sm text-[var(--text-main)]">{t.categories[item.category as keyof typeof t.categories]}</span>
                                    <span className="text-xs font-medium text-[var(--text-muted)]">{formatCurrency(item.spent)} / {formatCurrency(item.budget)}</span>
                                </div>
                                <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${item.percent > 100 ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'}`} style={{ width: `${Math.min(item.percent, 100)}%` }} />
                                </div>
                            </div>
                            <div className={`ml-4 text-[11px] font-bold px-2 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-main)]`}>{Math.round(item.percent)}%</div>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Habits Tab --- */}
        {activeTab === 'habits' && (
        <div className="space-y-8 fade-in pb-20">
            <div className={`p-6 rounded-[24px] transition-all duration-300 shadow-sm border border-[var(--border)] ${editingHabitId ? 'bg-orange-50 dark:bg-orange-900/10 ring-2 ring-[var(--warning)]' : 'bg-[var(--bg-card)]'}`}>
              <div className="flex flex-col md:flex-row gap-3 items-center">
                  <div className="flex-1 w-full relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]"><CheckCircle2 size={20} /></div>
                      <input className="w-full bg-[var(--bg-input)] font-semibold text-[15px] rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-main)] transition-shadow" placeholder={t.habitsTitle} value={newHabit.name} onChange={e => setNewHabit({...newHabit, name: e.target.value})} />
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                      <input type="time" className="bg-[var(--bg-input)] text-[var(--text-main)] font-semibold rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-[var(--primary)]" value={newHabit.time} onChange={e => setNewHabit({...newHabit, time: e.target.value})} />
                      {editingHabitId ? (
                          <><button onClick={handleAddHabit} className="bg-[var(--success)] text-white rounded-xl px-5 py-4 shadow-sm hover:opacity-90"><Check size={20}/></button><button onClick={() => { setEditingHabitId(null); setNewHabit({name:'', time:''}); }} className="bg-[var(--bg-input)] text-[var(--text-muted)] rounded-xl px-5 py-4"><X size={20}/></button></>
                      ) : (
                          <button onClick={handleAddHabit} className="bg-[var(--primary)] text-[var(--bg-body)] font-semibold rounded-xl px-8 py-4 flex items-center justify-center gap-2 hover:opacity-90 shadow-lg whitespace-nowrap w-full md:w-auto"><Plus size={20}/><span className="hidden md:inline">{t.add}</span></button>
                      )}
                  </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map(h => {
                const doneToday = h.completed_dates?.includes(new Date().toLocaleDateString());
                return (
                <div key={h.id} className={`apple-card p-6 group relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${editingHabitId === h.id ? 'ring-2 ring-[var(--text-main)]' : ''}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 pr-4">
                            <h4 className={`text-[17px] font-bold tracking-tight mb-2 text-[var(--text-main)] ${doneToday ? 'text-[var(--text-muted)] line-through' : ''}`}>{h.name}</h4>
                            <div className="flex items-center space-x-3">
                                {h.reminder_time && <span className="flex items-center text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-1 rounded-md"><Clock size={11} className="mr-1"/> {h.reminder_time}</span>}
                                <span className="flex items-center text-[10px] font-bold text-[var(--text-main)]"><Flame size={11} className="mr-1 fill-current"/> {h.streak}</span>
                            </div>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingHabitId(h.id); setNewHabit({ name: h.name, time: h.reminder_time || '' }) }} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => deleteHabit(h.id)} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-50 hover:text-[var(--danger)] transition-colors"><Trash2 size={14} /></button>
                        </div>
                    </div>
                    <button onClick={() => toggleHabit(h)} className={`w-full py-3 rounded-xl flex items-center justify-center font-semibold text-[14px] transition-all active:scale-[0.98] ${doneToday ? 'bg-[var(--bg-input)] text-[var(--text-muted)]' : 'bg-[var(--primary)] text-[var(--bg-body)] dark:bg-white dark:text-black shadow-md'}`}>
                        {doneToday ? <><Check size={16} className="mr-2" strokeWidth={3}/> {lang === 'id' ? 'Selesai' : 'Completed'}</> : <><CheckCircle2 size={16} className="mr-2"/> {lang === 'id' ? 'Tandai Selesai' : 'Mark Done'}</>}
                    </button>
                </div>
                )
            })}
            </div>
        </div>
        )}

        {/* --- Journal Tab --- */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-12 gap-0 md:gap-6 h-[calc(100vh-280px)] fade-in">
            <div className={`col-span-12 md:col-span-4 flex flex-col space-y-3 overflow-y-auto pr-2 custom-scrollbar ${isMobileNoteEditing ? 'hidden md:flex' : 'flex'}`}>
            <div className="mb-4 px-1 pt-1">
                <h3 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                    {lang === 'id' ? 'Jurnal Pribadi' : 'Personal Journal'}
                </h3>
                <p className="text-[var(--text-muted)] text-sm font-medium mt-1">
                    {notes.length} {lang === 'id' ? 'catatan tersimpan' : 'entries saved'}
                </p>
            </div>
  
              <button onClick={() => { setActiveNote({ title: '', content: '', user_id: currentUser.id, created_at: '', updated_at: '' } as any); setIsMobileNoteEditing(true); }} className="apple-button w-full py-4 mb-2 shadow-sm flex items-center justify-center font-semibold bg-[var(--text-main)] text-[var(--bg-body)] hover:opacity-90"><Plus size={18} className="mr-2"/> {t.newEntry}</button>
              {notes.map(n => (
                <div key={n.id} onClick={() => { setActiveNote(n); setIsMobileNoteEditing(true); }} className={`apple-card p-5 cursor-pointer border transition-all group hover:bg-[var(--bg-input)] ${activeNote?.id === n.id ? 'border-[var(--text-main)] ring-1 ring-[var(--text-main)]' : 'border-[var(--border)]'}`}>
                  <h5 className={`font-bold truncate text-[15px] text-[var(--text-main)]`}>{n.title || t.untitled}</h5>
                  <p className="text-[13px] text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed font-medium">{n.content || t.beginThoughts}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)] opacity-60"><span className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center tracking-wider"><CalendarDays size={10} className="mr-1.5"/> {formatShortDate(n.updated_at || n.created_at)}</span></div>
                </div>
              ))}
            </div>

            <div className={`col-span-12 md:col-span-8 flex-col h-full apple-card p-0 border border-[var(--border)] bg-[var(--bg-card)] relative overflow-hidden shadow-sm ${isMobileNoteEditing ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] z-10 bg-[var(--bg-card)]">
                  <button onClick={() => setIsMobileNoteEditing(false)} className="md:hidden text-[var(--text-main)] font-bold flex items-center"><ArrowLeft size={20} className="mr-1" /> {t.back}</button>
                  <div className="flex items-center space-x-2 ml-auto">
                    {activeNote && (<><button onClick={saveNote} className="flex items-center px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide bg-[var(--text-main)] text-[var(--bg-body)] hover:opacity-90"><Save size={14} className="mr-2"/> {isSaving ? '...' : t.saved}</button><button onClick={() => deleteNote(activeNote.id)} className="text-[var(--text-muted)] hover:text-[var(--danger)] p-2 rounded-lg transition-colors"><Trash2 size={18}/></button></>)}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                  {activeNote ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6 text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{t.created}: {formatShortDate(activeNote.created_at || new Date().toISOString())}</div>
                        <input className="text-3xl md:text-5xl font-bold bg-transparent outline-none mb-6 w-full placeholder-gray-300 dark:placeholder-gray-700 tracking-tight text-[var(--text-main)]" placeholder={t.untitled} value={activeNote.title || ''} onChange={e => setActiveNote(prev => prev ? {...prev, title: e.target.value} : {title: e.target.value} as any)} />
                        <textarea className="w-full bg-transparent outline-none resize-none text-[17px] md:text-[19px] leading-[1.7] text-[var(--text-main)] placeholder-gray-300 dark:placeholder-gray-700 min-h-[500px] font-normal" placeholder={t.placeholderJournal} value={activeNote.content || ''} onChange={e => setActiveNote(prev => prev ? {...prev, content: e.target.value} : {content: e.target.value} as any)} />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]"><Pencil size={48} className="mb-4 opacity-10"/><p className="text-[var(--text-muted)] font-semibold tracking-wide text-sm">{t.beginThoughts}</p></div>
                  )}
                </div>
            </div>
          </div>
        )}

        {/* --- Settings Tab --- */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto space-y-8 fade-in pt-10 pb-20">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-main)] text-3xl font-bold mx-auto mb-6 border border-[var(--border)] shadow-sm">
                   {currentUser.user_metadata?.full_name?.[0]}
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">{currentUser.user_metadata?.full_name}</h3>
                <p className="text-[var(--text-muted)] font-medium mt-1 text-sm">{currentUser.email}</p>
              </div>
              
              {(!isAppInstalled || deferredPrompt) && (
              <div className="w-full relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[var(--primary)] to-indigo-600 p-6 text-white shadow-lg shadow-blue-500/25 group my-4">
                  {/* Dekorasi Background */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                      <div className="flex-1">
                          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                                  <Smartphone size={20} className="text-white" />
                              </div>
                              <h4 className="font-bold text-lg">{t.installApp}</h4>
                          </div>
                          <p className="text-sm text-blue-100 font-medium leading-relaxed max-w-[280px] mx-auto sm:mx-0">
                              {t.installDesc}
                          </p>
                      </div>
                      
                      <button 
                          onClick={handleInstallClick} 
                          className="w-full sm:w-auto px-6 py-3.5 bg-white text-[var(--primary)] rounded-xl font-bold text-sm shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                          <Download size={18} />
                          <span>Install Now</span>
                      </button>
                  </div>
              </div>
            )}

              <div className="apple-card overflow-hidden bg-[var(--bg-card)] divide-y divide-[var(--border)] shadow-sm border border-[var(--border)]">
                <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-input)] transition-colors" onClick={() => setLang(lang === 'id' ? 'en' : 'id')}>
                  <div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center"><Languages size={20} className="text-[var(--text-main)]"/></div><div><span className="font-semibold text-base block text-[var(--text-main)]">{t.language}</span><span className="text-sm text-[var(--text-muted)]">{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</span></div></div>
                  <div className="text-[var(--text-muted)]"><ChevronRight size={20} /></div>
                </div>
                <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-input)] transition-colors" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                  <div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center">{theme === 'light' ? <Sun size={20} className="text-[var(--text-main)]"/> : <Moon size={20} className="text-[var(--text-main)]"/>}</div><div><span className="font-semibold text-base block text-[var(--text-main)]">{t.theme}</span><span className="text-sm text-[var(--text-muted)]">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span></div></div>
                  <div className="text-[var(--text-muted)]"><ChevronRight size={20} /></div>
                </div>
              </div>
              <div className="text-center pt-4"><button onClick={handleLogout} className="text-[var(--danger)] font-semibold hover:opacity-70 text-sm">{t.signOut}</button></div>
          </div>
        )}
      </main>

      {/* --- Mobile Tab Bar --- */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-[88px] glass-nav flex justify-around items-start pt-3 px-6 z-50 transition-all duration-500 ${isMobileNoteEditing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        {[ { id: 'dashboard', label: t.overview, icon: <LayoutGrid/> }, { id: 'finance', label: t.wallet, icon: <Wallet/> }, { id: 'habits', label: t.habits, icon: <CheckCircle2/> }, { id: 'notes', label: t.journal, icon: <Pencil/> }, { id: 'settings', label: t.account, icon: <UserIcon/> } ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id as AppTab); setIsMobileNoteEditing(false); }} className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === tab.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
            {React.cloneElement(tab.icon as any, { size: 24, strokeWidth: activeTab === tab.id ? 2.5 : 2, className: activeTab === tab.id ? 'scale-110 transition-transform' : '' })}<span className="text-[10px] mt-2 font-semibold tracking-tight">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
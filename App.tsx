import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { 
  LayoutDashboard, 
  Wallet, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ChevronRight,
  Pencil,
  Flame,
  Search,
  Clock,
  FileText,
  User as UserIcon,
  LogOut,
  Coffee,
  Car,
  ShoppingBag,
  CreditCard,
  MoreHorizontal,
  Settings as SettingsIcon,
  ShieldCheck,
  Mail,
  ArrowLeft,
  Bell,
  Heart,
  Gamepad2,
  Inbox,
  Calendar,
  Languages
} from 'lucide-react';
import { Expense, Habit, Note, AppTab, Language } from './types';

// --- Translations ---
const translations = {
  en: {
    overview: "Overview", wallet: "Wallet", habits: "Habits", journal: "Journal",
    account: "Account", preferences: "Preferences", hello: "Hello",
    totalSpend: "Total Spend", bestStreak: "Best Streak", records: "Records",
    recentActivity: "Recent activity", todaysGoals: "Today's Goals",
    manage: "Manage", viewAll: "View All", logTransaction: "Log Transaction",
    desc: "Description", amount: "Amount", category: "Category", add: "Add",
    habitsTitle: "Daily Goals", startTracking: "Start Tracking",
    myJournal: "My Journal", newEntry: "New Entry", untitled: "Untitled Entry",
    beginThoughts: "Begin your thoughts...", words: "Words", saved: "Saved",
    delete: "Delete", signOut: "Sign Out", language: "Language",
    cloudSync: "Cloud Sync", notifications: "Notifications", privacy: "Privacy",
    theme: "Theme", placeholderJournal: "Reflect on your day...",
    back: "Back", confirmDelete: "Delete this entry?", currency: "Rp",
    categories: {
      Food: "Food", Transport: "Transport", Shopping: "Shopping",
      Bills: "Bills", Health: "Health", Entertainment: "Entertainment", Others: "Others"
    }
  },
  id: {
    overview: "Ringkasan", wallet: "Dompet", habits: "Kebiasaan", journal: "Jurnal",
    account: "Akun", preferences: "Preferensi", hello: "Halo",
    totalSpend: "Total Pengeluaran", bestStreak: "Streak Terbaik", records: "Catatan",
    recentActivity: "Aktivitas Terbaru", todaysGoals: "Target Hari Ini",
    manage: "Atur", viewAll: "Lihat Semua", logTransaction: "Catat Transaksi",
    desc: "Deskripsi", amount: "Jumlah", category: "Kategori", add: "Tambah",
    habitsTitle: "Target Harian", startTracking: "Mulai Lacak",
    myJournal: "Jurnal Saya", newEntry: "Catatan Baru", untitled: "Judul Kosong",
    beginThoughts: "Mulai menulis pikiranmu...", words: "Kata", saved: "Tersimpan",
    delete: "Hapus", signOut: "Keluar", language: "Bahasa",
    cloudSync: "Sinkronisasi Cloud", notifications: "Notifikasi", privacy: "Privasi",
    theme: "Tema", placeholderJournal: "Renungkan harimu...",
    back: "Kembali", confirmDelete: "Hapus entri ini?", currency: "Rp",
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

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      });
      if (error) setError(error.message);
      else alert(lang === 'id' ? 'Cek email Anda untuk verifikasi!' : 'Check your email for verification!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[340px] fade-in">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-[#1D1D1F] rounded-2xl flex items-center justify-center text-white mb-6 shadow-sm">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Zenith</h1>
          <p className="text-[#86868B] text-sm mt-1 font-medium">{lang === 'id' ? 'Sederhanakan rutinitas harianmu.' : 'Simplify your daily routine.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input className="apple-input w-full" placeholder={lang === 'id' ? 'Nama Lengkap' : 'Full Name'} value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input className="apple-input w-full" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="apple-input w-full" type="password" placeholder={lang === 'id' ? 'Kata Sandi' : 'Password'} value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-[13px] text-center font-medium mt-2">{error}</p>}
          <button type="submit" disabled={loading} className="apple-button w-full py-3.5 mt-6 disabled:opacity-50">
            <span className="text-[15px]">{loading ? '...' : isLogin ? (lang === 'id' ? 'Masuk' : 'Sign In') : (lang === 'id' ? 'Gabung Zenith' : 'Join Zenith')}</span>
          </button>
        </form>
        <div className="mt-8 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-[#007AFF] font-semibold text-[14px] hover:opacity-70 transition-opacity">
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
  
  // Data States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Form States
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Others' });
  const [newHabit, setNewHabit] = useState({ name: '', time: '' });
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isMobileNoteEditing, setIsMobileNoteEditing] = useState(false);

  const t = translations[lang];

  // --- 1. Auth & Data Lifecycle ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('zenith_lang', lang);
  }, [lang]);

  // --- 2. Database Functions (CRUD) ---
  const fetchData = async () => {
    if (!currentUser) return;
    const [exp, hab, not] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('habits').select('*'),
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

  // Wallet Actions
  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount) {
      const { data, error } = await supabase.from('expenses').insert([{
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        user_id: currentUser.id
      }]).select();
      if (!error && data) {
        setExpenses([data[0], ...expenses]);
        setNewExpense({ description: '', amount: '', category: 'Others' });
      }
    }
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) setExpenses(expenses.filter(x => x.id !== id));
  };

  // Habit Actions
  const handleAddHabit = async () => {
    if(newHabit.name) {
      const { data, error } = await supabase.from('habits').insert([{
        name: newHabit.name, streak: 0, completed_dates: [],
        reminder_time: newHabit.time, user_id: currentUser.id
      }]).select();
      if (!error && data) {
        setHabits([data[0], ...habits]);
        setNewHabit({name:'', time:''});
      }
    }
  };

  const toggleHabit = async (h: Habit) => {
    const today = new Date().toLocaleDateString();
    const alreadyDone = h.completed_dates?.includes(today);
    const updatedDates = alreadyDone 
      ? h.completed_dates.filter(d => d !== today) 
      : [...(h.completed_dates || []), today];
    
    const { data, error } = await supabase.from('habits').update({
      completed_dates: updatedDates,
      streak: alreadyDone ? Math.max(0, h.streak - 1) : h.streak + 1
    }).eq('id', h.id).select();

    if (!error && data) {
      setHabits(habits.map(item => item.id === h.id ? data[0] : item));
    }
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) setHabits(habits.filter(x => x.id !== id));
  };

  // Note Actions
  const saveNote = async (title: string, content: string) => {
    const now = new Date().toISOString();
    const noteData = { title, content, user_id: currentUser.id, updated_at: now };
    
    if (activeNote) {
      const { data, error } = await supabase.from('notes').update(noteData).eq('id', activeNote.id).select();
      if (!error && data) {
        setNotes(notes.map(n => n.id === activeNote.id ? data[0] : n));
        setActiveNote(data[0]);
      }
    } else {
      const { data, error } = await supabase.from('notes').insert([noteData]).select();
      if (!error && data) {
        setNotes([data[0], ...notes]);
        setActiveNote(data[0]);
      }
    }
  };

  const deleteNote = async (id: string) => {
    if(window.confirm(t.confirmDelete)) {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (!error) {
        setNotes(notes.filter(n => n.id !== id));
        setActiveNote(null);
        setIsMobileNoteEditing(false);
      }
    }
  };

  // --- 3. UI Helpers ---
  const totalSpent = useMemo(() => expenses.reduce((a, b) => a + b.amount, 0), [expenses]);
  const formatCurrency = (val: number) => new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val).replace('IDR', 'Rp');
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Food': return <Coffee size={16}/>; case 'Transport': return <Car size={16}/>;
      case 'Shopping': return <ShoppingBag size={16}/>; case 'Bills': return <CreditCard size={16}/>;
      case 'Health': return <Heart size={16}/>; case 'Entertainment': return <Gamepad2 size={16}/>;
      default: return <MoreHorizontal size={16}/>;
    }
  };

  if (authLoading) return <div className="h-screen w-screen flex items-center justify-center font-bold">Zenith...</div>;
  if (!currentUser) return <AuthScreen lang={lang} />;

  const NavItem = ({ id, label, icon }: { id: AppTab, label: string, icon: any }) => (
    <button onClick={() => { setActiveTab(id); setActiveNote(null); setIsMobileNoteEditing(false); }}
      className={`group flex items-center space-x-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 w-full ${activeTab === id ? 'bg-[#F2F2F7] text-[#007AFF]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>
      <span>{icon}</span><span className="font-semibold text-[14px]">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <aside className="hidden md:flex w-[260px] bg-white border-r border-[#F2F2F7] fixed h-full flex-col p-8 z-50">
        <div className="flex items-center space-x-3.5 mb-12 px-2">
          <div className="w-9 h-9 bg-[#1D1D1F] rounded-xl flex items-center justify-center text-white shadow-sm"><FileText size={20} /></div>
          <h1 className="text-xl font-bold tracking-tight">Zenith</h1>
        </div>
        <nav className="space-y-1.5 flex-1">
          <NavItem id="dashboard" label={t.overview} icon={<LayoutDashboard size={18}/>} />
          <NavItem id="finance" label={t.wallet} icon={<Wallet size={18}/>} />
          <NavItem id="habits" label={t.habits} icon={<CheckCircle2 size={18}/>} />
          <NavItem id="notes" label={t.journal} icon={<Pencil size={18}/>} />
        </nav>
        <div className="pt-6 border-t border-[#F2F2F7]">
           <button onClick={() => setActiveTab('settings')} className="flex items-center space-x-3 w-full px-2 mb-8 group text-left">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] font-bold text-sm">{currentUser.user_metadata?.full_name?.[0] || 'U'}</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[14px] font-bold truncate">{currentUser.user_metadata?.full_name || 'User'}</p>
                <p className="text-[11px] font-semibold text-[#86868B] uppercase">{t.account}</p>
              </div>
           </button>
           <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-2 py-3 text-red-500 text-[13px] font-bold hover:opacity-70 transition-opacity">
             <LogOut size={16}/><span>{t.signOut}</span>
           </button>
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

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-12 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="apple-card p-8">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#007AFF] mb-6"><Wallet size={20}/></div>
                <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest mb-1.5">{t.totalSpend}</p>
                <h3 className="text-2xl font-bold truncate">{formatCurrency(totalSpent)}</h3>
              </div>
              <div className="apple-card p-8">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#FF9500] mb-6"><Flame size={20}/></div>
                <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest mb-1.5">{t.bestStreak}</p>
                <h3 className="text-3xl font-bold">{habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0} <span className="text-base font-semibold text-[#86868B]">Days</span></h3>
              </div>
              <div className="apple-card p-8">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#5856D6] mb-6"><Pencil size={20}/></div>
                <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest mb-1.5">{t.records}</p>
                <h3 className="text-3xl font-bold">{notes.length}</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="apple-card p-8">
                 <h4 className="font-bold text-xl mb-8">{t.recentActivity}</h4>
                 <div className="space-y-6">
                    {expenses.slice(0, 4).map(e => (
                      <div key={e.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                           <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center">{getCategoryIcon(e.category)}</div>
                           <div><p className="font-bold text-[16px]">{e.description}</p><p className="text-[12px] text-[#86868B] font-semibold uppercase">{t.categories[e.category] || e.category}</p></div>
                        </div>
                        <p className="font-bold text-[16px]">-{formatCurrency(e.amount)}</p>
                      </div>
                    ))}
                    {expenses.length === 0 && <p className="py-6 text-center text-[#86868B] font-medium">{lang === 'id' ? 'Tidak ada transaksi.' : 'No transactions.'}</p>}
                 </div>
              </div>
              <div className="apple-card p-8">
                 <h4 className="font-bold text-xl mb-8">{t.todaysGoals}</h4>
                 <div className="space-y-6">
                    {habits.slice(0, 4).map(h => (
                      <div key={h.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                           <div className={`w-4 h-4 rounded-full border-2 ${h.completed_dates?.includes(new Date().toLocaleDateString()) ? 'bg-[#34C759] border-[#34C759]' : 'border-[#D1D1D6]'}`}></div>
                           <p className={`font-bold text-[16px] ${h.completed_dates?.includes(new Date().toLocaleDateString()) ? 'text-[#86868B] line-through' : ''}`}>{h.name}</p>
                        </div>
                        <span className="text-[#FF9500] font-bold text-[15px]">{h.streak}d</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* FINANCE / WALLET */}
        {activeTab === 'finance' && (
          <div className="space-y-8 fade-in">
            <div className="apple-card p-8 bg-[#F9F9FB] border-none">
               <h4 className="font-bold text-lg mb-6">{t.logTransaction}</h4>
               <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                 <input className="md:col-span-5 apple-input" placeholder={t.desc} value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}/>
                 <input className="md:col-span-3 apple-input" type="number" placeholder="0" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}/>
                 <select className="md:col-span-3 apple-input bg-white" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                    {Object.entries(t.categories).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                 </select>
                 <button onClick={handleAddExpense} className="md:col-span-1 apple-button h-11"><Plus size={20}/></button>
               </div>
            </div>
            <div className="apple-card overflow-hidden">
               <div className="divide-y divide-[#F2F2F7]">
                  {expenses.map(e => (
                    <div key={e.id} className="p-5 flex items-center group hover:bg-[#F9F9FB]">
                       <div className="flex-1 flex items-center space-x-4">
                         <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center">{getCategoryIcon(e.category)}</div>
                         <div><p className="font-bold text-[16px]">{e.description}</p><p className="text-[12px] text-[#86868B] font-semibold">{t.categories[e.category]} • {new Date(e.date).toLocaleDateString()}</p></div>
                       </div>
                       <div className="flex items-center space-x-6">
                          <p className="font-bold text-[16px]">-{formatCurrency(e.amount)}</p>
                          <button onClick={() => deleteExpense(e.id)} className="text-[#D1D1D6] hover:text-red-500 opacity-0 group-hover:opacity-100 p-2"><Trash2 size={18}/></button>
                       </div>
                    </div>
                  ))}
                  {expenses.length === 0 && <EmptyState message={t.records + " kosong"} />}
               </div>
            </div>
          </div>
        )}

        {/* HABITS */}
        {activeTab === 'habits' && (
          <div className="space-y-8 fade-in">
            <div className="apple-card p-8 bg-[#F9F9FB] border-none flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <input className="apple-input flex-1" placeholder={t.habitsTitle} value={newHabit.name} onChange={e => setNewHabit({...newHabit, name: e.target.value})}/>
              <input type="time" className="apple-input md:w-40 bg-white" value={newHabit.time} onChange={e => setNewHabit({...newHabit, time: e.target.value})}/>
              <button onClick={handleAddHabit} className="apple-button px-8 h-12">{t.startTracking}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {habits.map(h => {
                const done = h.completed_dates?.includes(new Date().toLocaleDateString());
                return (
                  <div key={h.id} className="apple-card p-6 flex items-center justify-between group">
                    <div className="flex items-center space-x-5">
                      <button onClick={() => toggleHabit(h)} className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-[#34C759] border-[#34C759] text-white' : 'border-[#D1D1D6] text-transparent hover:border-[#34C759]'}`}>
                        <CheckCircle2 size={24}/>
                      </button>
                      <div><h4 className={`text-[17px] font-bold ${done ? 'text-[#86868B] line-through' : ''}`}>{h.name}</h4>
                        <div className="flex items-center space-x-4 text-[12px] font-bold uppercase mt-1">
                           <span className="text-[#FF9500] flex items-center"><Flame size={14} className="mr-1"/> {h.streak} Streak</span>
                           {h.reminder_time && <span className="text-[#86868B] flex items-center"><Clock size={14} className="mr-1"/> {h.reminder_time}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteHabit(h.id)} className="text-[#D1D1D6] hover:text-red-500 opacity-0 group-hover:opacity-100 p-2"><Trash2 size={18}/></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* JOURNAL / NOTES */}
        {activeTab === 'notes' && (
          <div className={`grid grid-cols-12 gap-0 md:gap-10 h-[calc(100vh-280px)] fade-in overflow-hidden`}>
            <div className={`col-span-12 md:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-1 ${isMobileNoteEditing ? 'hidden md:flex' : 'flex'}`}>
              <button onClick={() => { setActiveNote(null); setIsMobileNoteEditing(true); }} className="apple-button w-full py-3 mb-2 shadow-sm"><Plus size={18} className="mr-2 inline"/> {t.newEntry}</button>
              {notes.map(n => (
                <div key={n.id} onClick={() => { setActiveNote(n); setIsMobileNoteEditing(true); }} className={`apple-card p-5 cursor-pointer border-none transition-all ${activeNote?.id === n.id ? 'bg-[#F2F2F7]' : 'hover:bg-[#F9F9FB]'}`}>
                  <h5 className="font-bold text-[16px] truncate">{n.title || t.untitled}</h5>
                  <p className="text-[13px] text-[#86868B] line-clamp-2 mt-1">{n.content || "..."}</p>
                </div>
              ))}
            </div>
            <div className={`col-span-12 md:col-span-8 flex-col h-full apple-card p-6 md:p-12 border-none bg-white relative overflow-hidden ${isMobileNoteEditing ? 'flex' : 'hidden md:flex'}`}>
               <div className="flex items-center justify-between mb-8 md:hidden">
                  <button onClick={() => setIsMobileNoteEditing(false)} className="text-[#007AFF] font-bold flex items-center"><ArrowLeft size={20} className="mr-1" /> {t.back}</button>
                  {activeNote && <button onClick={() => deleteNote(activeNote.id)} className="text-red-500 font-bold">{t.delete}</button>}
               </div>
               <input className="text-2xl md:text-4xl font-extrabold bg-transparent outline-none mb-6 w-full" placeholder={t.untitled} value={activeNote?.title || ''} 
                onChange={e => {
                  const val = e.target.value;
                  setActiveNote(prev => prev ? {...prev, title: val} : {title: val, content: '', user_id: currentUser.id} as any);
                }} onBlur={() => activeNote && saveNote(activeNote.title, activeNote.content)} />
               <textarea className="flex-1 w-full bg-transparent outline-none resize-none text-[17px] md:text-[20px]" placeholder={t.placeholderJournal} value={activeNote?.content || ''} 
                onChange={e => {
                  const val = e.target.value;
                  setActiveNote(prev => prev ? {...prev, content: val} : {title: '', content: val, user_id: currentUser.id} as any);
                }} onBlur={() => activeNote && saveNote(activeNote.title, activeNote.content)} />
               <div className="hidden md:flex mt-8 pt-6 border-t border-[#F2F2F7] justify-between items-center text-[12px] font-bold text-[#86868B]">
                 <span className="flex items-center"><ShieldCheck size={14} className="mr-1"/> Cloud Synchronized</span>
                 {activeNote && <button onClick={() => deleteNote(activeNote.id)} className="text-red-400 hover:text-red-600">{t.delete}</button>}
               </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-10 fade-in pt-10">
             <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] text-3xl font-bold mx-auto mb-6">{currentUser.user_metadata?.full_name?.[0] || 'U'}</div>
                <h3 className="text-2xl font-bold">{currentUser.user_metadata?.full_name || 'User'}</h3>
                <p className="text-[#86868B] font-semibold">{currentUser.email}</p>
             </div>
             <div className="apple-card overflow-hidden bg-white divide-y divide-[#F2F2F7]">
                <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setLang(lang === 'en' ? 'id' : 'en')}>
                  <div className="flex items-center space-x-5"><div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center"><Languages size={18} className="text-[#007AFF]"/></div>
                  <div><span className="font-bold text-[16px] block">{t.language}</span><span className="text-[12px] text-[#86868B] font-semibold">{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</span></div></div>
                  <div className="flex items-center space-x-2"><div className="w-10 h-5 bg-[#E5E5EA] rounded-full relative"><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${lang === 'id' ? 'right-0.5' : 'left-0.5'}`}></div></div></div>
                </div>
                {[{ label: t.cloudSync, icon: <Mail className="text-[#007AFF]"/>, desc: "Auto Backup Enabled" }, { label: t.privacy, icon: <ShieldCheck className="text-[#34C759]"/>, desc: "RLS Protected" }].map((item, i) => (
                  <div key={i} className="p-6 flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center space-x-5"><div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center">{item.icon}</div>
                    <div><span className="font-bold text-[16px] block">{item.label}</span><span className="text-[12px] text-[#86868B] font-semibold">{item.desc}</span></div></div>
                    <ChevronRight size={18} className="text-[#D1D1D6]"/>
                  </div>
                ))}
             </div>
             <div className="text-center pt-8">
               <button onClick={handleLogout} className="px-10 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all text-sm uppercase tracking-widest">{t.signOut}</button>
               <p className="mt-8 text-[11px] font-bold text-[#D1D1D6] uppercase tracking-[0.3em]">Zenith v3.0 • Cloud Powered</p>
             </div>
          </div>
        )}
      </main>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-[88px] glass-nav flex justify-around items-start pt-3 px-4 z-50 pb-safe transition-all duration-300 ${isMobileNoteEditing ? 'translate-y-full opacity-0' : ''}`}>
        {[ { id: 'dashboard', label: t.overview, icon: <LayoutDashboard/> }, { id: 'finance', label: t.wallet, icon: <Wallet/> }, { id: 'habits', label: t.habits, icon: <CheckCircle2/> }, { id: 'notes', label: t.journal, icon: <Pencil/> }, { id: 'settings', label: t.account, icon: <UserIcon/> } ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id as AppTab); setIsMobileNoteEditing(false); }} className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === tab.id ? 'text-[#007AFF]' : 'text-[#86868B]'}`}>
            {React.cloneElement(tab.icon as any, { size: 22, strokeWidth: activeTab === tab.id ? 2.5 : 2 })}
            <span className="text-[10px] mt-1.5 font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
    <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#D1D1D6] mb-4"><Inbox size={24} /></div>
    <p className="text-[#86868B] font-semibold text-[15px]">{message}</p>
  </div>
);

export default App;
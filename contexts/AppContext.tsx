
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { Expense, Habit, Note, Budget, Saving, Theme, Language, User } from '../types';

interface AppContextType {
    currentUser: User | null;
    authLoading: boolean;
    lang: Language;
    setLang: (lang: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    habits: Habit[];
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    budgets: Budget[];
    setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
    savings: Saving[];
    setSavings: React.Dispatch<React.SetStateAction<Saving[]>>;
    fetchData: () => Promise<void>;
    handleLogout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Language>(() => (localStorage.getItem('zenith_lang') as Language) || 'id');
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('zenith_theme') as Theme) || 'light');

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [savings, setSavings] = useState<Saving[]>([]);

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
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

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
        setExpenses([]);
        setHabits([]);
        setNotes([]);
        setBudgets([]);
        setSavings([]);
    };

    return (
        <AppContext.Provider value={{
            currentUser, authLoading,
            lang, setLang,
            theme, setTheme,
            expenses, setExpenses,
            habits, setHabits,
            notes, setNotes,
            budgets, setBudgets,
            savings, setSavings,
            fetchData, handleLogout
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};


import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { translations } from '../constants/translations';
import { Subscription } from '../types';

export const useDashboard = () => {
    const { lang, currentUser, expenses, habits, savings, budgets, setExpenses } = useApp();
    const t = translations[lang];

    const [subscriptions] = useState<Subscription[]>(() => {
        const saved = localStorage.getItem('zenith_subscriptions');
        return saved ? JSON.parse(saved) : [];
    });

    const handleQuickActionClick = async (action: Subscription) => {
        if (!currentUser) return;
        confetti({
            particleCount: 40, spread: 40, origin: { y: 0.6 },
            colors: ['#2563EB', '#ffffff'], disableForReducedMotion: true,
            ticks: 100, gravity: 2, scalar: 0.8
        });
        const { data } = await supabase.from('expenses').insert([{
            description: action.label,
            amount: action.amount,
            category: action.category,
            user_id: currentUser.id,
            date: new Date().toISOString()
        }]).select();
        if (data) setExpenses([data[0], ...expenses]);
    };

    const totalSpentGlobal = useMemo(() => expenses.reduce((a, b) => a + b.amount, 0), [expenses]);
    const totalSavingsGlobal = useMemo(() => savings.reduce((acc, curr) => acc + curr.current, 0), [savings]);
    const bestStreak = useMemo(() => habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0, [habits]);

    const weeklyTrendData = useMemo(() => {
        return [...Array(7)].map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toDateString();
            return {
                name: d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' }),
                amount: expenses.filter(e => new Date(e.date).toDateString() === dateStr).reduce((s, e) => s + e.amount, 0)
            };
        });
    }, [expenses, lang]);

    const budgetAnalysis = useMemo(() => {
        const target = new Date();
        return Object.keys(t.categories).map(cat => {
            const spent = expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear() && e.category === cat;
            }).reduce((s, e) => s + e.amount, 0);
            const budget = budgets.find(b => b.category === cat)?.amount || 0;
            return { category: cat, spent, budget, percent: budget > 0 ? (spent / budget) * 100 : 0 };
        }).sort((a, b) => b.percent - a.percent);
    }, [expenses, budgets, t.categories]);

    return {
        t,
        lang,
        subscriptions,
        handleQuickActionClick,
        totalSpentGlobal,
        totalSavingsGlobal,
        bestStreak,
        weeklyTrendData,
        budgetAnalysis,
        habits
    };
};

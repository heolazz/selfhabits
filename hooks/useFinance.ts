import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { Expense, QuickAction, Subscription } from '../types';
import confetti from 'canvas-confetti';
import { translations } from '../constants/translations';
import { toLocalDateStr, isSameDay } from '../utils/dateHelpers';

export const useFinance = () => {
    const {
        lang,
        currentUser,
        expenses,
        setExpenses,
        savings,
        setSavings,
        budgets,
        setBudgets,
        fetchData
    } = useApp();
    const t = translations[lang];

    const [financeSubTab, setFinanceSubTab] = useState<'expenses' | 'savings' | 'budget'>('expenses');
    const [financeViewMode, setFinanceViewMode] = useState<'list' | 'calendar'>('list');
    const [financeFilter, setFinanceFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedDate, setSelectedDate] = useState(() => {
        const offset = new Date().getTimezoneOffset() * 60000;
        return new Date(Date.now() - offset).toISOString().split('T')[0];
    });

    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Others' });
    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

    // --- NEW BUDGET LOGIC ---
    const [totalMonthlyBudget, setTotalMonthlyBudget] = useState<number>(() => {
        const saved = localStorage.getItem('zenith_total_budget');
        return saved ? parseFloat(saved) : 0;
    });

    const [cycleStartDate, setCycleStartDate] = useState<number>(() => {
        const saved = localStorage.getItem('zenith_cycle_start');
        return saved ? parseInt(saved) : 1;
    });

    useEffect(() => { localStorage.setItem('zenith_total_budget', totalMonthlyBudget.toString()); }, [totalMonthlyBudget]);
    useEffect(() => { localStorage.setItem('zenith_cycle_start', cycleStartDate.toString()); }, [cycleStartDate]);

    const totalAllocated = useMemo(() => budgets.reduce((sum, b) => sum + b.amount, 0), [budgets]);
    const unallocatedBudget = useMemo(() => totalMonthlyBudget - totalAllocated, [totalMonthlyBudget, totalAllocated]);
    // ------------------------

    const [newSaving, setNewSaving] = useState({ name: '', target: '' });
    const [isEditingSavings, setIsEditingSavings] = useState(false);
    const [isEditingBudget, setIsEditingBudget] = useState(false);

    const [quickActions, setQuickActions] = useState<QuickAction[]>(() => {
        const saved = localStorage.getItem('zenith_quick_actions');
        return saved ? JSON.parse(saved) : [{ id: '1', label: 'Busway', amount: 3500, category: 'Transport' }];
    });

    const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
        const saved = localStorage.getItem('zenith_subscriptions');
        return saved ? JSON.parse(saved) : [{ id: 's1', label: 'Netflix', amount: 186000, category: 'Entertainment', dayOfMonth: 25 }];
    });

    const [isEditingQuickActions, setIsEditingQuickActions] = useState(false);
    const [isEditingSubscriptions, setIsEditingSubscriptions] = useState(false);
    const [newQuickAction, setNewQuickAction] = useState({ label: '', amount: '', category: 'Transport' });
    const [newSubscription, setNewSubscription] = useState({ label: '', amount: '', category: 'Bills', day: '' });
    const [editingQuickActionId, setEditingQuickActionId] = useState<string | null>(null);

    useEffect(() => { localStorage.setItem('zenith_quick_actions', JSON.stringify(quickActions)); }, [quickActions]);
    useEffect(() => { localStorage.setItem('zenith_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);

    const navigateDate = (direction: 'next' | 'prev') => {
        const current = new Date(selectedDate);
        if (financeFilter === 'daily') current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
        else if (financeFilter === 'weekly') current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
        else current.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));

        const offset = current.getTimezoneOffset() * 60000;
        setSelectedDate(new Date(current.getTime() - offset).toISOString().split('T')[0]);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredExpenses = useMemo(() => {
        let result = [];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = expenses.filter(e => {
                const matchDesc = e.description.toLowerCase().includes(query);
                const matchCatRaw = e.category.toLowerCase().includes(query);
                const catLabel = t.categories[e.category as keyof typeof t.categories] || '';
                const matchCatLabel = (catLabel as string).toLowerCase().includes(query);
                return matchDesc || matchCatRaw || matchCatLabel;
            });
        } else {
            result = expenses.filter(e => {
                const itemDateStr = toLocalDateStr(e.date);
                if (financeFilter === 'daily') return itemDateStr === selectedDate;

                if (financeFilter === 'weekly') {
                    const targetStart = new Date(selectedDate);
                    targetStart.setHours(0, 0, 0, 0);
                    const targetEnd = new Date(targetStart);
                    targetEnd.setDate(targetEnd.getDate() + 7);
                    const itemDate = new Date(e.date);
                    return itemDate >= targetStart && itemDate < targetEnd;
                }

                // Monthly with Cycle Support
                const target = new Date(selectedDate);
                const itemDate = new Date(e.date);

                if (cycleStartDate === 1) {
                    return itemDate.getMonth() === target.getMonth() && itemDate.getFullYear() === target.getFullYear();
                } else {
                    // Logic for custom billing cycle
                    // If cycle is 25, then for Feb 2026, range is Jan 25 to Feb 24
                    const startYear = target.getMonth() === 0 ? target.getFullYear() - 1 : target.getFullYear();
                    const startMonth = target.getMonth() === 0 ? 11 : target.getMonth() - 1;
                    const startDateCycle = new Date(startYear, startMonth, cycleStartDate);

                    const endDateCycle = new Date(target.getFullYear(), target.getMonth(), cycleStartDate);

                    return itemDate >= startDateCycle && itemDate < endDateCycle;
                }
            });
        }
        return result;
    }, [expenses, financeFilter, selectedDate, searchQuery, t, cycleStartDate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [financeFilter, selectedDate, searchQuery]);

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const paginatedExpenses = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredExpenses.slice(start, start + itemsPerPage);
    }, [filteredExpenses, currentPage, itemsPerPage]);

    const totalSpentFiltered = useMemo(() => filteredExpenses.reduce((a, b) => a + b.amount, 0), [filteredExpenses]);

    const chartData = useMemo(() => {
        const totals: Record<string, number> = {};
        filteredExpenses.forEach(e => totals[e.category] = (totals[e.category] || 0) + e.amount);
        return Object.keys(totals).map(cat => ({
            name: t.categories[cat as keyof typeof t.categories] || cat,
            value: totals[cat]
        })).sort((a, b) => b.value - a.value);
    }, [filteredExpenses, t]);

    const budgetAnalysis = useMemo(() => {
        const target = new Date(selectedDate);
        return Object.keys(t.categories).map(cat => {
            const spent = expenses.filter(e => {
                const itemDate = new Date(e.date);
                if (cycleStartDate === 1) {
                    return itemDate.getMonth() === target.getMonth() && itemDate.getFullYear() === target.getFullYear() && e.category === cat;
                } else {
                    const scYear = target.getMonth() === 0 ? target.getFullYear() - 1 : target.getFullYear();
                    const scMonth = target.getMonth() === 0 ? 11 : target.getMonth() - 1;
                    const scDate = new Date(scYear, scMonth, cycleStartDate);
                    const ecDate = new Date(target.getFullYear(), target.getMonth(), cycleStartDate);
                    return itemDate >= scDate && itemDate < ecDate && e.category === cat;
                }
            }).reduce((s, e) => s + e.amount, 0);
            const budget = budgets.find(b => b.category === cat)?.amount || 0;
            return { category: cat, spent, budget, percent: budget > 0 ? (spent / budget) * 100 : 0 };
        }).sort((a, b) => b.percent - a.percent);
    }, [expenses, budgets, t.categories, selectedDate, cycleStartDate]);

    // Actions
    const handleAddExpense = async () => {
        if (!currentUser) return;
        if (newExpense.description && newExpense.amount) {
            if (editingExpenseId) {
                const { data } = await supabase.from('expenses').update({
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category,
                    updated_at: new Date().toISOString()
                }).eq('id', editingExpenseId).select();
                if (data) {
                    setExpenses(expenses.map(e => e.id === editingExpenseId ? data[0] : e));
                    setEditingExpenseId(null);
                    setNewExpense({ description: '', amount: '', category: 'Others' });
                }
            } else {
                const { data } = await supabase.from('expenses').insert([{
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category,
                    user_id: currentUser.id,
                    date: new Date().toISOString()
                }]).select();
                if (data) {
                    setExpenses([data[0], ...expenses]);
                    setNewExpense({ description: '', amount: '', category: 'Others' });
                }
            }
        }
    };

    const deleteExpense = async (id: string) => {
        if (window.confirm(t.confirmDelete) && !(await supabase.from('expenses').delete().eq('id', id)).error) {
            setExpenses(expenses.filter(x => x.id !== id));
        }
    };

    const handleQuickActionClick = async (action: QuickAction | Subscription) => {
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

    const handleAddQuickAction = () => {
        if (newQuickAction.label && newQuickAction.amount) {
            if (editingQuickActionId) {
                setQuickActions(quickActions.map(q => q.id === editingQuickActionId ? {
                    ...q,
                    label: newQuickAction.label,
                    amount: parseFloat(newQuickAction.amount),
                    category: newQuickAction.category
                } : q));
                setEditingQuickActionId(null);
            } else {
                setQuickActions([...quickActions, {
                    id: Date.now().toString(),
                    label: newQuickAction.label,
                    amount: parseFloat(newQuickAction.amount),
                    category: newQuickAction.category
                }]);
            }
            setNewQuickAction({ label: '', amount: '', category: 'Transport' });
        }
    };

    const deleteQuickAction = (id: string) => {
        if (window.confirm(t.confirmDelete)) setQuickActions(quickActions.filter(q => q.id !== id));
    };

    const handleAddSubscription = () => {
        if (newSubscription.label && newSubscription.amount && newSubscription.day) {
            setSubscriptions([...subscriptions, {
                id: Date.now().toString(),
                label: newSubscription.label,
                amount: parseFloat(newSubscription.amount),
                category: newSubscription.category,
                dayOfMonth: parseInt(newSubscription.day)
            }]);
            setNewSubscription({ label: '', amount: '', category: 'Bills', day: '' });
        }
    };

    const deleteSubscription = (id: string) => {
        if (window.confirm(t.confirmDelete)) setSubscriptions(subscriptions.filter(s => s.id !== id));
    };

    const handleAddSaving = async () => {
        if (!currentUser || !newSaving.name || !newSaving.target) return;
        const { data } = await supabase.from('savings').insert([{
            user_id: currentUser.id,
            name: newSaving.name,
            target: parseFloat(newSaving.target),
            current: 0
        }]).select();
        if (data) {
            setSavings([...savings, data[0]]);
            setNewSaving({ name: '', target: '' });
            setIsEditingSavings(false);
        }
    };

    const updateSavingAmount = async (id: string, addAmount: number) => {
        const save = savings.find(s => s.id === id);
        if (!save) return;
        const newCurrent = save.current + addAmount;
        if (newCurrent >= save.target && save.current < save.target) {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#10B981', '#3B82F6'] });
        }
        const { data } = await supabase.from('savings').update({ current: newCurrent }).eq('id', id).select();
        if (data) setSavings(savings.map(s => s.id === id ? data[0] : s));
    };

    const deleteSaving = async (id: string) => {
        if (window.confirm(t.confirmDelete) && !(await supabase.from('savings').delete().eq('id', id)).error) {
            setSavings(savings.filter(s => s.id !== id));
        }
    };

    const saveBudget = async (category: string, amount: number) => {
        if (!currentUser) return;
        const existing = budgets.find(b => b.category === category);
        if (existing) {
            await supabase.from('budgets').update({ amount }).eq('id', existing.id);
        } else {
            await supabase.from('budgets').insert([{
                user_id: currentUser.id,
                category,
                amount,
                month_year: selectedDate.slice(0, 7)
            }]);
        }
        fetchData();
    };

    return {
        financeSubTab, setFinanceSubTab,
        financeViewMode, setFinanceViewMode,
        financeFilter, setFinanceFilter,
        searchQuery, setSearchQuery,
        selectedDate, setSelectedDate,
        newExpense, setNewExpense,
        editingExpenseId, setEditingExpenseId,
        newSaving, setNewSaving,
        isEditingSavings, setIsEditingSavings,
        isEditingBudget, setIsEditingBudget,
        quickActions, setQuickActions,
        subscriptions, setSubscriptions,
        isEditingQuickActions, setIsEditingQuickActions,
        isEditingSubscriptions, setIsEditingSubscriptions,
        newQuickAction, setNewQuickAction,
        newSubscription, setNewSubscription,
        editingQuickActionId, setEditingQuickActionId,
        navigateDate,
        filteredExpenses,
        totalSpentFiltered,
        chartData,
        budgetAnalysis,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedExpenses,
        handleAddExpense,
        deleteExpense,
        handleQuickActionClick,
        handleAddQuickAction,
        deleteQuickAction,
        handleAddSubscription,
        deleteSubscription,
        handleAddSaving,
        updateSavingAmount,
        deleteSaving,
        saveBudget,
        t,
        lang,
        totalMonthlyBudget, setTotalMonthlyBudget,
        cycleStartDate, setCycleStartDate,
        totalAllocated,
        unallocatedBudget
    };
};

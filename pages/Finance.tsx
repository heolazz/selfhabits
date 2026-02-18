
// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import {
    List, Calendar, Search, FileDown, ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Wallet, Flashlight, Plus, Trash2, Repeat, Check, X, Pencil, Trophy
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translations, CHART_COLORS } from '../constants/translations';
import { supabase } from '../services/supabaseClient';
import confetti from 'canvas-confetti';
import { QuickAction, Subscription } from '../types';
import { toLocalDateStr } from '../utils/dateHelpers';
import { useFinance } from '../hooks/useFinance';

// Icons mapping helper
import { Coffee, Car, ShoppingBag, CreditCard, Heart, Gamepad2, MoreHorizontal } from 'lucide-react';
const getCategoryIcon = (cat: string) => { const icons: any = { Food: <Coffee size={18} />, Transport: <Car size={18} />, Shopping: <ShoppingBag size={18} />, Bills: <CreditCard size={18} />, Health: <Heart size={18} />, Entertainment: <Gamepad2 size={18} /> }; return icons[cat] || <MoreHorizontal size={18} />; };


export const Finance = () => {
    const {
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
        quickActions,
        subscriptions,
        isEditingQuickActions, setIsEditingQuickActions,
        isEditingSubscriptions, setIsEditingSubscriptions,
        newQuickAction, setNewQuickAction,
        newSubscription, setNewSubscription,
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
        unallocatedBudget,
        editingQuickActionId, setEditingQuickActionId
    } = useFinance();

    const [isCyclePickerOpen, setIsCyclePickerOpen] = useState(false);

    const { expenses, savings, budgets, fetchData } = useApp();

    const formatCurrency = (val: number) => { const safeVal = val || 0; return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(safeVal).replace('IDR', 'Rp'); };
    const formatShortCurrency = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'm';
        if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
        return val.toString();
    };

    const handleExportCSV = () => {
        const headers = ["Tanggal", "Waktu", "Kategori", "Deskripsi", "Jumlah (IDR)"];
        const rows = filteredExpenses.map(e => {
            const dateObj = new Date(e.date);
            const date = dateObj.toLocaleDateString('id-ID');
            const time = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const category = t.categories[e.category as keyof typeof t.categories] || e.category;
            const description = `"${e.description.replace(/"/g, '""')}"`;
            const amount = e.amount;
            return [date, time, category, description, amount].join(";");
        });
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `zenith_laporan_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calendar Helper
    const renderCalendar = () => {
        const year = new Date(selectedDate).getFullYear();
        const month = new Date(selectedDate).getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[64px] bg-transparent"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const offset = dateObj.getTimezoneOffset() * 60000;
            const dateStr = new Date(dateObj.getTime() - offset).toISOString().split('T')[0];

            const dayExpenses = expenses.filter(e => toLocalDateStr(e.date) === dateStr);
            const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

            days.push(
                <div
                    key={d}
                    onClick={() => { setSelectedDate(dateStr); setFinanceFilter('daily'); }}
                    className={`min-h-[64px] md:h-20 rounded-xl border flex flex-col items-center justify-between py-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${isSelected ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)]'} ${isToday ? 'ring-2 ring-[var(--warning)]' : ''}`}
                >
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[var(--text-main)]'}`}>{d}</span>
                    {dayTotal > 0 && (
                        <div className="flex flex-col items-center">
                            <span className={`text-[8px] sm:text-[10px] font-bold leading-tight ${isSelected ? 'text-blue-100' : 'text-[var(--text-muted)]'}`}>
                                {formatShortCurrency(dayTotal)}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return (
            <>
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>
                {financeFilter === 'daily' && (
                    <div className="flex justify-center mt-4 animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setFinanceFilter('monthly')}
                            className="text-[11px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-2 rounded-xl hover:bg-[var(--primary)]/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Repeat size={14} />
                            {lang === 'id' ? 'Tampilkan Sebulan Penuh' : 'Show Full Month'}
                        </button>
                    </div>
                )}
            </>
        );
    };


    return (
        <div className="space-y-6 fade-in">
            {/* Header Deskripsi */}
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

            {/* Tombol Navigasi Sub-Tab */}
            <div className="flex bg-[var(--bg-input)] p-1 rounded-xl w-full max-w-sm mx-auto mb-8">
                {(['expenses', 'savings', 'budget'] as const).map((tab) => (
                    <button key={tab} onClick={() => setFinanceSubTab(tab)} className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-2 ${financeSubTab === tab ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                        {t.subTabs[tab]}
                    </button>
                ))}
            </div>

            {/* Konten Expenses */}
            {financeSubTab === 'expenses' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">

                    {/* Top Control Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
                        <div className="flex bg-[var(--bg-input)] p-1 rounded-lg self-start">
                            <button onClick={() => setFinanceViewMode('list')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-semibold transition-all ${financeViewMode === 'list' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
                                <List size={14} /> {t.viewMode.list}
                            </button>
                            <button onClick={() => { setFinanceViewMode('calendar'); setFinanceFilter('monthly'); }} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-semibold transition-all ${financeViewMode === 'calendar' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
                                <Calendar size={14} /> {t.viewMode.calendar}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-[var(--primary)] text-[var(--text-main)]" placeholder={t.search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            </div>
                            <button onClick={handleExportCSV} className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] p-2.5 rounded-xl hover:bg-[var(--bg-input)]" title={t.export}><FileDown size={18} /></button>
                        </div>
                    </div>

                    {/* Date Navigator */}
                    <div className="flex items-center justify-between bg-[var(--bg-input)] p-2 rounded-xl mb-4">
                        <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-[var(--bg-card)] rounded-lg text-[var(--text-muted)] transition-colors"><ArrowLeft size={18} /></button>
                        <span className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wide">
                            {financeViewMode === 'calendar'
                                ? new Date(selectedDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })
                                : (financeFilter === 'monthly'
                                    ? new Date(selectedDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })
                                    : new Date(selectedDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }))
                            }
                        </span>
                        <button onClick={() => navigateDate('next')} className="p-2 hover:bg-[var(--bg-card)] rounded-lg text-[var(--text-muted)] transition-colors"><ChevronRight size={18} /></button>
                    </div>

                    {/* VIEW LIST */}
                    {financeViewMode === 'list' && (
                        <>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                                <div className="flex bg-[var(--bg-input)] p-1 rounded-lg w-full sm:w-auto">
                                    {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                                        <button key={f} onClick={() => { setFinanceFilter(f); setSelectedDate(new Date().toISOString().split('T')[0]); }} className={`flex-1 sm:flex-none px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all ${financeFilter === f ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
                                            {f === 'daily' ? t.today : (f === 'weekly' ? t.lastSevenDays : t.thisMonth)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Banner */}
                            <div className="apple-card p-6 sm:p-8 bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white border-none shadow-lg shadow-blue-500/25 relative overflow-hidden group mb-6">
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

                            {/* Chart */}
                            {chartData.length > 0 && (
                                <div className="apple-card p-6 flex flex-col md:flex-row items-center gap-8 mb-6">
                                    <div className="w-full md:w-1/2 h-[220px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="var(--bg-card)" strokeWidth={2} />))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 600 }} />
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
                        </>
                    )}

                    {/* VIEW CALENDAR */}
                    {financeViewMode === 'calendar' && (
                        <div className="mb-6 fade-in">
                            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{d}</div>
                                ))}
                            </div>
                            {renderCalendar()}
                        </div>
                    )}

                    {/* --- QUICK ACTIONS BAR --- */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2"><Flashlight size={14} className="text-[var(--warning)]" fill="currentColor" /> {t.quickActions}</h4>
                            <button onClick={() => setIsEditingQuickActions(!isEditingQuickActions)} className="text-[10px] font-bold text-[var(--primary)] bg-[var(--bg-input)] px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                                {isEditingQuickActions ? t.save : t.manage}
                            </button>
                        </div>

                        {isEditingQuickActions ? (
                            <div className="apple-card p-4 border-2 border-dashed border-[var(--border)] bg-[var(--bg-body)] animate-in fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    {quickActions.map(qa => (
                                        <div key={qa.id} className="flex items-center justify-between bg-[var(--bg-input)] p-2 rounded-lg group">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[var(--text-main)]">{qa.label}</span>
                                                <span className="text-[10px] text-[var(--text-muted)]">{formatCurrency(qa.amount)}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingQuickActionId(qa.id);
                                                        setNewQuickAction({ label: qa.label, amount: qa.amount.toString(), category: qa.category });
                                                    }}
                                                    className="text-[var(--primary)] p-1 hover:bg-blue-50 rounded"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => deleteQuickAction(qa.id)} className="text-[var(--danger)] p-1 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 items-center border-t border-[var(--border)] pt-3">
                                    <input className="apple-input py-2 text-xs" placeholder="Label" value={newQuickAction.label} onChange={e => setNewQuickAction({ ...newQuickAction, label: e.target.value })} />
                                    <input className="apple-input py-2 text-xs w-24" type="number" placeholder="Rp" value={newQuickAction.amount} onChange={e => setNewQuickAction({ ...newQuickAction, amount: e.target.value })} />
                                    <button onClick={handleAddQuickAction} className={`${editingQuickActionId ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'} text-white p-2 rounded-lg transition-colors`}>
                                        {editingQuickActionId ? <Check size={16} /> : <Plus size={16} />}
                                    </button>
                                    {editingQuickActionId && (
                                        <button
                                            onClick={() => {
                                                setEditingQuickActionId(null);
                                                setNewQuickAction({ label: '', amount: '', category: 'Transport' });
                                            }}
                                            className="bg-[var(--text-muted)] text-white p-2 rounded-lg"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                                {quickActions.map(qa => (
                                    <button
                                        key={qa.id}
                                        onClick={() => handleQuickActionClick(qa)}
                                        className="snap-start shrink-0 flex flex-col items-start justify-between min-w-[100px] p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--primary)] hover:shadow-md transition-all active:scale-95 group"
                                    >
                                        <span className="text-[11px] font-bold text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">{qa.label}</span>
                                        <span className="text-[13px] font-extrabold text-[var(--text-main)] mt-1">{formatCurrency(qa.amount)}</span>
                                    </button>
                                ))}
                                <button onClick={() => setIsEditingQuickActions(true)} className="snap-start shrink-0 flex flex-col items-center justify-center min-w-[50px] rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- SUBSCRIPTIONS --- */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2"><Repeat size={14} className="text-[var(--text-muted)]" /> {t.subscriptions}</h4>
                            <button onClick={() => setIsEditingSubscriptions(!isEditingSubscriptions)} className="text-[10px] font-bold text-[var(--primary)] bg-[var(--bg-input)] px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                                {isEditingSubscriptions ? t.save : t.manage}
                            </button>
                        </div>

                        {isEditingSubscriptions ? (
                            <div className="apple-card p-4 border-2 border-dashed border-[var(--border)] bg-[var(--bg-body)] animate-in fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    {subscriptions.map(s => (
                                        <div key={s.id} className="flex items-center justify-between bg-[var(--bg-input)] p-2 rounded-lg">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[var(--text-main)]">{s.label} (Day {s.dayOfMonth})</span>
                                                <span className="text-[10px] text-[var(--text-muted)]">{formatCurrency(s.amount)}</span>
                                            </div>
                                            <button onClick={() => deleteSubscription(s.id)} className="text-[var(--danger)] p-1 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 items-center border-t border-[var(--border)] pt-3">
                                    <input className="apple-input py-2 text-xs" placeholder="Label" value={newSubscription.label} onChange={e => setNewSubscription({ ...newSubscription, label: e.target.value })} />
                                    <input className="apple-input py-2 text-xs w-20" type="number" placeholder="Rp" value={newSubscription.amount} onChange={e => setNewSubscription({ ...newSubscription, amount: e.target.value })} />
                                    <input className="apple-input py-2 text-xs w-16" type="number" placeholder="Day" max={31} value={newSubscription.day} onChange={e => setNewSubscription({ ...newSubscription, day: e.target.value })} />
                                    <button onClick={handleAddSubscription} className="bg-[var(--primary)] text-white p-2 rounded-lg"><Plus size={16} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {subscriptions.map(s => (
                                    <div key={s.id} className={`p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] flex flex-col ${new Date().getDate() === s.dayOfMonth ? 'border-[var(--warning)] ring-1 ring-[var(--warning)]' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Day {s.dayOfMonth}</span>
                                            {new Date().getDate() === s.dayOfMonth && <div className="w-2 h-2 rounded-full bg-[var(--warning)]"></div>}
                                        </div>
                                        <span className="font-bold text-[13px] text-[var(--text-main)] truncate">{s.label}</span>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-[var(--text-muted)]">{formatCurrency(s.amount)}</span>
                                            <button onClick={() => handleQuickActionClick(s)} className="p-1.5 bg-[var(--bg-input)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors"><Check size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`apple-card p-6 transition-all duration-300 ${editingExpenseId ? 'ring-1 ring-[var(--text-main)]' : ''}`}>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input className="w-full apple-input bg-[var(--bg-input)]" placeholder={t.desc} value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
                                <input className="w-full sm:w-1/3 apple-input bg-[var(--bg-input)]" type="number" placeholder="0" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
                            </div>
                            <div className="flex gap-3">
                                <select className="flex-1 apple-input bg-[var(--bg-input)]" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>{Object.entries(t.categories).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}</select>
                                <button onClick={handleAddExpense} className={`apple-button px-6 flex items-center justify-center ${editingExpenseId ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}`}>{editingExpenseId ? <Check size={20} /> : <Plus size={20} />}</button>
                                {editingExpenseId && <button onClick={() => { setEditingExpenseId(null); setNewExpense({ description: '', amount: '', category: 'Others' }) }} className="apple-button bg-[var(--text-muted)] px-4 flex items-center justify-center"><X size={20} /></button>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {paginatedExpenses.map(e => (
                            <div key={e.id} className="apple-card p-4 flex items-center justify-between group hover:scale-[1.005] cursor-default transition-transform">
                                <div className="flex-1 flex items-center gap-3 overflow-hidden">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-main)]">{getCategoryIcon(e.category)}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-sm text-[var(--text-main)] truncate pr-2">{e.description}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[11px] text-[var(--text-muted)] font-medium">{t.categories[e.category as keyof typeof t.categories]}</p>
                                            <span className="text-[10px] text-[var(--text-muted)] opacity-50">•</span>
                                            <p className="text-[10px] text-[var(--text-muted)] font-medium">
                                                {new Date(e.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                                                <span className="ml-1 opacity-70">
                                                    {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                    <p className="font-bold text-sm text-[var(--text-main)] whitespace-nowrap">-{formatCurrency(e.amount)}</p>
                                    <div className="flex space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingExpenseId(e.id); setNewExpense({ description: e.description, amount: e.amount.toString(), category: e.category }) }} className="text-[var(--text-muted)] hover:text-[var(--primary)]"><Pencil size={14} /></button>
                                        <button onClick={() => deleteExpense(e.id)} className="text-[var(--text-muted)] hover:text-[var(--danger)]"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredExpenses.length > 0 && (
                            <div className="flex items-center justify-center gap-1 mt-6 pb-4">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                    className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--bg-input)] transition-colors"
                                    title="First Page"
                                >
                                    <ChevronsLeft size={16} />
                                </button>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--bg-input)] transition-colors"
                                    title="Previous Page"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <div className="flex items-center gap-1 mx-1">
                                    {(() => {
                                        const pages = [];
                                        const maxVisible = 5;
                                        let start = Math.max(1, currentPage - 2);
                                        let end = Math.min(totalPages, start + maxVisible - 1);

                                        if (end === totalPages) {
                                            start = Math.max(1, end - maxVisible + 1);
                                        }

                                        for (let i = start; i <= end; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i
                                                        ? 'bg-[var(--primary)] text-white shadow-sm'
                                                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--bg-input)]'
                                                        }`}
                                                >
                                                    {i}
                                                </button>
                                            );
                                        }
                                        return pages;
                                    })()}
                                </div>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--bg-input)] transition-colors"
                                    title="Next Page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--bg-input)] transition-colors"
                                    title="Last Page"
                                >
                                    <ChevronsRight size={16} />
                                </button>
                            </div>
                        )}

                        {filteredExpenses.length === 0 && <div className="text-center py-12 text-[var(--text-muted)] text-sm font-medium">{searchQuery ? 'No transactions found matching your search.' : 'No transactions for this period.'}</div>}
                    </div>

                </div>
            )}

            {financeSubTab === 'savings' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg text-[var(--text-main)]">{t.savingsGoals}</h4>
                        <button onClick={() => setIsEditingSavings(!isEditingSavings)} className="text-xs font-bold text-[var(--text-main)] px-3 py-1.5 bg-[var(--bg-input)] rounded-lg hover:bg-gray-200 transition-colors">{isEditingSavings ? t.cancel : t.newGoal}</button>
                    </div>
                    {isEditingSavings && (
                        <div className="apple-card p-5 bg-[var(--bg-body)] border-2 border-dashed border-[var(--border)] animate-in scale-in">
                            <div className="flex flex-col md:flex-row gap-3">
                                <input className="apple-input flex-1" placeholder={t.goalName} value={newSaving.name} onChange={e => setNewSaving({ ...newSaving, name: e.target.value })} />
                                <input className="apple-input flex-1" type="number" placeholder={t.targetAmount} value={newSaving.target} onChange={e => setNewSaving({ ...newSaving, target: e.target.value })} />
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
                                            <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-main)]"><Trophy size={18} /></div>
                                            <div><h5 className="font-bold text-[var(--text-main)]">{save.name}</h5><p className="text-xs font-medium text-[var(--text-muted)]">{formatCurrency(save.current)} of {formatCurrency(save.target)}</p></div>
                                        </div>
                                        <button onClick={() => deleteSaving(save.id)} className="text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden mb-4 relative z-10">
                                        <div className="h-full bg-[var(--success)] transition-all duration-1000 ease-out rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <div className="flex gap-2 relative z-10">
                                        <button onClick={() => updateSavingAmount(save.id, 50000)} className="flex-1 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">+ 50k</button>
                                        <button onClick={() => updateSavingAmount(save.id, 100000)} className="flex-1 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">+ 100k</button>
                                        <button onClick={() => { const amt = prompt('Amount:'); if (amt) updateSavingAmount(save.id, parseFloat(amt)); }} className="py-2 px-3 bg-[var(--text-main)] text-[var(--bg-card)] rounded-lg text-xs font-bold"><Plus size={14} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {financeSubTab === 'budget' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    {/* Setup Budget Section */}
                    <div className="apple-card p-6 bg-[var(--bg-card)] border border-[var(--border)] relative">
                        {/* Background Blur Effect (Clipped) */}
                        <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        </div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                    {lang === 'id' ? 'Total Anggaran Bulanan' : 'Total Monthly Budget'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--text-main)]">{t.currency}</span>
                                    <input
                                        type="number"
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 font-extrabold text-xl outline-none focus:border-[var(--primary)] text-[var(--text-main)] transition-all"
                                        value={totalMonthlyBudget}
                                        onChange={(e) => setTotalMonthlyBudget(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                    {lang === 'id' ? 'Tanggal Gajian / Awal Siklus' : 'Payday / Cycle Start Date'}
                                </label>
                                <div className="flex items-center gap-3 relative">
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsCyclePickerOpen(!isCyclePickerOpen)}
                                            className="flex items-center justify-center gap-2 w-24 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl py-3 px-4 font-bold text-lg text-[var(--text-main)] hover:bg-[var(--border)] transition-all cursor-pointer"
                                        >
                                            <Calendar size={18} className="text-[var(--primary)]" />
                                            {cycleStartDate}
                                        </button>

                                        {isCyclePickerOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsCyclePickerOpen(false)}></div>
                                                <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 w-[240px]">
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                            <button
                                                                key={day}
                                                                onClick={() => {
                                                                    setCycleStartDate(day);
                                                                    setIsCyclePickerOpen(false);
                                                                }}
                                                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${cycleStartDate === day
                                                                    ? 'bg-[var(--primary)] text-white shadow-md'
                                                                    : 'hover:bg-[var(--bg-input)] text-[var(--text-main)] active:scale-95'
                                                                    }`}
                                                            >
                                                                {day}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        {lang === 'id'
                                            ? `Budget dihitung dari tanggal ${cycleStartDate} hingga ${cycleStartDate - 1 || 30} bulan berikutnya.`
                                            : `Budget calculated from day ${cycleStartDate} to ${cycleStartDate - 1 || 30} of next month.`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Unallocated Status */}
                        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md ${unallocatedBudget < 0 ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'}`}>
                                    {unallocatedBudget < 0 ? <X size={24} /> : <Check size={24} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                        {unallocatedBudget < 0 ? (lang === 'id' ? 'Anggaran Berlebih' : 'Over Budgeted') : (lang === 'id' ? 'Sisa Alokasi' : 'Unallocated')}
                                    </p>
                                    <h4 className={`text-2xl font-black ${unallocatedBudget < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-main)]'}`}>
                                        {formatCurrency(Math.abs(unallocatedBudget))}
                                    </h4>
                                </div>
                            </div>
                            <div className="w-full sm:w-64 space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-[var(--text-muted)]">
                                    <span>{lang === 'id' ? 'Teralokasi' : 'Allocated'}</span>
                                    <span>{Math.min(Math.round((totalAllocated / totalMonthlyBudget) * 100), 100)}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${totalAllocated > totalMonthlyBudget ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'}`}
                                        style={{ width: `${Math.min((totalAllocated / totalMonthlyBudget) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <h4 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-widest">{t.spendingBreakdown}</h4>
                        <button onClick={() => setIsEditingBudget(!isEditingBudget)} className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${isEditingBudget ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--border)]'}`}>
                            {isEditingBudget ? t.saved : t.setBudget}
                        </button>
                    </div>

                    {/* Category Budgeting Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.keys(t.categories).map(cat => {
                            const budgetItem = budgets.find(b => b.category === cat);
                            const spentData = budgetAnalysis.find(a => a.category === cat);
                            const budgetAmount = budgetItem?.amount || 0;
                            const spentAmount = spentData?.spent || 0;
                            const isOver = spentAmount > budgetAmount && budgetAmount > 0;

                            return (
                                <div key={cat} className={`apple-card p-5 transition-all group ${isEditingBudget ? 'border-2 border-dashed border-[var(--primary)] bg-[var(--primary)]/5' : 'border border-[var(--border)] bg-[var(--bg-card)]'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-main)] group-hover:scale-110 transition-transform">
                                            {getCategoryIcon(cat)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">
                                                {t.categories[cat as keyof typeof t.categories]}
                                            </p>
                                            {isEditingBudget ? (
                                                <div className="flex items-center gap-1 mt-1 border-b border-[var(--primary)]">
                                                    <span className="text-sm font-bold opacity-50">{t.currency}</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent font-black text-lg outline-none text-[var(--primary)] py-1"
                                                        defaultValue={budgetAmount || ''}
                                                        onBlur={(e) => saveBudget(cat, parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            ) : (
                                                <h5 className="font-bold text-[var(--text-main)] text-lg mt-0.5">
                                                    {formatCurrency(budgetAmount)}
                                                </h5>
                                            )}
                                        </div>
                                    </div>

                                    {!isEditingBudget && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{lang === 'id' ? 'Terpakai' : 'Spent'}</p>
                                                    <p className={`text-sm font-bold ${isOver ? 'text-[var(--danger)]' : 'text-[var(--text-main)]'}`}>
                                                        {formatCurrency(spentAmount)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{lang === 'id' ? 'Sisa' : 'Remains'}</p>
                                                    <p className={`text-sm font-bold ${budgetAmount - spentAmount < 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                                                        {formatCurrency(Math.max(0, budgetAmount - spentAmount))}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'}`}
                                                    style={{ width: `${Math.min(spentData?.percent || 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

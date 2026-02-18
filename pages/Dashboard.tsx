
import React from 'react';
import {
    BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import {
    Receipt, PiggyBank, Zap, ArrowUpRight, CalendarCheck
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export const Dashboard = () => {
    const {
        t,
        lang,
        subscriptions,
        handleQuickActionClick,
        totalSpentGlobal,
        totalSavingsGlobal,
        bestStreak,
        weeklyTrendData,
        budgetAnalysis
    } = useDashboard();

    const formatCurrency = (val: number) => { const safeVal = val || 0; return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(safeVal).replace('IDR', 'Rp'); };

    return (
        <div className="space-y-6 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: t.totalSpend, val: formatCurrency(totalSpentGlobal), icon: <Receipt size={18} />, footer: <div className="flex items-center mt-2 text-[12px] font-medium text-[var(--success)]"><ArrowUpRight size={12} className="mr-1" /> <span>Updates live</span></div> },
                    { label: t.totalSavings, val: formatCurrency(totalSavingsGlobal), icon: <PiggyBank size={18} />, footer: <div className="w-full bg-[var(--bg-input)] h-1.5 mt-3 rounded-full overflow-hidden"><div className="bg-[var(--success)] h-full w-[65%] rounded-full"></div></div> },
                    { label: t.bestStreak, val: bestStreak, sub: 'days', icon: <Zap size={18} />, footer: <div className="flex gap-1 mt-3">{[1, 2, 3, 4, 5].map(i => (<div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 3 ? 'bg-[var(--warning)]' : 'bg-[var(--bg-input)]'}`}></div>))}</div> }
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

            {/* Due Subscriptions Widget */}
            {subscriptions.some(s => s.dayOfMonth === new Date().getDate()) && (
                <div className="apple-card p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><CalendarCheck size={20} /></div>
                        <div>
                            <h4 className="font-bold text-sm">{t.dueToday}</h4>
                            <p className="text-xs opacity-90">{subscriptions.filter(s => s.dayOfMonth === new Date().getDate()).map(s => s.label).join(', ')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {subscriptions.filter(s => s.dayOfMonth === new Date().getDate()).map(s => (
                            <button key={s.id} onClick={() => handleQuickActionClick(s)} className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-transform">{t.pay} {formatCurrency(s.amount)}</button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="apple-card p-6">
                    <div className="flex justify-between items-center mb-6"><h4 className="font-semibold text-sm text-[var(--text-main)]">{t.weeklyTrend}</h4></div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyTrendData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} dy={10} />
                                <RechartsTooltip cursor={{ fill: 'var(--bg-input)', radius: 4 }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', padding: '8px 12px', fontSize: '12px' }} labelStyle={{ display: 'none' }} formatter={(value: number) => [formatCurrency(value as number), '']} />
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
    );
};

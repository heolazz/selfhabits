
import React from 'react';
import {
    Check, Plus, Trash2, Flame
} from 'lucide-react';
import { useHabits } from '../hooks/useHabits';

export const Habits = () => {
    const {
        habits,
        newHabit,
        setNewHabit,
        handleAddHabit,
        deleteHabit,
        toggleHabit,
        t,
        lang
    } = useHabits();

    return (
        <div className="space-y-6 fade-in">
            <div className="mb-2 px-1">
                <h3 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">{lang === 'id' ? 'Kebiasaan' : 'Habits'}</h3>
                <p className="text-[var(--text-muted)] text-sm font-medium mt-1">{lang === 'id' ? 'Bangun konsistensi setiap hari.' : 'Build consistency every day.'}</p>
            </div>

            <div className="apple-card p-6 shadow-sm">
                <div className="flex gap-3">
                    <input
                        className="apple-input flex-1"
                        placeholder={lang === 'id' ? 'Contoh: Meditasi 10 menit...' : 'Example: Meditate 10 mins...'}
                        value={newHabit}
                        onChange={e => setNewHabit(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                    />
                    <button
                        onClick={handleAddHabit}
                        className="apple-button px-6 bg-[var(--primary)] hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map(habit => {
                    const today = new Date().toISOString().split('T')[0];
                    const isDone = habit.completed_dates.includes(today);
                    return (
                        <div key={habit.id} className={`apple-card p-5 group transition-all duration-300 ${isDone ? 'ring-1 ring-[var(--success)] bg-[var(--success)]/5' : ''}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className={`font-bold text-lg ${isDone ? 'text-[var(--success)]' : 'text-[var(--text-main)]'}`}>{habit.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Flame size={14} className={habit.streak > 0 ? "text-[var(--warning)] fill-[var(--warning)]" : "text-[var(--text-muted)]"} />
                                        <span className="text-xs font-bold text-[var(--text-muted)]">{habit.streak} {lang === 'id' ? 'hari beruntun' : 'day streak'}</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteHabit(habit.id)} className="text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity p-2"><Trash2 size={16} /></button>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex -space-x-1">
                                    {[4, 3, 2, 1, 0].map(d => {
                                        const date = new Date(); date.setDate(date.getDate() - d);
                                        const dateStr = date.toISOString().split('T')[0];
                                        const done = habit.completed_dates.includes(dateStr);
                                        return (
                                            <div key={d} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-[var(--bg-card)] ${done ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`} title={dateStr}>
                                                {date.getDate()}
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => toggleHabit(habit.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-sm ${isDone
                                            ? 'bg-[var(--success)] text-white shadow-green-500/20'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                                        }`}
                                >
                                    {isDone ? <><Check size={16} /> {t.done}</> : <><Plus size={16} /> {t.markDone}</>}
                                </button>
                            </div>
                        </div>
                    );
                })}

                {habits.length === 0 && <div className="col-span-1 md:col-span-2 text-center py-12 text-[var(--text-muted)] text-sm font-medium">{lang === 'id' ? 'Belum ada kebiasaan. Mulai sekarang!' : 'No habits yet. Start today!'}</div>}
            </div>
        </div>
    );
};

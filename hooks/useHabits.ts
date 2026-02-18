
import { useState } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { translations } from '../constants/translations';
import { useToast } from '../components/Toast';
import { useSync, generateTempId } from './useSync';

export const useHabits = () => {
    const { lang, currentUser, habits, setHabits, isOffline } = useApp();
    const t = translations[lang];
    const { showToast } = useToast();
    const { addToQueue } = useSync();

    const [newHabit, setNewHabit] = useState('');

    const handleAddHabit = async () => {
        if (!newHabit.trim() || !currentUser) return;

        if (isOffline) {
            const tempId = generateTempId();
            const newHab: any = { id: tempId, user_id: currentUser.id, name: newHabit, streak: 0, completed_dates: [], created_at: new Date().toISOString() };
            setHabits([...habits, newHab]);
            addToQueue({ table: 'habits', type: 'INSERT', payload: { user_id: currentUser.id, name: newHabit, streak: 0, completed_dates: [] }, matchValue: tempId });
            setNewHabit('');
            showToast(lang === 'id' ? 'Kebiasaan ditambahkan (Offline)' : 'Habit added (Offline)', 'success');
            return;
        }

        const { data } = await supabase.from('habits').insert([{
            user_id: currentUser.id,
            name: newHabit,
            streak: 0,
            completed_dates: []
        }]).select();
        if (data) {
            setHabits([...habits, data[0]]);
            setNewHabit('');
            showToast(lang === 'id' ? 'Kebiasaan ditambahkan' : 'Habit added', 'success');
        }
    };

    const deleteHabit = async (id: string) => {
        if (isOffline) {
            if (window.confirm(t.confirmDelete)) {
                setHabits(habits.filter(h => h.id !== id));
                addToQueue({ table: 'habits', type: 'DELETE', matchField: 'id', matchValue: id, payload: {} });
                showToast(lang === 'id' ? 'Kebiasaan dihapus (Offline)' : 'Habit deleted (Offline)', 'delete');
            }
            return;
        }

        if (window.confirm(t.confirmDelete) && !(await supabase.from('habits').delete().eq('id', id)).error) {
            setHabits(habits.filter(h => h.id !== id));
            showToast(lang === 'id' ? 'Kebiasaan dihapus' : 'Habit deleted', 'delete');
        }
    };

    const toggleHabit = async (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;
        const today = new Date().toISOString().split('T')[0];
        const isCompleted = habit.completed_dates.includes(today);
        let newDates = isCompleted ? habit.completed_dates.filter(d => d !== today) : [...habit.completed_dates, today];

        // Calculate Streak
        let streak = 0;
        const sortedDates = [...newDates].sort().reverse();
        if (sortedDates.length > 0) {
            let tempDate = new Date();
            let checkStr = tempDate.toISOString().split('T')[0];
            if (!newDates.includes(checkStr)) {
                // Check yesterday
                tempDate.setDate(tempDate.getDate() - 1);
                checkStr = tempDate.toISOString().split('T')[0];
            }

            if (newDates.includes(checkStr)) {
                streak = 1;
                while (true) {
                    tempDate.setDate(tempDate.getDate() - 1);
                    const prevStr = tempDate.toISOString().split('T')[0];
                    if (newDates.includes(prevStr)) streak++;
                    else break;
                }
            } else {
                streak = 0;
            }
        }

        if (!isCompleted) confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, colors: ['#F59E0B', '#EF4444'] });

        if (isOffline) {
            setHabits(habits.map(h => h.id === id ? { ...h, completed_dates: newDates, streak } : h));
            addToQueue({ table: 'habits', type: 'UPDATE', payload: { completed_dates: newDates, streak }, matchField: 'id', matchValue: id });
            showToast(!isCompleted
                ? (lang === 'id' ? 'Kebiasaan selesai! (Offline)' : 'Habit completed! (Offline)')
                : (lang === 'id' ? 'Dibatalkan (Offline)' : 'Undone (Offline)'), !isCompleted ? 'success' : 'info');
            return;
        }

        const { data } = await supabase.from('habits').update({ completed_dates: newDates, streak }).eq('id', id).select();
        if (data) {
            setHabits(habits.map(h => h.id === id ? data[0] : h));
            showToast(!isCompleted
                ? (lang === 'id' ? 'Kebiasaan selesai!' : 'Habit completed!')
                : (lang === 'id' ? 'Dibatalkan' : 'Undone'), !isCompleted ? 'success' : 'info');
        }
    };

    return {
        habits,
        newHabit,
        setNewHabit,
        handleAddHabit,
        deleteHabit,
        toggleHabit,
        t,
        lang
    };
};

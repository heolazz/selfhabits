
import { useState } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { translations } from '../constants/translations';

export const useHabits = () => {
    const { lang, currentUser, habits, setHabits } = useApp();
    const t = translations[lang];

    const [newHabit, setNewHabit] = useState('');

    const handleAddHabit = async () => {
        if (!newHabit.trim() || !currentUser) return;
        const { data } = await supabase.from('habits').insert([{
            user_id: currentUser.id,
            name: newHabit,
            streak: 0,
            completed_dates: []
        }]).select();
        if (data) {
            setHabits([...habits, data[0]]);
            setNewHabit('');
        }
    };

    const deleteHabit = async (id: string) => {
        if (window.confirm(t.confirmDelete) && !(await supabase.from('habits').delete().eq('id', id)).error) {
            setHabits(habits.filter(h => h.id !== id));
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
        const { data } = await supabase.from('habits').update({ completed_dates: newDates, streak }).eq('id', id).select();
        if (data) setHabits(habits.map(h => h.id === id ? data[0] : h));
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

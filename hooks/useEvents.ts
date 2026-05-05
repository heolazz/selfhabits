import { useState, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { FinanceEvent, EventIconType } from '../types';
import { translations } from '../constants/translations';
import { useToast } from '../components/Toast';
import { useSync, generateTempId } from './useSync';

export const EVENT_ICONS: { key: EventIconType; label: string }[] = [
    { key: 'plane', label: 'Travel' },
    { key: 'mountain', label: 'Hiking' },
    { key: 'palmtree', label: 'Vacation' },
    { key: 'tent', label: 'Camping' },
    { key: 'graduation-cap', label: 'School' },
    { key: 'gift', label: 'Celebration' },
    { key: 'music', label: 'Concert' },
    { key: 'camera', label: 'Photo Trip' },
    { key: 'utensils', label: 'Dining' },
    { key: 'bus', label: 'Road Trip' },
    { key: 'building', label: 'Business' },
    { key: 'heart', label: 'Date' },
    { key: 'star', label: 'Special' },
    { key: 'flag', label: 'Competition' },
    { key: 'map-pin', label: 'Visit' },
    { key: 'briefcase', label: 'Work Trip' },
];

export const useEvents = () => {
    const {
        lang,
        currentUser,
        expenses,
        events,
        setEvents,
        fetchData,
        isOffline
    } = useApp();
    const t = translations[lang];
    const { showToast } = useToast();
    const { addToQueue } = useSync();

    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [eventFilter, setEventFilter] = useState<'active' | 'completed' | 'all'>('active');
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    const [newEvent, setNewEvent] = useState({
        name: '',
        icon: 'plane' as EventIconType,
        budget: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    });

    // Filtered events
    const filteredEvents = useMemo(() => {
        if (eventFilter === 'all') return events;
        return events.filter(e => e.status === eventFilter);
    }, [events, eventFilter]);

    // Get expenses for a specific event
    const getEventExpenses = useCallback((eventId: string) => {
        return expenses.filter(e => e.event_id === eventId);
    }, [expenses]);

    // Get total spent for a specific event
    const getEventTotal = useCallback((eventId: string) => {
        return getEventExpenses(eventId).reduce((sum, e) => sum + e.amount, 0);
    }, [getEventExpenses]);

    // Get category breakdown for a specific event
    const getEventBreakdown = useCallback((eventId: string) => {
        const eventExpenses = getEventExpenses(eventId);
        const totals: Record<string, number> = {};
        eventExpenses.forEach(e => {
            totals[e.category] = (totals[e.category] || 0) + e.amount;
        });
        return Object.entries(totals)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [getEventExpenses]);

    // Selected event detail
    const selectedEvent = useMemo(() => {
        if (!selectedEventId) return null;
        return events.find(e => e.id === selectedEventId) || null;
    }, [events, selectedEventId]);

    const selectedEventExpenses = useMemo(() => {
        if (!selectedEventId) return [];
        return getEventExpenses(selectedEventId);
    }, [selectedEventId, getEventExpenses]);

    const selectedEventTotal = useMemo(() => {
        if (!selectedEventId) return 0;
        return getEventTotal(selectedEventId);
    }, [selectedEventId, getEventTotal]);

    const selectedEventBreakdown = useMemo(() => {
        if (!selectedEventId) return [];
        return getEventBreakdown(selectedEventId);
    }, [selectedEventId, getEventBreakdown]);

    // Active events (for expense dropdown)
    const activeEvents = useMemo(() => {
        return events.filter(e => e.status === 'active');
    }, [events]);

    // CRUD
    const handleAddEvent = async () => {
        if (!currentUser || !newEvent.name) return;

        const payload = {
            user_id: currentUser.id,
            name: newEvent.name,
            icon: newEvent.icon,
            budget: newEvent.budget ? parseFloat(newEvent.budget) : null,
            start_date: new Date(newEvent.start_date).toISOString(),
            end_date: newEvent.end_date ? new Date(newEvent.end_date).toISOString() : null,
            status: 'active' as const
        };

        if (editingEventId) {
            // Update existing event
            if (isOffline) {
                setEvents(events.map(e => e.id === editingEventId ? { ...e, ...payload } : e));
                addToQueue({ table: 'events', type: 'UPDATE', payload, matchField: 'id', matchValue: editingEventId });
                showToast(lang === 'id' ? 'Event diperbarui (Offline)' : 'Event updated (Offline)', 'update');
            } else {
                const { data } = await supabase.from('events').update(payload).eq('id', editingEventId).select();
                if (data) {
                    setEvents(events.map(e => e.id === editingEventId ? data[0] : e));
                    showToast(lang === 'id' ? 'Event diperbarui' : 'Event updated', 'update');
                }
            }
            setEditingEventId(null);
        } else {
            // Create new event
            if (isOffline) {
                const tempId = generateTempId();
                const newEvt: any = { id: tempId, ...payload, created_at: new Date().toISOString() };
                setEvents([newEvt, ...events]);
                addToQueue({ table: 'events', type: 'INSERT', payload, matchValue: tempId });
                showToast(lang === 'id' ? 'Event ditambahkan (Offline)' : 'Event added (Offline)', 'success');
            } else {
                const { data } = await supabase.from('events').insert([payload]).select();
                if (data) {
                    setEvents([data[0], ...events]);
                    showToast(lang === 'id' ? 'Event ditambahkan' : 'Event added', 'success');
                }
            }
        }

        setNewEvent({ name: '', icon: 'plane', budget: '', start_date: new Date().toISOString().split('T')[0], end_date: '' });
        setIsCreatingEvent(false);
    };

    const deleteEvent = async (id: string) => {
        if (!window.confirm(t.confirmDelete)) return;

        if (isOffline) {
            setEvents(events.filter(e => e.id !== id));
            addToQueue({ table: 'events', type: 'DELETE', matchField: 'id', matchValue: id, payload: {} });
            showToast(lang === 'id' ? 'Event dihapus (Offline)' : 'Event deleted (Offline)', 'delete');
        } else {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (!error) {
                setEvents(events.filter(e => e.id !== id));
                showToast(lang === 'id' ? 'Event dihapus' : 'Event deleted', 'delete');
            }
        }

        if (selectedEventId === id) setSelectedEventId(null);
    };

    const toggleEventComplete = async (id: string) => {
        const event = events.find(e => e.id === id);
        if (!event) return;

        const newStatus = event.status === 'active' ? 'completed' : 'active';

        if (isOffline) {
            setEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e));
            addToQueue({ table: 'events', type: 'UPDATE', payload: { status: newStatus }, matchField: 'id', matchValue: id });
            showToast(lang === 'id' ? (newStatus === 'completed' ? 'Event selesai (Offline)' : 'Event diaktifkan (Offline)') : (newStatus === 'completed' ? 'Event completed (Offline)' : 'Event reactivated (Offline)'), 'update');
        } else {
            const { data } = await supabase.from('events').update({ status: newStatus }).eq('id', id).select();
            if (data) {
                setEvents(events.map(e => e.id === id ? data[0] : e));
                showToast(lang === 'id' ? (newStatus === 'completed' ? 'Event selesai' : 'Event diaktifkan') : (newStatus === 'completed' ? 'Event completed' : 'Event reactivated'), 'update');
            }
        }
    };

    const startEditEvent = (event: FinanceEvent) => {
        setEditingEventId(event.id);
        setNewEvent({
            name: event.name,
            icon: event.icon,
            budget: event.budget?.toString() || '',
            start_date: event.start_date.split('T')[0],
            end_date: event.end_date ? event.end_date.split('T')[0] : ''
        });
        setIsCreatingEvent(true);
    };

    const cancelEditEvent = () => {
        setEditingEventId(null);
        setNewEvent({ name: '', icon: 'plane', budget: '', start_date: new Date().toISOString().split('T')[0], end_date: '' });
        setIsCreatingEvent(false);
    };

    return {
        // State
        isCreatingEvent, setIsCreatingEvent,
        eventFilter, setEventFilter,
        selectedEventId, setSelectedEventId,
        editingEventId, setEditingEventId,
        newEvent, setNewEvent,
        // Computed
        filteredEvents,
        activeEvents,
        selectedEvent,
        selectedEventExpenses,
        selectedEventTotal,
        selectedEventBreakdown,
        // Helpers
        getEventExpenses,
        getEventTotal,
        getEventBreakdown,
        // Actions
        handleAddEvent,
        deleteEvent,
        toggleEventComplete,
        startEditEvent,
        cancelEditEvent,
        // Context
        t,
        lang
    };
};

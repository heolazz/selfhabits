
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { translations } from '../constants/translations';

export const useJournal = () => {
    const { lang, currentUser, notes, setNotes } = useApp();
    const t = translations[lang];

    const [isMobileNoteEditing, setIsMobileNoteEditing] = useState(false);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');

    const handleNewNote = async () => {
        if (!currentUser) return;
        const { data } = await supabase.from('notes').insert([{
            user_id: currentUser.id,
            title: lang === 'id' ? 'Catatan Baru' : 'New Note',
            content: '',
            updated_at: new Date().toISOString()
        }]).select();
        if (data) {
            setNotes([data[0], ...notes]);
            setActiveNoteId(data[0].id);
            setNoteTitle(data[0].title);
            setNoteContent(data[0].content);
            setIsMobileNoteEditing(true);
        }
    };

    const handleSaveNote = async () => {
        if (!activeNoteId) return;
        const { data } = await supabase.from('notes').update({
            title: noteTitle,
            content: noteContent,
            updated_at: new Date().toISOString()
        }).eq('id', activeNoteId).select();
        if (data) {
            setNotes(notes.map(n => n.id === activeNoteId ? data[0] : n));
        }
    };

    const deleteNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t.confirmDelete) && !(await supabase.from('notes').delete().eq('id', id)).error) {
            setNotes(notes.filter(n => n.id !== id));
            if (activeNoteId === id) {
                setActiveNoteId(null);
                setNoteTitle('');
                setNoteContent('');
            }
        }
    };

    useEffect(() => {
        if (activeNoteId) {
            const note = notes.find(n => n.id === activeNoteId);
            if (note) {
                setNoteTitle(note.title);
                setNoteContent(note.content);
            }
        }
    }, [activeNoteId, notes]);

    return {
        notes,
        isMobileNoteEditing,
        setIsMobileNoteEditing,
        activeNoteId,
        setActiveNoteId,
        noteTitle,
        setNoteTitle,
        noteContent,
        setNoteContent,
        handleNewNote,
        handleSaveNote,
        deleteNote,
        t,
        lang
    };
};

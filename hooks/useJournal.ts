
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { translations } from '../constants/translations';
import { useToast } from '../components/Toast';
import { useSync, generateTempId } from './useSync';

export const useJournal = () => {
    const { lang, currentUser, notes, setNotes, isOffline } = useApp();
    const t = translations[lang];
    const { showToast } = useToast();
    const { addToQueue } = useSync();

    const [isMobileNoteEditing, setIsMobileNoteEditing] = useState(false);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');

    const handleNewNote = async () => {
        if (!currentUser) return;

        if (isOffline) {
            const tempId = generateTempId();
            const newNote: any = {
                id: tempId,
                user_id: currentUser.id,
                title: lang === 'id' ? 'Catatan Baru (Offline)' : 'New Note (Offline)',
                content: '',
                updated_at: new Date().toISOString()
            };
            setNotes([newNote, ...notes]);
            setActiveNoteId(tempId);
            setNoteTitle(newNote.title);
            setNoteContent('');
            setIsMobileNoteEditing(true);
            addToQueue({
                table: 'notes',
                type: 'INSERT',
                payload: { user_id: currentUser.id, title: newNote.title, content: '', updated_at: newNote.updated_at },
                matchValue: tempId
            });
            showToast(lang === 'id' ? 'Catatan offline dibuat' : 'Offline note created', 'success');
            return;
        }

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
            showToast(lang === 'id' ? 'Catatan baru dibuat' : 'New note created', 'success');
        }
    };

    const handleSaveNote = async () => {
        if (!activeNoteId) return;

        if (isOffline) {
            const updatedNotes = notes.map(n => n.id === activeNoteId ? { ...n, title: noteTitle, content: noteContent, updated_at: new Date().toISOString() } : n);
            setNotes(updatedNotes);
            addToQueue({
                table: 'notes',
                type: 'UPDATE',
                payload: { title: noteTitle, content: noteContent, updated_at: new Date().toISOString() },
                matchField: 'id',
                matchValue: activeNoteId
            });
            showToast(lang === 'id' ? 'Disimpan offline' : 'Saved offline', 'info');
            return;
        }

        const { data } = await supabase.from('notes').update({
            title: noteTitle,
            content: noteContent,
            updated_at: new Date().toISOString()
        }).eq('id', activeNoteId).select();
        if (data) {
            setNotes(notes.map(n => n.id === activeNoteId ? data[0] : n));
            showToast(lang === 'id' ? 'Catatan disimpan' : 'Note saved', 'cloud', 1800);
        }
    };

    const deleteNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (isOffline) {
            if (window.confirm(t.confirmDelete)) {
                setNotes(notes.filter(n => n.id !== id));
                if (activeNoteId === id) {
                    setActiveNoteId(null);
                    setNoteTitle('');
                    setNoteContent('');
                }
                addToQueue({ table: 'notes', type: 'DELETE', matchField: 'id', matchValue: id, payload: {} });
                showToast(lang === 'id' ? 'Catatan dihapus (Offline)' : 'Note deleted (Offline)', 'delete');
            }
            return;
        }

        if (window.confirm(t.confirmDelete) && !(await supabase.from('notes').delete().eq('id', id)).error) {
            setNotes(notes.filter(n => n.id !== id));
            if (activeNoteId === id) {
                setActiveNoteId(null);
                setNoteTitle('');
                setNoteContent('');
            }
            showToast(lang === 'id' ? 'Catatan dihapus' : 'Note deleted', 'delete');
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

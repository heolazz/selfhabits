
import React from 'react';
import {
    Plus, Check, Trash2, Calendar, ArrowLeft
} from 'lucide-react';
import { useJournal } from '../hooks/useJournal';

export const Journal = () => {
    const {
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
    } = useJournal();

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 fade-in">
            <div className={`md:w-1/3 flex flex-col h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden ${isMobileNoteEditing ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--bg-card)] z-10 backdrop-blur-md">
                    <h3 className="font-bold text-lg text-[var(--text-main)] tracking-tight">{lang === 'id' ? 'Jurnal' : 'Journal'}</h3>
                    <button onClick={handleNewNote} className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm"><Plus size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {notes.map(note => (
                        <div key={note.id} onClick={() => { setActiveNoteId(note.id); setIsMobileNoteEditing(true); }} className={`p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:bg-[var(--bg-input)] group ${activeNoteId === note.id ? 'bg-[var(--bg-input)] border-[var(--border)] shadow-sm' : ''}`}>
                            <div className="flex justify-between items-center mb-1">
                                <h4 className={`font-semibold text-sm truncate pr-2 ${activeNoteId === note.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}`}>{note.title || (lang === 'id' ? 'Tanpa Judul' : 'Untitled')}</h4>
                                <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{new Date(note.updated_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{note.content || (lang === 'id' ? 'Tidak ada konten tambahan' : 'No additional content')}</p>
                            <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => deleteNote(note.id, e)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] rounded-md hover:bg-[var(--bg-card)] transition-colors"><Trash2 size={12} /></button>
                            </div>
                        </div>
                    ))}
                    {notes.length === 0 && <div className="p-8 text-center text-[var(--text-muted)] text-xs">{lang === 'id' ? 'Belum ada catatan' : 'No notes yet'}</div>}
                </div>
            </div>

            <div className={`flex-1 flex flex-col bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] h-full overflow-hidden shadow-sm relative ${!isMobileNoteEditing ? 'hidden md:flex' : 'flex'}`}>
                {activeNoteId ? (
                    <>
                        <div className="toolbar p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card)]">
                            <div className="flex items-center gap-3 w-full">
                                <button onClick={() => setIsMobileNoteEditing(false)} className="md:hidden p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"><ArrowLeft size={20} /></button>
                                <input className="text-lg font-bold bg-transparent outline-none w-full text-[var(--text-main)] placeholder-[var(--text-muted)]/50" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder={lang === 'id' ? 'Judul Catatan...' : 'Note Title...'} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[var(--text-muted)] hidden sm:block mr-2 uppercase font-bold tracking-wider">{lang === 'id' ? 'TERAKHIR DIUBAH' : 'LAST EDITED'} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <button onClick={handleSaveNote} className="bg-[var(--success)] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors shadow-sm active:scale-95 flex items-center gap-1.5"><Check size={14} /> {t.save}</button>
                            </div>
                        </div>
                        <textarea className="flex-1 w-full p-6 bg-transparent outline-none resize-none text-sm leading-7 text-[var(--text-main)] placeholder-[var(--text-muted)]/40 custom-scrollbar" value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder={lang === 'id' ? 'Tulis sesuatu yang menginspirasi...' : 'Write something inspiring...'} spellCheck={false} />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-6 text-center">
                        <div className="w-16 h-16 bg-[var(--bg-input)] rounded-full flex items-center justify-center mb-4 text-[var(--text-muted)]/50"><Calendar size={32} /></div>
                        <p className="text-sm font-medium">{lang === 'id' ? 'Pilih catatan atau buat baru' : 'Select a note or create a new one'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

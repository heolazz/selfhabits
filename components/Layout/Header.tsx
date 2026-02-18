
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { translations } from '../../constants/translations';

export const Header = () => {
    const { lang, theme, setTheme, currentUser } = useApp();
    const t = translations[lang];
    const location = useLocation();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t.hello;
        if (hour < 18) return t.helloAfternoon;
        return t.helloEvening;
    }

    const getTitle = () => {
        const p = location.pathname;
        if (p === '/') return `${getGreeting()}, ${currentUser?.user_metadata?.full_name?.split(' ')[0]}`;
        if (p.startsWith('/finance')) return t.wallet;
        if (p.startsWith('/habits')) return t.habits;
        if (p.startsWith('/journal')) return t.journal;
        if (p.startsWith('/settings')) return t.account;
        return 'Zenith';
    };

    return (
        <header className="py-6 md:py-10 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">
                    {getTitle()}
                </h2>
                <p className="text-[var(--text-muted)] text-[13px] font-medium mt-1">
                    {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-[var(--text-main)] hover:bg-[var(--bg-sidebar)] transition-colors">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
        </header>
    );
};

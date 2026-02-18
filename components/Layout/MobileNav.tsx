
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Wallet, CheckCircle2, Pencil, User as UserIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { translations } from '../../constants/translations';

export const MobileNav = () => {
    const { lang } = useApp();
    const t = translations[lang];
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { id: 'dashboard', path: '/dashboard', label: t.overview, icon: <LayoutGrid /> },
        { id: 'finance', path: '/finance', label: t.wallet, icon: <Wallet /> },
        { id: 'habits', path: '/habits', label: t.habits, icon: <CheckCircle2 /> },
        { id: 'notes', path: '/journal', label: t.journal, icon: <Pencil /> },
        { id: 'settings', path: '/settings', label: t.account, icon: <UserIcon /> }
    ];


    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[88px] glass-nav flex justify-around items-start pt-3 px-6 z-50 transition-all duration-500">
            {navItems.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => navigate(tab.path)}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${isActive(tab.path) ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
                >
                    {React.cloneElement(tab.icon as any, { size: 24, strokeWidth: isActive(tab.path) ? 2.5 : 2, className: isActive(tab.path) ? 'scale-110 transition-transform' : '' })}
                    <span className="text-[10px] mt-2 font-semibold tracking-tight">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};

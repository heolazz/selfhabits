
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Wallet, CheckCircle2, Pencil, LogOut, User as UserIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { translations } from '../../constants/translations';

export const Sidebar = () => {
    const { lang, currentUser, handleLogout } = useApp();
    const { theme } = useApp();
    const t = translations[lang];
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', label: t.overview, icon: <LayoutGrid size={18} /> },
        { path: '/finance', label: t.wallet, icon: <Wallet size={18} /> },
        { path: '/habits', label: t.habits, icon: <CheckCircle2 size={18} /> },
        { path: '/journal', label: t.journal, icon: <Pencil size={18} /> }
    ];


    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="hidden md:flex w-[260px] bg-[var(--bg-sidebar)] border-r border-[var(--border)] fixed h-full flex-col p-6 z-50">
            <div className="mb-10 px-2 mt-4">
                <h1 className="text-3xl font-extrabold tracking-tighter text-[var(--text-main)]">Zenith<span className="text-[var(--primary)]">.</span></h1>
            </div>
            <nav className="space-y-1.5 flex-1">
                {menuItems.map(item => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-xl w-full transition-all duration-200 ${isActive(item.path) ? 'bg-[var(--bg-body)] text-[var(--primary)] font-semibold shadow-sm border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[rgba(0,0,0,0.03)]'}`}
                    >
                        <span className={isActive(item.path) ? 'text-[var(--primary)]' : ''}>{item.icon}</span>
                        <span className="text-[14px]">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="pt-6 border-t border-[rgba(0,0,0,0.05)]">
                <button onClick={() => navigate('/settings')} className={`flex items-center space-x-3 w-full px-3 py-2 mb-2 rounded-xl hover:bg-[rgba(0,0,0,0.03)] transition-colors group ${isActive('/settings') ? 'bg-[var(--bg-body)] border border-[var(--border)]' : ''}`}>
                    {currentUser?.user_metadata?.avatar_url ? (
                        <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--text-main)] flex items-center justify-center text-[var(--bg-body)] font-bold text-xs">{currentUser?.user_metadata?.full_name?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}</div>
                    )}
                    <div className="flex-1 overflow-hidden text-left">
                        <p className="text-[13px] font-semibold truncate text-[var(--text-main)]">{currentUser?.user_metadata?.full_name || 'User'}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{t.account}</p>
                    </div>
                </button>
                <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-4 py-2 text-[var(--text-muted)] hover:text-[var(--danger)] text-sm font-medium transition-colors"><LogOut size={16} /><span>{t.signOut}</span></button>
            </div>
        </aside>
    );
};


import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { useApp } from '../../contexts/AppContext';
import { WifiOff } from 'lucide-react';

interface AppLayoutProps {
    children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { isOffline, lang } = useApp();

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg-body)] text-[var(--text-main)] transition-colors duration-500">
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 h-8 bg-[var(--danger)] text-white text-xs font-bold flex items-center justify-center gap-2 z-[9999] shadow-md animate-slide-down">
                    <WifiOff size={14} />
                    {lang === 'id' ? 'Mode Offline — Perubahan disimpan lokal' : 'Offline Mode — Changes saved locally'}
                </div>
            )}
            <Sidebar />
            <main className={`flex-1 md:ml-[260px] pb-24 md:pb-12 px-4 md:px-12 w-full max-w-[1280px] ${isOffline ? 'pt-12' : 'pt-safe'}`}>
                <Header />
                {children}
            </main>
            <MobileNav />
        </div>
    );
};

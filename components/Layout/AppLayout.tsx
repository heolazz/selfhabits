
import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';

interface AppLayoutProps {
    children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg-body)] text-[var(--text-main)] transition-colors duration-500">
            <Sidebar />
            <main className="flex-1 md:ml-[260px] pb-24 md:pb-12 pt-safe px-4 md:px-12 w-full max-w-[1280px]">
                <Header />
                {children}
            </main>
            <MobileNav />
        </div>
    );
};

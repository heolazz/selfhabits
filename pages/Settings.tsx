
import React from 'react';
import {
    Smartphone, Moon, Sun, LogOut, Download, Languages, ChevronRight
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../constants/translations';
import { supabase } from '../services/supabaseClient';

// Add global types if needed for window.deferredPrompt
declare global {
    interface Window {
        deferredPrompt: any;
    }
}

export const Settings = () => {
    const { lang, setLang, theme, setTheme, currentUser } = useApp();
    const t = translations[lang];

    const handleInstallPWA = () => {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                window.deferredPrompt = null;
            });
        } else {
            // Check if it's iOS
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            if (isIOS) {
                alert(lang === 'id'
                    ? 'Di iPhone/iPad: Tekan tombol "Share" (kotak dengan panah ke atas) di bawah Safari, lalu pilih "Add to Home Screen".'
                    : 'On iOS/iPadOS: Tap the "Share" button at the bottom of Safari and select "Add to Home Screen".');
            } else {
                alert(lang === 'id'
                    ? 'Aplikasi sudah terinstal atau browser Anda tidak mendukung instalasi otomatis. Gunakan menu browser "Tambahkan ke layar utama".'
                    : 'App already installed or your browser doesn\'t support automatic installation. Use browser menu "Add to home screen".');
            }
        }
    };

    // Check if the app is already installed/running in standalone mode
    const [isStandalone, setIsStandalone] = React.useState(false);

    React.useEffect(() => {
        const checkStandalone = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
                || (navigator as any).standalone
                || document.referrer.includes('android-app://');
            setIsStandalone(isStandaloneMode);
        };

        checkStandalone();
        // Also listen for change (e.g. if user installs while app is open)
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        mediaQuery.addEventListener('change', checkStandalone);
        return () => mediaQuery.removeEventListener('change', checkStandalone);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 fade-in py-6">
            {/* Profile Header */}
            <div className="px-1 text-center mb-10">
                {currentUser?.user_metadata?.avatar_url ? (
                    <img src={currentUser.user_metadata.avatar_url} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-[var(--bg-card)] shadow-sm" />
                ) : (
                    <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center text-zinc-900 dark:text-zinc-100 text-3xl font-bold border border-zinc-200 dark:border-zinc-700">
                        {currentUser?.email?.[0].toUpperCase()}
                    </div>
                )}
                <h3 className="text-2xl font-bold text-[var(--text-main)] mb-1">{currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0]}</h3>
                <p className="text-sm text-zinc-500 font-medium">{currentUser?.email}</p>
            </div>

            {/* Premium Install Banner (Hidden if already standalone) */}
            {!isStandalone && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white shadow-sm text-left animate-in fade-in zoom-in duration-500">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/30 backdrop-blur-sm shrink-0">
                                <item className="animate-bounce">
                                    <Smartphone size={24} />
                                </item>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">Install App</h3>
                                <p className="text-[13px] text-blue-50/90 font-medium">Add to Home Screen for the best experience</p>
                            </div>
                        </div>
                        <button
                            onClick={handleInstallPWA}
                            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-600 shadow-sm transition-transform active:scale-95 hover:bg-blue-50 shrink-0 text-sm"
                        >
                            <Download size={18} />
                            Install Now
                        </button>
                    </div>
                </div>
            )}


            {/* Settings List Card */}
            <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-sm overflow-hidden divide-y divide-[var(--border)]">
                {/* Language Item */}
                <div className="p-6 md:px-8 flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors group cursor-pointer relative overflow-hidden">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-[var(--text-main)] transition-colors group-hover:bg-[var(--bg-card)]">
                            <Languages size={20} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-base font-bold text-[var(--text-main)] tracking-tight">Language</span>
                            <span className="text-xs font-medium text-zinc-500">{lang === 'id' ? 'Indonesia' : 'English'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            value={lang}
                            onChange={e => setLang(e.target.value as any)}
                        >
                            <option value="en">English (US)</option>
                            <option value="id">Indonesia</option>
                        </select>
                        <ChevronRight size={18} className="text-zinc-400" />
                    </div>
                </div>

                {/* Appearance Item */}
                <div
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-6 md:px-8 flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors group cursor-pointer"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-[var(--text-main)] transition-colors group-hover:bg-[var(--bg-card)]">
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-base font-bold text-[var(--text-main)] tracking-tight">Appearance</span>
                            <span className="text-xs font-medium text-zinc-500">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-zinc-400" />
                </div>
            </div>

            {/* Logout Section */}
            <div className="pt-4 flex justify-center">
                <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-600 font-bold text-sm transition-colors py-4"
                >
                    Sign Out
                </button>
            </div>

            <p className="text-center text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-4 opacity-40">
                Zenith v1.2.0 • Build 2026
            </p>
        </div>
    );
};

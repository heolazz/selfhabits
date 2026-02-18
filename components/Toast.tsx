import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Check, AlertCircle, Cloud, Trash2, X, Info, Pencil } from 'lucide-react';

// --- Types ---
type ToastType = 'success' | 'error' | 'info' | 'cloud' | 'delete' | 'update';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

// --- Context ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

// --- Single Toast Item ---
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const duration = toast.duration || 2500;
        const exitTimer = setTimeout(() => setIsExiting(true), duration - 300);
        const removeTimer = setTimeout(() => onDismiss(toast.id), duration);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast, onDismiss]);

    const icons: Record<ToastType, React.ReactNode> = {
        success: <Check size={16} />,
        error: <AlertCircle size={16} />,
        info: <Info size={16} />,
        cloud: <Cloud size={16} />,
        delete: <Trash2 size={16} />,
        update: <Check size={16} /> // Or Pencil, but Check implies "Updated/Done" nicely
    };

    const colors: Record<ToastType, string> = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        cloud: 'bg-sky-500',
        delete: 'bg-rose-500',
        update: 'bg-amber-500' // Or blue/primary
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-xl text-white text-sm font-semibold pointer-events-auto transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
            style={{
                background: 'rgba(30, 30, 30, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <div className={`w-7 h-7 rounded-full ${colors[toast.type]} flex items-center justify-center flex-shrink-0 shadow-md`}>
                {icons[toast.type]}
            </div>
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
                onClick={() => { setIsExiting(true); setTimeout(() => onDismiss(toast.id), 200); }}
                className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
};

// --- Provider ---
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 2500) => {
        const id = Date.now().toString() + Math.random().toString(36).slice(2);
        setToasts(prev => [...prev.slice(-4), { id, message, type, duration }]); // max 5 toasts
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container - Fixed at bottom center */}
            <div
                className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm"
            >
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

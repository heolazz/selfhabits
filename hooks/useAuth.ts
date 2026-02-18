
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';

export const useAuth = () => {
    const { lang } = useApp();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) setError(error.message);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        } else {
            const { error } = await supabase.auth.signUp({
                email, password, options: { data: { full_name: name } }
            });
            if (error) setError(error.message);
            else alert(lang === 'id' ? 'Cek email Anda untuk verifikasi!' : 'Check email for verification!');
        }
        setLoading(false);
    };

    return {
        isLogin, setIsLogin,
        email, setEmail,
        password, setPassword,
        name, setName,
        error, setError,
        loading,
        handleGoogleLogin,
        handleSubmit,
        lang
    };
};

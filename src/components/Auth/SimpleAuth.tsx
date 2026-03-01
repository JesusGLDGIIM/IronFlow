import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, AlertCircle, Mail, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SimpleAuthProps {
  children: React.ReactNode;
}

/**
 * Supabase Authentication layer.
 * Handles login and registration.
 */
export const SimpleAuth: React.FC<SimpleAuthProps> = ({ children }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-red-500/20 p-8 rounded-[2.5rem] shadow-2xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-4">Configuración Requerida</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Para que IronFlow funcione, necesitas configurar las variables de entorno de Supabase en el panel de control.
          </p>
          <div className="bg-black/40 rounded-2xl p-4 text-left font-mono text-xs text-zinc-500 space-y-2 mb-6 border border-white/5">
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
            Consulta la documentación para más detalles.
          </p>
        </div>
      </div>
    );
  }

  if (loading && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-900/20 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-500/20">
              <Lock className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">IronFlow</h1>
            <p className="text-zinc-400 text-sm font-medium">
              {isRegistering ? 'Crea tu cuenta personal' : 'Acceso restringido. Inicia sesión.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1 text-red-500 text-[10px] font-bold uppercase tracking-wider"
                >
                  <AlertCircle className="w-3 h-3" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isRegistering ? 'Registrarse' : 'Entrar'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-brand-500 text-sm font-bold hover:underline"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              IronFlow &copy; 2026 • Private Access
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React from 'react';
import { Dumbbell, Calendar as CalendarIcon, Settings, BarChart3, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ViewState } from '../../types';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
  view: ViewState;
  setView: (view: ViewState) => void;
}

/**
 * Main application header with navigation.
 */
export const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-zinc-200 px-4 md:px-6 py-3 md:py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Dumbbell className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 leading-none">IronFlow</h1>
              <p className="text-[8px] md:text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Entrenamiento Inteligente</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="md:hidden p-2 text-zinc-400 hover:text-red-500 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <nav className="flex items-center bg-zinc-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setView('schedule')}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all whitespace-nowrap",
                view === 'schedule' ? "bg-white text-brand-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Planificador
            </button>
            <button
              onClick={() => setView('config')}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all whitespace-nowrap",
                view === 'config' ? "bg-white text-brand-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Rutinas
            </button>
            <button
              onClick={() => setView('stats')}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-all whitespace-nowrap",
                view === 'stats' ? "bg-white text-brand-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Estadísticas
            </button>
          </nav>

          <button 
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
};

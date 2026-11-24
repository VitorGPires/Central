import React, { useEffect, useState } from 'react';
import {
  Brain,
  Calendar,
  CheckSquare,
  FireFlame as Flame,
  Dashboard as LayoutDashboard,
  HalfMoon as Moon,
  Pause,
  Play,
  Plus,
  RefreshDouble as RotateCcw,
  Sparks as Sparkles,
  SunLight as Sun,
  Timer,
  Wallet,
  Xmark as X,
} from 'iconoir-react';
import { useApp } from '../context/AppContext';
import { TODAY } from '../data/seedData';
import type { ModuleId } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenProfile: () => void;
}

const navItems: {
  id: ModuleId;
  label: string;
  shortcut: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
}[] = [
  { id: 'dashboard', label: 'Início', shortcut: '1', icon: LayoutDashboard, accent: '#D47B24' },
  { id: 'tasks', label: 'Tarefas', shortcut: '2', icon: CheckSquare, accent: '#273D29' },
  { id: 'habits', label: 'Hábitos', shortcut: '3', icon: Flame, accent: '#D47B24' },
  { id: 'brain', label: 'Segundo cérebro', shortcut: '4', icon: Brain, accent: '#8A5A44' },
  { id: 'finance', label: 'Financeiro', shortcut: '5', icon: Wallet, accent: '#273D29' },
  { id: 'calendar', label: 'Agenda', shortcut: '6', icon: Calendar, accent: '#466685' },
  { id: 'content', label: 'Conteúdo', shortcut: '7', icon: Sparkles, accent: '#B54E2F' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  onOpenProfile,
}) => {
  const {
    activeModule,
    setActiveModule,
    darkMode,
    toggleDarkMode,
    tasks,
    user,
    setQuickAction,
  } = useApp();

  // Integrated Focus Timer (25:00 Pomodoro)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const pendingTasksCount = tasks.filter(
    (t) => t.status !== 'concluida' && t.dueDate <= TODAY
  ).length;

  const content = (
    <aside
      className="flex flex-col h-full w-[252px] shrink-0 select-none px-4 py-5 border lg:rounded-[26px]"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-hairline)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Subtle Editorial Top Header */}
      <div className="flex items-center justify-between mb-5 px-1.5">
        <button
          onClick={() => {
            setActiveModule('dashboard');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer border-0 bg-transparent p-0"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ backgroundColor: 'var(--accent-forest)', color: '#F7F3EA' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 2C9.5 5 7 8 7 11.5C7 14.5 9 16.8 11.2 17.6V21H12.8V17.6C15 16.8 17 14.5 17 11.5C17 8 14.5 5 12 2ZM12 5.4C13.6 7.5 15 9.6 15 11.5C15 13.4 13.7 15 12 15.6C10.3 15 9 13.4 9 11.5C9 9.6 10.4 7.5 12 5.4Z" />
            </svg>
          </div>
          <div className="leading-none">
            <span
              className="font-serif-display text-[24px] tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Minha
            </span>
            <span
              className="font-serif-display italic text-[24px] tracking-tight"
              style={{ color: 'var(--accent-ochre)' }}
            >
              central
            </span>
          </div>
        </button>

        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 border-0 bg-transparent cursor-pointer"
          aria-label="Fechar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tactile Action Strip: Avatar + Theme + Quick Capture */}
      <div className="flex items-center gap-2 mb-6 px-1">
        <button
          onClick={onOpenProfile}
          title="Personalizar nome e perfil"
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border transition-transform hover:scale-105 cursor-pointer"
          style={{
            backgroundColor: 'var(--accent-ochre-soft)',
            borderColor: 'var(--accent-ochre)',
            color: 'var(--accent-ochre)',
          }}
        >
          {user.avatarInitials}
        </button>

        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-secondary)',
          }}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setQuickAction('task')}
          title="Captura rápida"
          className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold border-0 transition-all hover:opacity-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--accent-forest)',
            color: '#F7F3EA',
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Criar</span>
        </button>
      </div>

      {/* Section Label */}
      <div className="mb-2 px-2.5 flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Espaço
        </span>
        <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Teclas 1–7
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                onCloseMobile();
              }}
              className="w-full group flex items-center justify-between px-3 py-2.5 rounded-2xl text-[13.5px] font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--bg-card)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: active ? 'var(--shadow-card)' : 'none',
                border: active
                  ? '1px solid var(--border-hairline)'
                  : '1px solid transparent',
              }}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className="w-[16px] h-[16px] transition-transform group-hover:scale-105"
                  style={{ color: active ? item.accent : 'var(--text-muted)' }}
                />
                <span>{item.label}</span>
              </span>
              {item.id === 'tasks' && pendingTasksCount > 0 ? (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white tabular-nums"
                  style={{ backgroundColor: 'var(--accent-ochre)' }}
                >
                  {pendingTasksCount}
                </span>
              ) : (
                <span
                  className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Signature Focus Timer Widget */}
      <div
        className="mt-4 p-3.5 rounded-2xl border space-y-2.5"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.14em] flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <Timer className="w-3.5 h-3.5" style={{ color: 'var(--accent-ochre)' }} />
            Modo Foco
          </span>
          <span className="font-serif-display text-xl leading-none tabular-nums">
            {mins}:{secs}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTimerRunning((r) => !r)}
            className="flex-1 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 border-0 cursor-pointer transition-opacity hover:opacity-90"
            style={{
              backgroundColor: timerRunning ? 'var(--accent-ochre)' : 'var(--accent-forest)',
              color: '#F7F3EA',
            }}
          >
            {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {timerRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTimerRunning(false);
              setSecondsLeft(25 * 60);
            }}
            className="p-1.5 rounded-xl border cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-muted)',
            }}
            title="Reiniciar timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compact User Footer */}
      <button
        onClick={onOpenProfile}
        className="mt-2.5 px-2.5 py-2 rounded-xl flex items-center justify-between text-left cursor-pointer border-0 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {user.name}
          </p>
          <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
            {user.role}
          </p>
        </div>
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: 'var(--accent-sage)' }}
          title="Salvo localmente"
        />
      </button>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block h-screen sticky top-0 p-3 pr-0">{content}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
};

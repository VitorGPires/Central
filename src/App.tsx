import React, { useEffect, useState } from 'react';
import {
  Bell,
  HalfMoon as Moon,
  IconoirProvider,
  Plus,
  Search,
  Sparks as Sparkles,
  SunLight as Sun,
} from 'iconoir-react';
import { Button } from './components/Button';
import {
  AlertsModal,
  GlobalSearchModal,
  ProfileModal,
  QuickActionModal,
} from './components/QuickModals';
import { AppProvider, useApp } from './context/AppContext';
import { TODAY } from './data/seedData';
import { CalendarModule } from './modules/CalendarModule';
import { ContentModule } from './modules/ContentModule';
import { DashboardHome } from './modules/DashboardHome';
import { FinanceModule } from './modules/FinanceModule';
import { HabitsModule } from './modules/HabitsModule';
import { SecondBrainModule } from './modules/SecondBrainModule';
import { TasksModule } from './modules/TasksModule';
import type { ModuleId } from './types';

export const MODULE_TABS: { id: ModuleId; label: string; shortcut: string }[] = [
  { id: 'dashboard', label: 'Início', shortcut: '1' },
  { id: 'tasks', label: 'Tarefas', shortcut: '2' },
  { id: 'habits', label: 'Hábitos', shortcut: '3' },
  { id: 'brain', label: 'Segundo Cérebro', shortcut: '4' },
  { id: 'finance', label: 'Financeiro', shortcut: '5' },
  { id: 'calendar', label: 'Agenda', shortcut: '6' },
  { id: 'content', label: 'Conteúdo', shortcut: '7' },
];

const MODULE_SHORTCUTS: Record<string, ModuleId> = Object.fromEntries(
  MODULE_TABS.map((t) => [t.shortcut, t.id])
);

const AppShell: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    darkMode,
    toggleDarkMode,
    setQuickAction,
    user,
    tasks,
    transactions,
    budgets,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setAlertsOpen(false);
        setProfileOpen(false);
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!e.ctrlKey && !e.metaKey && !e.altKey && MODULE_SHORTCUTS[e.key]) {
        setActiveModule(MODULE_SHORTCUTS[e.key]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActiveModule]);

  const overdueCount = tasks.filter(
    (t) => t.status !== 'concluida' && t.dueDate < TODAY
  ).length;
  const pendingTodayCount = tasks.filter(
    (t) => t.status !== 'concluida' && t.dueDate <= TODAY
  ).length;
  const pendingBillsCount = transactions.filter(
    (t) => t.type === 'despesa' && t.status === 'pendente'
  ).length;
  const overBudgetCount = budgets.filter((b) => {
    const spent = transactions
      .filter((t) => t.type === 'despesa' && t.category === b.category)
      .reduce((acc, t) => acc + t.amount, 0);
    return spent > b.budget;
  }).length;
  const totalAlerts = overdueCount + pendingBillsCount + overBudgetCount;

  const renderModule = () => {
    switch (activeModule) {
      case 'tasks':
        return <TasksModule />;
      case 'habits':
        return <HabitsModule />;
      case 'brain':
        return <SecondBrainModule />;
      case 'finance':
        return <FinanceModule />;
      case 'calendar':
        return <CalendarModule />;
      case 'content':
        return <ContentModule />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      {/* Top Bar */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md bg-[var(--bg-canvas)]/90"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <button
            onClick={() => setActiveModule('dashboard')}
            className="flex items-center gap-2.5 border-0 bg-transparent p-0 cursor-pointer group"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--accent-violet)' }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[17px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Minha<span style={{ color: 'var(--accent-violet)' }}>Central</span>
            </span>
          </button>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-muted)',
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd
                className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] border"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                Ctrl K
              </kbd>
            </button>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setQuickAction('task')}
            >
              <span className="hidden sm:inline">Criar</span>
            </Button>

            <button
              onClick={() => setAlertsOpen(true)}
              className="relative w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)',
              }}
              aria-label="Alertas"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center tabular-nums"
                  style={{ backgroundColor: 'var(--accent-violet)' }}
                >
                  {totalAlerts}
                </span>
              )}
            </button>

            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)',
              }}
              aria-label="Alternar tema"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setProfileOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border cursor-pointer"
              style={{
                backgroundColor: 'var(--accent-violet-soft)',
                borderColor: 'var(--accent-violet)',
                color: 'var(--accent-violet)',
              }}
              title="Editar perfil"
            >
              {user.avatarInitials}
            </button>
          </div>
        </div>
      </header>

      {/* Signature Centered Lavender Segmented Navigation Pill Bar (Matching Reference!) */}
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="overflow-x-auto pb-1">
          <nav
            className="flex items-center justify-between gap-1 p-1.5 rounded-2xl min-w-max mx-auto"
            style={{ backgroundColor: 'var(--bg-surface)' }}
            aria-label="Navegação principal"
          >
            {MODULE_TABS.map((tab) => {
              const active = activeModule === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveModule(tab.id)}
                  className="relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all cursor-pointer border-0"
                  style={{
                    backgroundColor: active ? 'var(--bg-card)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: active ? '0 2px 10px rgba(20, 18, 36, 0.08)' : 'none',
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'tasks' && pendingTodayCount > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white tabular-nums"
                      style={{ backgroundColor: 'var(--accent-violet)' }}
                    >
                      {pendingTodayCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-5 pb-12">
        {renderModule()}
      </main>

      {/* Global Interactive Modals */}
      <QuickActionModal />
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AlertsModal open={alertsOpen} onClose={() => setAlertsOpen(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <IconoirProvider
      iconProps={{
        strokeWidth: 1.6,
      }}
    >
      <AppProvider>
        <AppShell />
      </AppProvider>
    </IconoirProvider>
  );
}

export default App;

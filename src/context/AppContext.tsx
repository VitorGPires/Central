import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  TODAY,
  initialAccounts,
  initialBudgets,
  initialContents,
  initialDailyMetrics,
  initialEvents,
  initialGoals,
  initialHabits,
  initialMoods,
  initialNotes,
  initialPlatformFollowers,
  initialProjects,
  initialTasks,
  initialTransactions,
  initialUser,
} from '../data/seedData';
import type {
  BrainNote,
  CalendarEvent,
  CategoryBudget,
  ContentItem,
  ContentMetrics,
  FinanceAccount,
  FinancialGoal,
  Habit,
  ModuleId,
  MoodEntry,
  PlatformFollowerStat,
  Project,
  SocialDailyMetric,
  Task,
  Transaction,
  UserProfile,
} from '../types';
import { sanitizeHttpUrl } from '../utils/url';

interface AppState {
  user: UserProfile;
  projects: Project[];
  tasks: Task[];
  habits: Habit[];
  moods: MoodEntry[];
  notes: BrainNote[];
  accounts: FinanceAccount[];
  transactions: Transaction[];
  budgets: CategoryBudget[];
  goals: FinancialGoal[];
  events: CalendarEvent[];
  contents: ContentItem[];
  dailyMetrics: SocialDailyMetric[];
  platformFollowers: PlatformFollowerStat[];
}

interface AppContextValue extends AppState {
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  quickAction: 'task' | 'expense' | 'event' | 'note' | 'content' | null;
  setQuickAction: (a: 'task' | 'expense' | 'event' | 'note' | 'content' | null) => void;
  updateUser: (u: Partial<UserProfile>) => void;
  addProject: (p: Omit<Project, 'id'>) => void;
  // Tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  // Habits & Mental Health
  addHabit: (h: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => void;
  updateHabit: (id: string, patch: Partial<Omit<Habit, 'id' | 'completedDates' | 'streak'>>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (habitId: string, date: string) => void;
  saveMood: (entry: MoodEntry) => void;
  deleteMood: (date: string) => void;
  // Second Brain
  addNote: (n: Omit<BrainNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, patch: Partial<BrainNote>) => void;
  deleteNote: (id: string) => void;
  // Finance
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (a: Omit<FinanceAccount, 'id'>) => void;
  deleteAccount: (id: string) => void;
  addBudget: (b: CategoryBudget) => void;
  deleteBudget: (category: string) => void;
  addGoal: (g: Omit<FinancialGoal, 'id'>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, delta: number) => void;
  // Calendar
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  // Content & Analytics
  addContent: (c: Omit<ContentItem, 'id'>) => void;
  updateContent: (id: string, patch: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  updateContentMetrics: (id: string, metrics: ContentMetrics) => void;
  generateTasksFromContent: (contentId: string) => void;
  addDailyMetric: (m: SocialDailyMetric) => void;
  upsertPlatformFollower: (stat: PlatformFollowerStat) => void;
  // Reset
  resetAllData: () => void;
}

const STORAGE_KEY = 'minhacentral_state_v2';
const LEGACY_STORAGE_KEY = 'centralpinhal_state_v1';

const defaultState: AppState = {
  user: initialUser,
  projects: initialProjects,
  tasks: initialTasks,
  habits: initialHabits,
  moods: initialMoods,
  notes: initialNotes,
  accounts: initialAccounts,
  transactions: initialTransactions,
  budgets: initialBudgets,
  goals: initialGoals,
  events: initialEvents,
  contents: initialContents,
  dailyMetrics: initialDailyMetrics,
  platformFollowers: initialPlatformFollowers,
};

const AppContext = createContext<AppContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function calcStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date(`${TODAY}T12:00:00`);
  if (!set.has(TODAY)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (set.has(iso)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function hydrateState(raw: string): AppState {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') return defaultState;
  const notes = Array.isArray(parsed.notes)
    ? parsed.notes.map((n: BrainNote) => ({ ...n, url: sanitizeHttpUrl(n.url) }))
    : [];
  const contents = Array.isArray(parsed.contents)
    ? parsed.contents.map((c: ContentItem) => ({
        ...c,
        assetLink: sanitizeHttpUrl(c.assetLink),
      }))
    : [];
  return {
    user: parsed.user && typeof parsed.user === 'object' ? { ...initialUser, ...parsed.user } : initialUser,
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    habits: Array.isArray(parsed.habits) ? parsed.habits : [],
    moods: Array.isArray(parsed.moods) ? parsed.moods : [],
    notes,
    accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
    goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    events: Array.isArray(parsed.events) ? parsed.events : [],
    contents,
    dailyMetrics: Array.isArray(parsed.dailyMetrics) ? parsed.dailyMetrics : [],
    platformFollowers: Array.isArray(parsed.platformFollowers) ? parsed.platformFollowers : [],
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return hydrateState(raw);
    } catch {
      // ignore corrupted storage
    }
    return defaultState;
  });

  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [quickAction, setQuickAction] = useState<
    'task' | 'expense' | 'event' | 'note' | 'content' | null
  >(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('minhacentral_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem('minhacentral_theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const updateUser = (u: Partial<UserProfile>) =>
    setState((s) => ({ ...s, user: { ...s.user, ...u } }));

  const addProject = (p: Omit<Project, 'id'>) =>
    setState((s) => ({ ...s, projects: [...s.projects, { ...p, id: uid('proj') }] }));

  const addTask = (t: Omit<Task, 'id' | 'createdAt'>) =>
    setState((s) => ({
      ...s,
      tasks: [{ ...t, id: uid('task'), createdAt: TODAY }, ...s.tasks],
    }));

  const updateTask = (id: string, patch: Partial<Task>) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));

  const deleteTask = (id: string) =>
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));

  const toggleTaskStatus = (id: string) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'concluida' ? 'pendente' : 'concluida' }
          : t
      ),
    }));

  const toggleSubtask = (taskId: string, subtaskId: string) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : t
      ),
    }));

  const addHabit = (h: Omit<Habit, 'id' | 'completedDates' | 'streak'>) =>
    setState((s) => ({
      ...s,
      habits: [...s.habits, { ...h, id: uid('hab'), completedDates: [], streak: 0 }],
    }));

  const updateHabit = (
    id: string,
    patch: Partial<Omit<Habit, 'id' | 'completedDates' | 'streak'>>
  ) =>
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }));

  const deleteHabit = (id: string) =>
    setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));

  const toggleHabitDate = (habitId: string, date: string) =>
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(date);
        const nextDates = exists
          ? h.completedDates.filter((d) => d !== date)
          : [...h.completedDates, date];
        return { ...h, completedDates: nextDates, streak: calcStreak(nextDates) };
      }),
    }));

  const saveMood = (entry: MoodEntry) =>
    setState((s) => ({
      ...s,
      moods: [entry, ...s.moods.filter((m) => m.date !== entry.date)],
    }));

  const deleteMood = (date: string) =>
    setState((s) => ({
      ...s,
      moods: s.moods.filter((m) => m.date !== date),
    }));

  const addNote = (n: Omit<BrainNote, 'id' | 'createdAt' | 'updatedAt'>) =>
    setState((s) => ({
      ...s,
      notes: [
        { ...n, url: sanitizeHttpUrl(n.url), id: uid('note'), createdAt: TODAY, updatedAt: TODAY },
        ...s.notes,
      ],
    }));

  const updateNote = (id: string, patch: Partial<BrainNote>) =>
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...patch,
              url: patch.url !== undefined ? sanitizeHttpUrl(patch.url) : n.url,
              updatedAt: TODAY,
            }
          : n
      ),
    }));

  const deleteNote = (id: string) =>
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));

  const addTransaction = (t: Omit<Transaction, 'id'>) =>
    setState((s) => ({
      ...s,
      transactions: [{ ...t, id: uid('tx') }, ...s.transactions],
    }));

  const updateTransaction = (id: string, patch: Partial<Transaction>) =>
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));

  const deleteTransaction = (id: string) =>
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));

  const addAccount = (a: Omit<FinanceAccount, 'id'>) =>
    setState((s) => ({
      ...s,
      accounts: [...s.accounts, { ...a, id: uid('acc') }],
    }));

  const deleteAccount = (id: string) =>
    setState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }));

  const addBudget = (b: CategoryBudget) =>
    setState((s) => ({
      ...s,
      budgets: [...s.budgets.filter((x) => x.category !== b.category), b],
    }));

  const deleteBudget = (category: string) =>
    setState((s) => ({
      ...s,
      budgets: s.budgets.filter((b) => b.category !== category),
    }));

  const addGoal = (g: Omit<FinancialGoal, 'id'>) =>
    setState((s) => ({ ...s, goals: [...s.goals, { ...g, id: uid('goal') }] }));

  const deleteGoal = (id: string) =>
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));

  const updateGoalProgress = (id: string, delta: number) =>
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === id
          ? { ...g, current: Math.max(0, Math.min(g.target, g.current + delta)) }
          : g
      ),
    }));

  const addEvent = (e: Omit<CalendarEvent, 'id'>) =>
    setState((s) => ({ ...s, events: [...s.events, { ...e, id: uid('ev') }] }));

  const deleteEvent = (id: string) =>
    setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));

  const addContent = (c: Omit<ContentItem, 'id'>) =>
    setState((s) => ({
      ...s,
      contents: [{ ...c, assetLink: sanitizeHttpUrl(c.assetLink), id: uid('cnt') }, ...s.contents],
    }));

  const updateContent = (id: string, patch: Partial<ContentItem>) =>
    setState((s) => ({
      ...s,
      contents: s.contents.map((c) =>
        c.id === id
          ? {
              ...c,
              ...patch,
              assetLink:
                patch.assetLink !== undefined ? sanitizeHttpUrl(patch.assetLink) : c.assetLink,
            }
          : c
      ),
    }));

  const deleteContent = (id: string) =>
    setState((s) => ({ ...s, contents: s.contents.filter((c) => c.id !== id) }));

  const updateContentMetrics = (id: string, metrics: ContentMetrics) =>
    setState((s) => ({
      ...s,
      contents: s.contents.map((c) => (c.id === id ? { ...c, metrics } : c)),
    }));

  const generateTasksFromContent = (contentId: string) =>
    setState((s) => {
      const content = s.contents.find((c) => c.id === contentId);
      if (!content) return s;
      const newTasks: Task[] = [
        {
          id: uid('task'),
          title: `[${content.platform}] Roteiro & legenda: ${content.title}`,
          description: `Gerado automaticamente pelo módulo de Conteúdo (${content.format}).`,
          priority: 'media',
          status: 'pendente',
          dueDate: content.publishDate,
          dueTime: '10:00',
          period: 'manha',
          projectId: content.projectId,
          area: 'Conteúdo',
          linkedContentId: content.id,
          subtasks: [
            { id: uid('st'), title: 'Escrever gancho inicial', completed: false },
            { id: uid('st'), title: 'Revisar CTA e hashtags', completed: false },
          ],
          createdAt: TODAY,
        },
        {
          id: uid('task'),
          title: `[${content.platform}] Produzir e agendar: ${content.title}`,
          description: `Publicação prevista para ${content.publishDate} às ${content.publishTime || '18:00'}.`,
          priority: 'alta',
          status: 'pendente',
          dueDate: content.publishDate,
          dueTime: content.publishTime || '16:00',
          period: 'tarde',
          projectId: content.projectId,
          area: 'Conteúdo',
          linkedContentId: content.id,
          subtasks: [],
          createdAt: TODAY,
        },
      ];
      return {
        ...s,
        tasks: [...newTasks, ...s.tasks],
        contents: s.contents.map((c) =>
          c.id === contentId ? { ...c, tasksGenerated: true } : c
        ),
      };
    });

  const addDailyMetric = (m: SocialDailyMetric) =>
    setState((s) => ({ ...s, dailyMetrics: [...s.dailyMetrics, m] }));

  const upsertPlatformFollower = (stat: PlatformFollowerStat) =>
    setState((s) => ({
      ...s,
      platformFollowers: [
        ...s.platformFollowers.filter((p) => p.platform !== stat.platform),
        stat,
      ],
    }));

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        activeModule,
        setActiveModule,
        darkMode,
        toggleDarkMode,
        quickAction,
        setQuickAction,
        updateUser,
        addProject,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleSubtask,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDate,
        saveMood,
        deleteMood,
        addNote,
        updateNote,
        deleteNote,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        deleteAccount,
        addBudget,
        deleteBudget,
        addGoal,
        deleteGoal,
        updateGoalProgress,
        addEvent,
        deleteEvent,
        addContent,
        updateContent,
        deleteContent,
        updateContentMetrics,
        generateTasksFromContent,
        addDailyMetric,
        upsertPlatformFollower,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

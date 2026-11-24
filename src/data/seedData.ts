import type {
  BrainNote,
  CalendarEvent,
  CategoryBudget,
  ContentItem,
  FinanceAccount,
  FinancialGoal,
  Habit,
  MoodEntry,
  PlatformFollowerStat,
  Project,
  SocialDailyMetric,
  Task,
  Transaction,
  UserProfile,
} from '../types';
import { getLocalTodayIso } from '../utils/format';

export const TODAY = getLocalTodayIso();

export const initialUser: UserProfile = {
  name: 'Visitante',
  role: 'Gestão Pessoal & Profissional',
  email: '',
  avatarInitials: 'VC',
};

export const initialProjects: Project[] = [];
export const initialTasks: Task[] = [];
export const initialHabits: Habit[] = [];
export const initialMoods: MoodEntry[] = [];
export const initialNotes: BrainNote[] = [];
export const initialAccounts: FinanceAccount[] = [];
export const initialTransactions: Transaction[] = [];
export const initialBudgets: CategoryBudget[] = [];
export const initialGoals: FinancialGoal[] = [];
export const initialEvents: CalendarEvent[] = [];
export const initialContents: ContentItem[] = [];
export const initialDailyMetrics: SocialDailyMetric[] = [];
export const initialPlatformFollowers: PlatformFollowerStat[] = [];

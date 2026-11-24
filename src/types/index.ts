export type ModuleId =
  | 'dashboard'
  | 'tasks'
  | 'habits'
  | 'brain'
  | 'finance'
  | 'calendar'
  | 'content';

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'fazendo' | 'revisao' | 'concluida';
export type TaskPeriod = 'manha' | 'tarde' | 'noite' | 'qualquer';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  area: 'Profissional' | 'Pessoal' | 'Conteúdo' | 'Saúde' | 'Finanças';
  color: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  period: TaskPeriod;
  projectId?: string;
  area: string;
  subtasks: Subtask[];
  linkedContentId?: string;
  createdAt: string;
}

export type HabitFrequency = 'diario' | 'semanal' | 'mensal';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  frequencyLabel: string;
  reminderTime?: string;
  monthlyGoal: number;
  completedDates: string[]; // YYYY-MM-DD
  streak: number;
  category: 'Saúde' | 'Mente' | 'Foco' | 'Aprendizado' | 'Corpo';
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: 1 | 2 | 3 | 4 | 5;
  energy: number; // 1-10
  gratitude: string;
  tags?: string[];
}

export type NoteCategory =
  | 'ideias'
  | 'anotacoes'
  | 'referencias'
  | 'aprendizados'
  | 'projetos'
  | 'insights'
  | 'links';

export interface BrainNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  url?: string;
  projectId?: string;
  linkedTaskId?: string;
  linkedContentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'receita' | 'despesa';
export type ExpenseKind = 'fixa' | 'variavel';
export type TransactionStatus = 'pago' | 'pendente';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  kind?: ExpenseKind;
  accountId?: string;
  projectId?: string;
  isSubscription?: boolean;
  notes?: string;
}

export type CardBrand =
  | 'nubank'
  | 'nubank-uv'
  | 'inter'
  | 'inter-black'
  | 'itau'
  | 'itau-personnalite'
  | 'bradesco'
  | 'bb'
  | 'caixa'
  | 'santander'
  | 'c6'
  | 'xp'
  | 'btg'
  | 'mercadopago'
  | 'picpay'
  | 'wise'
  | 'nomad'
  | 'sicredi'
  | 'sicoob'
  | 'custom';

export interface FinanceAccount {
  id: string;
  name: string;
  holder: string;
  type: 'credito' | 'corrente' | 'investimento';
  balance: number;
  limit?: number;
  invoiceAmount?: number;
  dueDay?: number;
  closingDay?: number;
  last4?: string;
  customColor?: string;
  theme: 'purple' | 'slate' | 'forest' | 'ochre';
  brand?: CardBrand;
}

export interface CategoryBudget {
  category: string;
  budget: number;
  color: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
}

export type EventType = 'compromisso' | 'reuniao' | 'lembrete' | 'evento';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  type: EventType;
  location?: string;
  description?: string;
  projectId?: string;
}

export type SocialPlatform =
  | 'Instagram'
  | 'YouTube'
  | 'Pinterest'
  | 'X'
  | 'TikTok'
  | 'LinkedIn';

export type ContentFormat = 'Reels' | 'Stories' | 'Carrossel' | 'Feed' | 'Vídeo';

export type ContentStatus =
  | 'ideia'
  | 'planejamento'
  | 'producao'
  | 'revisao'
  | 'agendado'
  | 'publicado';

export interface ContentMetrics {
  reach: number;
  impressions: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: SocialPlatform;
  format: ContentFormat;
  status: ContentStatus;
  publishDate: string; // YYYY-MM-DD
  publishTime?: string;
  caption?: string;
  script?: string;
  assetLink?: string;
  projectId?: string;
  metrics?: ContentMetrics;
  tasksGenerated?: boolean;
}

export interface SocialDailyMetric {
  date: string; // DD/MM
  reach: number;
  impressions: number;
  engagement: number;
  followers: number;
}

export interface PlatformFollowerStat {
  platform: SocialPlatform;
  followers: number;
  growthPct: number;
  color: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarInitials: string;
}

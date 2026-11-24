import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Brain,
  Calendar as CalendarIcon,
  Check,
  CheckCircle,
  Clock,
  EditPencil as Pencil,
  EmojiBlinkRight,
  EmojiPuzzled,
  EmojiQuite,
  EmojiSad,
  EmojiSatisfied,
  FireFlame,
  NavArrowLeft as ChevronLeft,
  NavArrowRight as ChevronRight,
  Plus,
  RefreshDouble as RefreshCw,
  Send,
  Sparks as Sparkles,
  Wallet,
} from 'iconoir-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { TODAY } from '../data/seedData';
import {
  formatBRL,
  formatDayMonth,
  formatLongDatePt,
  formatMonthYearPt,
  formatNumber,
  getMonthDays,
  pluralize,
} from '../utils/format';

type TopCardId = 'finance' | 'content' | 'calendar';
type BottomCardId = 'tasks' | 'habits' | 'brain';

const DEFAULT_TOP_ORDER: TopCardId[] = ['finance', 'content', 'calendar'];
const DEFAULT_BOTTOM_ORDER: BottomCardId[] = ['tasks', 'habits', 'brain'];
const LAYOUT_STORAGE_KEY = 'minhacentral_bento_layout_v2';

const HABIT_STARTERS = [
  { name: 'Leitura (20 min)', icon: 'BookOpen', color: '#6953F5', category: 'Aprendizado' as const },
  { name: 'Exercício', icon: 'Dumbbell', color: '#10B981', category: 'Corpo' as const },
  { name: 'Meditação', icon: 'Sparkles', color: '#8B5CF6', category: 'Mente' as const },
];

const MOOD_OPTIONS = [
  { val: 1 as const, label: 'Baixo', Icon: EmojiSad },
  { val: 2 as const, label: 'Cansado', Icon: EmojiPuzzled },
  { val: 3 as const, label: 'Calmo', Icon: EmojiQuite },
  { val: 4 as const, label: 'Bem', Icon: EmojiSatisfied },
  { val: 5 as const, label: 'Ótimo', Icon: EmojiBlinkRight },
];

const DragGrip: React.FC<{ light?: boolean }> = ({ light }) => (
  <span
    className="inline-grid grid-cols-2 gap-[2.5px] opacity-40 group-hover/drag:opacity-90 transition-opacity cursor-grab active:cursor-grabbing p-1 -m-1"
    title="Arraste para reorganizar"
    aria-hidden="true"
  >
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className="w-[3px] h-[3px] rounded-full"
        style={{ backgroundColor: light ? '#ffffff' : 'var(--text-muted)' }}
      />
    ))}
  </span>
);

function reorderList<T>(list: T[], fromId: T, toId: T): T[] {
  if (fromId === toId) return list;
  const next = [...list];
  const fromIdx = next.indexOf(fromId);
  const toIdx = next.indexOf(toId);
  if (fromIdx === -1 || toIdx === -1) return list;
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return next;
}

export const DashboardHome: React.FC = () => {
  const {
    user,
    darkMode,
    tasks,
    habits,
    notes,
    transactions,
    events,
    contents,
    dailyMetrics,
    moods,
    setActiveModule,
    setQuickAction,
    updateUser,
    addTask,
    addHabit,
    addNote,
    toggleTaskStatus,
    toggleHabitDate,
    saveMood,
  } = useApp();

  // Persisted Drag-and-Drop order
  const [topOrder, setTopOrder] = useState<TopCardId[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
      if (
        Array.isArray(saved.topOrder) &&
        saved.topOrder.length === DEFAULT_TOP_ORDER.length &&
        DEFAULT_TOP_ORDER.every((id) => saved.topOrder.includes(id))
      ) {
        return saved.topOrder;
      }
    } catch {
      // ignore
    }
    return DEFAULT_TOP_ORDER;
  });

  const [bottomOrder, setBottomOrder] = useState<BottomCardId[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
      if (
        Array.isArray(saved.bottomOrder) &&
        saved.bottomOrder.length === DEFAULT_BOTTOM_ORDER.length &&
        DEFAULT_BOTTOM_ORDER.every((id) => saved.bottomOrder.includes(id))
      ) {
        return saved.bottomOrder;
      }
    } catch {
      // ignore
    }
    return DEFAULT_BOTTOM_ORDER;
  });

  const [draggingTop, setDraggingTop] = useState<TopCardId | null>(null);
  const [overTop, setOverTop] = useState<TopCardId | null>(null);
  const [draggingBottom, setDraggingBottom] = useState<BottomCardId | null>(null);
  const [overBottom, setOverBottom] = useState<BottomCardId | null>(null);

  const persistOrder = (nextTop: TopCardId[], nextBottom: BottomCardId[]) => {
    try {
      localStorage.setItem(
        LAYOUT_STORAGE_KEY,
        JSON.stringify({ topOrder: nextTop, bottomOrder: nextBottom })
      );
    } catch {
      // ignore
    }
  };

  const isCustomOrder =
    topOrder.join(',') !== DEFAULT_TOP_ORDER.join(',') ||
    bottomOrder.join(',') !== DEFAULT_BOTTOM_ORDER.join(',');

  const resetOrder = () => {
    setTopOrder(DEFAULT_TOP_ORDER);
    setBottomOrder(DEFAULT_BOTTOM_ORDER);
    persistOrder(DEFAULT_TOP_ORDER, DEFAULT_BOTTOM_ORDER);
  };

  // Inline states
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name === 'Visitante' ? '' : user.name);
  const [inlineTask, setInlineTask] = useState('');
  const [inlineNote, setInlineNote] = useState('');

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const nowDate = new Date(`${TODAY}T12:00:00`);
  const [calYear, setCalYear] = useState(nowDate.getFullYear());
  const [calMonth, setCalMonth] = useState(nowDate.getMonth());

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameDraft.trim() || 'Visitante';
    const initials = clean
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    updateUser({ name: clean, avatarInitials: initials });
    setEditingName(false);
  };

  const handleInlineTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTask.trim()) return;
    addTask({
      title: inlineTask.trim(),
      priority: 'media',
      status: 'pendente',
      dueDate: TODAY,
      period: 'manha',
      area: 'Pessoal',
      subtasks: [],
    });
    setInlineTask('');
  };

  const handleInlineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineNote.trim()) return;
    addNote({
      title: inlineNote.trim(),
      content: '',
      category: 'ideias',
      tags: ['rapida'],
      favorite: false,
      pinned: false,
    });
    setInlineNote('');
  };

  // Metrics
  const todayTasks = tasks.filter((t) => t.dueDate === TODAY);
  const pendingToday = todayTasks.filter((t) => t.status !== 'concluida');
  const completedToday = todayTasks.filter((t) => t.status === 'concluida');
  const overdueTasks = tasks.filter((t) => t.status !== 'concluida' && t.dueDate < TODAY);
  const inProgressTasks = tasks.filter((t) => t.status === 'fazendo');
  const totalCompleted = tasks.filter((t) => t.status === 'concluida').length;
  const progressPct = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  const dailyHabits = habits.filter((h) => h.frequency !== 'mensal');
  const completedHabitsToday = dailyHabits.filter((h) => h.completedDates.includes(TODAY));
  const todayMood = moods.find((m) => m.date === TODAY);

  const totalIncome = transactions
    .filter((t) => t.type === 'receita' && t.status === 'pago')
    .reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'pago')
    .reduce((a, t) => a + t.amount, 0);
  const monthBalance = totalIncome - totalExpense;
  const pendingBills = transactions.filter((t) => t.type === 'despesa' && t.status === 'pendente');

  const financeBars = useMemo(() => {
    const grouped: Record<string, { day: string; val: number }> = {};
    transactions.forEach((t) => {
      if (!grouped[t.date]) grouped[t.date] = { day: formatDayMonth(t.date), val: 0 };
      grouped[t.date].val += t.amount;
    });
    return Object.values(grouped).slice(-7);
  }, [transactions]);

  const todayPosts = contents.filter((c) => c.publishDate === TODAY);
  const publishedCount = contents.filter((c) => c.status === 'publicado').length;
  const scheduledCount = contents.filter((c) => c.status === 'agendado').length;
  const totalReach = dailyMetrics.reduce((a, m) => a + m.reach, 0);
  const avgEngagement =
    dailyMetrics.length > 0
      ? (dailyMetrics.reduce((a, m) => a + m.engagement, 0) / dailyMetrics.length).toFixed(1)
      : '0,0';

  const monthDays = useMemo(() => getMonthDays(calYear, calMonth), [calYear, calMonth]);
  const selectedDayEvents = events.filter((e) => e.date === selectedDate);
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const selectedDayPosts = contents.filter((c) => c.publishDate === selectedDate);

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((e) => e.date >= TODAY)
        .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
        .slice(0, 2),
    [events]
  );

  // Top Row Bento Renderers (Financeiro + Conteúdo + Calendário — Draggable!)
  const renderTopCard = (id: TopCardId, index: number) => {
    const isDragging = draggingTop === id;
    const isOver = overTop === id && draggingTop !== id;
    const stagger = `stagger-${index + 1}`;

    const dragProps = {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDraggingTop(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        if (draggingTop && draggingTop !== id) setOverTop(id);
      },
      onDragLeave: () => {
        if (overTop === id) setOverTop(null);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        if (draggingTop && draggingTop !== id) {
          const next = reorderList(topOrder, draggingTop, id);
          setTopOrder(next);
          persistOrder(next, bottomOrder);
        }
        setDraggingTop(null);
        setOverTop(null);
      },
      onDragEnd: () => {
        setDraggingTop(null);
        setOverTop(null);
      },
    };

    if (id === 'finance') {
      return (
        <div
          key={id}
          {...dragProps}
          onClick={() => setActiveModule('finance')}
          className={`lg:col-span-5 group/drag rounded-[26px] p-6 sm:p-7 flex flex-col justify-between cursor-pointer text-white relative overflow-hidden animate-card ${stagger} transition-all duration-200 hover:-translate-y-1 ${
            isDragging ? 'card-dragging' : ''
          } ${isOver ? 'card-drop-target' : ''}`}
          style={{
            background: 'linear-gradient(145deg, #6953F5 0%, #523CE0 100%)',
            boxShadow: '0 14px 32px -10px rgba(105, 83, 245, 0.45)',
          }}
        >
          {/* Subtle Geometric Arcs */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-15"
            viewBox="0 0 420 260"
            preserveAspectRatio="xMaxYMid slice"
            aria-hidden="true"
          >
            <path d="M180 0 A160 160 0 0 0 340 160 L340 0 Z" fill="#ffffff" />
            <path d="M260 120 A160 160 0 0 0 420 280 L420 120 Z" fill="#ffffff" fillOpacity="0.6" />
          </svg>

          <div className="relative z-10 flex items-start justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <DragGrip light />
              <div>
                <h2 className="text-xl font-bold tracking-tight">Financeiro</h2>
                <p className="text-[10px] uppercase tracking-[0.14em] opacity-75">
                  {formatMonthYearPt(nowDate.getFullYear(), nowDate.getMonth())}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setQuickAction('expense')}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-semibold text-white border-0 cursor-pointer transition-colors"
              >
                + Lançar
              </button>
              <button
                onClick={() => setActiveModule('finance')}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white border-0 cursor-pointer"
                aria-label="Abrir Financeiro"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-12 gap-3 items-end">
            <div className="col-span-7">
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold opacity-75">
                Saldo do mês
              </p>
              <p className="text-4xl sm:text-[42px] font-bold leading-none tracking-tight my-2 tabular-nums">
                {formatBRL(monthBalance)}
              </p>
              <div className="flex items-center gap-5 mt-3 text-xs tabular-nums">
                <div>
                  <span className="block font-bold">{formatBRL(totalIncome)}</span>
                  <span className="text-[10px] opacity-75 uppercase tracking-wider">Entradas</span>
                </div>
                <div>
                  <span className="block font-bold">{formatBRL(totalExpense)}</span>
                  <span className="text-[10px] opacity-75 uppercase tracking-wider">Saídas</span>
                </div>
              </div>
            </div>

            <div className="col-span-5 h-28 flex items-end justify-center">
              {financeBars.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeBars}>
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.12)' }}
                      contentStyle={{
                        background: '#151322',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                      formatter={(v) => formatBRL(Number(v))}
                    />
                    <Bar dataKey="val" radius={[6, 6, 0, 0]} fill="rgba(255, 255, 255, 0.9)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-24 flex items-end justify-between gap-1.5 px-2 pb-1 opacity-30">
                  {[26, 48, 34, 72, 44, 62, 38].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-t-md bg-white"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-medium opacity-90">
            <span>{pluralize(transactions.length, 'lançamento', 'lançamentos')}</span>
            <span>
              {pendingBills.length > 0
                ? pluralize(pendingBills.length, 'conta a pagar', 'contas a pagar')
                : 'Nenhuma conta pendente'}
            </span>
          </div>
        </div>
      );
    }

    if (id === 'content') {
      return (
        <div
          key={id}
          {...dragProps}
          onClick={() => setActiveModule('content')}
          className={`lg:col-span-4 group/drag rounded-[26px] p-6 sm:p-7 flex flex-col justify-between cursor-pointer text-white relative overflow-hidden animate-card ${stagger} transition-all duration-200 hover:-translate-y-1 ${
            isDragging ? 'card-dragging' : ''
          } ${isOver ? 'card-drop-target' : ''}`}
          style={{
            background: darkMode
              ? 'linear-gradient(155deg, #1E1A36 0%, #141126 100%)'
              : 'linear-gradient(155deg, #1A1730 0%, #110F22 100%)',
            boxShadow: '0 14px 32px -10px rgba(20, 18, 36, 0.35)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="mt-1">
                <DragGrip light />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Conteúdo</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold leading-none tabular-nums">
                    {formatNumber(totalReach)}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] opacity-65">
                    de alcance
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-[0.12em] opacity-65">
              30 dias
            </span>
          </div>

          <div className="h-28 my-3 flex items-center justify-center">
            {dailyMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyMetrics}>
                  <defs>
                    <linearGradient id="contentReachGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      background: '#151322',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="#C4B5FD"
                    strokeWidth={2}
                    fill="url(#contentReachGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <svg viewBox="0 0 260 80" className="w-full h-20 opacity-40" aria-hidden="true">
                <path
                  d="M0 64 Q45 58 80 60 T155 34 T220 48 L260 32"
                  fill="none"
                  stroke="#A78BFA"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs tabular-nums">
            <div>
              <span className="block font-bold text-sm">{publishedCount}</span>
              <span className="text-[10px] uppercase opacity-65">Publicados</span>
            </div>
            <div>
              <span className="block font-bold text-sm">{scheduledCount}</span>
              <span className="text-[10px] uppercase opacity-65">Agendados</span>
            </div>
            <div>
              <span className="block font-bold text-sm">{avgEngagement}%</span>
              <span className="text-[10px] uppercase opacity-65">Engajamento</span>
            </div>
          </div>
        </div>
      );
    }

    // Calendar card (3 cols)
    return (
      <div
        key={id}
        {...dragProps}
        className={`lg:col-span-3 surface-card group/drag p-5 flex flex-col justify-between animate-card ${stagger} ${
          isDragging ? 'card-dragging' : ''
        } ${isOver ? 'card-drop-target-light' : ''}`}
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <DragGrip />
              <span className="text-xs font-bold">{formatMonthYearPt(calYear, calMonth)}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear((y) => y - 1);
                  } else setCalMonth((m) => m - 1);
                }}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 border-0 bg-transparent cursor-pointer"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear((y) => y + 1);
                  } else setCalMonth((m) => m + 1);
                }}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 border-0 bg-transparent cursor-pointer"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center tabular-nums">
            {monthDays.map((d) => {
              const isSelected = d.date === selectedDate;
              const isToday = d.date === TODAY;
              const hasEvent = events.some((e) => e.date === d.date);
              const hasTask = tasks.some((t) => t.dueDate === d.date);
              const hasPost = contents.some((c) => c.publishDate === d.date);
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  className="w-8 h-8 mx-auto rounded-full border-0 text-[11px] font-medium cursor-pointer flex flex-col items-center justify-center relative transition-colors"
                  style={{
                    opacity: d.inMonth ? 1 : 0.3,
                    backgroundColor: isSelected
                      ? 'var(--accent-violet)'
                      : isToday
                      ? 'var(--accent-violet-soft)'
                      : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  <span className="leading-none">{d.day}</span>
                  {(hasEvent || hasTask || hasPost) && (
                    <span className="flex gap-0.5 mt-0.5">
                      {hasEvent && (
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? '#fff' : '#3B82F6' }}
                        />
                      )}
                      {hasTask && (
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? '#fff' : '#6953F5' }}
                        />
                      )}
                      {hasPost && (
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? '#fff' : '#10B981' }}
                        />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="mt-3 pt-3 border-t flex items-center justify-between text-[11px] tabular-nums"
          style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-muted)' }}
        >
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {selectedDate === TODAY ? 'Hoje' : formatDayMonth(selectedDate)}
          </span>
          <span>
            {pluralize(selectedDayEvents.length, 'evento', 'eventos')} ·{' '}
            {pluralize(selectedDayTasks.length, 'tarefa', 'tarefas')} ·{' '}
            {pluralize(selectedDayPosts.length, 'post', 'posts')}
          </span>
        </div>
      </div>
    );
  };

  // Bottom Row Bento Renderers (Tarefas + Hábitos & Saúde Mental + Segundo Cérebro & Agenda — Draggable!)
  const renderBottomCard = (id: BottomCardId, index: number) => {
    const isDragging = draggingBottom === id;
    const isOver = overBottom === id && draggingBottom !== id;
    const stagger = `stagger-${index + 1}`;

    const dragProps = {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDraggingBottom(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        if (draggingBottom && draggingBottom !== id) setOverBottom(id);
      },
      onDragLeave: () => {
        if (overBottom === id) setOverBottom(null);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        if (draggingBottom && draggingBottom !== id) {
          const next = reorderList(bottomOrder, draggingBottom, id);
          setBottomOrder(next);
          persistOrder(topOrder, next);
        }
        setDraggingBottom(null);
        setOverBottom(null);
      },
      onDragEnd: () => {
        setDraggingBottom(null);
        setOverBottom(null);
      },
    };

    const baseClass = `surface-card group/drag p-6 flex flex-col justify-between animate-card ${stagger} ${
      isDragging ? 'card-dragging' : ''
    } ${isOver ? 'card-drop-target-light' : ''}`;

    if (id === 'tasks') {
      return (
        <div key={id} {...dragProps} className={baseClass}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DragGrip />
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-violet)' }} />
                <h3 className="text-base font-bold">Tarefas</h3>
              </div>
              <button
                onClick={() => setActiveModule('tasks')}
                className="px-3 py-1 rounded-full text-[11px] font-semibold text-white border-0 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-violet)' }}
              >
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4 tabular-nums">
              {[
                { label: 'Atrasadas', val: overdueTasks.length, color: '#EF4444' },
                { label: 'Hoje', val: pendingToday.length, color: 'var(--accent-violet)' },
                { label: 'Fazendo', val: inProgressTasks.length, color: '#3B82F6' },
                { label: 'Feitas', val: completedToday.length, color: '#10B981' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-2.5 rounded-xl text-center"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <span className="block text-xl font-bold leading-none" style={{ color: s.color }}>
                    {s.val}
                  </span>
                  <span className="text-[9.5px] uppercase font-semibold mt-1 block" style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5 tabular-nums">
                <span style={{ color: 'var(--text-muted)' }}>Progresso</span>
                <span className="font-bold">{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%`, backgroundColor: 'var(--accent-violet)' }}
                />
              </div>
            </div>

            {todayTasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {todayTasks.slice(0, 3).map((t) => {
                  const done = t.status === 'concluida';
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTaskStatus(t.id)}
                      className="w-full p-2.5 rounded-xl border flex items-center gap-2.5 text-left cursor-pointer"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-hairline)',
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: done ? '#10B981' : 'var(--bg-card)',
                          border: done ? 'none' : '1.5px solid var(--border-strong)',
                          color: '#fff',
                        }}
                      >
                        {done && <Check className="w-3 h-3" />}
                      </span>
                      <span className={`text-xs font-medium truncate ${done ? 'line-through opacity-60' : ''}`}>
                        {t.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleInlineTask} className="flex items-center gap-2 pt-2">
            <input
              value={inlineTask}
              onChange={(e) => setInlineTask(e.target.value)}
              placeholder="Adicionar tarefa rápida..."
              className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none focus:border-[var(--accent-violet)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={!inlineTask.trim()}
              className="w-8 h-8 rounded-xl flex items-center justify-center border-0 text-white cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent-violet)' }}
              aria-label="Criar tarefa"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      );
    }

    if (id === 'habits') {
      return (
        <div key={id} {...dragProps} className={`${baseClass} gap-4`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DragGrip />
                <FireFlame className="w-4 h-4" style={{ color: 'var(--accent-violet)' }} />
                <h3 className="text-base font-bold">Hábitos &amp; Mente</h3>
              </div>
              <button
                onClick={() => setActiveModule('habits')}
                className="px-3 py-1 rounded-full text-[11px] font-semibold text-white border-0 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-violet)' }}
              >
                Abrir
              </button>
            </div>

            {dailyHabits.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs mb-2 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  <strong>
                    {completedHabitsToday.length} de {dailyHabits.length}
                  </strong>{' '}
                  hábitos concluídos hoje
                </p>
                {dailyHabits.slice(0, 4).map((h) => {
                  const done = h.completedDates.includes(TODAY);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHabitDate(h.id, TODAY)}
                      className="w-full p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors"
                      style={{
                        backgroundColor: done ? 'var(--accent-violet-soft)' : 'var(--bg-surface)',
                        borderColor: done ? 'var(--accent-violet)' : 'var(--border-hairline)',
                      }}
                    >
                      <span className="flex items-center gap-2 text-xs font-medium truncate">
                        <span
                          className="w-4 h-4 rounded-md flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: done ? '#10B981' : 'transparent',
                            border: done ? 'none' : '1.5px solid var(--border-strong)',
                            color: '#fff',
                          }}
                        >
                          {done && <Check className="w-3 h-3" />}
                        </span>
                        <span className={done ? 'line-through opacity-70' : ''}>{h.name}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold tabular-nums" style={{ color: 'var(--accent-violet)' }}>
                        <FireFlame className="w-3.5 h-3.5" /> {h.streak}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Escolha um hábito para iniciar hoje:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {HABIT_STARTERS.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() =>
                        addHabit({
                          name: s.name,
                          icon: s.icon,
                          color: s.color,
                          frequency: 'diario',
                          frequencyLabel: 'Todos os dias',
                          monthlyGoal: 22,
                          category: s.category,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border-0 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--accent-violet-soft)',
                        color: 'var(--accent-violet)',
                      }}
                    >
                      <Plus className="w-3 h-3" /> {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="p-3.5 rounded-2xl border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Check-in emocional
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {todayMood ? `Energia ${todayMood.energy}/10` : 'Hoje'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {MOOD_OPTIONS.map(({ val, label, Icon }) => {
                const active = todayMood?.mood === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      saveMood({
                        date: TODAY,
                        mood: val,
                        energy: todayMood?.energy ?? 8,
                        gratitude: todayMood?.gratitude ?? '',
                      })
                    }
                    title={label}
                    className="py-1.5 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                    style={{
                      backgroundColor: active ? 'var(--accent-violet)' : 'var(--bg-card)',
                      color: active ? '#fff' : 'var(--text-secondary)',
                      border: active
                        ? '1.5px solid var(--accent-violet)'
                        : '1px solid var(--border-hairline)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Segundo Cérebro & Agenda Card
    return (
      <div key={id} {...dragProps} className={`${baseClass} gap-4`}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DragGrip />
              <Brain className="w-4 h-4" style={{ color: 'var(--accent-violet)' }} />
              <h3 className="text-base font-bold">Segundo cérebro</h3>
            </div>
            <button
              onClick={() => setActiveModule('brain')}
              className="px-3 py-1 rounded-full text-[11px] font-semibold text-white border-0 cursor-pointer"
              style={{ backgroundColor: 'var(--accent-violet)' }}
            >
              Abrir
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-center tabular-nums">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <span className="text-xl font-bold block leading-none">{notes.length}</span>
              <span className="text-[9.5px] uppercase font-semibold mt-1 block" style={{ color: 'var(--text-muted)' }}>
                Guardados
              </span>
            </div>
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <span className="text-xl font-bold block leading-none">
                {notes.filter((n) => n.category === 'ideias').length}
              </span>
              <span className="text-[9.5px] uppercase font-semibold mt-1 block" style={{ color: 'var(--text-muted)' }}>
                Ideias
              </span>
            </div>
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <span className="text-xl font-bold block leading-none">
                {notes.filter((n) => n.pinned).length}
              </span>
              <span className="text-[9.5px] uppercase font-semibold mt-1 block" style={{ color: 'var(--text-muted)' }}>
                Fixados
              </span>
            </div>
          </div>

          {/* Upcoming Agenda preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <CalendarIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent-violet)' }} />
                Próximos na agenda
              </span>
              <button
                onClick={() => setActiveModule('calendar')}
                className="text-[11px] font-semibold border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--accent-violet)' }}
              >
                Ver agenda
              </button>
            </div>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="px-3 py-2 rounded-xl flex items-center justify-between text-xs"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <span className="font-medium truncate">{ev.title}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3 h-3" /> {ev.startTime}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs py-1" style={{ color: 'var(--text-muted)' }}>
                Nenhum compromisso agendado.
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleInlineNote} className="flex items-center gap-2">
          <input
            value={inlineNote}
            onChange={(e) => setInlineNote(e.target.value)}
            placeholder="Capturar ideia rápida..."
            className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none focus:border-[var(--accent-violet)]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={!inlineNote.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center border-0 text-white cursor-pointer disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent-violet)' }}
            aria-label="Salvar nota rápida"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ROW 1: FULL-WIDTH HERO GREETING BANNER (Model layout in Electric Violet UX!) */}
      <section
        className="relative overflow-hidden rounded-[26px] border min-h-[190px] flex items-center"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-hairline)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Right-side Electric Violet Geometric Horizon Art */}
        <svg
          viewBox="0 0 820 220"
          preserveAspectRatio="xMaxYMid slice"
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="violetBannerFade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={darkMode ? '#151322' : '#ffffff'} stopOpacity="1" />
              <stop offset="52%" stopColor={darkMode ? '#151322' : '#ffffff'} stopOpacity="0.96" />
              <stop offset="78%" stopColor="#6953F5" stopOpacity={darkMode ? '0.35' : '0.22'} />
              <stop offset="100%" stopColor="#6953F5" stopOpacity={darkMode ? '0.65' : '0.45'} />
            </linearGradient>
          </defs>
          <rect width="820" height="220" fill="url(#violetBannerFade)" />
          <path d="M520 0 A160 160 0 0 0 680 160 L680 0 Z" fill="#6953F5" fillOpacity="0.18" />
          <path d="M640 0 A180 180 0 0 0 820 180 L820 0 Z" fill="#6953F5" fillOpacity="0.28" />
          <circle cx="715" cy="165" r="78" fill="#8B7BFF" fillOpacity="0.2" />
          <circle cx="760" cy="60" r="42" fill="#ffffff" fillOpacity="0.22" />
        </svg>

        <div className="relative z-10 p-6 sm:p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p
              className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: 'var(--accent-violet)' }}
            >
              Minha Central &nbsp;/&nbsp; Início &nbsp;·&nbsp; {formatLongDatePt(TODAY)}
            </p>
            {isCustomOrder && (
              <button
                onClick={resetOrder}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--accent-violet)',
                }}
              >
                <RefreshCw className="w-3 h-3" /> Restaurar ordem
              </button>
            )}
          </div>

          <h1 className="text-3xl sm:text-[42px] font-bold tracking-tight leading-[1.08] mb-2">
            Bom dia,{' '}
            {!editingName ? (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(user.name === 'Visitante' ? '' : user.name);
                  setEditingName(true);
                }}
                title="Clique para editar seu nome"
                className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 font-bold text-3xl sm:text-[42px] cursor-pointer group"
                style={{ color: 'var(--accent-violet)' }}
              >
                <span className="border-b-2 border-dashed border-[var(--border-strong)] group-hover:border-[var(--accent-violet)] transition-colors">
                  {user.name}
                </span>
                <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-75 transition-opacity" />
              </button>
            ) : (
              <form onSubmit={handleSaveName} className="inline-block">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={handleSaveName}
                  placeholder="Seu nome..."
                  className="text-3xl sm:text-[42px] font-bold bg-transparent border-b-2 outline-none w-52"
                  style={{ borderColor: 'var(--accent-violet)', color: 'var(--accent-violet)' }}
                />
              </form>
            )}
            !
          </h1>

          <p className="text-xs sm:text-sm font-medium mb-5" style={{ color: 'var(--text-secondary)' }}>
            Aqui está o resumo do seu dia ·{' '}
            <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {pluralize(pendingToday.length, 'tarefa hoje', 'tarefas hoje')},{' '}
              {pluralize(dailyHabits.length - completedHabitsToday.length, 'hábito restante', 'hábitos restantes')} e{' '}
              {pluralize(todayPosts.length, 'post agendado', 'posts agendados')}.
            </span>
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'task' as const, label: 'Tarefa' },
              { id: 'expense' as const, label: 'Gasto' },
              { id: 'event' as const, label: 'Compromisso' },
              { id: 'note' as const, label: 'Nota' },
              { id: 'content' as const, label: 'Conteúdo' },
            ].map((btn) => (
              <Button
                key={btn.id}
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" style={{ color: 'var(--accent-violet)' }} />}
                onClick={() => setQuickAction(btn.id)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* ROW 2: DRAGGABLE 3-CARD BENTO TRIO (Financeiro + Conteúdo + Calendário) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {topOrder.map((id, index) => renderTopCard(id, index))}
      </section>

      {/* ROW 3: DRAGGABLE 3-CARD BOTTOM TRIO (Tarefas + Hábitos & Mente + Segundo Cérebro) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bottomOrder.map((id, index) => renderBottomCard(id, index))}
      </section>

      {/* Unused icon safeguard */}
      <span className="hidden">
        <Wallet />
        <Sparkles />
      </span>
    </div>
  );
};

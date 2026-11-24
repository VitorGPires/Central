import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  EditPencil as Pencil,
  EmojiBlinkRight,
  EmojiPuzzled,
  EmojiQuite,
  EmojiSad,
  EmojiSatisfied,
  FireFlame as Flame,
  Heart,
  NavArrowDown,
  Plus,
  Search,
  Trash as Trash2,
  Xmark as X,
} from 'iconoir-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { Button } from '../components/Button';
import { CustomColorPicker } from '../components/CustomColorPicker';
import { CustomSelect } from '../components/CustomSelect';
import { CustomTimePicker } from '../components/CustomTimePicker';
import { useApp } from '../context/AppContext';
import { TODAY } from '../data/seedData';
import type { Habit, HabitFrequency } from '../types';
import {
  formatDayMonth,
  formatLongDatePt,
  formatMonthYearPt,
  formatShortDate,
  getCurrentWeekDays,
  getMonthDays,
} from '../utils/format';
import {
  getHabitIconOption,
  resolveHabitIcon,
  searchHabitIcons,
  suggestHabitIcon,
} from '../utils/habitIcons';

const HABIT_COLORS = [
  { hex: '#6953F5', label: 'Violeta' },
  { hex: '#4F46E5', label: 'Índigo' },
  { hex: '#3B82F6', label: 'Azul' },
  { hex: '#06B6D4', label: 'Ciano' },
  { hex: '#14B8A6', label: 'Turquesa' },
  { hex: '#10B981', label: 'Esmeralda' },
  { hex: '#84CC16', label: 'Lima' },
  { hex: '#F59E0B', label: 'Âmbar' },
  { hex: '#F97316', label: 'Laranja' },
  { hex: '#EF4444', label: 'Vermelho' },
  { hex: '#EC4899', label: 'Rosa' },
  { hex: '#A855F7', label: 'Roxo' },
  { hex: '#64748B', label: 'Ardósia' },
];

const WEEK_MATRIX = getCurrentWeekDays(TODAY).map((d) => ({
  date: d.date,
  day: d.dayCode,
  num: d.num,
}));

const MOOD_LEVELS = [
  { v: 1 as const, Icon: EmojiSad, label: 'Baixo', color: '#EF4444' },
  { v: 2 as const, Icon: EmojiPuzzled, label: 'Cansado', color: '#F97316' },
  { v: 3 as const, Icon: EmojiQuite, label: 'Calmo', color: '#3B82F6' },
  { v: 4 as const, Icon: EmojiSatisfied, label: 'Bem', color: '#10B981' },
  { v: 5 as const, Icon: EmojiBlinkRight, label: 'Ótimo', color: '#6953F5' },
];

const MOOD_TAGS = ['Focado', 'Grato', 'Calmo', 'Motivado', 'Cansado', 'Ansioso'];

export const HabitsModule: React.FC = () => {
  const {
    habits,
    moods,
    toggleHabitDate,
    addHabit,
    updateHabit,
    deleteHabit,
    saveMood,
    deleteMood,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('diario');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [monthlyGoal, setMonthlyGoal] = useState('22');
  const [color, setColor] = useState('#6953F5');
  const [icon, setIcon] = useState('Sparks');
  const [iconAutoMatched, setIconAutoMatched] = useState(false);
  const [iconManuallyPicked, setIconManuallyPicked] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<Habit['category']>('Mente');

  useEffect(() => {
    if (!iconPickerOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setIconPickerOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIconPickerOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [iconPickerOpen]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!iconManuallyPicked) {
      const suggestion = suggestHabitIcon(value);
      setIcon(suggestion.key);
      setIconAutoMatched(suggestion.matched);
    }
  };

  const closeHabitModal = () => {
    setModalOpen(false);
    setIconPickerOpen(false);
  };

  const resetHabitForm = () => {
    setEditingHabitId(null);
    setName('');
    setFrequency('diario');
    setReminderTime('08:00');
    setMonthlyGoal('22');
    setColor('#6953F5');
    setIcon('Sparks');
    setCategory('Mente');
    setIconAutoMatched(false);
    setIconManuallyPicked(false);
    setIconPickerOpen(false);
    setIconSearch('');
  };

  const openNewHabitModal = () => {
    resetHabitForm();
    setModalOpen(true);
  };

  const openEditHabitModal = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setName(habit.name);
    setFrequency(habit.frequency);
    setReminderTime(habit.reminderTime || '08:00');
    setMonthlyGoal(String(habit.monthlyGoal));
    setColor(habit.color);
    setIcon(habit.icon);
    setCategory(habit.category);
    setIconAutoMatched(false);
    setIconManuallyPicked(true);
    setIconPickerOpen(false);
    setIconSearch('');
    setModalOpen(true);
  };

  const [selectedMoodDate, setSelectedMoodDate] = useState<string>(TODAY);
  const selectedMoodEntry = moods.find((m) => m.date === selectedMoodDate);
  const todayMood = moods.find((m) => m.date === TODAY);
  const [moodScore, setMoodScore] = useState<1 | 2 | 3 | 4 | 5>(selectedMoodEntry?.mood ?? 4);
  const [energy, setEnergy] = useState<number>(selectedMoodEntry?.energy ?? 7);
  const [gratitude, setGratitude] = useState<string>(selectedMoodEntry?.gratitude ?? '');
  const [moodTags, setMoodTags] = useState<string[]>(selectedMoodEntry?.tags ?? []);
  const [moodSaved, setMoodSaved] = useState(false);

  const selectMoodDate = (iso: string) => {
    setSelectedMoodDate(iso);
    const existing = moods.find((m) => m.date === iso);
    setMoodScore(existing?.mood ?? 4);
    setEnergy(existing?.energy ?? 7);
    setGratitude(existing?.gratitude ?? '');
    setMoodTags(existing?.tags ?? []);
  };

  const toggleMoodTag = (tag: string) => {
    setMoodTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const sortedMoods = useMemo(
    () => [...moods].sort((a, b) => b.date.localeCompare(a.date)),
    [moods]
  );

  const moodStats = useMemo(() => {
    if (moods.length === 0) {
      return { avgMood: 0, avgEnergy: 0, streak: 0, total: 0 };
    }
    const avgMood = moods.reduce((acc, m) => acc + m.mood, 0) / moods.length;
    const avgEnergy = moods.reduce((acc, m) => acc + m.energy, 0) / moods.length;
    const dateSet = new Set(moods.map((m) => m.date));
    let streak = 0;
    const cursor = new Date(`${TODAY}T12:00:00`);
    if (!dateSet.has(TODAY)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (true) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(cursor.getDate()).padStart(2, '0')}`;
      if (dateSet.has(iso)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return {
      avgMood: Number(avgMood.toFixed(1)),
      avgEnergy: Number(avgEnergy.toFixed(1)),
      streak,
      total: moods.length,
    };
  }, [moods]);

  const activeDaily = habits.filter((h) => h.frequency !== 'mensal');
  const doneToday = activeDaily.filter((h) => h.completedDates.includes(TODAY)).length;
  const todayPct = activeDaily.length ? Math.round((doneToday / activeDaily.length) * 100) : 0;

  // Monthly overall completion %
  const monthlyStats = useMemo(() => {
    const totalDone = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
    const totalGoal = habits.reduce((acc, h) => acc + h.monthlyGoal, 0);
    const pct = totalGoal > 0 ? Math.min(100, Math.round((totalDone / totalGoal) * 100)) : 0;
    return { totalDone, totalGoal, pct };
  }, [habits]);

  // Weekly consistency chart data
  const weeklyChart = useMemo(() => {
    return WEEK_MATRIX.map((d) => {
      const count = habits.filter((h) => h.completedDates.includes(d.date)).length;
      return {
        day: d.day,
        concluidos: count,
        pct: habits.length ? Math.round((count / habits.length) * 100) : 0,
      };
    });
  }, [habits]);

  const nowDt = new Date(`${TODAY}T12:00:00`);
  const monthLabel = formatMonthYearPt(nowDt.getFullYear(), nowDt.getMonth());
  const monthDays = useMemo(
    () => getMonthDays(nowDt.getFullYear(), nowDt.getMonth()),
    [nowDt.getFullYear(), nowDt.getMonth()]
  );

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      icon,
      color,
      frequency,
      frequencyLabel:
        frequency === 'diario'
          ? `Todos os dias · ${reminderTime}`
          : frequency === 'semanal'
            ? `Semanal · ${reminderTime}`
            : `Mensal · ${reminderTime}`,
      reminderTime,
      monthlyGoal: Number(monthlyGoal) || 20,
      category,
    };
    if (editingHabitId) {
      updateHabit(editingHabitId, payload);
    } else {
      addHabit(payload);
    }
    resetHabitForm();
    setModalOpen(false);
  };

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    saveMood({
      date: selectedMoodDate,
      mood: moodScore,
      energy,
      gratitude: gratitude.trim(),
      tags: moodTags,
    });
    setMoodSaved(true);
    setTimeout(() => setMoodSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header matching Reference #3 */}
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Minha Central &nbsp;/&nbsp; Hábitos &amp; Saúde Mental
        </p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-serif-display text-4xl leading-none">Hábitos</h1>
          <span
            className="font-serif-editorial italic text-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            O que você repete
          </span>
        </div>

        <div className="mt-4 max-w-md">
          <p className="text-xs mb-1 capitalize" style={{ color: 'var(--text-muted)' }}>
            Hoje, {formatLongDatePt(TODAY)}
          </p>
          <p className="font-serif-editorial text-2xl mb-2">
            {doneToday} de {activeDaily.length} feitos hoje
          </p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${todayPct}%`, backgroundColor: 'var(--accent-ochre)' }}
            />
          </div>
        </div>
      </div>

      {/* Weekly Habit Tracker Matrix (Matching Reference #3) */}
      <section className="surface-card p-5 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif-editorial text-xl">Semana</h2>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {WEEK_MATRIX[0].num} a {WEEK_MATRIX[6].num} · {monthLabel}
          </span>
        </div>

        <div className="min-w-[640px]">
          {/* Header Row */}
          <div className="grid grid-cols-12 items-center pb-3 border-b" style={{ borderColor: 'var(--border-hairline)' }}>
            <div className="col-span-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Hábito
            </div>
            {WEEK_MATRIX.map((d) => {
              const isToday = d.date === TODAY;
              return (
                <div key={d.date} className="col-span-1 text-center">
                  <span
                    className="block text-[10px] font-semibold"
                    style={{ color: isToday ? 'var(--accent-ochre)' : 'var(--text-muted)' }}
                  >
                    {d.day}
                  </span>
                  <span
                    className="block text-[11px] font-bold"
                    style={{ color: isToday ? 'var(--accent-ochre)' : 'var(--text-secondary)' }}
                  >
                    {d.num}
                  </span>
                </div>
              );
            })}
            <div className="col-span-1 text-right text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Seq.
            </div>
          </div>

          {/* Habit Rows */}
          <div className="divide-y" style={{ borderColor: 'var(--border-hairline)' }}>
            {habits.map((habit) => {
              const Icon = resolveHabitIcon(habit.icon);
              return (
                <div
                  key={habit.id}
                  className="grid grid-cols-12 items-center py-3.5 group"
                >
                  <div className="col-span-4 flex items-center gap-3 pr-2">
                    <button
                      type="button"
                      onClick={() => openEditHabitModal(habit)}
                      className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-transform hover:scale-105"
                      style={{
                        backgroundColor: `${habit.color}1F`,
                        borderColor: `${habit.color}38`,
                        color: habit.color,
                      }}
                      title="Editar hábito"
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditHabitModal(habit)}
                          className="text-sm font-semibold truncate text-left hover:underline cursor-pointer bg-transparent border-0 p-0"
                          style={{ color: 'var(--text-primary)' }}
                          title="Clique para editar"
                        >
                          {habit.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditHabitModal(habit)}
                          className="p-1 rounded-md opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Editar hábito"
                        >
                          <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHabit(habit.id)}
                          className="p-1 rounded-md opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Excluir hábito"
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-terracotta)' }} />
                        </button>
                      </div>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {habit.frequencyLabel}
                      </p>
                    </div>
                  </div>

                  {WEEK_MATRIX.map((d) => {
                    const checked = habit.completedDates.includes(d.date);
                    const isToday = d.date === TODAY;
                    return (
                      <div key={d.date} className="col-span-1 flex justify-center">
                        <button
                          onClick={() => toggleHabitDate(habit.id, d.date)}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                          style={{
                            backgroundColor: checked ? habit.color : 'transparent',
                            border: checked
                              ? `2px solid ${habit.color}`
                              : isToday
                                ? `2px solid ${habit.color}`
                                : '1.5px solid var(--border-strong)',
                            color: '#fff',
                          }}
                          aria-label={`Marcar ${habit.name} em ${d.date}`}
                        >
                          {checked && <Check className="w-4 h-4 stroke-[2.5]" />}
                        </button>
                      </div>
                    );
                  })}

                  <div className="col-span-1 flex items-center justify-end gap-1 text-xs font-bold">
                    <Flame
                      className="w-3.5 h-3.5"
                      style={{ color: habit.streak > 0 ? 'var(--accent-ochre)' : 'var(--text-muted)' }}
                    />
                    <span>{habit.streak}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={openNewHabitModal}
            className="mt-4 w-full py-3 rounded-2xl border border-dashed text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
          >
            <Plus className="w-4 h-4" /> Novo hábito
          </button>
        </div>
      </section>

      {/* Bottom Row: O Mês (Monthly Progress) + Consistency Chart + Mental Health */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* O Mês */}
        <div className="lg:col-span-5 surface-card p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-serif-editorial text-xl">O mês</h3>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {monthLabel}
              </p>
            </div>
            <div className="text-right">
              <span className="font-serif-display text-4xl leading-none">
                {monthlyStats.pct}%
              </span>
              <span className="block text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
                dos hábitos feitos
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {habits.map((h) => {
              const pct = Math.min(100, Math.round((h.completedDates.length / h.monthlyGoal) * 100));
              return (
                <div key={h.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium">{h.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {h.completedDates.length}/{h.monthlyGoal} vezes ·{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{pct}%</strong>
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: h.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de Consistência + Heatmap */}
        <div className="lg:col-span-4 surface-card p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-serif-editorial text-xl mb-1">Consistência semanal</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Hábitos concluídos por dia nesta semana
            </p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChart}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="concluidos" fill="#6953F5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compact Monthly Heatmap */}
          <div>
            <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Mapa de constância · {monthLabel}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.filter((d) => d.inMonth).map((d) => {
                const count = habits.filter((h) => h.completedDates.includes(d.date)).length;
                const intensity =
                  count === 0
                    ? 'var(--bg-surface)'
                    : count === 1
                      ? 'var(--accent-ochre-soft)'
                      : count === 2
                        ? '#E5A96A'
                        : 'var(--accent-forest)';
                return (
                  <div
                    key={d.date}
                    title={`${d.day}/11: ${count} hábitos`}
                    className="h-6 rounded-md flex items-center justify-center text-[10px] font-medium"
                    style={{
                      backgroundColor: intensity,
                      color: count >= 3 ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {d.day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Saúde Mental & Diário de Gratidão */}
        <div className="lg:col-span-3 surface-card p-5 flex flex-col justify-between">
          <form onSubmit={handleSaveMood} className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" style={{ color: 'var(--accent-terracotta)' }} />
                <h3 className="font-serif-editorial text-xl">Saúde Mental</h3>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: todayMood
                    ? 'rgba(16, 185, 129, 0.14)'
                    : 'var(--accent-violet-soft)',
                  color: todayMood ? '#10B981' : 'var(--accent-violet)',
                }}
              >
                {todayMood ? 'Feito hoje' : 'Pendente'}
              </span>
            </div>

            {selectedMoodDate !== TODAY && (
              <div
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px]"
                style={{
                  backgroundColor: 'var(--accent-violet-soft)',
                  color: 'var(--accent-violet)',
                }}
              >
                <span className="font-medium">
                  Editando {formatShortDate(selectedMoodDate)}
                </span>
                <button
                  type="button"
                  onClick={() => selectMoodDate(TODAY)}
                  className="font-semibold underline cursor-pointer"
                >
                  Voltar para hoje
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Como está sua mente?
                </span>
                <span className="font-semibold" style={{ color: 'var(--accent-violet)' }}>
                  {MOOD_LEVELS.find((m) => m.v === moodScore)?.label}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {MOOD_LEVELS.map(({ v, Icon, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMoodScore(v)}
                    title={label}
                    className="py-2 rounded-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor:
                        moodScore === v ? 'var(--accent-violet)' : 'var(--bg-surface)',
                      color: moodScore === v ? '#fff' : 'var(--text-secondary)',
                      border:
                        moodScore === v
                          ? '1.5px solid var(--accent-violet)'
                          : '1px solid var(--border-hairline)',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5">
                {MOOD_TAGS.map((tag) => {
                  const active = moodTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleMoodTag(tag)}
                      className="px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border"
                      style={{
                        backgroundColor: active
                          ? 'var(--accent-violet-soft)'
                          : 'var(--bg-surface)',
                        borderColor: active
                          ? 'var(--accent-violet)'
                          : 'var(--border-hairline)',
                        color: active ? 'var(--accent-violet)' : 'var(--text-secondary)',
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Nível de energia</span>
                <strong className="tabular-nums">{energy}/10</strong>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-[#6953F5]"
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
                Gratidão / Reflexão rápida
              </label>
              <textarea
                rows={2}
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Uma pequena vitória ou algo bom de hoje..."
                className="w-full p-2.5 rounded-xl border text-xs outline-none resize-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <Button type="submit" className="w-full justify-center">
              {moodSaved
                ? '✓ Check-in salvo!'
                : selectedMoodEntry
                  ? 'Atualizar check-in'
                  : 'Registrar bem-estar'}
            </Button>
          </form>
        </div>
      </section>

      {/* Histórico & Acompanhamento de Saúde Mental */}
      <section className="surface-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif-editorial text-2xl leading-tight">
              Histórico de Saúde Mental
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Acompanhe seu humor, nível de energia e reflexões ao longo da semana. Clique em um dia para registrar ou editar.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div
              className="px-3 py-1.5 rounded-xl border text-xs"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Humor médio: </span>
              <strong className="tabular-nums">
                {moodStats.total > 0 ? `${moodStats.avgMood}/5` : '—'}
              </strong>
            </div>
            <div
              className="px-3 py-1.5 rounded-xl border text-xs"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Energia média: </span>
              <strong className="tabular-nums">
                {moodStats.total > 0 ? `${moodStats.avgEnergy}/10` : '—'}
              </strong>
            </div>
            <div
              className="px-3 py-1.5 rounded-xl border text-xs"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Sequência: </span>
              <strong className="tabular-nums">
                {moodStats.streak} {moodStats.streak === 1 ? 'dia' : 'dias'}
              </strong>
            </div>
          </div>
        </div>

        {/* 7-day interactive mood strip */}
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-7 gap-2 min-w-[540px]">
            {WEEK_MATRIX.map((d) => {
              const entry = moods.find((m) => m.date === d.date);
              const level = entry ? MOOD_LEVELS.find((l) => l.v === entry.mood) : null;
              const MoodIcon = level?.Icon;
              const isSelected = d.date === selectedMoodDate;
              const isToday = d.date === TODAY;

              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => selectMoodDate(d.date)}
                  className="p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--accent-violet-soft)'
                      : 'var(--bg-surface)',
                    borderColor: isSelected
                      ? 'var(--accent-violet)'
                      : isToday
                        ? 'var(--border-strong)'
                        : 'var(--border-hairline)',
                  }}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: isToday ? 'var(--accent-violet)' : 'var(--text-muted)' }}
                  >
                    {d.day} · {d.num}
                  </span>

                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: level ? `${level.color}20` : 'var(--bg-card)',
                      color: level ? level.color : 'var(--text-muted)',
                    }}
                  >
                    {MoodIcon ? (
                      <MoodIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-xs opacity-40">—</span>
                    )}
                  </div>

                  <span
                    className="text-[10px] font-medium tabular-nums"
                    style={{ color: entry ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    {entry ? `${entry.energy}/10` : 'Sem check-in'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent check-in entries */}
        {sortedMoods.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-6 text-center"
            style={{
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Nenhum check-in de saúde mental registrado ainda.
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Use o card <strong>Saúde Mental</strong> acima para registrar seu humor, energia e reflexão de hoje.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedMoods.slice(0, 6).map((entry) => {
              const level = MOOD_LEVELS.find((l) => l.v === entry.mood) || MOOD_LEVELS[3];
              const MoodIcon = level.Icon;
              return (
                <div
                  key={entry.date}
                  onClick={() => selectMoodDate(entry.date)}
                  className="p-4 rounded-2xl border flex flex-col justify-between gap-2.5 cursor-pointer transition-colors group"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor:
                      selectedMoodDate === entry.date
                        ? 'var(--accent-violet)'
                        : 'var(--border-hairline)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${level.color}20`,
                          color: level.color,
                        }}
                      >
                        <MoodIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">
                          {level.label} · Energia {entry.energy}/10
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {entry.date === TODAY ? 'Hoje' : formatDayMonth(entry.date)} ({formatShortDate(entry.date)})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMood(entry.date);
                        if (selectedMoodDate === entry.date) {
                          setMoodScore(4);
                          setEnergy(7);
                          setGratitude('');
                          setMoodTags([]);
                        }
                      }}
                      className="p-1 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ color: 'var(--accent-terracotta)' }}
                      title="Excluir check-in"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                          style={{
                            backgroundColor: 'var(--accent-violet-soft)',
                            color: 'var(--accent-violet)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.gratitude && (
                    <p
                      className="text-xs leading-relaxed line-clamp-3"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      “{entry.gratitude}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Habit Modal */}
      {modalOpen && (() => {
        const selectedIconOpt = getHabitIconOption(icon);
        const SelectedIcon = selectedIconOpt.icon;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
            onClick={closeHabitModal}
          >
            <div
              className="w-full max-w-md rounded-[24px] border p-6 shadow-2xl animate-fade-in"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif-display text-2xl">
                  {editingHabitId ? 'Editar hábito' : 'Novo hábito'}
                </h3>
                <button onClick={closeHabitModal} className="p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddHabit} className="space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen((v) => !v)}
                    className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer hover:scale-105"
                    style={{
                      backgroundColor: `${color}1F`,
                      borderColor: `${color}45`,
                      color,
                    }}
                    title={`Ícone: ${selectedIconOpt.label} (clique para alterar)`}
                  >
                    <SelectedIcon className="w-5 h-5" />
                  </button>
                  <input
                    required
                    autoFocus
                    placeholder="Nome do hábito (ex: Beber 2L de água)"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="flex-1 h-11 px-3.5 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CustomSelect
                    value={frequency}
                    onChange={(v) => setFrequency(v as HabitFrequency)}
                    options={[
                      { value: 'diario', label: 'Diário' },
                      { value: 'semanal', label: 'Semanal' },
                      { value: 'mensal', label: 'Mensal' },
                    ]}
                  />
                  <CustomTimePicker value={reminderTime} onChange={setReminderTime} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(e.target.value)}
                    placeholder="Meta mensal (dias)"
                    className="px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <CustomSelect
                    value={category}
                    onChange={(v) => setCategory(v as Habit['category'])}
                    options={['Saúde', 'Mente', 'Foco', 'Aprendizado', 'Corpo'].map((c) => ({
                      value: c,
                      label: c,
                    }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Cor &amp; Ícone
                    </span>
                    {iconAutoMatched && !iconManuallyPicked && (
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: 'var(--accent-violet)' }}
                      >
                        Ícone sugerido automaticamente
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2 sm:max-w-[216px]">
                      {HABIT_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setColor(c.hex)}
                          title={c.label}
                          aria-label={c.label}
                          className="w-6 h-6 rounded-full cursor-pointer border-0 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: c.hex,
                            outline:
                              color.toLowerCase() === c.hex.toLowerCase()
                                ? '2px solid var(--text-primary)'
                                : 'none',
                            outlineOffset: '2px',
                          }}
                        />
                      ))}
                      <CustomColorPicker
                        value={color}
                        onChange={setColor}
                        variant="circle"
                        isCustomActive={
                          !HABIT_COLORS.some(
                            (c) => c.hex.toLowerCase() === color.toLowerCase()
                          )
                        }
                      />
                    </div>
                    <div ref={iconPickerRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIconPickerOpen((v) => !v)}
                        aria-haspopup="listbox"
                        aria-expanded={iconPickerOpen}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer min-w-[140px]"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: iconPickerOpen ? 'var(--accent-violet)' : 'var(--border-hairline)',
                          color: 'var(--text-primary)',
                          boxShadow: iconPickerOpen ? '0 0 0 3px var(--accent-violet-soft)' : 'none',
                        }}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <SelectedIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{selectedIconOpt.label}</span>
                        </span>
                        <NavArrowDown
                          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                            iconPickerOpen ? 'rotate-180' : ''
                          }`}
                          style={{ color: iconPickerOpen ? 'var(--accent-violet)' : 'var(--text-muted)' }}
                        />
                      </button>

                      {iconPickerOpen && (() => {
                        const filteredIcons = searchHabitIcons(iconSearch);
                        return (
                          <div
                            className="absolute right-0 bottom-full mb-1.5 z-50 w-[280px] rounded-2xl border p-2.5 shadow-xl animate-fade-in"
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: 'var(--border-strong)',
                              boxShadow: '0 18px 40px -10px rgba(14, 13, 22, 0.28)',
                            }}
                          >
                            <div
                              className="flex items-center gap-2 px-2.5 py-1.5 mb-2 rounded-xl border"
                              style={{
                                backgroundColor: 'var(--bg-surface)',
                                borderColor: 'var(--border-hairline)',
                              }}
                            >
                              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                              <input
                                type="text"
                                value={iconSearch}
                                onChange={(e) => setIconSearch(e.target.value)}
                                placeholder="Buscar ícone Iconoir..."
                                className="w-full bg-transparent text-xs outline-none"
                                style={{ color: 'var(--text-primary)' }}
                              />
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                              {filteredIcons.map((item) => {
                                const ItemIcon = item.icon;
                                const active = item.key === icon;
                                return (
                                  <button
                                    key={item.key}
                                    type="button"
                                    title={`${item.label} (${item.key})`}
                                    onClick={() => {
                                      setIcon(item.key);
                                      setIconManuallyPicked(true);
                                      setIconAutoMatched(false);
                                      setIconPickerOpen(false);
                                      setIconSearch('');
                                    }}
                                    className="h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer border"
                                    style={{
                                      backgroundColor: active
                                        ? 'var(--accent-violet-soft)'
                                        : 'transparent',
                                      borderColor: active
                                        ? 'var(--accent-violet)'
                                        : 'transparent',
                                      color: active
                                        ? 'var(--accent-violet)'
                                        : 'var(--text-secondary)',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!active) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!active) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                      }
                                    }}
                                  >
                                    <ItemIcon className="w-5 h-5" />
                                  </button>
                                );
                              })}
                              {filteredIcons.length === 0 && (
                                <p
                                  className="col-span-5 text-center text-xs py-4"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  Nenhum ícone encontrado
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div>
                    {editingHabitId && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                          deleteHabit(editingHabitId);
                          resetHabitForm();
                          setModalOpen(false);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" onClick={closeHabitModal}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingHabitId ? 'Salvar alterações' : 'Criar hábito'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

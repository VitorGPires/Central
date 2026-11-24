import React, { useMemo, useState } from 'react';
import {
  WarningCircle as AlertCircle,
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
  Clock,
  ViewColumns3 as Columns3,
  KanbanBoard as FolderKanban,
  List,
  EditPencil as Pencil,
  Plus,
  Trash as Trash2,
  Xmark as X,
} from 'iconoir-react';
import { Button } from '../components/Button';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSelect } from '../components/CustomSelect';
import { CustomTimePicker } from '../components/CustomTimePicker';
import { useApp } from '../context/AppContext';
import { TODAY } from '../data/seedData';
import type { Task, TaskPeriod, TaskPriority, TaskStatus } from '../types';
import { formatDayMonth, getCurrentWeekDays, getMonthDays } from '../utils/format';

type TaskView = 'semana' | 'kanban' | 'lista' | 'calendario';
type TimeFilter = 'todas' | 'hoje' | 'semana' | 'mes' | 'atrasadas' | 'concluidas';

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  baixa: { label: 'Baixa', color: '#5C7A5E', bg: 'var(--accent-forest-soft)' },
  media: { label: 'Média', color: '#4A6B8A', bg: 'var(--accent-blue-soft)' },
  alta: { label: 'Alta', color: '#D67E26', bg: 'var(--accent-ochre-soft)' },
  urgente: { label: 'Urgente', color: '#B85334', bg: 'var(--accent-terracotta-soft)' },
};

const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  pendente: { label: 'Falta fazer', dot: '#D67E26' },
  fazendo: { label: 'Fazendo', dot: '#4A6B8A' },
  revisao: { label: 'Revisão', dot: '#6B4C9A' },
  concluida: { label: 'Concluída', dot: '#2B412D' },
};

const WEEK_DAYS = getCurrentWeekDays(TODAY).slice(0, 5);

export const TasksModule: React.FC = () => {
  const {
    tasks,
    projects,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleSubtask,
  } = useApp();

  const [view, setView] = useState<TaskView>('semana');
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('todas');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Modal form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [status, setStatus] = useState<TaskStatus>('pendente');
  const [dueDate, setDueDate] = useState(TODAY);
  const [dueTime, setDueTime] = useState('10:00');
  const [period, setPeriod] = useState<TaskPeriod>('manha');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  const openNewModal = (presetDate = TODAY, presetPeriod: TaskPeriod = 'manha') => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('media');
    setStatus('pendente');
    setDueDate(presetDate);
    setDueTime('10:00');
    setPeriod(presetPeriod);
    setProjectId(projects[0]?.id || '');
    setSubtasks([]);
    setSubtaskDraft('');
    setModalOpen(true);
  };

  const openEditModal = (t: Task) => {
    setEditingTask(t);
    setTitle(t.title);
    setDescription(t.description || '');
    setPriority(t.priority);
    setStatus(t.status);
    setDueDate(t.dueDate);
    setDueTime(t.dueTime || '10:00');
    setPeriod(t.period);
    setProjectId(t.projectId || '');
    setSubtasks(t.subtasks);
    setSubtaskDraft('');
    setModalOpen(true);
  };

  const saveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const proj = projects.find((p) => p.id === projectId);
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      dueDate,
      dueTime,
      period,
      projectId: projectId || undefined,
      area: proj?.area || 'Profissional',
      subtasks,
    };
    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      addTask(payload);
    }
    setModalOpen(false);
  };

  const nowDt = new Date(`${TODAY}T12:00:00`);
  const weekRangeStart = WEEK_DAYS[0].date;
  const weekRangeEnd = getCurrentWeekDays(TODAY)[6].date;
  const monthPrefix = TODAY.slice(0, 7);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (timeFilter === 'hoje') return t.dueDate === TODAY;
      if (timeFilter === 'semana') return t.dueDate >= weekRangeStart && t.dueDate <= weekRangeEnd;
      if (timeFilter === 'mes') return t.dueDate.startsWith(monthPrefix);
      if (timeFilter === 'atrasadas') return t.dueDate < TODAY && t.status !== 'concluida';
      if (timeFilter === 'concluidas') return t.status === 'concluida';
      return true;
    });
  }, [tasks, projectFilter, priorityFilter, timeFilter, weekRangeStart, weekRangeEnd, monthPrefix]);

  const monthDays = useMemo(
    () => getMonthDays(nowDt.getFullYear(), nowDt.getMonth()),
    [nowDt.getFullYear(), nowDt.getMonth()]
  );

  const renderTaskCard = (task: Task, compact = false) => {
    const project = projects.find((p) => p.id === task.projectId);
    const isOverdue = task.dueDate < TODAY && task.status !== 'concluida';
    const doneSub = task.subtasks.filter((s) => s.completed).length;

    return (
      <div
        key={task.id}
        className="rounded-2xl border p-3.5 transition-all hover:shadow-sm group"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: isOverdue ? 'var(--accent-terracotta)' : 'var(--border-hairline)',
          opacity: task.status === 'concluida' ? 0.72 : 1,
        }}
      >
        <div className="flex items-start gap-2.5">
          <button
            onClick={() => toggleTaskStatus(task.id)}
            className="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            style={{
              backgroundColor:
                task.status === 'concluida' ? 'var(--accent-ochre)' : 'transparent',
              borderColor:
                task.status === 'concluida' ? 'var(--accent-ochre)' : 'var(--border-strong)',
              color: '#fff',
            }}
          >
            {task.status === 'concluida' && <Check className="w-2.5 h-2.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-xs font-semibold leading-snug ${
                  task.status === 'concluida' ? 'line-through' : ''
                }`}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => openEditModal(task)}
                  className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                  title="Editar"
                >
                  <Pencil className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-3 h-3" style={{ color: 'var(--accent-terracotta)' }} />
                </button>
              </div>
            </div>

            {!compact && task.description && (
              <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {task.description}
              </p>
            )}

            {/* Subtasks inline */}
            {task.subtasks.length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  Checklist: {doneSub} de {task.subtasks.length}
                </span>
                {!compact &&
                  task.subtasks.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => toggleSubtask(task.id, st.id)}
                      className="w-full flex items-center gap-1.5 text-left text-[11px] cursor-pointer"
                      style={{ color: st.completed ? 'var(--text-muted)' : 'var(--text-secondary)' }}
                    >
                      <span
                        className="w-3 h-3 rounded-[4px] border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: st.completed ? 'var(--accent-forest)' : 'transparent',
                          borderColor: st.completed ? 'var(--accent-forest)' : 'var(--border-strong)',
                          color: '#fff',
                        }}
                      >
                        {st.completed && <Check className="w-2 h-2" />}
                      </span>
                      <span className={st.completed ? 'line-through' : ''}>{st.title}</span>
                    </button>
                  ))}
              </div>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: PRIORITY_META[task.priority].bg,
                  color: PRIORITY_META[task.priority].color,
                }}
              >
                {PRIORITY_META[task.priority].label}
              </span>

              {isOverdue ? (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--accent-terracotta-soft)',
                    color: 'var(--accent-terracotta)',
                  }}
                >
                  <AlertCircle className="w-2.5 h-2.5" /> Atrasada ({formatDayMonth(task.dueDate)})
                </span>
              ) : (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                >
                  <Clock className="w-2.5 h-2.5" /> {formatDayMonth(task.dueDate)}
                  {task.dueTime ? ` · ${task.dueTime}` : ''}
                </span>
              )}

              {project && (
                <span
                  className="text-[10px] font-medium flex items-center gap-1 ml-auto"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header matching Reference #2 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Minha Central &nbsp;/&nbsp; Tarefas
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-serif-display text-4xl leading-none">Tarefas</h1>
            <span
              className="font-serif-editorial italic text-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              A semana e o calendário
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => openNewModal()}
          className="self-start sm:self-auto"
        >
          Nova tarefa
        </Button>
      </div>

      {/* View Switcher & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex p-1 rounded-full border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
        >
          {[
            { id: 'semana' as const, label: 'Semana', icon: Columns3 },
            { id: 'kanban' as const, label: 'Kanban', icon: FolderKanban },
            { id: 'lista' as const, label: 'Lista', icon: List },
            { id: 'calendario' as const, label: 'Calendário', icon: CalendarIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                style={{
                  backgroundColor: active ? 'var(--accent-forest)' : 'transparent',
                  color: active ? '#F8F5EE' : 'var(--text-secondary)',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CustomSelect
            variant="pill"
            size="sm"
            className="min-w-[165px]"
            value={projectFilter}
            onChange={setProjectFilter}
            options={[
              { value: 'all', label: 'Todos os projetos' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
          <CustomSelect
            variant="pill"
            size="sm"
            className="min-w-[155px]"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'Todas prioridades' },
              { value: 'urgente', label: 'Urgente' },
              { value: 'alta', label: 'Alta' },
              { value: 'media', label: 'Média' },
              { value: 'baixa', label: 'Baixa' },
            ]}
          />
        </div>
      </div>

      {/* VIEW 1: SEMANA (Matching Reference #2 with Manhã / Tarde / Noite slots!) */}
      {view === 'semana' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {WEEK_DAYS.map((day) => {
            const isToday = day.date === TODAY;
            const dayTasks = filteredTasks.filter((t) => t.dueDate === day.date);

            return (
              <div
                key={day.date}
                className="rounded-[22px] border p-3.5 flex flex-col gap-3"
                style={{
                  backgroundColor: isToday ? 'var(--accent-ochre-soft)' : 'var(--bg-surface)',
                  borderColor: isToday ? 'var(--accent-ochre)' : 'var(--border-hairline)',
                }}
              >
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isToday ? 'var(--accent-ochre)' : 'var(--text-primary)' }}
                    >
                      {day.label}
                    </span>
                    <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>
                      {day.short}
                    </span>
                  </div>
                  <button
                    onClick={() => openNewModal(day.date, 'manha')}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                    title="Adicionar neste dia"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(['manha', 'tarde', 'noite'] as TaskPeriod[]).map((slot) => {
                  const slotTasks = dayTasks.filter(
                    (t) => t.period === slot || (slot === 'manha' && t.period === 'qualquer')
                  );
                  const slotLabel =
                    slot === 'manha' ? 'Manhã' : slot === 'tarde' ? 'Tarde' : 'Noite';

                  return (
                    <div key={slot} className="space-y-2">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-1 block"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {slotLabel}
                      </span>
                      {slotTasks.length > 0 ? (
                        slotTasks.map((t) => renderTaskCard(t, true))
                      ) : (
                        <button
                          onClick={() => openNewModal(day.date, slot)}
                          className="w-full py-3 rounded-xl border border-dashed text-[11px] transition-opacity opacity-50 hover:opacity-100 cursor-pointer"
                          style={{
                            borderColor: 'var(--border-strong)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: KANBAN */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {(['pendente', 'fazendo', 'revisao', 'concluida'] as TaskStatus[]).map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col);
            const isOverCol = overCol === col;
            return (
              <div
                key={col}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(col);
                }}
                onDragLeave={() => {
                  if (overCol === col) setOverCol(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = dragTaskId || e.dataTransfer.getData('text/plain');
                  if (id) updateTask(id, { status: col });
                  setDragTaskId(null);
                  setOverCol(null);
                }}
                className={`surface-panel p-4 flex flex-col gap-3 transition-all ${
                  isOverCol ? 'card-drop-target-light' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_META[col].dot }}
                    />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      {STATUS_META[col].label}
                    </h3>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        setDragTaskId(task.id);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', task.id);
                      }}
                      onDragEnd={() => {
                        setDragTaskId(null);
                        setOverCol(null);
                      }}
                      className={`space-y-1.5 cursor-grab active:cursor-grabbing ${
                        dragTaskId === task.id ? 'card-dragging' : ''
                      }`}
                    >
                      {renderTaskCard(task)}
                      <div className="flex gap-1 px-1">
                        {(['pendente', 'fazendo', 'revisao', 'concluida'] as TaskStatus[])
                          .filter((s) => s !== col)
                          .map((next) => (
                            <button
                              key={next}
                              onClick={() => updateTask(task.id, { status: next })}
                              className="text-[10px] px-2 py-0.5 rounded-md border hover:opacity-80 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-hairline)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              → {STATUS_META[next].label}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: LISTA */}
      {view === 'lista' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['todas', 'Todas'],
                ['hoje', 'Hoje'],
                ['semana', 'Esta semana'],
                ['mes', 'Este mês'],
                ['atrasadas', 'Atrasadas'],
                ['concluidas', 'Concluídas'],
              ] as [TimeFilter, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTimeFilter(id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border cursor-pointer"
                style={{
                  backgroundColor:
                    timeFilter === id ? 'var(--accent-ochre)' : 'var(--bg-card)',
                  borderColor:
                    timeFilter === id ? 'var(--accent-ochre)' : 'var(--border-hairline)',
                  color: timeFilter === id ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((t) => renderTaskCard(t))
            ) : (
              <div className="col-span-full surface-card p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Nenhuma tarefa encontrada para este filtro.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: CALENDÁRIO */}
      {view === 'calendario' && (
        <div className="surface-card p-5 overflow-x-auto">
          <div className="min-w-[600px]">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <span
                key={d}
                className="text-[11px] font-semibold uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((d) => {
              const dayTasks = filteredTasks.filter((t) => t.dueDate === d.date);
              const isToday = d.date === TODAY;
              return (
                <div
                  key={d.date}
                  className="min-h-[96px] p-2 rounded-2xl border flex flex-col gap-1"
                  style={{
                    opacity: d.inMonth ? 1 : 0.35,
                    backgroundColor: isToday ? 'var(--accent-ochre-soft)' : 'var(--bg-surface)',
                    borderColor: isToday ? 'var(--accent-ochre)' : 'var(--border-hairline)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{d.day}</span>
                    {d.inMonth && (
                      <button
                        onClick={() => openNewModal(d.date)}
                        className="opacity-40 hover:opacity-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {dayTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => openEditModal(t)}
                      className="text-left text-[10px] px-1.5 py-1 rounded-lg truncate font-medium cursor-pointer"
                      style={{
                        backgroundColor:
                          t.status === 'concluida'
                            ? 'var(--accent-forest-soft)'
                            : PRIORITY_META[t.priority].bg,
                        color:
                          t.status === 'concluida'
                            ? 'var(--accent-forest)'
                            : PRIORITY_META[t.priority].color,
                      }}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[24px] border p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent-ochre)' }} />
                <h3 className="font-serif-display text-2xl">
                  {editingTask ? 'Editar tarefa' : 'Nova tarefa'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveModal} className="space-y-3.5">
              <input
                required
                placeholder="Título da tarefa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <textarea
                rows={2}
                placeholder="Descrição ou detalhes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  value={priority}
                  onChange={(v) => setPriority(v as TaskPriority)}
                  options={[
                    { value: 'baixa', label: 'Prioridade Baixa' },
                    { value: 'media', label: 'Prioridade Média' },
                    { value: 'alta', label: 'Prioridade Alta' },
                    { value: 'urgente', label: 'Prioridade Urgente' },
                  ]}
                />
                <CustomSelect
                  value={status}
                  onChange={(v) => setStatus(v as TaskStatus)}
                  options={[
                    { value: 'pendente', label: 'Falta fazer' },
                    { value: 'fazendo', label: 'Fazendo' },
                    { value: 'revisao', label: 'Revisão' },
                    { value: 'concluida', label: 'Concluída' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CustomDatePicker value={dueDate} onChange={setDueDate} />
                <CustomTimePicker value={dueTime} onChange={setDueTime} />
                <CustomSelect
                  value={period}
                  onChange={(v) => setPeriod(v as TaskPeriod)}
                  options={[
                    { value: 'manha', label: 'Manhã' },
                    { value: 'tarde', label: 'Tarde' },
                    { value: 'noite', label: 'Noite' },
                    { value: 'qualquer', label: 'Qualquer hora' },
                  ]}
                />
              </div>

              <CustomSelect
                value={projectId}
                onChange={setProjectId}
                options={[
                  { value: '', label: 'Sem projeto vinculado' },
                  ...projects.map((p) => ({ value: p.id, label: `${p.name} (${p.area})` })),
                ]}
              />

              {/* Subtasks Builder */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                <label className="text-xs font-semibold block mb-2">Subtarefas / Checklist</label>
                <div className="flex gap-2 mb-2">
                  <input
                    placeholder="Adicionar subtarefa..."
                    value={subtaskDraft}
                    onChange={(e) => setSubtaskDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && subtaskDraft.trim()) {
                        e.preventDefault();
                        setSubtasks((prev) => [
                          ...prev,
                          { id: `st-${Date.now()}`, title: subtaskDraft.trim(), completed: false },
                        ]);
                        setSubtaskDraft('');
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!subtaskDraft.trim()) return;
                      setSubtasks((prev) => [
                        ...prev,
                        { id: `st-${Date.now()}`, title: subtaskDraft.trim(), completed: false },
                      ]);
                      setSubtaskDraft('');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-1">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    >
                      <span>{st.title}</span>
                      <button
                        type="button"
                        onClick={() => setSubtasks((prev) => prev.filter((x) => x.id !== st.id))}
                        className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-forest)' }}
                >
                  {editingTask ? 'Salvar alterações' : 'Criar tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

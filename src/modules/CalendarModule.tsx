import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  FireFlame as Flame,
  MapPin,
  Plus,
  Sparks as Sparkles,
  Trash as Trash2,
  Wallet,
  Xmark as X,
} from 'iconoir-react';
import { Button } from '../components/Button';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSelect } from '../components/CustomSelect';
import { CustomTimePicker } from '../components/CustomTimePicker';
import { useApp } from '../context/AppContext';
import { TODAY } from '../data/seedData';
import type { EventType } from '../types';
import {
  formatBRL,
  formatMonthYearPt,
  formatShortDate,
  getCurrentWeekDays,
  getMonthDays,
} from '../utils/format';

type CalView = 'mes' | 'semana' | 'dia';

interface UnifiedItem {
  id: string;
  date: string;
  time?: string;
  title: string;
  source: 'agenda' | 'tarefa' | 'habito' | 'conteudo' | 'financeiro';
  color: string;
  subtitle?: string;
  deletableEventId?: string;
}

const WEEK_DATES = getCurrentWeekDays(TODAY).map((d) => ({
  date: d.date,
  label: `${d.label.slice(0, 3)} ${d.num}`,
}));

export const CalendarModule: React.FC = () => {
  const { events, tasks, habits, contents, transactions, addEvent, deleteEvent } = useApp();

  const [view, setView] = useState<CalView>('mes');
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [layers, setLayers] = useState({
    agenda: true,
    tarefa: true,
    habito: true,
    conteudo: true,
    financeiro: true,
  });

  // New event modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(TODAY);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [type, setType] = useState<EventType>('reuniao');
  const [location, setLocation] = useState('Google Meet');

  const nowDt = new Date(`${TODAY}T12:00:00`);
  const monthLabel = formatMonthYearPt(nowDt.getFullYear(), nowDt.getMonth());
  const monthDays = useMemo(
    () => getMonthDays(nowDt.getFullYear(), nowDt.getMonth()),
    [nowDt.getFullYear(), nowDt.getMonth()]
  );

  const allItems = useMemo<UnifiedItem[]>(() => {
    const list: UnifiedItem[] = [];

    if (layers.agenda) {
      events.forEach((e) =>
        list.push({
          id: `ev-${e.id}`,
          date: e.date,
          time: e.startTime,
          title: e.title,
          source: 'agenda',
          color: '#4A6B8A',
          subtitle: e.location || e.type,
          deletableEventId: e.id,
        })
      );
    }

    if (layers.tarefa) {
      tasks.forEach((t) =>
        list.push({
          id: `tk-${t.id}`,
          date: t.dueDate,
          time: t.dueTime,
          title: t.title,
          source: 'tarefa',
          color: '#D67E26',
          subtitle: `Tarefa · ${t.priority}`,
        })
      );
    }

    if (layers.conteudo) {
      contents.forEach((c) =>
        list.push({
          id: `cn-${c.id}`,
          date: c.publishDate,
          time: c.publishTime,
          title: `${c.platform}: ${c.title}`,
          source: 'conteudo',
          color: '#2B412D',
          subtitle: `${c.format} · ${c.status}`,
        })
      );
    }

    if (layers.financeiro) {
      transactions
        .filter((tx) => tx.status === 'pendente')
        .forEach((tx) =>
          list.push({
            id: `fn-${tx.id}`,
            date: tx.date,
            title: `${tx.type === 'despesa' ? 'Vencimento' : 'Receber'}: ${tx.title}`,
            source: 'financeiro',
            color: '#B85334',
            subtitle: formatBRL(tx.amount),
          })
        );
    }

    if (layers.habito) {
      habits
        .filter((h) => h.frequency === 'diario')
        .forEach((h) =>
          list.push({
            id: `hb-${h.id}-${selectedDate}`,
            date: selectedDate,
            time: h.reminderTime,
            title: h.name,
            source: 'habito',
            color: '#5C7A5E',
            subtitle: 'Hábito programado',
          })
        );
    }

    return list.sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
  }, [events, tasks, contents, transactions, habits, layers, selectedDate]);

  const selectedDayItems = allItems.filter((i) => i.date === selectedDate);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addEvent({
      title: title.trim(),
      date,
      startTime,
      endTime,
      type,
      location: location.trim() || undefined,
    });
    setTitle('');
    setModalOpen(false);
  };

  const sourceBadge = (s: UnifiedItem['source']) => {
    switch (s) {
      case 'agenda':
        return { label: 'Agenda', icon: CalendarIcon };
      case 'tarefa':
        return { label: 'Tarefa', icon: CheckSquare };
      case 'habito':
        return { label: 'Hábito', icon: Flame };
      case 'conteudo':
        return { label: 'Conteúdo', icon: Sparkles };
      case 'financeiro':
        return { label: 'Financeiro', icon: Wallet };
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Minha Central &nbsp;/&nbsp; Agenda Integrada
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-serif-display text-4xl leading-none">Agenda</h1>
            <span
              className="font-serif-editorial italic text-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              Todos os módulos em um só calendário
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setDate(selectedDate);
            setModalOpen(true);
          }}
          className="self-start sm:self-auto"
        >
          Novo compromisso
        </Button>
      </div>

      {/* View Switcher + Cross-Module Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex p-1 rounded-full border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
        >
          {(
            [
              ['mes', 'Mensal'],
              ['semana', 'Semanal'],
              ['dia', 'Diária'],
            ] as [CalView, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: view === id ? 'var(--accent-forest)' : 'transparent',
                color: view === id ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['agenda', 'Compromissos', '#4A6B8A'],
              ['tarefa', 'Tarefas', '#D67E26'],
              ['conteudo', 'Conteúdos', '#2B412D'],
              ['habito', 'Hábitos', '#5C7A5E'],
              ['financeiro', 'Vencimentos', '#B85334'],
            ] as [keyof typeof layers, string, string][]
          ).map(([key, label, color]) => (
            <button
              key={key}
              onClick={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-opacity"
              style={{
                backgroundColor: layers[key] ? 'var(--bg-card)' : 'transparent',
                borderColor: layers[key] ? color : 'var(--border-hairline)',
                opacity: layers[key] ? 1 : 0.45,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Calendar + Day Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8">
          {view === 'mes' && (
            <div className="surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif-editorial text-xl">{monthLabel}</h2>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Clique em um dia para detalhar
                </span>
              </div>
              <div className="overflow-x-auto pb-1">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                      <span key={d} className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {monthDays.map((d) => {
                      const dayItems = allItems.filter(
                        (i) => i.date === d.date && i.source !== 'habito'
                      );
                      const isSelected = d.date === selectedDate;
                      const isToday = d.date === TODAY;
                      return (
                        <button
                          key={d.date}
                          onClick={() => setSelectedDate(d.date)}
                          className="min-h-[82px] p-2 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer"
                          style={{
                            opacity: d.inMonth ? 1 : 0.3,
                            backgroundColor: isSelected
                              ? 'var(--accent-ochre-soft)'
                              : isToday
                              ? 'var(--accent-forest-soft)'
                              : 'var(--bg-surface)',
                            borderColor: isSelected
                              ? 'var(--accent-ochre)'
                              : isToday
                              ? 'var(--accent-forest)'
                              : 'var(--border-hairline)',
                          }}
                        >
                          <span className="text-xs font-bold">{d.day}</span>
                          <div className="space-y-0.5 overflow-hidden">
                            {dayItems.slice(0, 2).map((item) => (
                              <div
                                key={item.id}
                                className="text-[9px] px-1.5 py-0.5 rounded-md truncate text-white font-medium"
                                style={{ backgroundColor: item.color }}
                              >
                                {item.title}
                              </div>
                            ))}
                            {dayItems.length > 2 && (
                              <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                                +{dayItems.length - 2} mais
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'semana' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
              {WEEK_DATES.map((d) => {
                const items = allItems.filter((i) => i.date === d.date && i.source !== 'habito');
                const isToday = d.date === TODAY;
                return (
                  <div
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className="surface-card p-3 min-h-[320px] flex flex-col gap-2 cursor-pointer"
                    style={{
                      borderColor: isToday ? 'var(--accent-ochre)' : 'var(--border-hairline)',
                    }}
                  >
                    <p
                      className="text-xs font-bold pb-2 border-b"
                      style={{
                        borderColor: 'var(--border-hairline)',
                        color: isToday ? 'var(--accent-ochre)' : 'var(--text-primary)',
                      }}
                    >
                      {d.label}
                    </p>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl text-[11px] border-l-[3px]"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderLeftColor: item.color,
                        }}
                      >
                        <span className="font-semibold block leading-snug">{item.title}</span>
                        {item.time && (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {item.time}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {view === 'dia' && (
            <div className="surface-card p-6 space-y-3">
              <h2 className="font-serif-editorial text-2xl">
                Timeline · {selectedDate === TODAY ? 'Hoje, 24 de Novembro' : formatShortDate(selectedDate)}
              </h2>
              {selectedDayItems.length > 0 ? (
                selectedDayItems.map((item) => {
                  const meta = sourceBadge(item.source);
                  const Icon = meta.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3.5 rounded-2xl border"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-hairline)',
                      }}
                    >
                      <span className="text-xs font-bold w-12 shrink-0" style={{ color: item.color }}>
                        {item.time || 'Dia todo'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                          {meta.label} · {item.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  Dia livre! Nenhum item agendado para esta data.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Selected Day Summary */}
        <div className="xl:col-span-4 surface-card p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Resumo do dia selecionado
              </span>
              <h3 className="font-serif-editorial text-2xl">
                {selectedDate === TODAY ? 'Hoje · 24 nov' : formatShortDate(selectedDate)}
              </h3>
            </div>
            <button
              onClick={() => {
                setDate(selectedDate);
                setModalOpen(true);
              }}
              className="p-2 rounded-full text-white cursor-pointer"
              style={{ backgroundColor: 'var(--accent-forest)' }}
              title="Adicionar compromisso"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {selectedDayItems.length > 0 ? (
              selectedDayItems.map((item) => {
                const meta = sourceBadge(item.source);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border flex items-stretch justify-between gap-2.5"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                    }}
                  >
                    <span className="w-1 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: item.color }}
                      >
                        {meta.label}
                      </span>
                      <p className="text-xs font-semibold mt-0.5">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {item.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.time}
                          </span>
                        )}
                        {item.subtitle && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" /> {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.deletableEventId && (
                      <button
                        onClick={() => deleteEvent(item.deletableEventId!)}
                        className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-terracotta)' }} />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                Nenhum compromisso ou entrega nesta data.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[24px] border p-6 shadow-2xl animate-fade-in"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl">Novo compromisso</h3>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <input
                required
                placeholder="Título do evento ou reunião"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <CustomDatePicker size="sm" value={date} onChange={setDate} />
                <CustomTimePicker size="sm" value={startTime} onChange={setStartTime} />
                <CustomTimePicker size="sm" value={endTime} onChange={setEndTime} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  value={type}
                  onChange={(v) => setType(v as EventType)}
                  options={[
                    { value: 'reuniao', label: 'Reunião' },
                    { value: 'compromisso', label: 'Compromisso' },
                    { value: 'evento', label: 'Evento' },
                    { value: 'lembrete', label: 'Lembrete' },
                  ]}
                />
                <input
                  placeholder="Local ou Link"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-forest)' }}
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

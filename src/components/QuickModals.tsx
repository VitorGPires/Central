import React, { useState } from 'react';
import {
  WarningTriangle as AlertTriangle,
  Bell,
  Brain,
  Calendar,
  CheckCircle as CheckCircle2,
  CheckSquare,
  RefreshDouble as RotateCcw,
  Search,
  Sparks as Sparkles,
  User,
  Wallet,
  Xmark as X,
} from 'iconoir-react';
import { useApp } from '../context/AppContext';
import { TODAY } from '../data/seedData';
import type {
  ContentFormat,
  NoteCategory,
  SocialPlatform,
  TaskPeriod,
  TaskPriority,
} from '../types';
import { formatBRL } from '../utils/format';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomSelect } from './CustomSelect';
import { CustomTimePicker } from './CustomTimePicker';

export const QuickActionModal: React.FC = () => {
  const {
    quickAction,
    setQuickAction,
    projects,
    addTask,
    addTransaction,
    addEvent,
    addNote,
    addContent,
  } = useApp();

  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('media');
  const [taskDate, setTaskDate] = useState(TODAY);
  const [taskTime, setTaskTime] = useState('10:00');
  const [taskPeriod, setTaskPeriod] = useState<TaskPeriod>('manha');
  const [taskProject, setTaskProject] = useState('');

  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'despesa' | 'receita'>('despesa');
  const [txCategory, setTxCategory] = useState('Alimentação');

  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState(TODAY);
  const [evTime, setEvTime] = useState('14:00');
  const [evLocation, setEvLocation] = useState('');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<NoteCategory>('ideias');
  const [noteTags, setNoteTags] = useState('');

  const [cntTitle, setCntTitle] = useState('');
  const [cntPlatform, setCntPlatform] = useState<SocialPlatform>('Instagram');
  const [cntFormat, setCntFormat] = useState<ContentFormat>('Reels');
  const [cntDate, setCntDate] = useState(TODAY);

  if (!quickAction) return null;

  const close = () => setQuickAction(null);

  const tabs: {
    id: NonNullable<typeof quickAction>;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'task', label: 'Tarefa', icon: CheckSquare },
    { id: 'expense', label: 'Financeiro', icon: Wallet },
    { id: 'event', label: 'Compromisso', icon: Calendar },
    { id: 'note', label: 'Nota', icon: Brain },
    { id: 'content', label: 'Conteúdo', icon: Sparkles },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAction === 'task' && taskTitle.trim()) {
      addTask({
        title: taskTitle.trim(),
        priority: taskPriority,
        status: 'pendente',
        dueDate: taskDate,
        dueTime: taskTime,
        period: taskPeriod,
        projectId: taskProject || undefined,
        area: projects.find((p) => p.id === taskProject)?.area || 'Pessoal',
        subtasks: [],
      });
      setTaskTitle('');
      close();
    } else if (quickAction === 'expense' && txTitle.trim() && Number(txAmount) > 0) {
      addTransaction({
        title: txTitle.trim(),
        amount: Number(txAmount),
        type: txType,
        category: txCategory,
        date: TODAY,
        status: 'pago',
        kind: txType === 'despesa' ? 'variavel' : undefined,
      });
      setTxTitle('');
      setTxAmount('');
      close();
    } else if (quickAction === 'event' && evTitle.trim()) {
      addEvent({
        title: evTitle.trim(),
        date: evDate,
        startTime: evTime,
        type: 'compromisso',
        location: evLocation.trim() || undefined,
      });
      setEvTitle('');
      setEvLocation('');
      close();
    } else if (quickAction === 'note' && noteTitle.trim()) {
      addNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        tags: noteTags
          .split(',')
          .map((t) => t.trim().replace(/^#/, ''))
          .filter(Boolean),
        favorite: false,
        pinned: false,
      });
      setNoteTitle('');
      setNoteContent('');
      setNoteTags('');
      close();
    } else if (quickAction === 'content' && cntTitle.trim()) {
      addContent({
        title: cntTitle.trim(),
        platform: cntPlatform,
        format: cntFormat,
        status: 'ideia',
        publishDate: cntDate,
        publishTime: '18:00',
      });
      setCntTitle('');
      close();
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-hairline)',
    color: 'var(--text-primary)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={close}
    >
      <div
        className="w-full max-w-lg rounded-[24px] border p-6 shadow-2xl animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-hairline)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-display text-2xl" style={{ color: 'var(--text-primary)' }}>
            Captura rápida
          </h3>
          <button
            onClick={close}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer border-0 bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = quickAction === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setQuickAction(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border-0"
                style={{
                  backgroundColor: active ? 'var(--accent-forest)' : 'var(--bg-surface)',
                  color: active ? '#F8F5EE' : 'var(--text-secondary)',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {quickAction === 'task' && (
            <>
              <input
                autoFocus
                required
                placeholder="Qual tarefa precisa ser feita?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={inputStyle}
              />
              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  value={taskPriority}
                  onChange={(v) => setTaskPriority(v as TaskPriority)}
                  options={[
                    { value: 'baixa', label: 'Prioridade Baixa' },
                    { value: 'media', label: 'Prioridade Média' },
                    { value: 'alta', label: 'Prioridade Alta' },
                    { value: 'urgente', label: 'Prioridade Urgente' },
                  ]}
                />
                <CustomSelect
                  value={taskPeriod}
                  onChange={(v) => setTaskPeriod(v as TaskPeriod)}
                  options={[
                    { value: 'manha', label: 'Manhã' },
                    { value: 'tarde', label: 'Tarde' },
                    { value: 'noite', label: 'Noite' },
                    { value: 'qualquer', label: 'Qualquer hora' },
                  ]}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CustomDatePicker value={taskDate} onChange={setTaskDate} />
                <CustomTimePicker value={taskTime} onChange={setTaskTime} />
                <CustomSelect
                  value={taskProject}
                  onChange={setTaskProject}
                  options={[
                    { value: '', label: 'Sem projeto' },
                    ...projects.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>
            </>
          )}

          {quickAction === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {(['despesa', 'receita'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxType(t)}
                    className="py-2 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer border-0"
                    style={{
                      backgroundColor:
                        txType === t
                          ? t === 'receita'
                            ? 'var(--accent-forest)'
                            : 'var(--accent-terracotta)'
                          : 'var(--bg-surface)',
                      color: txType === t ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {t === 'receita' ? '+ Receita' : '- Despesa'}
                  </button>
                ))}
              </div>
              <input
                autoFocus
                required
                placeholder="Descrição do lançamento"
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={inputStyle}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                  style={inputStyle}
                />
                <CustomSelect
                  value={txCategory}
                  onChange={setTxCategory}
                  options={['Alimentação', 'Moradia', 'Lazer', 'Assinaturas', 'Saúde', 'Ferramentas', 'Projetos', 'Salário', 'Outros'].map(
                    (c) => ({ value: c, label: c })
                  )}
                />
              </div>
            </>
          )}

          {quickAction === 'event' && (
            <>
              <input
                autoFocus
                required
                placeholder="Título do compromisso ou reunião"
                value={evTitle}
                onChange={(e) => setEvTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={inputStyle}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CustomDatePicker value={evDate} onChange={setEvDate} />
                <CustomTimePicker value={evTime} onChange={setEvTime} />
                <input
                  placeholder="Local / Link"
                  value={evLocation}
                  onChange={(e) => setEvLocation(e.target.value)}
                  className="px-3 py-2 rounded-xl border text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {quickAction === 'note' && (
            <>
              <input
                autoFocus
                required
                placeholder="Título da nota ou ideia"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={inputStyle}
              />
              <textarea
                rows={3}
                placeholder="Escreva seus pensamentos, referências ou aprendizados..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-none"
                style={inputStyle}
              />
              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  value={noteCategory}
                  onChange={(v) => setNoteCategory(v as NoteCategory)}
                  options={[
                    { value: 'ideias', label: 'Ideias' },
                    { value: 'anotacoes', label: 'Anotações' },
                    { value: 'referencias', label: 'Referências' },
                    { value: 'aprendizados', label: 'Aprendizados' },
                    { value: 'projetos', label: 'Projetos' },
                    { value: 'insights', label: 'Insights' },
                    { value: 'links', label: 'Links' },
                  ]}
                />
                <input
                  placeholder="Tags separadas por vírgula"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="px-3 py-2 rounded-xl border text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {quickAction === 'content' && (
            <>
              <input
                autoFocus
                required
                placeholder="Título ou gancho do conteúdo"
                value={cntTitle}
                onChange={(e) => setCntTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={inputStyle}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CustomSelect
                  value={cntPlatform}
                  onChange={(v) => setCntPlatform(v as SocialPlatform)}
                  options={['Instagram', 'YouTube', 'Pinterest', 'X', 'TikTok', 'LinkedIn'].map((p) => ({
                    value: p,
                    label: p,
                  }))}
                />
                <CustomSelect
                  value={cntFormat}
                  onChange={(v) => setCntFormat(v as ContentFormat)}
                  options={['Reels', 'Stories', 'Carrossel', 'Feed', 'Vídeo'].map((f) => ({
                    value: f,
                    label: f,
                  }))}
                />
                <CustomDatePicker value={cntDate} onChange={setCntDate} />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer border-0"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer border-0"
              style={{ backgroundColor: 'var(--accent-forest)' }}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const GlobalSearchModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { tasks, notes, contents, transactions, setActiveModule } = useApp();
  const [query, setQuery] = useState('');

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matchedTasks = q
    ? tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 4)
    : tasks.slice(0, 3);
  const matchedNotes = q
    ? notes
        .filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tags.some((tg) => tg.toLowerCase().includes(q))
        )
        .slice(0, 4)
    : notes.slice(0, 3);
  const matchedContents = q
    ? contents.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 3)
    : contents.slice(0, 2);
  const matchedTx = q
    ? transactions.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const hasAny =
    matchedTasks.length + matchedNotes.length + matchedContents.length + matchedTx.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[24px] border overflow-hidden shadow-2xl animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-hairline)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar tarefas, notas, conteúdos, finanças..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            onClick={onClose}
            className="text-[11px] px-2 py-0.5 rounded-md border cursor-pointer bg-transparent"
            style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-muted)' }}
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!hasAny && (
            <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>
              {q ? 'Nenhum resultado encontrado.' : 'Comece adicionando tarefas, notas ou lançamentos para pesquisar aqui.'}
            </p>
          )}

          {matchedTasks.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Tarefas
              </p>
              {matchedTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveModule('tasks');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border-0 bg-transparent"
                >
                  <span>{t.title}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {t.dueDate}
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedNotes.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Segundo Cérebro
              </p>
              {matchedNotes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setActiveModule('brain');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border-0 bg-transparent"
                >
                  <span>{n.title}</span>
                  <span className="text-[11px] capitalize" style={{ color: 'var(--accent-ochre)' }}>
                    {n.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedContents.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Conteúdos
              </p>
              {matchedContents.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveModule('content');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border-0 bg-transparent"
                >
                  <span>{c.title}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {c.platform} · {c.format}
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedTx.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Financeiro
              </p>
              {matchedTx.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => {
                    setActiveModule('finance');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border-0 bg-transparent"
                >
                  <span>{tx.title}</span>
                  <span className="text-xs font-semibold">{formatBRL(tx.amount)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AlertsModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { tasks, transactions, budgets, setActiveModule } = useApp();

  if (!open) return null;

  const overdueTasks = tasks.filter((t) => t.status !== 'concluida' && t.dueDate < TODAY);
  const upcomingBills = transactions.filter(
    (t) => t.type === 'despesa' && t.status === 'pendente'
  );
  const overBudget = budgets.filter((b) => {
    const spent = transactions
      .filter((t) => t.type === 'despesa' && t.category === b.category)
      .reduce((acc, t) => acc + t.amount, 0);
    return spent > b.budget;
  });

  const empty = overdueTasks.length + upcomingBills.length + overBudget.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[22px] border p-5 shadow-2xl animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-hairline)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: 'var(--accent-ochre)' }} />
            <h3 className="font-semibold text-sm">Alertas Inteligentes</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 cursor-pointer border-0 bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>

        {empty ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 mx-auto" style={{ color: 'var(--accent-sage)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Tudo em dia! Nenhum alerta pendente.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {overdueTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveModule('tasks');
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border-0 flex items-start gap-2.5 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-terracotta-soft)' }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-terracotta)' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--accent-terracotta)' }}>
                    Tarefa atrasada ({t.dueDate})
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {t.title}
                  </p>
                </div>
              </button>
            ))}

            {overBudget.map((b) => (
              <button
                key={b.category}
                onClick={() => {
                  setActiveModule('finance');
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border-0 flex items-start gap-2.5 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-ochre-soft)' }}
              >
                <Wallet className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-ochre)' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--accent-ochre)' }}>
                    Orçamento excedido: {b.category}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Limite de {formatBRL(b.budget)} ultrapassado.
                  </p>
                </div>
              </button>
            ))}

            {upcomingBills.map((tx) => (
              <button
                key={tx.id}
                onClick={() => {
                  setActiveModule('finance');
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <Calendar className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-forest)' }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Conta a vencer · {tx.date}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {tx.title} — {formatBRL(tx.amount)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfileModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { user, updateUser, resetAllData } = useApp();
  const [name, setName] = useState(user.name === 'Visitante' ? '' : user.name);
  const [role, setRole] = useState(user.role);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!open) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim() || 'Visitante';
    const initials = clean
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    updateUser({ name: clean, role: role.trim() || 'Gestão Pessoal & Profissional', avatarInitials: initials });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] border p-6 shadow-2xl animate-fade-in"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: 'var(--accent-ochre)' }} />
            <h3 className="font-serif-display text-2xl">Personalizar Perfil</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 cursor-pointer border-0 bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Seu nome (exibido na saudação matinal)
            </label>
            <input
              placeholder="Ex: Maria, João..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Papel / Foco atual
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 text-xs font-medium cursor-pointer border-0 bg-transparent"
                style={{ color: 'var(--accent-terracotta)' }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar todos os dados
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setConfirmClear(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white cursor-pointer border-0"
                  style={{ backgroundColor: 'var(--accent-terracotta)' }}
                >
                  Confirmar limpeza
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="text-[11px] cursor-pointer border-0 bg-transparent"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Cancelar
                </button>
              </div>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer border-0"
              style={{ backgroundColor: 'var(--accent-forest)' }}
            >
              Salvar perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

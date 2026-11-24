import React, { useMemo, useState } from 'react';
import {
  WarningTriangle as AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle as CheckCircle2,
  CreditCard,
  Plus,
  Repeat,
  Archery as Target,
  Trash as Trash2,
  Xmark as X,
} from 'iconoir-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../components/Button';
import { CustomColorPicker } from '../components/CustomColorPicker';
import { CustomDatePicker } from '../components/CustomDatePicker';
import {
  CARD_MODELS,
  InteractiveFinanceCard,
  buildCustomGradient,
  getCardModel,
} from '../components/CardFolder';
import { CustomSelect } from '../components/CustomSelect';
import { useApp } from '../context/AppContext';
import { TODAY } from '../data/seedData';
import { DragGrip, useDraggableOrder } from '../hooks/useDraggableOrder';
import type { CardBrand, ExpenseKind, TransactionStatus, TransactionType } from '../types';
import { formatBRL, formatDayMonth, formatMonthYearPt, formatShortDate } from '../utils/format';

export const FinanceModule: React.FC = () => {
  const {
    transactions,
    accounts,
    budgets,
    goals,
    projects,
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
  } = useApp();

  const [txTab, setTxTab] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [chartMode, setChartMode] = useState<'fluxo' | 'comparativo'>('fluxo');
  const [txModal, setTxModal] = useState<TransactionType | null>(null);
  const [cardModal, setCardModal] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);

  const kpiDrag = useDraggableOrder('finance_kpis', [
    'saldo',
    'receitas',
    'despesas',
    'lucro',
    'pagar',
    'receber',
  ] as const);
  const leftDrag = useDraggableOrder('finance_left_v2', ['chart', 'cards'] as const);
  const rightDrag = useDraggableOrder('finance_right_v2', [
    'transactions',
    'budgets',
    'subscriptions',
    'goals',
  ] as const);
  const hasCustomFinanceOrder =
    kpiDrag.isCustom || leftDrag.isCustom || rightDrag.isCustom;

  // New transaction form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [date, setDate] = useState(TODAY);
  const [status, setStatus] = useState<TransactionStatus>('pago');
  const [kind, setKind] = useState<ExpenseKind>('variavel');
  const [isSubscription, setIsSubscription] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [projectId, setProjectId] = useState('');

  // New account/card form
  const [cardBrand, setCardBrand] = useState<CardBrand>('nubank');
  const [cardType, setCardType] = useState<'credito' | 'corrente' | 'investimento'>('credito');
  const [cardName, setCardName] = useState('Nubank');
  const [cardHolder, setCardHolder] = useState('');
  const [cardLimit, setCardLimit] = useState('5000');
  const [cardInvoice, setCardInvoice] = useState('');
  const [cardDueDay, setCardDueDay] = useState('10');
  const [cardClosingDay, setCardClosingDay] = useState('3');
  const [cardLast4, setCardLast4] = useState('');
  const [cardCustomColor, setCardCustomColor] = useState('#6953F5');

  // New budget form
  const [budgetCat, setBudgetCat] = useState('Alimentação');
  const [budgetLimit, setBudgetLimit] = useState('');

  // New goal form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');

  const stats = useMemo(() => {
    const receitasPagas = transactions
      .filter((t) => t.type === 'receita' && t.status === 'pago')
      .reduce((a, t) => a + t.amount, 0);
    const despesasPagas = transactions
      .filter((t) => t.type === 'despesa' && t.status === 'pago')
      .reduce((a, t) => a + t.amount, 0);
    const aPagar = transactions
      .filter((t) => t.type === 'despesa' && t.status === 'pendente')
      .reduce((a, t) => a + t.amount, 0);
    const aReceber = transactions
      .filter((t) => t.type === 'receita' && t.status === 'pendente')
      .reduce((a, t) => a + t.amount, 0);
    const fixas = transactions
      .filter((t) => t.type === 'despesa' && t.kind === 'fixa')
      .reduce((a, t) => a + t.amount, 0);
    const variaveis = transactions
      .filter((t) => t.type === 'despesa' && t.kind === 'variavel')
      .reduce((a, t) => a + t.amount, 0);
    const saldoAtual = accounts
      .filter((a) => a.type !== 'credito')
      .reduce((sum, a) => sum + a.balance, 0);
    return {
      receitasPagas,
      despesasPagas,
      lucro: receitasPagas - despesasPagas,
      aPagar,
      aReceber,
      fixas,
      variaveis,
      saldoAtual,
    };
  }, [transactions, accounts]);

  const budgetRows = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.type === 'despesa' && t.category === b.category)
        .reduce((a, t) => a + t.amount, 0);
      const pct = Math.min(100, Math.round((spent / b.budget) * 100));
      return { ...b, spent, pct, exceeded: spent > b.budget };
    });
  }, [budgets, transactions]);

  const nowDt = new Date(`${TODAY}T12:00:00`);
  const monthLabel = formatMonthYearPt(nowDt.getFullYear(), nowDt.getMonth());

  const dailyFlow = useMemo(() => {
    const map: Record<string, { day: string; entradas: number; saidas: number }> = {};
    transactions.forEach((t) => {
      const key = t.date;
      if (!map[key]) map[key] = { day: formatDayMonth(t.date), entradas: 0, saidas: 0 };
      if (t.type === 'receita') map[key].entradas += t.amount;
      else map[key].saidas += t.amount;
    });
    return Object.values(map).sort((a, b) => a.day.localeCompare(b.day));
  }, [transactions]);

  const monthlyComparison = useMemo(() => {
    const map: Record<string, { month: string; receitas: number; despesas: number }> = {};
    const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    transactions.forEach((t) => {
      const ym = t.date.slice(0, 7);
      const mIdx = Number(t.date.slice(5, 7)) - 1;
      if (!map[ym]) map[ym] = { month: names[mIdx] || ym, receitas: 0, despesas: 0 };
      if (t.type === 'receita') map[ym].receitas += t.amount;
      else map[ym].despesas += t.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [transactions]);

  const filteredTx = transactions.filter((t) =>
    txTab === 'todos' ? true : t.type === txTab
  );

  const subscriptions = transactions.filter((t) => t.isSubscription);
  const overBudgetAlerts = budgetRows.filter((b) => b.exceeded);
  const pendingBills = transactions.filter(
    (t) => t.type === 'despesa' && t.status === 'pendente'
  );

  const getCardInvoiceTotal = (accId: string, baseInvoice = 0) => {
    const linked = transactions
      .filter((t) => t.type === 'despesa' && t.accountId === accId)
      .reduce((sum, t) => sum + t.amount, 0);
    return baseInvoice + linked;
  };

  const combinedInvoiceTotal = accounts.reduce(
    (sum, acc) =>
      acc.type === 'credito'
        ? sum + getCardInvoiceTotal(acc.id, acc.invoiceAmount || 0)
        : sum,
    0
  );

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txModal || !title.trim() || Number(amount) <= 0) return;
    addTransaction({
      title: title.trim(),
      amount: Number(amount),
      type: txModal,
      category,
      date,
      status,
      kind: txModal === 'despesa' ? kind : undefined,
      isSubscription: txModal === 'despesa' ? isSubscription : false,
      accountId: accountId || undefined,
      projectId: projectId || undefined,
    });
    setTitle('');
    setAmount('');
    setAccountId('');
    setTxModal(null);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const model = getCardModel(cardBrand);
    addAccount({
      name: cardName.trim() || model.defaultName,
      holder: cardHolder.trim() || 'Titular',
      type: cardType,
      balance: Number(cardLimit) || 0,
      limit: cardType === 'credito' ? Number(cardLimit) || 5000 : undefined,
      invoiceAmount: cardType === 'credito' ? Number(cardInvoice) || 0 : undefined,
      dueDay: cardType === 'credito' ? Math.min(31, Math.max(1, Number(cardDueDay) || 10)) : undefined,
      closingDay:
        cardType === 'credito' ? Math.min(31, Math.max(1, Number(cardClosingDay) || 3)) : undefined,
      last4: cardLast4.replace(/\D/g, '').slice(-4) || undefined,
      customColor: cardBrand === 'custom' ? cardCustomColor : undefined,
      theme: 'purple',
      brand: cardBrand,
    });
    setCardBrand('nubank');
    setCardType('credito');
    setCardName('Nubank');
    setCardHolder('');
    setCardInvoice('');
    setCardLast4('');
    setCardCustomColor('#6953F5');
    setCardModal(false);
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetLimit || Number(budgetLimit) <= 0) return;
    addBudget({
      category: budgetCat,
      budget: Number(budgetLimit),
      color: '#6953F5',
    });
    setBudgetLimit('');
    setBudgetModal(false);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || Number(goalTarget) <= 0) return;
    addGoal({
      title: goalTitle.trim(),
      target: Number(goalTarget),
      current: Number(goalCurrent) || 0,
      deadline: TODAY,
      color: '#6953F5',
    });
    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('0');
    setGoalModal(false);
  };


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header matching Reference #5 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Minha Central &nbsp;/&nbsp; Financeiro
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-serif-display text-4xl leading-none">Financeiro</h1>
            <span
              className="font-serif-editorial italic text-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              Vida financeira · {monthLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasCustomFinanceOrder && (
            <Button
              variant="soft"
              size="md"
              onClick={() => {
                kpiDrag.resetOrder();
                leftDrag.resetOrder();
                rightDrag.resetOrder();
              }}
            >
              Restaurar ordem
            </Button>
          )}
          <Button
            variant="danger"
            size="md"
            leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            onClick={() => {
              setCategory('Alimentação');
              setTxModal('despesa');
            }}
          >
            Nova saída
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setCategory('Projetos');
              setTxModal('receita');
            }}
          >
            Nova entrada
          </Button>
        </div>
      </div>

      {/* Smart Financial Alerts */}
      {(overBudgetAlerts.length > 0 || pendingBills.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {overBudgetAlerts.map((b) => (
            <div
              key={b.category}
              className="px-4 py-3 rounded-2xl flex items-center gap-3 text-xs"
              style={{
                backgroundColor: 'var(--accent-terracotta-soft)',
                color: 'var(--accent-terracotta)',
              }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Alerta de orçamento:</strong> {b.category} atingiu{' '}
                <strong>{formatBRL(b.spent)}</strong> (limite de {formatBRL(b.budget)}).
              </span>
            </div>
          ))}
          {pendingBills.length > 0 && (
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-3 text-xs"
              style={{
                backgroundColor: 'var(--accent-ochre-soft)',
                color: 'var(--accent-ochre)',
              }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Contas a pagar:</strong> {pendingBills.length} vencimentos próximos
                totalizando <strong>{formatBRL(stats.aPagar)}</strong>.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Top KPI Row (Draggable!) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiDrag.order.map((kpiId) => {
          const map = {
            saldo: { label: 'Saldo em conta', value: formatBRL(stats.saldoAtual), color: 'var(--text-primary)' },
            receitas: { label: 'Receitas do mês', value: formatBRL(stats.receitasPagas), color: 'var(--accent-forest)' },
            despesas: { label: 'Despesas do mês', value: formatBRL(stats.despesasPagas), color: 'var(--accent-terracotta)' },
            lucro: { label: 'Resultado líquido', value: formatBRL(stats.lucro), color: 'var(--accent-ochre)' },
            pagar: { label: 'Contas a pagar', value: formatBRL(stats.aPagar), color: 'var(--accent-terracotta)' },
            receber: { label: 'Contas a receber', value: formatBRL(stats.aReceber), color: 'var(--accent-blue)' },
          };
          const kpi = map[kpiId];
          return (
            <div
              key={kpiId}
              {...kpiDrag.getDragProps(kpiId)}
              className={`surface-card p-4 cursor-grab active:cursor-grabbing ${kpiDrag.getDragClasses(kpiId)}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider truncate"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {kpi.label}
                </span>
                <DragGrip />
              </div>
              <span className="font-serif-display text-2xl sm:text-[26px] leading-none tabular-nums" style={{ color: kpi.color }}>
                {kpi.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Split Grid (Matching Reference #5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 cols: Main Chart + Cards + Financial Goals (Draggable!) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Saldo & Chart Card */}
          <div
            {...leftDrag.getDragProps('chart')}
            style={{ order: leftDrag.order.indexOf('chart') }}
            className={`surface-card p-6 ${leftDrag.getDragClasses('chart')}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <DragGrip />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Lucro líquido do mês
                  </span>
                </div>
                <p className="font-serif-display text-4xl mt-1">{formatBRL(stats.lucro)}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Fixas: {formatBRL(stats.fixas)} · Variáveis: {formatBRL(stats.variaveis)}
                </p>
              </div>

              <div
                className="inline-flex p-1 rounded-full border"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
              >
                <button
                  onClick={() => setChartMode('fluxo')}
                  className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: chartMode === 'fluxo' ? 'var(--accent-forest)' : 'transparent',
                    color: chartMode === 'fluxo' ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  Fluxo do mês
                </button>
                <button
                  onClick={() => setChartMode('comparativo')}
                  className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: chartMode === 'comparativo' ? 'var(--accent-forest)' : 'transparent',
                    color: chartMode === 'comparativo' ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  Receitas × Despesas
                </button>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'fluxo' ? (
                  <BarChart data={dailyFlow}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => formatBRL(Number(v))}
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="entradas" name="Entradas" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="#6953F5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => formatBRL(Number(v))}
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="receitas" name="Receitas" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="despesas" name="Despesas" fill="#6953F5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cartões & Contas (Draggable!) */}
          <div
            {...leftDrag.getDragProps('cards')}
            style={{ order: leftDrag.order.indexOf('cards') }}
            className={`surface-card p-6 ${leftDrag.getDragClasses('cards')}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <DragGrip />
                  <h3 className="font-serif-editorial text-xl">Cartões &amp; Contas</h3>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Fatura atual combinada:{' '}
                  <strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {formatBRL(combinedInvoiceTotal)}
                  </strong>
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setCardModal(true)}
              >
                Novo cartão
              </Button>
            </div>

            {accounts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {accounts.map((acc) => (
                  <InteractiveFinanceCard
                    key={acc.id}
                    account={acc}
                    computedInvoice={getCardInvoiceTotal(acc.id, acc.invoiceAmount || 0)}
                    onAddExpenseToCard={(accId) => {
                      setAccountId(accId);
                      setCategory('Alimentação');
                      setStatus('pendente');
                      setTxModal('despesa');
                    }}
                    onDelete={deleteAccount}
                  />
                ))}
              </div>
            ) : (
              <div
                className="p-6 rounded-2xl border border-dashed text-center space-y-2.5"
                style={{
                  borderColor: 'var(--border-strong)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <CreditCard
                  className="w-6 h-6 mx-auto"
                  style={{ color: 'var(--accent-violet)' }}
                />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Nenhum cartão ou conta cadastrado ainda.
                </p>
                <button
                  onClick={() => setCardModal(true)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white border-0 cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-violet)' }}
                >
                  + Adicionar primeiro cartão
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Lançamentos + Orçamento + Assinaturas + Metas (Draggable!) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Lançamentos */}
          <div
            {...rightDrag.getDragProps('transactions')}
            style={{ order: rightDrag.order.indexOf('transactions') }}
            className={`surface-card p-5 ${rightDrag.getDragClasses('transactions')}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DragGrip />
                <h3 className="font-serif-editorial text-xl">Lançamentos</h3>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {filteredTx.length} itens
              </span>
            </div>

            <div className="flex gap-1.5 mb-3">
              {(['todos', 'receita', 'despesa'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTxTab(tab)}
                  className="px-3 py-1 rounded-full text-xs font-medium capitalize cursor-pointer"
                  style={{
                    backgroundColor:
                      txTab === tab ? 'var(--accent-forest)' : 'var(--bg-surface)',
                    color: txTab === tab ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {tab === 'todos' ? 'Todos' : tab === 'receita' ? 'Entradas' : 'Saídas'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => {
                  setCategory('Alimentação');
                  setTxModal('despesa');
                }}
                className="py-2 rounded-xl border border-dashed text-xs font-medium cursor-pointer hover:opacity-80"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
              >
                + Nova saída
              </button>
              <button
                onClick={() => {
                  setCategory('Projetos');
                  setTxModal('receita');
                }}
                className="py-2 rounded-xl border border-dashed text-xs font-medium cursor-pointer hover:opacity-80"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
              >
                + Nova entrada
              </button>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredTx.map((tx) => {
                const proj = projects.find((p) => p.id === tx.projectId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl border group"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor:
                            tx.type === 'receita'
                              ? 'var(--accent-forest-soft)'
                              : 'var(--accent-terracotta-soft)',
                          color:
                            tx.type === 'receita'
                              ? 'var(--accent-forest)'
                              : 'var(--accent-terracotta)',
                        }}
                      >
                        {tx.type === 'receita' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{tx.title}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                          {tx.category} · {formatShortDate(tx.date)}
                          {proj ? ` · ${proj.name}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span
                          className="text-xs font-bold block"
                          style={{
                            color:
                              tx.type === 'receita'
                                ? 'var(--accent-forest)'
                                : 'var(--text-primary)',
                          }}
                        >
                          {tx.type === 'receita' ? '+' : '-'} {formatBRL(tx.amount)}
                        </span>
                        <button
                          onClick={() =>
                            updateTransaction(tx.id, {
                              status: tx.status === 'pago' ? 'pendente' : 'pago',
                            })
                          }
                          className="text-[9px] font-semibold uppercase tracking-wider cursor-pointer"
                          style={{
                            color:
                              tx.status === 'pago'
                                ? 'var(--accent-sage)'
                                : 'var(--accent-ochre)',
                          }}
                        >
                          {tx.status === 'pago' ? '✓ Pago' : '● Pendente'}
                        </button>
                      </div>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-terracotta)' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gastos por Categoria (Orçamento) */}
          <div
            {...rightDrag.getDragProps('budgets')}
            style={{ order: rightDrag.order.indexOf('budgets') }}
            className={`surface-card p-5 ${rightDrag.getDragClasses('budgets')}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DragGrip />
                <h3 className="font-serif-editorial text-xl">Gastos por categoria</h3>
              </div>
              <button
                onClick={() => setBudgetModal(true)}
                className="text-xs font-semibold border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--accent-violet)' }}
              >
                + Orçamento
              </button>
            </div>

            <div className="space-y-3.5">
              {budgetRows.map((row) => (
                <div key={row.category} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium flex items-center gap-1.5">
                      {row.category}
                      <button
                        type="button"
                        onClick={() => deleteBudget(row.category)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity border-0 bg-transparent p-0.5 cursor-pointer"
                        title="Excluir orçamento"
                      >
                        <Trash2 className="w-3 h-3" style={{ color: 'var(--accent-terracotta)' }} />
                      </button>
                    </span>
                    <span>
                      <strong
                        style={{
                          color: row.exceeded ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                        }}
                      >
                        {formatBRL(row.spent)}
                      </strong>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>
                        de {formatBRL(row.budget)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${row.pct}%`,
                        backgroundColor: row.exceeded ? '#B85334' : row.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assinaturas Recorrentes */}
          <div
            {...rightDrag.getDragProps('subscriptions')}
            style={{ order: rightDrag.order.indexOf('subscriptions') }}
            className={`surface-card p-5 ${rightDrag.getDragClasses('subscriptions')}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DragGrip />
                <Repeat className="w-4 h-4" style={{ color: 'var(--accent-ochre)' }} />
                <h3 className="font-serif-editorial text-xl">Assinaturas</h3>
              </div>
              <span className="text-xs font-bold">
                {formatBRL(subscriptions.reduce((a, s) => a + s.amount, 0))}/mês
              </span>
            </div>
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b last:border-0"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-sage)' }} />
                    {sub.title}
                  </span>
                  <span className="font-semibold">{formatBRL(sub.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metas Financeiras (Draggable below Assinaturas!) */}
          <div
            {...rightDrag.getDragProps('goals')}
            style={{ order: rightDrag.order.indexOf('goals') }}
            className={`surface-card p-5 ${rightDrag.getDragClasses('goals')}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DragGrip />
                <Target className="w-4 h-4" style={{ color: 'var(--accent-ochre)' }} />
                <h3 className="font-serif-editorial text-xl">Metas financeiras</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setGoalModal(true)}
              >
                Nova meta
              </Button>
            </div>
            <div className="space-y-3">
              {goals.map((g) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <div key={g.id} className="p-3.5 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{g.title}</p>
                        <p className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                          {formatBRL(g.current)} de {formatBRL(g.target)} ({pct}%)
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateGoalProgress(g.id, 250)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-white border-0 cursor-pointer"
                          style={{ backgroundColor: g.color }}
                        >
                          + R$ 250
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGoal(g.id)}
                          className="p-1 rounded-lg border-0 bg-transparent opacity-60 hover:opacity-100 cursor-pointer"
                          title="Excluir meta"
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-terracotta)' }} />
                        </button>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: g.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {txModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setTxModal(null)}
        >
          <div
            className="w-full max-w-md rounded-[24px] border p-6 shadow-2xl animate-fade-in"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl">
                {txModal === 'receita' ? 'Nova receita' : 'Nova despesa'}
              </h3>
              <button onClick={() => setTxModal(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTx} className="space-y-3">
              <input
                required
                placeholder="Descrição"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
                <CustomDatePicker value={date} onChange={setDate} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  value={category}
                  onChange={setCategory}
                  options={['Moradia', 'Alimentação', 'Lazer', 'Assinaturas', 'Saúde', 'Ferramentas', 'Projetos', 'Salário', 'Consultoria', 'Outros'].map(
                    (c) => ({ value: c, label: c })
                  )}
                />
                <CustomSelect
                  value={status}
                  onChange={(v) => setStatus(v as TransactionStatus)}
                  options={[
                    { value: 'pago', label: 'Pago / Recebido' },
                    { value: 'pendente', label: 'Pendente (a vencer)' },
                  ]}
                />
              </div>
              {txModal === 'despesa' && (
                <div className="grid grid-cols-2 gap-3 items-center">
                  <CustomSelect
                    value={kind}
                    onChange={(v) => setKind(v as ExpenseKind)}
                    options={[
                      { value: 'variavel', label: 'Despesa Variável' },
                      { value: 'fixa', label: 'Despesa Fixa' },
                    ]}
                  />
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSubscription}
                      onChange={(e) => setIsSubscription(e.target.checked)}
                    />
                    É assinatura recorrente
                  </label>
                </div>
              )}
              {accounts.length > 0 && (
                <CustomSelect
                  value={accountId}
                  onChange={setAccountId}
                  options={[
                    { value: '', label: 'Pagamento à vista / Sem cartão' },
                    ...accounts.map((a) => ({
                      value: a.id,
                      label: `Cartão: ${a.name}`,
                    })),
                  ]}
                />
              )}
              <CustomSelect
                value={projectId}
                onChange={setProjectId}
                options={[
                  { value: '', label: 'Vincular a um projeto (opcional)' },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTxModal(null)}
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
                  Salvar lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Card Modal */}
      {cardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setCardModal(false)}
        >
          <div
            className="w-full max-w-md rounded-[24px] border p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl">Novo cartão / conta</h3>
              <button onClick={() => setCardModal(false)} className="border-0 bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="space-y-3.5">
              {/* Live Preview Mini Card */}
              <div
                className="relative h-24 rounded-2xl p-4 text-white overflow-hidden flex flex-col justify-between shadow-md transition-all"
                style={{
                  background:
                    cardBrand === 'custom'
                      ? buildCustomGradient(cardCustomColor)
                      : getCardModel(cardBrand).gradient,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold tracking-tight">
                      {cardBrand === 'custom'
                        ? cardName.trim() || 'MEU CARTÃO'
                        : getCardModel(cardBrand).badgeText}
                    </span>
                    {getCardModel(cardBrand).subBadge && (
                      <span
                        className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/15"
                        style={{ color: getCardModel(cardBrand).accent }}
                      >
                        {getCardModel(cardBrand).subBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono opacity-80">
                    •••• {cardLast4.replace(/\D/g, '').slice(-4).padStart(4, '•')}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-[10px] uppercase tracking-widest opacity-80">
                    {cardHolder.trim() || 'SEU NOME'}
                  </span>
                  <span className="text-xs font-semibold tabular-nums">
                    {formatBRL(Number(cardLimit) || 0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Banco / Modelo
                  </label>
                  <CustomSelect
                    size="sm"
                    value={cardBrand}
                    onChange={(v) => {
                      const nextBrand = v as CardBrand;
                      setCardBrand(nextBrand);
                      setCardName(getCardModel(nextBrand).defaultName);
                    }}
                    options={CARD_MODELS.map((m) => ({ value: m.id, label: m.label }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Tipo
                  </label>
                  <CustomSelect
                    size="sm"
                    value={cardType}
                    onChange={(v) => setCardType(v as 'credito' | 'corrente' | 'investimento')}
                    options={[
                      { value: 'credito', label: 'Cartão de Crédito' },
                      { value: 'corrente', label: 'Conta Corrente' },
                      { value: 'investimento', label: 'Investimentos' },
                    ]}
                  />
                </div>
              </div>

              {/* Custom Color Picker when Personalizado is selected */}
              {cardBrand === 'custom' && (
                <div
                  className="p-3 rounded-xl border space-y-2"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Cor do cartão personalizado
                    </span>
                    <CustomColorPicker
                      value={cardCustomColor}
                      onChange={setCardCustomColor}
                      variant="pill"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '#6953F5',
                      '#0EA5E9',
                      '#10B981',
                      '#F59E0B',
                      '#EF4444',
                      '#EC4899',
                      '#14B8A6',
                      '#334155',
                    ].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setCardCustomColor(hex)}
                        className="w-6 h-6 rounded-full border-0 cursor-pointer transition-transform hover:scale-110"
                        style={{
                          backgroundColor: hex,
                          outline: cardCustomColor === hex ? '2px solid var(--text-primary)' : 'none',
                          outlineOffset: '2px',
                        }}
                        aria-label={`Cor ${hex}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  required
                  placeholder="Nome do cartão"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="sm:col-span-2 px-3 py-2.5 rounded-xl border text-xs outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
                <input
                  maxLength={4}
                  placeholder="Final (4 díg.)"
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="px-3 py-2.5 rounded-xl border text-xs font-mono outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <input
                placeholder="Nome do titular"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />

              {cardType === 'credito' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder="Limite (R$)"
                    value={cardLimit}
                    onChange={(e) => setCardLimit(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border text-xs outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Fatura atual"
                    value={cardInvoice}
                    onChange={(e) => setCardInvoice(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border text-xs outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Fecha dia"
                    value={cardClosingDay}
                    onChange={(e) => setCardClosingDay(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border text-xs outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Vence dia"
                    value={cardDueDay}
                    onChange={(e) => setCardDueDay(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border text-xs outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  placeholder={cardType === 'investimento' ? 'Valor investido (R$)' : 'Saldo atual (R$)'}
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Adicionar cartão
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* Budget Modal */}
      {budgetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setBudgetModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-[24px] border p-6 shadow-2xl animate-fade-in"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl">Definir orçamento</h3>
              <button onClick={() => setBudgetModal(false)} className="border-0 bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddBudget} className="space-y-3">
              <CustomSelect
                value={budgetCat}
                onChange={setBudgetCat}
                options={['Moradia', 'Alimentação', 'Lazer', 'Assinaturas', 'Saúde', 'Ferramentas', 'Outros'].map(
                  (c) => ({ value: c, label: c })
                )}
              />
              <input
                required
                type="number"
                step="0.01"
                placeholder="Limite mensal (R$)"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white border-0 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-forest)' }}
              >
                Salvar orçamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {goalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setGoalModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-[24px] border p-6 shadow-2xl animate-fade-in"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl">Nova meta financeira</h3>
              <button onClick={() => setGoalModal(false)} className="border-0 bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-3">
              <input
                required
                placeholder="Nome da meta (ex: Reserva de emergência)"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Objetivo (R$)"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Já guardado"
                  value={goalCurrent}
                  onChange={(e) => setGoalCurrent(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white border-0 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-forest)' }}
              >
                Criar meta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

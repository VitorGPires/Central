import React, { useMemo, useState } from 'react';
import {
  StatsUpSquare as BarChart3,
  Bookmark,
  Calendar as CalendarIcon,
  CheckCircle as CheckCircle2,
  Eye,
  Heart,
  Link as Link2,
  ChatBubble as MessageCircle,
  Plus,
  ShareAndroid as Share2,
  Sparks as Sparkles,
  Trash as Trash2,
  GraphUp as TrendingUp,
  CodeBrackets as Webhook,
  Xmark as X,
} from 'iconoir-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { Button } from '../components/Button';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSelect } from '../components/CustomSelect';
import { CustomTimePicker } from '../components/CustomTimePicker';
import { useApp } from '../context/AppContext';
import { TODAY } from '../data/seedData';
import type {
  ContentFormat,
  ContentItem,
  ContentStatus,
  SocialPlatform,
} from '../types';
import { formatDayMonth, formatMonthYearPt, formatNumber, getMonthDays } from '../utils/format';

type ContentTab = 'analytics' | 'etapas' | 'calendario' | 'metricas';

const PLATFORMS: (SocialPlatform | 'Todas')[] = [
  'Todas',
  'Instagram',
  'YouTube',
  'Pinterest',
  'X',
  'TikTok',
  'LinkedIn',
];

const STAGES: { id: ContentStatus; label: string; color: string }[] = [
  { id: 'ideia', label: 'Ideia', color: '#8A8072' },
  { id: 'planejamento', label: 'Planejamento', color: '#4A6B8A' },
  { id: 'producao', label: 'Produção', color: '#D67E26' },
  { id: 'revisao', label: 'Revisão', color: '#6B4C9A' },
  { id: 'agendado', label: 'Agendado', color: '#5C7A5E' },
  { id: 'publicado', label: 'Publicado', color: '#2B412D' },
];

export const ContentModule: React.FC = () => {
  const {
    contents,
    dailyMetrics,
    platformFollowers,
    projects,
    addContent,
    updateContent,
    deleteContent,
    generateTasksFromContent,
    addDailyMetric,
  } = useApp();

  const [tab, setTab] = useState<ContentTab>('analytics');
  const [dragContentId, setDragContentId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<ContentStatus | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform | 'Todas'>('Todas');
  const [period, setPeriod] = useState<'7d' | '14d' | '30d'>('30d');

  // Content Editor Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [title, setTitle] = useState('');
  const [cntPlatform, setCntPlatform] = useState<SocialPlatform>('Instagram');
  const [format, setFormat] = useState<ContentFormat>('Reels');
  const [status, setStatus] = useState<ContentStatus>('ideia');
  const [publishDate, setPublishDate] = useState(TODAY);
  const [publishTime, setPublishTime] = useState('18:00');
  const [caption, setCaption] = useState('');
  const [script, setScript] = useState('');
  const [assetLink, setAssetLink] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');

  // Manual metric entry
  const [metricDate, setMetricDate] = useState('25/11');
  const [metricReach, setMetricReach] = useState('');
  const [metricImpressions, setMetricImpressions] = useState('');
  const [metricEng, setMetricEng] = useState('4.8');
  const [metricSaved, setMetricSaved] = useState(false);

  const filteredContents = useMemo(
    () =>
      platform === 'Todas'
        ? contents
        : contents.filter((c) => c.platform === platform),
    [contents, platform]
  );

  const stageCounts = useMemo(
    () =>
      STAGES.map((st) => ({
        name: st.label.slice(0, 6),
        full: st.label,
        count: filteredContents.filter((c) => c.status === st.id).length,
      })),
    [filteredContents]
  );

  const aggMetrics = useMemo(() => {
    const withMetrics = filteredContents.filter((c) => c.metrics);
    const reach = dailyMetrics.reduce((a, m) => a + m.reach, 0);
    const impressions = dailyMetrics.reduce((a, m) => a + m.impressions, 0);
    const views = withMetrics.reduce((a, c) => a + (c.metrics?.views || 0), 0);
    const likes = withMetrics.reduce((a, c) => a + (c.metrics?.likes || 0), 0);
    const comments = withMetrics.reduce((a, c) => a + (c.metrics?.comments || 0), 0);
    const shares = withMetrics.reduce((a, c) => a + (c.metrics?.shares || 0), 0);
    const saves = withMetrics.reduce((a, c) => a + (c.metrics?.saves || 0), 0);
    const interactions = likes + comments + shares + saves;
    const engRate = reach > 0 ? ((interactions / reach) * 100).toFixed(2) : '0.00';
    return { reach, impressions, views, likes, comments, shares, saves, interactions, engRate };
  }, [filteredContents, dailyMetrics]);

  const topContents = useMemo(() => {
    return [...filteredContents]
      .filter((c) => c.metrics)
      .sort((a, b) => (b.metrics?.reach || 0) - (a.metrics?.reach || 0))
      .slice(0, 3);
  }, [filteredContents]);

  const nowDt = new Date(`${TODAY}T12:00:00`);
  const monthLabel = formatMonthYearPt(nowDt.getFullYear(), nowDt.getMonth());
  const monthDays = useMemo(
    () => getMonthDays(nowDt.getFullYear(), nowDt.getMonth()),
    [nowDt.getFullYear(), nowDt.getMonth()]
  );
  const bestDayReach = useMemo(
    () => dailyMetrics.reduce((max, m) => Math.max(max, m.reach), 0),
    [dailyMetrics]
  );

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setCntPlatform('Instagram');
    setFormat('Reels');
    setStatus('ideia');
    setPublishDate(TODAY);
    setPublishTime('18:00');
    setCaption('');
    setScript('');
    setAssetLink('');
    setProjectId(projects[0]?.id || '');
    setModalOpen(true);
  };

  const openEdit = (c: ContentItem) => {
    setEditing(c);
    setTitle(c.title);
    setCntPlatform(c.platform);
    setFormat(c.format);
    setStatus(c.status);
    setPublishDate(c.publishDate);
    setPublishTime(c.publishTime || '18:00');
    setCaption(c.caption || '');
    setScript(c.script || '');
    setAssetLink(c.assetLink || '');
    setProjectId(c.projectId || '');
    setModalOpen(true);
  };

  const saveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      platform: cntPlatform,
      format,
      status,
      publishDate,
      publishTime,
      caption: caption.trim() || undefined,
      script: script.trim() || undefined,
      assetLink: assetLink.trim() || undefined,
      projectId: projectId || undefined,
    };
    if (editing) updateContent(editing.id, payload);
    else addContent(payload);
    setModalOpen(false);
  };

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricReach) return;
    addDailyMetric({
      date: metricDate,
      reach: Number(metricReach),
      impressions: Number(metricImpressions) || Math.round(Number(metricReach) * 1.35),
      engagement: Number(metricEng) || 4.5,
      followers: 5725,
    });
    setMetricReach('');
    setMetricImpressions('');
    setMetricSaved(true);
    setTimeout(() => setMetricSaved(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header matching Reference #6 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Minha Central &nbsp;/&nbsp; Conteúdo &amp; Analytics
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-serif-display text-4xl leading-none">Conteúdo</h1>
            <span
              className="font-serif-editorial italic text-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              Planejamento e criação
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openNew}
          className="self-start sm:self-auto"
        >
          Novo conteúdo
        </Button>
      </div>

      {/* Sub-navigation Tabs + Platform Filters (Matching Reference #6) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex p-1 rounded-full border flex-wrap"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
        >
          {(
            [
              ['analytics', 'Início & Analytics'],
              ['etapas', 'Etapas (Pipeline)'],
              ['calendario', 'Calendário Editorial'],
              ['metricas', 'Métricas & APIs'],
            ] as [ContentTab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: tab === id ? 'var(--accent-forest)' : 'transparent',
                color: tab === id ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className="inline-flex p-1 rounded-full border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
        >
          {(['7d', '14d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer"
              style={{
                backgroundColor: period === p ? 'var(--bg-surface)' : 'transparent',
                color: period === p ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {p === '7d' ? '7 dias' : p === '14d' ? '14 dias' : '30 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {PLATFORMS.map((p) => {
          const active = platform === p;
          return (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--accent-ochre)' : 'var(--bg-surface)',
                borderColor: active ? 'var(--accent-ochre)' : 'var(--border-hairline)',
                color: active ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS OVERVIEW (Matching Reference #6!) */}
      {tab === 'analytics' && (
        <div className="space-y-5">
          {/* 4 Hero Cards matching Reference #6: Na mesa, Alcance, Engajamento, Seguidores */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Na mesa */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif-editorial text-xl">Na mesa</h3>
                <button
                  onClick={() => setTab('etapas')}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-forest)' }}
                >
                  Ver etapas
                </button>
              </div>
              <div className="flex items-baseline gap-6 mb-3">
                <div>
                  <span className="font-serif-display text-4xl leading-none block">
                    {filteredContents.filter((c) => c.status !== 'publicado').length}
                  </span>
                  <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Em andamento
                  </span>
                </div>
                <div>
                  <span
                    className="font-serif-display text-3xl leading-none block"
                    style={{ color: 'var(--accent-ochre)' }}
                  >
                    {filteredContents.filter((c) => c.status === 'revisao').length}
                  </span>
                  <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Para revisar
                  </span>
                </div>
              </div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageCounts}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6953F5" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alcance */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif-editorial text-xl">Alcance</h3>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Últimos {period === '7d' ? '7' : period === '14d' ? '14' : '30'} dias
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-forest-soft)',
                    color: 'var(--accent-forest)',
                  }}
                >
                  {dailyMetrics.length > 0 ? `${dailyMetrics.length} registros` : 'Sem dados'}
                </span>
              </div>

              <p className="font-serif-display text-4xl my-2">
                {formatNumber(aggMetrics.reach)}
              </p>

              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyMetrics}>
                    <defs>
                      <linearGradient id="alcanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6953F5" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6953F5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stroke="#6953F5"
                      strokeWidth={2}
                      fill="url(#alcanceGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t text-[10px]" style={{ borderColor: 'var(--border-hairline)' }}>
                <div>
                  <strong className="block text-xs">{formatNumber(aggMetrics.impressions)}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Impressões</span>
                </div>
                <div>
                  <strong className="block text-xs">{formatNumber(bestDayReach)}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Melhor dia</span>
                </div>
                <div>
                  <strong className="block text-xs">
                    {filteredContents.filter((c) => c.status === 'publicado').length}
                  </strong>
                  <span style={{ color: 'var(--text-muted)' }}>Publicados</span>
                </div>
              </div>
            </div>

            {/* Engajamento */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif-editorial text-xl">Engajamento</h3>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Taxa média
                  </span>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-ochre-soft)',
                    color: 'var(--accent-ochre)',
                  }}
                >
                  {aggMetrics.engRate}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3">
                <div>
                  <span className="font-serif-display text-3xl block leading-none">
                    {formatNumber(aggMetrics.interactions)}
                  </span>
                  <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Interações
                  </span>
                </div>
                <div>
                  <span className="font-serif-display text-3xl block leading-none">
                    {formatNumber(aggMetrics.views)}
                  </span>
                  <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Visualizações
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-3 border-t text-center" style={{ borderColor: 'var(--border-hairline)' }}>
                {[
                  { icon: Heart, val: aggMetrics.likes, label: 'Curtidas' },
                  { icon: MessageCircle, val: aggMetrics.comments, label: 'Coment.' },
                  { icon: Share2, val: aggMetrics.shares, label: 'Compart.' },
                  { icon: Bookmark, val: aggMetrics.saves, label: 'Salvos' },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="p-1.5 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                      <Icon className="w-3 h-3 mx-auto mb-0.5" style={{ color: 'var(--accent-ochre)' }} />
                      <span className="text-xs font-bold block">{m.val}</span>
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seguidores */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-serif-editorial text-xl">Seguidores</h3>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Crescimento por canal
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                {platformFollowers.map((pf) => (
                  <div
                    key={pf.platform}
                    className="flex items-center justify-between text-xs pb-2 border-b last:border-0"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pf.color }} />
                      {pf.platform}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-serif-display text-lg leading-none">
                        {formatNumber(pf.followers)}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--accent-forest-soft)',
                          color: 'var(--accent-forest)',
                        }}
                      >
                        +{pf.growthPct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Melhores Conteúdos do Período */}
          <div className="surface-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-ochre)' }} />
                <h3 className="font-serif-editorial text-xl">Melhores conteúdos do período</h3>
              </div>
              <button
                onClick={() => setTab('calendario')}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'var(--accent-forest)' }}
              >
                Ver calendário editorial
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topContents.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openEdit(c)}
                  className="p-4 rounded-2xl border cursor-pointer hover:shadow-sm transition-all"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold" style={{ color: 'var(--accent-ochre)' }}>
                      {c.platform} · {c.format}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatDayMonth(c.publishDate)}</span>
                  </div>
                  <h4 className="text-sm font-bold leading-snug mb-3">{c.title}</h4>
                  {c.metrics && (
                    <div className="grid grid-cols-3 gap-2 text-xs pt-2.5 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                      <div>
                        <span className="font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {formatNumber(c.metrics.reach)}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Alcance
                        </span>
                      </div>
                      <div>
                        <span className="font-bold flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {c.metrics.likes}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Curtidas
                        </span>
                      </div>
                      <div>
                        <span className="font-bold flex items-center gap-1">
                          <Bookmark className="w-3 h-3" /> {c.metrics.saves}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Salvos
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIPELINE / ETAPAS (With Cross-Module Auto-Task Generation!) */}
      {tab === 'etapas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          {STAGES.map((st) => {
            const items = filteredContents.filter((c) => c.status === st.id);
            const isOver = overStage === st.id;
            return (
              <div
                key={st.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverStage(st.id);
                }}
                onDragLeave={() => {
                  if (overStage === st.id) setOverStage(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = dragContentId || e.dataTransfer.getData('text/plain');
                  if (id) updateContent(id, { status: st.id });
                  setDragContentId(null);
                  setOverStage(null);
                }}
                className={`surface-panel p-3.5 flex flex-col gap-3 min-h-[360px] transition-all ${
                  isOver ? 'card-drop-target-light' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                    {st.label}
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        setDragContentId(item.id);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', item.id);
                      }}
                      onDragEnd={() => {
                        setDragContentId(null);
                        setOverStage(null);
                      }}
                      onClick={() => openEdit(item)}
                      className={`p-3 rounded-2xl border cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm ${
                        dragContentId === item.id ? 'card-dragging' : ''
                      }`}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-hairline)',
                      }}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-bold" style={{ color: 'var(--accent-ochre)' }}>
                          {item.platform}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded-md font-medium"
                          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                        >
                          {item.format}
                        </span>
                      </div>
                      <p className="text-xs font-semibold leading-snug mb-2">{item.title}</p>
                      <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>{formatDayMonth(item.publishDate)}</span>
                        <span>{item.publishTime || '18:00'}</span>
                      </div>

                      {/* Cross-module Integration: Generate Tasks */}
                      <div className="mt-2.5 pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }} onClick={(e) => e.stopPropagation()}>
                        {item.tasksGenerated ? (
                          <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent-sage)' }}>
                            <CheckCircle2 className="w-3 h-3" /> Tarefas geradas
                          </span>
                        ) : (
                          <button
                            onClick={() => generateTasksFromContent(item.id)}
                            className="w-full py-1 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            style={{
                              backgroundColor: 'var(--accent-forest-soft)',
                              color: 'var(--accent-forest)',
                            }}
                          >
                            <Sparkles className="w-3 h-3" /> Gerar tarefas
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: CALENDÁRIO EDITORIAL */}
      {tab === 'calendario' && (
        <div className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" style={{ color: 'var(--accent-ochre)' }} />
              <h3 className="font-serif-editorial text-xl">Calendário Editorial · {monthLabel}</h3>
            </div>
            <button
              onClick={openNew}
              className="text-xs font-semibold cursor-pointer"
              style={{ color: 'var(--accent-ochre)' }}
            >
              + Agendar post
            </button>
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
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((d) => {
              const dayPosts = filteredContents.filter((c) => c.publishDate === d.date);
              return (
                <div
                  key={d.date}
                  className="min-h-[90px] p-2 rounded-2xl border flex flex-col gap-1"
                  style={{
                    opacity: d.inMonth ? 1 : 0.3,
                    backgroundColor: d.date === TODAY ? 'var(--accent-ochre-soft)' : 'var(--bg-surface)',
                    borderColor: d.date === TODAY ? 'var(--accent-ochre)' : 'var(--border-hairline)',
                  }}
                >
                  <span className="text-xs font-bold">{d.day}</span>
                  {dayPosts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => openEdit(p)}
                      className="text-left text-[10px] px-1.5 py-1 rounded-lg truncate font-medium text-white cursor-pointer"
                      style={{
                        backgroundColor:
                          p.status === 'publicado' ? '#2B412D' : '#D67E26',
                      }}
                    >
                      {p.platform}: {p.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REGISTRAR MÉTRICAS MANUAIS & ESTRUTURA DE APIs */}
      {tab === 'metricas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="surface-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent-ochre)' }} />
              <h3 className="font-serif-editorial text-xl">Cadastrar métricas manualmente</h3>
            </div>
            <form onSubmit={handleSaveMetric} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Data (DD/MM)
                  </label>
                  <input
                    required
                    value={metricDate}
                    onChange={(e) => setMetricDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Taxa de Engajamento (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metricEng}
                    onChange={(e) => setMetricEng(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Alcance do dia
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="Ex: 1250"
                    value={metricReach}
                    onChange={(e) => setMetricReach(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Impressões
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 1680"
                    value={metricImpressions}
                    onChange={(e) => setMetricImpressions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'var(--accent-forest)' }}
              >
                {metricSaved ? '✓ Métrica adicionada aos gráficos!' : 'Registrar no painel de Analytics'}
              </button>
            </form>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Webhook className="w-4 h-4" style={{ color: 'var(--accent-forest)' }} />
              <h3 className="font-serif-editorial text-xl">Integrações com APIs Sociais</h3>
            </div>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Estrutura preparada para sincronização automática de métricas e agendamento direto via OAuth2/Webhooks.
            </p>
            <div className="space-y-2.5">
              {[
                { name: 'Meta Graph API (Instagram & Threads)', status: 'Pronto para conectar' },
                { name: 'YouTube Data & Analytics API v3', status: 'Pronto para conectar' },
                { name: 'Pinterest & LinkedIn Marketing API', status: 'Pronto para conectar' },
              ].map((api) => (
                <div
                  key={api.name}
                  className="flex items-center justify-between p-3 rounded-xl border text-xs"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
                >
                  <span className="font-semibold">{api.name}</span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'var(--accent-ochre-soft)',
                      color: 'var(--accent-ochre)',
                    }}
                  >
                    {api.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-[24px] border p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl">
                {editing ? 'Editar conteúdo' : 'Novo conteúdo'}
              </h3>
              <div className="flex items-center gap-1">
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteContent(editing.id);
                      setModalOpen(false);
                    }}
                    className="p-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--accent-terracotta)' }} />
                  </button>
                )}
                <button onClick={() => setModalOpen(false)} className="p-1.5 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={saveContent} className="space-y-3.5">
              <input
                required
                placeholder="Título / Ideia principal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <CustomSelect
                  size="sm"
                  value={cntPlatform}
                  onChange={(v) => setCntPlatform(v as SocialPlatform)}
                  options={PLATFORMS.filter((p) => p !== 'Todas').map((p) => ({
                    value: p,
                    label: p,
                  }))}
                />
                <CustomSelect
                  size="sm"
                  value={format}
                  onChange={(v) => setFormat(v as ContentFormat)}
                  options={['Reels', 'Stories', 'Carrossel', 'Feed', 'Vídeo'].map((f) => ({
                    value: f,
                    label: f,
                  }))}
                />
                <CustomSelect
                  size="sm"
                  value={status}
                  onChange={(v) => setStatus(v as ContentStatus)}
                  options={STAGES.map((s) => ({ value: s.id, label: s.label }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <CustomDatePicker size="sm" value={publishDate} onChange={setPublishDate} />
                <CustomTimePicker size="sm" value={publishTime} onChange={setPublishTime} />
                <CustomSelect
                  size="sm"
                  value={projectId}
                  onChange={setProjectId}
                  options={[
                    { value: '', label: 'Sem projeto' },
                    ...projects.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>
              <textarea
                rows={2}
                placeholder="Legenda / Copy..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <textarea
                rows={3}
                placeholder="Roteiro / Estrutura de slides ou cenas..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <input
                  placeholder="Link de arquivos (Figma, Drive, Canva...)"
                  value={assetLink}
                  onChange={(e) => setAssetLink(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none"
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
                  Salvar conteúdo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

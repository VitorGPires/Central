import React, { useMemo, useState } from 'react';
import {
  Bookmark as BookMarked,
  CheckSquare,
  OpenNewWindow as ExternalLink,
  KanbanBoard as FolderKanban,
  ViewGrid as LayoutGrid,
  LightBulb as Lightbulb,
  Link as Link2,
  List,
  Pin,
  Plus,
  Search,
  Sparks as Sparkles,
  Star,
  Notes as StickyNote,
  Bookmark as Tag,
  Trash as Trash2,
  Xmark as X,
} from 'iconoir-react';
import { Button } from '../components/Button';
import { CustomSelect } from '../components/CustomSelect';
import { useApp } from '../context/AppContext';
import type { BrainNote, NoteCategory } from '../types';
import { formatShortDate } from '../utils/format';
import { sanitizeHttpUrl } from '../utils/url';

const CATEGORIES: {
  id: NoteCategory | 'tudo';
  label: string;
  color: string;
  softBg: string;
}[] = [
  { id: 'tudo', label: 'Tudo', color: 'var(--accent-violet)', softBg: 'var(--accent-violet-soft)' },
  { id: 'ideias', label: 'Ideias', color: '#7B66FF', softBg: 'rgba(123, 102, 255, 0.14)' },
  { id: 'anotacoes', label: 'Anotações', color: '#3B82F6', softBg: 'rgba(59, 130, 246, 0.14)' },
  { id: 'referencias', label: 'Referências', color: '#06B6D4', softBg: 'rgba(6, 182, 212, 0.14)' },
  { id: 'aprendizados', label: 'Aprendizados', color: '#10B981', softBg: 'rgba(16, 185, 129, 0.14)' },
  { id: 'projetos', label: 'Projetos', color: '#F97316', softBg: 'rgba(249, 115, 22, 0.14)' },
  { id: 'insights', label: 'Insights', color: '#A855F7', softBg: 'rgba(168, 85, 247, 0.14)' },
  { id: 'links', label: 'Links', color: '#EC4899', softBg: 'rgba(236, 72, 153, 0.14)' },
];

const CATEGORY_META = Object.fromEntries(
  CATEGORIES.filter((c) => c.id !== 'tudo').map((c) => [c.id, c])
) as Record<NoteCategory, (typeof CATEGORIES)[number]>;

type BrainView = 'grade' | 'lista';
type SortMode = 'recentes' | 'az';

export const SecondBrainModule: React.FC = () => {
  const { notes, projects, tasks, contents, addNote, updateNote, deleteNote } = useApp();

  const [category, setCategory] = useState<NoteCategory | 'tudo'>('tudo');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [view, setView] = useState<BrainView>('grade');
  const [sortMode, setSortMode] = useState<SortMode>('recentes');

  // Quick capture bar
  const [quickText, setQuickText] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BrainNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteCat, setNoteCat] = useState<NoteCategory>('ideias');
  const [tagsText, setTagsText] = useState('');
  const [url, setUrl] = useState('');
  const [projectId, setProjectId] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [linkedContentId, setLinkedContentId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((n) =>
      n.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1))
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [notes]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { tudo: notes.length };
    notes.forEach((n) => {
      map[n.category] = (map[n.category] || 0) + 1;
    });
    return map;
  }, [notes]);

  const stats = useMemo(() => {
    const pinnedCount = notes.filter((n) => n.pinned).length;
    const favCount = notes.filter((n) => n.favorite).length;
    const linksCount = notes.filter((n) => Boolean(n.url)).length;
    return { total: notes.length, pinnedCount, favCount, linksCount };
  }, [notes]);

  const filtered = useMemo(() => {
    return notes
      .filter((n) => {
        if (category !== 'tudo' && n.category !== category) return false;
        if (selectedTag && !n.tags.includes(selectedTag)) return false;
        if (onlyFavorites && !n.favorite) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        const pinDiff = Number(b.pinned) - Number(a.pinned);
        if (pinDiff !== 0) return pinDiff;
        if (sortMode === 'az') return a.title.localeCompare(b.title, 'pt-BR');
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, category, selectedTag, onlyFavorites, search, sortMode]);

  const hasActiveFilters =
    category !== 'tudo' || Boolean(selectedTag) || onlyFavorites || Boolean(search.trim());

  const clearFilters = () => {
    setCategory('tudo');
    setSelectedTag(null);
    setOnlyFavorites(false);
    setSearch('');
  };

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = quickText.trim();
    if (!raw) return;
    const isUrl = /^https?:\/\//i.test(raw);
    addNote({
      title: isUrl ? raw.replace(/^https?:\/\//i, '').slice(0, 60) : raw,
      content: '',
      category: isUrl ? 'links' : category === 'tudo' ? 'ideias' : category,
      tags: selectedTag ? [selectedTag] : [],
      url: isUrl ? raw : undefined,
      favorite: false,
      pinned: false,
    });
    setQuickText('');
  };

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setNoteCat(category === 'tudo' ? 'ideias' : category);
    setTagsText(selectedTag ? selectedTag : '');
    setUrl('');
    setProjectId('');
    setLinkedTaskId('');
    setLinkedContentId('');
    setIsPinned(false);
    setIsFavorite(false);
    setModalOpen(true);
  };

  const openEdit = (n: BrainNote) => {
    setEditing(n);
    setTitle(n.title);
    setContent(n.content);
    setNoteCat(n.category);
    setTagsText(n.tags.join(', '));
    setUrl(n.url || '');
    setProjectId(n.projectId || '');
    setLinkedTaskId(n.linkedTaskId || '');
    setLinkedContentId(n.linkedContentId || '');
    setIsPinned(n.pinned);
    setIsFavorite(n.favorite);
    setModalOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (editing?.id === id) {
      setModalOpen(false);
      setEditing(null);
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: noteCat,
      tags: tagsText
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      url: url.trim() || undefined,
      projectId: projectId || undefined,
      linkedTaskId: linkedTaskId || undefined,
      linkedContentId: linkedContentId || undefined,
      favorite: isFavorite,
      pinned: isPinned,
    };
    if (editing) {
      updateNote(editing.id, payload);
    } else {
      addNote(payload);
    }
    setModalOpen(false);
  };

  const catIcon = (c: NoteCategory) => {
    switch (c) {
      case 'ideias':
        return <Lightbulb className="w-3.5 h-3.5" />;
      case 'links':
        return <Link2 className="w-3.5 h-3.5" />;
      case 'projetos':
        return <FolderKanban className="w-3.5 h-3.5" />;
      case 'insights':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'referencias':
        return <BookMarked className="w-3.5 h-3.5" />;
      default:
        return <StickyNote className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Minha Central &nbsp;/&nbsp; Segundo Cérebro
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-serif-display text-4xl leading-none">Segundo cérebro</h1>
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {stats.total} {stats.total === 1 ? 'nota' : 'notas'}
              {stats.pinnedCount > 0 ? ` · ${stats.pinnedCount} fixada${stats.pinnedCount > 1 ? 's' : ''}` : ''}
              {stats.favCount > 0 ? ` · ${stats.favCount} favorita${stats.favCount > 1 ? 's' : ''}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-2 px-3.5 h-9 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar notas ou #tags..."
              className="bg-transparent text-xs outline-none w-44"
              style={{ color: 'var(--text-primary)' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="cursor-pointer p-0.5"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Limpar busca"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOnlyFavorites((v) => !v)}
            className="h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: onlyFavorites ? 'var(--accent-violet-soft)' : 'var(--bg-card)',
              borderColor: onlyFavorites ? 'var(--accent-violet)' : 'var(--border-hairline)',
              color: onlyFavorites ? 'var(--accent-violet)' : 'var(--text-secondary)',
            }}
            title="Filtrar favoritos"
          >
            <Star className="w-3.5 h-3.5" fill={onlyFavorites ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">Favoritos</span>
          </button>

          {/* View toggle */}
          <div
            className="flex items-center p-0.5 rounded-xl border h-9"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
          >
            <button
              type="button"
              onClick={() => setView('grade')}
              className="h-7 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              style={{
                backgroundColor: view === 'grade' ? 'var(--accent-violet-soft)' : 'transparent',
                color: view === 'grade' ? 'var(--accent-violet)' : 'var(--text-muted)',
              }}
              title="Visualização em grade"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('lista')}
              className="h-7 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              style={{
                backgroundColor: view === 'lista' ? 'var(--accent-violet-soft)' : 'transparent',
                color: view === 'lista' ? 'var(--accent-violet)' : 'var(--text-muted)',
              }}
              title="Visualização em lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <CustomSelect
            size="sm"
            className="w-36"
            value={sortMode}
            onChange={(v) => setSortMode(v as SortMode)}
            options={[
              { value: 'recentes', label: 'Mais recentes' },
              { value: 'az', label: 'Ordem A–Z' },
            ]}
          />

          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Nova nota
          </Button>
        </div>
      </div>

      {/* Quick Capture Bar */}
      <form
        onSubmit={handleQuickCapture}
        className="surface-card p-2.5 flex items-center gap-2.5"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: 'var(--accent-violet-soft)',
            color: 'var(--accent-violet)',
          }}
        >
          <Lightbulb className="w-4 h-4" />
        </div>
        <input
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder="Captura rápida: escreva uma ideia, aprendizado ou cole um link e pressione Enter..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {quickText.trim() && (
          <Button type="submit" size="sm">
            Salvar
          </Button>
        )}
      </form>

      {/* Category Filter Pills + Tags */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            const count = categoryCounts[c.id] || 0;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: active ? 'var(--accent-violet)' : 'var(--bg-card)',
                  borderColor: active ? 'var(--accent-violet)' : 'var(--border-hairline)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                }}
              >
                <span>{c.label}</span>
                {count > 0 && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md tabular-nums"
                    style={{
                      backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)',
                      color: active ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              style={{ color: 'var(--accent-violet)' }}
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Tags Strip (only shown when tags exist) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3.5 h-3.5 mr-0.5" style={{ color: 'var(--text-muted)' }} />
            {allTags.map(({ tag, count }) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(active ? null : tag)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                  style={{
                    backgroundColor: active ? 'var(--accent-violet)' : 'var(--accent-purple-soft)',
                    color: active ? '#fff' : 'var(--accent-purple)',
                  }}
                >
                  <span>#{tag}</span>
                  <span className="opacity-70 text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          className="surface-card p-10 text-center flex flex-col items-center justify-center gap-3"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: 'var(--accent-violet-soft)',
              color: 'var(--accent-violet)',
            }}
          >
            <StickyNote className="w-6 h-6" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-base font-bold mb-1">
              {hasActiveFilters
                ? 'Nenhuma nota encontrada'
                : 'Seu Segundo Cérebro está pronto'}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {hasActiveFilters
                ? 'Tente ajustar a busca, categoria ou tag selecionada.'
                : 'Guarde ideias, resumos de leitura, referências e links importantes vinculados aos seus projetos e tarefas.'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : (
              <Button onClick={openNew}>
                <Plus className="w-4 h-4" />
                Criar primeira nota
              </Button>
            )}
          </div>
        </div>
      ) : view === 'grade' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((note) => {
            const meta = CATEGORY_META[note.category];
            const proj = projects.find((p) => p.id === note.projectId);
            const linkedTask = tasks.find((t) => t.id === note.linkedTaskId);
            const linkedContent = contents.find((c) => c.id === note.linkedContentId);
            const safeUrl = sanitizeHttpUrl(note.url);

            return (
              <div
                key={note.id}
                onClick={() => openEdit(note)}
                className="surface-card p-5 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5 min-h-[210px] group"
                style={{
                  borderColor: note.pinned ? 'var(--accent-violet)' : undefined,
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                      style={{
                        backgroundColor: meta.softBg,
                        color: meta.color,
                      }}
                    >
                      {catIcon(note.category)}
                      {meta.label}
                    </span>

                    <div
                      className="flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => updateNote(note.id, { pinned: !note.pinned })}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{
                          color: note.pinned ? 'var(--accent-violet)' : 'var(--text-muted)',
                          backgroundColor: note.pinned ? 'var(--accent-violet-soft)' : 'transparent',
                        }}
                        title={note.pinned ? 'Desafixar nota' : 'Fixar nota'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateNote(note.id, { favorite: !note.favorite })}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{
                          color: note.favorite ? '#F59E0B' : 'var(--text-muted)',
                        }}
                        title={note.favorite ? 'Remover dos favoritos' : 'Favoritar'}
                      >
                        <Star
                          className="w-3.5 h-3.5"
                          fill={note.favorite ? 'currentColor' : 'none'}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer opacity-60 group-hover:opacity-100"
                        style={{ color: 'var(--accent-terracotta)' }}
                        title="Excluir nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold leading-snug mb-2 line-clamp-2">
                    {note.title}
                  </h3>
                  {note.content && (
                    <p
                      className="text-xs leading-relaxed line-clamp-4 whitespace-pre-line"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {note.content}
                    </p>
                  )}

                  {safeUrl && (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium hover:underline max-w-full truncate"
                      style={{ color: 'var(--accent-violet)' }}
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{note.url!.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>

                <div
                  className="mt-4 pt-3 border-t space-y-2"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  {(proj || linkedTask || linkedContent) && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: proj.color }}
                          />
                          {proj.name}
                        </span>
                      )}
                      {linkedTask && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium max-w-[140px] truncate"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{linkedTask.title}</span>
                        </span>
                      )}
                      {linkedContent && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium max-w-[140px] truncate"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <Sparkles className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{linkedContent.title}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex flex-wrap gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {note.tags.slice(0, 3).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                          className="text-[10px] font-medium hover:underline cursor-pointer"
                          style={{ color: 'var(--accent-purple)' }}
                        >
                          #{t}
                        </button>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatShortDate(note.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="surface-card divide-y" style={{ borderColor: 'var(--border-hairline)' }}>
          {filtered.map((note) => {
            const meta = CATEGORY_META[note.category];
            const proj = projects.find((p) => p.id === note.projectId);
            const safeUrl = sanitizeHttpUrl(note.url);

            return (
              <div
                key={note.id}
                onClick={() => openEdit(note)}
                className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{ backgroundColor: meta.softBg, color: meta.color }}
                    >
                      {catIcon(note.category)}
                      {meta.label}
                    </span>
                    <h3 className="text-sm font-semibold truncate">{note.title}</h3>
                    {proj && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: proj.color }}
                        />
                        {proj.name}
                      </span>
                    )}
                    {safeUrl && (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                        style={{ color: 'var(--accent-violet)' }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {note.content && (
                    <p
                      className="text-xs truncate max-w-2xl"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {note.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden md:flex items-center gap-1.5">
                    {note.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium"
                        style={{ color: 'var(--accent-purple)' }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {formatShortDate(note.updatedAt)}
                  </span>
                  <div
                    className="flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => updateNote(note.id, { pinned: !note.pinned })}
                      className="p-1.5 rounded-lg cursor-pointer"
                      style={{
                        color: note.pinned ? 'var(--accent-violet)' : 'var(--text-muted)',
                      }}
                      title={note.pinned ? 'Desafixar nota' : 'Fixar nota'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNote(note.id, { favorite: !note.favorite })}
                      className="p-1.5 rounded-lg cursor-pointer"
                      style={{
                        color: note.favorite ? '#F59E0B' : 'var(--text-muted)',
                      }}
                      title={note.favorite ? 'Remover dos favoritos' : 'Favoritar'}
                    >
                      <Star
                        className="w-3.5 h-3.5"
                        fill={note.favorite ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg cursor-pointer"
                      style={{ color: 'var(--accent-terracotta)' }}
                      title="Excluir nota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Editor Modal */}
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
                {editing ? 'Editar nota' : 'Nova nota'}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsPinned((v) => !v)}
                  className="p-1.5 rounded-lg transition-colors cursor-pointer"
                  style={{
                    color: isPinned ? 'var(--accent-violet)' : 'var(--text-muted)',
                    backgroundColor: isPinned ? 'var(--accent-violet-soft)' : 'transparent',
                  }}
                  title={isPinned ? 'Desafixar nota' : 'Fixar nota'}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFavorite((v) => !v)}
                  className="p-1.5 rounded-lg transition-colors cursor-pointer"
                  style={{ color: isFavorite ? '#F59E0B' : 'var(--text-muted)' }}
                  title={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                >
                  <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={save} className="space-y-3.5">
              <input
                required
                autoFocus
                placeholder="Título da nota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />
              <div>
                <textarea
                  rows={6}
                  placeholder="Escreva suas ideias, aprendizados, resumos ou conexões..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none leading-relaxed"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {content.trim() ? `${content.trim().split(/\s+/).length} palavras` : '0 palavras'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  value={noteCat}
                  onChange={(v) => setNoteCat(v as NoteCategory)}
                  options={CATEGORIES.filter((c) => c.id !== 'tudo').map((c) => ({
                    value: c.id,
                    label: c.label,
                  }))}
                />
                <input
                  placeholder="Tags (ex: estratégia, design)"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <input
                type="url"
                placeholder="Link ou material externo (opcional)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              />

              {/* Cross-module links */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <CustomSelect
                  size="sm"
                  value={projectId}
                  onChange={setProjectId}
                  options={[
                    { value: '', label: 'Vincular Projeto' },
                    ...projects.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
                <CustomSelect
                  size="sm"
                  value={linkedTaskId}
                  onChange={setLinkedTaskId}
                  options={[
                    { value: '', label: 'Vincular Tarefa' },
                    ...tasks.map((t) => ({ value: t.id, label: t.title.slice(0, 32) })),
                  ]}
                />
                <CustomSelect
                  size="sm"
                  value={linkedContentId}
                  onChange={setLinkedContentId}
                  options={[
                    { value: '', label: 'Vincular Conteúdo' },
                    ...contents.map((c) => ({ value: c.id, label: c.title.slice(0, 32) })),
                  ]}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <div>
                  {editing && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDeleteNote(editing.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir nota
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar nota</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

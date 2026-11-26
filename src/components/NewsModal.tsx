import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  Clock,
  Cpu,
  Globe,
  JournalPage,
  OpenNewWindow,
  Refresh,
  Xmark as X,
} from 'iconoir-react';
import { useApp } from '../context/AppContext';
import { sanitizeHttpUrl } from '../utils/url';
import { Button } from './Button';

type FeedId = 'morning-mail' | 'world' | 'technology';

interface NewsFeedConfig {
  id: FeedId;
  label: string;
  tag: string;
  path: string;
  Icon: React.FC<{ className?: string }>;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  thumbnail?: string;
  publishedAt: string;
  publishedMs: number;
  author?: string;
}

interface CachedFeed {
  items: NewsItem[];
  fetchedAt: number;
}

const LAST_SEEN_KEY = 'minhacentral_news_last_seen';
const STALE_MS = 5 * 60 * 1000; // 5 minutes
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const FEEDS: NewsFeedConfig[] = [
  {
    id: 'morning-mail',
    label: 'Morning Mail',
    tag: 'morning-mail',
    path: '/api/guardian/australia-news/series/guardian-australia-s-morning-mail/rss',
    Icon: JournalPage,
  },
  {
    id: 'world',
    label: 'Mundo',
    tag: 'mundo',
    path: '/api/guardian/world/rss',
    Icon: Globe,
  },
  {
    id: 'technology',
    label: 'Tecnologia',
    tag: 'tecnologia',
    path: '/api/guardian/technology/rss',
    Icon: Cpu,
  },
];

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const paragraphs = Array.from(doc.body.querySelectorAll('p'))
    .map((p) => (p.textContent || '').replace(/\s+/g, ' ').trim())
    .filter((t) => t && !/^continue reading/i.test(t));
  const raw =
    paragraphs.length > 0
      ? paragraphs.join(' ')
      : (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  return raw.length > 180 ? `${raw.slice(0, 177).trim()}...` : raw;
}

function formatPubDatePt(raw: string): { label: string; ms: number } {
  const dt = new Date(raw);
  const ms = dt.getTime();
  if (Number.isNaN(ms)) return { label: '', ms: 0 };
  const label = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dt);
  return { label, ms };
}

function formatTimeHHMM(ts: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

function readLastSeen(): number {
  try {
    const raw = localStorage.getItem(LAST_SEEN_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeLastSeen(ts: number) {
  try {
    localStorage.setItem(LAST_SEEN_KEY, String(ts));
  } catch {
    // ignore storage errors
  }
}

function parseGuardianRss(xmlText: string): NewsItem[] {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Não foi possível interpretar o feed RSS.');
  }

  const items = Array.from(doc.querySelectorAll('item')).slice(0, 15);
  const parsed: NewsItem[] = [];
  items.forEach((item, idx) => {
    const title = item.querySelector('title')?.textContent?.trim() || 'Sem título';
    const rawLink = item.querySelector('link')?.textContent?.trim() || '';
    const safeLink = sanitizeHttpUrl(rawLink);
    if (!safeLink) return;

    const rawDesc = item.querySelector('description')?.textContent || '';
    const summary = stripHtml(rawDesc);
    const pubDateRaw = item.querySelector('pubDate')?.textContent?.trim() || '';
    const { label: publishedAt, ms: publishedMs } = formatPubDatePt(pubDateRaw);
    const author =
      item.getElementsByTagNameNS('*', 'creator')[0]?.textContent?.trim() || undefined;

    const mediaNodes = Array.from(item.getElementsByTagNameNS('*', 'content'));
    let thumbRaw: string | undefined;
    for (const m of mediaNodes) {
      const u = m.getAttribute('url');
      const w = Number(m.getAttribute('width') || 0);
      if (u && (!thumbRaw || (w >= 300 && w <= 700))) {
        thumbRaw = u;
        if (w >= 300 && w <= 700) break;
      }
    }
    const thumbnail = sanitizeHttpUrl(thumbRaw);

    parsed.push({
      id: `${safeLink}-${idx}`,
      title,
      summary,
      url: safeLink,
      thumbnail,
      publishedAt,
      publishedMs,
      author,
    });
  });
  return parsed;
}

export const NewsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onHasUnreadChange?: (hasUnread: boolean) => void;
}> = ({ open, onClose, onHasUnreadChange }) => {
  const { notes, addNote, deleteNote } = useApp();
  const [activeFeed, setActiveFeed] = useState<FeedId>('morning-mail');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [sessionSeenThreshold, setSessionSeenThreshold] = useState<number>(() => readLastSeen());

  const cacheRef = useRef<Partial<Record<FeedId, CachedFeed>>>({});

  const fetchFeed = useCallback(async (feedId: FeedId, bustCache = false): Promise<NewsItem[]> => {
    const feed = FEEDS.find((f) => f.id === feedId)!;
    const url = bustCache ? `${feed.path}?t=${Date.now()}` : feed.path;
    const res = await fetch(url, bustCache ? { cache: 'no-store' } : undefined);
    if (!res.ok) {
      throw new Error(`Erro ${res.status} ao buscar o feed do The Guardian.`);
    }
    const xml = await res.text();
    const parsed = parseGuardianRss(xml);
    cacheRef.current[feedId] = { items: parsed, fetchedAt: Date.now() };
    return parsed;
  }, []);

  const loadFeed = useCallback(
    async (feedId: FeedId, force = false) => {
      const cached = cacheRef.current[feedId];
      const isFresh = cached && Date.now() - cached.fetchedAt < STALE_MS;
      if (!force && isFresh) {
        setItems(cached.items);
        setLastUpdated(cached.fetchedAt);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const parsed = await fetchFeed(feedId, force);
        setItems(parsed);
        setLastUpdated(Date.now());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar as notícias agora.'
        );
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchFeed]
  );

  // When modal opens: capture previous lastSeen for "Nova" badges, then mark seen and load feed
  useEffect(() => {
    if (!open) return;
    const prevSeen = readLastSeen();
    setSessionSeenThreshold(prevSeen);
    writeLastSeen(Date.now());
    onHasUnreadChange?.(false);
    loadFeed(activeFeed);
  }, [open, activeFeed, loadFeed, onHasUnreadChange]);

  // Background auto-check every 5 minutes (also checks on mount for unread dot)
  useEffect(() => {
    const checkUpdates = async () => {
      if (open) {
        await loadFeed(activeFeed, true);
        writeLastSeen(Date.now());
        onHasUnreadChange?.(false);
        return;
      }

      try {
        const parsed = await fetchFeed('morning-mail', true);
        const newestMs = parsed.reduce((max, it) => Math.max(max, it.publishedMs), 0);
        const lastSeen = readLastSeen();
        if (newestMs > 0 && newestMs > lastSeen) {
          onHasUnreadChange?.(true);
        }
      } catch {
        // silent background check
      }
    };

    // Initial background check shortly after app load
    const initialTimer = window.setTimeout(() => {
      if (!open) void checkUpdates();
    }, 2500);

    const interval = window.setInterval(() => {
      void checkUpdates();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [open, activeFeed, fetchFeed, loadFeed, onHasUnreadChange]);

  if (!open) return null;

  const currentFeed = FEEDS.find((f) => f.id === activeFeed)!;
  const savedByUrl = new Map(
    notes.filter((n) => Boolean(n.url)).map((n) => [n.url!, n.id])
  );

    const handleToggleSaveToBrain = (item: NewsItem) => {
      const existingId = savedByUrl.get(item.url);
      if (existingId) {
        deleteNote(existingId);
        return;
      }
      addNote({
        title: item.title,
        content: item.summary,
        category: 'links',
        tags: ['noticias', currentFeed.tag],
        url: item.url,
        favorite: false,
        pinned: false,
      });
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl rounded-[24px] border shadow-2xl animate-fade-in flex flex-col max-h-[86vh] overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-hairline)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 pt-5 pb-4 border-b space-y-4 shrink-0"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--accent-violet-soft)',
                    color: 'var(--accent-violet)',
                  }}
                >
                  <JournalPage className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-display text-xl leading-tight">
                    Notícias
                  </h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    The Guardian · Morning Mail, Mundo e Tecnologia
                    {lastUpdated ? ` · Atualizado às ${formatTimeHHMM(lastUpdated)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => loadFeed(activeFeed, true)}
                  disabled={loading}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-secondary)',
                  }}
                  title="Atualizar notícias agora"
                  aria-label="Atualizar notícias"
                >
                  <Refresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Segmented Feed Tabs */}
            <div
              className="grid grid-cols-3 gap-1 p-1 rounded-xl"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              {FEEDS.map(({ id, label, Icon }) => {
                const active = activeFeed === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveFeed(id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0"
                    style={{
                      backgroundColor: active ? 'var(--bg-card)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: active ? '0 2px 8px rgba(20, 18, 36, 0.08)' : 'none',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feed Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border animate-pulse flex gap-3.5"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                  }}
                >
                  <div
                    className="w-24 h-20 rounded-xl shrink-0"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  />
                  <div className="flex-1 space-y-2 py-1">
                    <div
                      className="h-3.5 rounded w-4/5"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    />
                    <div
                      className="h-3 rounded w-full"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    />
                    <div
                      className="h-2.5 rounded w-1/3"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    />
                  </div>
                </div>
              ))
            ) : error ? (
              <div
                className="p-8 rounded-2xl border border-dashed text-center space-y-3"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                }}
              >
                <p className="text-sm font-semibold">{error}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Verifique sua conexão com a internet e tente novamente.
                </p>
                <Button variant="secondary" onClick={() => loadFeed(activeFeed, true)}>
                  Tentar novamente
                </Button>
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-xs py-10" style={{ color: 'var(--text-muted)' }}>
                Nenhuma notícia encontrada nesta editoria.
              </p>
            ) : (
              items.map((item) => {
                const isSaved = savedByUrl.has(item.url);
                const isNew =
                  sessionSeenThreshold > 0 && item.publishedMs > sessionSeenThreshold;
                return (
                  <article
                    key={item.id}
                    className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3.5 transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: isNew ? 'var(--accent-violet)' : 'var(--border-hairline)',
                    }}
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full sm:w-28 h-36 sm:h-22 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <div className="flex items-start gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold leading-snug hover:underline block flex-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {item.title}
                          </a>
                          {isNew && (
                            <span
                              className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                              style={{
                                backgroundColor: 'var(--accent-violet-soft)',
                                color: 'var(--accent-violet)',
                              }}
                            >
                              Nova
                            </span>
                          )}
                        </div>
                        {item.summary && (
                          <p
                            className="text-xs leading-relaxed mt-1 line-clamp-2"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {item.summary}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 min-w-0">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] min-w-0 flex-1"
                          style={{ color: 'var(--text-muted)' }}
                          title={
                            item.author
                              ? `${item.publishedAt} · ${item.author}`
                              : item.publishedAt
                          }
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {item.publishedAt}
                            {item.author ? ` · ${item.author}` : ''}
                          </span>
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSaveToBrain(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer"
                            style={{
                              backgroundColor: isSaved
                                ? 'rgba(16, 185, 129, 0.14)'
                                : 'var(--bg-card)',
                              borderColor: isSaved
                                ? 'rgba(16, 185, 129, 0.35)'
                                : 'var(--border-hairline)',
                              color: isSaved ? '#10B981' : 'var(--text-secondary)',
                            }}
                            title={
                              isSaved
                                ? 'Clique para remover do Segundo Cérebro'
                                : 'Salvar no Segundo Cérebro'
                            }
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3 h-3" />
                                Salvo
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3 h-3" />
                                Salvar nota
                              </>
                            )}
                          </button>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                            style={{
                              backgroundColor: 'var(--accent-violet-soft)',
                              color: 'var(--accent-violet)',
                            }}
                          >
                            Ler
                            <OpenNewWindow className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 border-t flex items-center justify-between text-[11px] shrink-0"
            style={{
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-muted)',
            }}
          >
            <span>Atualização automática a cada 5 min · The Guardian</span>
            <a
              href="https://www.theguardian.com/australia-news/2022/sep/23/morning-mail-newsletter-best-daily-news-email-guardian-australia-free-sign-up-inbox-subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium hover:underline"
              style={{ color: 'var(--accent-violet)' }}
            >
              Assinar newsletter por e-mail
              <OpenNewWindow className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  };

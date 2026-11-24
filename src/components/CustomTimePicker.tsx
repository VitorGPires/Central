import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'iconoir-react';

interface CustomTimePickerProps {
  value: string; // HH:mm
  onChange: (hhmm: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function parseTime(value: string): { hour: string; minute: string } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value || '');
  if (match) {
    const h = Math.min(23, Math.max(0, Number(match[1])));
    const m = Math.min(59, Math.max(0, Number(match[2])));
    return {
      hour: String(h).padStart(2, '0'),
      minute: String(m).padStart(2, '0'),
    };
  }
  return { hour: '09', minute: '00' };
}

function getLocalNowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Horário',
  size = 'md',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const hoursListRef = useRef<HTMLDivElement>(null);
  const minutesListRef = useRef<HTMLDivElement>(null);

  const { hour, minute } = parseTime(value);

  useEffect(() => {
    if (!open) return;

    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const popoverW = 228;
      const popoverH = 290;
      setAlignRight(rect.left + popoverW > window.innerWidth - 16);
      setOpenUp(rect.bottom + popoverH > window.innerHeight - 16 && rect.top > popoverH);
    }

    // Scroll active hour & minute into view
    requestAnimationFrame(() => {
      const hEl = hoursListRef.current?.querySelector(`[data-hour="${hour}"]`) as HTMLElement | null;
      const mEl = minutesListRef.current?.querySelector(`[data-min="${minute}"]`) as HTMLElement | null;
      if (hEl && hoursListRef.current) {
        hoursListRef.current.scrollTop = hEl.offsetTop - 72;
      }
      if (mEl && minutesListRef.current) {
        minutesListRef.current.scrollTop = mEl.offsetTop - 72;
      }
    });

    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, hour, minute]);

  const selectHour = (h: string) => onChange(`${h}:${minute}`);
  const selectMinute = (m: string) => onChange(`${hour}:${m}`);

  const paddingClass = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-3.5 py-2.5 text-sm';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border text-left font-medium transition-all cursor-pointer ${paddingClass}`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: open ? 'var(--accent-violet)' : 'var(--border-hairline)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: open ? '0 0 0 3px var(--accent-violet-soft)' : 'none',
        }}
      >
        <span className="truncate tabular-nums">{value || placeholder}</span>
        <Clock
          className="w-4 h-4 shrink-0 transition-colors"
          style={{ color: open ? 'var(--accent-violet)' : 'var(--text-muted)' }}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Seletor de horário"
          className={`absolute z-50 w-[224px] rounded-2xl border p-3 shadow-xl animate-fade-in ${
            alignRight ? 'right-0' : 'left-0'
          } ${openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-strong)',
            boxShadow: '0 18px 40px -10px rgba(14, 13, 22, 0.28)',
          }}
        >
          {/* Column headers */}
          <div className="grid grid-cols-2 gap-2 mb-2 text-center">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Hora
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Min
            </span>
          </div>

          {/* Scrollable Hours & Minutes columns */}
          <div className="grid grid-cols-2 gap-2">
            <div
              ref={hoursListRef}
              className="h-44 overflow-y-auto space-y-1 pr-1"
            >
              {HOURS.map((h) => {
                const active = h === hour;
                return (
                  <button
                    key={h}
                    type="button"
                    data-hour={h}
                    onClick={() => selectHour(h)}
                    className="w-full py-1.5 rounded-xl text-xs font-medium tabular-nums transition-colors cursor-pointer border-0"
                    style={{
                      backgroundColor: active ? 'var(--accent-violet)' : 'transparent',
                      color: active ? '#FFFFFF' : 'var(--text-primary)',
                      fontWeight: active ? 600 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            <div
              ref={minutesListRef}
              className="h-44 overflow-y-auto space-y-1 pr-1 border-l pl-2"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {MINUTES.map((m) => {
                const active = m === minute;
                return (
                  <button
                    key={m}
                    type="button"
                    data-min={m}
                    onClick={() => selectMinute(m)}
                    className="w-full py-1.5 rounded-xl text-xs font-medium tabular-nums transition-colors cursor-pointer border-0"
                    style={{
                      backgroundColor: active ? 'var(--accent-violet)' : 'transparent',
                      color: active ? '#FFFFFF' : 'var(--text-primary)',
                      fontWeight: active ? 600 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div
            className="flex items-center justify-between mt-3 pt-2.5 border-t"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <button
              type="button"
              onClick={() => {
                onChange(getLocalNowTime());
                setOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border-0 bg-transparent"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Agora
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-0"
              style={{
                backgroundColor: 'var(--accent-violet-soft)',
                color: 'var(--accent-violet)',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

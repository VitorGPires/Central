import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { TODAY } from '../data/seedData';
import { formatMonthYearPt, getMonthDays } from '../utils/format';

interface CustomDatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md';
  className?: string;
  allowClear?: boolean;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function parseIsoParts(iso: string): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]) - 1,
    };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function formatDisplayDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecionar data',
  size = 'md',
  className = '',
  allowClear = false,
}) => {
  const initial = parseIsoParts(value || TODAY);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [alignRight, setAlignRight] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const parts = parseIsoParts(value || TODAY);
    setViewYear(parts.year);
    setViewMonth(parts.month);

    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const popoverW = 280;
      const popoverH = 330;
      setAlignRight(rect.left + popoverW > window.innerWidth - 16);
      setOpenUp(rect.bottom + popoverH > window.innerHeight - 16 && rect.top > popoverH);
    }

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
  }, [open, value]);

  const days = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelect = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const displayValue = formatDisplayDate(value);
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
          color: displayValue ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: open ? '0 0 0 3px var(--accent-violet-soft)' : 'none',
        }}
      >
        <span className="truncate tabular-nums">{displayValue || placeholder}</span>
        <Calendar
          className="w-4 h-4 shrink-0 transition-colors"
          style={{ color: open ? 'var(--accent-violet)' : 'var(--text-muted)' }}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Seletor de data"
          className={`absolute z-50 w-[276px] rounded-2xl border p-3.5 shadow-xl animate-fade-in ${
            alignRight ? 'right-0' : 'left-0'
          } ${openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-strong)',
            boxShadow: '0 18px 40px -10px rgba(14, 13, 22, 0.28)',
          }}
        >
          {/* Month / Year header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Mês anterior"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer border-0"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <NavArrowLeft className="w-4 h-4" />
            </button>

            <span
              className="text-xs font-semibold tracking-tight select-none"
              style={{ color: 'var(--text-primary)' }}
            >
              {formatMonthYearPt(viewYear, viewMonth)}
            </span>

            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Próximo mês"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer border-0"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <NavArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {WEEKDAYS.map((wd, idx) => (
              <div
                key={`${wd}-${idx}`}
                className="h-6 flex items-center justify-center text-[11px] font-semibold uppercase select-none"
                style={{ color: 'var(--text-muted)' }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const isSelected = d.date === value;
              const isToday = d.date === TODAY;
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => handleSelect(d.date)}
                  className="w-8 h-8 mx-auto rounded-xl text-xs tabular-nums flex items-center justify-center transition-colors cursor-pointer border-0"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--accent-violet)'
                      : isToday
                      ? 'var(--accent-violet-soft)'
                      : 'transparent',
                    color: isSelected
                      ? '#FFFFFF'
                      : isToday
                      ? 'var(--accent-violet)'
                      : d.inMonth
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                    opacity: d.inMonth || isSelected ? 1 : 0.42,
                    fontWeight: isSelected || isToday ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isToday) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isToday) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {d.day}
                </button>
              );
            })}
          </div>

          {/* Footer quick actions */}
          <div
            className="flex items-center justify-between mt-3 pt-2.5 border-t"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            {allowClear && value ? (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border-0 bg-transparent"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                Limpar
              </button>
            ) : (
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {displayValue || 'Sem data'}
              </span>
            )}

            <button
              type="button"
              onClick={() => handleSelect(TODAY)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-0"
              style={{
                backgroundColor: 'var(--accent-violet-soft)',
                color: 'var(--accent-violet)',
              }}
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

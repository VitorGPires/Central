import React, { useEffect, useRef, useState } from 'react';
import { Check, NavArrowDown } from 'iconoir-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'field' | 'pill';
  className?: string;
  size?: 'sm' | 'md';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecionar...',
  variant = 'field',
  className = '',
  size = 'md',
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const isPill = variant === 'pill';
  const paddingClass =
    size === 'sm'
      ? isPill
        ? 'px-3.5 py-1.5 text-xs'
        : 'px-3 py-2 text-xs'
      : isPill
      ? 'px-4 py-2 text-xs'
      : 'px-3.5 py-2.5 text-sm';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 border text-left font-medium transition-all cursor-pointer ${
          isPill ? 'rounded-full' : 'rounded-xl'
        } ${paddingClass}`}
        style={{
          backgroundColor: isPill ? 'var(--bg-card)' : 'var(--bg-surface)',
          borderColor: open ? 'var(--accent-violet)' : 'var(--border-hairline)',
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: open ? '0 0 0 3px var(--accent-violet-soft)' : 'none',
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <NavArrowDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          style={{ color: open ? 'var(--accent-violet)' : 'var(--text-muted)' }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1.5 min-w-full w-max max-w-[280px] rounded-2xl border p-1.5 shadow-xl max-h-60 overflow-y-auto animate-fade-in"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-strong)',
            boxShadow: '0 16px 36px -8px rgba(20, 18, 36, 0.18)',
          }}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors cursor-pointer border-0"
                style={{
                  backgroundColor: active ? 'var(--accent-violet-soft)' : 'transparent',
                  color: active ? 'var(--accent-violet)' : 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="truncate">{opt.label}</span>
                {active && (
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-violet)' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

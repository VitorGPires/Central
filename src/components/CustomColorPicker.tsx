import React, { useEffect, useRef, useState } from 'react';
import { Plus } from 'iconoir-react';

interface CustomColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  variant?: 'circle' | 'pill';
  isCustomActive?: boolean;
  className?: string;
}

interface HSV {
  h: number; // 0..360
  s: number; // 0..100
  v: number; // 0..100
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hexToHsv(hex: string): HSV {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h, s, v };
}

function hsvToHex({ h, s, v }: HSV): string {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

const QUICK_SWATCHES = [
  '#6953F5',
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#F97316',
  '#EF4444',
  '#EC4899',
];

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  value,
  onChange,
  variant = 'circle',
  isCustomActive = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(value.toUpperCase());
  const [alignRight, setAlignRight] = useState(false);
  const [openUp, setOpenUp] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHsv(hexToHsv(value));
    setHexInput(value.toUpperCase());
  }, [value]);

  useEffect(() => {
    if (!open) return;
    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const popoverW = 248;
      const popoverH = 264;
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
  }, [open]);

  const updateSvFromPointer = (clientX: number, clientY: number) => {
    if (!svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const v = clamp((1 - (clientY - rect.top) / rect.height) * 100, 0, 100);
    const next = { ...hsv, s, v };
    setHsv(next);
    const hex = hsvToHex(next);
    setHexInput(hex);
    onChange(hex);
  };

  const updateHueFromPointer = (clientX: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, 359.9);
    const next = { ...hsv, h };
    setHsv(next);
    const hex = hsvToHex(next);
    setHexInput(hex);
    onChange(hex);
  };

  const handleSvPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSvFromPointer(e.clientX, e.clientY);
  };

  const handleSvPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    updateSvFromPointer(e.clientX, e.clientY);
  };

  const handleHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    updateHueFromPointer(e.clientX);
  };

  const handleHuePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    updateHueFromPointer(e.clientX);
  };

  const handleHexChange = (raw: string) => {
    const formatted = raw.startsWith('#') ? raw.toUpperCase() : `#${raw.toUpperCase()}`;
    setHexInput(formatted.slice(0, 7));
    if (/^#[0-9A-F]{6}$/.test(formatted)) {
      setHsv(hexToHsv(formatted));
      onChange(formatted);
    }
  };

  const hueColor = `hsl(${Math.round(hsv.h)}, 100%, 50%)`;

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      {variant === 'circle' ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Cor personalizada"
          aria-label="Escolher cor personalizada"
          aria-expanded={open}
          className="w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 border"
          style={{
            backgroundColor: isCustomActive ? value : 'var(--bg-surface)',
            borderColor: isCustomActive
              ? value
              : open
              ? 'var(--accent-violet)'
              : 'var(--border-strong)',
            color: isCustomActive ? '#FFFFFF' : 'var(--text-secondary)',
            outline: isCustomActive ? '2px solid var(--text-primary)' : 'none',
            outlineOffset: '2px',
          }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-[11px] font-mono font-semibold transition-all cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: open ? 'var(--accent-violet)' : 'var(--border-hairline)',
            color: 'var(--text-primary)',
            boxShadow: open ? '0 0 0 3px var(--accent-violet-soft)' : 'none',
          }}
        >
          <span
            className="w-4 h-4 rounded-full shrink-0 border"
            style={{ backgroundColor: value, borderColor: 'rgba(0,0,0,0.12)' }}
          />
          <span>{value.toUpperCase()}</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Seletor de cor"
          className={`absolute z-50 w-[244px] rounded-2xl border p-3 shadow-xl animate-fade-in space-y-3 ${
            alignRight ? 'right-0' : 'left-0'
          } ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-strong)',
            boxShadow: '0 18px 40px -10px rgba(14, 13, 22, 0.28)',
          }}
        >
          {/* Saturation / Brightness Canvas */}
          <div
            ref={svRef}
            onPointerDown={handleSvPointerDown}
            onPointerMove={handleSvPointerMove}
            className="relative w-full h-32 rounded-xl overflow-hidden cursor-crosshair select-none touch-none"
            style={{
              backgroundColor: hueColor,
              backgroundImage:
                'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
            }}
          >
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
                backgroundColor: value,
                boxShadow: '0 0 0 1.5px rgba(14,13,22,0.55), 0 2px 6px rgba(0,0,0,0.35)',
              }}
            />
          </div>

          {/* Hue Slider */}
          <div
            ref={hueRef}
            onPointerDown={handleHuePointerDown}
            onPointerMove={handleHuePointerMove}
            className="relative w-full h-3 rounded-full cursor-pointer select-none touch-none"
            style={{
              background:
                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
            }}
          >
            <div
              className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(hsv.h / 360) * 100}%`,
                backgroundColor: hueColor,
                boxShadow: '0 0 0 1.5px rgba(14,13,22,0.45), 0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </div>

          {/* Live Swatch + Hex Input */}
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl shrink-0 border"
              style={{
                backgroundColor: value,
                borderColor: 'var(--border-hairline)',
              }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              maxLength={7}
              spellCheck={false}
              className="flex-1 h-8 px-2.5 rounded-xl border text-xs font-mono font-medium outline-none uppercase"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
              aria-label="Código hexadecimal da cor"
            />
          </div>

          {/* Quick swatches */}
          <div
            className="flex items-center justify-between pt-2 border-t"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            {QUICK_SWATCHES.map((sw) => (
              <button
                key={sw}
                type="button"
                onClick={() => onChange(sw)}
                className="w-5 h-5 rounded-full cursor-pointer border-0 transition-transform hover:scale-110"
                style={{
                  backgroundColor: sw,
                  outline:
                    value.toUpperCase() === sw ? '2px solid var(--text-primary)' : 'none',
                  outlineOffset: '1.5px',
                }}
                aria-label={`Selecionar cor ${sw}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

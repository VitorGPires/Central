import React, { useState } from 'react';
import { Eye, EyeClosed, Trash } from 'iconoir-react';
import type { CardBrand, FinanceAccount } from '../types';
import { formatBRL } from '../utils/format';

const CONTOUR_RADII = Array.from({ length: 18 }, (_, index) => 72 + index * 24);

export interface CardModelConfig {
  id: CardBrand;
  label: string;
  defaultName: string;
  gradient: string;
  accent: string;
  badgeText: string;
  subBadge?: string;
  goldChip?: boolean;
  network: 'mastercard' | 'visa';
}

export const CARD_MODELS: CardModelConfig[] = [
  {
    id: 'nubank',
    label: 'Nubank (Roxo)',
    defaultName: 'Nubank',
    gradient: 'linear-gradient(135deg, #9B26F0 0%, #820AD1 52%, #4E0582 100%)',
    accent: '#C084FC',
    badgeText: 'nu',
    network: 'mastercard',
  },
  {
    id: 'nubank-uv',
    label: 'Nubank Ultravioleta',
    defaultName: 'Nubank Ultravioleta',
    gradient: 'linear-gradient(135deg, #353340 0%, #1D1B24 52%, #0F0E14 100%)',
    accent: '#A855F7',
    badgeText: 'nu',
    subBadge: 'ULTRAVIOLETA',
    network: 'mastercard',
  },
  {
    id: 'inter',
    label: 'Banco Inter (Laranja)',
    defaultName: 'Inter',
    gradient: 'linear-gradient(135deg, #FF8C1A 0%, #FF7A00 50%, #CC5200 100%)',
    accent: '#FFD0A0',
    badgeText: 'inter',
    network: 'mastercard',
  },
  {
    id: 'inter-black',
    label: 'Inter Black',
    defaultName: 'Inter Black',
    gradient: 'linear-gradient(135deg, #27272A 0%, #161618 52%, #09090B 100%)',
    accent: '#FF7A00',
    badgeText: 'inter',
    subBadge: 'BLACK',
    network: 'mastercard',
  },
  {
    id: 'itau',
    label: 'Itaú',
    defaultName: 'Itaú',
    gradient: 'linear-gradient(135deg, #0044BB 0%, #002D80 55%, #001B4D 100%)',
    accent: '#EC7000',
    badgeText: 'Itaú',
    network: 'visa',
  },
  {
    id: 'itau-personnalite',
    label: 'Itaú Personnalité',
    defaultName: 'Personnalité',
    gradient: 'linear-gradient(135deg, #2D2A26 0%, #1B1916 55%, #0F0E0C 100%)',
    accent: '#D4AF37',
    badgeText: 'Itaú',
    subBadge: 'PERSONNALITÉ',
    goldChip: true,
    network: 'mastercard',
  },
  {
    id: 'bradesco',
    label: 'Bradesco',
    defaultName: 'Bradesco',
    gradient: 'linear-gradient(135deg, #D91644 0%, #A80B30 52%, #6B061E 100%)',
    accent: '#FDA4AF',
    badgeText: 'Bradesco',
    network: 'visa',
  },
  {
    id: 'bb',
    label: 'Banco do Brasil (Ourocard)',
    defaultName: 'Ourocard BB',
    gradient: 'linear-gradient(135deg, #0038A8 0%, #002776 55%, #00184D 100%)',
    accent: '#FACC15',
    badgeText: 'BB',
    subBadge: 'OUROCARD',
    goldChip: true,
    network: 'visa',
  },
  {
    id: 'caixa',
    label: 'Caixa Econômica',
    defaultName: 'Caixa',
    gradient: 'linear-gradient(135deg, #0066B3 0%, #004B87 55%, #003057 100%)',
    accent: '#F58220',
    badgeText: 'CAIXA',
    network: 'visa',
  },
  {
    id: 'santander',
    label: 'Santander',
    defaultName: 'Santander',
    gradient: 'linear-gradient(135deg, #F01818 0%, #CC0000 52%, #8A0000 100%)',
    accent: '#FCA5A5',
    badgeText: 'Santander',
    network: 'mastercard',
  },
  {
    id: 'c6',
    label: 'C6 Bank Carbon',
    defaultName: 'C6 Bank',
    gradient: 'linear-gradient(135deg, #2C2C30 0%, #1A1A1D 52%, #0D0D0F 100%)',
    accent: '#E4E4E7',
    badgeText: 'C6 BANK',
    subBadge: 'CARBON',
    network: 'mastercard',
  },
  {
    id: 'xp',
    label: 'XP Visa Infinite',
    defaultName: 'XP Infinite',
    gradient: 'linear-gradient(135deg, #26231C 0%, #161410 52%, #0A0907 100%)',
    accent: '#D4AF37',
    badgeText: 'XP',
    subBadge: 'INFINITE',
    goldChip: true,
    network: 'visa',
  },
  {
    id: 'btg',
    label: 'BTG Pactual',
    defaultName: 'BTG Pactual',
    gradient: 'linear-gradient(135deg, #102B5C 0%, #081A3B 55%, #040D20 100%)',
    accent: '#60A5FA',
    badgeText: 'BTG',
    subBadge: 'PACTUAL',
    network: 'mastercard',
  },
  {
    id: 'mercadopago',
    label: 'Mercado Pago',
    defaultName: 'Mercado Pago',
    gradient: 'linear-gradient(135deg, #009EE3 0%, #0073B1 55%, #00436E 100%)',
    accent: '#BAE6FD',
    badgeText: 'mercado pago',
    network: 'visa',
  },
  {
    id: 'picpay',
    label: 'PicPay',
    defaultName: 'PicPay',
    gradient: 'linear-gradient(135deg, #16C772 0%, #0E9A56 55%, #076336 100%)',
    accent: '#A7F3D0',
    badgeText: 'PicPay',
    network: 'mastercard',
  },
  {
    id: 'wise',
    label: 'Wise (Internacional)',
    defaultName: 'Wise',
    gradient: 'linear-gradient(135deg, #255214 0%, #163300 55%, #0C1C00 100%)',
    accent: '#9FE870',
    badgeText: 'WISE',
    network: 'visa',
  },
  {
    id: 'nomad',
    label: 'Nomad (Dólar)',
    defaultName: 'Nomad',
    gradient: 'linear-gradient(135deg, #25262B 0%, #141519 55%, #090A0C 100%)',
    accent: '#FACC15',
    badgeText: 'NOMAD',
    goldChip: true,
    network: 'visa',
  },
  {
    id: 'sicredi',
    label: 'Sicredi',
    defaultName: 'Sicredi',
    gradient: 'linear-gradient(135deg, #3FA110 0%, #2B7509 55%, #194704 100%)',
    accent: '#BBF7D0',
    badgeText: 'Sicredi',
    network: 'visa',
  },
  {
    id: 'sicoob',
    label: 'Sicoob',
    defaultName: 'Sicoob',
    gradient: 'linear-gradient(135deg, #00665C 0%, #00453E 55%, #002925 100%)',
    accent: '#5EEAD4',
    badgeText: 'Sicoob',
    network: 'mastercard',
  },
  {
    id: 'custom',
    label: 'Personalizado (Escolha a cor)',
    defaultName: 'Meu Cartão',
    gradient: 'linear-gradient(135deg, #745CF7 0%, #553CE0 52%, #3521A8 100%)',
    accent: '#E9D5FF',
    badgeText: 'CARD',
    network: 'mastercard',
  },
];

export function buildCustomGradient(hex?: string): string {
  const safe = hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#6953F5';
  return `linear-gradient(135deg, ${safe} 0%, ${safe}CC 52%, #12101F 100%)`;
}

export function getCardModel(brand?: CardBrand, theme?: FinanceAccount['theme']): CardModelConfig {
  if (brand) {
    const found = CARD_MODELS.find((m) => m.id === brand);
    if (found) return found;
  }
  if (theme === 'forest') return CARD_MODELS.find((m) => m.id === 'btg')!;
  if (theme === 'ochre') return CARD_MODELS.find((m) => m.id === 'inter')!;
  if (theme === 'slate') return CARD_MODELS.find((m) => m.id === 'c6')!;
  return CARD_MODELS.find((m) => m.id === 'custom')!;
}

interface DigitSwapProps {
  value: string;
  animationKey: string;
  direction?: 'up' | 'down';
  suffixLength?: number;
  className?: string;
  glyphClassName?: string;
  suffixClassName?: string;
}

export const DigitSwap: React.FC<DigitSwapProps> = ({
  value,
  animationKey,
  direction = 'up',
  suffixLength = 0,
  className = '',
  glyphClassName = '',
  suffixClassName = '',
}) => {
  const splitIndex =
    suffixLength > 0 ? Math.max(0, value.length - suffixLength) : value.length;
  const prefix = value.slice(0, splitIndex);
  const suffix = value.slice(splitIndex);

  return (
    <span className={`inline-flex items-baseline overflow-hidden ${className}`}>
      <span
        key={`${animationKey}-prefix`}
        className={`inline-block whitespace-pre ${
          direction === 'up' ? 'animate-digit-up' : 'animate-digit-down'
        } ${glyphClassName}`}
      >
        {prefix}
      </span>
      {suffix && (
        <span className={`inline-block ${suffixClassName}`}>{suffix}</span>
      )}
    </span>
  );
};

interface InteractiveFinanceCardProps {
  account: FinanceAccount;
  computedInvoice?: number;
  onAddExpenseToCard?: (accountId: string) => void;
  onDelete?: (id: string) => void;
}

export const InteractiveFinanceCard: React.FC<InteractiveFinanceCardProps> = ({
  account,
  computedInvoice,
  onAddExpenseToCard,
  onDelete,
}) => {
  const [detailsVisible, setDetailsVisible] = useState(false);
  const model = getCardModel(account.brand, account.theme);

  const hash = Math.abs(
    `${account.id}-${account.name}`
      .split('')
      .reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7)
  );
  const cleanLast4 = account.last4?.replace(/\D/g, '').slice(-4);
  const last4 =
    cleanLast4 && cleanLast4.length === 4
      ? cleanLast4
      : String((hash % 9000) + 1000);
  const maskedNumber = `•••• •••• •••• ${last4}`;
  const revealedNumber = `4821 9042 3174 ${last4}`;

  const effectiveInvoice =
    computedInvoice !== undefined ? computedInvoice : account.invoiceAmount || 0;
  const mainValue =
    account.type === 'credito'
      ? formatBRL(effectiveInvoice)
      : formatBRL(account.balance);
  const limitValue = account.limit ? formatBRL(account.limit) : '—';

  const cardBg =
    account.brand === 'custom' && account.customColor
      ? buildCustomGradient(account.customColor)
      : model.gradient;

  const badgeTitle =
    account.brand === 'custom' ? account.name : model.badgeText;

  return (
    <div className="group/folder relative w-full max-w-[360px] mx-auto pt-14 pb-1 select-none">
      {/* Outer Soft-Lavender Sleeve Matching Our UX */}
      <div
        className="relative w-full aspect-[1.52/1] rounded-[22px] border"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Sliding Bank Card Inside the Pocket */}
        <div
          onClick={() => setDetailsVisible((v) => !v)}
          className={`absolute left-[4.5%] right-[4.5%] -top-[16%] aspect-[1.586/1] rounded-[16px] overflow-hidden text-white cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            detailsVisible
              ? '-translate-y-8 scale-[1.015]'
              : 'group-hover/folder:-translate-y-5'
          }`}
          style={{
            background: cardBg,
            boxShadow: '0 14px 28px -8px rgba(20, 18, 36, 0.35)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {/* Concentric Topographic Contour Rings */}
          <svg
            aria-hidden="true"
            viewBox="0 0 640 404"
            className="absolute inset-0 h-full w-full pointer-events-none"
          >
            {CONTOUR_RADII.map((radius, index) => (
              <circle
                key={radius}
                cx="-20"
                cy="-28"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeOpacity={Math.max(0.05, 0.28 - index * 0.011)}
                strokeWidth="1.5"
              />
            ))}
          </svg>

          {/* Radial Specular Highlight */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 78% 10%, rgba(255,255,255,0.22), transparent 36%)',
            }}
          />

          {/* Top-Left: Bank Brand Logo + Holder + Number */}
          <div className="absolute left-[6%] top-[9%] flex flex-col gap-1 z-10 max-w-[72%]">
            <div className="flex items-center gap-2">
              <span
                className="text-base sm:text-lg font-extrabold tracking-tight leading-none truncate"
                style={{
                  color:
                    model.id === 'xp' || model.id === 'nomad'
                      ? '#FACC15'
                      : model.id === 'itau'
                      ? '#FF8C1A'
                      : model.id === 'wise'
                      ? '#9FE870'
                      : '#ffffff',
                }}
              >
                {badgeTitle}
              </span>
              {model.subBadge && (
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded bg-white/12 shrink-0"
                  style={{ color: model.accent }}
                >
                  {model.subBadge}
                </span>
              )}
            </div>
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/70 truncate">
              {account.holder}
            </span>
            <DigitSwap
              value={detailsVisible ? revealedNumber : maskedNumber}
              animationKey={detailsVisible ? 'card-rev' : 'card-mask'}
              direction={detailsVisible ? 'up' : 'down'}
              suffixLength={4}
              glyphClassName={detailsVisible ? 'text-white' : 'text-white/70'}
              suffixClassName="text-white font-semibold"
              className="font-mono text-[11px] sm:text-xs tracking-[0.1em] mt-0.5"
            />
          </div>

          {/* Top-Right: Metallic EMV Chip (Silver or Gold) */}
          <span
            className="absolute top-[11%] right-[6.5%] h-[21%] w-[13.5%] overflow-hidden rounded-[18%] border border-black/25"
            style={{
              background: model.goldChip
                ? 'linear-gradient(135deg, #f8e4a8 0%, #c99d3b 48%, #f3d786 100%)'
                : 'linear-gradient(135deg, #f6f4ee 0%, #c8c5be 48%, #ebe8e0 100%)',
            }}
          >
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/25" />
            <span className="absolute inset-x-0 top-1/3 h-px bg-black/25" />
            <span className="absolute inset-x-0 bottom-1/3 h-px bg-black/25" />
            <span className="absolute left-0 top-1/2 h-[34%] w-[28%] -translate-y-1/2 rounded-r-[35%] border border-l-0 border-black/25" />
            <span className="absolute right-0 top-1/2 h-[34%] w-[28%] -translate-y-1/2 rounded-l-[35%] border border-r-0 border-black/25" />
          </span>
        </div>

        {/* Front Curved U-Cutout Pocket Flap Matching Our UX */}
        <div className="absolute inset-x-0 bottom-0 h-[57%] z-20">
          <svg
            viewBox="0 0 360 134"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <path
              d="M 0 18 Q 36 0 76 0 C 122 0 134 52 180 52 C 226 52 238 0 284 0 Q 324 0 360 18 L 360 112 Q 360 134 338 134 L 22 134 Q 0 134 0 112 Z"
              style={{
                fill: 'var(--bg-card)',
                stroke: 'var(--border-ink)',
                strokeWidth: 1.4,
              }}
            />
            <path
              d="M 8 23 Q 40 8 76 8 C 117 8 131 60 180 60 C 229 60 243 8 284 8 Q 320 8 352 23 L 352 110 Q 352 126 336 126 L 24 126 Q 8 126 8 110 Z"
              fill="none"
              style={{
                stroke: 'var(--accent-violet)',
                strokeOpacity: 0.35,
                strokeWidth: 1.2,
              }}
              strokeDasharray="4 4"
            />
          </svg>

          {/* Pocket Overlay Controls & Financial Info */}
          <div
            className="relative z-10 h-full px-6 pt-6 pb-4 flex flex-col justify-between"
            style={{ color: 'var(--text-primary)' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsVisible((v) => !v)}
                  className="p-1 -m-1 rounded-lg border-0 bg-transparent cursor-pointer transition-colors hover:opacity-80"
                  style={{ color: 'var(--accent-violet)' }}
                  title={detailsVisible ? 'Ocultar valores' : 'Revelar valores'}
                  aria-label={detailsVisible ? 'Ocultar valores' : 'Revelar valores'}
                >
                  {detailsVisible ? (
                    <EyeClosed className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(account.id)}
                    className="p-1 -m-1 rounded-lg border-0 bg-transparent opacity-0 group-hover/folder:opacity-100 transition-all cursor-pointer"
                    style={{ color: 'var(--accent-terracotta)' }}
                    title="Remover cartão"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="text-right">
                <span
                  className="block text-[8px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {account.type === 'credito'
                    ? 'Fatura atual'
                    : account.type === 'investimento'
                    ? 'Investido'
                    : 'Saldo'}
                </span>
                <DigitSwap
                  value={detailsVisible ? mainValue : 'R$ ••••'}
                  animationKey={detailsVisible ? 'val-rev' : 'val-mask'}
                  direction={detailsVisible ? 'up' : 'down'}
                  className="text-xs font-bold tabular-nums"
                />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-wider truncate"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {account.brand === 'custom' ? account.name : model.defaultName}
                </span>
                {account.type === 'credito' && onAddExpenseToCard && (
                  <button
                    type="button"
                    onClick={() => onAddExpenseToCard(account.id)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md border-0 cursor-pointer transition-opacity hover:opacity-85 shrink-0"
                    style={{
                      backgroundColor: 'var(--accent-violet-soft)',
                      color: 'var(--accent-violet)',
                    }}
                  >
                    + Fatura
                  </button>
                )}
              </div>
              <span
                className="text-[11px] font-medium tabular-nums shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {account.type === 'credito'
                  ? `Limite ${detailsVisible ? limitValue : '••••'}`
                  : account.type === 'investimento'
                  ? 'Investimento'
                  : 'Conta'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

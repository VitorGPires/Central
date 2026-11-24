export function getLocalTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatShortDate(iso: string): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${Number(d)} de ${months[Number(m) - 1] || ''}.`;
}

export function formatLongDatePt(iso: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatMonthYearPt(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayMonth(iso: string): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(n);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function getCurrentWeekDays(baseIso: string) {
  const base = new Date(`${baseIso}T12:00:00`);
  const dayOfWeek = base.getDay(); // 0 = Sun
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);

  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const dayShorts = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

  return Array.from({ length: 7 }, (_, i) => {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    return {
      date: `${y}-${m}-${d}`,
      label: dayNames[i],
      dayCode: dayShorts[i],
      num: d,
      short: `${d}/${m}`,
    };
  });
}

export function getMonthDays(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startOffset = firstDay.getDay();
  const days: { date: string; day: number; inMonth: boolean }[] = [];

  const toIso = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
      dt.getDate()
    ).padStart(2, '0')}`;

  const prevLast = new Date(year, monthIndex, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevLast - i;
    days.push({
      date: toIso(new Date(year, monthIndex - 1, d)),
      day: d,
      inMonth: false,
    });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: toIso(new Date(year, monthIndex, d)),
      day: d,
      inMonth: true,
    });
  }

  const targetLen = days.length > 35 ? 42 : 35;
  let nextDay = 1;
  while (days.length < targetLen) {
    days.push({
      date: toIso(new Date(year, monthIndex + 1, nextDay)),
      day: nextDay,
      inMonth: false,
    });
    nextDay++;
  }

  return days;
}

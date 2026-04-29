/**
 * Formatting helpers for numbers, dates, and durations.
 * Centralized so display strings are consistent across views.
 */

/** Format seconds as mm:ss. */
export function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

/** Format seconds as a humanized duration ("20 giây", "5 phút", "1h 20p"). */
export function fmtDuration(sec) {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s} giây`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}h` : `${h}h ${r}p`;
}

/** Format an ISO date (YYYY-MM-DD) → DD/MM. */
export function fmtDateShort(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** Format an ISO date → DD/MM/YYYY. */
export function fmtDateFull(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Today as ISO date string (local timezone). */
export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Round a number to N decimals. */
export function round(n, decimals = 1) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

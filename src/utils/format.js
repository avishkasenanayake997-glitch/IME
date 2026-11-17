let currencyCode = 'LKR';
let defaultDecimals = 2;
export const setCurrencyCode = (c, d) => { currencyCode = c || 'LKR'; if (d === 0 || d === 2) defaultDecimals = d; };

export const formatLKR = (n, opts = {}) => {
  const v = Number(n) || 0;
  const { decimals = defaultDecimals } = opts;
  return `${currencyCode} ${v.toLocaleString('en-LK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};
export const formatCompact = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return String(Math.round(v));
};
export const formatNumber = (n) => (Number(n) || 0).toLocaleString('en-LK');

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const formatTime = (d) => (d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');
export const formatDateTime = (d) => (d ? `${formatDate(d)}, ${formatTime(d)}` : '—');

export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const toISODate = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const validators = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || ''),
  phone: (v) => /^[+]?[0-9\s-]{7,16}$/.test(v || ''),
};

export const downloadCSV = (filename, rows) => {
  if (!rows?.length) return false;
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  return true;
};

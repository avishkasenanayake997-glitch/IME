import { startOfDay, endOfDay, addDays, toISODate, round2 } from './format';

// ---------- date ranges ----------
export const PRESETS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

export function getRange(preset, custom = {}) {
  const now = new Date();
  switch (preset) {
    case 'today': return { from: startOfDay(now), to: endOfDay(now) };
    case 'all': return { from: new Date(2000, 0, 1), to: endOfDay(now) };
    case 'year': return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };
    case '7d': return { from: startOfDay(addDays(now, -6)), to: endOfDay(now) };
    case 'month': return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    case 'custom': return {
      from: custom.from ? startOfDay(new Date(custom.from)) : startOfDay(addDays(now, -29)),
      to: custom.to ? endOfDay(new Date(custom.to)) : endOfDay(now),
    };
    default: return { from: startOfDay(addDays(now, -29)), to: endOfDay(now) };
  }
}

export const inRange = (iso, { from, to }) => { const t = new Date(iso).getTime(); return t >= from.getTime() && t <= to.getTime(); };
export const filterSales = (sales, range, branchId = 'all') =>
  sales.filter((s) => (branchId === 'all' || s.branchId === branchId) && inRange(s.date, range));

// ---------- per-sale math (returns-aware) ----------
export const saleNet = (s) => round2(s.total - (s.refunded || 0));
export const saleUnits = (s) => s.items.reduce((n, i) => n + i.qty - (i.returned || 0), 0);
export const saleProfit = (s) => {
  const net = s.items.reduce((n, i) => n + (i.qty - (i.returned || 0)) * (i.price - i.cost), 0);
  const gross = s.items.reduce((n, i) => n + (i.qty - (i.returned || 0)) * i.price, 0);
  const disc = s.subtotal ? s.discount * (gross / s.subtotal) : 0;
  return round2(net - disc);
};

export function summarize(sales) {
  const revenue = round2(sales.reduce((n, s) => n + saleNet(s), 0));
  const profit = round2(sales.reduce((n, s) => n + saleProfit(s), 0));
  const units = sales.reduce((n, s) => n + saleUnits(s), 0);
  const tax = round2(sales.reduce((n, s) => n + (s.tax || 0), 0));
  return { revenue, profit, orders: sales.length, units, tax, avg: sales.length ? round2(revenue / sales.length) : 0 };
}

// ---------- grouping ----------
const weekKey = (d) => {
  const x = startOfDay(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return toISODate(x);
};
const keyFns = {
  day: (d) => toISODate(d),
  week: weekKey,
  month: (d) => toISODate(d).slice(0, 7),
  year: (d) => String(new Date(d).getFullYear()),
};
export function groupByPeriod(sales, period = 'day') {
  const map = new Map();
  sales.forEach((s) => {
    const k = keyFns[period](s.date);
    const g = map.get(k) || { key: k, revenue: 0, profit: 0, orders: 0, units: 0 };
    g.revenue += saleNet(s); g.profit += saleProfit(s); g.orders += 1; g.units += saleUnits(s);
    map.set(k, g);
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key)).map((g) => ({ ...g, revenue: round2(g.revenue), profit: round2(g.profit) }));
}

// fills empty days so charts are continuous
export function dailySeries(sales, range) {
  const grouped = Object.fromEntries(groupByPeriod(sales, 'day').map((g) => [g.key, g]));
  const out = [];
  for (let d = startOfDay(range.from); d <= range.to; d = addDays(d, 1)) {
    const k = toISODate(d);
    out.push(grouped[k] || { key: k, revenue: 0, profit: 0, orders: 0, units: 0 });
  }
  return out;
}

export function productPerformance(sales, products = []) {
  const map = new Map();
  sales.forEach((s) => s.items.forEach((i) => {
    const q = i.qty - (i.returned || 0);
    if (q <= 0) return;
    const key = i.name;
    const g = map.get(key) || { name: i.name, units: 0, revenue: 0, profit: 0 };
    g.units += q; g.revenue += q * i.price; g.profit += q * (i.price - i.cost);
    map.set(key, g);
  }));
  const cats = Object.fromEntries(products.map((p) => [p.name, p.category]));
  return [...map.values()].map((g) => ({ ...g, category: cats[g.name] || '—', revenue: round2(g.revenue), profit: round2(g.profit) })).sort((a, b) => b.revenue - a.revenue);
}

export function categoryBreakdown(sales, products) {
  const cats = Object.fromEntries(products.map((p) => [p.id, p.category]));
  const map = {};
  sales.forEach((s) => s.items.forEach((i) => {
    const q = i.qty - (i.returned || 0);
    const c = cats[i.productId] || 'Other';
    map[c] = (map[c] || 0) + q * i.price;
  }));
  return Object.entries(map).map(([name, value]) => ({ name, value: round2(value) })).sort((a, b) => b.value - a.value);
}

export const stockStatus = (p) => (p.stock <= 0 ? 'Out of Stock' : p.stock <= p.minStock ? 'Low Stock' : 'In Stock');

export function pctChange(curr, prev) {
  if (!prev) return curr ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

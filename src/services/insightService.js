// Nexus Insight Assistant – rule-based engine.
// Every answer is CALCULATED from stored sales/inventory data. No AI model is connected.
// To add AI later, implement the same `ask(question, ctx)` contract and register it in `providers`.
import { store } from './store';
import { filterSales, productPerformance, summarize, pctChange, stockStatus, getRange, saleNet } from '../utils/analytics';
import { addDays, startOfDay, endOfDay, formatLKR } from '../utils/format';

const daysAgoRange = (from, to) => ({ from: startOfDay(addDays(new Date(), -from)), to: endOfDay(addDays(new Date(), -to)) });

function data(branchId) {
  const products = store.get('products').filter((p) => branchId === 'all' || p.branchId === branchId);
  const sales = store.get('sales').filter((s) => branchId === 'all' || s.branchId === branchId);
  return { products, sales, branchId };
}

// units sold per product name within a range
function unitsByProduct(sales, range) {
  const m = {};
  filterSales(sales, range).forEach((s) => s.items.forEach((i) => { m[i.name] = (m[i.name] || 0) + i.qty - (i.returned || 0); }));
  return m;
}

export function reorderSuggestions(branchId) {
  const { products, sales } = data(branchId);
  const sold30 = unitsByProduct(sales, daysAgoRange(29, 0));
  return products.filter((p) => p.stock <= p.minStock).map((p) => {
    const perDay = (sold30[p.name] || 0) / 30 / Math.max(1, new Set(products.filter((x) => x.name === p.name).map((x) => x.branchId)).size);
    const target = Math.max(p.minStock * 2, Math.ceil(perDay * 30));
    const qty = Math.max(5, Math.ceil((target - p.stock) / 5) * 5);
    return { product: p, qty, perDay: Math.round(perDay * 10) / 10 };
  }).sort((a, b) => a.product.stock - b.product.stock);
}

export function generateInsights(branchId = 'all') {
  const { products, sales } = data(branchId);
  const out = [];
  const branchName = (p) => (branchId === 'all' ? ` (${store.get('branches').find((b) => b.id === p.branchId)?.name || ''})` : '');

  // 1. low stock / out of stock
  products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock).forEach((p) => {
    out.push({ id: `ls-${p.id}`, type: 'lowstock', severity: p.stock === 0 ? 'danger' : 'warning',
      title: p.stock === 0 ? 'Out of stock' : 'Low stock warning',
      message: p.stock === 0 ? `${p.name}${branchName(p)} is out of stock.` : `Your ${p.name}${branchName(p)} stock is running low. Only ${p.stock} units remain (minimum ${p.minStock}).` });
  });

  // 2. reorder suggestions
  reorderSuggestions(branchId).slice(0, 8).forEach(({ product: p, qty, perDay }) => {
    out.push({ id: `ro-${p.id}`, type: 'reorder', severity: 'info', title: 'Reorder suggestion',
      message: `Consider reordering ${qty} units of ${p.name}${branchName(p)} (averaging ${perDay}/day, ${p.stock} in stock). Supplier: ${p.supplier}.` });
  });

  // 3. trends (last 30d vs previous 30d)
  const cur = unitsByProduct(sales, daysAgoRange(29, 0));
  const prev = unitsByProduct(sales, daysAgoRange(59, 30));
  Object.keys({ ...cur, ...prev }).forEach((name) => {
    const c = cur[name] || 0; const p = prev[name] || 0;
    if (p < 8) return;
    const ch = pctChange(c, p);
    if (ch <= -15) out.push({ id: `tr-${name}`, type: 'trend', severity: 'warning', title: 'Sales decline', message: `${name} sales have decreased by ${Math.abs(ch)}% compared to the previous 30 days (${p} → ${c} units).` });
    else if (ch >= 20) out.push({ id: `tr-${name}`, type: 'trend', severity: 'success', title: 'Sales growth', message: `${name} sales are up ${ch}% compared to the previous 30 days (${p} → ${c} units).` });
  });

  // 4. slow moving
  const sold30 = cur;
  products.filter((p) => p.stock > p.minStock * 2 && (sold30[p.name] || 0) <= 3 && p.stock > 0).slice(0, 6).forEach((p) => {
    out.push({ id: `sl-${p.id}`, type: 'slow', severity: 'info', title: 'Slow-moving product',
      message: `${p.name}${branchName(p)} sold only ${sold30[p.name] || 0} units in 30 days while ${p.stock} remain. Consider a promotion or smaller orders.` });
  });

  // 5. top seller this week
  const week = productPerformance(filterSales(sales, daysAgoRange(6, 0)), products);
  if (week[0]) out.push({ id: 'top-week', type: 'top', severity: 'success', title: 'Top-selling product', message: `Your highest-selling product this week is ${week[0].name} (${week[0].units} units, ${formatLKR(week[0].revenue, { decimals: 0 })}).` });

  // 6. daily summary
  const today = summarize(filterSales(sales, getRange('today')));
  const yest = summarize(filterSales(sales, daysAgoRange(1, 1)));
  out.push({ id: 'daily', type: 'summary', severity: 'info', title: 'Daily business summary',
    message: `Today: ${today.orders} orders, ${formatLKR(today.revenue, { decimals: 0 })} revenue (${pctChange(today.revenue, yest.revenue) >= 0 ? '+' : ''}${pctChange(today.revenue, yest.revenue)}% vs yesterday's ${formatLKR(yest.revenue, { decimals: 0 })}).` });

  // 7. monthly performance
  const m = summarize(filterSales(sales, getRange('month')));
  const now = new Date();
  const lmRange = { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: endOfDay(new Date(now.getFullYear(), now.getMonth() - 1, Math.min(now.getDate(), 28))) };
  const lm = summarize(filterSales(sales, lmRange));
  out.push({ id: 'monthly', type: 'summary', severity: 'info', title: 'Monthly performance summary',
    message: `This month so far: ${formatLKR(m.revenue, { decimals: 0 })} revenue from ${m.orders} orders, estimated profit ${formatLKR(m.profit, { decimals: 0 })}. Same period last month: ${formatLKR(lm.revenue, { decimals: 0 })} (${pctChange(m.revenue, lm.revenue) >= 0 ? '+' : ''}${pctChange(m.revenue, lm.revenue)}%).` });
  return out;
}

// ---------- chat ----------
export const SUGGESTED_QUESTIONS = [
  'What is running low on stock?',
  'What should I reorder?',
  'What are my top-selling products this week?',
  'Which products are slow-moving?',
  'How were sales today?',
  'How is this month performing?',
  'Which products are declining?',
  'Who are my best customers?',
];

const ruleBasedProvider = {
  name: 'Rule-based engine',
  isAI: false,
  ask(question, { branchId = 'all' } = {}) {
    const q = question.toLowerCase();
    const all = generateInsights(branchId);
    const pick = (t) => all.filter((i) => i.type === t);
    const reply = (text, items = []) => ({ text, items: items.map((i) => i.message), calculated: true });
    if (/reorder|restock|order more|purchase/.test(q)) {
      const r = pick('reorder');
      return r.length ? reply(`Based on the last 30 days of sales, I suggest ${r.length} reorder(s):`, r) : reply('No products currently need reordering.');
    }
    if (/slow|not selling|dead|unsold/.test(q)) {
      const r = pick('slow');
      return r.length ? reply('These products are moving slowly:', r) : reply('No slow-moving products detected.');
    }
    if (/low|running out|out of stock|shortage|stock/.test(q)) {
      const r = pick('lowstock');
      return r.length ? reply(`${r.length} product(s) need attention:`, r.slice(0, 10)) : reply('All products are above their minimum stock level.');
    }
    if (/declin|decreas|drop|falling|trend|growth|growing/.test(q)) {
      const r = pick('trend');
      return r.length ? reply('Sales trends compared with the previous 30 days:', r) : reply('No significant sales changes detected.');
    }
    if (/top|best sell|highest|popular/.test(q) && !/customer/.test(q)) {
      const { products, sales } = data(branchId);
      const w = productPerformance(filterSales(sales, daysAgoRange(6, 0)), products).slice(0, 5);
      return w.length ? { text: 'Top-selling products in the last 7 days:', items: w.map((p, i) => `${i + 1}. ${p.name} – ${p.units} units, ${formatLKR(p.revenue, { decimals: 0 })}`), calculated: true } : reply('No sales recorded in the last 7 days.');
    }
    if (/customer/.test(q)) {
      const { sales } = data(branchId);
      const m = {};
      sales.forEach((s) => { if (s.customerId !== 'c0') m[s.customerName] = (m[s.customerName] || 0) + saleNet(s); });
      const top = Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
      return { text: 'Your highest-spending customers (all time):', items: top.map(([n, v], i) => `${i + 1}. ${n} – ${formatLKR(v, { decimals: 0 })}`), calculated: true };
    }
    if (/month|monthly/.test(q)) return reply('Here is your monthly performance:', pick('summary').filter((i) => i.id === 'monthly'));
    if (/today|daily|yesterday/.test(q)) return reply('Here is your daily summary:', pick('summary').filter((i) => i.id === 'daily'));
    if (/summary|overview|how.*business/.test(q)) return reply('Business summary:', pick('summary'));
    return { text: "I can answer questions about low stock, reorders, top sellers, slow-moving products, sales trends, customers, and daily/monthly summaries. Try one of the suggested questions.", items: [], calculated: true };
  },
};

// Future: register an AI provider here, e.g. providers.ai = { name, isAI: true, ask: async (...) => {...} }
const providers = { rule: ruleBasedProvider };
export const insightProvider = () => providers.rule;

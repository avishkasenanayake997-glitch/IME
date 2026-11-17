import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { PageHeader, Tabs, StatCard, DataTable, EmptyState } from '../../components/common/ui';
import DateFilter, { useDateRange } from '../../components/common/DateFilter';
import { ChartBox, AreaTrend, Bars, Lines } from '../../components/charts/Charts';
import { useStore } from '../../services/store';
import { useToast } from '../../context/AppContext';
import { useScope } from '../../hooks/useScope';
import { filterSales, summarize, groupByPeriod, productPerformance, stockStatus, saleNet, saleProfit, PRESETS } from '../../utils/analytics';
import { formatLKR, formatDate, formatDateTime, downloadCSV, round2 } from '../../utils/format';

const presets = [...PRESETS.slice(0, 4), { id: 'year', label: 'This Year' }, { id: 'all', label: 'All time' }, PRESETS[4]];
const TABS = [
  { id: 'daily', label: 'Daily sales' }, { id: 'weekly', label: 'Weekly sales' }, { id: 'monthly', label: 'Monthly sales' }, { id: 'annual', label: 'Annual sales' },
  { id: 'product', label: 'Product performance' }, { id: 'inventory', label: 'Inventory' }, { id: 'customer', label: 'Customer purchases' }, { id: 'employee', label: 'Employee sales' }, { id: 'profit', label: 'Profit & revenue' },
];
const periodLabel = (period, key) => {
  if (period === 'day') return formatDate(key);
  if (period === 'week') return `Week of ${formatDate(key)}`;
  if (period === 'month') return new Date(key + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return key;
};

export default function Reports() {
  const sales = useStore('sales');
  const products = useStore('products');
  const branches = useStore('branches');
  const toast = useToast();
  const scope = useScope();
  const [tab, setTab] = useState('daily');
  const dr = useDateRange('30d');

  const report = useMemo(() => {
    const inR = filterSales(sales, dr.range, scope.branchId);
    const prods = products.filter((p) => scope.branchId === 'all' || p.branchId === scope.branchId);
    const sum = summarize(inR);
    const periodic = (period) => {
      const g = groupByPeriod(inR, period);
      const data = g.map((x) => ({ label: periodLabel(period, x.key), ...x }));
      return {
        stats: [['Revenue', formatLKR(sum.revenue, { decimals: 0 })], ['Orders', sum.orders], ['Units sold', sum.units], ['Avg. order', formatLKR(sum.avg, { decimals: 0 })]],
        chart: <AreaTrend data={data} series={[{ key: 'revenue', name: 'Revenue', money: true }]} />,
        columns: [{ key: 'label', label: 'Period', sortValue: (r) => r.key }, { key: 'orders', label: 'Orders' }, { key: 'units', label: 'Units' }, { key: 'revenue', label: 'Revenue', render: (r) => formatLKR(r.revenue) }, { key: 'profit', label: 'Est. profit', render: (r) => formatLKR(r.profit) }],
        rows: data, csv: data.map((r) => ({ Period: r.label, Orders: r.orders, Units: r.units, Revenue: r.revenue, Profit: r.profit })),
      };
    };
    if (['daily', 'weekly', 'monthly', 'annual'].includes(tab)) return periodic({ daily: 'day', weekly: 'week', monthly: 'month', annual: 'year' }[tab]);

    if (tab === 'product') {
      const perf = productPerformance(inR, products).map((p) => ({ ...p, id: p.name, margin: p.revenue ? Math.round((p.profit / p.revenue) * 100) : 0 }));
      return {
        stats: [['Products sold', perf.length], ['Top product', perf[0]?.name || '—'], ['Units sold', sum.units], ['Revenue', formatLKR(sum.revenue, { decimals: 0 })]],
        chart: <Bars horizontal data={perf.slice(0, 8)} xKey="name" series={[{ key: 'revenue', name: 'Revenue', money: true }]} />,
        columns: [{ key: 'name', label: 'Product' }, { key: 'category', label: 'Category' }, { key: 'units', label: 'Units sold' }, { key: 'revenue', label: 'Revenue', render: (r) => formatLKR(r.revenue) }, { key: 'profit', label: 'Profit', render: (r) => formatLKR(r.profit) }, { key: 'margin', label: 'Margin', render: (r) => `${r.margin}%` }],
        rows: perf, csv: perf.map((r) => ({ Product: r.name, Category: r.category, Units: r.units, Revenue: r.revenue, Profit: r.profit, 'Margin %': r.margin })),
      };
    }
    if (tab === 'inventory') {
      const sold = productPerformance(inR, products).reduce((m, p) => ({ ...m, [p.name]: p.units }), {});
      const rows = prods.map((p) => ({ ...p, status: stockStatus(p), value: p.stock * p.cost, retail: p.stock * p.price, sold: sold[p.name] || 0, branch: branches.find((b) => b.id === p.branchId)?.name }));
      const byCat = Object.entries(rows.reduce((m, r) => ({ ...m, [r.category]: (m[r.category] || 0) + r.value }), {})).map(([label, value]) => ({ label, value: round2(value) }));
      return {
        stats: [['Products', rows.length], ['Stock value (cost)', formatLKR(rows.reduce((n, r) => n + r.value, 0), { decimals: 0 })], ['Low stock', rows.filter((r) => r.status === 'Low Stock').length], ['Out of stock', rows.filter((r) => r.status === 'Out of Stock').length]],
        chart: <Bars data={byCat} series={[{ key: 'value', name: 'Stock value (cost)', money: true }]} />, chartTitle: 'Stock value by category',
        columns: [{ key: 'name', label: 'Product' }, { key: 'branch', label: 'Branch' }, { key: 'category', label: 'Category' }, { key: 'stock', label: 'On hand' }, { key: 'minStock', label: 'Min' }, { key: 'status', label: 'Status' }, { key: 'sold', label: 'Sold (period)' }, { key: 'value', label: 'Stock value', render: (r) => formatLKR(r.value, { decimals: 0 }) }],
        rows, csv: rows.map((r) => ({ Product: r.name, Branch: r.branch, SKU: r.sku, Category: r.category, OnHand: r.stock, Min: r.minStock, Status: r.status, SoldInPeriod: r.sold, StockValueCost: r.value })),
      };
    }
    if (tab === 'customer') {
      const m = {};
      inR.forEach((s) => { const x = m[s.customerId] || { id: s.customerId, name: s.customerName, orders: 0, spent: 0, last: s.date }; x.orders++; x.spent += saleNet(s); if (s.date > x.last) x.last = s.date; m[s.customerId] = x; });
      const rows = Object.values(m).sort((a, b) => b.spent - a.spent);
      return {
        stats: [['Active customers', rows.length], ['Top customer', rows.find((r) => r.id !== 'c0')?.name || '—'], ['Orders', sum.orders], ['Revenue', formatLKR(sum.revenue, { decimals: 0 })]],
        chart: <Bars horizontal data={rows.slice(0, 8)} xKey="name" series={[{ key: 'spent', name: 'Spent', money: true }]} />,
        columns: [{ key: 'name', label: 'Customer' }, { key: 'orders', label: 'Orders' }, { key: 'spent', label: 'Total spent', render: (r) => formatLKR(r.spent) }, { key: 'last', label: 'Last purchase', render: (r) => formatDate(r.last) }],
        rows, csv: rows.map((r) => ({ Customer: r.name, Orders: r.orders, TotalSpent: round2(r.spent), LastPurchase: formatDate(r.last) })),
      };
    }
    if (tab === 'employee') {
      const m = {};
      inR.forEach((s) => { const x = m[s.cashierId] || { id: s.cashierId, name: s.cashierName, orders: 0, revenue: 0, units: 0 }; x.orders++; x.revenue += saleNet(s); x.units += s.items.reduce((n, i) => n + i.qty - (i.returned || 0), 0); m[s.cashierId] = x; });
      const rows = Object.values(m).map((r) => ({ ...r, avg: r.orders ? r.revenue / r.orders : 0 })).sort((a, b) => b.revenue - a.revenue);
      return {
        stats: [['Employees with sales', rows.length], ['Top performer', rows[0]?.name || '—'], ['Orders', sum.orders], ['Revenue', formatLKR(sum.revenue, { decimals: 0 })]],
        chart: <Bars horizontal data={rows} xKey="name" series={[{ key: 'revenue', name: 'Revenue', money: true }]} />,
        columns: [{ key: 'name', label: 'Employee' }, { key: 'orders', label: 'Orders' }, { key: 'units', label: 'Units' }, { key: 'revenue', label: 'Revenue', render: (r) => formatLKR(r.revenue) }, { key: 'avg', label: 'Avg. order', render: (r) => formatLKR(r.avg) }],
        rows, csv: rows.map((r) => ({ Employee: r.name, Orders: r.orders, Units: r.units, Revenue: round2(r.revenue), AvgOrder: round2(r.avg) })),
      };
    }
    // profit
    const g = groupByPeriod(inR, inR.length && (dr.range.to - dr.range.from) / 864e5 > 120 ? 'month' : 'day');
    const monthly = (dr.range.to - dr.range.from) / 864e5 > 120;
    const data = g.map((x) => ({ ...x, label: periodLabel(monthly ? 'month' : 'day', x.key), margin: x.revenue ? Math.round((x.profit / x.revenue) * 100) : 0 }));
    return {
      stats: [['Revenue', formatLKR(sum.revenue, { decimals: 0 })], ['Est. profit', formatLKR(sum.profit, { decimals: 0 })], ['Margin', `${sum.revenue ? Math.round((sum.profit / sum.revenue) * 100) : 0}%`], ['Tax collected', formatLKR(sum.tax, { decimals: 0 })]],
      chart: <Lines data={data} series={[{ key: 'revenue', name: 'Revenue' }, { key: 'profit', name: 'Profit', color: '#10B981' }]} />,
      columns: [{ key: 'label', label: 'Period', sortValue: (r) => r.key }, { key: 'orders', label: 'Orders' }, { key: 'revenue', label: 'Revenue', render: (r) => formatLKR(r.revenue) }, { key: 'profit', label: 'Est. profit', render: (r) => formatLKR(r.profit) }, { key: 'margin', label: 'Margin', render: (r) => `${r.margin}%` }],
      rows: data, csv: data.map((r) => ({ Period: r.label, Orders: r.orders, Revenue: r.revenue, Profit: r.profit, 'Margin %': r.margin })),
    };
  }, [tab, sales, products, branches, dr.range, scope.branchId]);

  const title = TABS.find((t) => t.id === tab).label;
  const exportCsv = () => (downloadCSV(`nexus-${tab}-report.csv`, report.csv) ? toast.success('CSV exported') : toast.error('No data to export'));

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Calculated from your stored transactions and inventory"
        actions={<><button className="btn-outline" onClick={exportCsv}><Download size={16} /> Export CSV</button><button className="btn-navy" onClick={() => window.print()}><Printer size={16} /> Print</button></>} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      <div className="mb-4"><DateFilter state={dr} presets={presets} /></div>
      <div className="print-only mb-4"><h2 className="text-lg font-bold">{title} – Nexus Smart Business Solutions</h2><p className="text-sm">{formatDate(dr.range.from)} – {formatDate(dr.range.to)} · Generated {formatDateTime(new Date())}</p></div>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{report.stats.map(([l, v], i) => <StatCard key={l} label={l} value={v} tone={['blue', 'green', 'cyan', 'navy'][i]} />)}</div>
      <div className="mb-4"><ChartBox title={report.chartTitle || title} subtitle={`${formatDate(dr.range.from)} – ${formatDate(dr.range.to)}`} height={280}>{report.chart}</ChartBox></div>
      <div className="card"><DataTable columns={report.columns} rows={report.rows} pageSize={12} empty={<EmptyState title="No data for this report" message="Try a different date range." />} /></div>
    </div>
  );
}

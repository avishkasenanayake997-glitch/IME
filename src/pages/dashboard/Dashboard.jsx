import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CalendarClock, ShoppingBag, Package, AlertTriangle, Users, CalendarRange, TrendingUp, Activity, ArrowRight } from 'lucide-react';
import { PageHeader, StatCard, Badge, EmptyState, ProductThumb } from '../../components/common/ui';
import DateFilter, { useDateRange } from '../../components/common/DateFilter';
import { ChartBox, AreaTrend, Bars, Donut } from '../../components/charts/Charts';
import { useStore } from '../../services/store';
import { useAuth } from '../../context/AppContext';
import { useScope } from '../../hooks/useScope';
import { filterSales, summarize, dailySeries, groupByPeriod, productPerformance, categoryBreakdown, getRange, stockStatus, saleNet } from '../../utils/analytics';
import { formatLKR, formatDate, formatDateTime, formatTime } from '../../utils/format';

export default function Dashboard() {
  const sales = useStore('sales');
  const allProducts = useStore('products');
  const customers = useStore('customers');
  const movements = useStore('movements');
  const { can, user } = useAuth();
  const { branchId: effBranch } = useScope();
  const dr = useDateRange('30d');
  const financial = can('dashboard.financials');

  const data = useMemo(() => {
    const products = allProducts.filter((p) => effBranch === 'all' || p.branchId === effBranch);
    const inRange = filterSales(sales, dr.range, effBranch);
    const today = filterSales(sales, getRange('today'), effBranch);
    const month = filterSales(sales, getRange('month'), effBranch);
    const s = summarize(inRange);
    const sixMonths = new Date(); sixMonths.setMonth(sixMonths.getMonth() - 5, 1); sixMonths.setHours(0, 0, 0, 0);
    const monthly = groupByPeriod(sales.filter((x) => (effBranch === 'all' || x.branchId === effBranch) && new Date(x.date) >= sixMonths), 'month')
      .map((g) => ({ label: new Date(g.key + '-01').toLocaleDateString('en-GB', { month: 'short' }), revenue: g.revenue, profit: g.profit }));
    const trend = dailySeries(inRange, dr.range).map((d) => ({ label: d.key, revenue: d.revenue, orders: d.orders }));
    return {
      products, s, inRange,
      todayRev: summarize(today).revenue, monthRev: summarize(month).revenue,
      low: products.filter((p) => stockStatus(p) !== 'In Stock').sort((a, b) => a.stock - b.stock),
      top: productPerformance(inRange, products).slice(0, 5),
      cats: categoryBreakdown(inRange, allProducts), monthly, trend,
      recent: [...inRange].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6),
    };
  }, [sales, allProducts, effBranch, dr.range]);

  const activities = useMemo(() => {
    const a = [];
    sales.filter((s) => effBranch === 'all' || s.branchId === effBranch).slice(0, 40).forEach((s) => a.push({ date: s.date, text: `${s.cashierName} completed ${s.invoice}`, sub: s.customerName }));
    movements.filter((m) => m.type !== 'sale' && (effBranch === 'all' || m.branchId === effBranch)).slice(0, 20).forEach((m) => a.push({ date: m.date, text: `${m.by}: ${m.type} ${m.qty > 0 ? '+' : ''}${m.qty} ${m.productName}`, sub: m.reason }));
    return a.sort((x, y) => new Date(y.date) - new Date(x.date)).slice(0, 7);
  }, [sales, movements, effBranch]);

  const dateFmt = (k) => (k?.length === 10 ? new Date(k).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : k);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${user.name.split(' ')[0]}. Here's how your business is performing.`} actions={<DateFilter state={dr} />} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total Sales (selected period)" value={formatLKR(data.s.revenue, { decimals: 0 })} icon={DollarSign} tone="blue" />
        <StatCard label="Today's Revenue" value={formatLKR(data.todayRev, { decimals: 0 })} icon={CalendarClock} tone="cyan" />
        <StatCard label="Total Orders" value={data.s.orders.toLocaleString()} icon={ShoppingBag} tone="navy" hint={`${data.s.units} units sold`} />
        <StatCard label="Total Products" value={data.products.length} icon={Package} tone="blue" />
        <StatCard label="Low Stock Products" value={data.low.length} icon={AlertTriangle} tone={data.low.length ? 'orange' : 'green'} hint="incl. out of stock" />
        <StatCard label="Total Customers" value={customers.length - 1} icon={Users} tone="cyan" />
        <StatCard label="Monthly Revenue" value={formatLKR(data.monthRev, { decimals: 0 })} icon={CalendarRange} tone="blue" hint="This month" />
        {financial ? <StatCard label="Estimated Profit" value={formatLKR(data.s.profit, { decimals: 0 })} icon={TrendingUp} tone="green" hint="Selected period" />
          : <StatCard label="Avg. Order Value" value={formatLKR(data.s.avg, { decimals: 0 })} icon={TrendingUp} tone="green" />}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartBox title="Sales overview" subtitle="Daily revenue for the selected period">
          <AreaTrend data={data.trend} xFormatter={dateFmt} series={[{ key: 'revenue', name: 'Revenue', money: true }]} />
        </ChartBox></div>
        <ChartBox title="Sales by category" subtitle="Selected period"><Donut data={data.cats} /></ChartBox>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartBox title="Monthly revenue" subtitle="Last 6 months" height={240}>
          <Bars data={data.monthly} series={financial ? [{ key: 'revenue', name: 'Revenue', money: true }, { key: 'profit', name: 'Profit', money: true, color: '#06B6D4' }] : [{ key: 'revenue', name: 'Revenue', money: true }]} />
        </ChartBox></div>
        <div className="card p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold">Top-selling products</h3>
          {data.top.length ? <ol className="space-y-3">{data.top.map((p, i) => (
            <li key={p.name} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{i + 1}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-xs text-slate-500">{p.units} units</p></div>
              <span className="text-sm font-semibold">{formatLKR(p.revenue, { decimals: 0 })}</span></li>))}</ol> : <EmptyState title="No sales in this period" />}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><h3 className="text-sm font-semibold">Recent transactions</h3><Link to="/app/sales" className="flex items-center gap-1 text-xs font-semibold text-brand">View all <ArrowRight size={12} /></Link></div>
          {data.recent.length ? (
            <div className="overflow-x-auto"><table className="w-full min-w-[480px]"><tbody className="divide-y divide-slate-100">
              {data.recent.map((s) => (
                <tr key={s.id}><td className="td font-medium">{s.invoice}</td><td className="td text-slate-600">{s.customerName}</td><td className="td text-xs text-slate-500">{formatDateTime(s.date)}</td><td className="td"><Badge color={s.paymentMethod === 'Cash' ? 'green' : 'blue'}>{s.paymentMethod}</Badge></td><td className="td text-right font-semibold">{formatLKR(saleNet(s))}</td></tr>
              ))}</tbody></table></div>
          ) : <EmptyState title="No transactions" message="No sales were recorded in this period." />}
        </div>
        <div className="card p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><AlertTriangle size={16} className="text-orange-500" /> Low-stock alerts</h3>
          {data.low.length ? <ul className="space-y-3">{data.low.slice(0, 6).map((p) => (
            <li key={p.id} className="flex items-center gap-3"><ProductThumb product={p} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-xs text-slate-500">{p.stock} left · min {p.minStock}</p></div><Badge color={p.stock === 0 ? 'red' : 'orange'}>{p.stock === 0 ? 'Out' : 'Low'}</Badge></li>))}</ul>
            : <EmptyState title="All stocked up" message="No products are below their minimum level." />}
          {data.low.length > 6 && <Link to="/app/inventory" className="mt-3 block text-center text-xs font-semibold text-brand">View all {data.low.length} alerts</Link>}
        </div>
      </div>

      <div className="card mt-4 p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Activity size={16} className="text-brand" /> Recent activity</h3>
        {activities.length ? <ul className="divide-y divide-slate-100">{activities.map((a, i) => (
          <li key={i} className="flex items-start justify-between gap-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm">{a.text}</p><p className="truncate text-xs text-slate-500">{a.sub}</p></div><span className="shrink-0 text-xs text-slate-400">{formatDate(a.date)} {formatTime(a.date)}</span></li>))}</ul>
          : <EmptyState title="No recent activity" />}
      </div>
    </div>
  );
}

import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCompact, formatLKR, formatDate } from '../../utils/format';

export const PALETTE = ['#2563EB', '#06B6D4', '#14213D', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];
const axis = { fontSize: 11, fill: '#64748b' };

const tipFmt = (isMoney) => (v) => (isMoney ? formatLKR(v) : v);

export function ChartBox({ title, subtitle, children, height = 260, actions }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div><h3 className="text-sm font-semibold">{title}</h3>{subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}</div>{actions}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

export function NoData() { return <div className="flex h-full items-center justify-center text-sm text-slate-400">No data for the selected period</div>; }

// data: [{ label, ...seriesKeys }]  series: [{ key, name, color, money }]
export function AreaTrend({ data, series, xFormatter }) {
  if (!data.length) return <NoData />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: -10, right: 8, top: 5 }}>
        <defs>{series.map((s, i) => <linearGradient key={s.key} id={`g${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.color || PALETTE[i]} stopOpacity={0.25} /><stop offset="100%" stopColor={s.color || PALETTE[i]} stopOpacity={0} /></linearGradient>)}</defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickFormatter={xFormatter} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tick={axis} tickFormatter={formatCompact} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v, n, p) => (series.find((s) => s.key === p.dataKey)?.money ? formatLKR(v) : v)} labelFormatter={xFormatter} />
        {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || PALETTE[i]} fill={`url(#g${i})`} strokeWidth={2} />)}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, series, xKey = 'label', horizontal = false }) {
  if (!data.length) return <NoData />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ left: horizontal ? 20 : -10, right: 8, top: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? <><XAxis type="number" tick={axis} tickFormatter={formatCompact} axisLine={false} tickLine={false} /><YAxis type="category" dataKey={xKey} tick={axis} width={110} axisLine={false} tickLine={false} /></>
          : <><XAxis dataKey={xKey} tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} tickFormatter={formatCompact} axisLine={false} tickLine={false} /></>}
        <Tooltip formatter={(v, n, p) => (series.find((s) => s.key === p.dataKey)?.money ? formatLKR(v) : v)} cursor={{ fill: '#f1f5f9' }} />
        {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || PALETTE[i]} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={36} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data }) {
  if (!data.length) return <NoData />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((d, i) => <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => formatLKR(v)} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function Lines({ data, series }) {
  if (!data.length) return <NoData />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: -10, right: 8, top: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} tickFormatter={formatCompact} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => formatLKR(v)} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || PALETTE[i]} strokeWidth={2} dot={false} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

export { tipFmt, formatDate };

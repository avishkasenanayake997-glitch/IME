import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, AlertTriangle, TrendingDown, TrendingUp, PackageSearch, Trophy, CalendarDays, RotateCcw, Info, Bot, User } from 'lucide-react';
import { PageHeader, Badge, EmptyState } from '../../components/common/ui';
import { useStore } from '../../services/store';
import { useScope } from '../../hooks/useScope';
import { generateInsights, SUGGESTED_QUESTIONS, insightProvider } from '../../services/insightService';

const meta = {
  lowstock: [AlertTriangle, 'Low stock', 'orange'], reorder: [RotateCcw, 'Reorder', 'blue'], trend: [TrendingDown, 'Trend', 'cyan'],
  slow: [PackageSearch, 'Slow-moving', 'slate'], top: [Trophy, 'Top seller', 'green'], summary: [CalendarDays, 'Summary', 'blue'],
};
const FILTERS = [['all', 'All'], ['lowstock', 'Low stock'], ['reorder', 'Reorder'], ['trend', 'Trends'], ['slow', 'Slow-moving'], ['top', 'Top sellers'], ['summary', 'Summaries']];

export default function Insights() {
  // re-compute when data changes
  const sales = useStore('sales'); const products = useStore('products');
  const { branchId } = useScope();
  const [filter, setFilter] = useState('all');
  const insights = useMemo(() => generateInsights(branchId), [sales, products, branchId]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = insights.filter((i) => filter === 'all' || i.type === filter);
  const provider = insightProvider();

  const [chat, setChat] = useState([{ role: 'bot', text: "Hi! I'm the Nexus Insight Assistant. I answer using calculations on your own sales and inventory data. Pick a suggested question or type your own.", items: [] }]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [chat]);
  const ask = (text) => {
    const t = text.trim(); if (!t) return;
    const r = provider.ask(t, { branchId });
    setChat((c) => [...c, { role: 'user', text: t }, { role: 'bot', ...r }]); setInput('');
  };

  return (
    <div>
      <PageHeader title="Nexus Insight Assistant" subtitle="Business insights calculated from your sales and inventory data" actions={<Badge color="cyan">Rule-based · {provider.name}</Badge>} />
      <div className="mb-6 flex gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p><b>Calculated insights, not AI.</b> Everything here is produced by fixed rules (thresholds, averages and period comparisons) over your stored data. No AI model or external API is connected. The assistant is structured so a real AI provider can be plugged in later.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{FILTERS.map(([id, l]) => <button key={id} onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ${filter === id ? 'bg-navy text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{l}</button>)}</div>
          {shown.length ? (
            <div className="space-y-3">
              {shown.map((i) => { const [Icon, label, color] = meta[i.type]; const Sev = i.type === 'trend' && i.severity === 'success' ? TrendingUp : Icon;
                return (
                  <div key={i.id} className={`card flex gap-3 border-l-4 p-4 ${{ danger: 'border-l-red-500', warning: 'border-l-orange-400', success: 'border-l-green-500', info: 'border-l-brand' }[i.severity]}`}>
                    <div className="h-fit rounded-lg bg-slate-100 p-2"><Sev size={18} className="text-navy" /></div>
                    <div className="min-w-0 flex-1"><div className="mb-0.5 flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{i.title}</h3><Badge color={color}>{label}</Badge></div><p className="text-sm text-slate-600">{i.message}</p>
                      {(i.type === 'lowstock' || i.type === 'reorder') && <Link to="/app/inventory" className="mt-1 inline-block text-xs font-semibold text-brand">Open inventory →</Link>}</div>
                  </div>); })}
            </div>
          ) : <div className="card"><EmptyState icon={Sparkles} title="No insights in this category" message="Nothing needs attention right now." /></div>}
        </div>

        <div className="xl:col-span-2">
          <div className="card flex h-[34rem] flex-col xl:sticky xl:top-0">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3"><Sparkles size={16} className="text-accent" /><h2 className="text-sm font-semibold">Ask about your business</h2></div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {chat.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'bot' && <div className="h-fit rounded-full bg-navy p-1.5 text-white"><Bot size={14} /></div>}
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'bg-brand text-white' : 'bg-slate-100 text-ink'}`}>
                    <p>{m.text}</p>
                    {m.items?.length > 0 && <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[13px]">{m.items.map((t, k) => <li key={k}>{t}</li>)}</ul>}
                    {m.calculated && <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Calculated from your data · not AI</p>}
                  </div>
                  {m.role === 'user' && <div className="h-fit rounded-full bg-slate-200 p-1.5"><User size={14} /></div>}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="border-t border-slate-200 p-3">
              <div className="mb-2 flex max-h-20 flex-wrap gap-1.5 overflow-y-auto">{SUGGESTED_QUESTIONS.map((q) => <button key={q} onClick={() => ask(q)} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-brand hover:text-brand">{q}</button>)}</div>
              <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2"><input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask e.g. “What should I reorder?”" aria-label="Question" /><button className="btn-primary px-3" aria-label="Send"><Send size={16} /></button></form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

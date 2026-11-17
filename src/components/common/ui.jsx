import { useEffect, useMemo, useState } from 'react';
import { X, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox, Loader2, AlertTriangle } from 'lucide-react';

export function Logo({ dark = false, size = 32, name = 'Nexus', subtitle = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={dark ? '#fff' : '#14213D'} />
        <path d="M9 23V9l14 14V9" fill="none" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="leading-tight">
        <div className={`text-base font-bold tracking-tight ${dark ? 'text-white' : 'text-navy'}`}>{name}</div>
        {subtitle && <div className={`text-[10px] font-medium uppercase tracking-wider ${dark ? 'text-slate-300' : 'text-slate-500'}`}>Smart Business Solutions</div>}
      </div>
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"><Loader2 className="animate-spin" size={18} /> {label}</div>;
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400"><Icon size={24} /></div>
      <h3 className="text-sm font-semibold text-navy">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const badgeColors = {
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
};
export function Badge({ color = 'slate', children }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeColors[color]}`}>{children}</span>;
}
export const statusColor = (s) => ({ 'In Stock': 'green', 'Low Stock': 'orange', 'Out of Stock': 'red', Completed: 'green', Refunded: 'red', 'Partially Returned': 'orange', Active: 'green', Inactive: 'slate' }[s] || 'slate');

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = 'blue', hint }) {
  const tones = { blue: 'bg-blue-50 text-brand', cyan: 'bg-cyan-50 text-accent', green: 'bg-green-50 text-green-600', orange: 'bg-orange-50 text-orange-600', red: 'bg-red-50 text-red-600', navy: 'bg-slate-100 text-navy' };
  return (
    <div className="card p-4 transition hover:shadow-pop">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 truncate text-xl font-bold text-navy">{value}</p>
          {hint && <p className="mt-0.5 truncate text-xs text-slate-400">{hint}</p>}
        </div>
        {Icon && <div className={`shrink-0 rounded-lg p-2 ${tones[tone]}`}><Icon size={18} /></div>}
      </div>
    </div>
  );
}

export function Field({ label, error, required, children, hint }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
export const TextInput = ({ error, ...p }) => <input {...p} className={`input ${error ? 'input-error' : ''} ${p.className || ''}`} />;
export const SelectInput = ({ error, children, ...p }) => <select {...p} className={`input ${error ? 'input-error' : ''} ${p.className || ''}`}>{children}</select>;

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input pl-9" aria-label={placeholder} />
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`flex max-h-[92vh] w-full ${w} flex-col rounded-t-2xl bg-white shadow-pop sm:rounded-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title = 'Are you sure?', message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm"
      footer={<><button className="btn-outline" onClick={onCancel}>Cancel</button><button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button></>}>
      <div className="flex gap-3">
        <div className={`h-fit rounded-full p-2 ${danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-brand'}`}><AlertTriangle size={20} /></div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}

export function Pagination({ page, pages, total, pageSize, onChange }) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1; const to = Math.min(total, page * pageSize);
  return (
    <div className="no-print flex flex-col items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <button className="btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={14} /></button>
        <span className="px-2">Page {page} of {pages}</span>
        <button className="btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

// columns: [{ key, label, render?(row), sortValue?(row), sortable?, className? }]
export function DataTable({ columns, rows, pageSize = 10, empty, onRowClick, initialSort }) {
  const [sort, setSort] = useState(initialSort || null);
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const val = (r) => (col?.sortValue ? col.sortValue(r) : r[sort.key]);
    return [...rows].sort((a, b) => {
      const x = val(a); const y = val(b);
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true });
      return sort.dir === 'asc' ? c : -c;
    });
  }, [rows, sort, columns]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => { if (page > pages) setPage(1); }, [pages, page]);
  useEffect(() => { setPage(1); }, [rows.length]);
  const slice = sorted.slice((page - 1) * pageSize, page * pageSize);
  const toggle = (c) => c.sortable !== false && setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: c.key, dir: 'asc' }));
  if (!rows.length) return empty || <EmptyState />;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`th ${c.sortable !== false && !c.noSort ? 'cursor-pointer select-none hover:text-navy' : ''} ${c.className || ''}`} onClick={() => !c.noSort && toggle(c)}>
                  <span className="inline-flex items-center gap-1">{c.label}
                    {sort?.key === c.key && (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map((r, i) => (
              <tr key={r.id || i} onClick={() => onRowClick?.(r)} className={`transition hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''}`}>
                {columns.map((c) => <td key={c.key} className={`td ${c.className || ''}`}>{c.render ? c.render(r) : r[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} total={sorted.length} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="no-print mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition ${value === t.id ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-navy'}`}>{t.label}</button>
      ))}
    </div>
  );
}

export function ProductThumb({ product, size = 'md' }) {
  const s = size === 'lg' ? 'h-24 w-full text-5xl' : size === 'sm' ? 'h-9 w-9 text-lg' : 'h-20 w-full text-4xl';
  if (product.imageUrl) return <img src={product.imageUrl} alt={product.name} className={`${s} rounded-lg object-cover`} />;
  return <div className={`${s} flex items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-blue-50`} aria-hidden="true">{product.emoji || '📦'}</div>;
}

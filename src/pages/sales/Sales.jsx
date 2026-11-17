import { useMemo, useState } from 'react';
import { Eye, Printer, Undo2, Receipt as ReceiptIcon, Download } from 'lucide-react';
import { PageHeader, SearchInput, DataTable, Badge, statusColor, Modal, EmptyState, SelectInput, StatCard } from '../../components/common/ui';
import DateFilter, { useDateRange } from '../../components/common/DateFilter';
import Receipt, { printHtml } from '../../components/common/Receipt';
import { useStore } from '../../services/store';
import { useAuth, useToast } from '../../context/AppContext';
import { useScope } from '../../hooks/useScope';
import { saleService } from '../../services/saleService';
import { filterSales, summarize, saleNet, PRESETS } from '../../utils/analytics';
import { formatLKR, formatDateTime, downloadCSV } from '../../utils/format';

const presets = [...PRESETS.slice(0, 4), { id: 'all', label: 'All time' }, PRESETS[4]];

export default function Sales() {
  const sales = useStore('sales');
  const branches = useStore('branches');
  const { user, can } = useAuth();
  const toast = useToast();
  const scope = useScope();
  const dr = useDateRange('30d');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [method, setMethod] = useState('All');
  const [viewId, setViewId] = useState(null);
  const [ret, setRet] = useState(null); // { sale, qty:{}, reason }

  const rows = useMemo(() => filterSales(sales, dr.range, scope.branchId)
    .filter((s) => (status === 'All' || s.status === status) && (method === 'All' || s.paymentMethod === method)
      && (!q || [s.invoice, s.customerName, s.cashierName, ...s.items.map((i) => i.name)].some((x) => x.toLowerCase().includes(q.toLowerCase())))), [sales, dr.range, scope.branchId, status, method, q]);
  const sum = summarize(rows);
  const view = viewId && sales.find((s) => s.id === viewId);
  const bName = (id) => branches.find((b) => b.id === id)?.name;

  const openReturn = (sale) => setRet({ sale, qty: {}, reason: '' });
  const submitReturn = () => {
    try {
      const items = Object.entries(ret.qty).map(([productId, qty]) => ({ productId, qty: Number(qty) }));
      const amt = saleService.processReturn(ret.sale.id, items, ret.reason, user.name);
      toast.success(`Return processed. Refund of ${formatLKR(amt)} recorded (demo) and stock restored.`);
      setRet(null);
    } catch (e) { toast.error(e.message); }
  };
  const retSale = ret && sales.find((s) => s.id === ret.sale.id);
  const exportCsv = () => downloadCSV('sales.csv', rows.map((s) => ({ Invoice: s.invoice, Date: formatDateTime(s.date), Branch: bName(s.branchId), Customer: s.customerName, Items: s.items.reduce((n, i) => n + i.qty, 0), Total: s.total, Refunded: s.refunded, Payment: s.paymentMethod, Status: s.status }))) || toast.error('Nothing to export');

  return (
    <div>
      <PageHeader title="Sales" subtitle="All transactions, invoices, returns and refunds" actions={<><DateFilter state={dr} presets={presets} /><button className="btn-outline" onClick={exportCsv}><Download size={16} /> CSV</button></>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Transactions" value={sum.orders} icon={ReceiptIcon} tone="blue" />
        <StatCard label="Net revenue" value={formatLKR(sum.revenue, { decimals: 0 })} tone="green" />
        <StatCard label="Units sold" value={sum.units} tone="cyan" />
        <StatCard label="Avg. order" value={formatLKR(sum.avg, { decimals: 0 })} tone="navy" />
      </div>
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <SearchInput className="flex-1" value={q} onChange={setQ} placeholder="Search invoice, customer, cashier, product…" />
          <SelectInput value={status} onChange={(e) => setStatus(e.target.value)} className="sm:!w-44" aria-label="Status"><option>All</option><option>Completed</option><option>Partially Returned</option><option>Refunded</option></SelectInput>
          <SelectInput value={method} onChange={(e) => setMethod(e.target.value)} className="sm:!w-36" aria-label="Payment method"><option>All</option><option>Cash</option><option>Card</option></SelectInput>
        </div>
        <DataTable rows={rows} initialSort={{ key: 'date', dir: 'desc' }} onRowClick={(s) => setViewId(s.id)} empty={<EmptyState icon={ReceiptIcon} title="No transactions found" message="Try widening the date range or clearing filters." />} columns={[
          { key: 'invoice', label: 'Invoice', render: (s) => <span className="font-medium">{s.invoice}</span> },
          { key: 'date', label: 'Date', sortValue: (s) => new Date(s.date).getTime(), render: (s) => <span className="text-xs">{formatDateTime(s.date)}</span> },
          { key: 'customerName', label: 'Customer' },
          { key: 'items', label: 'Items', sortValue: (s) => s.items.reduce((n, i) => n + i.qty, 0), render: (s) => `${s.items.length} lines / ${s.items.reduce((n, i) => n + i.qty, 0)} qty` },
          { key: 'total', label: 'Total', render: (s) => <div><span className="font-semibold">{formatLKR(s.total)}</span>{s.refunded > 0 && <p className="text-xs text-red-600">-{formatLKR(s.refunded)} refunded</p>}</div> },
          { key: 'paymentMethod', label: 'Payment', render: (s) => <Badge color={s.paymentMethod === 'Cash' ? 'green' : 'blue'}>{s.paymentMethod}</Badge> },
          { key: 'status', label: 'Status', render: (s) => <Badge color={statusColor(s.status)}>{s.status}</Badge> },
          { key: 'a', label: '', noSort: true, render: (s) => <button className="btn-ghost btn-sm" aria-label="View sale" onClick={(e) => { e.stopPropagation(); setViewId(s.id); }}><Eye size={15} /></button> }]} />
      </div>

      <Modal open={!!view} onClose={() => setViewId(null)} title={view ? `Sale ${view.invoice}` : ''} size="lg"
        footer={view && <>{can('sale.return') && view.status !== 'Refunded' && <button className="btn-outline" onClick={() => { openReturn(view); setViewId(null); }}><Undo2 size={16} /> Process return</button>}<button className="btn-outline" onClick={() => setViewId(null)}>Close</button></>}>
        {view && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2"><Badge color={statusColor(view.status)}>{view.status}</Badge><Badge color="slate">{bName(view.branchId)}</Badge></div>
              <table className="w-full"><thead><tr><th className="th !px-0">Item</th><th className="th">Qty</th><th className="th">Returned</th><th className="th !px-0 text-right">Amount</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{view.items.map((i) => <tr key={i.productId}><td className="py-2">{i.name}</td><td className="px-4">{i.qty}</td><td className="px-4">{i.returned || 0}</td><td className="text-right">{formatLKR(i.qty * i.price)}</td></tr>)}</tbody></table>
              {view.returns?.length > 0 && <div><h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Refund history (demo)</h4>
                {view.returns.map((r) => <p key={r.id} className="rounded bg-red-50 p-2 text-xs text-red-700">{formatDateTime(r.date)} · {r.items.map((i) => `${i.name} ×${i.qty}`).join(', ')} · {formatLKR(r.amount)} · “{r.reason}” by {r.by}</p>)}</div>}
            </div>
            <Receipt sale={view} />
          </div>
        )}
      </Modal>

      <Modal open={!!ret} onClose={() => setRet(null)} title={retSale ? `Return items – ${retSale.invoice}` : ''}
        footer={<><button className="btn-outline" onClick={() => setRet(null)}>Cancel</button><button className="btn-danger" onClick={submitReturn}>Process return & refund</button></>}>
        {retSale && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Returned quantities are added back to inventory. Refunds are recorded for demo purposes only – no money is moved.</p>
            {retSale.items.map((i) => { const max = i.qty - (i.returned || 0); return (
              <div key={i.productId} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{i.name}</p><p className="text-xs text-slate-500">Sold {i.qty} · returnable {max}</p></div>
                <input type="number" min="0" max={max} disabled={!max} className="input !w-20 text-center" value={ret.qty[i.productId] ?? ''} placeholder="0" aria-label={`Return quantity for ${i.name}`}
                  onChange={(e) => setRet({ ...ret, qty: { ...ret.qty, [i.productId]: Math.max(0, Math.min(max, Number(e.target.value) || 0)) } })} />
              </div>); })}
            <SelectInput value={ret.reason} onChange={(e) => setRet({ ...ret, reason: e.target.value })} aria-label="Reason"><option value="">Select return reason…</option>{['Damaged product', 'Wrong item', 'Customer changed mind', 'Expired product', 'Other'].map((r) => <option key={r}>{r}</option>)}</SelectInput>
          </div>
        )}
      </Modal>
    </div>
  );
}

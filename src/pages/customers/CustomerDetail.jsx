import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { PageHeader, StatCard, DataTable, Badge, statusColor, EmptyState, Modal } from '../../components/common/ui';
import Receipt from '../../components/common/Receipt';
import { useStore } from '../../services/store';
import { saleNet } from '../../utils/analytics';
import { formatLKR, formatDate, formatDateTime } from '../../utils/format';
import { Wallet, ShoppingBag, CalendarClock } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const customers = useStore('customers');
  const sales = useStore('sales');
  const [view, setView] = useState(null);
  const c = customers.find((x) => x.id === id);
  if (!c) return <EmptyState title="Customer not found" action={<Link to="/app/customers" className="btn-primary">Back to customers</Link>} />;
  const history = sales.filter((s) => s.customerId === id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = history.reduce((n, s) => n + saleNet(s), 0);
  return (
    <div>
      <Link to="/app/customers" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy"><ArrowLeft size={14} /> Customers</Link>
      <PageHeader title={c.name} subtitle={c.business || 'Individual customer'} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card space-y-3 p-5 text-sm">
          <p className="flex items-center gap-3"><Phone size={16} className="text-slate-400" />{c.phone || '—'}</p>
          <p className="flex items-center gap-3"><Mail size={16} className="text-slate-400" />{c.email || '—'}</p>
          <p className="flex items-center gap-3"><MapPin size={16} className="text-slate-400" />{c.address || '—'}</p>
          <p className="flex items-center gap-3"><Building2 size={16} className="text-slate-400" />{c.business || '—'}</p>
          <p className="text-xs text-slate-400">Customer since {formatDate(c.createdAt)}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <StatCard label="Total spending" value={formatLKR(total, { decimals: 0 })} icon={Wallet} tone="green" />
          <StatCard label="Purchases" value={history.length} icon={ShoppingBag} tone="blue" />
          <StatCard label="Last purchase" value={history[0] ? formatDate(history[0].date) : '—'} icon={CalendarClock} tone="cyan" />
        </div>
      </div>
      <div className="card mt-4">
        <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold">Purchase history</h2>
        <DataTable rows={history} onRowClick={setView} initialSort={{ key: 'date', dir: 'desc' }} empty={<EmptyState title="No purchases yet" />} columns={[
          { key: 'invoice', label: 'Invoice' }, { key: 'date', label: 'Date', sortValue: (s) => new Date(s.date).getTime(), render: (s) => formatDateTime(s.date) },
          { key: 'items', label: 'Items', sortValue: (s) => s.items.length, render: (s) => s.items.map((i) => `${i.name} ×${i.qty}`).join(', ').slice(0, 60) },
          { key: 'total', label: 'Total', sortValue: saleNet, render: (s) => formatLKR(saleNet(s)) },
          { key: 'status', label: 'Status', render: (s) => <Badge color={statusColor(s.status)}>{s.status}</Badge> }]} />
      </div>
      <Modal open={!!view} onClose={() => setView(null)} title={view?.invoice} size="sm">{view && <Receipt sale={view} />}</Modal>
    </div>
  );
}

import { useState } from 'react';
import { AlertTriangle, PackageX, ShoppingBag, UserPlus, UserCog, BarChart3, Sparkles, Bell, Trash2, CheckCheck } from 'lucide-react';
import { PageHeader, EmptyState, ConfirmDialog } from '../../components/common/ui';
import { useStore } from '../../services/store';
import { useToast } from '../../context/AppContext';
import { notificationService } from '../../services/notificationService';
import { formatDateTime } from '../../utils/format';

const icons = { lowstock: [AlertTriangle, 'text-orange-600 bg-orange-50'], outofstock: [PackageX, 'text-red-600 bg-red-50'], sale: [ShoppingBag, 'text-green-600 bg-green-50'], customer: [UserPlus, 'text-brand bg-blue-50'], employee: [UserCog, 'text-brand bg-blue-50'], summary: [BarChart3, 'text-navy bg-slate-100'], insight: [Sparkles, 'text-accent bg-cyan-50'] };

export default function Notifications() {
  const list = useStore('notifications');
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(false);
  const shown = list.filter((n) => filter === 'all' || (filter === 'unread' ? !n.read : n.read));
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" subtitle={`${list.filter((n) => !n.read).length} unread`}
        actions={<><button className="btn-outline" onClick={() => { notificationService.markAllRead(); toast.success('All marked as read'); }}><CheckCheck size={16} /> Mark all read</button><button className="btn-outline text-red-600" onClick={() => setConfirm(true)} disabled={!list.length}><Trash2 size={16} /> Clear all</button></>} />
      <div className="mb-4 flex gap-2">{['all', 'unread', 'read'].map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${filter === f ? 'bg-navy text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{f}</button>)}</div>
      <div className="card divide-y divide-slate-100">
        {shown.length ? shown.map((n) => { const [Icon, cls] = icons[n.type] || [Bell, 'text-slate-500 bg-slate-100']; return (
          <div key={n.id} className={`flex items-start gap-3 p-4 ${n.read ? '' : 'bg-blue-50/40'}`}>
            <div className={`h-fit rounded-lg p-2 ${cls}`}><Icon size={18} /></div>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}{!n.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-brand" />}</p><p className="text-sm text-slate-600">{n.message}</p><p className="mt-0.5 text-xs text-slate-400">{formatDateTime(n.date)}</p></div>
            <div className="flex gap-1">{!n.read && <button className="btn-ghost btn-sm" onClick={() => notificationService.markRead(n.id)}>Mark read</button>}<button className="btn-ghost btn-sm text-red-600" aria-label="Delete notification" onClick={() => notificationService.remove(n.id)}><Trash2 size={14} /></button></div>
          </div>); }) : <EmptyState icon={Bell} title="No notifications" message="You're all caught up." />}
      </div>
      <ConfirmDialog open={confirm} title="Clear all notifications" message="This permanently removes every notification." confirmLabel="Clear all" onConfirm={() => { notificationService.clear(); setConfirm(false); toast.success('Notifications cleared'); }} onCancel={() => setConfirm(false)} />
    </div>
  );
}

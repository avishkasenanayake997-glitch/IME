import { useRef, useState } from 'react';
import { Upload, Cloud, CloudOff, HardDrive, Activity, Download, DatabaseBackup, RotateCcw, ShieldCheck } from 'lucide-react';
import { PageHeader, Tabs, Field, TextInput, SelectInput, Badge, DataTable, ConfirmDialog, StatCard } from '../../components/common/ui';
import { useStore, store } from '../../services/store';
import { useAuth, useToast } from '../../context/AppContext';
import { settingsService, backupService, authService } from '../../services/miscServices';
import { formatDateTime, downloadCSV, validators } from '../../utils/format';

const TABS = [['business', 'Business profile'], ['tax', 'Currency & tax'], ['receipt', 'Receipts'], ['preferences', 'Preferences'], ['notifications', 'Notifications'], ['security', 'Security'], ['cloud', 'Cloud & backup']].map(([id, label]) => ({ id, label }));

export default function Settings() {
  const s = useStore('settings');
  const { can, user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('business');
  const write = can('settings.write');
  return (
    <div>
      <PageHeader title="Settings" subtitle="Business configuration, preferences and system monitoring" />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'business' && <Business s={s} toast={toast} write={write} />}
      {tab === 'tax' && <TaxCurrency s={s} toast={toast} write={write} />}
      {tab === 'receipt' && <ReceiptSettings s={s} toast={toast} write={write} />}
      {tab === 'preferences' && <Preferences s={s} toast={toast} />}
      {tab === 'notifications' && <NotifSettings s={s} toast={toast} />}
      {tab === 'security' && <Security user={user} toast={toast} />}
      {tab === 'cloud' && <CloudBackup toast={toast} canRun={can('backup.run')} />}
    </div>
  );
}

function Panel({ title, children, onSave, disabled, saveLabel = 'Save changes' }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave?.(); }} className="card max-w-3xl space-y-4 p-5" noValidate>
      <h2 className="font-semibold">{title}</h2>{children}
      {onSave && <button className="btn-primary" disabled={disabled}>{saveLabel}</button>}
      {disabled && <p className="text-xs text-slate-400">You do not have permission to change these settings.</p>}
    </form>
  );
}

function Business({ s, toast, write }) {
  const [f, setF] = useState(s.business); const [er, setEr] = useState({}); const file = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const logo = (e) => { const x = e.target.files?.[0]; if (!x) return; if (!x.type.startsWith('image/') || x.size > 300 * 1024) return toast.error('Choose an image under 300 KB'); const r = new FileReader(); r.onload = () => setF((p) => ({ ...p, logo: r.result })); r.readAsDataURL(x); };
  const save = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Business name is required';
    if (!validators.email(f.email)) e.email = 'Enter a valid email';
    if (!validators.phone(f.phone)) e.phone = 'Enter a valid phone number';
    if (!f.address.trim()) e.address = 'Address is required';
    setEr(e); if (Object.keys(e).length) return toast.error('Please fix the highlighted fields');
    settingsService.updateSection('business', f); toast.success('Business profile saved');
  };
  return (
    <Panel title="Business profile" onSave={write ? save : undefined} disabled={!write}>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">{f.logo ? <img src={f.logo} alt="Logo" className="h-full w-full object-cover" /> : <span className="text-xs text-slate-400">No logo</span>}</div>
        <div><button type="button" className="btn-outline" disabled={!write} onClick={() => file.current.click()}><Upload size={14} /> Upload logo</button><input ref={file} type="file" accept="image/*" hidden onChange={logo} />{f.logo && write && <button type="button" className="ml-3 text-xs text-red-600" onClick={() => setF({ ...f, logo: '' })}>Remove</button>}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name" required error={er.name}><TextInput value={f.name} onChange={set('name')} error={er.name} disabled={!write} /></Field>
        <Field label="Business type"><TextInput value={f.businessType} onChange={set('businessType')} disabled={!write} /></Field>
        <Field label="Email" required error={er.email}><TextInput value={f.email} onChange={set('email')} error={er.email} disabled={!write} /></Field>
        <Field label="Phone" required error={er.phone}><TextInput value={f.phone} onChange={set('phone')} error={er.phone} disabled={!write} /></Field>
        <Field label="Website"><TextInput value={f.website} onChange={set('website')} disabled={!write} /></Field>
        <Field label="Registration no."><TextInput value={f.regNo} onChange={set('regNo')} disabled={!write} /></Field>
        <div className="sm:col-span-2"><Field label="Address" required error={er.address}><TextInput value={f.address} onChange={set('address')} error={er.address} disabled={!write} /></Field></div>
      </div>
    </Panel>
  );
}

function TaxCurrency({ s, toast, write }) {
  const [c, setC] = useState(s.currency); const [t, setT] = useState(s.tax);
  const save = () => {
    const r = Number(t.rate);
    if (isNaN(r) || r < 0 || r > 100) return toast.error('Tax rate must be between 0 and 100');
    if (!t.name.trim()) return toast.error('Tax name is required');
    settingsService.updateSection('currency', c); settingsService.updateSection('tax', { ...t, rate: r }); toast.success('Currency & tax settings saved');
  };
  return (
    <Panel title="Currency & tax" onSave={write ? save : undefined} disabled={!write}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Currency" hint="Sri Lankan Rupee is the default currency"><SelectInput value={c.code} onChange={(e) => setC({ ...c, code: e.target.value })} disabled={!write}><option value="LKR">LKR – Sri Lankan Rupee</option></SelectInput></Field>
        <Field label="Decimal places"><SelectInput value={c.decimals} onChange={(e) => setC({ ...c, decimals: Number(e.target.value) })} disabled={!write}><option value={2}>2</option><option value={0}>0</option></SelectInput></Field>
        <Field label="Tax name"><TextInput value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} disabled={!write} /></Field>
        <Field label="Tax rate (%)"><TextInput type="number" min="0" max="100" value={t.rate} onChange={(e) => setT({ ...t, rate: e.target.value })} disabled={!write} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={t.enabled} onChange={(e) => setT({ ...t, enabled: e.target.checked })} disabled={!write} /> Apply tax to POS sales</label>
    </Panel>
  );
}

function ReceiptSettings({ s, toast, write }) {
  const [r, setR] = useState(s.receipt);
  return (
    <Panel title="Receipt settings" onSave={write ? () => { settingsService.updateSection('receipt', r); toast.success('Receipt settings saved'); } : undefined} disabled={!write}>
      <Field label="Header message"><TextInput value={r.header} onChange={(e) => setR({ ...r, header: e.target.value })} disabled={!write} /></Field>
      <Field label="Footer message"><TextInput value={r.footer} onChange={(e) => setR({ ...r, footer: e.target.value })} disabled={!write} /></Field>
      <Field label="Paper size"><SelectInput value={r.paper} onChange={(e) => setR({ ...r, paper: e.target.value })} disabled={!write}><option>80mm</option><option>58mm</option><option>A4</option></SelectInput></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={r.showLogo} onChange={(e) => setR({ ...r, showLogo: e.target.checked })} disabled={!write} /> Show logo on receipt</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={r.showTax} onChange={(e) => setR({ ...r, showTax: e.target.checked })} disabled={!write} /> Show tax line</label>
    </Panel>
  );
}

function Preferences({ s, toast }) {
  const [p, setP] = useState(s.preferences);
  return (
    <Panel title="User preferences" onSave={() => { const n = Number(p.lowStockDefault); if (!(n >= 0)) return toast.error('Enter a valid number'); settingsService.updateSection('preferences', { ...p, lowStockDefault: n }); toast.success('Preferences saved'); }}>
      <Field label="Default minimum stock level for new products"><TextInput type="number" min="0" value={p.lowStockDefault} onChange={(e) => setP({ ...p, lowStockDefault: e.target.value })} /></Field>
      <Field label="Table rows per page"><SelectInput value={p.rowsPerPage} onChange={(e) => setP({ ...p, rowsPerPage: Number(e.target.value) })}><option>10</option><option>20</option><option>50</option></SelectInput></Field>
    </Panel>
  );
}

function NotifSettings({ s, toast }) {
  const [n, setN] = useState(s.notifications);
  const labels = { lowStock: 'Low stock & out-of-stock alerts', newSale: 'New sale completed', newCustomer: 'New customer added', employee: 'Employee account created', summary: 'Monthly sales summary', insights: 'Business insights available' };
  return (
    <Panel title="Notification settings" onSave={() => { settingsService.updateSection('notifications', n); toast.success('Notification settings saved'); }}>
      {Object.entries(labels).map(([k, l]) => <label key={k} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">{l}<input type="checkbox" checked={n[k]} onChange={(e) => setN({ ...n, [k]: e.target.checked })} /></label>)}
    </Panel>
  );
}

function Security({ user, toast }) {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const submit = () => {
    if (pw.next !== pw.confirm) return toast.error('New passwords do not match');
    try { authService.changePassword(user.id, pw.current, pw.next); toast.success('Password changed'); setPw({ current: '', next: '', confirm: '' }); } catch (e) { toast.error(e.message); }
  };
  return (
    <div className="space-y-4">
      <Panel title="Change password" onSave={submit} saveLabel="Update password">
        <Field label="Current password"><TextInput type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></Field>
        <Field label="New password"><TextInput type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></Field>
        <Field label="Confirm new password"><TextInput type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" /></Field>
      </Panel>
      <div className="card max-w-3xl p-5 text-sm text-slate-600"><h3 className="mb-2 flex items-center gap-2 font-semibold text-navy"><ShieldCheck size={16} /> Security notes (demo)</h3>
        <ul className="list-disc space-y-1 pl-5"><li>Demo passwords are stored in this browser's localStorage in plain text. A production backend must hash passwords and issue secure tokens.</li><li>Two-factor authentication is not available in this demo.</li><li>Role-based access is enforced in the UI; a real backend must enforce it server-side as well.</li></ul></div>
    </div>
  );
}

function CloudBackup({ toast, canRun }) {
  const backups = useStore('backups');
  const [busy, setBusy] = useState(false);
  const [reset, setReset] = useState(false);
  const bytes = store.sizeBytes();
  const quota = 5 * 1024 * 1024;
  const pct = Math.min(100, Math.round((bytes / quota) * 100));
  const run = () => { setBusy(true); setTimeout(() => { const b = backupService.run(); setBusy(false); toast.success(`Simulated backup completed (${b.size}). Stored locally only.`); }, 1200); };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexus-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href); toast.success('Full data export downloaded');
  };
  const csv = (name, rows) => (downloadCSV(`${name}.csv`, rows) ? toast.success(`${name}.csv exported`) : toast.error('Nothing to export'));
  const flat = (rows, fn) => rows.map(fn);
  const health = [['Application', 'Operational'], ['Local data store', 'Operational'], ['Cloud sync', 'Not configured'], ['API server', 'Not connected']];
  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900"><CloudOff size={18} className="mt-0.5 shrink-0" /><p><b>Demo mode.</b> No cloud service or backend is connected. Backups below are simulated snapshots and all data stays in this browser. Real cloud backups require the future Node.js/PostgreSQL integration.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cloud connection" value="Offline (demo)" icon={Cloud} tone="orange" />
        <StatCard label="Last backup (simulated)" value={backups[0] ? formatDateTime(backups[0].date) : 'Never'} icon={DatabaseBackup} tone="blue" />
        <StatCard label="Local storage used" value={`${(bytes / 1048576).toFixed(2)} MB`} icon={HardDrive} tone="cyan" hint={`${pct}% of ~5 MB browser quota`} />
        <StatCard label="System health" value="Demo – OK" icon={Activity} tone="green" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5"><h3 className="mb-3 text-sm font-semibold">System health (demo)</h3>
          <ul className="space-y-2">{health.map(([k, v]) => <li key={k} className="flex items-center justify-between text-sm"><span>{k}</span><Badge color={v === 'Operational' ? 'green' : 'orange'}>{v}</Badge></li>)}</ul>
          <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-slate-500"><span>Storage usage</span><span>{pct}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(pct, 2)}%` }} /></div></div></div>
        <div className="card p-5 lg:col-span-2"><h3 className="mb-3 text-sm font-semibold">Data export</h3>
          <div className="flex flex-wrap gap-2">
            <button className="btn-outline" onClick={exportJson}><Download size={14} /> Full data (JSON)</button>
            <button className="btn-outline" onClick={() => csv('products', flat(store.get('products'), (p) => ({ Name: p.name, SKU: p.sku, Category: p.category, Cost: p.cost, Price: p.price, Stock: p.stock, Min: p.minStock, Supplier: p.supplier })))}><Download size={14} /> Products CSV</button>
            <button className="btn-outline" onClick={() => csv('customers', flat(store.get('customers'), (c) => ({ Name: c.name, Phone: c.phone, Email: c.email, Business: c.business, Address: c.address })))}><Download size={14} /> Customers CSV</button>
            <button className="btn-outline" onClick={() => csv('sales', flat(store.get('sales'), (x) => ({ Invoice: x.invoice, Date: x.date, Customer: x.customerName, Total: x.total, Payment: x.paymentMethod, Status: x.status })))}><Download size={14} /> Sales CSV</button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {canRun && <button className="btn-primary" onClick={run} disabled={busy}><DatabaseBackup size={16} /> {busy ? 'Running simulated backup…' : 'Run manual backup (simulated)'}</button>}
            {canRun && <button className="btn-outline text-red-600" onClick={() => setReset(true)}><RotateCcw size={14} /> Reset demo data</button>}
          </div></div>
      </div>
      <div className="card"><h3 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold">Backup history</h3>
        <DataTable rows={backups} initialSort={{ key: 'date', dir: 'desc' }} columns={[{ key: 'date', label: 'Date', sortValue: (b) => new Date(b.date).getTime(), render: (b) => formatDateTime(b.date) }, { key: 'type', label: 'Type' }, { key: 'size', label: 'Size' }, { key: 'status', label: 'Status', render: (b) => <Badge color="green">{b.status}</Badge> }]} /></div>
      <ConfirmDialog open={reset} title="Reset demo data" message="This restores the original demo dataset and signs you out. All changes you made will be lost." confirmLabel="Reset" onConfirm={() => { store.resetDemoData(); window.location.href = '/login'; }} onCancel={() => setReset(false)} />
    </div>
  );
}

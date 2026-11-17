import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, Phone, User, GitBranch } from 'lucide-react';
import { PageHeader, Badge, statusColor, Modal, ConfirmDialog, Field, TextInput, SelectInput, EmptyState, DataTable } from '../../components/common/ui';
import DateFilter, { useDateRange } from '../../components/common/DateFilter';
import { ChartBox, Bars } from '../../components/charts/Charts';
import { useStore } from '../../services/store';
import { useAuth, useBranch, useToast } from '../../context/AppContext';
import { branchService } from '../../services/miscServices';
import { filterSales, summarize, stockStatus } from '../../utils/analytics';
import { formatLKR, validators } from '../../utils/format';

const blank = { name: '', address: '', manager: '', phone: '', email: '', status: 'Active' };

export default function Branches() {
  const branches = useStore('branches');
  const sales = useStore('sales');
  const products = useStore('products');
  const { can } = useAuth();
  const { branchId, setBranchId } = useBranch();
  const toast = useToast();
  const dr = useDateRange('30d');
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [del, setDel] = useState(null);

  const stats = useMemo(() => branches.map((b) => {
    const s = summarize(filterSales(sales, dr.range, b.id));
    const ps = products.filter((p) => p.branchId === b.id);
    return { ...b, ...s, products: ps.length, stockValue: ps.reduce((n, p) => n + p.stock * p.cost, 0), low: ps.filter((p) => stockStatus(p) !== 'In Stock').length, units: ps.reduce((n, p) => n + p.stock, 0) };
  }), [branches, sales, products, dr.range]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'Branch name is required';
    else if (branches.some((b) => b.id !== form.id && b.name.toLowerCase() === form.name.trim().toLowerCase())) er.name = 'Branch name already exists';
    if (!form.address.trim()) er.address = 'Address is required';
    if (!form.manager.trim()) er.manager = 'Manager is required';
    if (!validators.phone(form.phone)) er.phone = 'Enter a valid contact number';
    if (form.email && !validators.email(form.email)) er.email = 'Enter a valid email';
    setErrors(er);
    if (Object.keys(er).length) return;
    if (form.id) { branchService.update(form.id, form); toast.success('Branch updated'); } else { branchService.create(form); toast.success('Branch added'); }
    setForm(null);
  };
  const doDel = () => { try { branchService.remove(del.id); if (branchId === del.id) setBranchId('all'); toast.success('Branch deleted'); } catch (e) { toast.error(e.message); } setDel(null); };
  const canWrite = can('branch.write');

  return (
    <div>
      <PageHeader title="Branch Management" subtitle="Compare performance and inventory across outlets"
        actions={<><DateFilter state={dr} />{canWrite && <button className="btn-primary" onClick={() => { setForm(blank); setErrors({}); }}><Plus size={16} /> Add branch</button>}</>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((b) => (
          <div key={b.id} className={`card p-5 ${branchId === b.id ? 'ring-2 ring-brand' : ''}`}>
            <div className="flex items-start justify-between gap-2"><h3 className="flex items-center gap-2 font-semibold"><GitBranch size={16} className="text-brand" />{b.name}</h3><Badge color={statusColor(b.status)}>{b.status}</Badge></div>
            <div className="mt-3 space-y-1.5 text-sm text-slate-600">
              <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" />{b.address}</p>
              <p className="flex items-center gap-2"><User size={14} className="text-slate-400" />{b.manager}</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400" />{b.phone}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
              <div><p className="text-[11px] text-slate-500">Revenue</p><p className="text-sm font-bold">{formatLKR(b.revenue, { decimals: 0 })}</p></div>
              <div><p className="text-[11px] text-slate-500">Orders</p><p className="text-sm font-bold">{b.orders}</p></div>
              <div><p className="text-[11px] text-slate-500">Low stock</p><p className={`text-sm font-bold ${b.low ? 'text-orange-600' : ''}`}>{b.low}</p></div>
            </div>
            <p className="mt-2 text-xs text-slate-500">{b.products} products · {b.units.toLocaleString()} units · stock value {formatLKR(b.stockValue, { decimals: 0 })}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={branchId === b.id ? 'btn-primary btn-sm' : 'btn-outline btn-sm'} onClick={() => { setBranchId(branchId === b.id ? 'all' : b.id); toast.info(branchId === b.id ? 'Showing all branches' : `Dashboard filtered to ${b.name}`); }}>{branchId === b.id ? 'Selected ✓' : 'Select branch'}</button>
              {canWrite && <><button className="btn-ghost btn-sm" onClick={() => { setForm(b); setErrors({}); }}><Pencil size={14} /> Edit</button><button className="btn-ghost btn-sm text-red-600" onClick={() => setDel(b)}><Trash2 size={14} /> Delete</button></>}
            </div>
          </div>
        ))}
      </div>
      {!stats.length && <div className="card"><EmptyState title="No branches" /></div>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartBox title="Branch performance comparison" subtitle="Revenue & estimated profit"><Bars data={stats.map((s) => ({ label: s.name.replace(' Branch', ''), revenue: s.revenue, profit: s.profit }))} series={[{ key: 'revenue', name: 'Revenue', money: true }, { key: 'profit', name: 'Profit', money: true, color: '#06B6D4' }]} /></ChartBox>
        <ChartBox title="Branch inventory overview" subtitle="Stock value at cost"><Bars data={stats.map((s) => ({ label: s.name.replace(' Branch', ''), stockValue: Math.round(s.stockValue) }))} series={[{ key: 'stockValue', name: 'Stock value', money: true, color: '#14213D' }]} /></ChartBox>
      </div>
      <div className="card mt-4"><h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold">Comparison table</h2>
        <DataTable rows={stats} columns={[{ key: 'name', label: 'Branch' }, { key: 'orders', label: 'Orders' }, { key: 'revenue', label: 'Revenue', render: (r) => formatLKR(r.revenue, { decimals: 0 }) }, { key: 'profit', label: 'Est. profit', render: (r) => formatLKR(r.profit, { decimals: 0 }) }, { key: 'avg', label: 'Avg. order', render: (r) => formatLKR(r.avg, { decimals: 0 }) }, { key: 'products', label: 'Products' }, { key: 'low', label: 'Low stock' }]} /></div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit branch' : 'Add branch'} footer={<><button className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" type="submit" form="branch-form">Save</button></>}>
        {form && (
          <form id="branch-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Field label="Branch name" required error={errors.name}><TextInput value={form.name} onChange={set('name')} error={errors.name} /></Field>
            <Field label="Branch manager" required error={errors.manager}><TextInput value={form.manager} onChange={set('manager')} error={errors.manager} /></Field>
            <div className="sm:col-span-2"><Field label="Address" required error={errors.address}><TextInput value={form.address} onChange={set('address')} error={errors.address} /></Field></div>
            <Field label="Contact number" required error={errors.phone}><TextInput value={form.phone} onChange={set('phone')} error={errors.phone} /></Field>
            <Field label="Email" error={errors.email}><TextInput value={form.email} onChange={set('email')} error={errors.email} /></Field>
            <Field label="Status"><SelectInput value={form.status} onChange={set('status')}><option>Active</option><option>Inactive</option></SelectInput></Field>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>
      <ConfirmDialog open={!!del} title="Delete branch" message={`Delete ${del?.name}? Branches with products or sales cannot be deleted.`} confirmLabel="Delete" onConfirm={doDel} onCancel={() => setDel(null)} />
    </div>
  );
}

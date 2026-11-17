import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Users } from 'lucide-react';
import { PageHeader, SearchInput, DataTable, Modal, ConfirmDialog, EmptyState, SelectInput } from '../../components/common/ui';
import CustomerForm from '../../components/forms/CustomerForm';
import { useStore } from '../../services/store';
import { useAuth, useToast } from '../../context/AppContext';
import { customerService } from '../../services/customerService';
import { saleNet } from '../../utils/analytics';
import { formatLKR, formatDate } from '../../utils/format';

export default function Customers() {
  const customers = useStore('customers');
  const sales = useStore('sales');
  const { can } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);

  const rows = useMemo(() => {
    const stats = {};
    sales.forEach((s) => { const x = stats[s.customerId] || { orders: 0, total: 0 }; x.orders++; x.total += saleNet(s); stats[s.customerId] = x; });
    return customers.filter((c) => c.id !== 'c0')
      .map((c) => ({ ...c, orders: stats[c.id]?.orders || 0, total: stats[c.id]?.total || 0 }))
      .filter((c) => (type === 'All' || (type === 'Business' ? !!c.business : !c.business))
        && (!q || [c.name, c.phone, c.email, c.business].some((x) => (x || '').toLowerCase().includes(q.toLowerCase()))));
  }, [customers, sales, q, type]);

  const save = (data) => {
    if (form.id) { customerService.update(form.id, data); toast.success('Customer updated'); } else { customerService.create(data); toast.success('Customer added'); }
    setForm(null);
  };
  const doDel = () => { try { customerService.remove(del.id); toast.success('Customer deleted'); } catch (e) { toast.error(e.message); } setDel(null); };

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${rows.length} customers`} actions={can('customer.write') && <button className="btn-primary" onClick={() => setForm({})}><Plus size={16} /> Add customer</button>} />
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <SearchInput className="flex-1" value={q} onChange={setQ} placeholder="Search name, phone, email, business…" />
          <SelectInput value={type} onChange={(e) => setType(e.target.value)} className="sm:!w-44" aria-label="Customer type"><option>All</option><option>Business</option><option>Individual</option></SelectInput>
        </div>
        <DataTable rows={rows} onRowClick={(c) => nav(`/app/customers/${c.id}`)} empty={<EmptyState icon={Users} title="No customers found" message="Add a customer or adjust your search." />} columns={[
          { key: 'name', label: 'Customer', render: (c) => <div><p className="font-medium">{c.name}</p>{c.business && <p className="text-xs text-slate-500">{c.business}</p>}</div> },
          { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email', render: (c) => c.email || '—' },
          { key: 'orders', label: 'Orders' },
          { key: 'total', label: 'Total spent', render: (c) => <span className="font-semibold">{formatLKR(c.total, { decimals: 0 })}</span> },
          { key: 'createdAt', label: 'Since', render: (c) => formatDate(c.createdAt) },
          { key: 'a', label: '', noSort: true, render: (c) => (
            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <button className="btn-ghost btn-sm" aria-label="View" onClick={() => nav(`/app/customers/${c.id}`)}><Eye size={15} /></button>
              {can('customer.write') && <button className="btn-ghost btn-sm" aria-label="Edit" onClick={() => setForm(c)}><Pencil size={15} /></button>}
              {can('customer.delete') && <button className="btn-ghost btn-sm text-red-600" aria-label="Delete" onClick={() => setDel(c)}><Trash2 size={15} /></button>}
            </div>) }]} />
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit customer' : 'Add customer'} footer={<><button className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" type="submit" form="customer-form">Save</button></>}>
        {form && <CustomerForm initial={form} onSave={save} />}
      </Modal>
      <ConfirmDialog open={!!del} title="Delete customer" message={`Delete ${del?.name}? Their past sales remain in sales records.`} confirmLabel="Delete" onConfirm={doDel} onCancel={() => setDel(null)} />
    </div>
  );
}

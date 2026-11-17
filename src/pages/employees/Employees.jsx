import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, UserCog, ShieldCheck } from 'lucide-react';
import { PageHeader, SearchInput, DataTable, Badge, statusColor, Modal, ConfirmDialog, Field, TextInput, SelectInput, EmptyState } from '../../components/common/ui';
import { useStore } from '../../services/store';
import { useAuth, useToast } from '../../context/AppContext';
import { employeeService, validateEmployee } from '../../services/employeeService';
import { ROLES, assignableRoles, MODULE_ACCESS } from '../../utils/permissions';

const blank = { name: '', email: '', phone: '', position: '', role: 'staff', status: 'Active', branchId: 'b1', password: '' };

export default function Employees() {
  const employees = useStore('employees');
  const branches = useStore('branches');
  const { user } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('All');
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [del, setDel] = useState(null);
  const [matrix, setMatrix] = useState(false);

  const rows = useMemo(() => employees.filter((e) => (role === 'All' || e.role === role) && (!q || [e.name, e.email, e.position, e.phone].some((x) => x.toLowerCase().includes(q.toLowerCase())))), [employees, q, role]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isNew = !form?.id;

  const save = (e) => {
    e.preventDefault();
    const er = validateEmployee(form, employees, isNew);
    setErrors(er);
    if (Object.keys(er).length) return toast.error('Please fix the highlighted fields');
    if (form.id === user.id && form.status === 'Inactive') return toast.error('You cannot deactivate your own account');
    if (isNew) { employeeService.create(form); toast.success('Employee account created'); } else { employeeService.update(form.id, form); toast.success('Employee updated'); }
    setForm(null);
  };
  const doDel = () => {
    if (del.id === user.id) { toast.error('You cannot delete your own account'); return setDel(null); }
    try { employeeService.remove(del.id); toast.success('Employee deleted'); } catch (e) { toast.error(e.message); }
    setDel(null);
  };
  const manageable = (e) => user.role === 'superadmin' || e.role !== 'superadmin';

  return (
    <div>
      <PageHeader title="Employees & Roles" subtitle={`${employees.filter((e) => e.status === 'Active').length} active accounts`}
        actions={<><button className="btn-outline" onClick={() => setMatrix(true)}><ShieldCheck size={16} /> Role permissions</button><button className="btn-primary" onClick={() => { setForm({ ...blank, branchId: user.branchId }); setErrors({}); }}><Plus size={16} /> Add employee</button></>} />
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <SearchInput className="flex-1" value={q} onChange={setQ} placeholder="Search name, email, position…" />
          <SelectInput value={role} onChange={(e) => setRole(e.target.value)} className="sm:!w-48" aria-label="Role"><option value="All">All roles</option>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</SelectInput>
        </div>
        <DataTable rows={rows} empty={<EmptyState icon={UserCog} title="No employees found" />} columns={[
          { key: 'name', label: 'Employee', render: (e) => <div><p className="font-medium">{e.name}</p><p className="text-xs text-slate-500">{e.email}</p></div> },
          { key: 'phone', label: 'Phone' }, { key: 'position', label: 'Position' },
          { key: 'role', label: 'Role', sortValue: (e) => ROLES[e.role], render: (e) => <Badge color={e.role === 'superadmin' ? 'red' : e.role === 'owner' ? 'blue' : 'slate'}>{ROLES[e.role]}</Badge> },
          { key: 'branchId', label: 'Branch', sortValue: (e) => branches.find((b) => b.id === e.branchId)?.name, render: (e) => <span className="text-xs">{branches.find((b) => b.id === e.branchId)?.name}</span> },
          { key: 'status', label: 'Status', render: (e) => <Badge color={statusColor(e.status)}>{e.status}</Badge> },
          { key: 'a', label: '', noSort: true, render: (e) => manageable(e) && (
            <div className="flex justify-end gap-1">
              <button className="btn-ghost btn-sm" aria-label="Edit" onClick={() => { setForm({ ...e, password: '' }); setErrors({}); }}><Pencil size={15} /></button>
              <button className="btn-ghost btn-sm text-red-600" aria-label="Delete" onClick={() => setDel(e)}><Trash2 size={15} /></button>
            </div>) }]} />
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} size="lg" title={isNew ? 'Add employee' : 'Edit employee'} footer={<><button className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" type="submit" form="emp-form">{isNew ? 'Create account' : 'Save changes'}</button></>}>
        {form && (
          <form id="emp-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Field label="Full name" required error={errors.name}><TextInput value={form.name} onChange={set('name')} error={errors.name} /></Field>
            <Field label="Email (login)" required error={errors.email}><TextInput type="email" value={form.email} onChange={set('email')} error={errors.email} /></Field>
            <Field label="Phone" required error={errors.phone}><TextInput value={form.phone} onChange={set('phone')} error={errors.phone} /></Field>
            <Field label="Position" required error={errors.position}><TextInput value={form.position} onChange={set('position')} error={errors.position} /></Field>
            <Field label="Assigned role" required error={errors.role}><SelectInput value={form.role} onChange={set('role')}>{assignableRoles(user.role).map((r) => <option key={r} value={r}>{ROLES[r]}</option>)}</SelectInput></Field>
            <Field label="Branch"><SelectInput value={form.branchId} onChange={set('branchId')}>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</SelectInput></Field>
            <Field label="Account status"><SelectInput value={form.status} onChange={set('status')}><option>Active</option><option>Inactive</option></SelectInput></Field>
            <Field label={isNew ? 'Password' : 'New password'} required={isNew} error={errors.password} hint={isNew ? undefined : 'Leave blank to keep current'}><TextInput type="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" /></Field>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>
      <ConfirmDialog open={!!del} title="Delete employee" message={`Delete the account for ${del?.name}? They will no longer be able to sign in.`} confirmLabel="Delete" onConfirm={doDel} onCancel={() => setDel(null)} />

      <Modal open={matrix} onClose={() => setMatrix(false)} size="lg" title="Role permissions" footer={<button className="btn-outline" onClick={() => setMatrix(false)}>Close</button>}>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="th">Module</th>{Object.values(ROLES).map((r) => <th key={r} className="th text-center">{r}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{Object.entries(MODULE_ACCESS).map(([m, rs]) => <tr key={m}><td className="td font-medium capitalize">{m}</td>{Object.keys(ROLES).map((r) => <td key={r} className="td text-center">{rs.includes(r) ? <span className="text-green-600">✓</span> : <span className="text-slate-300">—</span>}</td>)}</tr>)}</tbody></table></div>
        <p className="mt-3 text-xs text-slate-500">Managers and Staff can view inventory; only Super Admin, Owner and Manager can add, edit or delete products. Managers/Cashiers/Staff only see data for their own branch.</p>
      </Modal>
    </div>
  );
}

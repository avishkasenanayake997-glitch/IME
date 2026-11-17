import { useState } from 'react';
import { useAuth, useToast } from '../../context/AppContext';
import { PageHeader, Field, TextInput, Badge } from '../../components/common/ui';
import { employeeService } from '../../services/employeeService';
import { authService } from '../../services/miscServices';
import { ROLES } from '../../utils/permissions';
import { validators } from '../../utils/format';
import { useStore } from '../../services/store';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const branches = useStore('branches');
  const [f, setF] = useState({ name: user.name, phone: user.phone });
  const [errors, setErrors] = useState({});
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Name is required';
    if (!validators.phone(f.phone)) er.phone = 'Enter a valid phone number';
    setErrors(er);
    if (Object.keys(er).length) return;
    employeeService.update(user.id, { name: f.name.trim(), phone: f.phone });
    toast.success('Profile updated');
  };
  const changePw = (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) return toast.error('New passwords do not match');
    try { authService.changePassword(user.id, pw.current, pw.next); toast.success('Password changed'); setPw({ current: '', next: '', confirm: '' }); }
    catch (err) { toast.error(err.message); }
  };
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Profile" subtitle="Manage your personal details and password." />
      <div className="card mb-6 flex items-center gap-4 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">{user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
        <div><p className="font-semibold">{user.name}</p><p className="text-sm text-slate-500">{user.email} · {user.position}</p>
          <div className="mt-1 flex gap-2"><Badge color="blue">{ROLES[user.role]}</Badge><Badge color="slate">{branches.find((b) => b.id === user.branchId)?.name}</Badge></div></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={save} className="card space-y-4 p-5" noValidate>
          <h2 className="font-semibold">Personal details</h2>
          <Field label="Full name" error={errors.name}><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} /></Field>
          <Field label="Email"><TextInput value={user.email} disabled /></Field>
          <Field label="Phone" error={errors.phone}><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} error={errors.phone} /></Field>
          <button className="btn-primary">Save changes</button>
        </form>
        <form onSubmit={changePw} className="card space-y-4 p-5">
          <h2 className="font-semibold">Change password</h2>
          <Field label="Current password"><TextInput type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
          <Field label="New password"><TextInput type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
          <Field label="Confirm new password"><TextInput type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
          <button className="btn-navy">Update password</button>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Field, TextInput } from '../common/ui';
import { validateCustomer } from '../../services/customerService';

export default function CustomerForm({ initial, onSave, onCancel, id = 'customer-form' }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', business: '', ...initial });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const er = validateCustomer(f);
    setErrors(er);
    if (!Object.keys(er).length) onSave({ ...f, name: f.name.trim() });
  };
  return (
    <form id={id} onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Customer name" required error={errors.name}><TextInput value={f.name} onChange={set('name')} error={errors.name} autoFocus /></Field>
      <Field label="Phone number" required error={errors.phone}><TextInput value={f.phone} onChange={set('phone')} error={errors.phone} placeholder="07X XXX XXXX" /></Field>
      <Field label="Email" error={errors.email}><TextInput type="email" value={f.email} onChange={set('email')} error={errors.email} /></Field>
      <Field label="Business name"><TextInput value={f.business} onChange={set('business')} /></Field>
      <div className="sm:col-span-2"><Field label="Address"><TextInput value={f.address} onChange={set('address')} /></Field></div>
      <button type="submit" className="hidden" />
    </form>
  );
}

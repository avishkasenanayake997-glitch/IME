import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Field, TextInput, SelectInput } from '../common/ui';
import { requestService } from '../../services/miscServices';
import { useToast } from '../../context/AppContext';
import { plans } from '../../data/plans';

const empty = { name: '', email: '', phone: '', business: '', plan: 'business', message: '' };

export default function DemoRequestForm({ defaultPlan }) {
  const [f, setF] = useState({ ...empty, plan: defaultPlan || 'business' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    try { requestService.submitDemo(f); setDone(true); setErrors({}); toast.success('Demo request submitted'); }
    catch (err) { setErrors(err.fields || {}); toast.error(err.message); }
  };
  if (done) return (
    <div className="py-8 text-center">
      <CheckCircle2 className="mx-auto text-green-600" size={40} />
      <h3 className="mt-3 text-lg font-semibold">Thank you, {f.name.split(' ')[0]}!</h3>
      <p className="mt-1 text-sm text-slate-500">Your demo request has been recorded. Our team would contact you at {f.email}. (Demo: no payment was taken and no email was sent.)</p>
      <button className="btn-outline mt-4" onClick={() => { setF({ ...empty, plan: f.plan }); setDone(false); }}>Submit another</button>
    </div>
  );
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name}><TextInput value={f.name} onChange={set('name')} error={errors.name} /></Field>
        <Field label="Business name" required error={errors.business}><TextInput value={f.business} onChange={set('business')} error={errors.business} /></Field>
        <Field label="Email" required error={errors.email}><TextInput type="email" value={f.email} onChange={set('email')} error={errors.email} /></Field>
        <Field label="Phone" required error={errors.phone}><TextInput value={f.phone} onChange={set('phone')} error={errors.phone} /></Field>
      </div>
      <Field label="Interested plan">
        <SelectInput value={f.plan} onChange={set('plan')}>{plans.map((p) => <option key={p.id} value={p.id}>{p.name} – LKR {p.price.toLocaleString()}/month</option>)}</SelectInput>
      </Field>
      <Field label="Message (optional)"><textarea className="input" rows={3} value={f.message} onChange={set('message')} /></Field>
      <button className="btn-primary w-full">Request a Demo</button>
      <p className="text-center text-xs text-slate-400">Demo request only – no payment is processed.</p>
    </form>
  );
}

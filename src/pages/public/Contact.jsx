import { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Field, TextInput } from '../../components/common/ui';
import { requestService } from '../../services/miscServices';
import { useToast } from '../../context/AppContext';
import DemoRequestForm from '../../components/forms/DemoRequestForm';

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    try { requestService.submitContact(f); toast.success('Message sent. We will get back to you soon.'); setF({ name: '', email: '', subject: '', message: '' }); setErrors({}); }
    catch (err) { setErrors(err.fields || {}); toast.error(err.message); }
  };
  return (
    <>
      <div className="bg-navy py-14 text-center"><h1 className="text-3xl font-bold !text-white">Contact Us</h1><p className="mx-auto mt-3 max-w-2xl px-4 text-slate-300">Questions, demos or onboarding – we are here to help.</p></div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div className="space-y-6">
          <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
            <h2 className="text-lg font-semibold">Send us a message</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={errors.name}><TextInput value={f.name} onChange={set('name')} error={errors.name} /></Field>
              <Field label="Email" required error={errors.email}><TextInput type="email" value={f.email} onChange={set('email')} error={errors.email} /></Field>
            </div>
            <Field label="Subject"><TextInput value={f.subject} onChange={set('subject')} /></Field>
            <Field label="Message" required error={errors.message}><textarea className={`input ${errors.message ? 'input-error' : ''}`} rows={4} value={f.message} onChange={set('message')} /></Field>
            <button className="btn-primary">Send message</button>
          </form>
          <div className="card space-y-3 p-6 text-sm">
            <p className="flex items-center gap-3"><Mail size={16} className="text-brand" /> hello@nexus-sbs.lk</p>
            <p className="flex items-center gap-3"><Phone size={16} className="text-brand" /> +94 11 234 5678</p>
            <p className="flex items-center gap-3"><MapPin size={16} className="text-brand" /> Colombo, Sri Lanka</p>
            <p className="flex items-center gap-3"><Clock size={16} className="text-brand" /> Mon–Fri, 9:00 AM – 5:30 PM</p>
            <p className="text-xs text-slate-400">Placeholder contact details for the academic demo.</p>
          </div>
        </div>
        <div className="card h-fit p-6"><h2 className="mb-4 text-lg font-semibold">Request a demo</h2><DemoRequestForm /></div>
      </div>
    </>
  );
}

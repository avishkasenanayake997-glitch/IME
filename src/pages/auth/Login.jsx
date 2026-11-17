import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Logo, Field, TextInput } from '../../components/common/ui';
import { useAuth, useToast } from '../../context/AppContext';
import { validators } from '../../utils/format';

const demo = [
  ['Super Admin', 'admin@nexus.lk', 'Admin@123'],
  ['Business Owner', 'owner@nexus.lk', 'Owner@123'],
  ['Manager', 'manager@nexus.lk', 'Manager@123'],
  ['Cashier', 'cashier@nexus.lk', 'Cashier@123'],
  ['Staff', 'staff@nexus.lk', 'Staff@123'],
];

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!validators.email(email)) er.email = 'Enter a valid email address';
    if (!password) er.password = 'Password is required';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setTimeout(() => {
      try { const u = login(email, password); toast.success(`Welcome back, ${u.name.split(' ')[0]}!`); nav(loc.state?.from || '/app', { replace: true }); }
      catch (err) { toast.error(err.message); setBusy(false); }
    }, 300);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/"><Logo /></Link>
          <h1 className="mt-8 text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-1 text-sm text-slate-500">Access your Nexus business dashboard.</p>
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <Field label="Email" error={errors.email}><TextInput type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@business.lk" /></Field>
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <TextInput type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </Field>
            <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-brand">Forgot password?</Link></div>
            <button className="btn-primary w-full py-2.5" disabled={busy}><LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Demo accounts (click to fill)</p>
            <div className="space-y-1">
              {demo.map(([r, e, p]) => (
                <button key={e} type="button" onClick={() => { setEmail(e); setPassword(p); setErrors({}); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white">
                  <span className="font-medium">{r}</span><span className="text-xs text-slate-500">{e}</span>
                </button>
              ))}
            </div>
          </div>
          <Link to="/" className="mt-6 inline-block text-sm text-slate-500 hover:text-navy">← Back to website</Link>
        </div>
      </div>
      <div className="hidden bg-gradient-to-br from-navy to-navy-700 p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <h2 className="max-w-md text-3xl font-bold !text-white">Manage your business smarter with Nexus</h2>
        <ul className="mt-6 max-w-md space-y-3 text-slate-300">
          <li>• POS, inventory, customers and staff in one place</li><li>• Reports built from your real transactions</li><li>• Nexus Insight Assistant for low-stock and sales insights</li>
        </ul>
        <p className="mt-10 text-xs text-slate-400">Demo environment. Data is stored in this browser only.</p>
      </div>
    </div>
  );
}

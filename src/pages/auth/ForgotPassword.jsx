import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Logo, Field, TextInput } from '../../components/common/ui';
import { authService } from '../../services/miscServices';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    try { authService.requestPasswordReset(email); setSent(true); setError(''); } catch (err) { setError(err.message); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <Logo />
        {sent ? (
          <div className="mt-6 text-center">
            <MailCheck className="mx-auto text-green-600" size={40} />
            <h1 className="mt-3 text-lg font-bold">Check your email</h1>
            <p className="mt-2 text-sm text-slate-500">If an account exists for {email}, reset instructions would be sent. (Demo: no email is actually sent. Ask your administrator to reset your password in Employees.)</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <h1 className="text-xl font-bold">Forgot your password?</h1>
            <p className="text-sm text-slate-500">Enter your account email to request a reset.</p>
            <Field label="Email" error={error}><TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} /></Field>
            <button className="btn-primary w-full">Send reset link</button>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-center text-sm font-medium text-brand">← Back to login</Link>
      </div>
    </div>
  );
}

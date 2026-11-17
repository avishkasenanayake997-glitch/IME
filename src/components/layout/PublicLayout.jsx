import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '../common/ui';
import { useAuth } from '../../context/AppContext';

const links = [['/', 'Home'], ['/about', 'About'], ['/features', 'Features'], ['/pricing', 'Pricing'], ['/contact', 'Contact']];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  const cls = ({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-brand' : 'text-slate-600 hover:text-navy'}`;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}
            <Link to={user ? '/app' : '/login'} className="btn-navy">{user ? 'Open Dashboard' : 'Login'}</Link>
          </nav>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-50 text-brand' : 'text-slate-700'}`}>{l}</NavLink>)}
            <Link to={user ? '/app' : '/login'} className="btn-navy w-full">{user ? 'Open Dashboard' : 'Login'}</Link>
          </div>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-navy text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo dark />
            <p className="mt-4 max-w-md text-sm text-slate-400">Affordable, integrated business management software for Sri Lankan Micro, Small and Medium-sized Enterprises.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">{links.map(([to, l]) => <li key={to}><Link to={to} className="hover:text-white">{l}</Link></li>)}<li><Link to="/login" className="hover:text-white">Login</Link></li></ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail size={14} /> hello@nexus-sbs.lk</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +94 11 234 5678</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Colombo, Sri Lanka</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">© {new Date().getFullYear()} Nexus Smart Business Solutions. Academic project demo (IT4050) – contact details are placeholders.</div>
      </footer>
    </div>
  );
}

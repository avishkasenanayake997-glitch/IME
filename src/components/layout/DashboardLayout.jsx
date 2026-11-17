import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Receipt, Package, Users, UserCog, BarChart3, Sparkles, GitBranch, Bell, Settings, LogOut, Menu, X, User, Building2 } from 'lucide-react';
import { useAuth, useBranch, useToast } from '../../context/AppContext';
import { useStore } from '../../services/store';
import { Logo } from '../common/ui';
import { ROLES } from '../../utils/permissions';
import { formatDateTime } from '../../utils/format';
import { notificationService } from '../../services/notificationService';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard', end: true },
  { to: '/app/pos', label: 'POS & Billing', icon: ShoppingCart, module: 'pos' },
  { to: '/app/sales', label: 'Sales', icon: Receipt, module: 'sales' },
  { to: '/app/inventory', label: 'Inventory', icon: Package, module: 'inventory' },
  { to: '/app/customers', label: 'Customers', icon: Users, module: 'customers' },
  { to: '/app/employees', label: 'Employees', icon: UserCog, module: 'employees' },
  { to: '/app/reports', label: 'Reports & Analytics', icon: BarChart3, module: 'reports' },
  { to: '/app/insights', label: 'Nexus Insight Assistant', icon: Sparkles, module: 'insights' },
  { to: '/app/branches', label: 'Branch Management', icon: GitBranch, module: 'branches' },
  { to: '/app/notifications', label: 'Notifications', icon: Bell, module: 'notifications' },
  { to: '/app/settings', label: 'Settings', icon: Settings, module: 'settings' },
];

export default function DashboardLayout() {
  const { user, logout, canAccess } = useAuth();
  const { branchId, setBranchId } = useBranch();
  const branches = useStore('branches');
  const notifications = useStore('notifications');
  const settings = useStore('settings');
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const items = NAV.filter((n) => canAccess(n.module));
  const canPickBranch = canAccess('branches');

  const doLogout = () => { logout(); toast.info('You have been logged out'); navigate('/login'); };

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-navy text-slate-300">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link to="/app"><Logo dark /></Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Main">
        {items.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand text-white' : 'hover:bg-white/10 hover:text-white'}`}>
            <n.icon size={18} /> <span className="flex-1">{n.label}</span>
            {n.module === 'notifications' && unread > 0 && <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-navy">{unread}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button onClick={doLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-white"><LogOut size={18} /> Logout</button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <div className="no-print hidden lg:block">{Sidebar}</div>
      {open && (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64">{Sidebar}</div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print relative z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="hidden min-w-0 items-center gap-2 text-sm font-semibold text-navy sm:flex">
            {settings.business.logo ? <img src={settings.business.logo} alt="" className="h-6 w-6 rounded object-cover" /> : <Building2 size={18} className="text-slate-400" />}
            <span className="truncate">{settings.business.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {canPickBranch && (
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="input w-auto max-w-[9rem] py-1.5 sm:max-w-none" aria-label="Select branch">
                <option value="all">All branches</option>
                {branches.filter((b) => b.status === 'Active').map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <div className="relative">
              <button className="relative rounded-lg p-2 hover:bg-slate-100" onClick={() => { setBell(!bell); setMenu(false); }} aria-label={`Notifications, ${unread} unread`}>
                <Bell size={20} />
                {unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
              </button>
              {bell && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-pop">
                  <div className="flex items-center justify-between border-b px-4 py-3"><span className="text-sm font-semibold">Notifications</span>
                    <button className="text-xs font-medium text-brand" onClick={() => notificationService.markAllRead()}>Mark all read</button></div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 6).map((n) => (
                      <button key={n.id} onClick={() => { notificationService.markRead(n.id); setBell(false); navigate('/app/notifications'); }}
                        className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${n.read ? '' : 'bg-blue-50/50'}`}>
                        <p className="text-sm font-medium">{n.title}</p><p className="text-xs text-slate-500">{n.message}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{formatDateTime(n.date)}</p>
                      </button>
                    ))}
                    {!notifications.length && <p className="p-6 text-center text-sm text-slate-500">No notifications</p>}
                  </div>
                  <Link to="/app/notifications" onClick={() => setBell(false)} className="block px-4 py-2.5 text-center text-sm font-medium text-brand hover:bg-slate-50">View all</Link>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => { setMenu(!menu); setBell(false); }} className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
                <span className="hidden text-left leading-tight md:block"><span className="block text-sm font-semibold">{user.name}</span><span className="block text-[11px] text-slate-500">{ROLES[user.role]}</span></span>
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
                  <Link to="/app/profile" onClick={() => setMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"><User size={16} /> My profile</Link>
                  <button onClick={doLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50"><LogOut size={16} /> Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" onClick={() => { setBell(false); setMenu(false); }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

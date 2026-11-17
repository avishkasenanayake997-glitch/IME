import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { authService } from '../services/miscServices';
import { useStore } from '../services/store';
import { setCurrencyCode } from '../utils/format';
import { canAccess, can } from '../utils/permissions';

/* ---------------- Auth ---------------- */
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const employees = useStore('employees');
  const settings = useStore('settings');
  const [userId, setUserId] = useState(() => authService.currentUser()?.id || null);
  useEffect(() => { setCurrencyCode(settings.currency?.code, settings.currency?.decimals); }, [settings]);
  const user = useMemo(() => {
    const u = employees.find((e) => e.id === userId);
    return u && u.status === 'Active' ? u : null;
  }, [employees, userId]);
  const value = useMemo(() => ({
    user,
    login: (email, pw) => { const u = authService.login(email, pw); setUserId(u.id); return u; },
    logout: () => { authService.logout(); setUserId(null); },
    canAccess: (m) => !!user && canAccess(user.role, m),
    can: (a) => !!user && can(user.role, a),
  }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

/* ---------------- Branch filter ---------------- */
const BranchCtx = createContext(null);
export function BranchProvider({ children }) {
  const [branchId, setBranchIdState] = useState(() => { try { return localStorage.getItem('nexus_branch') || 'all'; } catch { return 'all'; } });
  const setBranchId = (id) => { setBranchIdState(id); try { localStorage.setItem('nexus_branch', id); } catch { /* ignore */ } };
  return <BranchCtx.Provider value={{ branchId, setBranchId }}>{children}</BranchCtx.Provider>;
}
export const useBranch = () => useContext(BranchCtx);

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);
  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m) }), [push]);
  const icons = { success: <CheckCircle2 size={18} className="text-green-600" />, error: <AlertCircle size={18} className="text-red-600" />, info: <Info size={18} className="text-brand" /> };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="no-print fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-pop">
            <span className="mt-0.5">{icons[t.type]}</span>
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

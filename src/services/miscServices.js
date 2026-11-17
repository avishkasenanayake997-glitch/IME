import { store, session } from './store';
import { uid, validators } from '../utils/format';

export const authService = {
  login(email, password) {
    const u = store.get('employees').find((e) => e.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.password !== password) throw new Error('Invalid email or password');
    if (u.status !== 'Active') throw new Error('This account is inactive. Contact your administrator.');
    session.set(u.id);
    return u;
  },
  logout: () => session.clear(),
  currentUser() {
    const id = session.get();
    const u = id && store.get('employees').find((e) => e.id === id);
    return u && u.status === 'Active' ? u : null;
  },
  // Demo only: no email is sent.
  requestPasswordReset(email) {
    if (!validators.email(email)) throw new Error('Enter a valid email address');
    return store.get('employees').some((e) => e.email.toLowerCase() === email.toLowerCase());
  },
  changePassword(id, current, next) {
    const u = store.get('employees').find((e) => e.id === id);
    if (!u || u.password !== current) throw new Error('Current password is incorrect');
    if (next.length < 6) throw new Error('New password must be at least 6 characters');
    store.update('employees', (l) => l.map((e) => (e.id === id ? { ...e, password: next } : e)));
  },
};

export const branchService = {
  list: () => store.get('branches'),
  create(data) { const b = { ...data, id: uid('b'), status: data.status || 'Active' }; store.update('branches', (l) => [...l, b]); return b; },
  update: (id, data) => store.update('branches', (l) => l.map((b) => (b.id === id ? { ...b, ...data } : b))),
  remove(id) {
    if (store.get('branches').length <= 1) throw new Error('At least one branch is required');
    if (store.get('products').some((p) => p.branchId === id) || store.get('sales').some((s) => s.branchId === id))
      throw new Error('This branch has products or sales and cannot be deleted. Mark it Inactive instead.');
    store.update('branches', (l) => l.filter((b) => b.id !== id));
  },
};

export const settingsService = {
  get: () => store.get('settings'),
  updateSection: (section, data) => store.update('settings', (s) => ({ ...s, [section]: { ...s[section], ...data } })),
};

export const backupService = {
  list: () => store.get('backups'),
  // Simulated: only records a local snapshot entry. No cloud upload happens.
  run(type = 'Manual (simulated)') {
    const size = (store.sizeBytes() / 1048576).toFixed(2) + ' MB';
    const b = { id: uid('bk'), date: new Date().toISOString(), type, size, status: 'Completed' };
    store.update('backups', (l) => [b, ...l]);
    return b;
  },
};

export const requestService = {
  submitDemo(data) {
    const e = {};
    if (!data.name?.trim()) e.name = 'Name is required';
    if (!validators.email(data.email)) e.email = 'Enter a valid email';
    if (!validators.phone(data.phone)) e.phone = 'Enter a valid phone number';
    if (!data.business?.trim()) e.business = 'Business name is required';
    if (Object.keys(e).length) { const err = new Error('Please fix the highlighted fields'); err.fields = e; throw err; }
    store.update('subscriptionRequests', (l) => [{ ...data, id: uid('req'), date: new Date().toISOString() }, ...l]);
  },
  submitContact(data) {
    const e = {};
    if (!data.name?.trim()) e.name = 'Name is required';
    if (!validators.email(data.email)) e.email = 'Enter a valid email';
    if (!data.message?.trim() || data.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    if (Object.keys(e).length) { const err = new Error('Please fix the highlighted fields'); err.fields = e; throw err; }
    store.update('contactMessages', (l) => [{ ...data, id: uid('msg'), date: new Date().toISOString() }, ...l]);
  },
};

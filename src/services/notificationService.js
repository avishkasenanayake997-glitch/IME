import { store } from './store';
import { uid } from '../utils/format';

const PREF_BY_TYPE = { lowstock: 'lowStock', outofstock: 'lowStock', sale: 'newSale', customer: 'newCustomer', employee: 'employee', summary: 'summary', insight: 'insights' };

export const notificationService = {
  list: () => store.get('notifications'),
  add(type, title, message) {
    const pref = PREF_BY_TYPE[type];
    if (pref && store.get('settings').notifications?.[pref] === false) return;
    store.update('notifications', (l) => [{ id: uid('n'), type, title, message, date: new Date().toISOString(), read: false }, ...l].slice(0, 200));
  },
  markRead: (id) => store.update('notifications', (l) => l.map((n) => (n.id === id ? { ...n, read: true } : n))),
  markAllRead: () => store.update('notifications', (l) => l.map((n) => ({ ...n, read: true }))),
  remove: (id) => store.update('notifications', (l) => l.filter((n) => n.id !== id)),
  clear: () => store.set('notifications', []),
};

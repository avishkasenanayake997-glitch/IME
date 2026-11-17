import { store } from './store';
import { uid, validators } from '../utils/format';
import { notificationService } from './notificationService';
import { saleNet } from '../utils/analytics';

export function validateCustomer(c) {
  const e = {};
  if (!c.name?.trim()) e.name = 'Name is required';
  if (!c.phone?.trim()) e.phone = 'Phone number is required';
  else if (!validators.phone(c.phone)) e.phone = 'Enter a valid phone number';
  if (c.email && !validators.email(c.email)) e.email = 'Enter a valid email address';
  return e;
}

export const customerService = {
  list: () => store.get('customers'),
  get: (id) => store.get('customers').find((c) => c.id === id),
  create(data) {
    const c = { ...data, name: data.name.trim(), id: uid('c'), createdAt: new Date().toISOString() };
    store.update('customers', (l) => [c, ...l]);
    notificationService.add('customer', 'New customer added', `${c.name} was added to your customers.`);
    return c;
  },
  update: (id, data) => store.update('customers', (l) => l.map((c) => (c.id === id ? { ...c, ...data } : c))),
  remove(id) {
    if (id === 'c0') throw new Error('The Walk-in customer cannot be deleted');
    store.update('customers', (l) => l.filter((c) => c.id !== id));
  },
  history: (id) => store.get('sales').filter((s) => s.customerId === id).sort((a, b) => new Date(b.date) - new Date(a.date)),
  stats(id) {
    const h = this.history(id);
    return { orders: h.length, total: h.reduce((n, s) => n + saleNet(s), 0), last: h[0]?.date };
  },
};

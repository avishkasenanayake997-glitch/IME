// Persistent localStorage-backed store. In a real deployment each collection maps to a
// PostgreSQL table behind a Node/Express API (see services/api.js).
import { useSyncExternalStore } from 'react';
import * as seed from '../data/seed';

const PREFIX = 'nexus_';
const KEYS = ['products', 'customers', 'employees', 'sales', 'movements', 'branches', 'notifications', 'settings', 'backups', 'subscriptionRequests', 'contactMessages'];

let cache = {};
let version = 0;
const listeners = new Set();

function read(key) {
  try { const raw = localStorage.getItem(PREFIX + key); return raw ? JSON.parse(raw) : undefined; } catch { return undefined; }
}
function write(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) { console.warn('Storage write failed', e); }
}

function seedAll() {
  const products = seed.buildProducts();
  const { sales, movements } = seed.buildSales(products, seed.customers, seed.employees);
  const data = {
    products, customers: seed.customers, employees: seed.employees, sales,
    movements: [...movements, ...seed.buildMovements(products)].sort((a, b) => new Date(b.date) - new Date(a.date)),
    branches: seed.branches, notifications: seed.notifications, settings: seed.settings,
    backups: seed.backups, subscriptionRequests: [], contactMessages: [],
  };
  KEYS.forEach((k) => write(k, data[k]));
  write('seed_version', seed.SEED_VERSION);
  return data;
}

function init() {
  if (read('seed_version') !== seed.SEED_VERSION) {
    cache = seedAll();
    try { localStorage.removeItem(PREFIX + 'session'); } catch { /* ignore */ }
  } else {
    KEYS.forEach((k) => { cache[k] = read(k) ?? (k === 'settings' ? seed.settings : []); });
  }
}
init();

export const store = {
  get: (key) => cache[key],
  set(key, val) { cache = { ...cache, [key]: val }; write(key, val); version++; listeners.forEach((l) => l()); },
  update(key, fn) { this.set(key, fn(cache[key])); },
  subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
  version: () => version,
  resetDemoData() { cache = seedAll(); try { localStorage.removeItem(PREFIX + 'session'); } catch { /* ignore */ } version++; listeners.forEach((l) => l()); },
  exportAll() { return KEYS.reduce((o, k) => ({ ...o, [k]: cache[k] }), {}); },
  sizeBytes() { return KEYS.reduce((n, k) => n + (localStorage.getItem(PREFIX + k)?.length || 0), 0) * 2; },
};

// React hook: re-renders when the store changes.
export function useStore(key) {
  useSyncExternalStore(store.subscribe, store.version);
  return store.get(key);
}

export const session = {
  get() { try { return localStorage.getItem(PREFIX + 'session'); } catch { return null; } },
  set(id) { try { localStorage.setItem(PREFIX + 'session', id); } catch { /* ignore */ } },
  clear() { try { localStorage.removeItem(PREFIX + 'session'); } catch { /* ignore */ } },
};

import { store } from './store';
import { uid } from '../utils/format';
import { notificationService } from './notificationService';

export function validateProduct(p, existing = []) {
  const e = {};
  if (!p.name?.trim()) e.name = 'Product name is required';
  if (!p.sku?.trim()) e.sku = 'SKU is required';
  else if (existing.some((x) => x.id !== p.id && x.sku.toLowerCase() === p.sku.trim().toLowerCase())) e.sku = 'SKU already exists';
  if (!p.category) e.category = 'Select a category';
  if (p.cost === '' || Number(p.cost) < 0 || isNaN(Number(p.cost))) e.cost = 'Enter a valid cost price';
  if (p.price === '' || Number(p.price) <= 0 || isNaN(Number(p.price))) e.price = 'Enter a valid selling price';
  else if (Number(p.price) < Number(p.cost)) e.price = 'Selling price is below cost price';
  if (p.stock === '' || Number(p.stock) < 0 || !Number.isInteger(Number(p.stock))) e.stock = 'Quantity must be a whole number ≥ 0';
  if (p.minStock === '' || Number(p.minStock) < 0 || !Number.isInteger(Number(p.minStock))) e.minStock = 'Enter a minimum level ≥ 0';
  if (!p.branchId) e.branchId = 'Select a branch';
  return e;
}

const clean = (p) => ({ ...p, name: p.name.trim(), sku: p.sku.trim(), cost: Number(p.cost), price: Number(p.price), stock: Number(p.stock), minStock: Number(p.minStock) });

export const productService = {
  list: () => store.get('products'),
  get: (id) => store.get('products').find((p) => p.id === id),
  create(data, by = 'System') {
    const p = clean({ ...data, id: uid('p'), createdAt: new Date().toISOString() });
    store.update('products', (l) => [p, ...l]);
    if (p.stock > 0) this.logMovement(p, 'restock', p.stock, 'Opening stock', by);
    return p;
  },
  update(id, data) {
    store.update('products', (l) => l.map((p) => (p.id === id ? { ...p, ...clean({ ...p, ...data }) } : p)));
  },
  remove(id) { store.update('products', (l) => l.filter((p) => p.id !== id)); },
  logMovement(p, type, qty, reason, by) {
    store.update('movements', (l) => [{ id: uid('m'), productId: p.id, productName: p.name, branchId: p.branchId, type, qty, reason, by, date: new Date().toISOString() }, ...l]);
  },
  // delta can be negative; stock may never fall below zero
  adjustStock(id, delta, reason, by) {
    const p = this.get(id);
    if (!p) throw new Error('Product not found');
    const d = Number(delta);
    if (!Number.isInteger(d) || d === 0) throw new Error('Enter a non-zero whole number');
    if (p.stock + d < 0) throw new Error(`Cannot remove ${Math.abs(d)} units – only ${p.stock} in stock`);
    if (!reason?.trim()) throw new Error('A reason is required');
    const wasLow = p.stock > p.minStock;
    store.update('products', (l) => l.map((x) => (x.id === id ? { ...x, stock: x.stock + d } : x)));
    this.logMovement(p, 'adjustment', d, reason.trim(), by);
    const ns = p.stock + d;
    if (ns === 0) notificationService.add('outofstock', 'Product out of stock', `${p.name} is out of stock.`);
    else if (ns <= p.minStock && wasLow) notificationService.add('lowstock', 'Low stock warning', `${p.name} is running low (${ns} units left).`);
  },
};

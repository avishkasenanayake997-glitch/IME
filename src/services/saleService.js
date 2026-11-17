import { store } from './store';
import { uid, round2 } from '../utils/format';
import { notificationService } from './notificationService';

function nextInvoice() {
  const nums = store.get('sales').map((s) => parseInt(s.invoice.replace(/\D/g, ''), 10) || 0);
  return `INV-${Math.max(1000, ...nums) + 1}`;
}

export function computeTotals(lines, discountInput, taxRate, taxEnabled) {
  const subtotal = round2(lines.reduce((n, l) => n + l.qty * l.price, 0));
  let discount = 0;
  if (discountInput?.value > 0) discount = discountInput.type === 'percent' ? subtotal * (Math.min(discountInput.value, 100) / 100) : Math.min(discountInput.value, subtotal);
  discount = round2(discount);
  const taxable = subtotal - discount;
  const tax = taxEnabled ? round2(taxable * (taxRate / 100)) : 0;
  return { subtotal, discount, tax, total: round2(taxable + tax) };
}

export const saleService = {
  list: () => store.get('sales'),
  get: (id) => store.get('sales').find((s) => s.id === id),

  // Completes a sale atomically: validates stock, saves the transaction, decreases stock,
  // records movements, and raises notifications.
  complete({ lines, customer, branchId, discountInput, paymentMethod, paid, cashier }) {
    if (!lines.length) throw new Error('The cart is empty');
    const products = store.get('products');
    const settings = store.get('settings');
    // 1. stock validation against the latest stored data
    for (const l of lines) {
      const p = products.find((x) => x.id === l.productId);
      if (!p) throw new Error(`${l.name} no longer exists`);
      if (l.qty > p.stock) throw new Error(`Insufficient stock for ${p.name}: ${p.stock} available`);
    }
    const t = computeTotals(lines, discountInput, settings.tax.rate, settings.tax.enabled);
    if (paymentMethod === 'Cash' && round2(paid) < t.total) throw new Error('Cash received is less than the total');
    const date = new Date().toISOString();
    const sale = {
      id: uid('s'), invoice: nextInvoice(), date, branchId,
      customerId: customer.id, customerName: customer.name, cashierId: cashier.id, cashierName: cashier.name,
      items: lines.map((l) => ({ productId: l.productId, name: l.name, sku: l.sku, qty: l.qty, price: l.price, cost: l.cost, returned: 0 })),
      ...t, taxRate: settings.tax.enabled ? settings.tax.rate : 0,
      paymentMethod, paid: paymentMethod === 'Cash' ? round2(paid) : t.total,
      change: paymentMethod === 'Cash' ? round2(paid - t.total) : 0,
      status: 'Completed', refunded: 0, returns: [],
    };
    // 2. persist sale + stock + movements
    const alerts = [];
    store.update('products', (l) => l.map((p) => {
      const line = lines.find((x) => x.productId === p.id);
      if (!line) return p;
      const ns = p.stock - line.qty;
      if (ns === 0) alerts.push(['outofstock', 'Product out of stock', `${p.name} is out of stock.`]);
      else if (ns <= p.minStock && p.stock > p.minStock) alerts.push(['lowstock', 'Low stock warning', `${p.name} is running low (${ns} units left).`]);
      return { ...p, stock: ns };
    }));
    store.update('sales', (l) => [sale, ...l]);
    store.update('movements', (l) => [
      ...sale.items.map((i) => ({ id: uid('m'), productId: i.productId, productName: i.name, branchId, type: 'sale', qty: -i.qty, reason: sale.invoice, by: cashier.name, date })),
      ...l,
    ]);
    notificationService.add('sale', 'New sale completed', `${sale.invoice} – ${sale.items.length} item(s) for ${sale.customerName}.`);
    alerts.forEach((a) => notificationService.add(...a));
    return sale;
  },

  // returnItems: [{productId, qty}]
  processReturn(saleId, returnItems, reason, by) {
    const sale = this.get(saleId);
    if (!sale) throw new Error('Sale not found');
    const items = returnItems.filter((r) => r.qty > 0);
    if (!items.length) throw new Error('Select at least one item to return');
    if (!reason?.trim()) throw new Error('Please provide a return reason');
    for (const r of items) {
      const it = sale.items.find((i) => i.productId === r.productId);
      if (!it || r.qty > it.qty - (it.returned || 0)) throw new Error(`Invalid return quantity for ${it?.name || 'item'}`);
    }
    const disc = sale.subtotal ? sale.discount / sale.subtotal : 0;
    const amount = round2(items.reduce((n, r) => {
      const it = sale.items.find((i) => i.productId === r.productId);
      return n + r.qty * it.price * (1 - disc) * (1 + (sale.taxRate || 0) / 100);
    }, 0));
    const newItems = sale.items.map((i) => {
      const r = items.find((x) => x.productId === i.productId);
      return r ? { ...i, returned: (i.returned || 0) + r.qty } : i;
    });
    const allReturned = newItems.every((i) => i.returned >= i.qty);
    const date = new Date().toISOString();
    store.update('sales', (l) => l.map((s) => (s.id === saleId ? {
      ...s, items: newItems, refunded: round2((s.refunded || 0) + amount), status: allReturned ? 'Refunded' : 'Partially Returned',
      returns: [...(s.returns || []), { id: uid('r'), date, items: items.map((r) => ({ productId: r.productId, name: sale.items.find((i) => i.productId === r.productId).name, qty: r.qty })), amount, reason: reason.trim(), by }],
    } : s)));
    // restore stock
    store.update('products', (l) => l.map((p) => {
      const r = items.find((x) => x.productId === p.id);
      return r ? { ...p, stock: p.stock + r.qty } : p;
    }));
    store.update('movements', (l) => [
      ...items.map((r) => ({ id: uid('m'), productId: r.productId, productName: sale.items.find((i) => i.productId === r.productId).name, branchId: sale.branchId, type: 'return', qty: r.qty, reason: `Return ${sale.invoice}`, by, date })),
      ...l,
    ]);
    return amount;
  },
};

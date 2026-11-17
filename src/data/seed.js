// Demo seed data. Generated deterministically relative to the first launch date.
import { uid } from '../utils/format';

export const SEED_VERSION = 3;

function rng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

export const CATEGORIES = ['Groceries', 'Beverages', 'Household', 'Personal Care', 'Stationery', 'Electronics'];

export const branches = [
  { id: 'b1', name: 'Colombo Main Branch', address: '45 Galle Road, Colombo 03', manager: 'Nimali Perera', phone: '0112 345 678', email: 'colombo@lankamart.lk', status: 'Active' },
  { id: 'b2', name: 'Kandy Branch', address: '12 Peradeniya Road, Kandy', manager: 'Kasun Bandara', phone: '0812 234 567', email: 'kandy@lankamart.lk', status: 'Active' },
  { id: 'b3', name: 'Galle Branch', address: '88 Matara Road, Galle', manager: 'Shanika Fernando', phone: '0912 223 344', email: 'galle@lankamart.lk', status: 'Active' },
];

// name, category, emoji, cost, price, stock, min, supplier
const base = [
  ['Samba Rice 5kg', 'Groceries', '🍚', 1150, 1350, 8, 20, 'Lanka Grain Mills'],
  ['Red Dhal 1kg', 'Groceries', '🫘', 380, 460, 64, 25, 'Lanka Grain Mills'],
  ['Sugar 1kg', 'Groceries', '🧂', 240, 290, 120, 40, 'Ceylon Sugar Traders'],
  ['Coconut Oil 1L', 'Groceries', '🥥', 720, 860, 35, 15, 'Palm & Co'],
  ['Wheat Flour 1kg', 'Groceries', '🌾', 260, 320, 0, 30, 'Prima Distributors'],
  ['Ceylon Tea 400g', 'Beverages', '🍵', 480, 590, 72, 20, 'Hill Country Teas'],
  ['Milk Powder 400g', 'Beverages', '🥛', 760, 890, 46, 20, 'Highland Dairy'],
  ['Mineral Water 1L', 'Beverages', '💧', 70, 100, 210, 60, 'Crystal Springs'],
  ['Orange Juice 1L', 'Beverages', '🧃', 310, 390, 18, 15, 'FreshPress Lanka'],
  ['Dish Wash Liquid 500ml', 'Household', '🧴', 270, 350, 41, 15, 'CleanHome Ltd'],
  ['Laundry Detergent 1kg', 'Household', '🧺', 520, 640, 29, 15, 'CleanHome Ltd'],
  ['Floor Cleaner 1L', 'Household', '🧽', 340, 430, 12, 12, 'CleanHome Ltd'],
  ['Herbal Soap 100g', 'Personal Care', '🧼', 90, 130, 150, 50, 'Ayur Naturals'],
  ['Shampoo 200ml', 'Personal Care', '🧴', 410, 520, 33, 15, 'Ayur Naturals'],
  ['Toothpaste 120g', 'Personal Care', '🪥', 190, 250, 58, 25, 'DentCare Lanka'],
  ['A4 Paper Ream', 'Stationery', '📄', 1250, 1500, 22, 10, 'Office Hub'],
  ['Exercise Book 80pg', 'Stationery', '📒', 85, 130, 5, 40, 'Office Hub'],
  ['Ball Pen Blue (10pk)', 'Stationery', '🖊️', 160, 230, 76, 25, 'Office Hub'],
  ['LED Bulb 9W', 'Electronics', '💡', 340, 450, 44, 20, 'BrightTech'],
  ['Phone Charger 20W', 'Electronics', '🔌', 1100, 1490, 15, 8, 'BrightTech'],
];
const branchIdx = { b1: base.map((_, i) => i), b2: [0, 1, 2, 3, 5, 6, 7, 9, 12, 14, 16, 18], b3: [0, 2, 4, 5, 7, 8, 10, 13, 15, 17, 19] };

export function buildProducts() {
  const r = rng(11);
  const out = [];
  Object.entries(branchIdx).forEach(([bid, idxs]) => {
    idxs.forEach((i) => {
      const b = base[i];
      const keepExact = bid === 'b1';
      const stock = keepExact ? b[5] : Math.max(0, Math.round(b[5] * (0.5 + r())));
      out.push({
        id: `p-${bid}-${String(i + 1).padStart(3, '0')}`, branchId: bid,
        name: b[0], category: b[1], emoji: b[2], imageUrl: '',
        sku: `NX-${b[1].slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}-${bid.toUpperCase()}`,
        barcode: `479${String(1000000 + i * 137 + (bid === 'b1' ? 0 : bid === 'b2' ? 5000 : 9000)).padStart(9, '0')}`,
        cost: b[3], price: b[4], stock, minStock: b[6], supplier: b[7],
        supplierContact: '0112 000 ' + String(100 + i).slice(-3),
        createdAt: new Date(Date.now() - 120 * 864e5).toISOString(),
      });
    });
  });
  return out;
}

export const employees = [
  { id: 'e1', name: 'Avishka Sahan', email: 'admin@nexus.lk', phone: '0771 000 001', position: 'System Administrator', role: 'superadmin', status: 'Active', password: 'Admin@123', branchId: 'b1' },
  { id: 'e2', name: 'Ruwan Jayasuriya', email: 'owner@nexus.lk', phone: '0771 000 002', position: 'Business Owner', role: 'owner', status: 'Active', password: 'Owner@123', branchId: 'b1' },
  { id: 'e3', name: 'Nimali Perera', email: 'manager@nexus.lk', phone: '0771 000 003', position: 'Store Manager', role: 'manager', status: 'Active', password: 'Manager@123', branchId: 'b1' },
  { id: 'e4', name: 'Tharindu Silva', email: 'cashier@nexus.lk', phone: '0771 000 004', position: 'Senior Cashier', role: 'cashier', status: 'Active', password: 'Cashier@123', branchId: 'b1' },
  { id: 'e5', name: 'Dilini Wickrama', email: 'staff@nexus.lk', phone: '0771 000 005', position: 'Stock Assistant', role: 'staff', status: 'Active', password: 'Staff@123', branchId: 'b1' },
  { id: 'e6', name: 'Kasun Bandara', email: 'kasun@nexus.lk', phone: '0771 000 006', position: 'Branch Manager – Kandy', role: 'manager', status: 'Active', password: 'Manager@123', branchId: 'b2' },
  { id: 'e7', name: 'Sachini Rajapaksa', email: 'sachini@nexus.lk', phone: '0771 000 007', position: 'Cashier', role: 'cashier', status: 'Active', password: 'Cashier@123', branchId: 'b2' },
  { id: 'e8', name: 'Shanika Fernando', email: 'shanika@nexus.lk', phone: '0771 000 008', position: 'Branch Manager – Galle', role: 'manager', status: 'Active', password: 'Manager@123', branchId: 'b3' },
  { id: 'e9', name: 'Pradeep Kumara', email: 'pradeep@nexus.lk', phone: '0771 000 009', position: 'Cashier', role: 'cashier', status: 'Inactive', password: 'Cashier@123', branchId: 'b3' },
];

export const customers = [
  ['Walk-in Customer', '', '', '', ''],
  ['Amal Gunawardena', '0712 345 671', 'amal@example.lk', '23 Temple Rd, Nugegoda', 'Gunawardena Stores'],
  ['Sanduni Madushani', '0723 456 782', 'sanduni@example.lk', '9 Lake Rd, Kandy', ''],
  ['Lanka Café & Bakery', '0112 777 888', 'orders@lankacafe.lk', '14 Duplication Rd, Colombo 04', 'Lanka Café & Bakery'],
  ['Mahesh Karunaratne', '0764 567 893', 'mahesh@example.lk', '77 Beach Rd, Galle', ''],
  ['Green Leaf Pharmacy', '0114 222 333', 'greenleaf@example.lk', '5 Church St, Mount Lavinia', 'Green Leaf Pharmacy'],
  ['Ishara Weerasinghe', '0705 678 904', 'ishara@example.lk', '31 Hill St, Kandy', ''],
  ['Fernando Wholesale', '0912 555 123', 'info@fernandowholesale.lk', '102 Main St, Galle', 'Fernando Wholesale'],
  ['Nadeesha Rathnayake', '0786 789 015', 'nadeesha@example.lk', '18 Park Ave, Colombo 05', ''],
  ['Priyantha Dissanayake', '0717 890 126', 'priyantha@example.lk', '66 Station Rd, Kandy', 'PD Hardware'],
].map((c, i) => ({ id: `c${i}`, name: c[0], phone: c[1], email: c[2], address: c[3], business: c[4], createdAt: new Date(Date.now() - (100 - i * 7) * 864e5).toISOString() }));

export function buildSales(products, customerList, employeeList) {
  const r = rng(77);
  const sales = [];
  const movements = [];
  const methods = ['Cash', 'Cash', 'Card', 'Cash', 'Card'];
  let inv = 1000;
  const taxRate = 8;
  for (let d = 90; d >= 0; d--) {
    const day = new Date(); day.setDate(day.getDate() - d);
    const dow = day.getDay();
    const count = Math.round((dow === 0 || dow === 6 ? 5 : 3) + r() * 3 + (90 - d) / 30);
    for (let k = 0; k < count; k++) {
      const bid = r() < 0.55 ? 'b1' : r() < 0.55 ? 'b2' : 'b3';
      const pool = products.filter((p) => p.branchId === bid);
      const nItems = 1 + Math.floor(r() * 4);
      const items = [];
      for (let j = 0; j < nItems; j++) {
        const p = pool[Math.floor(r() * pool.length)];
        if (items.find((x) => x.productId === p.id)) continue;
        // trend: rice slowly declining, tea growing
        if (p.name.startsWith('Samba') && d < 30 && r() < 0.5) continue;
        const qty = 1 + Math.floor(r() * (p.price < 500 ? 5 : 2));
        items.push({ productId: p.id, name: p.name, sku: p.sku, qty, price: p.price, cost: p.cost, returned: 0 });
      }
      if (!items.length) continue;
      const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
      const discount = r() < 0.15 ? Math.round(subtotal * 0.05) : 0;
      const tax = Math.round((subtotal - discount) * taxRate) / 100;
      const total = subtotal - discount + tax;
      const cust = r() < 0.6 ? customerList[1 + Math.floor(r() * (customerList.length - 1))] : customerList[0];
      const cashiers = employeeList.filter((e) => e.branchId === bid && (e.role === 'cashier' || e.role === 'manager'));
      const cashier = cashiers[Math.floor(r() * cashiers.length)] || employeeList[2];
      const date = new Date(day); date.setHours(9 + Math.floor(r() * 11), Math.floor(r() * 60), 0, 0);
      if (date > new Date()) date.setTime(Date.now() - 60000 * (k + 1));
      const method = methods[Math.floor(r() * methods.length)];
      const sale = {
        id: `s-${inv}`, invoice: `INV-${inv}`, date: date.toISOString(), branchId: bid,
        customerId: cust.id, customerName: cust.name, cashierId: cashier.id, cashierName: cashier.name,
        items, subtotal, discount, tax, taxRate, total, paymentMethod: method,
        paid: method === 'Cash' ? Math.ceil(total / 100) * 100 : total, change: method === 'Cash' ? Math.ceil(total / 100) * 100 - total : 0,
        status: 'Completed', refunded: 0, returns: [],
      };
      inv++;
      sales.push(sale);
      if (d <= 14) items.forEach((it) => movements.push({ id: uid('m'), productId: it.productId, productName: it.name, branchId: bid, type: 'sale', qty: -it.qty, reason: sale.invoice, by: cashier.name, date: date.toISOString() }));
    }
  }
  // a couple of returned sales for demo
  const refundIdx = sales.length - 12;
  const s = sales[refundIdx];
  s.items[0].returned = 1;
  const amt = Math.round(s.items[0].price * (1 + s.taxRate / 100) * 100) / 100;
  s.refunded = amt; s.status = s.items.length === 1 && s.items[0].qty === 1 ? 'Refunded' : 'Partially Returned';
  s.returns.push({ id: uid('r'), date: s.date, items: [{ productId: s.items[0].productId, name: s.items[0].name, qty: 1 }], amount: amt, reason: 'Damaged packaging', by: 'Nimali Perera' });
  return { sales, movements };
}

export function buildMovements(products) {
  return products.slice(0, 14).map((p, i) => ({
    id: uid('m'), productId: p.id, productName: p.name, branchId: p.branchId, type: i % 4 === 0 ? 'adjustment' : 'restock',
    qty: i % 4 === 0 ? -2 : 40, reason: i % 4 === 0 ? 'Damaged items' : 'Supplier delivery', by: 'Nimali Perera',
    date: new Date(Date.now() - (20 + i) * 864e5).toISOString(),
  }));
}

export const settings = {
  business: { name: 'LankaMart Retail (Pvt) Ltd', logo: '', address: '45 Galle Road, Colombo 03', phone: '0112 345 678', email: 'info@lankamart.lk', website: 'www.lankamart.lk', regNo: 'PV 00123456', businessType: 'Retail / Grocery' },
  currency: { code: 'LKR', decimals: 2 },
  tax: { enabled: true, name: 'VAT', rate: 8 },
  receipt: { header: 'Thank you for shopping with us!', footer: 'Goods once sold cannot be exchanged without a receipt.', showLogo: true, showTax: true, paper: '80mm' },
  preferences: { lowStockDefault: 10, rowsPerPage: 10, dateFormat: 'DD MMM YYYY' },
  notifications: { lowStock: true, newSale: true, newCustomer: true, employee: true, summary: true, insights: true },
};

export const notifications = [
  { id: 'n1', type: 'lowstock', title: 'Low stock warning', message: 'Samba Rice 5kg is running low (8 units left).', date: new Date(Date.now() - 36e5).toISOString(), read: false },
  { id: 'n2', type: 'outofstock', title: 'Product out of stock', message: 'Wheat Flour 1kg is out of stock.', date: new Date(Date.now() - 3 * 36e5).toISOString(), read: false },
  { id: 'n3', type: 'insight', title: 'Business insights available', message: 'Nexus Insight Assistant has new calculated insights for you.', date: new Date(Date.now() - 5 * 36e5).toISOString(), read: false },
  { id: 'n4', type: 'summary', title: 'Monthly sales summary', message: 'Your monthly sales summary is ready in Reports.', date: new Date(Date.now() - 24 * 36e5).toISOString(), read: true },
];

export const backups = [
  { id: 'bk1', date: new Date(Date.now() - 2 * 864e5).toISOString(), type: 'Manual (simulated)', size: '1.2 MB', status: 'Completed' },
  { id: 'bk2', date: new Date(Date.now() - 9 * 864e5).toISOString(), type: 'Manual (simulated)', size: '1.1 MB', status: 'Completed' },
];

export const subscriptionRequests = [];

import { useMemo, useRef, useState } from 'react';
import { Search, Barcode, Plus, Minus, Trash2, UserPlus, ShoppingCart, CreditCard, Banknote, CheckCircle2, PackageX } from 'lucide-react';
import { PageHeader, EmptyState, ProductThumb, Modal, SelectInput, Badge } from '../../components/common/ui';
import CustomerForm from '../../components/forms/CustomerForm';
import Receipt from '../../components/common/Receipt';
import { useStore } from '../../services/store';
import { useAuth, useToast } from '../../context/AppContext';
import { useScope } from '../../hooks/useScope';
import { saleService, computeTotals } from '../../services/saleService';
import { customerService } from '../../services/customerService';
import { formatLKR, round2 } from '../../utils/format';
import { CATEGORIES } from '../../data/seed';

export default function POS() {
  const products = useStore('products');
  const customers = useStore('customers');
  const branches = useStore('branches');
  const settings = useStore('settings');
  const { user } = useAuth();
  const toast = useToast();
  const scope = useScope();
  const [branchPick, setBranchPick] = useState(user.branchId);
  const posBranch = scope.branchId === 'all' ? branchPick : scope.branchId;

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [barcode, setBarcode] = useState('');
  const [customerId, setCustomerId] = useState('c0');
  const [discType, setDiscType] = useState('percent');
  const [discVal, setDiscVal] = useState('');
  const [method, setMethod] = useState('Cash');
  const [received, setReceived] = useState('');
  const [newCust, setNewCust] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const barcodeRef = useRef(null);

  const branchProducts = useMemo(() => products.filter((p) => p.branchId === posBranch), [products, posBranch]);
  const list = useMemo(() => branchProducts.filter((p) => (cat === 'All' || p.category === cat)
    && (!search || [p.name, p.sku, p.barcode].some((x) => x.toLowerCase().includes(search.toLowerCase())))), [branchProducts, cat, search]);

  const qtyInCart = (id) => cart.find((l) => l.productId === id)?.qty || 0;
  const add = (p) => {
    if (p.stock <= 0) return toast.error(`${p.name} is out of stock`);
    if (qtyInCart(p.id) >= p.stock) return toast.error(`Only ${p.stock} units of ${p.name} available`);
    setCart((c) => (c.find((l) => l.productId === p.id) ? c.map((l) => (l.productId === p.id ? { ...l, qty: l.qty + 1 } : l))
      : [...c, { productId: p.id, name: p.name, sku: p.sku, price: p.price, cost: p.cost, qty: 1, emoji: p.emoji, imageUrl: p.imageUrl }]));
  };
  const setQty = (id, qty) => {
    const p = products.find((x) => x.id === id);
    if (qty <= 0) return setCart((c) => c.filter((l) => l.productId !== id));
    if (qty > p.stock) return toast.error(`Only ${p.stock} units of ${p.name} available`);
    setCart((c) => c.map((l) => (l.productId === id ? { ...l, qty } : l)));
  };
  const scan = (e) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    const p = branchProducts.find((x) => x.barcode === code || x.sku.toLowerCase() === code.toLowerCase());
    if (!p) toast.error(`No product found for "${code}"`); else { add(p); setBarcode(''); }
    barcodeRef.current?.focus();
  };

  const dv = Number(discVal) || 0;
  const discountInvalid = dv < 0 || (discType === 'percent' && dv > 100);
  const totals = computeTotals(cart, { type: discType, value: discountInvalid ? 0 : dv }, settings.tax.rate, settings.tax.enabled);
  const rec = Number(received) || 0;
  const change = round2(rec - totals.total);
  const cashShort = method === 'Cash' && rec < totals.total;
  const customer = customers.find((c) => c.id === customerId) || customers[0];

  const complete = () => {
    if (!cart.length) return toast.error('Add at least one product');
    if (discountInvalid) return toast.error('Invalid discount value');
    if (cashShort) return toast.error('Cash received is less than the total');
    try {
      const sale = saleService.complete({ lines: cart, customer, branchId: posBranch, discountInput: { type: discType, value: dv }, paymentMethod: method, paid: method === 'Cash' ? rec : totals.total, cashier: user });
      toast.success(`Sale ${sale.invoice} completed successfully`);
      setReceipt(sale); setCart([]); setDiscVal(''); setReceived(''); setCustomerId('c0'); setMethod('Cash');
    } catch (err) { toast.error(err.message); }
  };

  const saveCustomer = (data) => { const c = customerService.create(data); setCustomerId(c.id); setNewCust(false); toast.success(`Customer ${c.name} added`); };
  const quick = [totals.total, Math.ceil(totals.total / 500) * 500, Math.ceil(totals.total / 1000) * 1000, Math.ceil(totals.total / 5000) * 5000].filter((v, i, a) => v > 0 && a.indexOf(v) === i);

  return (
    <div>
      <PageHeader title="POS & Billing" subtitle={`Selling from ${branches.find((b) => b.id === posBranch)?.name}`}
        actions={scope.branchId === 'all' && <SelectInput value={posBranch} onChange={(e) => { setBranchPick(e.target.value); setCart([]); }} aria-label="POS branch">{branches.filter((b) => b.status === 'Active').map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</SelectInput>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
        {/* products */}
        <div>
          <div className="card mb-4 grid gap-3 p-3 sm:grid-cols-2">
            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search name, SKU or barcode…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" /></div>
            <form onSubmit={scan} className="relative"><Barcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input ref={barcodeRef} className="input pl-9" placeholder="Scan / type barcode, press Enter" value={barcode} onChange={(e) => setBarcode(e.target.value)} aria-label="Barcode" /></form>
          </div>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {['All', ...CATEGORIES].map((c) => <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${cat === c ? 'bg-navy text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{c}</button>)}
          </div>
          {list.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
              {list.map((p) => {
                const out = p.stock <= 0;
                return (
                  <button key={p.id} disabled={out} onClick={() => add(p)} className={`card p-3 text-left transition ${out ? 'opacity-50' : 'hover:border-brand hover:shadow-pop'}`}>
                    <ProductThumb product={p} />
                    <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight">{p.name}</p>
                    <div className="mt-1 flex items-center justify-between"><span className="text-sm font-bold text-brand">{formatLKR(p.price, { decimals: 0 })}</span>
                      {out ? <Badge color="red">Out</Badge> : <span className={`text-xs ${p.stock <= p.minStock ? 'font-semibold text-orange-600' : 'text-slate-400'}`}>{p.stock} left</span>}</div>
                    {qtyInCart(p.id) > 0 && <span className="mt-1 inline-block rounded bg-blue-50 px-1.5 text-xs font-semibold text-brand">In cart: {qtyInCart(p.id)}</span>}
                  </button>
                );
              })}
            </div>
          ) : <div className="card"><EmptyState icon={PackageX} title="No products found" message="Try a different search or category." /></div>}
        </div>

        {/* cart */}
        <div className="card flex h-fit flex-col xl:sticky xl:top-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><h2 className="flex items-center gap-2 font-semibold"><ShoppingCart size={18} /> Current sale</h2>
            {cart.length > 0 && <button className="text-xs font-semibold text-red-600" onClick={() => setCart([])}>Clear</button>}</div>
          <div className="max-h-64 overflow-y-auto">
            {cart.length ? cart.map((l) => (
              <div key={l.productId} className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{l.name}</p><p className="text-xs text-slate-500">{formatLKR(l.price)} each</p></div>
                <div className="flex items-center gap-1">
                  <button className="rounded border border-slate-200 p-1 hover:bg-slate-100" onClick={() => setQty(l.productId, l.qty - 1)} aria-label="Decrease"><Minus size={12} /></button>
                  <span className="w-7 text-center text-sm font-semibold">{l.qty}</span>
                  <button className="rounded border border-slate-200 p-1 hover:bg-slate-100" onClick={() => setQty(l.productId, l.qty + 1)} aria-label="Increase"><Plus size={12} /></button>
                </div>
                <span className="w-20 text-right text-sm font-semibold">{formatLKR(l.qty * l.price, { decimals: 0 })}</span>
                <button className="text-slate-400 hover:text-red-600" onClick={() => setQty(l.productId, 0)} aria-label={`Remove ${l.name}`}><Trash2 size={14} /></button>
              </div>
            )) : <EmptyState icon={ShoppingCart} title="Cart is empty" message="Click a product or scan a barcode to start." />}
          </div>
          <div className="space-y-3 border-t border-slate-200 p-4">
            <div className="flex gap-2"><SelectInput value={customerId} onChange={(e) => setCustomerId(e.target.value)} aria-label="Customer">{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectInput>
              <button className="btn-outline px-3" onClick={() => setNewCust(true)} aria-label="Add new customer" title="Add new customer"><UserPlus size={16} /></button></div>
            <div className="flex gap-2">
              <SelectInput value={discType} onChange={(e) => setDiscType(e.target.value)} className="!w-28" aria-label="Discount type"><option value="percent">% off</option><option value="fixed">LKR off</option></SelectInput>
              <input type="number" min="0" className={`input ${discountInvalid ? 'input-error' : ''}`} placeholder="Discount" value={discVal} onChange={(e) => setDiscVal(e.target.value)} aria-label="Discount value" />
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatLKR(totals.subtotal)}</dd></div>
              {totals.discount > 0 && <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd className="text-green-600">-{formatLKR(totals.discount)}</dd></div>}
              {settings.tax.enabled && <div className="flex justify-between"><dt className="text-slate-500">{settings.tax.name} ({settings.tax.rate}%)</dt><dd>{formatLKR(totals.tax)}</dd></div>}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-navy"><dt>Total</dt><dd>{formatLKR(totals.total)}</dd></div>
            </dl>
            <div className="grid grid-cols-2 gap-2">
              {[['Cash', Banknote], ['Card', CreditCard]].map(([m, Icon]) => (
                <button key={m} onClick={() => setMethod(m)} className={`btn ${method === m ? 'bg-navy text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}><Icon size={16} /> {m}</button>
              ))}
            </div>
            {method === 'Cash' ? (
              <div>
                <input type="number" min="0" className="input" placeholder="Cash received" value={received} onChange={(e) => setReceived(e.target.value)} aria-label="Cash received" />
                {totals.total > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{quick.map((v) => <button key={v} className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50" onClick={() => setReceived(String(v))}>{formatLKR(v, { decimals: 0 })}</button>)}</div>}
                {rec > 0 && <p className={`mt-2 text-sm font-semibold ${cashShort ? 'text-red-600' : 'text-green-600'}`}>{cashShort ? `Short by ${formatLKR(-change)}` : `Change: ${formatLKR(change)}`}</p>}
              </div>
            ) : <p className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">Card payment is a demo simulation – no card is charged.</p>}
            <button className="btn-primary w-full py-3 text-base" onClick={complete} disabled={!cart.length}><CheckCircle2 size={18} /> Complete sale</button>
          </div>
        </div>
      </div>

      <Modal open={newCust} onClose={() => setNewCust(false)} title="Add new customer" footer={<><button className="btn-outline" onClick={() => setNewCust(false)}>Cancel</button><button className="btn-primary" type="submit" form="pos-customer">Save customer</button></>}>
        <CustomerForm id="pos-customer" onSave={saveCustomer} />
      </Modal>
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Sale completed" size="sm" footer={<button className="btn-outline" onClick={() => setReceipt(null)}>New sale</button>}>
        {receipt && <Receipt sale={receipt} />}
      </Modal>
    </div>
  );
}

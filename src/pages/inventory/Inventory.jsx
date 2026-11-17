import { useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, SlidersHorizontal, Upload, Package, History } from 'lucide-react';
import { PageHeader, SearchInput, DataTable, Badge, statusColor, Modal, ConfirmDialog, Field, TextInput, SelectInput, EmptyState, ProductThumb, Tabs } from '../../components/common/ui';
import { useStore } from '../../services/store';
import { useAuth, useToast } from '../../context/AppContext';
import { useScope } from '../../hooks/useScope';
import { productService, validateProduct } from '../../services/productService';
import { stockStatus } from '../../utils/analytics';
import { formatLKR, formatDateTime } from '../../utils/format';
import { CATEGORIES } from '../../data/seed';

const blank = (branchId) => ({ name: '', sku: '', barcode: '', category: '', cost: '', price: '', stock: '', minStock: '', supplier: '', supplierContact: '', branchId, emoji: '📦', imageUrl: '' });

export default function Inventory() {
  const products = useStore('products');
  const movements = useStore('movements');
  const branches = useStore('branches');
  const { user, can } = useAuth();
  const toast = useToast();
  const scope = useScope();
  const [tab, setTab] = useState('products');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [status, setStatus] = useState('All');
  const [form, setForm] = useState(null); // product being edited/created
  const [errors, setErrors] = useState({});
  const [view, setView] = useState(null);
  const [del, setDel] = useState(null);
  const [adj, setAdj] = useState(null);
  const [adjData, setAdjData] = useState({ delta: '', reason: '' });
  const fileRef = useRef(null);

  const bName = (id) => branches.find((b) => b.id === id)?.name || '—';
  const scoped = useMemo(() => products.filter((p) => scope.branchId === 'all' || p.branchId === scope.branchId), [products, scope.branchId]);
  const rows = useMemo(() => scoped.filter((p) => (cat === 'All' || p.category === cat)
    && (status === 'All' || stockStatus(p) === status)
    && (!q || [p.name, p.sku, p.barcode, p.supplier].some((x) => (x || '').toLowerCase().includes(q.toLowerCase())))), [scoped, q, cat, status]);
  const moves = useMemo(() => movements.filter((m) => scope.branchId === 'all' || m.branchId === scope.branchId).filter((m) => !q || `${m.productName} ${m.reason} ${m.type}`.toLowerCase().includes(q.toLowerCase())), [movements, scope.branchId, q]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = (e) => {
    e.preventDefault();
    const er = validateProduct(form, products);
    setErrors(er);
    if (Object.keys(er).length) return toast.error('Please fix the highlighted fields');
    if (form.id) { productService.update(form.id, form); toast.success('Product updated'); }
    else { productService.create({ ...form, barcode: form.barcode || String(Date.now()).slice(-12) }, user.name); toast.success('Product added'); }
    setForm(null);
  };
  const onImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/') || f.size > 300 * 1024) return toast.error('Choose an image under 300 KB');
    const r = new FileReader(); r.onload = () => setForm((x) => ({ ...x, imageUrl: r.result })); r.readAsDataURL(f);
  };
  const doDelete = () => { productService.remove(del.id); toast.success(`${del.name} deleted`); setDel(null); };
  const doAdjust = () => {
    try { productService.adjustStock(adj.id, Number(adjData.delta), adjData.reason, user.name); toast.success('Stock adjusted'); setAdj(null); setAdjData({ delta: '', reason: '' }); }
    catch (err) { toast.error(err.message); }
  };

  const canWrite = can('product.write');
  const columns = [
    { key: 'name', label: 'Product', render: (p) => <div className="flex items-center gap-3"><ProductThumb product={p} size="sm" /><div><p className="font-medium">{p.name}</p><p className="text-xs text-slate-500">{p.sku}</p></div></div> },
    { key: 'category', label: 'Category' },
    ...(scope.branchId === 'all' ? [{ key: 'branchId', label: 'Branch', sortValue: (p) => bName(p.branchId), render: (p) => <span className="text-xs">{bName(p.branchId)}</span> }] : []),
    { key: 'cost', label: 'Cost', render: (p) => formatLKR(p.cost, { decimals: 0 }) },
    { key: 'price', label: 'Price', render: (p) => formatLKR(p.price, { decimals: 0 }) },
    { key: 'stock', label: 'Stock', render: (p) => <span className="font-semibold">{p.stock}</span> },
    { key: 'status', label: 'Status', sortValue: (p) => stockStatus(p), render: (p) => <Badge color={statusColor(stockStatus(p))}>{stockStatus(p)}</Badge> },
    { key: 'actions', label: '', noSort: true, render: (p) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="btn-ghost btn-sm" title="Details" aria-label="View details" onClick={() => setView(p)}><Eye size={15} /></button>
        {can('stock.adjust') && <button className="btn-ghost btn-sm" title="Adjust stock" aria-label="Adjust stock" onClick={() => { setAdj(p); setAdjData({ delta: '', reason: '' }); }}><SlidersHorizontal size={15} /></button>}
        {canWrite && <button className="btn-ghost btn-sm" title="Edit" aria-label="Edit" onClick={() => { setForm({ ...p }); setErrors({}); }}><Pencil size={15} /></button>}
        {can('product.delete') && <button className="btn-ghost btn-sm text-red-600" title="Delete" aria-label="Delete" onClick={() => setDel(p)}><Trash2 size={15} /></button>}
      </div>) },
  ];

  const counts = { all: scoped.length, low: scoped.filter((p) => stockStatus(p) === 'Low Stock').length, out: scoped.filter((p) => stockStatus(p) === 'Out of Stock').length };
  const defaultBranch = scope.branchId === 'all' ? user.branchId : scope.branchId;

  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${counts.all} products · ${counts.low} low stock · ${counts.out} out of stock`}
        actions={canWrite && <button className="btn-primary" onClick={() => { setForm(blank(defaultBranch)); setErrors({}); }}><Plus size={16} /> Add product</button>} />
      <Tabs value={tab} onChange={(t) => { setTab(t); setQ(''); }} tabs={[{ id: 'products', label: 'Products' }, { id: 'movements', label: 'Stock movement history' }]} />
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <SearchInput className="flex-1" value={q} onChange={setQ} placeholder={tab === 'products' ? 'Search name, SKU, barcode, supplier…' : 'Search movements…'} />
          {tab === 'products' && <>
            <SelectInput value={cat} onChange={(e) => setCat(e.target.value)} className="sm:!w-44" aria-label="Category"><option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</SelectInput>
            <SelectInput value={status} onChange={(e) => setStatus(e.target.value)} className="sm:!w-40" aria-label="Status"><option>All</option><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option></SelectInput></>}
        </div>
        {tab === 'products'
          ? <DataTable columns={columns} rows={rows} onRowClick={setView} empty={<EmptyState icon={Package} title="No products found" message="Adjust your filters or add a new product." />} />
          : <DataTable rows={moves} initialSort={{ key: 'date', dir: 'desc' }} empty={<EmptyState icon={History} title="No movements" />} columns={[
            { key: 'date', label: 'Date', sortValue: (m) => new Date(m.date).getTime(), render: (m) => <span className="text-xs">{formatDateTime(m.date)}</span> },
            { key: 'productName', label: 'Product' },
            { key: 'type', label: 'Type', render: (m) => <Badge color={{ sale: 'blue', return: 'green', restock: 'cyan', adjustment: 'orange' }[m.type]}>{m.type}</Badge> },
            { key: 'qty', label: 'Qty', render: (m) => <span className={`font-semibold ${m.qty < 0 ? 'text-red-600' : 'text-green-600'}`}>{m.qty > 0 ? '+' : ''}{m.qty}</span> },
            { key: 'reason', label: 'Reason' }, { key: 'by', label: 'By' }]} />}
      </div>

      {/* add / edit */}
      <Modal open={!!form} onClose={() => setForm(null)} size="lg" title={form?.id ? 'Edit product' : 'Add product'}
        footer={<><button className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" type="submit" form="product-form">{form?.id ? 'Save changes' : 'Add product'}</button></>}>
        {form && (
          <form id="product-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Field label="Product name" required error={errors.name}><TextInput value={form.name} onChange={set('name')} error={errors.name} /></Field>
            <Field label="SKU" required error={errors.sku}><TextInput value={form.sku} onChange={set('sku')} error={errors.sku} /></Field>
            <Field label="Barcode" hint="Leave blank to auto-generate"><TextInput value={form.barcode} onChange={set('barcode')} /></Field>
            <Field label="Category" required error={errors.category}><SelectInput value={form.category} onChange={set('category')} error={errors.category}><option value="">Select…</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</SelectInput></Field>
            <Field label="Cost price (LKR)" required error={errors.cost}><TextInput type="number" min="0" step="0.01" value={form.cost} onChange={set('cost')} error={errors.cost} /></Field>
            <Field label="Selling price (LKR)" required error={errors.price}><TextInput type="number" min="0" step="0.01" value={form.price} onChange={set('price')} error={errors.price} /></Field>
            <Field label="Available quantity" required error={errors.stock} hint={form.id ? 'Prefer “Adjust stock” to keep a movement history' : undefined}><TextInput type="number" min="0" value={form.stock} onChange={set('stock')} error={errors.stock} /></Field>
            <Field label="Minimum stock level" required error={errors.minStock}><TextInput type="number" min="0" value={form.minStock} onChange={set('minStock')} error={errors.minStock} /></Field>
            <Field label="Supplier"><TextInput value={form.supplier} onChange={set('supplier')} /></Field>
            <Field label="Supplier contact"><TextInput value={form.supplierContact} onChange={set('supplierContact')} /></Field>
            <Field label="Branch" required error={errors.branchId}><SelectInput value={form.branchId} onChange={set('branchId')} disabled={!!form.id}>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</SelectInput></Field>
            <Field label="Icon / image">
              <div className="flex items-center gap-2"><TextInput value={form.emoji} onChange={set('emoji')} className="!w-16 text-center" maxLength={4} aria-label="Emoji" />
                <button type="button" className="btn-outline" onClick={() => fileRef.current.click()}><Upload size={14} /> Image</button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />
                {form.imageUrl && <button type="button" className="text-xs text-red-600" onClick={() => setForm({ ...form, imageUrl: '' })}>Remove</button>}</div>
            </Field>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      {/* details */}
      <Modal open={!!view} onClose={() => setView(null)} title="Product details" footer={<button className="btn-outline" onClick={() => setView(null)}>Close</button>}>
        {view && (() => { const p = products.find((x) => x.id === view.id) || view; const margin = p.price ? Math.round(((p.price - p.cost) / p.price) * 100) : 0; return (
          <div className="space-y-4">
            <div className="flex items-center gap-4"><div className="w-24"><ProductThumb product={p} size="lg" /></div><div><h3 className="text-lg font-semibold">{p.name}</h3><Badge color={statusColor(stockStatus(p))}>{stockStatus(p)}</Badge></div></div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[['SKU', p.sku], ['Barcode', p.barcode], ['Category', p.category], ['Branch', bName(p.branchId)], ['Cost price', formatLKR(p.cost)], ['Selling price', formatLKR(p.price)], ['Margin', `${margin}%`], ['Available', p.stock], ['Minimum level', p.minStock], ['Supplier', p.supplier || '—'], ['Supplier contact', p.supplierContact || '—']].map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
            <div><h4 className="mb-2 text-sm font-semibold">Recent stock movements</h4>
              {movements.filter((m) => m.productId === p.id).slice(0, 5).map((m) => <div key={m.id} className="flex justify-between border-b border-slate-100 py-1.5 text-xs"><span>{formatDateTime(m.date)} · {m.reason}</span><span className={m.qty < 0 ? 'text-red-600' : 'text-green-600'}>{m.qty > 0 ? '+' : ''}{m.qty}</span></div>)}
              {!movements.some((m) => m.productId === p.id) && <p className="text-xs text-slate-400">No movements recorded.</p>}</div>
          </div>); })()}
      </Modal>

      {/* adjust */}
      <Modal open={!!adj} onClose={() => setAdj(null)} size="sm" title={`Adjust stock – ${adj?.name || ''}`} footer={<><button className="btn-outline" onClick={() => setAdj(null)}>Cancel</button><button className="btn-primary" onClick={doAdjust}>Apply adjustment</button></>}>
        <div className="space-y-4"><p className="text-sm text-slate-500">Current stock: <b>{adj?.stock}</b>. Use a negative number to remove stock.</p>
          <Field label="Quantity change" required><TextInput type="number" value={adjData.delta} onChange={(e) => setAdjData({ ...adjData, delta: e.target.value })} placeholder="e.g. 20 or -3" /></Field>
          <Field label="Reason" required><SelectInput value={adjData.reason} onChange={(e) => setAdjData({ ...adjData, reason: e.target.value })}><option value="">Select reason…</option>{['Supplier delivery', 'Stock count correction', 'Damaged items', 'Expired items', 'Theft / loss', 'Transfer between branches', 'Other'].map((r) => <option key={r}>{r}</option>)}</SelectInput></Field></div>
      </Modal>
      <ConfirmDialog open={!!del} title="Delete product" message={`Delete “${del?.name}”? Past sales keep their records, but this product can no longer be sold.`} confirmLabel="Delete" onConfirm={doDelete} onCancel={() => setDel(null)} />
    </div>
  );
}

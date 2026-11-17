import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ShoppingCart, Package, Users, UserCog, BarChart3, Sparkles, GitBranch, Cloud, Headphones, Plug, Settings2, Receipt } from 'lucide-react';
import { plans } from '../../data/plans';
import { Modal } from '../../components/common/ui';
import DemoRequestForm from '../../components/forms/DemoRequestForm';

export const featureList = [
  [ShoppingCart, 'POS & Billing', 'Fast checkout with barcode search, discounts, tax, cash/card payments and printable receipts.'],
  [Package, 'Inventory Management', 'Track stock, SKUs, suppliers and movement history with automatic low-stock indicators.'],
  [Users, 'Customer Management', 'Keep customer profiles and full purchase history in one place.'],
  [UserCog, 'Employee & Roles', 'Role-based access for owners, managers, cashiers and staff.'],
  [BarChart3, 'Reports & Analytics', 'Daily to annual sales, product, inventory, customer and profit reports with CSV export.'],
  [Sparkles, 'Nexus Insight Assistant', 'Rule-based business insights: low stock, slow movers, trends and reorder suggestions.'],
  [GitBranch, 'Multi-Branch', 'Manage several outlets and compare branch performance.'],
  [Cloud, 'Cloud Data & Monitoring', 'Centralised data, backup history and system health overview.'],
  [Settings2, 'Customization', 'Adapt receipts, tax, currency and business profile to your needs.'],
  [Plug, 'Integrations', 'Connect third-party tools through our integration service.'],
  [Headphones, 'Customer Support', 'Onboarding, training and ongoing support from a local team.'],
  [Receipt, 'Returns & Refunds', 'Process returns that restore stock and update your reports.'],
];

export function Section({ title, subtitle, children, tone = 'white' }) {
  return (
    <section className={tone === 'gray' ? 'bg-surface' : 'bg-white'}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {title && <div className="mx-auto mb-10 max-w-2xl text-center"><h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>{subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}</div>}
        {children}
      </div>
    </section>
  );
}

export function PricingCards({ onSelect }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((p) => (
        <div key={p.id} className={`card relative flex flex-col p-6 ${p.popular ? 'border-brand ring-2 ring-brand/20' : ''}`}>
          {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
          <h3 className="text-lg font-semibold">{p.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{p.tagline}</p>
          <p className="mt-4"><span className="text-3xl font-extrabold text-navy">LKR {p.price.toLocaleString()}</span><span className="text-sm text-slate-500"> /month</span></p>
          <ul className="my-6 flex-1 space-y-2.5">
            {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-green-600" />{f}</li>)}
          </ul>
          <button className={p.popular ? 'btn-primary' : 'btn-outline'} onClick={() => onSelect(p.id)}>Request Demo</button>
        </div>
      ))}
    </div>
  );
}

export function FAQ({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {items.map(([q, a], i) => (
        <div key={q}>
          <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {q}<ChevronDown size={18} className={`shrink-0 transition ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && <p className="px-5 pb-4 text-sm text-slate-600">{a}</p>}
        </div>
      ))}
    </div>
  );
}

export function DemoModal({ open, onClose, plan }) {
  return <Modal open={open} onClose={onClose} title="Request a Demo / Subscription"><DemoRequestForm key={plan} defaultPlan={plan} /></Modal>;
}

export function CTA({ onDemo }) {
  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
        <h2 className="text-2xl font-bold !text-white sm:text-3xl">Ready to run your business smarter?</h2>
        <p className="mt-3 text-slate-300">Try the live demo or ask our team for a guided walkthrough.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="btn-primary">Try the Demo</Link>
          <button onClick={onDemo} className="btn bg-white text-navy hover:bg-slate-100">Request a Demo</button>
        </div>
      </div>
    </div>
  );
}

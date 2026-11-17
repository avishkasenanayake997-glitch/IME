import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Wallet, Zap, ShieldCheck, Languages, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { Section, featureList, PricingCards, FAQ, DemoModal, CTA } from './shared';
import { sectors, faqs, testimonials } from '../../data/plans';

export default function Home() {
  const [demo, setDemo] = useState({ open: false, plan: 'business' });
  const openDemo = (plan = 'business') => setDemo({ open: true, plan });
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-800 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-accent">Built for Sri Lankan MSMEs</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight !text-white sm:text-5xl">Manage Your Business Smarter with Nexus</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">Replace handwritten records, spreadsheets and disconnected apps with one affordable platform for sales, inventory, customers, staff and insights.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pricing" className="btn-primary px-6 py-3">Get Started <ArrowRight size={16} /></Link>
              <button onClick={() => openDemo()} className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">Request a Demo</button>
            </div>
            <p className="mt-4 text-xs text-slate-400">Plans from LKR 5,000 / month · No payment taken in this demo</p>
          </div>
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="rounded-2xl border border-white/10 bg-white p-5 text-ink shadow-pop">
              <div className="mb-4 flex items-center justify-between"><span className="text-sm font-semibold text-navy">Today's Revenue</span><span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">+12.4%</span></div>
              <div className="text-3xl font-bold text-navy">LKR 148,250</div>
              <div className="mt-4 flex h-24 items-end gap-2">{[40, 62, 48, 75, 58, 90, 70, 100].map((h, i) => <div key={i} className="flex-1 rounded-t bg-brand/80" style={{ height: `${h}%` }} />)}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3"><ShoppingCart size={16} className="text-brand" /> 42 orders</div>
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-orange-700"><Package size={16} /> 3 low-stock alerts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section title="Everything your business needs in one platform" subtitle="Designed around how small and medium businesses in Sri Lanka actually work.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featureList.slice(0, 8).map(([Icon, t, d]) => (
            <div key={t} className="card p-5 transition hover:shadow-pop">
              <div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2.5 text-brand"><Icon size={20} /></div>
              <h3 className="font-semibold">{t}</h3><p className="mt-1.5 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center"><Link to="/features" className="btn-outline">See all features</Link></div>
      </Section>

      <Section tone="gray" title="Business sectors we support">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {sectors.map(([e, n]) => <div key={n} className="card flex items-center gap-3 p-4"><span className="text-2xl">{e}</span><span className="text-sm font-medium">{n}</span></div>)}
        </div>
      </Section>

      <Section title="Why choose Nexus">
        <div className="grid gap-6 md:grid-cols-3">
          {[[Wallet, 'Affordable for MSMEs', 'Transparent monthly plans starting at LKR 5,000 – no heavy ERP price tag.'], [Zap, 'Simple & fast', 'Clean interface your team can learn in an afternoon, with onboarding support.'], [TrendingUp, 'Insights, not just records', 'Nexus Insight Assistant turns your data into clear next actions.'], [ShieldCheck, 'Built for growth', 'Add staff roles and branches as your business expands.'], [BadgeCheck, 'Local support', 'Sri Lankan team, LKR pricing and local business practices in mind.'], [Languages, 'One platform', 'No more juggling notebooks, spreadsheets and separate apps.']].map(([Icon, t, d]) => (
            <div key={t} className="flex gap-4"><div className="h-fit rounded-lg bg-cyan-50 p-2.5 text-accent"><Icon size={20} /></div><div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div></div>
          ))}
        </div>
      </Section>

      <Section tone="gray" title="How it works">
        <div className="grid gap-6 md:grid-cols-4">
          {[['Choose a plan', 'Pick the package that fits your business.'], ['Onboarding & migration', 'We set up your products, users and import existing data.'], ['Start selling', 'Bill customers, track stock and manage staff.'], ['Grow with insights', 'Use reports and the Insight Assistant to make decisions.']].map(([t, d], i) => (
            <div key={t} className="card p-5"><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section title="Simple, transparent pricing" subtitle="Monthly subscription plans in Sri Lankan Rupees.">
        <PricingCards onSelect={openDemo} />
        <div className="mt-6 text-center"><Link to="/pricing" className="text-sm font-semibold text-brand">Compare plans & services →</Link></div>
      </Section>

      <Section tone="gray" title="What customers say" subtitle="Demo content – illustrative testimonials, not real customers.">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="card p-5">
              <span className="mb-3 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">Demo content</span>
              <blockquote className="text-sm text-slate-700">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-sm"><span className="font-semibold">{t.name}</span><span className="block text-xs text-slate-500">{t.role}</span></figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Frequently asked questions"><FAQ items={faqs} /></Section>
      <CTA onDemo={() => openDemo()} />
      <DemoModal open={demo.open} plan={demo.plan} onClose={() => setDemo({ ...demo, open: false })} />
    </>
  );
}

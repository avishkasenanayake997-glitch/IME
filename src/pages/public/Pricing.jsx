import { useState } from 'react';
import { Section, PricingCards, FAQ, DemoModal } from './shared';
import { services, faqs } from '../../data/plans';

export default function Pricing() {
  const [demo, setDemo] = useState({ open: false, plan: 'business' });
  return (
    <>
      <div className="bg-navy py-14 text-center"><h1 className="text-3xl font-bold !text-white">Pricing</h1><p className="mx-auto mt-3 max-w-2xl px-4 text-slate-300">Choose a monthly plan, then add services as you need them. Submit a demo subscription request – no payment is processed.</p></div>
      <Section><PricingCards onSelect={(plan) => setDemo({ open: true, plan })} /></Section>
      <Section tone="gray" title="Additional services" subtitle="Optional services to get you live faster and keep you running smoothly. Quoted per business.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => <div key={s.title} className="card p-5"><h3 className="font-semibold">{s.title}</h3><p className="mt-1.5 text-sm text-slate-600">{s.text}</p><button className="mt-3 text-sm font-semibold text-brand" onClick={() => setDemo({ open: true, plan: 'business' })}>Ask about this →</button></div>)}
        </div>
      </Section>
      <Section title="Pricing FAQ"><FAQ items={faqs} /></Section>
      <DemoModal open={demo.open} plan={demo.plan} onClose={() => setDemo({ ...demo, open: false })} />
    </>
  );
}

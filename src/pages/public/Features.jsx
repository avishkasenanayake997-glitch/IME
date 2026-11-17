import { useState } from 'react';
import { Section, featureList, CTA, DemoModal } from './shared';

export default function Features() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-navy py-14 text-center"><h1 className="text-3xl font-bold !text-white">Platform Features</h1><p className="mx-auto mt-3 max-w-2xl px-4 text-slate-300">A complete toolkit for managing sales, stock, people and growth.</p></div>
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map(([Icon, t, d]) => (
            <div key={t} className="card p-6 transition hover:shadow-pop">
              <div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2.5 text-brand"><Icon size={22} /></div>
              <h3 className="font-semibold">{t}</h3><p className="mt-1.5 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
        <div className="card mt-10 border-cyan-200 bg-cyan-50/50 p-6">
          <h3 className="font-semibold">About the Nexus Insight Assistant</h3>
          <p className="mt-2 text-sm text-slate-600">The current version generates rule-based insights calculated directly from your sales and inventory data (low stock, slow movers, trends and reorder quantities). It is architected so a true AI model can be integrated in future; no AI service is connected today.</p>
        </div>
      </Section>
      <CTA onDemo={() => setOpen(true)} />
      <DemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

import { useState } from 'react';
import { Target, Eye, HeartHandshake } from 'lucide-react';
import { Section, CTA, DemoModal } from './shared';
import { sectors } from '../../data/plans';

export default function About() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-navy py-14 text-center"><h1 className="text-3xl font-bold !text-white">About Nexus Smart Business Solutions</h1><p className="mx-auto mt-3 max-w-2xl px-4 text-slate-300">A Sri Lankan technology startup making business management software affordable for MSMEs.</p></div>
      <Section>
        <div className="mx-auto max-w-3xl space-y-4 text-slate-600">
          <p>Many Sri Lankan Micro, Small and Medium-sized Enterprises still rely on handwritten records, spreadsheets and disconnected applications. This makes it hard to know what is selling, what is running out and how the business is really performing.</p>
          <p>Nexus brings sales, inventory, customers, employees and reporting into one centralised platform, priced for small businesses, and adds the Nexus Insight Assistant to turn everyday data into clear recommendations.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[[Target, 'Our mission', 'Give every Sri Lankan MSME access to professional, affordable business management tools.'], [Eye, 'Our vision', 'A digitally empowered local business community making data-driven decisions.'], [HeartHandshake, 'Our approach', 'Simple software, local onboarding and support, and services such as migration and customization.']].map(([Icon, t, d]) => (
            <div key={t} className="card p-6"><div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2.5 text-brand"><Icon size={22} /></div><h3 className="font-semibold">{t}</h3><p className="mt-1.5 text-sm text-slate-600">{d}</p></div>
          ))}
        </div>
      </Section>
      <Section tone="gray" title="Who we serve">
        <div className="flex flex-wrap justify-center gap-3">{sectors.map(([e, n]) => <span key={n} className="card px-4 py-2 text-sm font-medium">{e} {n}</span>)}</div>
        <p className="mt-8 text-center text-xs text-slate-400">Prepared for the Innovation Management and Entrepreneurship (IT4050) project.</p>
      </Section>
      <CTA onDemo={() => setOpen(true)} />
      <DemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

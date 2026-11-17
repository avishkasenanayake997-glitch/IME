import { useMemo, useState } from 'react';
import { PRESETS, getRange } from '../../utils/analytics';
import { toISODate } from '../../utils/format';

export function useDateRange(initial = '30d') {
  const [preset, setPreset] = useState(initial);
  const [custom, setCustom] = useState({ from: toISODate(new Date(Date.now() - 29 * 864e5)), to: toISODate(new Date()) });
  const invalid = preset === 'custom' && custom.from > custom.to;
  const range = useMemo(() => getRange(preset, invalid ? {} : custom), [preset, custom, invalid]);
  return { preset, setPreset, custom, setCustom, range, invalid };
}

export default function DateFilter({ state, presets = PRESETS }) {
  const { preset, setPreset, custom, setCustom, invalid } = state;
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap rounded-lg border border-slate-200 bg-white p-0.5">
        {presets.map((p) => (
          <button key={p.id} onClick={() => setPreset(p.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${preset === p.id ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p.label}</button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input type="date" className="input w-auto py-1.5" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} aria-label="From date" />
          <span className="text-xs text-slate-400">to</span>
          <input type="date" className="input w-auto py-1.5" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} aria-label="To date" />
          {invalid && <span className="text-xs text-red-600">Start date is after end date</span>}
        </div>
      )}
    </div>
  );
}

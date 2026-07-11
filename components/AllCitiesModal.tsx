import React, { useMemo, useState } from "react";
import type { CityOption } from "./SearchBar";

interface Props {
  open: boolean;
  onClose: () => void;
  cities: CityOption[];
  onSelect: (name: string) => void;
}

export const AllCitiesModal: React.FC<Props> = ({ open, onClose, cities, onSelect }) => {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);

  const regions = useMemo(() => {
    const s = new Set<string>();
    for (const c of cities) if (c.region) s.add(c.region);
    return Array.from(s).sort();
  }, [cities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cities.filter((c) => {
      if (region && c.region !== region) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
    });
  }, [cities, query, region]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">All covered cities</h3>
          <button onClick={onClose} className="text-sm text-slate-500">Close</button>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities"
            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setRegion(null)}
              className={`rounded-full px-3 py-1 text-sm ${region === null ? 'bg-slate-900 text-white' : 'border'}`}
            >
              All
            </button>
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-full px-3 py-1 text-sm ${region === r ? 'bg-slate-900 text-white' : 'border'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelect(c.name)}
              className="w-full rounded-lg border border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.country}</div>
                </div>
                <div className="text-xs text-slate-500">{c.region ?? ''}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCitiesModal;

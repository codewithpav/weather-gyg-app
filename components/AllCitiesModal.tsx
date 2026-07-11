import React from "react";
import type { CityOption } from "./SearchBar";

interface Props {
  open: boolean;
  onClose: () => void;
  cities: CityOption[];
  onSelect: (name: string) => void;
}

export const AllCitiesModal: React.FC<Props> = ({ open, onClose, cities, onSelect }) => {
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

        <div className="grid gap-2 sm:grid-cols-2">
          {cities.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelect(c.name)}
              className="w-full rounded-lg border border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{c.name}</span>
                <span className="text-xs text-slate-400">{c.country}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCitiesModal;

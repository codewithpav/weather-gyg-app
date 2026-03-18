import React from "react";

interface OutfitItem {
  icon: string;
  label: string;
  note?: string;
}

interface OutfitCardProps {
  headline: string;
  explanation: string;
  items: OutfitItem[];
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  headline,
  explanation,
  items,
}) => {
  return (
    <section className="rounded-3xl bg-white shadow-sm border border-slate-100 p-5 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
        <span className="text-xl">🧥</span>
        <span>What to wear</span>
      </h2>
      <p className="mt-2 text-sm text-slate-500">{headline}</p>
      <p className="mt-1 text-xs text-slate-400">{explanation}</p>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-2"
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {item.label}
              </p>
              {item.note && (
                <p className="text-xs text-slate-500">{item.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};


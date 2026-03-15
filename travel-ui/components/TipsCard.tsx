import React from "react";

interface TipsCardProps {
  title?: string;
  icon?: string;
  tips: string[];
}

export const TipsCard: React.FC<TipsCardProps> = ({
  title = "Hidden local tips",
  icon = "✨",
  tips,
}) => {
  return (
    <section className="rounded-3xl bg-slate-900 text-slate-50 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="relative">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span>{title}</span>
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Little things locals know that make your day smoother.
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {tips.map((tip, idx) => (
            <li
              key={idx}
              className="flex gap-3 rounded-2xl bg-white/5 px-3 py-2"
            >
              <span className="mt-0.5 text-slate-300 text-xs">•</span>
              <span className="text-slate-100">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};


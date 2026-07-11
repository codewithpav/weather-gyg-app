import React from "react";
import { VIBES, type Vibe } from "../lib/content/types";

const VIBE_LABELS: Record<Vibe, string> = {
  chill: "Chill",
  history: "History",
  walks: "Walks",
  food: "Food",
  instagrammable: "Photogenic",
  indoor: "Indoor",
  night: "Nightlife",
};

interface VibeChipsProps {
  selected: Vibe[];
  onToggle: (vibe: Vibe) => void;
  size?: "sm" | "md";
  align?: "center" | "start";
}

export const VibeChips: React.FC<VibeChipsProps> = ({
  selected,
  onToggle,
  size = "md",
  align = "center",
}) => {
  const pad = size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const justify = align === "start" ? "justify-start" : "justify-center";
  return (
    <div className={`flex flex-wrap items-center gap-2 ${justify}`}>
      {VIBES.map((vibe) => {
        const active = selected.includes(vibe);
        return (
          <button
            key={vibe}
            type="button"
            onClick={() => onToggle(vibe)}
            className={`rounded-full font-medium transition-all ${pad} ${
              active
                ? "bg-brand-600 text-white shadow-sm shadow-brand-600/20"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-black/[0.06] hover:ring-brand-300 hover:text-slate-900"
            }`}
          >
            {VIBE_LABELS[vibe]}
          </button>
        );
      })}
    </div>
  );
};

import React from "react";
import { VIBES, type Vibe } from "../lib/content/types";

const VIBE_LABELS: Record<Vibe, string> = {
  chill: "Chill",
  history: "History",
  walks: "Walks",
  food: "Food",
  instagrammable: "Instagrammable",
  indoor: "Indoor",
  night: "Night",
};

interface VibeChipsProps {
  selected: Vibe[];
  onToggle: (vibe: Vibe) => void;
  size?: "sm" | "md";
}

export const VibeChips: React.FC<VibeChipsProps> = ({ selected, onToggle, size = "md" }) => {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs sm:text-sm";
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {VIBES.map((vibe) => {
        const active = selected.includes(vibe);
        return (
          <button
            key={vibe}
            type="button"
            onClick={() => onToggle(vibe)}
            className={`rounded-full border transition-colors ${pad} ${
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white/80 text-slate-700 hover:bg-white"
            }`}
          >
            {VIBE_LABELS[vibe]}
          </button>
        );
      })}
    </div>
  );
};

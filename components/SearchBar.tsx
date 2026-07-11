import React, { useMemo, useRef, useState } from "react";

export interface CityOption {
  slug: string;
  name: string;
  country: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value?: string) => void;
  placeholder?: string;
  cities?: CityOption[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Where are you today?",
  cities = [],
}) => {
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>();

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return cities
      .filter(
        (c) =>
          c.name.toLowerCase().startsWith(q) ||
          c.country.toLowerCase().startsWith(q)
      )
      .slice(0, 6);
  }, [value, cities]);

  const showDropdown = focused && matches.length > 0 && value.trim().length > 0;

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-full shadow-sm px-4 py-2 border border-slate-200 focus-within:border-slate-400 focus-within:shadow-md transition-all">
        <span className="text-slate-400 text-lg">🔍</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 150);
          }}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base"
        />
        <button
          onClick={() => onSubmit()}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-4 py-1.5 text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Plan my day
        </button>
      </div>

      {showDropdown && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          {matches.map((c) => (
            <button
              key={c.slug}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(c.name);
                onSubmit(c.name);
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-50"
            >
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-slate-400">{c.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
    <div className="relative mx-auto w-full max-w-xl">
      <div className="card-elevated flex items-center gap-3 rounded-full border border-black/[0.05] bg-white py-2 pl-6 pr-2 transition-shadow focus-within:shadow-lg">
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
          className="flex-1 bg-transparent py-2 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          onClick={() => onSubmit()}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Plan my day
        </button>
      </div>

      {showDropdown && (
        <div className="card-elevated absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-black/[0.05] bg-white">
          {matches.map((c) => (
            <button
              key={c.slug}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(c.name);
                onSubmit(c.name);
              }}
              className="flex w-full items-center justify-between px-5 py-3 text-left text-sm text-slate-800 transition-colors hover:bg-slate-50"
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

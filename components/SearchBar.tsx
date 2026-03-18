import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  suggestions?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search for a city…",
  suggestions = [],
}) => {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-full shadow-sm px-4 py-2 border border-slate-200">
        <span className="text-slate-400 text-lg">🔍</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base"
        />
        <button
          onClick={onSubmit}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-4 py-1.5 text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Plan my day
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm text-slate-500">
          <span className="text-slate-400">Try:</span>
          {suggestions.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onChange(city)}
              className="px-3 py-1 rounded-full bg-white/60 border border-slate-200 hover:border-slate-400 hover:bg-white transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


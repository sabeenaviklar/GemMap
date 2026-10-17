"use client";

import React, { useState } from "react";
import { Search, Sparkles, X, ArrowRight, CornerDownLeft } from "lucide-react";
import { ParsedSearchFilters } from "@/lib/nlpSearch";

interface NaturalSearchBarProps {
  initialQuery?: string;
  onSearch: (query: string, parsed?: ParsedSearchFilters) => void;
  parsedChips?: ParsedSearchFilters["chips"];
  onRemoveChip?: (chipId: string) => void;
  placeholder?: string;
}

export default function NaturalSearchBar({
  initialQuery = "",
  onSearch,
  parsedChips = [],
  onRemoveChip,
  placeholder = "Try: 'cheap quiet place to study near Andheri under 150' or 'sunset viewpoint'...",
}: NaturalSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      onSearch("");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        onSearch(query, data.parsed);
      } else {
        onSearch(query);
      }
    } catch {
      onSearch(query);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="w-full space-y-2.5">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
      >
        <div className="pl-4 text-brand-600 dark:text-brand-400">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />

        <div className="pr-2 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-700 hover:opacity-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            {loading ? (
              <span className="animate-spin text-xs">🌀</span>
            ) : (
              <>
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Removable detected filter chips */}
      {parsedChips && parsedChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Detected Filters:
          </span>
          {parsedChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-500/20"
            >
              <span>{chip.label}</span>
              {onRemoveChip && (
                <button
                  type="button"
                  onClick={() => onRemoveChip(chip.id)}
                  className="hover:text-red-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

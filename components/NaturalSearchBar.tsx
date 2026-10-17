"use client";

import React, { useState } from "react";
import { Search, Sparkles, X, ArrowRight } from "lucide-react";
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
  placeholder = "Enter a locality or query to find local secrets (e.g. cheap quiet place to study near Bandra under 150)...",
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
        className="relative flex items-center w-full rounded-full bg-white dark:bg-slate-900 border border-[#E2DDD4] dark:border-slate-800 shadow-sm focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-500/15 transition-all p-1.5"
      >
        <div className="pl-4 text-slate-400">
          <Search className="w-5 h-5 text-slate-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-transparent text-sm text-ink-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />

        <div className="pr-1 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Theme Signature Circular Search Button */}
          <button
            type="submit"
            disabled={loading}
            aria-label="Search"
            className="w-10 h-10 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white flex items-center justify-center transition-all shadow-sm hover:scale-105 shrink-0"
          >
            {loading ? (
              <span className="animate-spin text-xs">🌀</span>
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Removable detected filter chips */}
      {parsedChips && parsedChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 px-2">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-terracotta-500" /> Detected Filters:
          </span>
          {parsedChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E2F3F0] text-brand-700 border border-[#B4DDD6]"
            >
              <span>{chip.label}</span>
              {onRemoveChip && (
                <button
                  type="button"
                  onClick={() => onRemoveChip(chip.id)}
                  className="hover:text-red-600 ml-0.5"
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

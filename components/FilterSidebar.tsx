"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Navigation,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";

export interface FilterState {
  category: string;
  maxPrice: number;
  vibe: string[];
  amenities: string[];
  locality: string;
  openNow: boolean;
  sortBy: "hiddenGemScore" | "nearest" | "cheapest" | "newest" | "rating";
  userCoords: [number, number] | null; // [lat, lng]
  maxDistanceKm: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

const CATEGORIES = [
  { id: "all", label: "All Spots", emoji: "✨" },
  { id: "food", label: "Food & Drink", emoji: "🍜" },
  { id: "study", label: "Study Spaces", emoji: "📚" },
  { id: "viewpoint", label: "Outdoors & Views", emoji: "🌅" },
  { id: "thrift", label: "Shopping & Vintage", emoji: "🛍️" },
  { id: "hangout", label: "Arts & Culture", emoji: "☕" },
];

const VIBE_OPTIONS = [
  { id: "quiet", label: "Quiet Spot" },
  { id: "scenic", label: "Scenic View" },
  { id: "aesthetic", label: "Aesthetic" },
  { id: "late-night", label: "Late-Night" },
  { id: "solo-friendly", label: "Solo-Friendly" },
  { id: "family-friendly", label: "Family-Friendly" },
  { id: "budget", label: "Local Food" },
  { id: "crowded", label: "Historic" },
];

const AMENITY_OPTIONS = [
  { id: "Wi-Fi", label: "Free Wi-Fi" },
  { id: "Power Outlets", label: "Power Plugs" },
  { id: "Seating", label: "Comfortable Seating" },
  { id: "Washroom", label: "Clean Washroom" },
  { id: "AC", label: "Air Conditioning" },
];

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  totalResults,
}: FilterSidebarProps) {
  const [locating, setLocating] = useState(false);

  const handleCategorySelect = (catId: string) => {
    onChange({ ...filters, category: catId });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, maxPrice: Number(e.target.value) });
  };

  const toggleVibe = (vibeId: string) => {
    const exists = filters.vibe.includes(vibeId);
    const updated = exists
      ? filters.vibe.filter((v) => v !== vibeId)
      : [...filters.vibe, vibeId];
    onChange({ ...filters, vibe: updated });
  };

  const toggleAmenity = (amenityId: string) => {
    const exists = filters.amenities.includes(amenityId);
    const updated = exists
      ? filters.amenities.filter((a) => a !== amenityId)
      : [...filters.amenities, amenityId];
    onChange({ ...filters, amenities: updated });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...filters,
          userCoords: [pos.coords.latitude, pos.coords.longitude],
          sortBy: "nearest",
        });
        setLocating(false);
      },
      (err) => {
        alert("Location error: " + err.message);
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <aside className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-[#EAE5DD] dark:border-slate-800 p-5 space-y-5 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE9] dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-ink-900 dark:text-white text-sm">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <span>Filters & Discovery</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E2F3F0] text-brand-700">
            {totalResults}
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-terracotta-500 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Sort By Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({
              ...filters,
              sortBy: e.target.value as FilterState["sortBy"],
            })
          }
          className="w-full text-xs font-semibold rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#EAE5DD] dark:border-slate-700 py-2.5 px-3 text-ink-900 dark:text-white focus:outline-none"
        >
          <option value="hiddenGemScore">✨ Highest Hidden Gem Score</option>
          <option value="nearest">📍 Nearest to Me</option>
          <option value="cheapest">💰 Price: Low to High</option>
          <option value="rating">⭐ Highest Rated</option>
          <option value="newest">🕒 Recently Added</option>
        </select>
      </div>

      {/* Categories in Pill format */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filters.category === cat.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-[#EFECE6] dark:bg-slate-800 text-ink-700 dark:text-slate-300 hover:bg-[#E5DFC]"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Max Budget
          </label>
          <span className="font-extrabold text-terracotta-600 text-sm">
            {filters.maxPrice >= 500 ? "Any Budget" : `≤ ₹${filters.maxPrice}`}
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="500"
          step="25"
          value={filters.maxPrice}
          onChange={handlePriceChange}
          className="w-full accent-terracotta-500 h-1.5 bg-[#EAE5DD] dark:bg-slate-700 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>₹50</span>
          <span>₹250</span>
          <span>₹500+</span>
        </div>
      </div>

      {/* Location & Distance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Distance & Area
          </label>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locating}
            className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
          >
            <Navigation className={`w-3 h-3 ${locating ? "animate-spin" : ""}`} />
            {filters.userCoords ? "GPS Active" : "Use GPS"}
          </button>
        </div>

        <div className="relative">
          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Locality e.g. Bandra, Fort, Versova..."
            value={filters.locality}
            onChange={(e) => onChange({ ...filters, locality: e.target.value })}
            className="w-full text-xs rounded-xl pl-8 pr-3 py-2 bg-[#FAF7F2] dark:bg-slate-800 border border-[#EAE5DD] dark:border-slate-700 text-ink-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Vibe Tags Pills */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Vibes & Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {VIBE_OPTIONS.map((v) => {
            const selected = filters.vibe.includes(v.id);
            return (
              <button
                key={v.id}
                onClick={() => toggleVibe(v.id)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                  selected
                    ? "bg-terracotta-500 text-white font-bold shadow-sm"
                    : "bg-[#EFECE6] dark:bg-slate-800 text-ink-700 dark:text-slate-300 hover:bg-[#E5DFC]"
                }`}
              >
                #{v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Amenities
        </label>
        <div className="space-y-1.5">
          {AMENITY_OPTIONS.map((am) => {
            const checked = filters.amenities.includes(am.id);
            return (
              <label
                key={am.id}
                className="flex items-center gap-2 text-xs text-ink-700 dark:text-slate-300 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(am.id)}
                  className="rounded border-[#EAE5DD] text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span>{am.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Open Now Toggle */}
      <div className="pt-2 border-t border-[#F2EFE9] dark:border-slate-800">
        <label className="flex items-center justify-between text-xs font-semibold text-ink-800 dark:text-slate-200 cursor-pointer">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            Open Now Only
          </span>
          <input
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) => onChange({ ...filters, openNow: e.target.checked })}
            className="rounded border-[#EAE5DD] text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>
    </aside>
  );
}

"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Map as MapIcon,
  List as ListIcon,
  SlidersHorizontal,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import PlaceCard from "@/components/PlaceCard";
import FilterSidebar, { FilterState } from "@/components/FilterSidebar";
import DynamicMap from "@/components/Map/DynamicMap";
import NaturalSearchBar from "@/components/NaturalSearchBar";
import { ParsedSearchFilters } from "@/lib/nlpSearch";

function ExploreContent() {
  const searchParams = useSearchParams();

  // Initial state derived from query params
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 500;
  const initialSort = (searchParams.get("sort") as FilterState["sortBy"]) || "hiddenGemScore";

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    maxPrice: initialMaxPrice,
    vibe: [],
    amenities: [],
    locality: "",
    openNow: false,
    sortBy: initialSort,
    userCoords: null,
    maxDistanceKm: 25,
  });

  const [rawSearchQuery, setRawSearchQuery] = useState(initialSearch);
  const [parsedChips, setParsedChips] = useState<ParsedSearchFilters["chips"]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Mobile view toggle: "list" | "map"
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch places based on active filters
  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.category && filters.category !== "all") {
        params.set("category", filters.category);
      }
      if (filters.maxPrice < 500) {
        params.set("maxPrice", filters.maxPrice.toString());
      }
      if (filters.vibe.length > 0) {
        params.set("vibe", filters.vibe.join(","));
      }
      if (filters.amenities.length > 0) {
        params.set("amenities", filters.amenities.join(","));
      }
      if (filters.locality) {
        params.set("locality", filters.locality);
      }
      if (rawSearchQuery) {
        params.set("search", rawSearchQuery);
      }
      if (filters.sortBy) {
        params.set("sort", filters.sortBy);
      }
      if (filters.userCoords) {
        params.set("lat", filters.userCoords[0].toString());
        params.set("lng", filters.userCoords[1].toString());
        params.set("maxDistance", (filters.maxDistanceKm * 1000).toString());
      }

      const res = await fetch(`/api/places?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPlaces(data.places || []);
      }
    } catch (err) {
      console.error("Failed to fetch places:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, rawSearchQuery]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Handle smart natural language search results
  const handleNaturalSearch = (query: string, parsed?: ParsedSearchFilters) => {
    setRawSearchQuery(query);
    if (parsed) {
      setParsedChips(parsed.chips);
      // Auto apply parsed parameters to filters
      setFilters((prev) => ({
        ...prev,
        category: parsed.category || prev.category,
        maxPrice: parsed.maxPrice !== undefined ? parsed.maxPrice : prev.maxPrice,
        locality: parsed.locality || prev.locality,
        vibe: parsed.vibeTags.length > 0 ? parsed.vibeTags : prev.vibe,
        amenities: parsed.amenities.length > 0 ? parsed.amenities : prev.amenities,
        openNow: parsed.openNow !== undefined ? parsed.openNow : prev.openNow,
        sortBy: parsed.sortBy || prev.sortBy,
      }));
    } else {
      setParsedChips([]);
    }
  };

  const handleRemoveChip = (chipId: string) => {
    setParsedChips((prev) => prev.filter((c) => c.id !== chipId));
    // Reset the specific filter
    if (chipId.startsWith("cat-")) setFilters((f) => ({ ...f, category: "all" }));
    if (chipId.startsWith("price-")) setFilters((f) => ({ ...f, maxPrice: 500 }));
    if (chipId.startsWith("loc-")) setFilters((f) => ({ ...f, locality: "" }));
    if (chipId.startsWith("vibe-")) {
      const v = chipId.replace("vibe-", "");
      setFilters((f) => ({ ...f, vibe: f.vibe.filter((x) => x !== v) }));
    }
    if (chipId.startsWith("amenity-")) {
      const a = chipId.replace("amenity-", "");
      setFilters((f) => ({ ...f, amenities: f.amenities.filter((x) => x !== a) }));
    }
    if (chipId === "open-now") setFilters((f) => ({ ...f, openNow: false }));
    if (chipId.startsWith("sort-")) setFilters((f) => ({ ...f, sortBy: "hiddenGemScore" }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: "all",
      maxPrice: 500,
      vibe: [],
      amenities: [],
      locality: "",
      openNow: false,
      sortBy: "hiddenGemScore",
      userCoords: null,
      maxDistanceKm: 25,
    });
    setRawSearchQuery("");
    setParsedChips([]);
  };

  // Center coordinates for map (default Mumbai center)
  const mapCenter: [number, number] = useMemo(() => {
    if (filters.userCoords) return filters.userCoords;
    if (places.length > 0 && places[0].location?.coordinates) {
      return [places[0].location.coordinates[1], places[0].location.coordinates[0]];
    }
    return [19.076, 72.8777];
  }, [filters.userCoords, places]);

  return (
    <div className="w-full flex-1 flex flex-col max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="w-full space-y-3">
        <NaturalSearchBar
          initialQuery={rawSearchQuery}
          onSearch={handleNaturalSearch}
          parsedChips={parsedChips}
          onRemoveChip={handleRemoveChip}
        />

        {/* Mobile controls bar */}
        <div className="flex md:hidden items-center justify-between pt-1">
          {/* Mobile view toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setMobileView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mobileView === "list"
                  ? "bg-white dark:bg-slate-900 text-brand-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              List ({places.length})
            </button>
            <button
              onClick={() => setMobileView("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mobileView === "map"
                  ? "bg-white dark:bg-slate-900 text-brand-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map View
            </button>
          </div>

          {/* Filter drawer trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
            Filters
          </button>
        </div>
      </div>

      {/* Main 3-Column / Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-start">
        {/* LEFT COLUMN: Filter Sidebar (Hidden on mobile drawer) */}
        <div className="hidden md:block md:col-span-3 xl:col-span-3 sticky top-20">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            totalResults={places.length}
          />
        </div>

        {/* CENTER COLUMN: Cards Grid */}
        <div
          className={`md:col-span-5 xl:col-span-5 space-y-4 ${
            mobileView === "map" ? "hidden md:block" : "block"
          }`}
        >
          {/* Results summary header */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{places.length}</strong> hidden spots
              {filters.category !== "all" && ` in ${filters.category}`}
            </span>
            {loading && (
              <span className="flex items-center gap-1 text-brand-600 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating spots...
              </span>
            )}
          </div>

          {/* Places Grid */}
          {loading && places.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                No hidden gems match this criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing some vibe tags, or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-sm hover:bg-brand-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {places.map((place) => (
                <PlaceCard
                  key={place._id}
                  place={place}
                  onHover={(id) => setHighlightedId(id)}
                  isHovered={highlightedId === place._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Leaflet Map */}
        <div
          className={`md:col-span-4 xl:col-span-4 sticky top-20 h-[calc(100vh-6.5rem)] min-h-[450px] ${
            mobileView === "list" ? "hidden md:block" : "block"
          }`}
        >
          <DynamicMap
            places={places}
            highlightedId={highlightedId}
            onSelectPlace={(place) => setHighlightedId(place._id)}
            center={mapCenter}
            zoom={12}
            interactive={true}
          />
        </div>
      </div>

      {/* Mobile Filters Modal Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Filter Spots
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              totalResults={places.length}
            />

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md"
            >
              Apply & See {places.length} Places
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <span className="text-xs font-semibold">Loading Explore Map...</span>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

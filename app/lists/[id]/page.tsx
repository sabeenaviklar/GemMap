"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Sparkles,
  Share2,
  Calendar,
  IndianRupee,
  Star,
  Check,
  ChevronLeft,
  Navigation,
} from "lucide-react";
import DynamicMap from "@/components/Map/DynamicMap";
import PlaceCard from "@/components/PlaceCard";

export default function ListDetailPage() {
  const { id } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [list, setList] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadList() {
      try {
        const res = await fetch(`/api/lists/${id}`);
        if (res.ok) {
          const data = await res.json();
          setList(data.list);
        }
      } catch (err) {
        console.error("Failed to load trail:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadList();
    }
  }, [id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading trail & route map...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <h2 className="text-xl font-bold">Trail Not Found</h2>
        <p className="text-xs text-slate-500">This list may be private or deleted.</p>
        <Link
          href="/explore"
          className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Explore All Places
        </Link>
      </div>
    );
  }

  const places = list.places || [];
  const totalPrice = places.reduce((sum: number, p: any) => sum + (p.pricePerPerson || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Back button */}
      <div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Explore
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-teal-900 to-slate-900 text-white border border-teal-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Curated Discovery Trail
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {list.title}
            </h1>
            <p className="text-xs text-teal-200">
              Curated by <strong>{list.owner?.name || "Community Guide"}</strong> • {places.length} stops
            </p>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all self-start sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Public Trail Link</span>
              </>
            )}
          </button>
        </div>

        {/* Trail Budget Pill */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-1.5 font-bold text-amber-300">
            <span>Estimated Total Budget:</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-300">
            {places.length} Authentic Stops
          </div>
        </div>
      </div>

      {/* Route Map */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-600" />
          Interactive Trail Route Map
        </h3>
        <div className="h-80 sm:h-96 rounded-2xl overflow-hidden shadow-soft">
          <DynamicMap places={places} zoom={13} interactive={true} />
        </div>
      </div>

      {/* Ordered Stops List */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Trail Itinerary (Ordered Stops)
        </h3>

        <div className="space-y-3">
          {places.map((place: any, index: number) => (
            <div
              key={place._id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-brand-500 transition-colors"
            >
              {/* Stop Number Circle */}
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center shrink-0 shadow-sm text-sm">
                #{index + 1}
              </div>

              {/* Place Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {place.category}
                  </span>
                  <span className="text-xs text-slate-400">• {place.area}</span>
                </div>
                <Link
                  href={`/places/${place.slug}`}
                  className="font-bold text-base text-slate-900 dark:text-white hover:text-brand-600 truncate block"
                >
                  {place.name}
                </Link>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {place.description}
                </p>
              </div>

              {/* Price & Score */}
              <div className="text-right shrink-0">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  ₹{place.pricePerPerson}
                </div>
                <div className="text-[10px] text-amber-500 font-bold flex items-center justify-end gap-0.5 mt-0.5">
                  <Sparkles className="w-3 h-3" />
                  {place.hiddenGemScore} Gem
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

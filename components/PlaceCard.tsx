"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Star,
  Bookmark,
  CheckCircle,
  ThumbsUp,
  Clock,
  Compass,
} from "lucide-react";
import { useAuth } from "./AuthContext";

export interface PlaceCardProps {
  place: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    category: "food" | "study" | "viewpoint" | "thrift" | "hangout";
    pricePerPerson: number;
    area: string;
    city: string;
    images?: string[];
    avgRating: number;
    hiddenGemScore: number;
    vibeTags?: string[];
    amenities?: string[];
    upvoteCount?: number;
    visitCount?: number;
    reviewCount?: number;
    status?: "pending" | "verified" | "removed";
    createdBy?: {
      name: string;
      reputation: number;
      badges: string[];
    };
  };
  onHover?: (id: string | null) => void;
  isHovered?: boolean;
}

const CATEGORY_META: Record<
  string,
  { label: string; gradient: string; icon: string; badgeBg: string }
> = {
  food: {
    label: "Cheap Eats",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    icon: "🍜",
    badgeBg: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300",
  },
  study: {
    label: "Study Space",
    gradient: "from-blue-600 via-cyan-600 to-teal-600",
    icon: "📚",
    badgeBg: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  },
  viewpoint: {
    label: "Viewpoint",
    gradient: "from-teal-600 via-emerald-600 to-emerald-800",
    icon: "🌅",
    badgeBg: "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300",
  },
  thrift: {
    label: "Thrift & Vintage",
    gradient: "from-purple-600 via-fuchsia-600 to-pink-600",
    icon: "🛍️",
    badgeBg: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
  },
  hangout: {
    label: "Chill Hangout",
    gradient: "from-rose-500 via-red-500 to-amber-600",
    icon: "☕",
    badgeBg: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  },
};

export default function PlaceCard({ place, onHover, isHovered }: PlaceCardProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(
    user?.savedPlaces?.some((p) => p._id === place._id) || false
  );
  const [saving, setSaving] = useState(false);

  const meta = CATEGORY_META[place.category] || {
    label: place.category,
    gradient: "from-brand-600 to-sunset-600",
    icon: "💎",
    badgeBg: "bg-teal-100 dark:bg-teal-950/40 text-teal-700",
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/places/${place._id}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.isSaved);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onMouseEnter={() => onHover && onHover(place._id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 ${
        isHovered
          ? "border-brand-500 ring-2 ring-brand-500/30"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Top Banner / Image Container */}
      <Link href={`/places/${place.slug}`} className="relative h-48 w-full overflow-hidden block">
        {place.images && place.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.images[0]}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Clean gradient placeholder */
          <div
            className={`w-full h-full bg-gradient-to-tr ${meta.gradient} flex flex-col items-center justify-center text-white relative p-4`}
          >
            <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">
              {meta.icon}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest mt-2 opacity-90">
              {meta.label}
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Price Pill */}
          <div className="pointer-events-auto px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white font-bold text-xs shadow-md border border-white/10 flex items-center gap-1">
            <span>₹{place.pricePerPerson}</span>
            <span className="text-[10px] font-normal text-slate-300">/ person</span>
          </div>

          {/* Hidden Gem Score Pill */}
          <div
            title={`Hidden Gem Score: ${place.hiddenGemScore}/100`}
            className="pointer-events-auto px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-glow flex items-center gap-1 border border-amber-300/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-100" />
            <span>{place.hiddenGemScore}</span>
            <span className="text-[9px] font-medium opacity-90">GEM</span>
          </div>
        </div>

        {/* Bookmark button */}
        <button
          onClick={handleToggleSave}
          disabled={saving}
          aria-label="Save Place"
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-brand-600 backdrop-blur-md shadow-md border border-white/20 transition-all hover:scale-105"
        >
          <Bookmark
            className={`w-4 h-4 ${saved ? "fill-brand-600 text-brand-600" : ""}`}
          />
        </button>
      </Link>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Locality & Verification */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {place.area}, {place.city}
            </span>

            {place.status === "verified" ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> Community Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                Pending Votes
              </span>
            )}
          </div>

          {/* Place Name */}
          <Link href={`/places/${place.slug}`}>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
              {place.name}
            </h3>
          </Link>

          {/* Description Snippet */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {place.description.replace("[SAMPLE DATA]", "").trim()}
          </p>

          {/* Vibe Tags */}
          {place.vibeTags && place.vibeTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {place.vibeTags.slice(0, 3).map((vibe) => (
                <span
                  key={vibe}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  #{vibe}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          {/* Rating */}
          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{place.avgRating?.toFixed(1) || "4.0"}</span>
            <span className="text-[10px] font-normal text-slate-400">
              ({place.reviewCount || 0})
            </span>
          </div>

          {/* Upvotes & Visits */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1" title="Community Upvotes">
              <ThumbsUp className="w-3 h-3 text-brand-500" />
              {place.upvoteCount || 0}
            </span>
            <span className="flex items-center gap-1" title="Visited Confirmations">
              <Compass className="w-3 h-3 text-sunset-500" />
              {place.visitCount || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

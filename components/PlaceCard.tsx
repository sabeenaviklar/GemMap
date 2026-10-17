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
  { label: string; gradient: string; icon: string }
> = {
  food: {
    label: "Food & Drink",
    gradient: "from-[#266B66] via-[#2F8479] to-[#D96B43]",
    icon: "🍜",
  },
  study: {
    label: "Study & Work",
    gradient: "from-[#1F5753] via-[#266B66] to-[#4D9F94]",
    icon: "📚",
  },
  viewpoint: {
    label: "Outdoors & Views",
    gradient: "from-[#2F8479] via-[#4D9F94] to-[#B4DDD6]",
    icon: "🌅",
  },
  thrift: {
    label: "Shopping & Vintage",
    gradient: "from-[#D96B43] via-[#EBB59D] to-[#266B66]",
    icon: "🛍️",
  },
  hangout: {
    label: "Arts & Culture",
    gradient: "from-[#2B303A] via-[#266B66] to-[#D96B43]",
    icon: "☕",
  },
};

// Pastel tag pills styling inspired by theme image
const TAG_STYLES = [
  "bg-[#EAF5F3] text-[#1F6E68] border-[#D4EDE8]",
  "bg-[#FAF0EB] text-[#B8532F] border-[#F5DDD1]",
  "bg-[#F1EFEA] text-[#555C66] border-[#E5E1D8]",
];

export default function PlaceCard({ place, onHover, isHovered }: PlaceCardProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(
    user?.savedPlaces?.some((p) => p._id === place._id) || false
  );
  const [saving, setSaving] = useState(false);

  const meta = CATEGORY_META[place.category] || {
    label: place.category,
    gradient: "from-[#266B66] to-[#D96B43]",
    icon: "💎",
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
          ? "border-brand-600 ring-2 ring-brand-600/20"
          : "border-[#EAE5DD] dark:border-slate-800"
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
          /* Clean warm gradient placeholder */
          <div
            className={`w-full h-full bg-gradient-to-tr ${meta.gradient} flex flex-col items-center justify-center text-white relative p-4`}
          >
            <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">
              {meta.icon}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest mt-2 opacity-95">
              {meta.label}
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Price Pill */}
          <div className="pointer-events-auto px-2.5 py-1 rounded-full bg-ink-800/90 backdrop-blur-md text-white font-bold text-xs shadow-sm flex items-center gap-1">
            <span>₹{place.pricePerPerson}</span>
            <span className="text-[10px] font-normal text-slate-300">/ person</span>
          </div>

          {/* Hidden Gem Score Pill */}
          <div
            title={`Hidden Gem Score: ${place.hiddenGemScore}/100`}
            className="pointer-events-auto px-2.5 py-1 rounded-full bg-terracotta-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-1 border border-terracotta-300/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>{place.hiddenGemScore}</span>
            <span className="text-[9px] font-medium opacity-90">GEM</span>
          </div>
        </div>

        {/* Bookmark button */}
        <button
          onClick={handleToggleSave}
          disabled={saving}
          aria-label="Save Place"
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/95 dark:bg-slate-900/95 text-ink-700 dark:text-slate-200 hover:text-brand-600 backdrop-blur-md shadow-sm border border-[#EAE5DD] transition-all hover:scale-105"
        >
          <Bookmark
            className={`w-4 h-4 ${saved ? "fill-brand-600 text-brand-600" : ""}`}
          />
        </button>
      </Link>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Locality & Verification */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {place.area}, {place.city}
            </span>

            {place.status === "verified" ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-[#EAF5F3] px-2 py-0.5 rounded-full border border-[#D4EDE8]">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                Pending Votes
              </span>
            )}
          </div>

          {/* Place Name */}
          <Link href={`/places/${place.slug}`}>
            <h3 className="font-bold text-base text-ink-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-1">
              {place.name}
            </h3>
          </Link>

          {/* 5-Star Row matching theme */}
          <div className="flex items-center gap-1 my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className="w-3.5 h-3.5 fill-[#D96B43] text-[#D96B43]"
              />
            ))}
            <span className="text-xs font-bold text-ink-700 dark:text-slate-200 ml-1">
              {place.avgRating?.toFixed(1) || "4.8"}
            </span>
          </div>

          {/* Description Snippet */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {place.description.replace("[SAMPLE DATA]", "").trim()}
          </p>

          {/* Pastel Pill Vibe Tags like the theme */}
          {place.vibeTags && place.vibeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {place.vibeTags.slice(0, 3).map((vibe, idx) => (
                <span
                  key={vibe}
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    TAG_STYLES[idx % TAG_STYLES.length]
                  }`}
                >
                  {vibe.replace("-", " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta Row */}
        <div className="pt-2.5 border-t border-[#F2EFE9] dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {place.reviewCount || 0} reviews
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1" title="Community Upvotes">
              <ThumbsUp className="w-3 h-3 text-brand-600" />
              {place.upvoteCount || 0}
            </span>
            <span className="flex items-center gap-1" title="Visited Confirmations">
              <Compass className="w-3 h-3 text-terracotta-500" />
              {place.visitCount || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

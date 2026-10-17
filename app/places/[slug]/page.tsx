"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Star,
  ThumbsUp,
  Compass,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Clock,
  Navigation,
  Flag,
  Share2,
  CheckCircle,
  HelpCircle,
  X,
  MessageSquare,
  Award,
  ChevronLeft,
  Sun,
  Sunset,
  Moon,
  CloudSun,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import DynamicMap from "@/components/Map/DynamicMap";

export default function PlaceDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [place, setPlace] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scoreBreakdown, setScoreBreakdown] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User engagement state
  const [hasVoted, setHasVoted] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Modals
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Load place details and reviews
  useEffect(() => {
    async function loadPlace() {
      try {
        const res = await fetch(`/api/places/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPlace(data.place);
          setScoreBreakdown(data.scoreBreakdown);
          if (data.userState) {
            setHasVoted(data.userState.hasVoted);
            setHasVisited(data.userState.hasVisited);
            setIsSaved(data.userState.isSaved);
          }

          // Fetch reviews
          const revRes = await fetch(`/api/places/${slug}/reviews`);
          if (revRes.ok) {
            const revData = await revRes.json();
            setReviews(revData.reviews || []);
          }
        }
      } catch (err) {
        console.error("Error loading place:", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadPlace();
    }
  }, [slug]);

  // Handle Upvote
  const handleVote = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/places/${slug}/vote`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setHasVoted(data.voted);
        setPlace((prev: any) => ({
          ...prev,
          upvoteCount: data.upvoteCount,
          hiddenGemScore: data.hiddenGemScore,
          status: data.status,
        }));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle "I visited this"
  const handleVisit = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/places/${slug}/visit`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setHasVisited(data.visited);
        setPlace((prev: any) => ({
          ...prev,
          visitCount: data.visitCount,
          hiddenGemScore: data.hiddenGemScore,
          status: data.status,
        }));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Save / Bookmark
  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/places/${slug}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isSaved);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!tip.trim() || tip.length < 5) {
      setReviewError("Please write at least 5 characters for your tip.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    try {
      const res = await fetch(`/api/places/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, tip }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviews([data.review, ...reviews]);
        setPlace((prev: any) => ({
          ...prev,
          reviewCount: data.placeStats.reviewCount,
          avgRating: data.placeStats.avgRating,
          hiddenGemScore: data.placeStats.hiddenGemScore,
        }));
        setTip("");
      } else {
        setReviewError(data.error || "Failed to submit review");
      }
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Report Place
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/places/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      if (res.ok) {
        setReportSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Discovering hidden gem details...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Place Not Found</h2>
        <p className="text-xs text-slate-500">
          This spot may have been removed or the URL is incorrect.
        </p>
        <Link
          href="/explore"
          className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const coordinates = place.location?.coordinates || [72.8777, 19.076];
  const [lng, lat] = coordinates;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Back button */}
      <div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Explore Map
        </Link>
      </div>

      {/* Hero Header & Gallery Banner */}
      <div className="space-y-4">
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 w-full shadow-lg bg-slate-900 border border-slate-200 dark:border-slate-800">
          {place.images && place.images.length > 0 ? (
            <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-1 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={place.images[0]}
                alt={place.name}
                className="w-full h-full object-cover"
              />
              {place.images.length > 1 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={place.images[1]}
                  alt={place.name}
                  className="w-full h-full object-cover hidden sm:block"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-brand-800 to-sunset-800 hidden sm:flex items-center justify-center text-white/50 text-sm font-semibold">
                  Community Hidden Gem
                </div>
              )}
            </div>
          ) : (
            /* Clean Gradient Placeholder */
            <div className="w-full h-full bg-gradient-to-tr from-brand-900 via-teal-800 to-sunset-800 flex flex-col items-center justify-center text-white p-6 relative">
              <span className="text-6xl drop-shadow-lg">💎</span>
              <h3 className="font-extrabold text-2xl mt-3 tracking-wide">{place.name}</h3>
              <p className="text-xs uppercase tracking-widest text-teal-200 mt-1">
                {place.category} • {place.area}
              </p>
            </div>
          )}

          {/* Floating Gem Score Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowScoreModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-300 font-extrabold text-sm border border-amber-400/40 shadow-glow hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{place.hiddenGemScore}</span>
              <span className="text-[10px] text-amber-200 font-normal">/ 100 GEM</span>
              <HelpCircle className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </button>
          </div>

          {/* Bottom left breadcrumb on hero */}
          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold capitalize">
              {place.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              {place.area}, {place.city}
            </span>
            {place.status === "verified" && (
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Community Verified
              </span>
            )}
          </div>
        </div>

        {/* Title & Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {place.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                {place.avgRating?.toFixed(1) || "4.0"} ({place.reviewCount || 0} reviews)
              </span>
              <span>•</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                ₹{place.pricePerPerson}{" "}
                <span className="text-xs font-normal text-slate-400">per person</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                {place.openingHours}
              </span>
            </div>
          </div>

          {/* Engagement Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Upvote Button */}
            <button
              onClick={handleVote}
              disabled={actionLoading}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                hasVoted
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-brand-500"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${hasVoted ? "fill-white" : ""}`} />
              <span>{hasVoted ? "Upvoted" : "Upvote"}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                {place.upvoteCount || 0}
              </span>
            </button>

            {/* I Visited This Confirmation */}
            <button
              onClick={handleVisit}
              disabled={actionLoading}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                hasVisited
                  ? "bg-sunset-600 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-sunset-500"
              }`}
            >
              <Compass className={`w-4 h-4 ${hasVisited ? "text-white" : "text-sunset-500"}`} />
              <span>{hasVisited ? "Visited ✓" : "I Visited This"}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                {place.visitCount || 0}
              </span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleSave}
              className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors ${
                isSaved ? "text-brand-600 border-brand-500" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Save to bookmarks"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-brand-600" : ""}`} />
            </button>

            {/* Report */}
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-red-500 transition-colors"
              title="Report place"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Info + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Crowd Levels, Tips */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-soft">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              About This Gem
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {place.description}
            </p>

            {/* Vibe Tags */}
            {place.vibeTags && place.vibeTags.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Atmosphere & Vibes
                </span>
                <div className="flex flex-wrap gap-2">
                  {place.vibeTags.map((vibe: string) => (
                    <span
                      key={vibe}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      #{vibe}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {place.amenities && place.amenities.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Amenities & Facilities
                </span>
                <div className="flex flex-wrap gap-2">
                  {place.amenities.map((am: string) => (
                    <span
                      key={am}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-500/20"
                    >
                      ✓ {am}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Crowd Levels by Time of Day */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-soft">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Crowd Level by Time of Day
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { time: "Morning", key: "morning", icon: Sun, color: "text-amber-500" },
                { time: "Afternoon", key: "afternoon", icon: CloudSun, color: "text-orange-500" },
                { time: "Evening", key: "evening", icon: Sunset, color: "text-rose-500" },
                { time: "Night", key: "night", icon: Moon, color: "text-indigo-400" },
              ].map(({ time, key, icon: Icon, color }) => {
                const level = place.crowdLevels?.[key] || "medium";
                const badgeColor =
                  level === "low"
                    ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                    : level === "medium"
                    ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                    : "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300";

                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
                  >
                    <Icon className={`w-5 h-5 mx-auto ${color}`} />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {time}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}
                    >
                      {level} Crowd
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews & Tips Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Insider Tips & Reviews
                </h3>
                <p className="text-xs text-slate-500">
                  Real advice from students and local discoverers.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-amber-500 flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-500" />
                  {place.avgRating?.toFixed(1) || "4.0"}
                </div>
                <div className="text-[11px] text-slate-400">{reviews.length} reviews</div>
              </div>
            </div>

            {/* Write a Review Box */}
            <form
              onSubmit={handleReviewSubmit}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Leave a Helpful Tip for Other Explorers (+10 Reputation)
              </h4>

              {/* Star selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="Share best timing, must-try items, Wi-Fi passwords, or quiet spots..."
                className="w-full text-xs rounded-xl p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />

              {reviewError && (
                <div className="text-xs text-red-500 font-semibold">{reviewError}</div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-sm transition-colors"
              >
                {submittingReview ? "Posting..." : "Post Review"}
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-4 pt-2">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No reviews yet. Be the first to share an insider tip!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {rev.user?.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {rev.user?.name || "Anonymous Discoverer"}
                        </span>
                        {rev.user?.badges?.[0] && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold">
                            {rev.user.badges[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {rev.rating}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{rev.tip}"
                    </p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Map & Directions, Contributor Profile */}
        <div className="space-y-6">
          {/* Mini Interactive Map */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-soft">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Location</h3>
            <div className="h-56 rounded-xl overflow-hidden">
              <DynamicMap
                places={[place]}
                highlightedId={place._id}
                center={[lat, lng]}
                zoom={14}
                interactive={false}
              />
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>
                {place.area}, {place.city} ({lat.toFixed(4)}, {lng.toFixed(4)})
              </span>
            </div>

            {/* Directions Links */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Get Directions (Google Maps)
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                OpenStreetMap Coordinates
              </a>
            </div>
          </div>

          {/* Contributor Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Discovered By
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-sunset-600 text-white font-extrabold text-sm flex items-center justify-center">
                {place.createdBy?.name?.charAt(0) || "C"}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {place.createdBy?.name || "Local Contributor"}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  <Award className="w-3.5 h-3.5" />
                  {place.createdBy?.reputation || 15} reputation points
                </div>
              </div>
            </div>
            {place.createdBy?.badges && (
              <div className="flex flex-wrap gap-1 pt-1">
                {place.createdBy.badges.map((b: string) => (
                  <span
                    key={b}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    🏅 {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WHY IS THIS A HIDDEN GEM? MODAL BREAKDOWN */}
      {showScoreModal && scoreBreakdown && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Why is this a Hidden Gem?
                </h3>
              </div>
              <button
                onClick={() => setShowScoreModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                {place.hiddenGemScore} / 100
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Computed using our Bayesian server algorithm to penalize commercialized tourist crowds and reward genuine affordability.
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Bayesian Rating */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Authentic Rating (35% weight)</span>
                  <span className="text-brand-600">{scoreBreakdown.components?.ratingContribution} pts</span>
                </div>
                <div className="text-slate-500">
                  Bayesian smoothed score: {scoreBreakdown.bayesianRating}/5.0 (neutral prior of 3.5 applied to prevent rating spam).
                </div>
              </div>

              {/* Obscurity */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Obscurity & Low Crowd (20% weight)</span>
                  <span className="text-brand-600">{scoreBreakdown.components?.obscurityContribution} pts</span>
                </div>
                <div className="text-slate-500">
                  Fewer mass commercial reviews = higher score ({place.reviewCount || 0} reviews).
                </div>
              </div>

              {/* Affordability */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Affordability (20% weight)</span>
                  <span className="text-brand-600">{scoreBreakdown.components?.affordabilityContribution} pts</span>
                </div>
                <div className="text-slate-500">
                  Priced at ₹{place.pricePerPerson} per person (scaled against ₹500 budget cap).
                </div>
              </div>

              {/* Upvotes */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Community Upvotes (15% weight)</span>
                  <span className="text-brand-600">{scoreBreakdown.components?.upvoteContribution} pts</span>
                </div>
                <div className="text-slate-500">
                  {place.upvoteCount || 0} community upvotes.
                </div>
              </div>

              {/* Verified visits */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Confirmed Physical Visits (10% weight)</span>
                  <span className="text-brand-600">{scoreBreakdown.components?.verifiedContribution} pts</span>
                </div>
                <div className="text-slate-500">
                  {place.visitCount || 0} discoverers clicked "I visited this".
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowScoreModal(false)}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-red-500" />
                Report Spot
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm">Report Received</h4>
                <p className="text-xs text-slate-500">
                  Our moderators will inspect this place for spam, closure or incorrect pricing.
                </p>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSubmitted(false);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Help keep HiddenGems authentic. Why should this place be reviewed?
                </p>
                <textarea
                  rows={3}
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. permanently closed, commercial tourist trap, incorrect prices..."
                  className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700"
                >
                  Submit Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

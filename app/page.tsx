"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Compass,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Coffee,
  Sunset,
  ShoppingBag,
  TrendingUp,
  Heart,
  ChevronRight,
  Flame,
} from "lucide-react";
import PlaceCard from "@/components/PlaceCard";
import NaturalSearchBar from "@/components/NaturalSearchBar";

export default function LandingPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trendingPlaces, setTrendingPlaces] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [under100Places, setUnder100Places] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [studyPlaces, setStudyPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSampleData() {
      try {
        const res = await fetch("/api/places");
        if (res.ok) {
          const data = await res.json();
          const all = data.places || [];

          // Sort by Hidden Gem Score for Trending
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sortedTrending = [...all].sort((a: any, b: any) => (b.hiddenGemScore || 0) - (a.hiddenGemScore || 0));
          setTrendingPlaces(sortedTrending.slice(0, 4));

          // Under Rs 100
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const under100 = all.filter((p: any) => p.pricePerPerson <= 100);
          setUnder100Places(under100.slice(0, 4));

          // Best study spots
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const study = all.filter((p: any) => p.category === "study");
          setStudyPlaces(study.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load initial places:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSampleData();
  }, []);

  const handleSearch = (q: string) => {
    if (q) {
      router.push(`/explore?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/explore");
    }
  };

  const categories = [
    { id: "all", label: "All Spots", icon: Sparkles, color: "from-brand-500 to-teal-700" },
    { id: "food", label: "Cheap Eats", icon: Coffee, color: "from-amber-500 to-orange-600" },
    { id: "study", label: "Study Spaces", icon: BookOpen, color: "from-blue-500 to-cyan-600" },
    { id: "viewpoint", label: "Viewpoints", icon: Sunset, color: "from-teal-500 to-emerald-700" },
    { id: "thrift", label: "Thrift & Vintage", icon: ShoppingBag, color: "from-purple-500 to-fuchsia-600" },
  ];

  return (
    <div className="w-full flex flex-col space-y-16 sm:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-brand-50/40 via-transparent to-transparent dark:from-brand-950/20">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-brand-400/20 via-sunset-400/20 to-teal-400/20 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Community-Driven City Discovery for Students</span>
            <span className="text-amber-500 font-bold">★ 0% Commercial Traps</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-500 to-sunset-500">Real City</span>.
            <br />
            Affordable, Authentic, Uncrowded.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            Skip the overpriced tourist traps. Find secret chai stalls, silent study lofts, sunset cliffs and thrift alleys — verified by real students and budget explorers.
          </p>

          {/* Natural-Language Search Box */}
          <div className="max-w-3xl mx-auto pt-2">
            <NaturalSearchBar
              onSearch={handleSearch}
              placeholder="e.g. cheap quiet place to study near Bandra under 150"
            />
          </div>

          {/* Category Chips Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/explore?category=${cat.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:scale-105"
                >
                  <Icon className="w-3.5 h-3.5 text-brand-500" />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-extrabold text-brand-600 dark:text-brand-400">100%</div>
              <div className="text-[11px] text-slate-500">OpenStreetMap / Keyless</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-extrabold text-sunset-500">≤ ₹150</div>
              <div className="text-[11px] text-slate-500">Average Student Budget</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">3+ Visits</div>
              <div className="text-[11px] text-slate-500">Auto Community Verify</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">Bayesian</div>
              <div className="text-[11px] text-slate-500">Hidden Gem Algorithm</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: TRENDING HIDDEN GEMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sunset-500">
              <Flame className="w-4 h-4" />
              Community Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Trending Hidden Gems This Week
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ranked with our Bayesian Hidden Gem Score — high obscurity, high authenticity, budget-friendly.
            </p>
          </div>
          <Link
            href="/explore?sort=hiddenGemScore"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>View All Ranked Gems</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingPlaces.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: UNDER RS 100 GEMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              Student Pocket Friendly
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Unreal Experiences Under ₹100
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Legendary Irani chai, steaming dosas, vintage book alleys and botanical gardens for pocket change.
            </p>
          </div>
          <Link
            href="/explore?maxPrice=100"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>See Everything Under ₹100</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {under100Places.map((place) => (
            <PlaceCard key={place._id} place={place} />
          ))}
        </div>
      </section>

      {/* SECTION 3: BEST STUDY SPACES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
              Quiet Focus Nooks
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Best Quiet Study Spots & Workdesks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Free Wi-Fi, working power outlets, tranquil banyan canopies and zero disturbances for your deep work.
            </p>
          </div>
          <Link
            href="/explore?category=study"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>Browse All Study Spaces</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studyPlaces.map((place) => (
            <PlaceCard key={place._id} place={place} />
          ))}
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
        <div className="rounded-3xl bg-gradient-to-br from-teal-900 via-brand-950 to-slate-900 text-white p-8 sm:p-12 border border-teal-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              The Architecture of Authenticity
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
              How HiddenGems Beats The Tourist Trap Algorithm
            </h2>
            <p className="text-sm text-teal-100/80 mt-2 leading-relaxed">
              Mainstream platforms reward sponsored listings and mass tourist crowds. HiddenGems is engineered specifically for college students and local discoverers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center font-extrabold">
                1
              </div>
              <h3 className="font-bold text-base text-white">Map-First Discovery</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Filter by price per person slider, live walking distance, vibes (quiet, late-night) and verified amenities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sunset-500/20 text-sunset-300 flex items-center justify-center font-extrabold">
                2
              </div>
              <h3 className="font-bold text-base text-white">"I Visited This" Proof</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No fake reviews. Spots gain "Community Verified" status only when real discoverers verify their physical visit.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-extrabold">
                3
              </div>
              <h3 className="font-bold text-base text-white">Hidden Gem Formula</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Server-computed Bayesian score rewarding high obscurity (fewer mass reviews), low price, and high ratings.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-extrabold">
                4
              </div>
              <h3 className="font-bold text-base text-white">Contributor Reputation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Earn reputation points and unlock badges (Newcomer → Explorer → Local Guide) by contributing authentic spots.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-teal-200">
              Know a secret chai stall or quiet rooftop study spot? Add it to the community map!
            </div>
            <Link
              href="/places/new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sunset-500 to-amber-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-sunset-500/25 transition-all"
            >
              Submit a Hidden Gem →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

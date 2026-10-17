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
  Utensils,
  Camera,
  Trees,
  Landmark,
} from "lucide-react";
import PlaceCard from "@/components/PlaceCard";
import NaturalSearchBar from "@/components/NaturalSearchBar";

export default function LandingPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlaces() {
      try {
        const res = await fetch("/api/places");
        if (res.ok) {
          const data = await res.json();
          setPlaces(data.places || []);
        }
      } catch (err) {
        console.error("Failed to load places:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, []);

  const handleSearch = (q: string) => {
    if (q) {
      router.push(`/explore?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/explore");
    }
  };

  const categories = [
    { id: "all", label: "All Secrets", icon: Sparkles },
    { id: "food", label: "Food & Drink", icon: Utensils },
    { id: "study", label: "Study & Work", icon: BookOpen },
    { id: "viewpoint", label: "Outdoors", icon: Trees },
    { id: "thrift", label: "Shopping", icon: ShoppingBag },
    { id: "hangout", label: "Arts & Culture", icon: Landmark },
  ];

  // Featured City Neighborhoods row with user specified photography
  const featuredLocalities = [
    {
      name: "Bandra West",
      subtitle: "Vintage By-Lanes & Sea Cliffs",
      category: "Bandra",
      image:
        "https://www.mageba-group.com/sk/data/docs/en/52134/Bandra-Worli-Sea-Link.jpg?v=1.1",
    },
    {
      name: "Fort Heritage",
      subtitle: "Colonial Book Vaults & Irani Cafes",
      category: "Fort",
      image:
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/309179823.jpg?k=53b55d5d5014e77e4629c97d3232f10512c5cdd8ec11bac91946ca4caac3dd19&o=",
    },
    {
      name: "Matunga",
      subtitle: "Authentic Chai & Morning Breakfasts",
      category: "Matunga",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUMVb-95oTi_uIreP1DD_n6_taHg0mDbsZG66EqfedyOpzWmRLjw0tYIk&s=10",
    },
    {
      name: "Versova",
      subtitle: "Harbor Sunsets & Quiet Addas",
      category: "Versova",
      image:
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/81/5b/59/very-clean-beach-thanks.jpg?w=900&h=500&s=1",
    },
  ];

  const filteredPlaces =
    selectedCategory === "all"
      ? places
      : places.filter((p) => p.category === selectedCategory);

  return (
    <div className="w-full flex flex-col space-y-12 pb-20">
      {/* Top Search Hero Strip */}
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-4 text-center space-y-6 w-full">
        {/* Search Bar pill */}
        <div className="max-w-2xl mx-auto">
          <NaturalSearchBar
            onSearch={handleSearch}
            placeholder="Enter a locality or craving (e.g. cheap quiet place to study near Bandra under 150)..."
          />
        </div>
      </section>

      {/* SECTION: FEATURED CITIES / LOCALITIES (Theme image style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink-900 dark:text-white">
          Featured Neighborhoods
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredLocalities.map((loc) => (
            <Link
              key={loc.name}
              href={`/explore?locality=${loc.category}`}
              className="relative h-44 sm:h-52 rounded-2xl overflow-hidden group shadow-soft border border-[#EAE5DD] dark:border-slate-800 transition-all hover:shadow-card hover:-translate-y-1 block"
            >
              {/* Actual Neighborhood Photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={loc.image}
                alt={loc.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Rich gradient overlay so white text has strong contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 transition-opacity group-hover:opacity-90" />
              <div className="relative z-10 w-full h-full flex flex-col justify-end p-4 text-white">
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight drop-shadow">
                  {loc.name}
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5 line-clamp-1 drop-shadow">
                  {loc.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION: UNCOVER HIDDEN GEMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink-900 dark:text-white">
            Uncover Hidden Gems
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified local spots, budget eats and quiet study nooks without commercial tourist traps.
          </p>
        </div>

        {/* Category Pills matching theme */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-[#EFECE6] dark:bg-slate-800 text-ink-700 dark:text-slate-300 hover:bg-[#E5DFC]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-brand-600"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Places Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-[#EFECE6] dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS / COMMUNITY PROOF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6">
        <div className="rounded-3xl bg-brand-600 text-white p-8 sm:p-12 shadow-card space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-200">
              Community Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              A Platform Built For Discoverers, Not Advertisers
            </h2>
            <p className="text-xs text-brand-100 leading-relaxed">
              Every spot is ranked using a Bayesian Hidden Gem Score that penalizes commercial tourist crowds and rewards real affordability and obscurity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm space-y-2">
              <h3 className="font-bold text-sm">📍 Map-First & Geolocation</h3>
              <p className="text-xs text-brand-100 leading-relaxed">
                Filter by price per person slider, live walking distance, vibes (quiet, late-night) and verified amenities.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm space-y-2">
              <h3 className="font-bold text-sm">✅ "I Visited This" Proof</h3>
              <p className="text-xs text-brand-100 leading-relaxed">
                Spots gain Community Verified status only once 3 distinct physical visits are confirmed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm space-y-2">
              <h3 className="font-bold text-sm">🏅 Contributor Reputation</h3>
              <p className="text-xs text-brand-100 leading-relaxed">
                Earn reputation points and unlock badges (Newcomer → Explorer → Local Guide) by adding authentic spots.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

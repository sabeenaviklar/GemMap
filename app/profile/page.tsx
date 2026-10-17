"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Award,
  Sparkles,
  Bookmark,
  MapPin,
  Plus,
  Compass,
  CheckCircle,
  ThumbsUp,
  Share2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import PlaceCard from "@/components/PlaceCard";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // Active tab: "saved" | "submitted" | "lists"
  const [activeTab, setActiveTab] = useState<"saved" | "submitted" | "lists">("saved");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [submittedPlaces, setSubmittedPlaces] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userLists, setUserLists] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // New Trail List Form Modal
  const [newListModal, setNewListModal] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }

    async function loadUserData() {
      try {
        const [placesRes, listsRes] = await Promise.all([
          fetch(`/api/places?creator=me`),
          fetch(`/api/lists`),
        ]);

        if (placesRes.ok) {
          const pData = await placesRes.json();
          // Filter to places created by this user
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mine = (pData.places || []).filter((p: any) =>
            p.createdBy?._id === user?.id || p.createdBy === user?.id
          );
          setSubmittedPlaces(mine);
        }

        if (listsRes.ok) {
          const lData = await listsRes.json();
          setUserLists(lData.lists || []);
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoadingData(false);
      }
    }

    if (user) {
      loadUserData();
    }
  }, [user, authLoading, router]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listTitle.trim()) return;

    setCreatingList(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: listTitle,
          places: user?.savedPlaces?.map((p) => p._id) || [],
          isPublic: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserLists([data.list, ...userLists]);
        setListTitle("");
        setNewListModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingList(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  // Next badge calculation
  const reputation = user.reputation || 15;
  let nextBadge = "Explorer";
  let neededPoints = 50;
  if (reputation >= 100) {
    nextBadge = "Master Curator";
    neededPoints = 250;
  } else if (reputation >= 30) {
    nextBadge = "Local Guide";
    neededPoints = 100;
  }
  const progressPercent = Math.min(100, Math.round((reputation / neededPoints) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-600 to-sunset-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {user.name}
              </h1>
              {user.role === "admin" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-500/20">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>

            {/* Badges Pill Row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {user.badges?.map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1"
                >
                  <Award className="w-3 h-3 text-amber-500" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Reputation Score & Level Progress */}
        <div className="w-full md:w-64 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Contributor Score
            </span>
            <span className="text-brand-600 dark:text-brand-400 text-sm">{reputation} pts</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-sunset-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-[10px] text-slate-500 flex justify-between">
            <span>Next: {nextBadge}</span>
            <span>{reputation}/{neededPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "saved"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Bookmarked Spots ({user.savedPlaces?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("submitted")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "submitted"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Submitted Places ({submittedPlaces.length})
          </button>

          <button
            onClick={() => setActiveTab("lists")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "lists"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            My Trails ({userLists.length})
          </button>
        </div>

        {activeTab === "lists" && (
          <button
            onClick={() => setNewListModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Trail
          </button>
        )}
      </div>

      {/* Tab 1: Bookmarked Spots */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          {(!user.savedPlaces || user.savedPlaces.length === 0) ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                No Bookmarked Places Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the map and click the bookmark ribbon to save budget spots and quiet study corners.
              </p>
              <Link
                href="/explore"
                className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Explore Hidden Gems
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.savedPlaces.map((place: any) => (
                <PlaceCard key={place._id} place={place} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Submitted Places */}
      {activeTab === "submitted" && (
        <div className="space-y-4">
          {submittedPlaces.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                You Haven't Submitted Any Places Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Know a secret chai stall or quiet study spot? Add it and earn +15 reputation points!
              </p>
              <Link
                href="/places/new"
                className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Submit Your First Spot
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {submittedPlaces.map((place) => (
                <PlaceCard key={place._id} place={place} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Trails */}
      {activeTab === "lists" && (
        <div className="space-y-4">
          {userLists.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                No Trails Created Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Group your bookmarked spots into custom routes (like "Weekend Under ₹300") and share them with friends.
              </p>
              <button
                onClick={() => setNewListModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                Create a Trail
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userLists.map((l: any) => (
                <div
                  key={l._id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-soft flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-brand-600">
                      <span>{l.places?.length || 0} Places</span>
                      <span>Public Trail</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {l.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/lists/${l.shareId || l._id}`}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Route Map</span>
                      <Share2 className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE TRAIL MODAL */}
      {newListModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Create a New Discovery Trail
            </h3>
            <p className="text-xs text-slate-500">
              This trail will automatically bundle your current bookmarked spots into an ordered itinerary with an interactive map.
            </p>

            <form onSubmit={handleCreateList} className="space-y-4">
              <input
                type="text"
                required
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                placeholder="e.g. Bandra Sunday Sunset & Chai Walk"
                className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewListModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingList || !listTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
                >
                  {creatingList ? "Creating..." : "Save Trail"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

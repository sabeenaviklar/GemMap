"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Flag,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Tab: "pending" | "reported" | "all"
  const [tab, setTab] = useState<"pending" | "reported" | "all">("pending");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [places, setPlaces] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/");
        return;
      }
      loadAdminData();
    }
  }, [user, authLoading, router, tab]);

  async function loadAdminData() {
    setLoading(true);
    try {
      if (tab === "reported") {
        const res = await fetch("/api/admin/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } else {
        const res = await fetch(`/api/admin/places?type=${tab}`);
        if (res.ok) {
          const data = await res.json();
          setPlaces(data.places || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle place moderation action
  const handlePlaceAction = async (placeId: string, action: string) => {
    setActionLoading(placeId);
    try {
      const res = await fetch("/api/admin/places", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, action }),
      });
      if (res.ok) {
        setPlaces((prev) =>
          prev.map((p) =>
            p._id === placeId
              ? {
                  ...p,
                  status:
                    action === "approve" || action === "verify"
                      ? "verified"
                      : action === "remove"
                      ? "removed"
                      : "pending",
                }
              : p
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Handle report dismiss or remove
  const handleReportAction = async (reportId: string, removePlace: boolean) => {
    setActionLoading(reportId);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: "reviewed", removePlace }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500">
          This dashboard is restricted to system administrators.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Admin Moderation Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review user submissions, enforce anti-spam rules, and inspect reported places.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "pending"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          Pending Approval
        </button>
        <button
          onClick={() => setTab("reported")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "reported"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          Reported Places
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === "all"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          All Places
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
          Loading moderation records...
        </div>
      ) : tab === "reported" ? (
        /* Reports Table */
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm">No Pending Reports</h3>
              <p className="text-xs text-slate-500">The community queue is clean!</p>
            </div>
          ) : (
            reports.map((report: any) => (
              <div
                key={report._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-600 flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5" /> Reported Place
                  </span>
                  <span className="text-slate-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {report.place?.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    <strong>Reason for report:</strong> "{report.reason}"
                  </p>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Reported by: {report.user?.name} ({report.user?.email})
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleReportAction(report._id, false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => handleReportAction(report._id, true)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
                  >
                    Remove Place
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Places List */
        <div className="space-y-4">
          {places.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm">No Places Found</h3>
              <p className="text-xs text-slate-500">Everything is up to date.</p>
            </div>
          ) : (
            places.map((place: any) => (
              <div
                key={place._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        place.status === "verified"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : place.status === "removed"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {place.status}
                    </span>
                    <span className="text-xs font-bold text-slate-400 capitalize">
                      {place.category} • {place.area}
                    </span>
                  </div>

                  <Link
                    href={`/places/${place.slug}`}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-brand-600 flex items-center gap-1"
                  >
                    <span>{place.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </Link>

                  <p className="text-xs text-slate-500 truncate">{place.description}</p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                    <span>By: {place.createdBy?.name || "User"}</span>
                    <span>₹{place.pricePerPerson} / person</span>
                    <span>Score: {place.hiddenGemScore}</span>
                    <span>Reports: {place.reportCount || 0}</span>
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {place.status !== "verified" && (
                    <button
                      onClick={() => handlePlaceAction(place._id, "approve")}
                      disabled={actionLoading === place._id}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-colors"
                    >
                      Verify & Approve
                    </button>
                  )}

                  {place.status !== "removed" ? (
                    <button
                      onClick={() => handlePlaceAction(place._id, "remove")}
                      disabled={actionLoading === place._id}
                      className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlaceAction(place._id, "restore")}
                      disabled={actionLoading === place._id}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50"
                    >
                      Restore to Pending
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

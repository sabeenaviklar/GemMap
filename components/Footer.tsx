import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, Heart, ShieldCheck, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-700 via-brand-500 to-sunset-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">
              Hidden<span className="text-brand-600 dark:text-brand-400">Gems</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            A map-first discovery platform helping students and budget travelers uncover authentic, affordable local spots away from tourist traps.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
            <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Community Verified
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            Explore
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/explore?category=food" className="hover:text-brand-600 dark:hover:text-brand-400">
                Cheap Food & Chai
              </Link>
            </li>
            <li>
              <Link href="/explore?category=study" className="hover:text-brand-600 dark:hover:text-brand-400">
                Quiet Study Spaces
              </Link>
            </li>
            <li>
              <Link href="/explore?category=viewpoint" className="hover:text-brand-600 dark:hover:text-brand-400">
                Scenic Viewpoints
              </Link>
            </li>
            <li>
              <Link href="/explore?category=thrift" className="hover:text-brand-600 dark:hover:text-brand-400">
                Thrift & Vintage Markets
              </Link>
            </li>
            <li>
              <Link href="/explore?category=hangout" className="hover:text-brand-600 dark:hover:text-brand-400">
                Chill Hangouts
              </Link>
            </li>
          </ul>
        </div>

        {/* Community & Contributor */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            Community
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/places/new" className="hover:text-brand-600 dark:hover:text-brand-400">
                Submit a Hidden Gem
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-brand-600 dark:hover:text-brand-400">
                Contributor Reputation & Badges
              </Link>
            </li>
            <li>
              <Link href="/explore?maxPrice=100" className="hover:text-brand-600 dark:hover:text-brand-400">
                Gems Under ₹100
              </Link>
            </li>
            <li>
              <Link href="/lists/weekend-under-300" className="hover:text-brand-600 dark:hover:text-brand-400">
                Curated Student Trails
              </Link>
            </li>
          </ul>
        </div>

        {/* Cities & Mission */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            City Focus
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            Currently live across Mumbai neighborhoods (Bandra, Fort, Andheri, Powai, Matunga, Versova). Expanding soon!
          </p>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> for students & budget explorers
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <p>© 2026 HiddenGems. Open-source hackathon build. Powered by OpenStreetMap & Leaflet.</p>
        <p className="mt-2 sm:mt-0 font-medium">Smart City / Travel Innovation Platform</p>
      </div>
    </footer>
  );
}

import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink-800 text-slate-300 border-t border-ink-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-brand-600 flex items-center justify-center font-bold text-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-terracotta-500" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Hidden<span className="text-brand-300">Gems</span>
            </span>
          </div>

          {/* Center Links matching theme */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300">
            <Link href="/places/new" className="hover:text-white transition-colors">
              Contribute a Gem
            </Link>
            <Link href="/explore" className="hover:text-white transition-colors">
              Explore Cities
            </Link>
            <Link href="/lists/weekend-under-300" className="hover:text-white transition-colors">
              Curated Trails
            </Link>
            <Link href="/explore?maxPrice=100" className="hover:text-white transition-colors">
              Under ₹100
            </Link>
          </div>

          {/* Right badge */}
          <div className="text-xs text-slate-400">
            Built with <Heart className="w-3 h-3 text-terracotta-500 fill-terracotta-500 inline" /> for students & budget explorers
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-700/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>© 2026 HiddenGems. Open-source city discovery powered by OpenStreetMap.</p>
          <p className="mt-2 sm:mt-0">Authentic • Affordable • Community-Verified</p>
        </div>
      </div>
    </footer>
  );
}

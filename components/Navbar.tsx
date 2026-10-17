"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import {
  Compass,
  PlusCircle,
  Sparkles,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Award,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, theme, toggleTheme, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-teal-500/10 dark:border-teal-500/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-500 to-sunset-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Hidden<span className="text-brand-600 dark:text-brand-400">Gems</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              City Discovery
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/explore"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              isActive("/explore")
                ? "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <Compass className="w-4 h-4 text-brand-500" />
            Explore Map
          </Link>

          <Link
            href="/places/new"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              isActive("/places/new")
                ? "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-sunset-500" />
            Add a Place
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive("/admin")
                  ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                  : "text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 bg-white/70 dark:bg-slate-900/70 transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[100px]">
                    {user.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5 mt-0.5">
                    <Award className="w-2.5 h-2.5" />
                    {user.reputation} pts
                  </div>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-600 to-teal-700 text-white hover:opacity-95 shadow-sm transition-all"
              >
                Join Free
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/50"
          >
            <Compass className="w-4 h-4 text-brand-500" />
            Explore Map & Spots
          </Link>
          <Link
            href="/places/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/50"
          >
            <PlusCircle className="w-4 h-4 text-sunset-500" />
            Add a Hidden Gem
          </Link>
          {user && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/50"
            >
              <UserIcon className="w-4 h-4 text-brand-500" />
              My Profile & Saved Lists
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Admin Moderation
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

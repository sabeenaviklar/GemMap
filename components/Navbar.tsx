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
    <header className="sticky top-0 z-50 w-full bg-[#FAF7F2] dark:bg-[#16191F] border-b border-[#EAE5DD] dark:border-slate-800 transition-colors">
      {/* Signature Multi-Color Accent Strip from theme image */}
      <div className="w-full h-2 flex">
        <div className="w-7/12 bg-brand-600" />
        <div className="w-2/12 bg-terracotta-500" />
        <div className="w-3/12 bg-ink-700" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with circular vintage/retro emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-600 flex items-center justify-center text-brand-600 shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-terracotta-500" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-ink-700 dark:text-white">
              Hidden<span className="text-brand-600 dark:text-brand-400">Gems</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav with terracotta active indicator */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-semibold transition-all relative py-1 ${
              isActive("/")
                ? "text-ink-900 dark:text-white font-bold"
                : "text-slate-600 dark:text-slate-300 hover:text-ink-900"
            }`}
          >
            Discover
            {isActive("/") && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-terracotta-500 rounded-full" />
            )}
          </Link>

          <Link
            href="/explore"
            className={`text-sm font-semibold transition-all relative py-1 ${
              isActive("/explore")
                ? "text-ink-900 dark:text-white font-bold"
                : "text-slate-600 dark:text-slate-300 hover:text-ink-900"
            }`}
          >
            Explore Cities
            {isActive("/explore") && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-terracotta-500 rounded-full" />
            )}
          </Link>

          <Link
            href="/places/new"
            className={`text-sm font-semibold transition-all relative py-1 ${
              isActive("/places/new")
                ? "text-ink-900 dark:text-white font-bold"
                : "text-slate-600 dark:text-slate-300 hover:text-ink-900"
            }`}
          >
            Add a Gem
            {isActive("/places/new") && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-terracotta-500 rounded-full" />
            )}
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`text-sm font-semibold transition-all relative py-1 text-red-600 hover:text-red-700`}
            >
              Admin
              {isActive("/admin") && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-red-500 rounded-full" />
              )}
            </Link>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-[#EFECE6] dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-ink-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#E2DDD4] dark:border-slate-800 bg-white dark:bg-slate-900 text-ink-700 dark:text-white shadow-sm hover:border-brand-600 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs font-bold text-ink-700 dark:text-white truncate max-w-[90px]">
                  {user.name.split(" ")[0]}
                </div>
              </Link>

              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full text-xs font-bold bg-ink-700 hover:bg-ink-800 text-white shadow-sm transition-all"
            >
              Login / Sign Up
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-sand-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAE5DD] dark:border-slate-800 bg-[#FAF7F2] dark:bg-[#16191F] px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#EFECE6]"
          >
            Discover
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#EFECE6]"
          >
            <Compass className="w-4 h-4 text-brand-600" />
            Explore Cities & Map
          </Link>
          <Link
            href="/places/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#EFECE6]"
          >
            <PlusCircle className="w-4 h-4 text-terracotta-500" />
            Add a Hidden Gem
          </Link>
          {user && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#EFECE6]"
            >
              <UserIcon className="w-4 h-4 text-brand-600" />
              My Profile & Saved Lists
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
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

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Search,
  Plus,
  Bookmark,
  Crown,
  Disc as DiscordIcon,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface BuildCoresTopNavbarProps {
  onOpenSearch: () => void;
  onOpenPro: () => void;
  onNewBuild: () => void;
  savedBuildCount: number;
}

export const BuildCoresTopNavbar: React.FC<BuildCoresTopNavbarProps> = ({
  onOpenSearch,
  onOpenPro,
  onNewBuild,
  savedBuildCount,
}) => {
  return (
    <header className="shrink-0 z-40 bg-charcoal-950 border-b border-charcoal-800/80 select-none">
      {/* Top Sponsor / Announcement Bar matching BuildCores screenshot */}
      <div className="bg-black py-1 px-4 text-center text-[11px] text-charcoal-400 border-b border-charcoal-800/50 flex items-center justify-center gap-2">
        <span className="font-semibold text-charcoal-300">
          Sponsored: Spec it yourself, we&apos;ll verify it.
        </span>
        <span className="hidden sm:inline text-charcoal-400">
          100% Indian Retailer Compatibility & Real INR Pricing Guaranteed!
        </span>
      </div>

      {/* Main Top Header Bar */}
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Identity & Community Badges */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-magenta-accent flex items-center justify-center text-white shadow-magenta-sm group-hover:shadow-magenta-glow transition-all">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base tracking-tight font-sans">
                SYSTEM MAKER
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-magenta-950 text-magenta-300 border border-magenta-700/60 font-bold uppercase tracking-wider">
                CORE INDIA
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar with Ctrl+K shortcut */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-700 hover:border-magenta-500/80 text-charcoal-400 hover:text-charcoal-200 text-xs sm:text-sm font-medium transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-magenta-400 group-hover:scale-110 transition-transform" />
              <span className="truncate">Search parts, CPUs, GPUs, motherboards...</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-charcoal-800 border border-charcoal-700 text-[10px] text-charcoal-300 font-mono">
              <span>Ctrl+K</span>
            </div>
          </button>
        </div>

        {/* Right: Currency, Builds List, Create New Build, Pro */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Currency pill */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-charcoal-900 border border-charcoal-800 text-[11px] font-bold text-charcoal-300">
            <span>🇮🇳</span>
            <span>INR (₹)</span>
          </div>

          {/* Builds List */}
          <Link
            href="/saved-builds"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-charcoal-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Builds List</span>
            {savedBuildCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-700/60">
                {savedBuildCount}
              </span>
            )}
          </Link>

          {/* Create New Build */}
          <button
            onClick={onNewBuild}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Build</span>
          </button>

          {/* PRO Button */}
          <button
            onClick={onOpenPro}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-magenta-accent to-pink-600 hover:from-magenta-500 hover:to-pink-500 text-white font-black text-xs shadow-magenta-sm transition-all active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>PRO</span>
          </button>
        </div>
      </div>
    </header>
  );
};

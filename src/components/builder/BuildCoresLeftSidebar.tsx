'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Package,
  Trophy,
  Tag,
  Scale,
  Image as ImageIcon,
  Bell,
  BookOpen,
  Users,
  Info,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Disc as DiscordIcon,
  MessageSquare,
} from 'lucide-react';

interface BuildCoresLeftSidebarProps {
  onOpenDeals: () => void;
  onOpenUpdates: () => void;
  onOpenGuides: () => void;
  onOpenGallery: () => void;
  onNewBuild: () => void;
  className?: string;
}

export const BuildCoresLeftSidebar: React.FC<BuildCoresLeftSidebarProps> = ({
  onOpenDeals,
  onOpenUpdates,
  onOpenGuides,
  onOpenGallery,
  onNewBuild,
  className = '',
}) => {
  return (
    <aside
      className={`w-56 shrink-0 bg-charcoal-950/80 border-r border-charcoal-800/80 flex flex-col justify-between p-3 select-none text-xs ${className}`}
    >
      <div className="space-y-5">
        {/* Community Quick Links (Discord, Reddit) matching BuildCores */}
        <div className="grid grid-cols-2 gap-1.5">
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#5865F2]/15 text-[#5865F2] hover:bg-[#5865F2]/25 font-semibold text-[11px] transition-colors border border-[#5865F2]/30"
          >
            <DiscordIcon className="w-3.5 h-3.5" />
            <span>Discord</span>
          </a>
          <a
            href="https://reddit.com/r/IndianGaming"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FF4500]/15 text-[#FF4500] hover:bg-[#FF4500]/25 font-semibold text-[11px] transition-colors border border-[#FF4500]/30"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reddit</span>
          </a>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          {/* 2D Builder (Active) */}
          <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-charcoal-850 text-white font-semibold shadow-sm border border-charcoal-700/60">
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-magenta-400" />
              <span>2D Builder</span>
            </div>
            <button
              onClick={onNewBuild}
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-magenta-600/30 text-magenta-300 border border-magenta-500/40 hover:bg-magenta-600 hover:text-white transition-colors"
              title="Start a fresh configuration"
            >
              + New
            </button>
          </div>

          {/* Products / Catalog */}
          <Link
            href="/components"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-850 transition-colors"
          >
            <Package className="w-4 h-4 text-charcoal-400" />
            <span>Products</span>
          </Link>

          {/* Completed / Saved Builds */}
          <Link
            href="/saved-builds"
            className="flex items-center justify-between px-2.5 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-850 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Saved Builds</span>
            </div>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60">
              Saved
            </span>
          </Link>
        </div>

        {/* Section: Useful Tools */}
        <div className="space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
            Useful Tools
          </div>

          {/* Sales & Deals */}
          <button
            onClick={onOpenDeals}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-850 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-orange-400" />
              <span>Sales & Deals</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-950/80 text-orange-300 border border-orange-700/60">
              Hot Deals
            </span>
          </button>

          {/* 2D Compare */}
          <Link
            href="/compare"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-850 transition-colors"
          >
            <Scale className="w-4 h-4 text-charcoal-400" />
            <span>2D Compare</span>
          </Link>

          {/* 2D Part Gallery */}
          <button
            onClick={onOpenGallery}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-850 transition-colors text-left"
          >
            <ImageIcon className="w-4 h-4 text-charcoal-400" />
            <span>Part Gallery</span>
          </button>
        </div>

        {/* Section: Community */}
        <div className="space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
            Community
          </div>

          {/* Updates */}
          <button
            onClick={onOpenUpdates}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-850 transition-colors text-left"
          >
            <Bell className="w-4 h-4 text-charcoal-400" />
            <span>Updates</span>
          </button>

          {/* Hardware Guides */}
          <button
            onClick={onOpenGuides}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-850 transition-colors text-left"
          >
            <BookOpen className="w-4 h-4 text-charcoal-400" />
            <span>Hardware Guides</span>
          </button>

          {/* About */}
          <Link
            href="/about"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-850 transition-colors"
          >
            <Info className="w-4 h-4 text-charcoal-400" />
            <span>About System Maker Core</span>
          </Link>
        </div>
      </div>

      {/* Bottom Promo Card matching BuildCores screenshot */}
      <div className="pt-4 border-t border-charcoal-800/80">
        <div className="relative rounded-xl p-3 bg-gradient-to-br from-charcoal-900 to-black border border-magenta-900/40 overflow-hidden group shadow-md">
          {/* Subtle glow */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-magenta-600/20 rounded-full blur-xl pointer-events-none group-hover:bg-magenta-600/30 transition-all" />

          <div className="relative z-10 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-magenta-400">
              BUILD YOUR DREAM PC
            </div>
            <p className="text-[11px] text-charcoal-300 leading-tight">
              Verified Indian retailers with transparent INR pricing.
            </p>
            <Link
              href="/components"
              className="inline-flex items-center justify-center w-full py-1.5 px-3 rounded-lg bg-magenta-accent hover:bg-magenta-600 text-white font-bold text-[11px] shadow-sm transition-all"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, ShieldCheck, ExternalLink, IndianRupee, Heart } from 'lucide-react';
import { INDIAN_RETAILERS } from '@/data/retailerAdapters';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  if (pathname === '/builder') {
    return (
      <footer className="shrink-0 bg-charcoal-950 border-t border-charcoal-800/80 text-charcoal-400 text-[11px] py-1.5 px-4 select-none">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-full">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-bold text-white">SYSTEM MAKER CORE INDIA 2D</span>
            <span className="text-charcoal-600">•</span>
            <Link href="/components" className="hover:text-white transition-colors">
              Component Catalog
            </Link>
            <span className="text-charcoal-600">•</span>
            <Link href="/compare" className="hover:text-white transition-colors">
              2D Compare
            </Link>
            <span className="text-charcoal-600">•</span>
            <Link href="/saved-builds" className="hover:text-white transition-colors">
              Completed Builds
            </Link>
            <span className="text-charcoal-600">•</span>
            <Link href="/about" className="hover:text-white transition-colors">
              Data Methodology & Affiliate Disclosure
            </Link>
          </div>
          <div className="text-[10px] text-charcoal-400 flex items-center gap-1.5">
            <span>Owners:</span>
            <span className="text-magenta-400 font-bold">Rohan RoshanBhai Shekh</span>
            <span>•</span>
            <span className="text-magenta-400 font-bold">Joshi Priyanshi Premdatt</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-charcoal-950 border-t border-charcoal-800 text-charcoal-300 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-magenta-accent flex items-center justify-center text-white">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight font-sans">
                SYSTEM MAKER CORE <span className="text-magenta-400">INDIA</span>
              </span>
            </div>
            <p className="text-charcoal-400 text-xs leading-relaxed">
              India&apos;s transparent 2D desktop PC configurator. Built to verify hardware compatibility, compute realistic INR pricing, and prevent costly component mismatch.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Dedicated Hardware Compatibility Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/builder" className="hover:text-magenta-300 transition-colors">
                  Custom PC Builder
                </Link>
              </li>
              <li>
                <Link href="/components" className="hover:text-magenta-300 transition-colors">
                  Component Catalog
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-magenta-300 transition-colors">
                  Side-by-Side Comparison
                </Link>
              </li>
              <li>
                <Link href="/saved-builds" className="hover:text-magenta-300 transition-colors">
                  Saved Configurations
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-magenta-300 transition-colors">
                  Data Methodology & Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Indian Hardware Retailers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Indian Hardware Hubs</h4>
            <p className="text-[11px] text-charcoal-400 mb-2">
              Compare availability across prominent Indian distributors:
            </p>
            <ul className="space-y-1.5 text-xs">
              {INDIAN_RETAILERS.map((ret) => (
                <li key={ret.id}>
                  <a
                    href={ret.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-magenta-300 transition-colors"
                  >
                    <span>{ret.name}</span>
                    <ExternalLink className="w-3 h-3 text-charcoal-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparent Notice */}
          <div className="space-y-2 bg-charcoal-900/60 p-4 rounded-xl border border-charcoal-800">
            <div className="flex items-center gap-1.5 text-charcoal-200 font-semibold text-xs">
              <IndianRupee className="w-3.5 h-3.5 text-magenta-400" />
              <span>Transparent Pricing Notice</span>
            </div>
            <p className="text-[11px] text-charcoal-400 leading-relaxed">
              Component prices are based on verified local Indian distributor catalog references and include 18% standard GST where applicable. Retail availability and daily pricing fluctuate based on currency exchange and merchant inventory.
            </p>
            <p className="text-[10px] text-charcoal-500 pt-1">
              No sponsored bias or fabricated FPS claims.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-charcoal-850 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} System Maker Core India. All trademarks and brand logos belong to their respective owners.</p>
          <div className="flex flex-col sm:items-end text-xs text-charcoal-400 gap-1">
            <div className="flex items-center gap-1.5 text-charcoal-300">
              <span className="text-charcoal-400">Owners:</span>
              <span className="text-magenta-400 font-bold">Rohan RoshanBhai Shekh</span>
              <span className="text-charcoal-500">•</span>
              <span className="text-magenta-400 font-bold">Joshi Priyanshi Premdatt</span>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-charcoal-500">
              <span>Engineered with precision for the Indian PC Building Community</span>
              <Heart className="w-3 h-3 text-magenta-500 fill-magenta-500" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  Cpu,
  Layers,
  Scale,
  Bookmark,
  Info,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { LocalBuildStorage } from '@/storage/localStorage';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedBuildCount, setSavedBuildCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const builds = LocalBuildStorage.getSavedBuilds();
      setSavedBuildCount(builds.length);
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    // Custom event to update count when builds change in the same tab
    window.addEventListener('pcdost:build-saved', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('pcdost:build-saved', updateCount);
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Sparkles },
    { href: '/builder', label: 'PC Builder', icon: Wrench },
    { href: '/components', label: 'Components', icon: Cpu },
    { href: '/compare', label: 'Compare', icon: Scale },
    { href: '/saved-builds', label: 'Saved Builds', icon: Bookmark, badge: savedBuildCount },
    { href: '/about', label: 'About & Transparency', icon: Info },
  ];

  // The builder studio page renders its dedicated BuildCores studio top navigation
  if (pathname === '/builder') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-charcoal-950/90 backdrop-blur-md border-b border-charcoal-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-magenta-accent via-magenta-700 to-charcoal-900 flex items-center justify-center p-0.5 shadow-magenta-sm group-hover:shadow-magenta-glow transition-all">
              <div className="w-full h-full bg-charcoal-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-magenta-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  SYSTEM MAKER
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-magenta-950/80 text-magenta-300 border border-magenta-700/60 font-semibold tracking-wider">
                  CORE INDIA
                </span>
              </div>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-widest hidden sm:block">
                Custom PC Configurator & Compatibility
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-magenta-950/50 text-magenta-300 border border-magenta-800/50 shadow-sm'
                      : 'text-charcoal-300 hover:text-white hover:bg-charcoal-850'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-magenta-400' : 'text-charcoal-400'}`} />
                  <span>{link.label}</span>
                  {Boolean(link.badge) && (
                    <span className="ml-1 px-1.5 py-0.2 bg-magenta-600 text-white text-[10px] rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-magenta-accent hover:bg-magenta-600 rounded-lg shadow-magenta-sm hover:shadow-magenta-glow transition-all active:scale-95"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Start Building</span>
            </Link>
          </div>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-850 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-charcoal-800 bg-charcoal-900/98 backdrop-blur-lg px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-magenta-950/60 text-magenta-300 border border-magenta-700/50'
                    : 'text-charcoal-300 hover:text-white hover:bg-charcoal-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-magenta-400' : 'text-charcoal-400'}`} />
                  <span>{link.label}</span>
                </div>
                {Boolean(link.badge) && (
                  <span className="px-2 py-0.5 bg-magenta-600 text-white text-xs rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3">
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-magenta-accent hover:bg-magenta-600 rounded-lg shadow-magenta-sm transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>Configure Your Custom PC</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

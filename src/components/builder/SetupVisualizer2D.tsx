'use client';

import React from 'react';
import { BuildComponents, ComponentCategory } from '@/types';
import { InrPrice } from '@/components/common/InrPrice';
import { Monitor, Keyboard, Mouse, Cpu, Sparkles } from 'lucide-react';

interface SetupVisualizer2DProps {
  components: BuildComponents;
  onSelectCategory: (cat: ComponentCategory) => void;
  rgbTheme: 'magenta' | 'cyberpunk' | 'arctic' | 'stealth';
  dualDisplays?: boolean;
}

export const SetupVisualizer2D: React.FC<SetupVisualizer2DProps> = ({
  components,
  onSelectCategory,
  rgbTheme,
  dualDisplays = false,
}) => {
  const { monitor, keyboard, mouse, cabinet, cpu, gpu } = components;

  const rgbColorMap = {
    magenta: { primary: '#ec4899', secondary: '#f43f5e', glow: 'rgba(236,72,153,0.35)' },
    cyberpunk: { primary: '#06b6d4', secondary: '#3b82f6', glow: 'rgba(6,182,212,0.35)' },
    arctic: { primary: '#f8fafc', secondary: '#94a3b8', glow: 'rgba(248,250,252,0.3)' },
    stealth: { primary: '#475569', secondary: '#1e293b', glow: 'rgba(71,85,105,0.15)' },
  };

  const themeColors = rgbColorMap[rgbTheme] || rgbColorMap.magenta;

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[620px] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-[#0b0f19] rounded-2xl overflow-hidden border border-charcoal-800 shadow-2xl flex items-center justify-center p-4 select-none">
      {/* Wall RGB Ambient Backlight */}
      <div
        className="absolute inset-x-12 top-6 h-48 rounded-full blur-3xl opacity-40 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${themeColors.primary} 0%, ${themeColors.secondary} 50%, transparent 80%)`,
        }}
      />

      {/* SVG Canvas for Desk Battlestation */}
      <svg
        viewBox="0 0 1000 620"
        className="w-full h-full object-contain filter drop-shadow-lg"
      >
        <defs>
          {/* Desk Gradient */}
          <linearGradient id="deskSurfaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e222d" />
            <stop offset="15%" stopColor="#181b24" />
            <stop offset="100%" stopColor="#0f1117" />
          </linearGradient>

          {/* Desk Bevel Edge */}
          <linearGradient id="deskEdgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#333b4e" />
            <stop offset="100%" stopColor="#13161c" />
          </linearGradient>

          {/* Screen Wallpaper Gradient */}
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="50%" stopColor={themeColors.secondary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={themeColors.primary} stopOpacity="0.6" />
          </linearGradient>

          {/* RGB Lightstrip Underglow */}
          <linearGradient id="lightstripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={themeColors.secondary} stopOpacity="0.2" />
            <stop offset="50%" stopColor={themeColors.primary} stopOpacity="0.9" />
            <stop offset="100%" stopColor={themeColors.secondary} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* ================= DESK & ROOM ================= */}
        {/* Wall baseboard */}
        <line x1="0" y1="410" x2="1000" y2="410" stroke="#1f2937" strokeWidth="2" />

        {/* Ambient Under-Desk RGB Glow */}
        <rect
          x="120"
          y="435"
          width="760"
          height="8"
          fill="url(#lightstripGrad)"
          filter="drop-shadow(0 0 12px ${themeColors.primary})"
        />

        {/* Desk Surface (isometric perspective) */}
        <polygon
          points="60,420 940,420 990,560 10,560"
          fill="url(#deskSurfaceGrad)"
          stroke="#2d3748"
          strokeWidth="1.5"
        />

        {/* Desk Front Edge */}
        <polygon
          points="10,560 990,560 990,590 10,590"
          fill="url(#deskEdgeGrad)"
          stroke="#1a202c"
          strokeWidth="1"
        />

        {/* Desk Legs */}
        <rect x="70" y="590" width="30" height="30" fill="#0d1117" />
        <rect x="900" y="590" width="30" height="30" fill="#0d1117" />

        {/* Large Desk Mat */}
        <rect
          x="180"
          y="460"
          width="540"
          height="90"
          rx="8"
          fill="#0c0e14"
          stroke="#262c3a"
          strokeWidth="1.5"
        />
        {/* Desk Mat RGB Border */}
        <rect
          x="182"
          y="462"
          width="536"
          height="86"
          rx="6"
          fill="none"
          stroke={themeColors.primary}
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* ================= MONITOR (MAIN) ================= */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectCategory('monitor')}
        >
          {/* Monitor Stand Base */}
          <ellipse cx="440" cy="460" rx="65" ry="14" fill="#1e2433" stroke="#333f56" strokeWidth="1.5" />
          {/* Monitor Neck */}
          <rect x="432" y="340" width="16" height="120" rx="3" fill="#151922" stroke="#2a3449" strokeWidth="1" />

          {/* Screen Outer Frame */}
          <rect
            x={dualDisplays ? '220' : '260'}
            y="140"
            width={dualDisplays ? '340' : '380'}
            height="215"
            rx="6"
            fill="#090b10"
            stroke="#374151"
            strokeWidth="3"
            className="group-hover:stroke-magenta-500 transition-colors"
          />

          {/* Screen Glass / Display Content */}
          <rect
            x={dualDisplays ? '226' : '266'}
            y="146"
            width={dualDisplays ? '328' : '368'}
            height="203"
            rx="4"
            fill="url(#screenGrad)"
          />

          {/* Screen Content Graphic */}
          <g opacity="0.85">
            {/* Window bar */}
            <rect x={dualDisplays ? '236' : '276'} y="156" width={dualDisplays ? '308' : '348'} height="18" rx="3" fill="#0f172a" fillOpacity="0.7" />
            <circle cx={dualDisplays ? '246' : '286'} cy="165" r="3" fill="#f43f5e" />
            <circle cx={dualDisplays ? '256' : '296'} cy="165" r="3" fill="#fbbf24" />
            <circle cx={dualDisplays ? '266' : '306'} cy="165" r="3" fill="#10b981" />
            <text
              x={dualDisplays ? '380' : '440'}
              y="169"
              fill="#94a3b8"
              fontSize="9"
              textAnchor="middle"
              fontWeight="bold"
            >
              SYSTEM MAKER CORE INDIA — BATTLESTATION
            </text>

            {/* In-game HUD overlay */}
            <rect x={dualDisplays ? '246' : '286'} y="190" width="90" height="50" rx="4" fill="#000" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="0.5" />
            <text x={dualDisplays ? '254' : '294'} y="206" fill="#38bdf8" fontSize="10" fontWeight="bold">
              144 FPS
            </text>
            <text x={dualDisplays ? '254' : '294'} y="222" fill="#94a3b8" fontSize="8">
              GPU: 62°C | 99%
            </text>
          </g>

          {/* Monitor Label Tag */}
          <g transform={`translate(${dualDisplays ? 320 : 380}, 370)`}>
            <rect x="0" y="0" width="120" height="24" rx="12" fill="#0f172a" fillOpacity="0.9" stroke="#374151" className="group-hover:stroke-magenta-400" />
            <text x="60" y="16" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
              {monitor ? monitor.name.split(' ')[0] + ' ' + (monitor.name.split(' ')[1] || '') : '+ Add Monitor'}
            </text>
          </g>
        </g>

        {/* ================= SECONDARY DISPLAY (IF TOGGLED) ================= */}
        {dualDisplays && (
          <g
            className="cursor-pointer group"
            onClick={() => onSelectCategory('monitor')}
          >
            {/* Angled vertical / secondary monitor on left */}
            <rect
              x="90"
              y="160"
              width="110"
              height="220"
              rx="6"
              fill="#090b10"
              stroke="#374151"
              strokeWidth="2.5"
              className="group-hover:stroke-magenta-500 transition-colors"
            />
            <rect
              x="95"
              y="165"
              width="100"
              height="210"
              rx="4"
              fill="url(#screenGrad)"
              opacity="0.7"
            />
            <text x="145" y="270" fill="#cbd5e1" fontSize="9" textAnchor="middle" fontWeight="bold">
              Discord / Spotify
            </text>
          </g>
        )}

        {/* ================= PC TOWER ON DESK ================= */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectCategory('cabinet')}
        >
          {/* PC Shadow */}
          <ellipse cx="800" cy="460" rx="80" ry="25" fill="#000" fillOpacity="0.6" />

          {/* PC Chassis Outer Shell */}
          <rect
            x="720"
            y="200"
            width="170"
            height="270"
            rx="8"
            fill="#0f131c"
            stroke="#2d3748"
            strokeWidth="2.5"
            className="group-hover:stroke-magenta-500 transition-colors"
          />

          {/* Tempered Glass Window */}
          <rect
            x="728"
            y="210"
            width="150"
            height="240"
            rx="5"
            fill="#080a10"
            stroke="#1f2937"
            strokeWidth="1.5"
          />

          {/* Internal Components Lighting Simulation */}
          <g>
            {/* Motherboard & Internal RGB glow */}
            <circle cx="800" cy="270" r="35" fill={themeColors.primary} fillOpacity="0.25" filter="blur(10px)" />

            {/* CPU Cooler Fan Ring */}
            <circle cx="780" cy="270" r="22" fill="none" stroke={themeColors.primary} strokeWidth="3" />
            <circle cx="780" cy="270" r="8" fill="#1e293b" />

            {/* RAM RGB Bars */}
            <rect x="815" y="250" width="3" height="30" fill={themeColors.primary} rx="1" />
            <rect x="822" y="250" width="3" height="30" fill={themeColors.secondary} rx="1" />

            {/* Horizontal GPU */}
            <rect
              x="740"
              y="320"
              width="120"
              height="30"
              rx="4"
              fill="#181e2b"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* GPU RGB Lightstrip */}
            <rect x="746" y="324" width="108" height="3" fill={themeColors.primary} rx="1" />

            {/* Front Fans Glass reflection */}
            <line x1="730" y1="215" x2="870" y2="445" stroke="#fff" strokeWidth="1" strokeOpacity="0.08" />
          </g>

          {/* Case Label Tag */}
          <g transform="translate(735, 480)">
            <rect x="0" y="0" width="140" height="24" rx="12" fill="#0f172a" fillOpacity="0.9" stroke="#374151" className="group-hover:stroke-magenta-400" />
            <text x="70" y="16" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
              {cabinet ? cabinet.name.split(' ')[0] + ' ' + (cabinet.name.split(' ')[1] || '') : '+ Add PC Case'}
            </text>
          </g>
        </g>

        {/* ================= KEYBOARD ================= */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectCategory('keyboard')}
        >
          {/* Keyboard Chassis */}
          <polygon
            points="290,480 490,480 495,530 285,530"
            fill="#121620"
            stroke="#2e384d"
            strokeWidth="1.5"
            className="group-hover:stroke-magenta-500 transition-colors"
          />
          {/* Keycaps Grid RGB effect */}
          <rect
            x="298"
            y="486"
            width="184"
            height="38"
            rx="3"
            fill="#090b10"
            stroke={themeColors.primary}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Key row dots */}
          <circle cx="315" cy="495" r="2.5" fill={themeColors.primary} opacity="0.8" />
          <circle cx="330" cy="495" r="2.5" fill={themeColors.primary} opacity="0.8" />
          <circle cx="345" cy="495" r="2.5" fill={themeColors.secondary} opacity="0.8" />
          <circle cx="360" cy="495" r="2.5" fill={themeColors.secondary} opacity="0.8" />
          <circle cx="375" cy="495" r="2.5" fill={themeColors.secondary} opacity="0.8" />
          <rect x="340" y="514" width="70" height="5" rx="2" fill={themeColors.primary} opacity="0.7" />

          {/* Label */}
          <g transform="translate(330, 540)">
            <rect x="0" y="0" width="120" height="20" rx="10" fill="#0f172a" fillOpacity="0.9" stroke="#374151" className="group-hover:stroke-magenta-400" />
            <text x="60" y="14" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
              {keyboard ? keyboard.name.split(' ')[0] : '+ Add Keyboard'}
            </text>
          </g>
        </g>

        {/* ================= MOUSE ================= */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectCategory('mouse')}
        >
          {/* Mouse Shell */}
          <ellipse
            cx="580"
            cy="500"
            rx="18"
            ry="26"
            fill="#151a24"
            stroke="#333f54"
            strokeWidth="1.5"
            className="group-hover:stroke-magenta-500 transition-colors"
          />
          {/* Mouse RGB Scroll Wheel & Logo */}
          <rect x="578" y="482" width="4" height="10" rx="2" fill={themeColors.primary} />
          <circle cx="580" cy="510" r="3" fill={themeColors.secondary} opacity="0.8" />

          {/* Label */}
          <g transform="translate(535, 540)">
            <rect x="0" y="0" width="90" height="20" rx="10" fill="#0f172a" fillOpacity="0.9" stroke="#374151" className="group-hover:stroke-magenta-400" />
            <text x="45" y="14" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
              {mouse ? mouse.name.split(' ')[0] : '+ Add Mouse'}
            </text>
          </g>
        </g>

        {/* Desktop Studio Speakers */}
        <g>
          {/* Left Speaker */}
          <rect x="180" y="320" width="30" height="70" rx="4" fill="#111622" stroke="#252e40" strokeWidth="1" />
          <circle cx="195" cy="340" r="8" fill="#1e2638" />
          <circle cx="195" cy="365" r="11" fill="#1e2638" />

          {/* Right Speaker */}
          <rect x="670" y="320" width="30" height="70" rx="4" fill="#111622" stroke="#252e40" strokeWidth="1" />
          <circle cx="685" cy="340" r="8" fill="#1e2638" />
          <circle cx="685" cy="365" r="11" fill="#1e2638" />
        </g>
      </svg>
    </div>
  );
};

'use client';

import React from 'react';
import { BuildComponents, ComponentCategory } from '@/types';
import { rigAudio } from '@/lib/audio/rigAudio';

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
  const { monitor, keyboard, mouse, cabinet } = components;

  const rgbColorMap = {
    magenta: { primary: '#ec4899', secondary: '#f43f5e', glow: 'rgba(236,72,153,0.35)' },
    cyberpunk: { primary: '#06b6d4', secondary: '#3b82f6', glow: 'rgba(6,182,212,0.35)' },
    arctic: { primary: '#f8fafc', secondary: '#94a3b8', glow: 'rgba(248,250,252,0.3)' },
    stealth: { primary: '#475569', secondary: '#1e293b', glow: 'rgba(71,85,105,0.15)' },
  };

  const themeColors = rgbColorMap[rgbTheme] || rgbColorMap.magenta;

  const handleClickWithAudio = (cat: ComponentCategory) => {
    rigAudio.playLatchClick();
    onSelectCategory(cat);
  };

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[620px] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-[#0b0f19] rounded-2xl overflow-hidden border border-charcoal-800 shadow-2xl flex items-center justify-center p-4 select-none">
      {/* Wall RGB Ambient Backlight (Synchronized with RGB Theme) */}
      <div
        className="absolute inset-x-12 top-6 h-56 rounded-full blur-3xl opacity-45 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${themeColors.primary} 0%, ${themeColors.secondary} 45%, transparent 75%)`,
        }}
      />

      {/* SVG Canvas for Desk Battlestation */}
      <svg
        viewBox="0 0 1000 620"
        className="w-full h-full object-contain filter drop-shadow-lg"
      >
        <defs>
          {/* Dark Walnut Wood Grain Desk Surface */}
          <linearGradient id="walnutDeskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c2018" />
            <stop offset="25%" stopColor="#1f1610" />
            <stop offset="70%" stopColor="#17100b" />
            <stop offset="100%" stopColor="#0e0a07" />
          </linearGradient>

          {/* Chamfered Polished Front Edge */}
          <linearGradient id="deskEdgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#453123" />
            <stop offset="35%" stopColor="#251a13" />
            <stop offset="100%" stopColor="#100b08" />
          </linearGradient>

          {/* Screen Bloom Light Spill onto Desk */}
          <radialGradient id="screenBloomGrad" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor={themeColors.primary} stopOpacity="0.4" />
            <stop offset="50%" stopColor={themeColors.secondary} stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* RGB Lightstrip Underglow */}
          <linearGradient id="lightstripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={themeColors.secondary} stopOpacity="0.2" />
            <stop offset="50%" stopColor={themeColors.primary} stopOpacity="0.95" />
            <stop offset="100%" stopColor={themeColors.secondary} stopOpacity="0.2" />
          </linearGradient>

          {/* High-Tech Display Wallpaper Gradient */}
          <linearGradient id="cyberpunkScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b0f19" />
            <stop offset="40%" stopColor="#1e112a" />
            <stop offset="70%" stopColor={themeColors.secondary} stopOpacity="0.6" />
            <stop offset="100%" stopColor={themeColors.primary} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* ================= DESK & ROOM ================= */}
        {/* Wall Baseboard Line */}
        <line x1="0" y1="410" x2="1000" y2="410" stroke="#1f2937" strokeWidth="2" />

        {/* Ambient Under-Desk RGB Lightstrip Glow */}
        <rect
          x="100"
          y="435"
          width="800"
          height="8"
          fill="url(#lightstripGrad)"
          filter="drop-shadow(0 0 14px ${themeColors.primary})"
        />

        {/* Desk Surface (Dark Walnut Solid Hardwood) */}
        <polygon
          points="60,420 940,420 990,560 10,560"
          fill="url(#walnutDeskGrad)"
          stroke="#3d2a1d"
          strokeWidth="1.5"
        />

        {/* Wood Grain Highlights */}
        <path d="M 120 450 Q 500 445, 880 450" stroke="#3a271b" strokeWidth="1" fill="none" opacity="0.4" />
        <path d="M 90 490 Q 500 482, 910 490" stroke="#3a271b" strokeWidth="1.2" fill="none" opacity="0.35" />
        <path d="M 50 530 Q 500 520, 950 530" stroke="#3a271b" strokeWidth="1" fill="none" opacity="0.3" />

        {/* Screen Ambient Bloom Spill onto Desk */}
        <ellipse cx="440" cy="460" rx="260" ry="50" fill="url(#screenBloomGrad)" pointerEvents="none" />

        {/* Desk Front Edge */}
        <polygon
          points="10,560 990,560 990,590 10,590"
          fill="url(#deskEdgeGrad)"
          stroke="#251a13"
          strokeWidth="1"
        />

        {/* Heavy Steel Desk Legs */}
        <rect x="70" y="590" width="30" height="30" fill="#0d1117" />
        <rect x="900" y="590" width="30" height="30" fill="#0d1117" />

        {/* XXL Desk Mat with Micro-woven Stitching */}
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
        {/* Desk Mat RGB Border Lighting */}
        <rect
          x="182"
          y="462"
          width="536"
          height="86"
          rx="6"
          fill="none"
          stroke={themeColors.primary}
          strokeWidth="1.5"
          strokeOpacity="0.75"
        />

        {/* ================= MONITOR (MAIN) ================= */}
        <g
          className="cursor-pointer group"
          onClick={() => handleClickWithAudio('monitor')}
        >
          {/* Heavy Cast Aluminum Monitor Base */}
          <ellipse cx="440" cy="460" rx="70" ry="14" fill="#181e2b" stroke="#333f56" strokeWidth="1.5" />
          {/* Monitor Neck with Cable Pass-through */}
          <rect x="432" y="340" width="16" height="120" rx="3" fill="#131722" stroke="#2a3449" strokeWidth="1" />
          <ellipse cx="440" cy="410" rx="4" ry="12" fill="#0b0e14" />

          {/* Screen Outer Bezel Frame */}
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

          {/* Screen High-Def Display Content */}
          <rect
            x={dualDisplays ? '226' : '266'}
            y="146"
            width={dualDisplays ? '328' : '368'}
            height="203"
            rx="4"
            fill="url(#cyberpunkScreenGrad)"
          />

          {/* Futuristic Cyberpunk City Skyline & Game Telemetry HUD */}
          <g opacity="0.9">
            {/* Top Window Bar */}
            <rect x={dualDisplays ? '236' : '276'} y="156" width={dualDisplays ? '308' : '348'} height="18" rx="3" fill="#0a0e1a" fillOpacity="0.8" />
            <circle cx={dualDisplays ? '246' : '286'} cy="165" r="3" fill="#f43f5e" />
            <circle cx={dualDisplays ? '256' : '296'} cy="165" r="3" fill="#fbbf24" />
            <circle cx={dualDisplays ? '266' : '306'} cy="165" r="3" fill="#10b981" />
            <text
              x={dualDisplays ? '380' : '440'}
              y="169"
              fill="#e2e8f0"
              fontSize="9"
              textAnchor="middle"
              fontWeight="bold"
            >
              SYSTEM MAKER CORE INDIA — ULTIMATE BATTLESTATION
            </text>

            {/* In-game HUD Performance Overlay */}
            <rect x={dualDisplays ? '246' : '286'} y="190" width="105" height="58" rx="4" fill="#000000" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="0.8" />
            <text x={dualDisplays ? '254' : '294'} y="206" fill="#38bdf8" fontSize="11" fontWeight="bold">
              165 FPS · 4K UHD
            </text>
            <text x={dualDisplays ? '254' : '294'} y="222" fill="#4ade80" fontSize="9" fontWeight="bold">
              GPU: 64°C | 99% Load
            </text>
            <text x={dualDisplays ? '254' : '294'} y="236" fill="#fbbf24" fontSize="8.5">
              CPU: 58°C | 4.8 GHz
            </text>
          </g>

          {/* Monitor Badge */}
          <g transform={`translate(${dualDisplays ? 320 : 380}, 370)`}>
            <rect x="0" y="0" width="120" height="24" rx="12" fill="#0f172a" fillOpacity="0.9" stroke="#374151" className="group-hover:stroke-magenta-400" />
            <text x="60" y="16" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
              {monitor ? monitor.name.split(' ')[0] + ' ' + (monitor.name.split(' ')[1] || '') : '+ Add Monitor'}
            </text>
          </g>
        </g>

        {/* ================= SECONDARY DISPLAY (DUAL SETUP) ================= */}
        {dualDisplays && (
          <g
            className="cursor-pointer group"
            onClick={() => handleClickWithAudio('monitor')}
          >
            {/* Angled Vertical Stream Monitor on Left */}
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
              fill="url(#cyberpunkScreenGrad)"
              opacity="0.8"
            />
            <text x="145" y="270" fill="#f8fafc" fontSize="9" textAnchor="middle" fontWeight="bold">
              Chat & OBS Stream
            </text>
          </g>
        )}

        {/* ================= PC TOWER ON DESK ================= */}
        <g
          className="cursor-pointer group"
          onClick={() => handleClickWithAudio('cabinet')}
        >
          {/* Chassis Drop Shadow */}
          <ellipse cx="800" cy="460" rx="85" ry="25" fill="#000000" fillOpacity="0.75" />

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

          {/* Tempered Glass Side Window */}
          <rect
            x="728"
            y="210"
            width="150"
            height="240"
            rx="5"
            fill="#07090e"
            stroke="#1f2937"
            strokeWidth="1.5"
          />

          {/* Internal Hardware Glow */}
          <g>
            {/* Ambient Motherboard RGB Lighting */}
            <circle cx="800" cy="270" r="38" fill={themeColors.primary} fillOpacity="0.3" filter="blur(8px)" />

            {/* Spinning CPU AIO Cooler Head */}
            <g className="spin-fan">
              <circle cx="780" cy="270" r="22" fill="none" stroke={themeColors.primary} strokeWidth="3" />
              <circle cx="780" cy="270" r="8" fill="#1e293b" />
            </g>

            {/* RAM RGB Lightbars */}
            <rect x="815" y="248" width="4" height="32" fill={themeColors.primary} rx="1.5" />
            <rect x="823" y="248" width="4" height="32" fill={themeColors.secondary} rx="1.5" />

            {/* Heavy Graphics Card with Illuminated Edge */}
            <rect
              x="740"
              y="320"
              width="125"
              height="30"
              rx="4"
              fill="#181e2b"
              stroke="#334155"
              strokeWidth="1"
            />
            <rect x="746" y="324" width="112" height="3.5" fill={themeColors.primary} rx="1" />

            {/* Tempered Glass Specular Reflection Streak */}
            <line x1="730" y1="215" x2="870" y2="445" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.14" />
          </g>

          {/* Case Label Tag */}
          <g transform="translate(735, 480)">
            <rect x="0" y="0" width="140" height="24" rx="12" fill="#0f172a" fillOpacity="0.9" stroke="#374151" className="group-hover:stroke-magenta-400" />
            <text x="70" y="16" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
              {cabinet ? cabinet.name.split(' ')[0] + ' ' + (cabinet.name.split(' ')[1] || '') : '+ Add PC Case'}
            </text>
          </g>
        </g>

        {/* ================= MECHANICAL KEYBOARD ================= */}
        <g
          className="cursor-pointer group"
          onClick={() => handleClickWithAudio('keyboard')}
        >
          {/* Keyboard RGB Ambient Underglow */}
          <polygon
            points="285,480 495,480 500,535 280,535"
            fill={themeColors.primary}
            fillOpacity="0.2"
            filter="blur(5px)"
          />
          {/* Keyboard CNC Anodized Aluminum Chassis */}
          <polygon
            points="290,480 490,480 495,530 285,530"
            fill="#121620"
            stroke="#2e384d"
            strokeWidth="1.5"
            className="group-hover:stroke-magenta-500 transition-colors"
          />
          {/* Keycaps Grid with Individual Switch Glow */}
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
          <circle cx="315" cy="495" r="2.5" fill={themeColors.primary} opacity="0.85" />
          <circle cx="330" cy="495" r="2.5" fill={themeColors.primary} opacity="0.85" />
          <circle cx="345" cy="495" r="2.5" fill={themeColors.secondary} opacity="0.85" />
          <circle cx="360" cy="495" r="2.5" fill={themeColors.secondary} opacity="0.85" />
          <circle cx="375" cy="495" r="2.5" fill={themeColors.secondary} opacity="0.85" />
          <rect x="340" y="514" width="70" height="5" rx="2" fill={themeColors.primary} opacity="0.8" />

          {/* Label */}
          <g transform="translate(330, 540)">
            <rect x="0" y="0" width="120" height="20" rx="10" fill="#0f172a" fillOpacity="0.9" stroke="#374151" className="group-hover:stroke-magenta-400" />
            <text x="60" y="14" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
              {keyboard ? keyboard.name.split(' ')[0] : '+ Add Keyboard'}
            </text>
          </g>
        </g>

        {/* ================= ERGONOMIC GAMING MOUSE ================= */}
        <g
          className="cursor-pointer group"
          onClick={() => handleClickWithAudio('mouse')}
        >
          {/* Mouse Sensor Underglow */}
          <ellipse cx="580" cy="502" rx="22" ry="28" fill={themeColors.primary} fillOpacity="0.25" filter="blur(4px)" />
          {/* Mouse Matte Shell */}
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

        {/* ================= STUDIO MONITORS (SPEAKERS) ================= */}
        <g>
          {/* Left Active Studio Monitor */}
          <rect x="180" y="320" width="30" height="70" rx="4" fill="#111622" stroke="#252e40" strokeWidth="1" />
          <circle cx="195" cy="340" r="8" fill="#1e2638" stroke="#334155" />
          <circle cx="195" cy="365" r="11" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />

          {/* Right Active Studio Monitor */}
          <rect x="670" y="320" width="30" height="70" rx="4" fill="#111622" stroke="#252e40" strokeWidth="1" />
          <circle cx="685" cy="340" r="8" fill="#1e2638" stroke="#334155" />
          <circle cx="685" cy="365" r="11" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};

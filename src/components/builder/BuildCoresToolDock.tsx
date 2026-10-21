'use client';

import React from 'react';
import {
  Crown,
  Fan,
  Sliders,
  Palette,
  Monitor,
  Wrench,
  Wind,
  Camera,
  BarChart3,
} from 'lucide-react';

interface BuildCoresToolDockProps {
  onOpenPro: () => void;
  fanSpeed: 'off' | 'normal' | 'turbo';
  onCycleFanSpeed: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  rgbTheme: 'magenta' | 'cyberpunk' | 'arctic' | 'stealth';
  onCycleRgbTheme: () => void;
  dualDisplays: boolean;
  onToggleDualDisplays: () => void;
  isModdedCables: boolean;
  onToggleModdedCables: () => void;
  showAirflow: boolean;
  onToggleAirflow: () => void;
  onRenderImage: () => void;
  onOpenSummary: () => void;
}

export const BuildCoresToolDock: React.FC<BuildCoresToolDockProps> = ({
  onOpenPro,
  fanSpeed,
  onCycleFanSpeed,
  showLabels,
  onToggleLabels,
  rgbTheme,
  onCycleRgbTheme,
  dualDisplays,
  onToggleDualDisplays,
  isModdedCables,
  onToggleModdedCables,
  showAirflow,
  onToggleAirflow,
  onRenderImage,
  onOpenSummary,
}) => {
  const rgbThemeDisplayNames = {
    magenta: 'Neon Magenta',
    cyberpunk: 'Cyberpunk Cyan',
    arctic: 'Arctic White',
    stealth: 'Stealth Black',
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 select-none">
      <div className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-2xl bg-charcoal-950/90 backdrop-blur-md border border-charcoal-700/80 shadow-2xl overflow-x-auto max-w-[95vw] scrollbar-none">
        {/* PRO Button */}
        <button
          onClick={onOpenPro}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-magenta-600 to-pink-500 hover:from-magenta-500 hover:to-pink-400 text-white font-extrabold text-[11px] shadow-magenta-sm transition-all active:scale-95 shrink-0"
        >
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>PRO</span>
        </button>

        <div className="w-[1px] h-5 bg-charcoal-800 mx-1 shrink-0" />

        {/* Fans Control */}
        <button
          onClick={onCycleFanSpeed}
          className={`flex flex-col items-center justify-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
            fanSpeed !== 'off'
              ? 'bg-magenta-950/60 text-magenta-300 border border-magenta-700/50'
              : 'text-charcoal-400 hover:text-white hover:bg-charcoal-800'
          }`}
          title={`Fan Speed: ${fanSpeed.toUpperCase()} (Click to cycle)`}
        >
          <Fan className={`w-4 h-4 mb-0.5 ${fanSpeed === 'turbo' ? 'animate-spin' : fanSpeed === 'normal' ? 'animate-[spin_2s_linear_infinite]' : ''}`} />
          <span className="text-[9px]">Fans {fanSpeed === 'turbo' ? '⚡' : fanSpeed === 'normal' ? '•' : ''}</span>
        </button>

        {/* Config / Labels Toggle */}
        <button
          onClick={onToggleLabels}
          className={`flex flex-col items-center justify-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
            showLabels
              ? 'bg-charcoal-800 text-white border border-charcoal-600'
              : 'text-charcoal-400 hover:text-white hover:bg-charcoal-800'
          }`}
          title="Toggle Component Labels & Outlines"
        >
          <Sliders className="w-4 h-4 mb-0.5 text-sky-400" />
          <span className="text-[9px]">Config</span>
        </button>

        {/* RGB Theme Switcher */}
        <button
          onClick={onCycleRgbTheme}
          className="flex flex-col items-center justify-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-medium text-charcoal-300 hover:text-white hover:bg-charcoal-800 transition-all shrink-0"
          title={`RGB Theme: ${rgbThemeDisplayNames[rgbTheme]} (Click to change)`}
        >
          <Palette
            className="w-4 h-4 mb-0.5"
            style={{
              color:
                rgbTheme === 'magenta'
                  ? '#ec4899'
                  : rgbTheme === 'cyberpunk'
                  ? '#06b6d4'
                  : rgbTheme === 'arctic'
                  ? '#f8fafc'
                  : '#64748b',
            }}
          />
          <span className="text-[9px]">RGB</span>
        </button>

        {/* Displays (Monitor Setup) */}
        <button
          onClick={onToggleDualDisplays}
          className={`flex flex-col items-center justify-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
            dualDisplays
              ? 'bg-charcoal-800 text-cyan-300 border border-cyan-500/50'
              : 'text-charcoal-400 hover:text-white hover:bg-charcoal-800'
          }`}
          title="Toggle Dual Displays (Setup Mode)"
        >
          <Monitor className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">Displays</span>
        </button>

        {/* Mod (Sleeved cables / custom bracket) */}
        <button
          onClick={onToggleModdedCables}
          className={`flex flex-col items-center justify-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
            isModdedCables
              ? 'bg-magenta-950/60 text-magenta-300 border border-magenta-700/50'
              : 'text-charcoal-400 hover:text-white hover:bg-charcoal-800'
          }`}
          title="Toggle Custom Braided Cables & Bracket"
        >
          <Wrench className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="text-[9px]">Mod</span>
        </button>

        {/* Flow (Airflow Simulation) */}
        <button
          onClick={onToggleAirflow}
          className={`flex flex-col items-center justify-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
            showAirflow
              ? 'bg-sky-950/80 text-sky-300 border border-sky-500/60'
              : 'text-charcoal-400 hover:text-white hover:bg-charcoal-800'
          }`}
          title="Toggle Thermal Airflow Particle Simulation"
        >
          <Wind className="w-4 h-4 mb-0.5 text-sky-400" />
          <span className="text-[9px]">Flow</span>
        </button>

        {/* Render (Canvas Snapshot) */}
        <button
          onClick={onRenderImage}
          className="flex flex-col items-center justify-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-medium text-charcoal-300 hover:text-white hover:bg-charcoal-800 transition-all shrink-0"
          title="Render & Export High-Res Rig Image"
        >
          <Camera className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span className="text-[9px]">Render</span>
        </button>

        {/* Summary (Overview) */}
        <button
          onClick={onOpenSummary}
          className="flex flex-col items-center justify-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-medium text-charcoal-300 hover:text-white hover:bg-charcoal-800 transition-all shrink-0"
          title="Open Build Summary & Telemetry Sheet"
        >
          <BarChart3 className="w-4 h-4 mb-0.5 text-magenta-400" />
          <span className="text-[9px]">Summary</span>
        </button>
      </div>
    </div>
  );
};

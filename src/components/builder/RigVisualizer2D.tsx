'use client';

import React, { useState } from 'react';
import { BuildComponents, Component, ComponentCategory } from '@/types';
import { CATEGORY_LABELS, ComponentIcon } from '@/components/common/ComponentIcon';
import { Component2DImage } from '@/components/common/Component2DImage';
import { InrPrice } from '@/components/common/InrPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Eye,
  Info,
  Layers,
  Activity,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Tag,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import {
  VisualizerLayerId,
  ZoomLevel,
  VISUALIZER_LAYERS,
} from '@/lib/visualizer/types';
import {
  getVisualizerHotspots,
  resolveComponentVisualAsset,
} from '@/lib/visualizer/layers';

interface RigVisualizer2DProps {
  components: BuildComponents;
  onSelectCategory: (category: ComponentCategory) => void;
  onRemoveCategory?: (category: ComponentCategory) => void;
  isGpuRequired?: boolean;
}

type RgbTheme = 'magenta' | 'cyberpunk' | 'arctic' | 'stealth';

export const RigVisualizer2D: React.FC<RigVisualizer2DProps> = ({
  components,
  onSelectCategory,
  onRemoveCategory,
  isGpuRequired = false,
}) => {
  const [rgbTheme, setRgbTheme] = useState<RgbTheme>('magenta');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(1);
  const [showCanvasLabels, setShowCanvasLabels] = useState<boolean>(true);
  const [hoveredCategory, setHoveredCategory] = useState<ComponentCategory | null>(null);
  const [focusedCategory, setFocusedCategory] = useState<ComponentCategory | null>(null);

  const {
    cpu,
    motherboard,
    ram,
    gpu,
    storage,
    psu,
    cabinet,
    cooler,
  } = components;

  // 1. Core component completeness metrics
  const coreParts: { cat: ComponentCategory; comp: Component | undefined }[] = [
    { cat: 'cpu', comp: cpu },
    { cat: 'motherboard', comp: motherboard },
    { cat: 'ram', comp: ram },
    { cat: 'gpu', comp: gpu },
    { cat: 'storage', comp: storage },
    { cat: 'psu', comp: psu },
    { cat: 'cabinet', comp: cabinet },
  ];

  const isCpuIgpu = Boolean(cpu && (cpu.specifications as any).integratedGraphics);

  const installedCoreCount = coreParts.filter((p) => {
    if (p.cat === 'gpu' && !p.comp && !isGpuRequired && isCpuIgpu) {
      return true; // Satisfied if CPU provides integrated graphics
    }
    return Boolean(p.comp);
  }).length;

  const totalCoreCount = 7;
  const progressPercent = Math.round((installedCoreCount / totalCoreCount) * 100);

  // 2. Hardware-specific physical attributes
  const moboSpecs = (motherboard?.specifications || {}) as any;
  const isMatxMobo = moboSpecs.formFactor === 'Micro-ATX';
  const moboSocket = moboSpecs.socket || 'AM4';
  const memorySlotCount = moboSpecs.memorySlots || 4;
  const hasWifi = Boolean(moboSpecs.hasWifi);

  const cpuSpecs = (cpu?.specifications || {}) as any;
  const isAmdCpu = cpu?.brand?.toLowerCase().includes('amd') || cpu?.name?.toLowerCase().includes('ryzen');

  const ramSpecs = (ram?.specifications || {}) as any;
  const ramModuleCount = Number(ramSpecs.modules) || 2;
  const ramType = ramSpecs.type || 'DDR4';

  const gpuSpecs = (gpu?.specifications || {}) as any;
  const gpuLength = Number(gpuSpecs.lengthMm) || 240;
  const isTripleFanGpu = gpuLength >= 280 || (gpu?.name && gpu.name.toLowerCase().includes('triple'));
  const gpuWidthSvg = isTripleFanGpu ? 450 : 340;

  const coolerSpecs = (cooler?.specifications || {}) as any;
  const isLiquidCooler =
    coolerSpecs.type === 'Liquid (AIO)' ||
    (cooler?.name && (cooler.name.toLowerCase().includes('liquid') || cooler.name.toLowerCase().includes('aio')));
  const is360Rad = cooler?.name && cooler.name.includes('360');

  const psuSpecs = (psu?.specifications || {}) as any;
  const psuWattage = psuSpecs.wattage || 650;
  const psuEfficiency = psuSpecs.efficiencyRating || '80+ Bronze';

  const cabSpecs = (cabinet?.specifications || {}) as any;
  const isMatxCaseOnly =
    cabSpecs.supportedFormFactors &&
    cabSpecs.supportedFormFactors.includes('Micro-ATX') &&
    !cabSpecs.supportedFormFactors.includes('ATX');

  // 3. Dynamic RGB Lighting Themes
  const getRgbGlow = () => {
    switch (rgbTheme) {
      case 'magenta':
        return {
          primary: '#e02477',
          secondary: '#ff4d94',
          glow: 'rgba(224, 36, 119, 0.45)',
          fanLed: '#ff2d87',
        };
      case 'cyberpunk':
        return {
          primary: '#06b6d4',
          secondary: '#e02477',
          glow: 'rgba(6, 182, 212, 0.45)',
          fanLed: '#00f0ff',
        };
      case 'arctic':
        return {
          primary: '#38bdf8',
          secondary: '#e0f2fe',
          glow: 'rgba(56, 189, 248, 0.45)',
          fanLed: '#ffffff',
        };
      case 'stealth':
      default:
        return {
          primary: '#4b5563',
          secondary: '#374151',
          glow: 'rgba(75, 85, 99, 0.1)',
          fanLed: '#27272a',
        };
    }
  };

  const colors = getRgbGlow();
  const activeInspection = hoveredCategory || focusedCategory;
  const activeComponent = activeInspection ? components[activeInspection] : null;
  const activeAssetMetadata = activeInspection
    ? resolveComponentVisualAsset(activeInspection, activeComponent || undefined)
    : null;

  // Hotspots registry
  const hotspots = getVisualizerHotspots(components, isGpuRequired);

  // Zoom helpers
  const handleZoomIn = () => {
    if (zoomLevel === 1) setZoomLevel(1.25);
    else if (zoomLevel === 1.25) setZoomLevel(1.5);
  };

  const handleZoomOut = () => {
    if (zoomLevel === 1.5) setZoomLevel(1.25);
    else if (zoomLevel === 1.25) setZoomLevel(1);
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Keyboard navigation for hotspots
  const handleHotspotKeyDown = (e: React.KeyboardEvent, cat: ComponentCategory) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectCategory(cat);
    }
  };

  return (
    <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-2xl transition-all">
      {/* Top Header & Visualizer Controls */}
      <div className="px-4 sm:px-6 py-4 border-b border-charcoal-800 flex flex-wrap items-center justify-between gap-4 bg-charcoal-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-magenta-950/60 border border-magenta-700/60 flex items-center justify-center text-magenta-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                2D Interactive PC Rig Visualizer
              </h3>
              <Badge variant="magenta" size="sm" className="text-[10px]">
                BuildCores Mode
              </Badge>
            </div>
            <p className="text-xs text-charcoal-400">
              Layered 2D chassis configurator. Click any hotspot or use keyboard tabs to select parts.
            </p>
          </div>
        </div>

        {/* Canvas Toolbar: Zoom, Labels, RGB & Completeness */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Zoom Controls */}
          <div className="flex items-center bg-charcoal-900 border border-charcoal-800 rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel === 1}
              className="p-1.5 text-charcoal-400 hover:text-white disabled:opacity-40 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-charcoal-300 font-bold select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel === 1.5}
              className="p-1.5 text-charcoal-400 hover:text-white disabled:opacity-40 transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-magenta-400 hover:text-magenta-300 border-l border-charcoal-800 transition-colors"
                title="Reset Zoom / Fit to View"
                aria-label="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Show/Hide Labels Toggle */}
          <button
            onClick={() => setShowCanvasLabels(!showCanvasLabels)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all ${
              showCanvasLabels
                ? 'bg-magenta-950/60 border-magenta-700/60 text-magenta-300'
                : 'bg-charcoal-900 border-charcoal-800 text-charcoal-400 hover:text-white'
            }`}
            title="Toggle component name labels on the 2D visualizer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Labels</span>
          </button>

          {/* RGB Theme Switcher */}
          <div className="flex items-center gap-1 bg-charcoal-900 border border-charcoal-800 rounded-lg p-1">
            <span className="text-[11px] font-semibold text-charcoal-400 px-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-magenta-400" />
            </span>
            {(['magenta', 'cyberpunk', 'arctic', 'stealth'] as RgbTheme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => setRgbTheme(theme)}
                className={`px-2 py-0.5 text-[10px] font-medium rounded capitalize transition-all ${
                  rgbTheme === theme
                    ? 'bg-charcoal-700 text-white font-bold shadow-sm'
                    : 'text-charcoal-400 hover:text-white'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>

          {/* Completeness Ring */}
          <div className="flex items-center gap-2 bg-charcoal-900/90 border border-charcoal-800 px-2.5 py-1 rounded-lg">
            <span className="text-xs font-mono font-bold text-white">
              {installedCoreCount}/{totalCoreCount}
            </span>
            <div className="w-6 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-charcoal-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-magenta-500 transition-all duration-500 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualizer Canvas with Zoom & Layer Rendering */}
      <div className="relative p-2 sm:p-6 bg-charcoal-950/60 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient lighting glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-20"
          style={{
            background: `radial-gradient(circle at 45% 45%, ${colors.primary} 0%, transparent 60%)`,
          }}
        />

        {/* Scalable Vector Chassis Diagram (9-layer architecture) */}
        <div
          className="w-full max-w-4xl relative overflow-hidden transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 880 660"
            className="w-full h-auto drop-shadow-2xl select-none"
            style={{ filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.75))' }}
          >
            <defs>
              <linearGradient id="chassisMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e212b" />
                <stop offset="50%" stopColor="#15171e" />
                <stop offset="100%" stopColor="#0d0e13" />
              </linearGradient>

              <linearGradient id="innerChamber" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#12141a" />
                <stop offset="100%" stopColor="#0a0b0e" />
              </linearGradient>

              <linearGradient id="pcbTexture" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1c202a" />
                <stop offset="100%" stopColor="#101218" />
              </linearGradient>

              <linearGradient id="gpuShroud" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2c303f" />
                <stop offset="50%" stopColor="#1c1e28" />
                <stop offset="100%" stopColor="#111319" />
              </linearGradient>

              <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="35%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
              </linearGradient>

              <filter id="rgbBloom" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ========================================================= */}
            {/* LAYER 1: CASE CHASSIS & BACKGROUND                        */}
            {/* ========================================================= */}
            <g id="layer-1-case">
              <rect
                x="40"
                y="30"
                width="800"
                height={isMatxCaseOnly ? 570 : 600}
                rx="16"
                fill="url(#chassisMetal)"
                stroke={hoveredCategory === 'cabinet' ? colors.primary : '#2b303e'}
                strokeWidth={hoveredCategory === 'cabinet' ? 3 : 2}
              />
              <rect x="90" y={isMatxCaseOnly ? 600 : 630} width="80" height="15" rx="3" fill="#090a0d" stroke="#222530" />
              <rect x="710" y={isMatxCaseOnly ? 600 : 630} width="80" height="15" rx="3" fill="#090a0d" stroke="#222530" />
              <rect x="180" y="34" width="460" height="10" rx="3" fill="#0f1015" stroke="#222633" strokeDasharray="3,3" />

              <rect x="780" y="45" width="45" height={isMatxCaseOnly ? 540 : 570} rx="6" fill="#14161d" stroke="#262b3a" />
              <circle cx="802" cy="75" r="7" fill="#2b303e" stroke="#3d4458" />
              <rect x="797" y="95" width="10" height="4" rx="1" fill="#3d4458" />
              <rect x="797" y="105" width="10" height="4" rx="1" fill="#3d4458" />

              <rect
                x="80"
                y="55"
                width="690"
                height={isMatxCaseOnly ? 520 : 550}
                rx="8"
                fill="url(#innerChamber)"
                stroke="#1f232e"
                strokeWidth="1.5"
              />

              <rect
                x="80"
                y="490"
                width="690"
                height={isMatxCaseOnly ? 85 : 115}
                fill="#161820"
                stroke="#252a38"
                strokeWidth="2"
              />
              <line x1="80" y1="490" x2="770" y2="490" stroke="#2b3142" strokeWidth="2.5" />
              <rect x="100" y="505" width="200" height="20" rx="4" fill="#0f1116" stroke="#252a38" />
              <text x="200" y="519" fill="#525b75" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                {cabinet ? cabinet.name.toUpperCase().slice(0, 26) : '+ MOUNT CHASSIS / CASE'}
              </text>
            </g>

            {/* ========================================================= */}
            {/* LAYER 2: MOTHERBOARD (PCB, VRMs, I/O, Chipset)            */}
            {/* ========================================================= */}
            <g id="layer-2-motherboard">
              {motherboard ? (
                <>
                  <rect
                    x="200"
                    y="80"
                    width="440"
                    height={isMatxMobo ? 320 : 385}
                    rx="6"
                    fill="url(#pcbTexture)"
                    stroke={hoveredCategory === 'motherboard' ? colors.primary : '#2d3345'}
                    strokeWidth={hoveredCategory === 'motherboard' ? 3 : 2}
                  />

                  <path
                    d="M 220 120 L 270 120 L 290 140 M 230 360 L 320 360 L 340 340 M 580 180 L 610 180"
                    stroke="#232838"
                    strokeWidth="1.5"
                    fill="none"
                  />

                  <rect x="202" y="82" width="45" height="150" rx="3" fill="#1b1f2b" stroke="#343b4f" />
                  <rect x="255" y="85" width="130" height="35" rx="3" fill="#242938" stroke="#3d465e" />
                  <rect x="210" y="145" width="35" height="90" rx="3" fill="#242938" stroke="#3d465e" />

                  {hasWifi && (
                    <g>
                      <circle cx="212" cy="100" r="4" fill="#f59e0b" stroke="#b45309" />
                      <circle cx="212" cy="115" r="4" fill="#f59e0b" stroke="#b45309" />
                    </g>
                  )}

                  <rect
                    x="520"
                    y={isMatxMobo ? 275 : 320}
                    width="95"
                    height={isMatxMobo ? 75 : 95}
                    rx="6"
                    fill="#1e2330"
                    stroke="#3b445c"
                  />
                  <text
                    x="567"
                    y={isMatxMobo ? 315 : 372}
                    fill="#6d7999"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {moboSocket} CHIPSET
                  </text>

                  <rect x="245" y="270" width="320" height="12" rx="2" fill="#101217" stroke="#3e475e" />
                  <line x1="250" y1="276" x2="560" y2="276" stroke="#c59b27" strokeWidth="2" strokeDasharray="3,1" />

                  {!isMatxMobo && (
                    <>
                      <rect x="245" y="375" width="260" height="10" rx="2" fill="#101217" stroke="#2d3445" />
                      <line x1="250" y1="380" x2="500" y2="380" stroke="#5a657d" strokeWidth="1.5" strokeDasharray="3,1" />
                    </>
                  )}

                  <text
                    x="215"
                    y={isMatxMobo ? 385 : 445}
                    fill="#586380"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {motherboard.brand.toUpperCase()} · {isMatxMobo ? 'MICRO-ATX' : 'ATX'}
                  </text>
                </>
              ) : (
                <g>
                  <rect
                    x="200"
                    y="80"
                    width="440"
                    height="385"
                    rx="8"
                    fill="#12151d"
                    stroke={hoveredCategory === 'motherboard' ? colors.primary : '#343b4d'}
                    strokeWidth="2"
                    strokeDasharray="8,6"
                    opacity={hoveredCategory === 'motherboard' ? 1 : 0.7}
                  />
                  <circle cx="420" cy="272" r="28" fill="#1c202c" stroke="#3b4357" />
                  <path d="M 420 258 L 420 286 M 406 272 L 434 272" stroke="#e02477" strokeWidth="3" strokeLinecap="round" />
                  <text x="420" y="322" fill="#a0aec0" fontSize="13" fontWeight="bold" textAnchor="middle">
                    + Mount Motherboard
                  </text>
                  <text x="420" y="342" fill="#64748b" fontSize="10" textAnchor="middle">
                    (Foundation for CPU, RAM, & PCIe)
                  </text>
                </g>
              )}
            </g>

            {/* ========================================================= */}
            {/* LAYER 3: CPU SOCKET & CPU COOLER                          */}
            {/* ========================================================= */}
            <g id="layer-3-cpu-cooler">
              {/* CPU Socket & Processor */}
              <rect
                x="345"
                y="135"
                width="110"
                height="110"
                rx="6"
                fill="#202430"
                stroke={hoveredCategory === 'cpu' ? colors.primary : '#3a4257'}
                strokeWidth={hoveredCategory === 'cpu' ? 2.5 : 1.5}
              />

              {cpu ? (
                <>
                  <line x1="450" y1="138" x2="450" y2="242" stroke="#718096" strokeWidth="2.5" />
                  <circle cx="450" cy="140" r="3" fill="#cbd5e0" />

                  {isAmdCpu ? (
                    <g>
                      <rect x="355" y="145" width="90" height="90" rx="4" fill="#353b4c" stroke="#505a73" strokeWidth="1.5" />
                      <rect x="362" y="152" width="76" height="76" rx="2" fill="#282d3b" />
                      <polygon points="357,147 365,147 357,155" fill="#f59e0b" />
                      <text x="400" y="184" fill="#ef4444" fontSize="13" fontWeight="900" textAnchor="middle">
                        AMD RYZEN
                      </text>
                      <text x="400" y="202" fill="#f1f5f9" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                        {cpu.name.replace(/Processor|Desktop|with/gi, '').slice(0, 16)}
                      </text>
                    </g>
                  ) : (
                    <g>
                      <rect x="358" y="142" width="84" height="96" rx="4" fill="#2c3342" stroke="#4b5773" strokeWidth="1.5" />
                      <rect x="364" y="148" width="72" height="84" rx="2" fill="#1e232f" />
                      <text x="400" y="182" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                        intel CORE
                      </text>
                      <text x="400" y="200" fill="#f1f5f9" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                        {cpu.name.replace(/Processor|Desktop|12th|13th|14th|Gen/gi, '').slice(0, 16)}
                      </text>
                    </g>
                  )}
                </>
              ) : (
                <g>
                  <rect x="355" y="145" width="90" height="90" fill="#181a23" stroke="#2e3547" strokeDasharray="3,3" />
                  <path d="M 400 175 L 400 205 M 385 190 L 415 190" stroke="#e02477" strokeWidth="2.5" strokeLinecap="round" />
                  <text x="400" y="222" fill="#718096" fontSize="10" fontWeight="bold" textAnchor="middle">
                    + CPU Socket
                  </text>
                </g>
              )}

              {/* Cooler Mounted Over Socket */}
              {cooler ? (
                isLiquidCooler ? (
                  <g>
                    <rect
                      x="220"
                      y="58"
                      width={is360Rad ? 450 : 380}
                      height="26"
                      rx="3"
                      fill="#181b24"
                      stroke="#333b4e"
                    />
                    <line
                      x1="225"
                      y1="70"
                      x2={is360Rad ? 665 : 595}
                      y2="70"
                      stroke="#252b3a"
                      strokeWidth="6"
                      strokeDasharray="4,2"
                    />
                    <path
                      d="M 380 150 C 340 100, 310 95, 300 84"
                      fill="none"
                      stroke="#0f1117"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 380 150 C 340 100, 310 95, 300 84"
                      fill="none"
                      stroke="#2d3345"
                      strokeWidth="6"
                      strokeDasharray="2,2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 420 150 C 460 100, 480 95, 500 84"
                      fill="none"
                      stroke="#0f1117"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 420 150 C 460 100, 480 95, 500 84"
                      fill="none"
                      stroke="#2d3345"
                      strokeWidth="6"
                      strokeDasharray="2,2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="400"
                      cy="190"
                      r="36"
                      fill="#141720"
                      stroke={hoveredCategory === 'cooler' ? colors.primary : '#3b4357'}
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="400"
                      cy="190"
                      r="26"
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="4"
                      filter={rgbTheme !== 'stealth' ? 'url(#rgbBloom)' : undefined}
                      opacity={rgbTheme === 'stealth' ? 0.3 : 0.9}
                    />
                    <text x="400" y="194" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      AIO PUMP
                    </text>
                  </g>
                ) : (
                  <g>
                    <rect
                      x="330"
                      y="110"
                      width="140"
                      height="140"
                      rx="6"
                      fill="#252a38"
                      stroke={hoveredCategory === 'cooler' ? colors.primary : '#454f6b'}
                      strokeWidth="2"
                    />
                    {[125, 140, 155, 170, 185, 200, 215, 230].map((finY) => (
                      <line key={finY} x1="334" y1={finY} x2="466" y2={finY} stroke="#394259" strokeWidth="2" />
                    ))}
                    <line x1="365" y1="245" x2="365" y2="255" stroke="#b45309" strokeWidth="4" />
                    <line x1="435" y1="245" x2="435" y2="255" stroke="#b45309" strokeWidth="4" />

                    <circle
                      cx="400"
                      cy="180"
                      r="50"
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="3.5"
                      filter={rgbTheme !== 'stealth' ? 'url(#rgbBloom)' : undefined}
                      opacity={rgbTheme === 'stealth' ? 0.3 : 0.9}
                    />
                    <circle cx="400" cy="180" r="16" fill="#1b1f2a" stroke="#373e52" />
                    <text x="400" y="184" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      AIR COOLER
                    </text>
                  </g>
                )
              ) : (
                <g>
                  <circle cx="400" cy="190" r="40" fill="none" stroke="#333b4e" strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x="400" y="194" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">
                    + CPU Cooler
                  </text>
                </g>
              )}
            </g>

            {/* ========================================================= */}
            {/* LAYER 4: RAM MODULES                                      */}
            {/* ========================================================= */}
            <g id="layer-4-ram">
              {(memorySlotCount === 2 ? [485, 515] : [475, 495, 515, 535]).map((dimmX, idx) => {
                let isPopulated = false;
                if (ram) {
                  if (ramModuleCount === 1) isPopulated = idx === 1;
                  else if (ramModuleCount === 2) isPopulated = idx === 1 || idx === 3;
                  else isPopulated = true;
                }

                return (
                  <g key={idx}>
                    <rect x={dimmX} y="125" width="12" height="130" rx="2" fill="#13161e" stroke="#2b3142" />
                    <rect x={dimmX - 1} y="120" width="14" height="6" fill="#475569" rx="1" />
                    <rect x={dimmX - 1} y="254" width="14" height="6" fill="#475569" rx="1" />

                    {isPopulated && (
                      <g>
                        <rect
                          x={dimmX + 1}
                          y="126"
                          width="10"
                          height="128"
                          rx="1.5"
                          fill="#2a2f3f"
                          stroke={hoveredCategory === 'ram' ? colors.primary : '#4b556b'}
                          strokeWidth="1"
                        />
                        <rect
                          x={dimmX}
                          y="126"
                          width="12"
                          height="22"
                          rx="1"
                          fill={colors.fanLed}
                          filter={rgbTheme !== 'stealth' ? 'url(#rgbBloom)' : undefined}
                          opacity={rgbTheme === 'stealth' ? 0.4 : 0.9}
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {ram ? (
                <text
                  x="510"
                  y="112"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {ramType} · {ramSpecs.capacityGb || '16'}GB ({ramModuleCount}x)
                </text>
              ) : (
                <text x="510" y="112" fill="#4b556b" fontSize="9" fontWeight="bold" textAnchor="middle">
                  + RAM SLOTS
                </text>
              )}
            </g>

            {/* ========================================================= */}
            {/* LAYER 5: GRAPHICS CARD (GPU)                              */}
            {/* ========================================================= */}
            <g id="layer-5-gpu">
              {gpu ? (
                <>
                  <rect
                    x="180"
                    y="255"
                    width={gpuWidthSvg}
                    height="85"
                    rx="6"
                    fill="url(#gpuShroud)"
                    stroke={hoveredCategory === 'gpu' ? colors.primary : '#3e465e'}
                    strokeWidth={hoveredCategory === 'gpu' ? 3 : 2}
                  />

                  <rect x="190" y="260" width={gpuWidthSvg - 20} height="75" rx="4" fill="#1a1c24" stroke="#2c3242" />

                  {(isTripleFanGpu ? [260, 365, 470] : [260, 380]).map((fanX, idx) => (
                    <g key={idx}>
                      <circle cx={fanX} cy="297" r="28" fill="#101217" stroke="#2e3547" strokeWidth="1.5" />
                      <circle
                        cx={fanX}
                        cy="297"
                        r="25"
                        fill="none"
                        stroke={colors.primary}
                        strokeWidth="1.5"
                        filter={rgbTheme !== 'stealth' ? 'url(#rgbBloom)' : undefined}
                        opacity={rgbTheme === 'stealth' ? 0.2 : 0.75}
                      />
                      <circle cx={fanX} cy="297" r="9" fill="#1e222d" />
                    </g>
                  ))}

                  <rect
                    x="195"
                    y="262"
                    width="135"
                    height="18"
                    rx="3"
                    fill={colors.fanLed}
                    filter={rgbTheme !== 'stealth' ? 'url(#rgbBloom)' : undefined}
                    opacity={rgbTheme === 'stealth' ? 0.35 : 0.85}
                  />
                  <text x="262" y="275" fill="#ffffff" fontSize="9.5" fontWeight="900" textAnchor="middle">
                    {gpu.brand.toUpperCase()} {gpu.name.slice(0, 16)}
                  </text>

                  <path
                    d={`M ${180 + gpuWidthSvg - 30} 340 L ${180 + gpuWidthSvg - 30} 380 C ${180 + gpuWidthSvg - 30} 420, 600 430, 620 450`}
                    fill="none"
                    stroke="#11131a"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${180 + gpuWidthSvg - 30} 340 L ${180 + gpuWidthSvg - 30} 380 C ${180 + gpuWidthSvg - 30} 420, 600 430, 620 450`}
                    fill="none"
                    stroke="#374151"
                    strokeWidth="6"
                    strokeDasharray="2,2"
                    strokeLinecap="round"
                  />
                  <rect x={180 + gpuWidthSvg - 40} y="335" width="20" height="10" rx="2" fill="#1f2937" />
                </>
              ) : isGpuRequired ? (
                <g>
                  <rect
                    x="180"
                    y="260"
                    width="440"
                    height="75"
                    rx="6"
                    fill="#2a1215"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                  />
                  <circle cx="400" cy="297" r="18" fill="#450a0a" />
                  <path d="M 400 287 L 400 307 M 390 297 L 410 297" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                  <text x="430" y="302" fill="#f87171" fontSize="11" fontWeight="bold">
                    Discrete GPU Required (CPU has no integrated graphics)
                  </text>
                </g>
              ) : (
                <g>
                  <rect
                    x="180"
                    y="260"
                    width="440"
                    height="75"
                    rx="6"
                    fill="#151720"
                    stroke={hoveredCategory === 'gpu' ? colors.primary : '#374151'}
                    strokeWidth={1.5}
                    strokeDasharray="6,4"
                    opacity={0.7}
                  />
                  <circle cx="400" cy="297" r="18" fill="#1e222e" />
                  <path d="M 400 287 L 400 307 M 390 297 L 410 297" stroke="#e02477" strokeWidth="2.5" strokeLinecap="round" />
                  <text x="430" y="302" fill="#94a3b8" fontSize="11" fontWeight="bold">
                    {isCpuIgpu ? '+ Add Dedicated GPU (iGPU Active)' : '+ Add Graphics Card (GPU)'}
                  </text>
                </g>
              )}
            </g>

            {/* ========================================================= */}
            {/* LAYER 6: STORAGE DEVICES                                  */}
            {/* ========================================================= */}
            <g id="layer-6-storage">
              {storage ? (
                <g>
                  <rect
                    x="370"
                    y="300"
                    width="145"
                    height="28"
                    rx="3"
                    fill="#242938"
                    stroke={hoveredCategory === 'storage' ? colors.primary : '#4a5470'}
                    strokeWidth={hoveredCategory === 'storage' ? 2 : 1.5}
                  />
                  <rect x="375" y="305" width="20" height="18" fill="#151720" />
                  <text x="442" y="318" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
                    NVMe · {storage.brand} {storage.name.slice(0, 14)}
                  </text>
                </g>
              ) : (
                <g>
                  <rect
                    x="370"
                    y="300"
                    width="145"
                    height="28"
                    rx="3"
                    fill="#151822"
                    stroke="#2e3547"
                    strokeDasharray="4,3"
                  />
                  <text x="442" y="318" fill="#5c667e" fontSize="9" fontWeight="bold" textAnchor="middle">
                    + M.2 NVMe SSD
                  </text>
                </g>
              )}
            </g>

            {/* ========================================================= */}
            {/* LAYER 7: POWER SUPPLY UNIT (PSU)                          */}
            {/* ========================================================= */}
            <g id="layer-7-psu">
              {psu ? (
                <>
                  <rect
                    x="100"
                    y="515"
                    width="260"
                    height="75"
                    rx="5"
                    fill="#1e222d"
                    stroke={hoveredCategory === 'psu' ? colors.primary : '#373f54'}
                    strokeWidth={hoveredCategory === 'psu' ? 2.5 : 1.5}
                  />
                  <circle cx="160" cy="552" r="28" fill="#111319" stroke="#2e3547" strokeWidth="1.5" />
                  <circle cx="160" cy="552" r="10" fill="#252a37" />

                  <rect x="210" y="528" width="135" height="48" rx="4" fill="#141720" stroke="#2c3345" />
                  <text x="277" y="547" fill="#f8fafc" fontSize="12" fontWeight="extrabold" textAnchor="middle">
                    {psuWattage}W POWER
                  </text>
                  <text x="277" y="564" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {psuEfficiency}
                  </text>
                </>
              ) : (
                <g>
                  <rect
                    x="100"
                    y="520"
                    width="260"
                    height="70"
                    rx="5"
                    fill="#12141c"
                    stroke="#2f374a"
                    strokeDasharray="5,4"
                  />
                  <path d="M 230 555 L 230 565 M 225 560 L 235 560" stroke="#e02477" strokeWidth="2" strokeLinecap="round" />
                  <text x="230" y="558" fill="#718096" fontSize="11" fontWeight="bold" textAnchor="middle">
                    + Mount Power Supply (PSU)
                  </text>
                </g>
              )}
            </g>

            {/* ========================================================= */}
            {/* LAYER 8: CASE FANS & COOLING COMPONENTS                   */}
            {/* ========================================================= */}
            <g id="layer-8-fans">
              {/* Front intake fans */}
              {(isMatxCaseOnly ? [160, 320] : [120, 250, 380]).map((fanY, idx) => (
                <g key={idx}>
                  <circle
                    cx="740"
                    cy={fanY}
                    r="46"
                    fill="#101218"
                    stroke={colors.primary}
                    strokeWidth={rgbTheme === 'stealth' ? 1.5 : 2.5}
                    filter={rgbTheme !== 'stealth' ? 'url(#rgbBloom)' : undefined}
                    opacity={rgbTheme === 'stealth' ? 0.35 : 0.85}
                  />
                  <circle cx="740" cy={fanY} r="18" fill="#1e222d" stroke="#33384a" />
                  <path
                    d={`M 740 ${fanY - 18} C 735 ${fanY - 35}, 725 ${fanY - 40}, 740 ${fanY - 44} C 750 ${fanY - 40}, 748 ${fanY - 30}, 740 ${fanY - 18}`}
                    fill={colors.fanLed}
                    opacity="0.8"
                  />
                  <path
                    d={`M 740 ${fanY + 18} C 745 ${fanY + 35}, 755 ${fanY + 40}, 740 ${fanY + 44} C 730 ${fanY + 40}, 732 ${fanY + 30}, 740 ${fanY + 18}`}
                    fill={colors.fanLed}
                    opacity="0.8"
                  />
                  <path
                    d={`M ${740 - 18} ${fanY} C ${740 - 35} ${fanY + 5}, ${740 - 40} ${fanY + 15}, ${740 - 44} ${fanY} C ${740 - 40} ${fanY - 10}, ${740 - 30} ${fanY - 8}, ${740 - 18} ${fanY}`}
                    fill={colors.fanLed}
                    opacity="0.8"
                  />
                  <path
                    d={`M ${740 + 18} ${fanY} C ${740 + 35} ${fanY - 5}, ${740 + 40} ${fanY - 15}, ${740 + 44} ${fanY} C ${740 + 40} ${fanY + 10}, ${740 + 30} ${fanY + 8}, ${740 + 18} ${fanY}`}
                    fill={colors.fanLed}
                    opacity="0.8"
                  />
                </g>
              ))}

              {/* Rear exhaust fan */}
              <circle
                cx="135"
                cy="175"
                r="42"
                fill="#101218"
                stroke={colors.primary}
                strokeWidth={rgbTheme === 'stealth' ? 1.5 : 2}
                filter={rgbTheme !== 'stealth' ? 'url(#rgbBloom)' : undefined}
                opacity={rgbTheme === 'stealth' ? 0.35 : 0.8}
              />
              <circle cx="135" cy="175" r="16" fill="#1e222d" />
            </g>

            {/* ========================================================= */}
            {/* LAYER 9: CABLES, LABELS, HOTSPOTS & GLASS OVERLAY         */}
            {/* ========================================================= */}
            <g id="layer-9-cables-labels-hotspots">
              {/* 24-Pin ATX Main Cable Harness */}
              {psu && (
                <>
                  <path
                    d="M 360 550 C 420 550, 430 480, 440 450"
                    fill="none"
                    stroke="#0b0c10"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 360 550 C 420 550, 430 480, 440 450"
                    fill="none"
                    stroke="#33384a"
                    strokeWidth="8"
                    strokeDasharray="3,3"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Glass Reflection Tint */}
              <rect
                x="42"
                y="32"
                width="796"
                height={isMatxCaseOnly ? 566 : 596}
                rx="15"
                fill="url(#glassReflection)"
                pointerEvents="none"
              />
              <circle cx="58" cy="48" r="5" fill="#4b5563" stroke="#9ca3af" strokeWidth="1" />
              <circle cx="822" cy="48" r="5" fill="#4b5563" stroke="#9ca3af" strokeWidth="1" />
              <circle cx="58" cy={isMatxCaseOnly ? 582 : 612} r="5" fill="#4b5563" stroke="#9ca3af" strokeWidth="1" />
              <circle cx="822" cy={isMatxCaseOnly ? 582 : 612} r="5" fill="#4b5563" stroke="#9ca3af" strokeWidth="1" />

              {/* On-Canvas Component Labels (Toggleable) */}
              {showCanvasLabels && (
                <g id="canvas-labels" pointerEvents="none">
                  {hotspots.map((hs) => {
                    if (!hs.isInstalled) return null;
                    return (
                      <g key={`lbl-${hs.category}`}>
                        <rect
                          x={hs.x + 8}
                          y={hs.y + 8}
                          width={Math.min(hs.width - 16, 170)}
                          height="20"
                          rx="4"
                          fill="rgba(10, 11, 15, 0.85)"
                          stroke={colors.primary}
                          strokeWidth="1"
                        />
                        <text
                          x={hs.x + 14}
                          y={hs.y + 22}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="system-ui, sans-serif"
                        >
                          {hs.componentBrand} {hs.componentName?.slice(0, 14)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Interactive Accessible Click Hotspots */}
              <g id="interactive-hotspots">
                {hotspots.map((hs) => {
                  const isHovered = hoveredCategory === hs.category;
                  const isFocused = focusedCategory === hs.category;
                  const isHighlighted = isHovered || isFocused;

                  return (
                    <rect
                      key={hs.category}
                      x={hs.x}
                      y={hs.y}
                      width={hs.width}
                      height={hs.height}
                      rx="6"
                      fill="transparent"
                      stroke={isHighlighted ? colors.primary : 'transparent'}
                      strokeWidth={isHighlighted ? 3 : 0}
                      strokeDasharray={hs.isInstalled ? undefined : '6,4'}
                      className="cursor-pointer transition-all outline-none"
                      tabIndex={0}
                      role="button"
                      aria-label={hs.ariaLabel}
                      onClick={() => onSelectCategory(hs.category)}
                      onKeyDown={(e) => handleHotspotKeyDown(e, hs.category)}
                      onMouseEnter={() => setHoveredCategory(hs.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onFocus={() => setFocusedCategory(hs.category)}
                      onBlur={() => setFocusedCategory(null)}
                    />
                  );
                })}
              </g>
            </g>
          </svg>
        </div>

        {/* Selected / Hovered Component Details Panel */}
        {activeInspection && (
          <div className="w-full max-w-4xl mt-4 p-4 rounded-xl bg-charcoal-950/95 border border-charcoal-700/80 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3.5">
              <Component2DImage
                component={activeComponent || undefined}
                category={activeInspection}
                size="md"
                className="w-12 h-12"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                    {CATEGORY_LABELS[activeInspection]}
                  </span>
                  {activeComponent ? (
                    <Badge variant="success" size="sm" className="text-[10px]">
                      <Check className="w-2.5 h-2.5" /> Installed
                    </Badge>
                  ) : (
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      Empty Slot
                    </Badge>
                  )}
                  {activeAssetMetadata && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-charcoal-400 font-mono">
                      {activeAssetMetadata.assetType === 'verified_product'
                        ? 'Verified Model'
                        : 'Generic 2D Technical Illustration'}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {activeComponent
                    ? `${activeComponent.brand} ${activeComponent.name}`
                    : `No ${CATEGORY_LABELS[activeInspection]} installed yet`}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {activeComponent && (
                <div className="text-right">
                  <InrPrice amount={activeComponent.priceINR} size="md" className="text-white" />
                  <span className="text-[10px] text-charcoal-400 block">
                    {activeComponent.retailerName || 'Catalog Reference'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectCategory(activeInspection)}
                  icon={activeComponent ? <RotateCcw className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                >
                  {activeComponent ? 'Change' : 'Select'}
                </Button>

                {activeComponent && onRemoveCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCategory(activeInspection)}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hotspot Quick-Access Bar */}
      <div className="p-3 sm:p-4 bg-charcoal-950 border-t border-charcoal-800">
        <div className="flex items-center justify-between gap-2 mb-2 text-xs text-charcoal-400">
          <span className="flex items-center gap-1.5 font-semibold text-charcoal-300">
            <Layers className="w-3.5 h-3.5 text-magenta-400" />
            Hardware Layers & Hotspots:
          </span>
          <span className="text-[11px] text-charcoal-400">
            Tab or click any hotspot to open picker
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {VISUALIZER_LAYERS.slice(0, 8).map((layer) => {
            const catMap: Record<string, ComponentCategory> = {
              case_chassis: 'cabinet',
              motherboard: 'motherboard',
              cpu_socket_cooler: 'cpu',
              ram_modules: 'ram',
              graphics_card: 'gpu',
              storage_devices: 'storage',
              power_supply: 'psu',
              cooling_fans: 'cooler',
            };
            const cat = catMap[layer.id];
            const comp = components[cat];
            const isHovered = hoveredCategory === cat;

            return (
              <button
                key={layer.id}
                onClick={() => onSelectCategory(cat)}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isHovered
                    ? 'border-magenta-500 bg-charcoal-800 shadow-md'
                    : comp
                    ? 'border-charcoal-700/80 bg-charcoal-900/90 hover:border-charcoal-600'
                    : 'border-dashed border-charcoal-800 bg-charcoal-900/40 hover:border-charcoal-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                    {layer.order}. {cat}
                  </span>
                  {comp ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  ) : (
                    <span className="text-[10px] text-magenta-400 font-bold">+</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-white truncate w-full">
                  {comp ? comp.name : 'Empty Slot'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

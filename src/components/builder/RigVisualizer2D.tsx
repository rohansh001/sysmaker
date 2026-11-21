'use client';

import React, { useState } from 'react';
import { BuildComponents, Component, ComponentCategory } from '@/types';
import { CATEGORY_LABELS } from '@/components/common/ComponentIcon';
import { Component2DImage } from '@/components/common/Component2DImage';
import { InrPrice } from '@/components/common/InrPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  RotateCcw,
  Plus,
  Layers,
  Activity,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Tag,
  Power,
  Flame,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ZoomLevel,
  VISUALIZER_LAYERS,
} from '@/lib/visualizer/types';
import {
  getVisualizerHotspots,
  resolveComponentVisualAsset,
} from '@/lib/visualizer/layers';
import { rigAudio } from '@/lib/audio/rigAudio';

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

  // Realism States
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(true);
  const [showGlassPanel, setShowGlassPanel] = useState<boolean>(true);
  const [showThermalView, setShowThermalView] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

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
  const moboSocket = moboSpecs.socket || 'AM5 / LGA1700';
  const memorySlotCount = moboSpecs.memorySlots || 4;
  const hasWifi = Boolean(moboSpecs.hasWifi);

  const cpuSpecs = (cpu?.specifications || {}) as any;
  const isAmdCpu = cpu?.brand?.toLowerCase().includes('amd') || cpu?.name?.toLowerCase().includes('ryzen');

  const ramSpecs = (ram?.specifications || {}) as any;
  const ramModuleCount = Number(ramSpecs.modules) || 2;
  const ramType = ramSpecs.type || 'DDR5';

  const gpuSpecs = (gpu?.specifications || {}) as any;
  const gpuLength = Number(gpuSpecs.lengthMm) || 240;
  const isTripleFanGpu = gpuLength >= 280 || (gpu?.name && gpu.name.toLowerCase().includes('triple'));
  const gpuWidthSvg = isTripleFanGpu ? 460 : 350;

  const coolerSpecs = (cooler?.specifications || {}) as any;
  const isLiquidCooler =
    coolerSpecs.type === 'Liquid (AIO)' ||
    (cooler?.name && (cooler.name.toLowerCase().includes('liquid') || cooler.name.toLowerCase().includes('aio')));
  const is360Rad = cooler?.name && cooler.name.includes('360');

  const psuSpecs = (psu?.specifications || {}) as any;
  const psuWattage = psuSpecs.wattage || 650;
  const psuEfficiency = psuSpecs.efficiencyRating || '80+ Gold';

  const cabSpecs = (cabinet?.specifications || {}) as any;
  const isMatxCaseOnly =
    cabSpecs.supportedFormFactors &&
    cabSpecs.supportedFormFactors.includes('Micro-ATX') &&
    !cabSpecs.supportedFormFactors.includes('ATX');

  // Dynamic Temperatures (Realistically calculated based on hardware)
  const cpuTemp = cooler ? (isLiquidCooler ? 62 : 68) : (cpu ? 82 : 28);
  const gpuTemp = gpu ? (isTripleFanGpu ? 66 : 73) : 29;
  const vrmTemp = motherboard ? 52 : 26;
  const ramTemp = ram ? 41 : 25;
  const storageTemp = storage ? 45 : 25;

  // 3. Dynamic RGB Lighting Themes
  const getRgbGlow = () => {
    if (!isPoweredOn) {
      return {
        primary: '#374151',
        secondary: '#1f2937',
        glow: 'rgba(0, 0, 0, 0)',
        fanLed: '#1f242f',
        isOff: true,
      };
    }

    switch (rgbTheme) {
      case 'magenta':
        return {
          primary: '#e02477',
          secondary: '#ff4d94',
          glow: 'rgba(224, 36, 119, 0.45)',
          fanLed: '#ff2d87',
          isOff: false,
        };
      case 'cyberpunk':
        return {
          primary: '#06b6d4',
          secondary: '#e02477',
          glow: 'rgba(6, 182, 212, 0.45)',
          fanLed: '#00f0ff',
          isOff: false,
        };
      case 'arctic':
        return {
          primary: '#38bdf8',
          secondary: '#e0f2fe',
          glow: 'rgba(56, 189, 248, 0.45)',
          fanLed: '#ffffff',
          isOff: false,
        };
      case 'stealth':
      default:
        return {
          primary: '#4b5563',
          secondary: '#374151',
          glow: 'rgba(75, 85, 99, 0.1)',
          fanLed: '#27272a',
          isOff: false,
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

  // Sound triggers
  const handleSelectWithAudio = (cat: ComponentCategory) => {
    rigAudio.playLatchClick();
    onSelectCategory(cat);
  };

  const handleRemoveWithAudio = (cat: ComponentCategory) => {
    rigAudio.playLatchClick();
    if (onRemoveCategory) onRemoveCategory(cat);
  };

  const togglePower = () => {
    const nextState = !isPoweredOn;
    setIsPoweredOn(nextState);
    rigAudio.playPowerSwitch(nextState);
  };

  const toggleGlassPanel = () => {
    setShowGlassPanel(!showGlassPanel);
    rigAudio.playGlassToggle();
  };

  const toggleThermalView = () => {
    setShowThermalView(!showThermalView);
    rigAudio.playThermalChirp();
  };

  const toggleAudioMute = () => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    rigAudio.setMuted(nextMute);
  };

  const handleHotspotKeyDown = (e: React.KeyboardEvent, cat: ComponentCategory) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectWithAudio(cat);
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
                Photorealistic PC Rig Visualizer
              </h3>
              <Badge variant="magenta" size="sm" className="text-[10px]">
                BuildCores Realistic 2.0
              </Badge>
            </div>
            <p className="text-xs text-charcoal-400">
              Interactive hardware simulator with physical shaders, spinning aerodynamics, and thermal imaging.
            </p>
          </div>
        </div>

        {/* Realism Toolbar: Power, Glass, Thermal, Audio & RGB */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Power Switch */}
          <button
            onClick={togglePower}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all shadow-sm ${
              isPoweredOn
                ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 shadow-emerald-950/50'
                : 'bg-charcoal-900 border-charcoal-700 text-charcoal-400 hover:text-white'
            }`}
            title="Toggle System Power ON / OFF"
          >
            <Power className={`w-3.5 h-3.5 ${isPoweredOn ? 'text-emerald-400 animate-pulse' : 'text-charcoal-500'}`} />
            <span>{isPoweredOn ? 'PWR ON' : 'PWR OFF'}</span>
          </button>

          {/* Tempered Glass Side Panel Toggle */}
          <button
            onClick={toggleGlassPanel}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all ${
              showGlassPanel
                ? 'bg-charcoal-900 border-charcoal-700 text-charcoal-300'
                : 'bg-indigo-950/70 border-indigo-500 text-indigo-300'
            }`}
            title={showGlassPanel ? 'Click to Remove Glass Panel (Open Chassis)' : 'Click to Mount Tempered Glass'}
          >
            {showGlassPanel ? <Eye className="w-3.5 h-3.5 text-charcoal-400" /> : <EyeOff className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden sm:inline">Glass: {showGlassPanel ? 'Mounted' : 'Removed'}</span>
            <span className="sm:hidden">Glass</span>
          </button>

          {/* Thermal FLIR Infrared View Toggle */}
          <button
            onClick={toggleThermalView}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all ${
              showThermalView
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                : 'bg-charcoal-900 border-charcoal-800 text-charcoal-400 hover:text-white'
            }`}
            title="Toggle FLIR Thermal Infrared Heatmap View"
          >
            <Flame className={`w-3.5 h-3.5 ${showThermalView ? 'text-amber-400 animate-pulse' : 'text-charcoal-400'}`} />
            <span className="hidden sm:inline">Thermal View</span>
          </button>

          {/* Web Audio Synthesizer Mute Toggle */}
          <button
            onClick={toggleAudioMute}
            className={`p-2 rounded-lg border transition-all ${
              !isAudioMuted
                ? 'bg-magenta-950/60 border-magenta-700/60 text-magenta-300'
                : 'bg-charcoal-900 border-charcoal-800 text-charcoal-500 hover:text-charcoal-300'
            }`}
            title={isAudioMuted ? 'Unmute Realistic Hardware Audio' : 'Mute Hardware Audio Click FX'}
            aria-label="Toggle Audio"
          >
            {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

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
                title="Reset Zoom"
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
            title="Toggle component name labels"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Labels</span>
          </button>

          {/* RGB Theme Switcher */}
          <div className="flex items-center gap-1 bg-charcoal-900 border border-charcoal-800 rounded-lg p-1">
            <span className="text-[11px] font-semibold text-charcoal-400 px-1 flex items-center gap-1">
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

      {/* Main Visualizer Canvas with Zoom & Realistic Shaders */}
      <div className="relative p-2 sm:p-6 bg-charcoal-950/80 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient lighting glow */}
        {isPoweredOn && (
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-25"
            style={{
              background: `radial-gradient(circle at 45% 45%, ${colors.primary} 0%, transparent 65%)`,
            }}
          />
        )}

        {/* Scalable Vector Chassis Diagram (Realistic Multi-Layer Architecture) */}
        <div
          className="w-full max-w-4xl relative overflow-hidden transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 880 660"
            className="w-full h-auto drop-shadow-2xl select-none"
            style={{ filter: 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.85))' }}
          >
            <defs>
              {/* Chassis Anisotropic Brushed Metal */}
              <linearGradient id="chassisMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#252a36" />
                <stop offset="25%" stopColor="#1a1d26" />
                <stop offset="50%" stopColor="#222733" />
                <stop offset="75%" stopColor="#161820" />
                <stop offset="100%" stopColor="#0d0e13" />
              </linearGradient>

              {/* Internal Chamber Dark Recess */}
              <linearGradient id="innerChamberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#11131a" />
                <stop offset="50%" stopColor="#0b0d12" />
                <stop offset="100%" stopColor="#06070a" />
              </linearGradient>

              {/* High-Grade Matte Black PCB Texture */}
              <linearGradient id="pcbTextureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1c202b" />
                <stop offset="40%" stopColor="#151821" />
                <stop offset="100%" stopColor="#0d0f15" />
              </linearGradient>

              {/* Realistic Copper Heatpipes */}
              <linearGradient id="copperHeatpipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="30%" stopColor="#d97706" />
                <stop offset="60%" stopColor="#fef08a" />
                <stop offset="85%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Gold Contacts & SMD Caps */}
              <linearGradient id="goldCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Realistic GPU Die-Cast Shroud */}
              <linearGradient id="gpuShroudGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="20%" stopColor="#1f2937" />
                <stop offset="60%" stopColor="#111827" />
                <stop offset="85%" stopColor="#222b3b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Tempered Glass Specular Light Reflection */}
              <linearGradient id="glassGlareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="18%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="20%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="23%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0.0)" />
                <stop offset="78%" stopColor="rgba(255,255,255,0.04)" />
                <stop offset="82%" stopColor="rgba(255,255,255,0.14)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
              </linearGradient>

              {/* Stainless Steel Knurled Thumbscrews */}
              <radialGradient id="thumbscrewGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="45%" stopColor="#94a3b8" />
                <stop offset="85%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>

              {/* Drop Shadow Heavy Filter */}
              <filter id="dropShadowHeavy" x="-15%" y="-15%" width="130%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.85" />
              </filter>

              {/* RGB Bloom Filter */}
              <filter id="rgbBloom" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Thermal Infrared Gradients for FLIR Mode */}
              <radialGradient id="thermalCpu" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#ff0055" stopOpacity="0.9" />
                <stop offset="55%" stopColor="#ff5500" stopOpacity="0.75" />
                <stop offset="85%" stopColor="#ffcc00" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0055ff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="thermalGpu" cx="45%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="30%" stopColor="#ff1100" stopOpacity="0.88" />
                <stop offset="65%" stopColor="#ff8800" stopOpacity="0.7" />
                <stop offset="90%" stopColor="#ffcc00" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0055ff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="thermalVrm" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff5500" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#ffaa00" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0088ff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="thermalCold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00bbff" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#0044cc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#001155" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ========================================================= */}
            {/* LAYER 1: CASE CHASSIS & BACKGROUND                        */}
            {/* ========================================================= */}
            <g id="layer-1-case">
              {/* Outer Case Chassis with Anisotropic Brushed Metal */}
              <rect
                x="40"
                y="30"
                width="800"
                height={isMatxCaseOnly ? 570 : 600}
                rx="16"
                fill="url(#chassisMetalGrad)"
                stroke={hoveredCategory === 'cabinet' ? colors.primary : '#2b303e'}
                strokeWidth={hoveredCategory === 'cabinet' ? 3 : 2}
              />
              {/* Anti-vibration rubber feet */}
              <rect x="90" y={isMatxCaseOnly ? 600 : 630} width="80" height="15" rx="3" fill="#090a0d" stroke="#222530" />
              <rect x="710" y={isMatxCaseOnly ? 600 : 630} width="80" height="15" rx="3" fill="#090a0d" stroke="#222530" />

              {/* Top magnetic dust filter with micro mesh */}
              <rect x="180" y="34" width="460" height="10" rx="3" fill="#0f1015" stroke="#222633" strokeDasharray="3,3" />

              {/* Front I/O Panel (Power Switch, USB 3.2, Type-C, Audio Jack) */}
              <rect x="780" y="45" width="45" height={isMatxCaseOnly ? 540 : 570} rx="6" fill="#14161d" stroke="#262b3a" />
              
              {/* Power Switch with Illuminated Ring */}
              <circle cx="802" cy="75" r="8" fill="#2b303e" stroke="#3d4458" />
              <circle
                cx="802"
                cy="75"
                r="4"
                fill={isPoweredOn ? '#38bdf8' : '#475569'}
                filter={isPoweredOn ? 'url(#rgbBloom)' : undefined}
              />
              {/* USB ports */}
              <rect x="797" y="96" width="10" height="4" rx="1" fill="#38bdf8" opacity="0.8" />
              <rect x="797" y="106" width="10" height="4" rx="1" fill="#38bdf8" opacity="0.8" />
              <rect x="798" y="116" width="8" height="3" rx="1.5" fill="#e2e8f0" opacity="0.9" />

              {/* Inner Main Chamber */}
              <rect
                x="80"
                y="55"
                width="690"
                height={isMatxCaseOnly ? 520 : 550}
                rx="8"
                fill="url(#innerChamberGrad)"
                stroke="#1f232e"
                strokeWidth="1.5"
              />

              {/* PSU Shroud (Lower Basement) */}
              <rect
                x="80"
                y="490"
                width="690"
                height={isMatxCaseOnly ? 85 : 115}
                fill="#14161e"
                stroke="#252a38"
                strokeWidth="2"
              />
              <line x1="80" y1="490" x2="770" y2="490" stroke="#2b3142" strokeWidth="2.5" />
              
              {/* Cable Routing Rubber Grommets */}
              <ellipse cx="645" cy="220" rx="9" ry="24" fill="#090a0f" stroke="#262d3d" strokeWidth="2" />
              <ellipse cx="645" cy="380" rx="9" ry="24" fill="#090a0f" stroke="#262d3d" strokeWidth="2" />
              <ellipse cx="440" cy="490" rx="35" ry="7" fill="#090a0f" stroke="#262d3d" strokeWidth="2" />

              {/* Case Brand Plate */}
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
                  {/* Motherboard PCB with Fiber Weave Texture */}
                  <rect
                    x="200"
                    y="80"
                    width="440"
                    height={isMatxMobo ? 320 : 385}
                    rx="6"
                    fill="url(#pcbTextureGrad)"
                    stroke={hoveredCategory === 'motherboard' ? colors.primary : '#2d3345'}
                    strokeWidth={hoveredCategory === 'motherboard' ? 3 : 2}
                  />

                  {/* Gold-plated Solder Traces */}
                  <path
                    d="M 220 120 L 270 120 L 290 140 M 230 360 L 320 360 L 340 340 M 580 180 L 610 180"
                    stroke="#a16207"
                    strokeWidth="1.2"
                    fill="none"
                    opacity="0.6"
                  />

                  {/* Rear I/O Integrated Armor Shield */}
                  <rect x="202" y="82" width="48" height="155" rx="3" fill="#1b1f2b" stroke="#343b4f" />
                  <rect x="255" y="85" width="130" height="35" rx="3" fill="#242938" stroke="#3d465e" />
                  <rect x="210" y="145" width="35" height="90" rx="3" fill="#242938" stroke="#3d465e" />

                  {/* CNC Milled VRM Heatsink Fins */}
                  {[90, 96, 102, 108, 114].map((vrmY) => (
                    <line key={vrmY} x1="262" y1={vrmY} x2="378" y2={vrmY} stroke="#1b1e29" strokeWidth="2" />
                  ))}

                  {/* Wi-Fi Gold SMA Connectors */}
                  {hasWifi && (
                    <g>
                      <circle cx="212" cy="100" r="4.5" fill="url(#goldCapGrad)" stroke="#78350f" />
                      <circle cx="212" cy="115" r="4.5" fill="url(#goldCapGrad)" stroke="#78350f" />
                    </g>
                  )}

                  {/* Chipset Heatsink */}
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

                  {/* PCIe Steel Armor Reinforced Slot (GPU Slot) */}
                  <rect x="245" y="270" width="320" height="13" rx="2" fill="#0d0f14" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="250" y1="276" x2="560" y2="276" stroke="url(#goldCapGrad)" strokeWidth="2.5" strokeDasharray="3,1" />

                  {/* Secondary PCIe slot */}
                  {!isMatxMobo && (
                    <>
                      <rect x="245" y="375" width="260" height="10" rx="2" fill="#101217" stroke="#2d3445" />
                      <line x1="250" y1="380" x2="500" y2="380" stroke="#5a657d" strokeWidth="1.5" strokeDasharray="3,1" />
                    </>
                  )}

                  {/* 7-Segment Q-Code LED Display ("AA" = System Boot Normal) */}
                  <rect x="605" y="88" width="26" height="16" rx="2" fill="#090a0f" stroke="#1f293d" />
                  <text
                    x="618"
                    y="100"
                    fill={isPoweredOn ? '#10b981' : '#1e293b'}
                    fontSize="10"
                    fontWeight="900"
                    fontFamily="monospace"
                    textAnchor="middle"
                    filter={isPoweredOn ? 'url(#rgbBloom)' : undefined}
                  >
                    AA
                  </text>

                  {/* Gold Nichicon Audio Filter Capacitors */}
                  {[320, 335, 350, 365].map((capY, idx) => (
                    <circle
                      key={idx}
                      cx="215"
                      cy={capY}
                      r="4.5"
                      fill="url(#goldCapGrad)"
                      stroke="#854d0e"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Brand & Model Label */}
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
              {/* CPU Socket & Metal Retention Arm */}
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
                  {/* Metal Retention Lever */}
                  <line x1="450" y1="138" x2="450" y2="242" stroke="#94a3b8" strokeWidth="2.5" />
                  <circle cx="450" cy="140" r="3.5" fill="#e2e8f0" />

                  {isAmdCpu ? (
                    <g>
                      {/* AM5 / AM4 Heatspreader with Octopus Wings */}
                      <rect x="355" y="145" width="90" height="90" rx="4" fill="#353b4c" stroke="#64748b" strokeWidth="1.5" />
                      <rect x="362" y="152" width="76" height="76" rx="2" fill="#242936" />
                      <polygon points="357,147 365,147 357,155" fill="url(#goldCapGrad)" />
                      <text x="400" y="184" fill="#ef4444" fontSize="13" fontWeight="900" textAnchor="middle">
                        AMD RYZEN
                      </text>
                      <text x="400" y="202" fill="#f1f5f9" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                        {cpu.name.replace(/Processor|Desktop|with/gi, '').slice(0, 16)}
                      </text>
                    </g>
                  ) : (
                    <g>
                      {/* Intel LGA1700 Rectangular IHS */}
                      <rect x="358" y="142" width="84" height="96" rx="4" fill="#2c3342" stroke="#64748b" strokeWidth="1.5" />
                      <rect x="364" y="148" width="72" height="84" rx="2" fill="#1b202a" />
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
                    {/* Top 240/360mm Radiator */}
                    <rect
                      x="220"
                      y="58"
                      width={is360Rad ? 450 : 380}
                      height="26"
                      rx="3"
                      fill="#181b24"
                      stroke="#333b4e"
                    />
                    {/* Radiator Cooling Fins Texture */}
                    <line
                      x1="225"
                      y1="71"
                      x2={is360Rad ? 665 : 595}
                      y2="71"
                      stroke="#252b3a"
                      strokeWidth="8"
                      strokeDasharray="3,2"
                    />

                    {/* Braided Sleeved AIO Liquid Tubes */}
                    <path
                      d="M 380 150 C 340 100, 310 95, 300 84"
                      fill="none"
                      stroke="#0b0d13"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 380 150 C 340 100, 310 95, 300 84"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="6"
                      strokeDasharray="2,2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 420 150 C 460 100, 480 95, 500 84"
                      fill="none"
                      stroke="#0b0d13"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 420 150 C 460 100, 480 95, 500 84"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="6"
                      strokeDasharray="2,2"
                      strokeLinecap="round"
                    />

                    {/* Rotary 90-Degree Swivel Tube Fittings */}
                    <circle cx="380" cy="150" r="6" fill="#1e2433" stroke="#475569" strokeWidth="1.5" />
                    <circle cx="420" cy="150" r="6" fill="#1e2433" stroke="#475569" strokeWidth="1.5" />

                    {/* PHOTOREALISTIC INFINITY MIRROR AIO PUMP HEAD */}
                    <circle
                      cx="400"
                      cy="190"
                      r="40"
                      fill="#0b0d13"
                      stroke={hoveredCategory === 'cooler' ? colors.primary : '#3b4357'}
                      strokeWidth="2.5"
                    />

                    {/* Outer Bevel Frame */}
                    <circle cx="400" cy="190" r="36" fill="#131722" stroke="#252d3d" strokeWidth="2" />

                    {/* Multi-Layered Infinity Tunnel Rings */}
                    <g className={isPoweredOn ? 'aio-infinity-head' : undefined}>
                      <circle
                        cx="400"
                        cy="190"
                        r="30"
                        fill="none"
                        stroke={colors.primary}
                        strokeWidth="3.5"
                        filter={!colors.isOff ? 'url(#rgbBloom)' : undefined}
                        opacity={colors.isOff ? 0.2 : 0.95}
                      />
                      <circle
                        cx="400"
                        cy="190"
                        r="22"
                        fill="none"
                        stroke={colors.secondary}
                        strokeWidth="2.5"
                        filter={!colors.isOff ? 'url(#rgbBloom)' : undefined}
                        opacity={colors.isOff ? 0.15 : 0.85}
                      />
                      <circle
                        cx="400"
                        cy="190"
                        r="15"
                        fill="none"
                        stroke={colors.primary}
                        strokeWidth="2"
                        opacity={colors.isOff ? 0.1 : 0.75}
                      />
                      <circle
                        cx="400"
                        cy="190"
                        r="8"
                        fill="none"
                        stroke={colors.secondary}
                        strokeWidth="1.5"
                        opacity={colors.isOff ? 0.05 : 0.65}
                      />
                    </g>

                    {/* Center Mirror Emblem */}
                    <circle cx="400" cy="190" r="6" fill="#090b10" stroke={colors.primary} strokeWidth="1" />
                    <text x="400" y="222" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      INFINITY AIO
                    </text>
                  </g>
                ) : (
                  <g>
                    {/* AIR COOLER WITH COPPER HEATPIPES */}
                    <rect
                      x="325"
                      y="105"
                      width="150"
                      height="150"
                      rx="6"
                      fill="#1f2430"
                      stroke={hoveredCategory === 'cooler' ? colors.primary : '#454f6b'}
                      strokeWidth="2"
                    />

                    {/* 8 Dense Aluminum Cooling Fins */}
                    {[118, 132, 146, 160, 174, 188, 202, 216, 230].map((finY) => (
                      <line key={finY} x1="330" y1={finY} x2="470" y2={finY} stroke="#38435c" strokeWidth="2.5" />
                    ))}

                    {/* 4 Realistic Copper Heatpipes with Metallic Luster */}
                    <path
                      d="M 350 245 C 350 258, 360 262, 375 262"
                      fill="none"
                      stroke="url(#copperHeatpipeGrad)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 450 245 C 450 258, 440 262, 425 262"
                      fill="none"
                      stroke="url(#copperHeatpipeGrad)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <line x1="365" y1="245" x2="365" y2="260" stroke="url(#copperHeatpipeGrad)" strokeWidth="5" />
                    <line x1="435" y1="245" x2="435" y2="260" stroke="url(#copperHeatpipeGrad)" strokeWidth="5" />

                    {/* Central 120mm Fan Frame & Spinning Fan Blades */}
                    <circle
                      cx="400"
                      cy="175"
                      r="52"
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="3"
                      filter={!colors.isOff ? 'url(#rgbBloom)' : undefined}
                      opacity={colors.isOff ? 0.2 : 0.9}
                    />
                    <g className={isPoweredOn ? 'spin-fan' : undefined}>
                      <circle cx="400" cy="175" r="18" fill="#1b1f2a" stroke="#373e52" />
                      {/* 5 Aerofoil Fan Blades */}
                      {[0, 72, 144, 216, 288].map((angle, i) => (
                        <path
                          key={i}
                          d="M 400 175 Q 425 155, 435 135 Q 420 145, 400 175"
                          fill={colors.fanLed}
                          opacity={colors.isOff ? 0.3 : 0.75}
                          transform={`rotate(${angle} 400 175)`}
                        />
                      ))}
                    </g>
                    <text x="400" y="179" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
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
                    {/* DIMM Slot Frame */}
                    <rect x={dimmX} y="125" width="13" height="130" rx="2" fill="#13161e" stroke="#2b3142" />
                    {/* Top & Bottom Retention Latches */}
                    <rect x={dimmX - 1} y="120" width="15" height="6" fill="#475569" rx="1" />
                    <rect x={dimmX - 1} y="254" width="15" height="6" fill="#475569" rx="1" />

                    {isPopulated && (
                      <g>
                        {/* Metal Heatspreader with Chamfered Details */}
                        <rect
                          x={dimmX + 1}
                          y="126"
                          width="11"
                          height="128"
                          rx="1.5"
                          fill="#262b3a"
                          stroke={hoveredCategory === 'ram' ? colors.primary : '#4b556b'}
                          strokeWidth="1"
                        />
                        {/* Frosted Acrylic RGB Diffuser Bar on Top */}
                        <rect
                          x={dimmX}
                          y="126"
                          width="13"
                          height="24"
                          rx="1.5"
                          fill={colors.fanLed}
                          filter={!colors.isOff ? 'url(#rgbBloom)' : undefined}
                          opacity={colors.isOff ? 0.3 : 0.9}
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
                  {/* Heavy Ambient Occlusion Drop Shadow */}
                  <rect
                    x="180"
                    y="255"
                    width={gpuWidthSvg}
                    height="85"
                    rx="6"
                    fill="#000000"
                    filter="url(#dropShadowHeavy)"
                    opacity="0.8"
                  />

                  {/* GPU Die-Cast Shroud */}
                  <rect
                    x="180"
                    y="255"
                    width={gpuWidthSvg}
                    height="85"
                    rx="6"
                    fill="url(#gpuShroudGrad)"
                    stroke={hoveredCategory === 'gpu' ? colors.primary : '#3e465e'}
                    strokeWidth={hoveredCategory === 'gpu' ? 3 : 2}
                  />

                  {/* Heatsink Recess */}
                  <rect x="190" y="260" width={gpuWidthSvg - 20} height="75" rx="4" fill="#141720" stroke="#2c3242" />

                  {/* REALISTIC ROTATING COOLING FANS (Counter-rotating to eliminate turbulence) */}
                  {(isTripleFanGpu ? [260, 365, 470] : [260, 380]).map((fanX, idx) => {
                    const isReversed = idx % 2 === 1; // Alternating fan rotation like real high-end GPUs!
                    return (
                      <g key={idx}>
                        {/* Fan Well Outer Ring */}
                        <circle cx={fanX} cy="297" r="29" fill="#0d0f15" stroke="#2e3547" strokeWidth="1.5" />
                        <circle
                          cx={fanX}
                          cy="297"
                          r="26"
                          fill="none"
                          stroke={colors.primary}
                          strokeWidth="1.5"
                          filter={!colors.isOff ? 'url(#rgbBloom)' : undefined}
                          opacity={colors.isOff ? 0.2 : 0.75}
                        />

                        {/* Spinning Rotor Blades */}
                        <g className={isPoweredOn ? (isReversed ? 'spin-fan-reverse' : 'spin-fan') : undefined}>
                          <circle cx={fanX} cy="297" r="10" fill="#1c202a" stroke="#333b4e" />
                          {[0, 45, 90, 135, 180, 225, 270, 315].map((bladeAngle, bIdx) => (
                            <path
                              key={bIdx}
                              d={`M ${fanX} 297 Q ${fanX + 16} 285, ${fanX + 22} 272 Q ${fanX + 8} 280, ${fanX} 297`}
                              fill={colors.fanLed}
                              opacity={colors.isOff ? 0.35 : 0.85}
                              transform={`rotate(${bladeAngle} ${fanX} 297)`}
                            />
                          ))}
                        </g>
                      </g>
                    );
                  })}

                  {/* GPU Illuminated Side Logo Lightbar */}
                  <rect
                    x="195"
                    y="262"
                    width="145"
                    height="18"
                    rx="3"
                    fill={colors.fanLed}
                    filter={!colors.isOff ? 'url(#rgbBloom)' : undefined}
                    opacity={colors.isOff ? 0.35 : 0.85}
                  />
                  <text x="267" y="275" fill="#ffffff" fontSize="9.5" fontWeight="900" textAnchor="middle">
                    {gpu.brand.toUpperCase()} {gpu.name.slice(0, 17)}
                  </text>

                  {/* Braided 12VHPWR / PCIe Cable Routed to PSU with Dual Cable Combs */}
                  <path
                    d={`M ${180 + gpuWidthSvg - 35} 340 L ${180 + gpuWidthSvg - 35} 385 C ${180 + gpuWidthSvg - 35} 425, 600 435, 620 455`}
                    fill="none"
                    stroke="#0b0d13"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${180 + gpuWidthSvg - 35} 340 L ${180 + gpuWidthSvg - 35} 385 C ${180 + gpuWidthSvg - 35} 425, 600 435, 620 455`}
                    fill="none"
                    stroke="#3b4458"
                    strokeWidth="7"
                    strokeDasharray="2,2"
                    strokeLinecap="round"
                  />
                  {/* Acrylic Cable Combs */}
                  <rect x={180 + gpuWidthSvg - 42} y="350" width="14" height="6" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                  <rect x={180 + gpuWidthSvg - 42} y="375" width="14" height="6" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                  {/* Connector Plug Header */}
                  <rect x={180 + gpuWidthSvg - 45} y="335" width="20" height="10" rx="2" fill="#1f2937" />
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
            {/* LAYER 6: STORAGE DEVICES (M.2 NVMe SSD)                   */}
            {/* ========================================================= */}
            <g id="layer-6-storage">
              {storage ? (
                <g>
                  {/* NVMe M.2 Metal Heatsink Shield with Thermal Pad notch */}
                  <rect
                    x="370"
                    y="300"
                    width="145"
                    height="28"
                    rx="3"
                    fill="#232838"
                    stroke={hoveredCategory === 'storage' ? colors.primary : '#4a5470'}
                    strokeWidth={hoveredCategory === 'storage' ? 2 : 1.5}
                  />
                  {/* Silver Standoff Retention Screw */}
                  <circle cx="510" cy="314" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
                  <line x1="508" y1="314" x2="512" y2="314" stroke="#334155" strokeWidth="0.8" />

                  <rect x="375" y="305" width="20" height="18" rx="2" fill="#141722" />
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
                    fill="#1c202a"
                    stroke={hoveredCategory === 'psu' ? colors.primary : '#373f54'}
                    strokeWidth={hoveredCategory === 'psu' ? 2.5 : 1.5}
                  />
                  {/* PSU 120mm Intake Fan Grille with Spinning Rotor */}
                  <circle cx="160" cy="552" r="28" fill="#101217" stroke="#2e3547" strokeWidth="1.5" />
                  <g className={isPoweredOn ? 'spin-fan' : undefined}>
                    <circle cx="160" cy="552" r="10" fill="#252a37" />
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                      <line
                        key={i}
                        x1="160"
                        y1="552"
                        x2={160 + 24 * Math.cos((deg * Math.PI) / 180)}
                        y2={552 + 24 * Math.sin((deg * Math.PI) / 180)}
                        stroke="#374151"
                        strokeWidth="2.5"
                      />
                    ))}
                  </g>

                  {/* Rating Badge */}
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
              {/* Front intake fans (Aerodynamic Frosted Curved Blades) */}
              {(isMatxCaseOnly ? [160, 320] : [120, 250, 380]).map((fanY, idx) => (
                <g key={idx}>
                  {/* Outer Diffuser Halo Ring */}
                  <circle
                    cx="740"
                    cy={fanY}
                    r="46"
                    fill="#101218"
                    stroke={colors.primary}
                    strokeWidth={colors.isOff ? 1.5 : 2.5}
                    filter={!colors.isOff ? 'url(#rgbBloom)' : undefined}
                    opacity={colors.isOff ? 0.35 : 0.85}
                  />
                  
                  {/* Spinning Rotor Blades */}
                  <g className={isPoweredOn ? 'spin-fan' : undefined}>
                    <circle cx="740" cy={fanY} r="18" fill="#1e222d" stroke="#33384a" />
                    {[0, 51.4, 102.8, 154.2, 205.7, 257.1, 308.5].map((angle, fIdx) => (
                      <path
                        key={fIdx}
                        d={`M 740 ${fanY - 18} C 735 ${fanY - 35}, 725 ${fanY - 40}, 740 ${fanY - 44} C 750 ${fanY - 40}, 748 ${fanY - 30}, 740 ${fanY - 18}`}
                        fill={colors.fanLed}
                        opacity={colors.isOff ? 0.3 : 0.85}
                        transform={`rotate(${angle} 740 ${fanY})`}
                      />
                    ))}
                  </g>
                </g>
              ))}

              {/* Rear exhaust fan */}
              <circle
                cx="135"
                cy="175"
                r="42"
                fill="#101218"
                stroke={colors.primary}
                strokeWidth={colors.isOff ? 1.5 : 2}
                filter={!colors.isOff ? 'url(#rgbBloom)' : undefined}
                opacity={colors.isOff ? 0.35 : 0.8}
              />
              <g className={isPoweredOn ? 'spin-fan-reverse' : undefined}>
                <circle cx="135" cy="175" r="16" fill="#1e222d" />
                {[0, 60, 120, 180, 240, 300].map((angle, fIdx) => (
                  <path
                    key={fIdx}
                    d="M 135 159 C 131 144, 122 140, 135 136 C 144 140, 142 148, 135 159"
                    fill={colors.fanLed}
                    opacity={colors.isOff ? 0.3 : 0.85}
                    transform={`rotate(${angle} 135 175)`}
                  />
                ))}
              </g>
            </g>

            {/* ========================================================= */}
            {/* LAYER 9: BRAIDED CABLES, LABELS & TEMPERED GLASS          */}
            {/* ========================================================= */}
            <g id="layer-9-cables-glass">
              {/* 24-Pin ATX Individually Sleeved Braided Cable with Comb Clamps */}
              {psu && (
                <>
                  <path
                    d="M 360 550 C 420 550, 430 480, 440 450"
                    fill="none"
                    stroke="#0b0c10"
                    strokeWidth="15"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 360 550 C 420 550, 430 480, 440 450"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="9"
                    strokeDasharray="2,2"
                    strokeLinecap="round"
                  />
                  {/* Cable Comb */}
                  <rect x="405" y="495" width="16" height="6" rx="1.5" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
                </>
              )}

              {/* REALISTIC TEMPERED GLASS LAYER (Toggleable) */}
              {showGlassPanel && (
                <g id="glass-layer" pointerEvents="none">
                  {/* Tinted Glass Surface with High-Gloss Glare Streaks */}
                  <rect
                    x="42"
                    y="32"
                    width="796"
                    height={isMatxCaseOnly ? 566 : 596}
                    rx="15"
                    fill="url(#glassGlareGrad)"
                  />

                  {/* 4 CNC Knurled Stainless Steel Corner Thumbscrews with Rubber Washers */}
                  {[
                    { cx: 58, cy: 48 },
                    { cx: 822, cy: 48 },
                    { cx: 58, cy: isMatxCaseOnly ? 582 : 612 },
                    { cx: 822, cy: isMatxCaseOnly ? 582 : 612 },
                  ].map((screw, sIdx) => (
                    <g key={sIdx}>
                      {/* Black Rubber O-Ring Washer */}
                      <circle cx={screw.cx} cy={screw.cy} r="8" fill="#090a0f" />
                      {/* Stainless Steel Head */}
                      <circle cx={screw.cx} cy={screw.cy} r="6.5" fill="url(#thumbscrewGrad)" stroke="#64748b" strokeWidth="1" />
                      {/* Knurled Grip Center */}
                      <circle cx={screw.cx} cy={screw.cy} r="3" fill="#334155" />
                    </g>
                  ))}

                  {/* Glass Safety Warning Stamp in Bottom Edge */}
                  <text
                    x="440"
                    y={isMatxCaseOnly ? 592 : 622}
                    fill="rgba(255, 255, 255, 0.25)"
                    fontSize="7.5"
                    fontWeight="bold"
                    letterSpacing="2"
                    textAnchor="middle"
                  >
                    TEMPERED GLASS · CAUTION FRAGILE
                  </text>
                </g>
              )}

              {/* FLIR THERMAL HEATMAP INFRARED OVERLAY (When Toggled) */}
              {showThermalView && (
                <g id="thermal-overlay" className="thermal-pulsing" pointerEvents="none">
                  {/* CPU Socket Thermal Hotspot */}
                  <circle cx="400" cy="190" r="85" fill="url(#thermalCpu)" />

                  {/* GPU Core & VRAM Hotspot */}
                  <ellipse cx="360" cy="297" rx={isTripleFanGpu ? 160 : 120} ry="55" fill="url(#thermalGpu)" />

                  {/* Motherboard VRM Hotspot */}
                  <rect x="250" y="80" width="130" height="50" rx="20" fill="url(#thermalVrm)" />

                  {/* Intake Air Cold Zone */}
                  <ellipse cx="740" cy="260" rx="60" ry="170" fill="url(#thermalCold)" />

                  {/* Floating Live Thermal Telemetry Badges */}
                  <g>
                    {/* CPU Temp */}
                    <rect x="360" y="115" width="80" height="20" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="400" y="129" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">
                      CPU: {cpuTemp}°C
                    </text>

                    {/* GPU Temp */}
                    <rect x="230" y="240" width="80" height="20" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#f97316" strokeWidth="1.5" />
                    <text x="270" y="254" fill="#fdba74" fontSize="10" fontWeight="bold" textAnchor="middle">
                      GPU: {gpuTemp}°C
                    </text>

                    {/* VRM Temp */}
                    <rect x="520" y="90" width="80" height="20" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#eab308" strokeWidth="1.5" />
                    <text x="560" y="104" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">
                      VRM: {vrmTemp}°C
                    </text>

                    {/* Intake Temp */}
                    <rect x="700" y="110" width="80" height="20" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="740" y="124" fill="#bae6fd" fontSize="10" fontWeight="bold" textAnchor="middle">
                      IN: 25°C
                    </text>
                  </g>

                  {/* FLIR Spectrum Legend Bar in Bottom Right */}
                  <g transform="translate(620, 560)">
                    <rect x="0" y="0" width="130" height="26" rx="4" fill="rgba(10, 12, 18, 0.95)" stroke="#334155" strokeWidth="1" />
                    <linearGradient id="flirBar" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0055ff" />
                      <stop offset="30%" stopColor="#00ffcc" />
                      <stop offset="55%" stopColor="#ffcc00" />
                      <stop offset="80%" stopColor="#ff3300" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                    <rect x="10" y="6" width="110" height="6" rx="2" fill="url(#flirBar)" />
                    <text x="10" y="21" fill="#94a3b8" fontSize="8" fontWeight="bold">20°C</text>
                    <text x="65" y="21" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">55°C</text>
                    <text x="120" y="21" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">90°C</text>
                  </g>
                </g>
              )}

              {/* On-Canvas Component Labels (Toggleable) */}
              {showCanvasLabels && !showThermalView && (
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
                          fill="rgba(10, 11, 15, 0.88)"
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
                      onClick={() => handleSelectWithAudio(hs.category)}
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
                  onClick={() => handleSelectWithAudio(activeInspection)}
                  icon={activeComponent ? <RotateCcw className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                >
                  {activeComponent ? 'Change' : 'Select'}
                </Button>

                {activeComponent && onRemoveCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWithAudio(activeInspection)}
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
                onClick={() => handleSelectWithAudio(cat)}
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

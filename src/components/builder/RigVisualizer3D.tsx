'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BuildComponents, ComponentCategory } from '@/types';
import { InrPrice } from '@/components/common/InrPrice';
import { CATEGORY_LABELS } from '@/components/common/ComponentIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  RotateCcw,
  Sparkles,
  Layers,
  Box,
  Compass,
  Eye,
  Maximize2,
  Check,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';
import { rigAudio } from '@/lib/audio/rigAudio';

interface RigVisualizer3DProps {
  components: BuildComponents;
  onSelectCategory: (cat: ComponentCategory) => void;
  rgbTheme: 'magenta' | 'cyberpunk' | 'arctic' | 'stealth';
}

type CameraPreset = 'isometric' | 'side' | 'front_angle' | 'top_down';

export const RigVisualizer3D: React.FC<RigVisualizer3DProps> = ({
  components,
  onSelectCategory,
  rgbTheme,
}) => {
  const { cpu, motherboard, ram, gpu, storage, psu, cabinet, cooler } = components;

  // 3D Orbit & Perspective Angles
  const [yaw, setYaw] = useState<number>(24); // Horizontal rotation in degrees (-45 to 45)
  const [pitch, setPitch] = useState<number>(-12); // Vertical tilt in degrees (-25 to 25)
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseLightPos, setMouseLightPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const containerRef = useRef<HTMLDivElement>(null);

  const rgbColorMap = {
    magenta: { primary: '#ec4899', secondary: '#f43f5e', glow: 'rgba(236,72,153,0.45)' },
    cyberpunk: { primary: '#06b6d4', secondary: '#3b82f6', glow: 'rgba(6,182,212,0.45)' },
    arctic: { primary: '#38bdf8', secondary: '#e0f2fe', glow: 'rgba(56,189,248,0.45)' },
    stealth: { primary: '#475569', secondary: '#1e293b', glow: 'rgba(71,85,105,0.15)' },
  };

  const themeColors = rgbColorMap[rgbTheme] || rgbColorMap.magenta;

  // Camera presets
  const applyPreset = (preset: CameraPreset) => {
    rigAudio.playLatchClick();
    setCameraPreset(preset);
    switch (preset) {
      case 'isometric':
        setYaw(24);
        setPitch(-12);
        break;
      case 'front_angle':
        setYaw(38);
        setPitch(-8);
        break;
      case 'side':
        setYaw(0);
        setPitch(0);
        break;
      case 'top_down':
        setYaw(15);
        setPitch(-24);
        break;
    }
  };

  // Mouse drag orbit controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Dynamic light tracking
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setMouseLightPos({ x: xPercent, y: yPercent });
    }

    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setYaw((prev) => Math.max(-48, Math.min(48, prev + deltaX * 0.4)));
    setPitch((prev) => Math.max(-28, Math.min(28, prev - deltaY * 0.3)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleExplodedView = () => {
    rigAudio.playGlassToggle();
    setIsExploded(!isExploded);
  };

  // Reset orbit
  const handleResetOrbit = () => {
    rigAudio.playLatchClick();
    setYaw(24);
    setPitch(-12);
    setCameraPreset('isometric');
    setIsExploded(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[620px] bg-gradient-to-b from-[#080b12] via-[#0d121f] to-[#05070a] rounded-2xl overflow-hidden border border-charcoal-800 shadow-2xl flex flex-col items-center justify-center p-3 select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* 3D Dynamic Ambient Room Backlight that tracks mouse */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-300"
        style={{
          left: `${mouseLightPos.x}%`,
          top: `${mouseLightPos.y}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${themeColors.primary} 0%, transparent 70%)`,
        }}
      />

      {/* Top 3D Camera Controls Header */}
      <div className="absolute top-3 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          <Badge variant="magenta" size="sm" className="flex items-center gap-1 font-bold text-[10px]">
            <Box className="w-3 h-3" /> 3D Orbit Studio
          </Badge>
          <span className="text-[11px] text-charcoal-400 hidden sm:inline">
            Drag with mouse to rotate chassis in 3D space
          </span>
        </div>

        {/* Camera Angles & Exploded View Toggle */}
        <div className="flex items-center gap-1.5 bg-charcoal-950/85 backdrop-blur-md border border-charcoal-800 p-1 rounded-xl shadow-lg">
          {(['isometric', 'front_angle', 'side', 'top_down'] as CameraPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-2.5 py-1 text-[10.5px] font-semibold rounded-lg capitalize transition-all ${
                cameraPreset === preset
                  ? 'bg-magenta-950/80 border border-magenta-700/80 text-magenta-300 font-bold shadow-sm'
                  : 'text-charcoal-400 hover:text-white'
              }`}
            >
              {preset.replace('_', ' ')}
            </button>
          ))}

          <div className="h-4 w-px bg-charcoal-800 mx-0.5" />

          {/* Exploded Assembly View Button */}
          <button
            onClick={toggleExplodedView}
            className={`px-2.5 py-1 text-[10.5px] font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
              isExploded
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-amber-950/40 shadow-sm'
                : 'bg-charcoal-900 border-charcoal-800 text-charcoal-300 hover:text-white'
            }`}
            title="Explode parts to see how components mount inside"
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span>{isExploded ? 'Exploded: ON' : 'Exploded View'}</span>
          </button>

          <button
            onClick={handleResetOrbit}
            className="p-1 text-charcoal-400 hover:text-white rounded-lg transition-colors"
            title="Reset 3D Orbit View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Perspective Scene Container */}
      <div
        className="w-full h-full flex items-center justify-center pointer-events-none"
        style={{
          perspective: '1200px',
        }}
      >
        {/* 3D Transformed Chassis Wrapper */}
        <div
          className="relative transition-transform duration-150 ease-out will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) scale(0.92)`,
          }}
        >
          {/* Ground Studio Reflection Shadow */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[420px] h-32 rounded-full blur-2xl pointer-events-none opacity-60"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.95) 0%, transparent 75%)',
              transform: 'rotateX(90deg) translateZ(-60px)',
            }}
          />

          {/* Main 3D PC Chassis Isometric Assembly (SVG with Dynamic Perspective Depth) */}
          <svg
            viewBox="0 0 680 540"
            className="w-[480px] sm:w-[560px] md:w-[620px] h-auto drop-shadow-2xl select-none"
          >
            <defs>
              {/* Chassis Anisotropic Metal with 3D Depth */}
              <linearGradient id="chassis3DMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2c3345" />
                <stop offset="30%" stopColor="#1e2330" />
                <stop offset="70%" stopColor="#141722" />
                <stop offset="100%" stopColor="#0b0d13" />
              </linearGradient>

              {/* Front Bezel 3D Gradient */}
              <linearGradient id="frontBezel3D" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#161922" />
                <stop offset="50%" stopColor="#252a3a" />
                <stop offset="100%" stopColor="#11131a" />
              </linearGradient>

              {/* Tempered Glass 3D Specular Sheen */}
              <linearGradient id="glass3DSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="25%" stopColor="rgba(255,255,255,0.04)" />
                <stop offset="70%" stopColor="rgba(255,255,255,0.01)" />
                <stop offset="85%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>

              {/* RGB Underglow */}
              <linearGradient id="rgb3DGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={themeColors.secondary} stopOpacity="0.3" />
                <stop offset="50%" stopColor={themeColors.primary} stopOpacity="0.85" />
                <stop offset="100%" stopColor={themeColors.secondary} stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* ================= 3D CHASSIS MAIN BODY ================= */}
            {/* Rear/Top Depth Extrusions */}
            <g id="chassis-extrusion-depth">
              {/* Top Panel (Isometric Polygon) */}
              <polygon
                points="130,70 510,70 550,40 170,40"
                fill="#1b202c"
                stroke="#323b50"
                strokeWidth="1.5"
              />
              {/* Top Fan Grille Mesh */}
              <polygon
                points="170,66 480,66 510,44 200,44"
                fill="#0e1017"
                stroke="#252b3b"
                strokeDasharray="3,2"
              />

              {/* Front Panel 3D Side (Right-angled extrusion) */}
              <polygon
                points="510,70 550,40 550,440 510,480"
                fill="url(#frontBezel3D)"
                stroke="#2a3245"
                strokeWidth="1.5"
              />
              {/* Front Panel Mesh Lines */}
              {[120, 180, 240, 300, 360, 420].map((y) => (
                <line key={y} x1="514" y1={y + 10} x2="546" y2={y - 15} stroke="#2e374d" strokeWidth="2" />
              ))}

              {/* Front RGB Dual Lightstrips */}
              <line x1="512" y1="90" x2="512" y2="470" stroke={themeColors.primary} strokeWidth="3" opacity="0.85" />
              <line x1="548" y1="60" x2="548" y2="435" stroke={themeColors.secondary} strokeWidth="2" opacity="0.65" />
            </g>

            {/* Main Chamber Frame */}
            <g id="main-chamber-3d">
              {/* Main Interior Cavity Backing */}
              <polygon
                points="130,70 510,70 510,480 130,480"
                fill="#0b0e15"
                stroke="#2d364a"
                strokeWidth="2"
              />

              {/* PSU Shroud Lower Deck */}
              <polygon
                points="130,400 510,400 510,480 130,480"
                fill="#121620"
                stroke="#252c3d"
                strokeWidth="1.5"
              />
              <line x1="130" y1="400" x2="510" y2="400" stroke="#333d54" strokeWidth="2" />
              <text x="320" y="445" fill="#505b75" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                {cabinet ? cabinet.name.slice(0, 24).toUpperCase() : 'MID-TOWER CHASSIS'}
              </text>
            </g>

            {/* ================= COMPONENT LAYERS (With Exploded Offset) ================= */}
            {/* MOTHERBOARD (Pushed back in Z / Left when exploded) */}
            <g
              id="mobo-3d-layer"
              transform={isExploded ? 'translate(-35, -20)' : 'translate(0, 0)'}
              className="transition-transform duration-500 ease-out pointer-events-auto cursor-pointer"
              onClick={() => onSelectCategory('motherboard')}
            >
              {/* Motherboard PCB */}
              <rect
                x="180"
                y="100"
                width="290"
                height="280"
                rx="5"
                fill="#141822"
                stroke={motherboard ? '#3b455c' : '#262d3d'}
                strokeWidth="2"
              />
              {/* I/O Shield Metal Armor */}
              <rect x="182" y="102" width="35" height="120" rx="3" fill="#1e2433" stroke="#3d475f" />
              {/* VRM Heatsinks */}
              <rect x="225" y="105" width="90" height="26" rx="2" fill="#242c3d" stroke="#444f6b" />

              {/* CPU Socket & Processor */}
              <rect x="280" y="145" width="75" height="75" rx="4" fill="#293144" stroke="#4b5775" />
              {cpu && (
                <text x="317" y="188" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {cpu.brand} {cpu.name.slice(0, 10)}
                </text>
              )}

              {/* RAM DIMM Slots */}
              {[380, 395, 410, 425].map((x, i) => (
                <g key={i}>
                  <rect x={x} y="135" width="8" height="95" rx="1.5" fill="#10131b" stroke="#2b3345" />
                  {ram && (
                    <rect
                      x={x + 1}
                      y="136"
                      width="6"
                      height="20"
                      rx="1"
                      fill={themeColors.primary}
                      opacity="0.9"
                    />
                  )}
                </g>
              ))}

              {isExploded && (
                <g transform="translate(140, 80)">
                  <rect x="0" y="0" width="105" height="20" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
                  <text x="52" y="14" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                    1. Motherboard
                  </text>
                </g>
              )}
            </g>

            {/* CPU COOLER (Floats upwards when exploded) */}
            <g
              id="cooler-3d-layer"
              transform={isExploded ? 'translate(0, -60)' : 'translate(0, 0)'}
              className="transition-transform duration-500 ease-out pointer-events-auto cursor-pointer"
              onClick={() => onSelectCategory('cooler')}
            >
              {cooler ? (
                <>
                  {/* Infinity Mirror AIO Pump Head */}
                  <circle cx="317" cy="182" r="32" fill="#0c0e15" stroke="#3b445c" strokeWidth="2" />
                  <circle
                    cx="317"
                    cy="182"
                    r="24"
                    fill="none"
                    stroke={themeColors.primary}
                    strokeWidth="3.5"
                    className="spin-fan"
                  />
                  <circle
                    cx="317"
                    cy="182"
                    r="15"
                    fill="none"
                    stroke={themeColors.secondary}
                    strokeWidth="2"
                  />
                  <circle cx="317" cy="182" r="6" fill="#1e293b" />

                  {/* Liquid Tubes connecting to Radiator */}
                  <path
                    d="M 305 160 C 270 120, 260 90, 260 70"
                    fill="none"
                    stroke="#111520"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 329 160 C 360 120, 370 90, 370 70"
                    fill="none"
                    stroke="#111520"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <circle cx="317" cy="182" r="26" fill="none" stroke="#333f56" strokeDasharray="3,3" />
              )}

              {isExploded && (
                <g transform="translate(330, 95)">
                  <rect x="0" y="0" width="90" height="20" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
                  <text x="45" y="14" fill="#fbcfe8" fontSize="9" fontWeight="bold" textAnchor="middle">
                    2. CPU Cooler
                  </text>
                </g>
              )}
            </g>

            {/* GRAPHICS CARD GPU (Floats forward towards viewer when exploded) */}
            <g
              id="gpu-3d-layer"
              transform={isExploded ? 'translate(45, 40)' : 'translate(0, 0)'}
              className="transition-transform duration-500 ease-out pointer-events-auto cursor-pointer"
              onClick={() => onSelectCategory('gpu')}
            >
              {gpu ? (
                <>
                  {/* Heavy 3D GPU Extrusion */}
                  <polygon
                    points="200,280 470,280 480,270 210,270"
                    fill="#2a3245"
                    stroke="#3f4b66"
                  />
                  {/* GPU Faceplate */}
                  <rect
                    x="200"
                    y="280"
                    width="270"
                    height="68"
                    rx="4"
                    fill="#181e2b"
                    stroke={themeColors.primary}
                    strokeWidth="1.5"
                  />

                  {/* Dual/Triple Cooling Fans in 3D Perspective */}
                  {[250, 335, 420].map((fanX, fIdx) => (
                    <g key={fIdx} className="spin-fan">
                      <circle cx={fanX} cy="314" r="22" fill="#0e1118" stroke="#333d54" />
                      <circle cx={fanX} cy="314" r="7" fill="#202737" />
                      {[0, 60, 120, 180, 240, 300].map((deg, dIdx) => (
                        <line
                          key={dIdx}
                          x1={fanX}
                          y1={fanX}
                          x2={fanX + 18 * Math.cos((deg * Math.PI) / 180)}
                          y2={314 + 18 * Math.sin((deg * Math.PI) / 180)}
                          stroke={themeColors.primary}
                          strokeWidth="2"
                          opacity="0.8"
                        />
                      ))}
                    </g>
                  ))}

                  {/* GPU RGB Side Banner */}
                  <rect x="210" y="284" width="100" height="12" rx="2" fill={themeColors.primary} opacity="0.9" />
                  <text x="260" y="293" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {gpu.brand.toUpperCase()} {gpu.name.slice(0, 12)}
                  </text>
                </>
              ) : (
                <rect x="200" y="280" width="270" height="60" rx="4" fill="none" stroke="#3b445c" strokeDasharray="4,4" />
              )}

              {isExploded && (
                <g transform="translate(485, 300)">
                  <rect x="0" y="0" width="110" height="20" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                  <text x="55" y="14" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">
                    3. PCIe Graphics
                  </text>
                </g>
              )}
            </g>

            {/* FRONT FANS (Right side in 3D) */}
            <g id="front-fans-3d">
              {[140, 240, 340].map((fanY, i) => (
                <g key={i}>
                  <ellipse cx="490" cy={fanY} rx="12" ry="36" fill="#0f121a" stroke={themeColors.primary} strokeWidth="2" />
                  <ellipse cx="490" cy={fanY} rx="5" ry="12" fill="#202738" />
                </g>
              ))}
            </g>

            {/* ================= 3D TEMPERED GLASS SIDE PANEL (Slides off when exploded) ================= */}
            <g
              id="glass-panel-3d"
              transform={isExploded ? 'translate(80, -30)' : 'translate(0, 0)'}
              className="transition-transform duration-500 ease-out pointer-events-none"
            >
              <polygon
                points="130,70 510,70 510,480 130,480"
                fill="url(#glass3DSheen)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />

              {/* 4 Corner Knurled Thumbscrews */}
              <circle cx="145" cy="85" r="5" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="495" cy="85" r="5" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="145" cy="465" r="5" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="495" cy="465" r="5" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />

              {isExploded && (
                <g transform="translate(520, 160)">
                  <rect x="0" y="0" width="130" height="22" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                  <text x="65" y="15" fill="#fef08a" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Tempered Glass Removed
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom Orbit Telemetry Badge */}
      <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-between text-xs text-charcoal-400 bg-charcoal-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-charcoal-800">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-charcoal-300">
            Yaw: <strong className="text-white">{Math.round(yaw)}°</strong> | Pitch: <strong className="text-white">{Math.round(pitch)}°</strong>
          </span>
          <span className="hidden sm:inline text-charcoal-500">·</span>
          <span className="hidden sm:inline text-[11px] text-charcoal-400">
            Interactive Ray Tracing & Specular Shaders active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExplodedView}
            className="text-[11px] h-7 px-2.5 text-amber-300 hover:text-amber-200"
          >
            {isExploded ? 'Collapse Parts' : 'Explode Diagram'}
          </Button>
        </div>
      </div>
    </div>
  );
};

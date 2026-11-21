'use client';

import React, { useState } from 'react';
import { BuildComponents } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Gamepad2,
  Tv,
  Zap,
  Gauge,
  Flame,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Trophy,
} from 'lucide-react';
import { rigAudio } from '@/lib/audio/rigAudio';

interface PerformanceBenchmarkStudioProps {
  components: BuildComponents;
  estimatedWattage: number;
}

type Resolution = '1080p' | '1440p' | '4k';
type QualityPreset = 'Ultra' | 'High' | 'Medium';

interface GameBenchmarkProfile {
  id: string;
  title: string;
  genre: string;
  engine: string;
  baseFps1080p: number; // Base average FPS on midrange GPU
  gpuMultiplier: number;
  cpuSensitivity: number; // 0.1 (pure GPU) to 0.7 (esports CPU bound)
  rtSupport: boolean;
}

const BENCHMARK_GAMES: GameBenchmarkProfile[] = [
  {
    id: 'cyberpunk',
    title: 'Cyberpunk 2077: Phantom Liberty',
    genre: 'Action RPG / Open World',
    engine: 'REDengine 4 (Ray Tracing)',
    baseFps1080p: 72,
    gpuMultiplier: 1.4,
    cpuSensitivity: 0.35,
    rtSupport: true,
  },
  {
    id: 'wukong',
    title: 'Black Myth: Wukong',
    genre: 'Action RPG / UE5',
    engine: 'Unreal Engine 5 (Nanite & Lumen)',
    baseFps1080p: 68,
    gpuMultiplier: 1.5,
    cpuSensitivity: 0.25,
    rtSupport: true,
  },
  {
    id: 'gta5',
    title: 'Grand Theft Auto V / Online',
    genre: 'Open World',
    engine: 'RAGE Engine (Ultra Settings)',
    baseFps1080p: 145,
    gpuMultiplier: 0.9,
    cpuSensitivity: 0.55,
    rtSupport: false,
  },
  {
    id: 'valorant',
    title: 'Valorant',
    genre: 'Tactical Shooter / Esports',
    engine: 'Unreal Engine (Vanguard)',
    baseFps1080p: 280,
    gpuMultiplier: 0.6,
    cpuSensitivity: 0.85,
    rtSupport: false,
  },
  {
    id: 'cs2',
    title: 'Counter-Strike 2 (CS2)',
    genre: 'Esports Competitive',
    engine: 'Source 2 Engine',
    baseFps1080p: 210,
    gpuMultiplier: 0.85,
    cpuSensitivity: 0.75,
    rtSupport: false,
  },
  {
    id: 'rdr2',
    title: 'Red Dead Redemption 2',
    genre: 'Cinematic Western',
    engine: 'RAGE Engine (Vulkan Ultra)',
    baseFps1080p: 85,
    gpuMultiplier: 1.35,
    cpuSensitivity: 0.3,
    rtSupport: false,
  },
];

export const PerformanceBenchmarkStudio: React.FC<PerformanceBenchmarkStudioProps> = ({
  components,
  estimatedWattage,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('cyberpunk');
  const [resolution, setResolution] = useState<Resolution>('1440p');
  const [preset, setPreset] = useState<QualityPreset>('Ultra');
  const [isRayTracingOn, setIsRayTracingOn] = useState<boolean>(true);
  const [isDlssOn, setIsDlssOn] = useState<boolean>(true);

  const { cpu, gpu, ram, cooler, psu } = components;

  const currentGame =
    BENCHMARK_GAMES.find((g) => g.id === selectedGameId) || BENCHMARK_GAMES[0];

  // Dynamic Hardware Strength Multipliers
  const calculateGpuScore = (): number => {
    if (!gpu) return 0.25; // Integrated graphics
    const name = gpu.name.toLowerCase();
    if (name.includes('4090')) return 3.4;
    if (name.includes('4080') || name.includes('7900 xtx')) return 2.7;
    if (name.includes('4070 ti') || name.includes('7900 xt')) return 2.2;
    if (name.includes('4070') || name.includes('7800 xt')) return 1.8;
    if (name.includes('4060 ti') || name.includes('7700 xt') || name.includes('3080')) return 1.45;
    if (name.includes('4060') || name.includes('7600') || name.includes('3060 ti')) return 1.15;
    if (name.includes('3060') || name.includes('6600')) return 0.95;
    if (name.includes('1650') || name.includes('580') || name.includes('6500')) return 0.55;
    return 1.0;
  };

  const calculateCpuScore = (): number => {
    if (!cpu) return 0.5;
    const name = cpu.name.toLowerCase();
    if (name.includes('7800x3d') || name.includes('9800x3d') || name.includes('14900k')) return 1.5;
    if (name.includes('7700') || name.includes('14700') || name.includes('13700')) return 1.3;
    if (name.includes('7600') || name.includes('13600') || name.includes('14600') || name.includes('5800x3d')) return 1.15;
    if (name.includes('5600') || name.includes('12400') || name.includes('13400')) return 1.0;
    if (name.includes('3600') || name.includes('10400') || name.includes('12100')) return 0.85;
    return 0.75;
  };

  const gpuScore = calculateGpuScore();
  const cpuScore = calculateCpuScore();

  // Resolution Penalties
  const resMultiplier = resolution === '1080p' ? 1.0 : resolution === '1440p' ? 0.72 : 0.42;

  // Preset Adjustments
  const presetMultiplier = preset === 'Ultra' ? 1.0 : preset === 'High' ? 1.18 : 1.42;

  // Ray Tracing & DLSS
  const rtFactor = isRayTracingOn && currentGame.rtSupport ? 0.72 : 1.0;
  const dlssFactor = isDlssOn ? 1.35 : 1.0;

  // Calculate Average FPS
  const weightedPerformance =
    gpuScore * (1 - currentGame.cpuSensitivity) + cpuScore * currentGame.cpuSensitivity;

  const rawFps =
    currentGame.baseFps1080p *
    weightedPerformance *
    resMultiplier *
    presetMultiplier *
    rtFactor *
    dlssFactor;

  const avgFps = Math.max(15, Math.round(rawFps));
  const onePercentLow = Math.max(10, Math.round(avgFps * 0.74));

  // Bottleneck Percentage
  const gpuVsCpuRatio = gpuScore / Math.max(0.1, cpuScore);
  let bottleneckText = 'Balanced Gaming Synergy (98% GPU Bound)';
  let isBottleneckSevere = false;

  if (gpuVsCpuRatio > 1.8) {
    bottleneckText = 'CPU Bottleneck (~16%): CPU may limit peak FPS in esports titles.';
    isBottleneckSevere = true;
  } else if (gpuVsCpuRatio < 0.6) {
    bottleneckText = 'GPU Bottleneck: GPU is operating at 100% capacity.';
  }

  // Peak Simulated Power and Acoustic Level
  const peakPowerLoad = Math.round(estimatedWattage * 0.88);
  const fanNoiseDb = cooler ? 31 : 38;

  const handleResolutionSwitch = (res: Resolution) => {
    rigAudio.playLatchClick();
    setResolution(res);
  };

  return (
    <div className="w-full aspect-[16/10] sm:aspect-[16/9] max-h-[620px] bg-gradient-to-b from-[#0a0d17] via-[#0f1422] to-[#07090e] rounded-2xl overflow-y-auto overflow-x-hidden border border-charcoal-800 shadow-2xl p-4 sm:p-6 text-white select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-magenta-950/70 border border-magenta-700/60 flex items-center justify-center text-magenta-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-wide flex items-center gap-2">
              Performance Benchmark & Telemetry Studio
              <Badge variant="magenta" size="sm" className="text-[10px]">
                Real-Time Simulation
              </Badge>
            </h3>
            <p className="text-xs text-charcoal-400">
              Live algorithmic frame rates, 1% lows, and hardware bottleneck calculations.
            </p>
          </div>
        </div>

        {/* Resolution Tabs */}
        <div className="flex items-center bg-charcoal-900 border border-charcoal-800 p-1 rounded-xl">
          {(['1080p', '1440p', '4k'] as Resolution[]).map((res) => (
            <button
              key={res}
              onClick={() => handleResolutionSwitch(res)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                resolution === res
                  ? 'bg-magenta-600 text-white shadow-md'
                  : 'text-charcoal-400 hover:text-white'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Games List & Live Telemetry Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Left Column: Popular Games Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">
            Select Game Benchmark Profile:
          </span>
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {BENCHMARK_GAMES.map((game) => {
              const isSelected = selectedGameId === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => {
                    rigAudio.playLatchClick();
                    setSelectedGameId(game.id);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-charcoal-800 border-magenta-500 shadow-md ring-1 ring-magenta-500/30'
                      : 'bg-charcoal-900/60 border-charcoal-800/80 hover:border-charcoal-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-charcoal-200'}`}>
                      {game.title}
                    </p>
                    <p className="text-[10px] text-charcoal-400 truncate mt-0.5">
                      {game.genre} · {game.engine}
                    </p>
                  </div>
                  {game.rtSupport && (
                    <Badge variant="outline" size="sm" className="text-[9px] shrink-0 text-amber-400 border-amber-600/40">
                      RT Ready
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Graphics Settings Switches */}
          <div className="p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800/80 space-y-2 mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal-300 font-semibold">Quality Preset:</span>
              <div className="flex items-center gap-1 bg-charcoal-900 p-0.5 rounded-lg border border-charcoal-800">
                {(['Medium', 'High', 'Ultra'] as QualityPreset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      rigAudio.playLatchClick();
                      setPreset(p);
                    }}
                    className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${
                      preset === p ? 'bg-charcoal-700 text-white' : 'text-charcoal-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {currentGame.rtSupport && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-charcoal-800/60">
                <span className="text-charcoal-300">Ray Tracing (RT):</span>
                <button
                  onClick={() => setIsRayTracingOn(!isRayTracingOn)}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                    isRayTracingOn
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-charcoal-900 border-charcoal-800 text-charcoal-500'
                  }`}
                >
                  {isRayTracingOn ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 border-t border-charcoal-800/60">
              <span className="text-charcoal-300">AI Upscaling (DLSS / FSR):</span>
              <button
                onClick={() => setIsDlssOn(!isDlssOn)}
                className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                  isDlssOn
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-charcoal-900 border-charcoal-800 text-charcoal-500'
                }`}
              >
                {isDlssOn ? 'Quality Mode' : 'Off (Native)'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry Gauges (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          {/* Giant FPS Speedometer Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-charcoal-900/90 to-charcoal-950 border border-charcoal-700/80 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block">
                  Simulated Frame Rate ({resolution} {preset})
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-magenta-200 to-magenta-400 font-mono">
                    {avgFps}
                  </span>
                  <span className="text-lg font-bold text-magenta-400">FPS AVG</span>
                </div>
              </div>

              {/* Tier Badge */}
              <div className="text-right">
                <Badge
                  variant={avgFps >= 144 ? 'success' : avgFps >= 60 ? 'magenta' : 'warning'}
                  size="md"
                  className="font-bold text-xs"
                >
                  {avgFps >= 240
                    ? '⚡ Esports Pro Ready (240+)'
                    : avgFps >= 144
                    ? '🔥 High-Refresh Gaming (144+)'
                    : avgFps >= 60
                    ? '✨ Smooth 60 FPS AAA'
                    : '⚠️ Sub-60 FPS (Lower settings)'}
                </Badge>
                <p className="text-[10px] text-charcoal-400 mt-1">
                  1% Low: <strong className="text-white font-mono">{onePercentLow} FPS</strong>
                </p>
              </div>
            </div>

            {/* Visual Frame-rate Bar */}
            <div className="mt-4">
              <div className="w-full h-3 bg-charcoal-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-magenta-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (avgFps / 240) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-charcoal-400 mt-1">
                <span>0 FPS</span>
                <span>60 FPS</span>
                <span>120 FPS</span>
                <span>165 FPS</span>
                <span>240+ FPS</span>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics Row: Power, Bottleneck & Acoustics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Bottleneck Gauge */}
            <div className="p-3 rounded-xl bg-charcoal-900/70 border border-charcoal-800">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Hardware Balance
              </span>
              <p className={`text-xs font-bold mt-1 ${isBottleneckSevere ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isBottleneckSevere ? 'CPU Bound' : 'GPU Bound (Ideal)'}
              </p>
              <p className="text-[10px] text-charcoal-400 mt-0.5 line-clamp-2">
                {bottleneckText}
              </p>
            </div>

            {/* Peak Gaming Power Load */}
            <div className="p-3 rounded-xl bg-charcoal-900/70 border border-charcoal-800">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Gaming Power Load
              </span>
              <p className="text-xs font-bold text-white mt-1 font-mono">
                ~{peakPowerLoad}W Peak
              </p>
              <p className="text-[10px] text-charcoal-400 mt-0.5">
                PSU: {psu ? psu.name.slice(0, 16) : 'Unmounted'}
              </p>
            </div>

            {/* Acoustic Noise */}
            <div className="p-3 rounded-xl bg-charcoal-900/70 border border-charcoal-800">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Estimated Acoustics
              </span>
              <p className="text-xs font-bold text-cyan-400 mt-1 font-mono">
                ~{fanNoiseDb} dB(A)
              </p>
              <p className="text-[10px] text-charcoal-400 mt-0.5">
                Whisper Quiet Ambient
              </p>
            </div>
          </div>

          {/* Active Hardware Telemetry Specs Pill */}
          <div className="p-2.5 rounded-xl bg-charcoal-950/90 border border-charcoal-800 text-[11px] text-charcoal-300 flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong className="text-white">CPU:</strong> {cpu ? `${cpu.brand} ${cpu.name}` : 'None'} |{' '}
              <strong className="text-white">GPU:</strong> {gpu ? `${gpu.brand} ${gpu.name}` : 'Integrated iGPU'}
            </div>
            <div className="text-charcoal-400 font-mono text-[10px]">
              Engine: System Maker Core v2.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

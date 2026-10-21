import React, { useState } from 'react';
import { Component } from '@/types';
import {
  POPULAR_GAMES,
  BENCHMARK_DISCLAIMER_UNAVAILABLE,
  getVerifiedBenchmarksForComponents,
  GameTitle,
} from '@/data/benchmarks';
import { Gamepad2, ShieldAlert, ShieldCheck, Calendar, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface FpsEstimatorProps {
  cpu?: Component;
  gpu?: Component;
}

export const FpsEstimator: React.FC<FpsEstimatorProps> = ({ cpu, gpu }) => {
  const [selectedGame, setSelectedGame] = useState<GameTitle>('Cyberpunk 2077');
  const [selectedResolution, setSelectedResolution] = useState<'1080p' | '1440p' | '4K'>('1080p');

  // Query verified benchmarks for the selected combination
  const matchingBenchmarks = getVerifiedBenchmarksForComponents(cpu?.id, gpu?.id, {
    game: selectedGame,
    resolution: selectedResolution,
  });

  const benchmarkRecord = matchingBenchmarks[0] || null;

  return (
    <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-magenta-950/60 border border-magenta-800/60 text-magenta-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Verified Gaming Benchmark Telemetry
            </h3>
            <p className="text-xs text-charcoal-400">
              Reliable real-world test results. Zero synthetic or fabricated figures.
            </p>
          </div>
        </div>

        {/* Resolution selector */}
        <div className="flex items-center gap-1 bg-charcoal-800 p-1 rounded-lg border border-charcoal-700 self-start sm:self-auto">
          {(['1080p', '1440p', '4K'] as const).map((res) => (
            <button
              key={res}
              onClick={() => setSelectedResolution(res)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedResolution === res
                  ? 'bg-magenta-accent text-white shadow-sm'
                  : 'text-charcoal-400 hover:text-white'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {POPULAR_GAMES.map((game) => (
          <button
            key={game}
            onClick={() => setSelectedGame(game)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedGame === game
                ? 'bg-charcoal-750 text-white border border-magenta-500/50 shadow-sm'
                : 'bg-charcoal-850 text-charcoal-400 hover:text-white border border-charcoal-800'
            }`}
          >
            {game}
          </button>
        ))}
      </div>

      {/* Benchmark Display Card */}
      {benchmarkRecord ? (
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white">{benchmarkRecord.game}</span>
                <Badge variant="magenta" size="sm">
                  {benchmarkRecord.resolution} ({benchmarkRecord.qualityPreset} Preset)
                </Badge>
              </div>
              <p className="text-xs text-charcoal-400">
                Hardware: {benchmarkRecord.cpuName} + {benchmarkRecord.gpuName}
              </p>
            </div>

            {/* FPS Badges */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block tracking-wider">
                  Average FPS
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {benchmarkRecord.avgFps}
                </span>
              </div>
              <div className="text-right pl-3 border-l border-charcoal-750">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block tracking-wider">
                  1% Lows
                </span>
                <span className="text-xl font-bold text-charcoal-200 font-mono">
                  {benchmarkRecord.low1PercentFps}
                </span>
              </div>
            </div>
          </div>

          {/* Test Conditions & Verification Citation */}
          <div className="pt-3 border-t border-charcoal-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Source: <strong className="text-charcoal-200">{benchmarkRecord.source}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
              <span>Tested on: {benchmarkRecord.testDate} ({benchmarkRecord.driverVersion})</span>
            </div>
            {benchmarkRecord.testSystemNotes && (
              <div className="sm:col-span-2 text-[11px] text-charcoal-400 italic">
                Environment: {benchmarkRecord.testSystemNotes}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-charcoal-850/60 border border-dashed border-charcoal-800 text-center space-y-2">
          <div className="w-9 h-9 rounded-full bg-charcoal-800 text-charcoal-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-charcoal-300">
            {BENCHMARK_DISCLAIMER_UNAVAILABLE}
          </h4>
          <p className="text-xs text-charcoal-400 max-w-md mx-auto">
            {!cpu || !gpu
              ? 'Select both a Processor (CPU) and a dedicated Graphic Card (GPU) in the builder to query verified gaming benchmark records.'
              : `No verified test lab record exists for ${cpu.name} paired with ${gpu.name} in ${selectedGame} at ${selectedResolution}. System Maker Core India strictly does not fabricate synthetic FPS estimates.`}
          </p>
        </div>
      )}
    </div>
  );
};

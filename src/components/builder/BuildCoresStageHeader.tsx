'use client';

import React, { useState } from 'react';
import { InrPrice } from '@/components/common/InrPrice';
import {
  Edit3,
  Check,
  RotateCw,
  Share2,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Settings,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { CompatibilityReport } from '@/types';

interface BuildCoresStageHeaderProps {
  buildName: string;
  onUpdateBuildName: (name: string) => void;
  totalPriceINR: number;
  compatibilityReport: CompatibilityReport;
  estimatedWattage: number;
  showVisualizer: boolean;
  onToggleVisualizer: () => void;
  onOpenPriceModal: () => void;
  onOpenCompatibilityModal: () => void;
  onOpenWattageModal: () => void;
  onOpenFpsModal: () => void;
  onOpenShareModal: () => void;
  onOpenSettingsModal: () => void;
  onCloneBuild: () => void;
  onExportJson: () => void;
  onCopyLink: () => void;
  onCopyMarkdown: () => void;
  copiedNotification: string | null;
}

export const BuildCoresStageHeader: React.FC<BuildCoresStageHeaderProps> = ({
  buildName,
  onUpdateBuildName,
  totalPriceINR,
  compatibilityReport,
  estimatedWattage,
  showVisualizer,
  onToggleVisualizer,
  onOpenPriceModal,
  onOpenCompatibilityModal,
  onOpenWattageModal,
  onOpenFpsModal,
  onOpenShareModal,
  onOpenSettingsModal,
  onCloneBuild,
  onExportJson,
  onCopyLink,
  onCopyMarkdown,
  copiedNotification,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(buildName);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onUpdateBuildName(tempTitle.trim());
    } else {
      setTempTitle(buildName);
    }
    setIsEditingTitle(false);
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="p-3 sm:p-4 border-b border-charcoal-800 bg-charcoal-900/60 space-y-3 select-none">
      {/* Row 1: Title, Creator, Date, and Metric Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & Metadata */}
        <div>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') {
                      setTempTitle(buildName);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="px-2 py-0.5 bg-charcoal-800 border border-magenta-500 rounded text-base font-bold text-white outline-none"
                />
                <button
                  onClick={handleTitleSubmit}
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {buildName}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-charcoal-400 hover:text-white p-1 opacity-70 group-hover:opacity-100 transition-opacity"
                  title="Rename build"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Subtitle */}
          <div className="flex items-center gap-2 text-[11px] text-charcoal-400 mt-0.5">
            <span className="text-charcoal-300">👤 Anonymous Builder</span>
            <span>•</span>
            <span>📅 {todayFormatted}</span>
          </div>
        </div>

        {/* Metric Pill Badges (Exact BuildCores styling: Green Price, Blue Compatible, Yellow Wattage) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Price Pill (Green) */}
          <button
            onClick={onOpenPriceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/50 text-emerald-300 text-xs font-bold transition-all shadow-sm group"
            title="Click for full price breakdown"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <InrPrice amount={totalPriceINR} />
            <RotateCw className="w-3 h-3 text-emerald-400/70 group-hover:rotate-180 transition-transform duration-300" />
          </button>

          {/* Compatibility Pill (Blue / Amber) */}
          <button
            onClick={onOpenCompatibilityModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm group ${
              compatibilityReport.isCompatible
                ? 'bg-sky-950/60 border border-sky-500/50 hover:bg-sky-900/50 text-sky-300'
                : 'bg-amber-950/60 border border-amber-500/50 hover:bg-amber-900/50 text-amber-300'
            }`}
            title="Click to inspect compatibility rules"
          >
            {compatibilityReport.isCompatible ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              {compatibilityReport.isCompatible ? 'Compatible' : 'Warnings'}
            </span>
            <RotateCw className="w-3 h-3 text-charcoal-400 group-hover:rotate-180 transition-transform duration-300" />
          </button>

          {/* Wattage Pill (Yellow) */}
          <button
            onClick={onOpenWattageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/50 hover:bg-amber-900/50 text-amber-300 text-xs font-bold transition-all shadow-sm group"
            title="Click for power supply calculations"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{estimatedWattage}W</span>
            <RotateCw className="w-3 h-3 text-amber-400/70 group-hover:rotate-180 transition-transform duration-300" />
          </button>

          {/* Gaming Telemetry / 3DMark Pill (Orange) */}
          <button
            onClick={onOpenFpsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-950/60 border border-orange-500/50 hover:bg-orange-900/50 text-orange-300 text-xs font-bold transition-all shadow-sm group"
            title="Click for 1080p, 1440p, 4K gaming benchmarks"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Telemetry</span>
            <RotateCw className="w-3 h-3 text-orange-400/70 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Row 2: Secondary Toolbars (Share, Link, Image, Markdown, Reddit, Hide 2D, Clone, Settings) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-charcoal-800/60 text-xs">
        {/* Share Tools */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800/80 hover:bg-charcoal-700 text-charcoal-200 hover:text-white transition-colors"
          >
            <Share2 className="w-3 h-3 text-magenta-400" />
            <span>Share</span>
          </button>

          <button
            onClick={onCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800/80 hover:bg-charcoal-700 text-charcoal-200 hover:text-white transition-colors"
          >
            <LinkIcon className="w-3 h-3 text-charcoal-400" />
            <span>Link</span>
          </button>

          <button
            onClick={onCopyMarkdown}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800/80 hover:bg-charcoal-700 text-charcoal-200 hover:text-white transition-colors"
          >
            <FileText className="w-3 h-3 text-charcoal-400" />
            <span>Markdown</span>
          </button>

          <a
            href="https://reddit.com/r/IndianGaming"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800/80 hover:bg-[#FF4500]/20 text-charcoal-200 hover:text-[#FF4500] transition-colors"
          >
            <MessageSquare className="w-3 h-3 text-[#FF4500]" />
            <span>Reddit</span>
          </a>

          <button
            onClick={onExportJson}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-charcoal-800/80 hover:bg-charcoal-700 text-charcoal-200 hover:text-white transition-colors"
            title="Download JSON build specification"
          >
            <Download className="w-3 h-3 text-charcoal-400" />
            <span>JSON</span>
          </button>
        </div>

        {/* Right Stage Controls */}
        <div className="flex items-center gap-2">
          {/* Hide/Show 2D Visualizer */}
          <button
            onClick={onToggleVisualizer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-charcoal-800/80 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors"
          >
            {showVisualizer ? (
              <>
                <EyeOff className="w-3 h-3 text-charcoal-400" />
                <span>Hide 2D</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-magenta-400" />
                <span>Show 2D</span>
              </>
            )}
          </button>

          {/* Clone Build */}
          <button
            onClick={onCloneBuild}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-charcoal-800/80 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors"
          >
            <Copy className="w-3 h-3 text-charcoal-400" />
            <span>Clone Build</span>
          </button>

          {/* Build Settings */}
          <button
            onClick={onOpenSettingsModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-charcoal-800/80 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors"
          >
            <Settings className="w-3 h-3 text-charcoal-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Notification Toast if link or markdown copied */}
      {copiedNotification && (
        <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}
    </div>
  );
};

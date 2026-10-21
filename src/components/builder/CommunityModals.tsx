'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Sparkles, CheckCircle, ShieldCheck, Cpu, Layers, BookOpen, Crown, ExternalLink } from 'lucide-react';

export const UpdatesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Maker Core India — Release Changelog"
      description="What's new in our 2D hardware studio and compatibility engine."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-charcoal-300">
        <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">v1.2 — BuildCores Studio Layout</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-magenta-950 text-magenta-300 border border-magenta-700/60 font-semibold">
              Latest
            </span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-charcoal-300">
            <li>Identical 3-column desktop workspace (Left Nav, Center Stage, Right Parts Drawer).</li>
            <li>Setup Mode battlestation preview with Monitor, Desk, Keyboard & Mouse.</li>
            <li>Bottom floating tool dock: Fans animation, RGB switcher, Displays, Airflow Flow, and Render snapshot.</li>
            <li>Quick Search with <code className="bg-charcoal-800 px-1 py-0.5 rounded text-white font-mono">Ctrl+K</code> across all component categories.</li>
          </ul>
        </div>

        <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">v1.1 — 9-Layer 2D Rig Visualizer</span>
            <span className="text-[10px] text-charcoal-500">October 2026</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-charcoal-300">
            <li>Interactive SVG and 2D product illustrations for Chassis, Motherboard, Cooler, RAM, GPU, Storage, and PSU.</li>
            <li>Real physical clearance validation (GPU length vs Case clearance, Cooler height vs Cabinet max clearance).</li>
            <li>Clickable component hotspots with real-time slot synchronization.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export const GuidesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PC Building & Hardware Guides"
      description="Practical advice tailored for PC builders in the Indian climate."
      maxWidth="lg"
    >
      <div className="space-y-3.5 text-xs text-charcoal-300 max-h-[60vh] overflow-y-auto pr-1">
        <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1.5">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <span className="text-magenta-400">1.</span> Optimal Airflow for Indian Summers
          </h4>
          <p className="leading-relaxed text-charcoal-400">
            With ambient temperatures frequently exceeding 35°C in many Indian cities, positive air pressure (more intake CFM than exhaust CFM) is vital to keep dust filters working and prevent hot spots. Use at least 2 intake fans and 1 exhaust.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1.5">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <span className="text-magenta-400">2.</span> PSU Tier List & Power Outages
          </h4>
          <p className="leading-relaxed text-charcoal-400">
            Never skimp on the power supply. A Tier A/B 80+ Gold unit with complete OVP/UVP/OCP protections paired with a pure sine-wave UPS is strongly recommended given local grid fluctuations.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1.5">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <span className="text-magenta-400">3.</span> DDR5 Memory Sweet Spot
          </h4>
          <p className="leading-relaxed text-charcoal-400">
            For AMD AM5 (Ryzen 7000/9000), 6000MHz CL30-CL36 represents the optimal 1:1 memory controller divider. For Intel 13th/14th Gen, 6000-6400MHz offers rock-solid XMP stability.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export const ProModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Maker Core Studio PRO"
      description="Advanced tools for hardware enthusiasts, custom modders, and system integrators."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-charcoal-300">
        <div className="p-4 rounded-xl bg-gradient-to-br from-magenta-950/60 to-charcoal-900 border border-magenta-700/60 space-y-3">
          <div className="flex items-center gap-2 text-magenta-300 font-bold text-sm">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Community Free Preview Enabled!</span>
          </div>
          <p className="text-charcoal-300 leading-relaxed">
            All advanced 2D visualizer features, airflow simulation, desk battlestation setup mode, RGB color studio, and high-resolution rendering are currently unlocked for all Indian users for free.
          </p>
          <div className="pt-2 border-t border-magenta-800/40 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-white">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full 9-Layer Rig Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Airflow Particle Simulator</span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Desk Battlestation Mode</span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant High-Res PNG Export</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Enjoy Studio Pro
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const PartGalleryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="2D Part Gallery & Blueprint Specs"
      description="Explore component physical dimensions, silhouettes, and socket layouts."
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs text-charcoal-300 max-h-[60vh] overflow-y-auto pr-1">
        <p className="text-charcoal-400">
          Our 2D visualizer uses millimeter-calibrated bounding boxes and SVG blueprints to ensure component clearances match real PC building reality.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-center space-y-2">
            <div className="w-full h-24 bg-charcoal-950 rounded-lg flex items-center justify-center p-2">
              <Cpu className="w-12 h-12 text-magenta-400" />
            </div>
            <div className="font-bold text-white">AM5 & LGA1700 Sockets</div>
            <div className="text-[10px] text-charcoal-500">40x40mm pin array</div>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-center space-y-2">
            <div className="w-full h-24 bg-charcoal-950 rounded-lg flex items-center justify-center p-2">
              <Layers className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="font-bold text-white">ATX / Micro-ATX Motherboards</div>
            <div className="text-[10px] text-charcoal-500">305x244mm standard</div>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-center space-y-2">
            <div className="w-full h-24 bg-charcoal-950 rounded-lg flex items-center justify-center p-2">
              <Sparkles className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="font-bold text-white">Triple-Fan GPUs</div>
            <div className="text-[10px] text-charcoal-500">280mm - 340mm clearance</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

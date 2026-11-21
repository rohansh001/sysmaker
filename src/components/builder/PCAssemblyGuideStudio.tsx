'use client';

import React, { useState } from 'react';
import { BuildComponents, ComponentCategory } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Power,
  Tv,
} from 'lucide-react';
import { rigAudio } from '@/lib/audio/rigAudio';

interface PCAssemblyGuideStudioProps {
  components: BuildComponents;
  onSelectCategory: (cat: ComponentCategory) => void;
}

interface AssemblyStep {
  step: number;
  title: string;
  categoryTag: string;
  description: string;
  checklist: string[];
  indianProTip: string;
}

const ASSEMBLY_STEPS: AssemblyStep[] = [
  {
    step: 1,
    title: 'Motherboard Preparation & CPU Seating',
    categoryTag: 'CPU & Motherboard',
    description:
      'Unbox the motherboard on top of its cardboard box (never on anti-static bag). Lift the socket load lever, align the gold triangle on the CPU with the socket notch, gently drop in place without pressure, and clamp the lever down.',
    checklist: [
      'Gold alignment triangle aligned correctly',
      'Socket load lever clicked and secured under clip',
      'Dual-Channel RAM seated firmly into Slots 2 & 4 (A2 & B2) until latches snap',
      'M.2 NVMe SSD inserted at 30° angle, thermal pad film peeled, screw secured',
    ],
    indianProTip:
      'Always install CPU, RAM, and NVMe on the motherboard box before placing inside the cabinet — saves 40% time and prevents scratching standoffs.',
  },
  {
    step: 2,
    title: 'Cooler Mounting & Thermal Interface',
    categoryTag: 'Cooling',
    description:
      'Apply a pea-sized dot or thin X-pattern of high-grade thermal compound onto the center of the CPU IHS. If installing an AIO liquid cooler, remove the transparent plastic peel from the copper baseplate before tightening diagonal bracket thumb-screws.',
    checklist: [
      'CRITICAL: Plastic warning sticker peeled off cooler copper base',
      'Thermal paste applied evenly across heatspreader',
      'Thumbscrews tightened in cross-diagonal pattern to ensure equal pressure',
      '4-pin PWM CPU_FAN header connected to motherboard',
    ],
    indianProTip:
      'Due to high ambient Indian summer temperatures (35°C–45°C), never reuse dried thermal paste. High viscosity paste (Arctic MX-4/Thermal Grizzly) lasts 3+ years in Indian humidity.',
  },
  {
    step: 3,
    title: 'Chassis Standoffs & Motherboard Seating',
    categoryTag: 'Chassis & Standoffs',
    description:
      'Check that your cabinet has the exact number of brass standoffs pre-installed matching your motherboard form factor (ATX: 9 standoffs, Micro-ATX: 6 or 8 standoffs). Snap the rear I/O shield into place, slide the motherboard in, and fasten the center anchor screw first.',
    checklist: [
      'No extra standoffs touching bare motherboard PCB traces (prevents short-circuits)',
      'Rear I/O ports cleanly aligned through I/O shield',
      'All motherboard mounting screws fastened snug (do not over-torque)',
    ],
    indianProTip:
      'An extra misplaced brass standoff underneath the motherboard is the #1 cause of dead motherboards on first boot in India. Count standoffs twice before mounting!',
  },
  {
    step: 4,
    title: 'Power Supply & Clean Sleeved Cable Routing',
    categoryTag: 'PSU & Cables',
    description:
      'Mount the PSU into the bottom shroud with the intake fan facing downward towards the dust filter. Route the thick 24-Pin ATX main connector through the right grommet and 8-Pin CPU EPS cable through the top-left cutout before mounting top radiator fans.',
    checklist: [
      'PSU fan facing down toward bottom mesh dust filter',
      '24-Pin ATX and 8-Pin EPS cables pushed firmly until latch clicks',
      'Individual 12VHPWR / PCIe cables routed with acrylic cable combs',
      'Front panel Power SW, Reset SW, and Power LED connected to front header pins',
    ],
    indianProTip:
      'Always use a quality 1100VA+ pure sine wave UPS/Inverter in India. Frequent load shedding and voltage fluctuations can instantly damage sensitive 12V rails.',
  },
  {
    step: 5,
    title: 'Graphics Card (GPU) & Anti-Sag Support',
    categoryTag: 'PCIe Graphics',
    description:
      'Unscrew the 2nd and 3rd PCIe slot expansion covers from the back of the case. Open the PCIe x16 slot retention latch, line up the gold contacts, and push firmly until the heavy mechanical latch snaps shut. Tighten rear bracket thumbscrews and install the anti-sag bracket.',
    checklist: [
      'PCIe retention lock clicked into closed position',
      'Dedicated individual PCIe power cables connected (avoid daisy-chaining pigtails on 250W+ GPUs)',
      'Anti-sag bracket adjusted underneath heavy triple-fan heatsinks',
    ],
    indianProTip:
      'Triple-fan modern GPUs weigh up to 2.2 kg! Always install the anti-sag support bracket to prevent cracking the motherboard PCIe slot during shipping or earthquakes.',
  },
  {
    step: 6,
    title: 'Airflow Optimization & Positive Pressure Tuning',
    categoryTag: 'Airflow & Dust',
    description:
      'Configure front intake fans to deliver slightly higher cubic feet per minute (CFM) than rear exhaust fans. Positive air pressure forces dust out of unsealed case crevices rather than sucking dust in through cracks.',
    checklist: [
      'Front fans oriented as intake (air blowing into case)',
      'Rear and top fans oriented as exhaust (air expelling out)',
      'Magnetic dust filters seated over front and bottom intakes',
    ],
    indianProTip:
      'Indian air has high dust and particulate matter (PM2.5/PM10). Maintaining POSITIVE AIR PRESSURE and cleaning magnetic filters every 60 days keeps your internal hardware dust-free!',
  },
  {
    step: 7,
    title: 'First Boot POST Diagnostic Simulator',
    categoryTag: 'Diagnostics & Boot',
    description:
      'Connect power cord, flip the PSU rocker switch to "I", and press the chassis power button. Watch the 4-phase EZ Debug LEDs test CPU -> DRAM -> VGA -> BOOT.',
    checklist: [
      'Monitor HDMI/DisplayPort plugged into GPU (NOT motherboard I/O)',
      'PSU rocker switch set to ON (I)',
      'Q-Code display reaches "AA" or Green BOOT LED lights up',
      'Press DEL or F2 to enter UEFI BIOS',
    ],
    indianProTip:
      'Rookie mistake: Never plug your HDMI/DP cable into the motherboard rear I/O when a dedicated GPU is installed, or your monitor will show "No Signal"!',
  },
];

export const PCAssemblyGuideStudio: React.FC<PCAssemblyGuideStudioProps> = ({
  components,
  onSelectCategory,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [postState, setPostState] = useState<'idle' | 'running' | 'success'>('idle');
  const [postLedStage, setPostLedStage] = useState<'NONE' | 'CPU' | 'DRAM' | 'VGA' | 'BOOT'>('NONE');
  const [qCode, setQCode] = useState<string>('--');

  const { cpu, motherboard, ram, gpu, storage, psu, cabinet, cooler } = components;
  const currentStep = ASSEMBLY_STEPS[currentStepIndex];

  // Component Checklist status
  const hardwarePresence = [
    { cat: 'cpu' as ComponentCategory, label: 'Processor (CPU)', item: cpu },
    { cat: 'motherboard' as ComponentCategory, label: 'Motherboard', item: motherboard },
    { cat: 'ram' as ComponentCategory, label: 'Memory (RAM)', item: ram },
    { cat: 'cooler' as ComponentCategory, label: 'CPU Cooler', item: cooler },
    { cat: 'storage' as ComponentCategory, label: 'NVMe Storage', item: storage },
    { cat: 'gpu' as ComponentCategory, label: 'Graphics Card (GPU)', item: gpu },
    { cat: 'psu' as ComponentCategory, label: 'Power Supply (PSU)', item: psu },
    { cat: 'cabinet' as ComponentCategory, label: 'Chassis / Case', item: cabinet },
  ];

  const totalInstalled = hardwarePresence.filter((p) => Boolean(p.item)).length;

  // Run Virtual POST Diagnostic Boot Test
  const handleRunPostDiagnostic = () => {
    rigAudio.playPowerSwitch(true);
    setPostState('running');
    setPostLedStage('CPU');
    setQCode('15');

    setTimeout(() => {
      setPostLedStage('DRAM');
      setQCode('32');
      rigAudio.playLatchClick();
    }, 700);

    setTimeout(() => {
      setPostLedStage('VGA');
      setQCode('55');
    }, 1400);

    setTimeout(() => {
      setPostLedStage('BOOT');
      setQCode('99');
      rigAudio.playLatchClick();
    }, 2100);

    setTimeout(() => {
      setPostState('success');
      setQCode('AA');
      rigAudio.playThermalChirp();
    }, 2800);
  };

  const handleResetPost = () => {
    rigAudio.playPowerSwitch(false);
    setPostState('idle');
    setPostLedStage('NONE');
    setQCode('--');
  };

  const nextStep = () => {
    if (currentStepIndex < ASSEMBLY_STEPS.length - 1) {
      rigAudio.playLatchClick();
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      rigAudio.playLatchClick();
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="w-full aspect-[16/10] sm:aspect-[16/9] max-h-[620px] bg-gradient-to-b from-[#090c15] via-[#0f1422] to-[#07090f] rounded-2xl overflow-y-auto overflow-x-hidden border border-charcoal-800 shadow-2xl p-4 sm:p-6 text-white select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-magenta-950/70 border border-magenta-700/60 flex items-center justify-center text-magenta-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-wide flex items-center gap-2">
              PC Assembly Guide & POST Diagnostic Studio
              <Badge variant="magenta" size="sm" className="text-[10px]">
                Interactive Workflow
              </Badge>
            </h3>
            <p className="text-xs text-charcoal-400">
              Physical assembly stages, Indian hardware optimization tips, and virtual motherboard boot testing.
            </p>
          </div>
        </div>

        {/* Readiness Count */}
        <div className="flex items-center gap-2 bg-charcoal-900 border border-charcoal-800 px-3 py-1 rounded-xl">
          <span className="text-xs text-charcoal-300">Parts Ready:</span>
          <span className="font-mono font-bold text-white text-xs">
            {totalInstalled}/8
          </span>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Main Studio Grid: Left Stepper Guide (7 cols), Right Diagnostic POST (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Left Column: Interactive Step Walkthrough (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Step Stepper Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ASSEMBLY_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => {
                  rigAudio.playLatchClick();
                  setCurrentStepIndex(idx);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  currentStepIndex === idx
                    ? 'bg-magenta-600 text-white shadow-md'
                    : 'bg-charcoal-900/80 text-charcoal-400 hover:text-white border border-charcoal-800'
                }`}
              >
                Step {s.step}
              </button>
            ))}
          </div>

          {/* Active Step Content Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-900/80 border border-charcoal-700/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-magenta-400 uppercase tracking-wider">
                Stage {currentStep.step} of 7: {currentStep.categoryTag}
              </span>
              <Badge variant="outline" size="sm" className="text-[10px] text-charcoal-300">
                Verified Indian Guide
              </Badge>
            </div>

            <h4 className="text-base font-bold text-white">
              {currentStep.title}
            </h4>
            <p className="text-xs text-charcoal-300 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Checklist */}
            <div className="pt-2 border-t border-charcoal-800 space-y-1.5">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Critical Physical Inspection Points:
              </span>
              {currentStep.checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-charcoal-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Indian Climate & Electrical Pro Tip */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block font-bold text-[11px] uppercase tracking-wide">
                  Indian Environment & Climate Tip:
                </strong>
                <p className="text-[11px] text-amber-200/90 mt-0.5 leading-normal">
                  {currentStep.indianProTip}
                </p>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous Step
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={nextStep}
                disabled={currentStepIndex === ASSEMBLY_STEPS.length - 1}
              >
                Next Step <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Virtual POST Diagnostic Boot Test (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-900/90 border border-charcoal-700/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Power className="w-3.5 h-3.5 text-magenta-400" />
                Motherboard POST Boot Diagnostic
              </span>
              <span className="text-[10px] font-mono font-bold text-charcoal-400">
                Q-CODE: <strong className="text-emerald-400">{qCode}</strong>
              </span>
            </div>

            {/* EZ Debug LED Sequence Simulation */}
            <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2.5">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                EZ Debug LED Check Sequence:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {/* CPU LED */}
                <div className={`p-2 rounded-lg border text-center transition-all ${
                  postLedStage === 'CPU'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-sm'
                    : 'bg-charcoal-900/60 border-charcoal-800 text-charcoal-500'
                }`}>
                  <span className="block text-[9px] font-bold">CPU</span>
                  <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${postLedStage === 'CPU' ? 'bg-rose-500 animate-ping' : 'bg-charcoal-700'}`} />
                </div>

                {/* DRAM LED */}
                <div className={`p-2 rounded-lg border text-center transition-all ${
                  postLedStage === 'DRAM'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-charcoal-900/60 border-charcoal-800 text-charcoal-500'
                }`}>
                  <span className="block text-[9px] font-bold">DRAM</span>
                  <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${postLedStage === 'DRAM' ? 'bg-amber-500 animate-ping' : 'bg-charcoal-700'}`} />
                </div>

                {/* VGA LED */}
                <div className={`p-2 rounded-lg border text-center transition-all ${
                  postLedStage === 'VGA'
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-charcoal-900/60 border-charcoal-800 text-charcoal-500'
                }`}>
                  <span className="block text-[9px] font-bold">VGA</span>
                  <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${postLedStage === 'VGA' ? 'bg-blue-500 animate-ping' : 'bg-charcoal-700'}`} />
                </div>

                {/* BOOT LED */}
                <div className={`p-2 rounded-lg border text-center transition-all ${
                  postLedStage === 'BOOT' || postState === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-charcoal-900/60 border-charcoal-800 text-charcoal-500'
                }`}>
                  <span className="block text-[9px] font-bold">BOOT</span>
                  <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${postLedStage === 'BOOT' || postState === 'success' ? 'bg-emerald-400' : 'bg-charcoal-700'}`} />
                </div>
              </div>
            </div>

            {/* Virtual Monitor Screen Output */}
            <div className="p-3 rounded-xl bg-black border border-charcoal-800 font-mono text-[11px] space-y-1 min-h-[90px]">
              {postState === 'idle' && (
                <div className="text-charcoal-500 py-3 text-center">
                  System Standby (0W). Click &quot;Simulate First Boot POST&quot; to test.
                </div>
              )}
              {postState === 'running' && (
                <div className="text-cyan-400 space-y-0.5">
                  <p>&gt; Initializing AMI UEFI BIOS v2.4...</p>
                  <p>&gt; Checking CPU microcode &amp; DRAM channels...</p>
                  <p>&gt; Polling PCIe 5.0 slot communication...</p>
                </div>
              )}
              {postState === 'success' && (
                <div className="text-emerald-400 space-y-0.5">
                  <p>&gt; POST SUCCESSFUL · Code AA (Normal Boot)</p>
                  <p>&gt; CPU: {cpu ? cpu.name.slice(0, 22) : 'Detected OK'}</p>
                  <p>&gt; RAM: {ram ? `${ram.name.slice(0, 18)} OK` : '16GB Dual-Channel OK'}</p>
                  <p>&gt; Press DEL to Enter UEFI Setup Menu.</p>
                </div>
              )}
            </div>

            {/* Trigger Button */}
            <div className="flex items-center gap-2 pt-1">
              {postState !== 'success' ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1.5"
                  onClick={handleRunPostDiagnostic}
                  disabled={postState === 'running'}
                  icon={<Play className="w-3.5 h-3.5" />}
                >
                  {postState === 'running' ? 'Testing Hardware...' : 'Simulate First Boot POST'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1.5 text-emerald-400 border-emerald-600/60"
                  onClick={handleResetPost}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset Power &amp; Test Again
                </Button>
              )}
            </div>
          </div>

          {/* Quick Hardware Checklist Pills */}
          <div className="p-3 rounded-xl bg-charcoal-900/60 border border-charcoal-800 space-y-2">
            <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
              Installed Rig Parts Checklist:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {hardwarePresence.map((p) => (
                <button
                  key={p.cat}
                  onClick={() => onSelectCategory(p.cat)}
                  className={`p-1.5 rounded-lg border text-left text-[10.5px] truncate flex items-center justify-between transition-colors ${
                    p.item
                      ? 'bg-charcoal-800/80 border-charcoal-700 text-white'
                      : 'bg-charcoal-950/40 border-dashed border-charcoal-800 text-charcoal-500 hover:text-magenta-400'
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  {p.item ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                  ) : (
                    <span className="text-[10px] text-magenta-400 font-bold shrink-0 ml-1">+</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

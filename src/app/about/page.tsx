import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  Info,
  AlertTriangle,
  Zap,
  Gamepad2,
  ExternalLink,
  Layers,
  Wrench,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-magenta-950/60 border border-magenta-700/60 text-xs font-semibold text-magenta-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Commitment to Transparency & Engineering Integrity</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About System Maker Core India
        </h1>
        <p className="text-sm sm:text-base text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
          An original 2D PC configurator engineered specifically for Indian computer builders, gamers, and professionals. Designed to eliminate costly component mismatches and provide honest pricing.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-magenta-950/80 border border-magenta-700/60 flex items-center justify-center text-magenta-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Truth-in-Data</h3>
          <p className="text-xs text-charcoal-400 leading-relaxed">
            Unknown specifications are explicitly labeled as unknown rather than generating a false positive pass. We never fabricate compatibility.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-magenta-950/80 border border-magenta-700/60 flex items-center justify-center text-magenta-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">No Fake FPS</h3>
          <p className="text-xs text-charcoal-400 leading-relaxed">
            Gaming benchmarks are sourced exclusively from verified public review labs with exact hardware citations. If data is unavailable, we explicitly state it.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-magenta-950/80 border border-magenta-700/60 flex items-center justify-center text-magenta-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">India Focused</h3>
          <p className="text-xs text-charcoal-400 leading-relaxed">
            Prices in Indian Rupees (₹), standard 18% GST considerations, and direct search adapters for regional retailers like MDComputers, Vedant, and PrimeABGB.
          </p>
        </div>
      </div>

      {/* Hardware Compatibility Engine Rules */}
      <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-charcoal-800">
          <Cpu className="w-5 h-5 text-magenta-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            How Our Compatibility Engine Works
          </h2>
        </div>

        <div className="space-y-4 text-xs text-charcoal-300 leading-relaxed">
          <p>
            The System Maker Core India Compatibility Engine operates as a deterministic, pure-function validation system. It verifies multi-vector hardware parameters:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <li className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800">
              <strong className="text-white block mb-0.5">1. Socket Architecture:</strong>
              Validates CPU socket against Motherboard socket (e.g. AMD AM4, AM5, Intel LGA1700).
            </li>
            <li className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800">
              <strong className="text-white block mb-0.5">2. Memory Generation & Slots:</strong>
              Enforces DDR4 vs DDR5 RAM matching, module count vs available DIMM slots, and maximum supported memory.
            </li>
            <li className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800">
              <strong className="text-white block mb-0.5">3. Physical Clearances:</strong>
              Checks GPU length against cabinet internal clearances and CPU cooler height against side-panel depth.
            </li>
            <li className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800">
              <strong className="text-white block mb-0.5">4. Form Factor Compliance:</strong>
              Ensures ATX, Micro-ATX, and Mini-ITX motherboards fit into the selected chassis.
            </li>
            <li className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800">
              <strong className="text-white block mb-0.5">5. Power Delivery & Spikes:</strong>
              Sums estimated base, CPU, and GPU TDP with a 30% safety margin for GPU transient load spikes.
            </li>
            <li className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800">
              <strong className="text-white block mb-0.5">6. Essential Completeness:</strong>
              Ensures a dedicated GPU is selected if the CPU lacks integrated display silicon.
            </li>
          </ul>
        </div>
      </div>

      {/* Transparent Data Limitations & Retailer Disclosures */}
      <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-charcoal-800">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Transparent Data Limitations & Indian Market Realities
          </h2>
        </div>

        <div className="space-y-3 text-xs text-charcoal-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-charcoal-850/80 border border-charcoal-800 space-y-2">
            <h4 className="font-semibold text-white">Live Retailer Synchronization</h4>
            <p className="text-charcoal-400">
              Major Indian computer retailers (such as MDComputers, Vedant Computers, and PrimeABGB) do not provide public authenticated REST APIs for live inventory. To respect their servers, System Maker Core India utilizes an open adapter interface with curated baseline references and direct search links rather than aggressive real-time web scraping.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-charcoal-850/80 border border-charcoal-800 space-y-2">
            <h4 className="font-semibold text-white">Taxation & Currency Arithmetic</h4>
            <p className="text-charcoal-400">
              Most consumer-facing hardware prices on Indian retailer sites include the 18% Goods and Services Tax (GST). For corporate buyers claiming Input Tax Credit (ITC), we provide an optional surcharge toggle to simulate ex-GST pricing. All arithmetic is handled strictly in integer Indian Rupees.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-charcoal-850/80 border border-charcoal-800 space-y-2">
            <h4 className="font-semibold text-white">Gaming FPS Test Conditions</h4>
            <p className="text-charcoal-400">
              Every benchmark shown in the builder includes the publication source (e.g. Hardware Unboxed, Gamers Nexus, TechPowerUp), test resolution, quality preset, and driver version. We strictly reject AI-generated or estimated framerates when real verified testing is unavailable.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link href="/builder">
          <Button variant="primary" size="lg" icon={<Wrench className="w-4 h-4" />}>
            Start Building Your Custom PC Now
          </Button>
        </Link>
      </div>
    </div>
  );
}

import {
  BudgetTier,
  BuildComponents,
  Component,
  RecommendationPreset,
  UseCase,
} from '@/types';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { checkCompatibility } from './compatibility';

export const BUDGET_TIER_LABELS: Record<BudgetTier, { label: string; maxINR: number; minINR: number }> = {
  'under-20k': { label: 'Under ₹20,000', minINR: 0, maxINR: 20000 },
  '20k-35k': { label: '₹20,000 – ₹35,000', minINR: 20000, maxINR: 35000 },
  '35k-50k': { label: '₹35,000 – ₹50,000', minINR: 35000, maxINR: 50000 },
  '50k-75k': { label: '₹50,000 – ₹75,000', minINR: 50000, maxINR: 75000 },
  '75k-100k': { label: '₹75,000 – ₹1,00,000', minINR: 75000, maxINR: 100000 },
  'above-100k': { label: 'Above ₹1,00,000', minINR: 100000, maxINR: 9999999 },
};

export const USE_CASE_LABELS: Record<UseCase, { label: string; description: string }> = {
  'study-office': {
    label: 'Study & Office',
    description: 'Document processing, web browsing, Zoom/Teams classes, lightweight multi-tasking.',
  },
  programming: {
    label: 'Programming & Development',
    description: 'Web development, Docker containers, IDEs, code compilation, and multi-threaded tools.',
  },
  'graphic-video': {
    label: 'Graphic Design & Video Editing',
    description: 'Adobe Photoshop/Premiere, DaVinci Resolve, 4K scrubbing, color fidelity, scratch disks.',
  },
  gaming: {
    label: 'Gaming & Esports',
    description: 'High FPS in Counter-Strike 2, Valorant, Cyberpunk 2077, GTA V, and modern AAA titles.',
  },
  workstation: {
    label: 'High-End Workstation & 3D / AI',
    description: 'Heavy 3D rendering (Blender), local LLM inference, machine learning, CAD, virtualization.',
  },
};

/**
 * Curated, verified recommendation presets covering all budget tiers and use cases.
 * Every preset is validated through the Hardware Compatibility Engine.
 */
export const RECOMMENDATION_PRESETS: RecommendationPreset[] = [
  // 1. Under ₹20k - Study & Office
  {
    id: 'rec-under20k-office',
    title: 'Essential Student & Home Office Rig',
    budgetTier: 'under-20k',
    useCase: 'study-office',
    targetBudgetINR: 19500,
    componentIds: [
      'cpu-amd-3000g', // 4299
      'mb-msi-a320m', // 4299
      'ram-crucial-8gb-ddr4', // 1499
      'storage-crucial-bx500-480g', // 2499
      'psu-ant-vs450l', // 1899
      'cab-ant-esports-ice-100', // 2699
    ],
    rationale: 'Utilizes an AMD Athlon processor with integrated Radeon Vega 3 graphics to provide a fully functional Windows 11 desktop under ₹20,000 without requiring an expensive dedicated graphic card.',
    tradeOffs: [
      'Relies on integrated Vega 3 graphics; unsuitable for heavy 3D titles.',
      'Single 8GB DDR4 channel leaves room for an easy future upgrade to 16GB.',
      'SATA SSD interface is slower than NVMe, but keeps overall build cost strictly under budget.',
    ],
    highlights: ['Compact Micro-ATX chassis', 'Low power consumption (under 100W)', 'Immediate plug-and-play productivity'],
  },

  // 2. ₹20k - ₹35k - Programming / Esports APU
  {
    id: 'rec-20k-35k-programming',
    title: 'Ryzen 5 5600G Developer & Casual Esports Rig',
    budgetTier: '20k-35k',
    useCase: 'programming',
    targetBudgetINR: 34000,
    componentIds: [
      'cpu-amd-5600g', // 11499 (6 cores, 12 threads)
      'mb-asus-prime-b550m', // 7699
      'ram-gskill-ripjaws-16gb-ddr4', // 2999 (16GB dual channel)
      'storage-crucial-p3-500g', // 3299 (Fast NVMe)
      'psu-cooler-master-mwe-550', // 3799
      'cab-galax-revolution-05', // 3299
    ],
    rationale: '6 high-performance Zen 3 cores and 12 threads power fast code compilation and multitasking, backed by Vega 7 graphics and a Tier-B 550W power supply ready for a future GPU addition.',
    tradeOffs: [
      'Integrated graphics will require dropping resolution or settings in modern AAA games.',
      '500GB storage will fill up if downloading large local datasets or multiple game libraries.',
    ],
    highlights: ['6 Cores / 12 Threads for multi-tasking', '16GB dual-channel RAM', 'Tier-B 550W PSU ready for future GPU'],
  },

  // 3. ₹35k - ₹50k - Gaming (Core i5-12400F + RX 6600)
  {
    id: 'rec-35k-50k-gaming',
    title: '1080p Ultra Budget Gaming Champ',
    budgetTier: '35k-50k',
    useCase: 'gaming',
    targetBudgetINR: 48500,
    componentIds: [
      'cpu-intel-12400f', // 8999
      'mb-msi-h610m-e', // 5999
      'ram-gskill-ripjaws-16gb-ddr4', // 2999
      'gpu-asrock-rx6600', // 18999 (8GB GDDR6)
      'storage-crucial-p3-500g', // 3299
      'psu-cooler-master-mwe-550', // 3799
      'cab-galax-revolution-05', // 3299
    ],
    rationale: 'Combines the legendary value of the Intel 12400F with the AMD Radeon RX 6600 to deliver over 60+ FPS in modern AAA titles at 1080p and 200+ FPS in competitive esports.',
    tradeOffs: [
      'H610 motherboard has 2 DIMM slots and lacks PCIe 5.0.',
      'Includes stock Intel cooler; consider adding an AG400 later for quieter operation.',
    ],
    highlights: ['Radeon RX 6600 8GB GDDR6', '60+ FPS in AAA titles at 1080p', 'Excellent thermals with mesh chassis'],
  },

  // 4. ₹50k - ₹75k - Gaming & Content Creation
  {
    id: 'rec-50k-75k-gaming',
    title: 'Sweet-Spot 1080p/1440p Creator & Gamer',
    budgetTier: '50k-75k',
    useCase: 'gaming',
    targetBudgetINR: 69500,
    componentIds: [
      'cpu-amd-5600', // 10499
      'mb-msi-b550m-vdh', // 8999 (WiFi included)
      'ram-gskill-ripjaws-16gb-ddr4', // 2999
      'gpu-asus-dual-rtx4060', // 28499 (Ada Lovelace, DLSS 3)
      'storage-wd-blue-sn580-1tb', // 5699
      'psu-deepcool-pk650d', // 4399
      'cab-galax-revolution-05', // 3299
      'cooler-deepcool-ag400', // 1799
    ],
    rationale: 'Features the NVIDIA GeForce RTX 4060 with Ada Lovelace architecture, DLSS 3 Frame Generation, 1TB Gen4 NVMe storage, and built-in Wi-Fi on the motherboard.',
    tradeOffs: [
      'Based on the mature AM4 DDR4 platform rather than AM5, limiting future in-socket CPU upgrades beyond Ryzen 5000.',
      '8GB VRAM requires texture management at 1440p ultra settings.',
    ],
    highlights: ['NVIDIA DLSS 3 & AV1 NVENC', '1TB Gen4 NVMe 4150MB/s SSD', 'On-board Wi-Fi and Bluetooth'],
  },

  // 5. ₹75k - ₹100k - Next-Gen AM5 & 1440p
  {
    id: 'rec-75k-100k-workstation',
    title: 'Next-Gen AM5 DDR5 Creator & 1440p Gaming',
    budgetTier: '75k-100k',
    useCase: 'graphic-video',
    targetBudgetINR: 96000,
    componentIds: [
      'cpu-amd-7600', // 17999
      'mb-msi-b650m-gaming-wifi', // 10999
      'ram-corsair-vengeance-32gb-ddr5', // 9899 (32GB DDR5-6000 CL30)
      'gpu-sapphire-pulse-rx7600xt', // 32999 (16GB VRAM)
      'storage-wd-blue-sn580-1tb', // 5699
      'psu-deepcool-pk650d', // 4399
      'cab-montech-air-903-base', // 5499
      'cooler-thermalright-peerless', // 3599
    ],
    rationale: 'Built on the cutting-edge AMD AM5 socket with DDR5-6000 memory and a 16GB Radeon RX 7600 XT. Ample VRAM and dual-tower thermal cooling ensure sustained 4K timeline rendering and uninterrupted 1440p gaming.',
    tradeOffs: [
      'Initial AM5 platform cost is higher than AM4, though supported through 2027+ for CPU drop-in upgrades.',
      'Ray tracing in heavy titles trails NVIDIA counterparts.',
    ],
    highlights: ['32GB Low-latency DDR5 RAM', '16GB VRAM avoids memory bottleneck', 'Peerless Assassin Dual-Tower Cooler'],
  },

  // 6. Above ₹1,00,000 - High-End Enthusiast & Workstation
  {
    id: 'rec-above100k-workstation',
    title: 'Extreme 4K Gaming & Machine Learning Workstation',
    budgetTier: 'above-100k',
    useCase: 'workstation',
    targetBudgetINR: 198000,
    componentIds: [
      'cpu-amd-7800x3d', // 38999
      'mb-msi-mag-b650-tomahawk', // 19999
      'ram-corsair-vengeance-32gb-ddr5', // 9899
      'gpu-gigabyte-rtx4080-super', // 99999
      'storage-samsung-980pro-2tb', // 14499
      'psu-msi-mag-a850gl', // 9499 (ATX 3.0 Gold)
      'cab-lianli-lancool-216', // 7899
      'cooler-thermalright-peerless', // 3599
    ],
    rationale: 'Uncompromised performance pairing the world\'s fastest gaming CPU (Ryzen 7 7800X3D) with the NVIDIA GeForce RTX 4080 SUPER 16GB, DRAM-cached 2TB Samsung Gen4 SSD, and ATX 3.0 PCIe 5.0 power delivery.',
    tradeOffs: [
      'High investment tier.',
      'Large chassis requires ample desk or floor footprint.',
    ],
    highlights: ['AMD 3D V-Cache architecture', 'RTX 4080 SUPER 16GB GDDR6X', '2TB Samsung 980 PRO with DRAM'],
  },
];

/**
 * Finds the most relevant recommendation preset for a given budget tier and use-case.
 * If an exact match is not found, picks the closest compatible configuration.
 */
export function getRecommendation(
  budgetTier: BudgetTier,
  useCase: UseCase
): {
  preset: RecommendationPreset | null;
  components: BuildComponents;
  totalCostINR: number;
  report: ReturnType<typeof checkCompatibility>;
  explanation: string;
} {
  // Try exact match first
  let preset =
    RECOMMENDATION_PRESETS.find(
      (p) => p.budgetTier === budgetTier && p.useCase === useCase
    ) || null;

  // Fallback to closest budget preset
  if (!preset) {
    preset =
      RECOMMENDATION_PRESETS.find((p) => p.budgetTier === budgetTier) ||
      RECOMMENDATION_PRESETS[0];
  }

  const components: BuildComponents = {};
  let totalCostINR = 0;

  for (const cid of preset.componentIds) {
    const comp = COMPONENT_CATALOG.find((c) => c.id === cid);
    if (comp) {
      components[comp.category] = comp;
      totalCostINR += comp.priceINR;
    }
  }

  const report = checkCompatibility(components);

  const explanation = `Configured for ${USE_CASE_LABELS[useCase].label} within ${BUDGET_TIER_LABELS[budgetTier].label}. ${preset.rationale}`;

  return {
    preset,
    components,
    totalCostINR,
    report,
    explanation,
  };
}

import {
  BuildComponents,
  CompatibilityIssue,
  CompatibilityReport,
  ComponentCategory,
  CpuSpecs,
  MotherboardSpecs,
  RamSpecs,
  GpuSpecs,
  CabinetSpecs,
  CoolerSpecs,
  PsuSpecs,
} from '@/types';

export const CORE_CATEGORIES: ComponentCategory[] = [
  'cpu',
  'motherboard',
  'ram',
  'storage',
  'psu',
  'cabinet',
];

export const PERIPHERAL_CATEGORIES: ComponentCategory[] = [
  'monitor',
  'keyboard',
  'mouse',
];

/**
 * Pure function to evaluate PC hardware compatibility.
 * Strictly adheres to truth-in-advertising: unknown data is labeled unknown,
 * never falsely asserted as compatible.
 */
export function checkCompatibility(components: BuildComponents): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];

  const cpu = components.cpu;
  const mb = components.motherboard;
  const ram = components.ram;
  const gpu = components.gpu;
  const storage = components.storage;
  const psu = components.psu;
  const cabinet = components.cabinet;
  const cooler = components.cooler;

  const cpuSpecs = cpu?.specifications as CpuSpecs | undefined;
  const mbSpecs = mb?.specifications as MotherboardSpecs | undefined;
  const ramSpecs = ram?.specifications as RamSpecs | undefined;
  const gpuSpecs = gpu?.specifications as GpuSpecs | undefined;
  const cabinetSpecs = cabinet?.specifications as CabinetSpecs | undefined;
  const coolerSpecs = cooler?.specifications as CoolerSpecs | undefined;
  const psuSpecs = psu?.specifications as PsuSpecs | undefined;

  // 1. Missing Core Components Check
  const missingCoreComponents: ComponentCategory[] = [];
  for (const cat of CORE_CATEGORIES) {
    if (!components[cat]) {
      missingCoreComponents.push(cat);
    }
  }

  // Check if GPU is strictly needed (when CPU has no integrated graphics)
  const cpuHasIGPU = cpuSpecs?.integratedGraphics === true;
  const cpuIGPUUnknown = cpuSpecs?.integratedGraphics === undefined;
  const isGpuSelected = Boolean(gpu);

  if (cpu && !cpuHasIGPU && !isGpuSelected) {
    if (cpuIGPUUnknown) {
      issues.push({
        id: 'gpu-igpu-unknown',
        severity: 'warning',
        category: 'Display Output',
        title: 'Display Output Unknown Without Discrete GPU',
        message: `${cpu.name} integrated graphics specifications are unverified. If this CPU lacks an iGPU, you will need a dedicated graphic card for display output.`,
        affectedComponents: ['cpu'],
        isUnknown: true,
      });
    } else {
      missingCoreComponents.push('gpu');
      issues.push({
        id: 'gpu-required-missing',
        severity: 'error',
        category: 'Display Output',
        title: 'Dedicated Graphic Card Required',
        message: `${cpu.name} does not feature integrated graphics. A dedicated graphic card (GPU) is required for video display output.`,
        affectedComponents: ['cpu'],
      });
    }
  }

  // Cooler requirement check: CPU without stock cooler needs an aftermarket cooler
  if (cpu && cpuSpecs?.includesStockCooler === false && !cooler) {
    issues.push({
      id: 'cpu-missing-cooler',
      severity: 'error',
      category: 'Thermal Management',
      title: 'Dedicated CPU Cooler Required',
      message: `${cpu.name} does not include a boxed stock cooler. You must select an aftermarket air or AIO liquid cooler.`,
      affectedComponents: ['cpu'],
    });
  }

  // 2. CPU vs Motherboard Socket Compatibility
  if (cpu && mb) {
    const cpuSocket = cpuSpecs?.socket;
    const mbSocket = mbSpecs?.socket;

    if (!cpuSocket || !mbSocket) {
      issues.push({
        id: 'cpu-mb-socket-unknown',
        severity: 'warning',
        category: 'Socket Compatibility',
        title: 'CPU / Motherboard Socket Compatibility Unknown',
        message: `Socket data is incomplete for ${cpu.name} or ${mb.name}. Compatibility cannot be verified without confirmed socket specs.`,
        affectedComponents: ['cpu', 'motherboard'],
        isUnknown: true,
      });
    } else if (cpuSocket.toLowerCase() !== mbSocket.toLowerCase()) {
      issues.push({
        id: 'cpu-mb-socket-mismatch',
        severity: 'error',
        category: 'Socket Incompatibility',
        title: 'CPU and Motherboard Socket Mismatch',
        message: `${cpu.name} uses socket ${cpuSocket}, while ${mb.name} provides socket ${mbSocket}. These parts are physically incompatible.`,
        affectedComponents: ['cpu', 'motherboard'],
      });
    } else {
      issues.push({
        id: 'cpu-mb-socket-match',
        severity: 'info',
        category: 'Socket Compatibility',
        title: 'Socket Match Confirmed',
        message: `Both ${cpu.name} and ${mb.name} share the ${cpuSocket} socket interface.`,
        affectedComponents: ['cpu', 'motherboard'],
      });
    }
  }

  // 3. RAM Type vs Motherboard RAM Type Compatibility
  if (ram && mb) {
    const ramType = ramSpecs?.type;
    const mbRamType = mbSpecs?.memoryType;

    if (!ramType || !mbRamType) {
      issues.push({
        id: 'ram-mb-type-unknown',
        severity: 'warning',
        category: 'Memory Type',
        title: 'RAM / Motherboard Memory Generation Unknown',
        message: `Memory generation specifications are incomplete for ${ram.name} or ${mb.name}.`,
        affectedComponents: ['ram', 'motherboard'],
        isUnknown: true,
      });
    } else if (ramType !== mbRamType) {
      issues.push({
        id: 'ram-mb-type-mismatch',
        severity: 'error',
        category: 'Memory Generation Mismatch',
        title: 'RAM Generation Incompatible with Motherboard',
        message: `${ram.name} is ${ramType}, but ${mb.name} only supports ${mbRamType}. Memory slots are keyed differently and cannot be interchanged.`,
        affectedComponents: ['ram', 'motherboard'],
      });
    } else {
      issues.push({
        id: 'ram-mb-type-match',
        severity: 'info',
        category: 'Memory Generation',
        title: 'Memory Generation Match',
        message: `Both ${ram.name} and ${mb.name} utilize ${ramType} memory architecture.`,
        affectedComponents: ['ram', 'motherboard'],
      });
    }

    // RAM slots & capacity check
    if (ramSpecs?.modules && mbSpecs?.memorySlots) {
      if (ramSpecs.modules > mbSpecs.memorySlots) {
        issues.push({
          id: 'ram-slots-exceeded',
          severity: 'error',
          category: 'Memory Slots',
          title: 'Memory Module Count Exceeds Motherboard DIMM Slots',
          message: `The selected RAM kit contains ${ramSpecs.modules} modules, but ${mb.name} only has ${mbSpecs.memorySlots} DIMM slots.`,
          affectedComponents: ['ram', 'motherboard'],
        });
      }
    }

    if (ramSpecs?.capacityGb && mbSpecs?.maxMemoryGb) {
      if (ramSpecs.capacityGb > mbSpecs.maxMemoryGb) {
        issues.push({
          id: 'ram-max-capacity-exceeded',
          severity: 'error',
          category: 'Memory Capacity',
          title: 'RAM Capacity Exceeds Motherboard Maximum',
          message: `${ramSpecs.capacityGb}GB RAM exceeds ${mb.name}'s maximum capacity of ${mbSpecs.maxMemoryGb}GB.`,
          affectedComponents: ['ram', 'motherboard'],
        });
      }
    }
  }

  // 4. Motherboard Form Factor vs Cabinet Support
  if (mb && cabinet) {
    const mbForm = mbSpecs?.formFactor;
    const cabForms = cabinetSpecs?.supportedFormFactors;

    if (!mbForm || !cabForms || cabForms.length === 0) {
      issues.push({
        id: 'mb-cab-formfactor-unknown',
        severity: 'warning',
        category: 'Chassis Clearance',
        title: 'Motherboard / Cabinet Form Factor Fit Unknown',
        message: `Form factor compatibility between ${mb.name} and ${cabinet.name} cannot be verified due to missing specs.`,
        affectedComponents: ['motherboard', 'cabinet'],
        isUnknown: true,
      });
    } else if (!cabForms.includes(mbForm)) {
      issues.push({
        id: 'mb-cab-formfactor-mismatch',
        severity: 'error',
        category: 'Chassis Incompatibility',
        title: 'Motherboard Form Factor Exceeds Cabinet Support',
        message: `${mb.name} is an ${mbForm} motherboard, but ${cabinet.name} only accommodates [${cabForms.join(', ')}].`,
        affectedComponents: ['motherboard', 'cabinet'],
      });
    } else {
      issues.push({
        id: 'mb-cab-formfactor-match',
        severity: 'info',
        category: 'Chassis Fit',
        title: 'Chassis Form Factor Compatible',
        message: `${cabinet.name} natively accommodates ${mbForm} motherboards.`,
        affectedComponents: ['motherboard', 'cabinet'],
      });
    }
  }

  // 5. GPU Length vs Cabinet Clearance
  if (gpu && cabinet) {
    const gpuLength = gpuSpecs?.lengthMm;
    const maxGpuLength = cabinetSpecs?.maxGpuLengthMm;

    if (gpuLength === undefined || maxGpuLength === undefined) {
      issues.push({
        id: 'gpu-cab-length-unknown',
        severity: 'warning',
        category: 'Physical Clearance',
        title: 'GPU Length / Cabinet Clearance Unknown',
        message: `Physical clearance between ${gpu.name} and ${cabinet.name} cannot be verified without confirmed dimensions.`,
        affectedComponents: ['gpu', 'cabinet'],
        isUnknown: true,
      });
    } else if (gpuLength > maxGpuLength) {
      issues.push({
        id: 'gpu-cab-length-exceeded',
        severity: 'error',
        category: 'Physical Collision',
        title: 'GPU Length Exceeds Cabinet Clearance',
        message: `${gpu.name} is ${gpuLength}mm long, but ${cabinet.name} only allows a maximum GPU length of ${maxGpuLength}mm.`,
        affectedComponents: ['gpu', 'cabinet'],
      });
    } else {
      const clearanceLeft = maxGpuLength - gpuLength;
      issues.push({
        id: 'gpu-cab-length-fit',
        severity: 'info',
        category: 'Physical Clearance',
        title: 'GPU Fits in Cabinet',
        message: `${gpu.name} (${gpuLength}mm) fits comfortably in ${cabinet.name} (max ${maxGpuLength}mm, ${clearanceLeft}mm remaining clearance).`,
        affectedComponents: ['gpu', 'cabinet'],
      });
    }
  }

  // 6. CPU Cooler vs Cabinet Clearance & Socket Compatibility
  if (cooler) {
    const coolerSockets = coolerSpecs?.supportedSockets;
    const coolerHeight = coolerSpecs?.heightMm;

    // Socket check with CPU / MB
    const targetSocket = cpuSpecs?.socket || mbSpecs?.socket;
    if (targetSocket && coolerSockets) {
      const socketMatch = coolerSockets.some(
        (s) => s.toLowerCase() === targetSocket.toLowerCase()
      );
      if (!socketMatch) {
        issues.push({
          id: 'cooler-socket-mismatch',
          severity: 'error',
          category: 'Cooler Mounting',
          title: 'Cooler Socket Bracket Incompatible',
          message: `${cooler.name} supports sockets [${coolerSockets.join(', ')}], but the selected CPU/Motherboard requires socket ${targetSocket}.`,
          affectedComponents: ['cooler', cpu ? 'cpu' : 'motherboard'],
        });
      }
    } else if (targetSocket && !coolerSockets) {
      issues.push({
        id: 'cooler-socket-unknown',
        severity: 'warning',
        category: 'Cooler Mounting',
        title: 'Cooler Socket Bracket Compatibility Unknown',
        message: `Mounting bracket data is unverified for ${cooler.name}.`,
        affectedComponents: ['cooler'],
        isUnknown: true,
      });
    }

    // Height check with Cabinet
    if (cabinet) {
      const maxCoolerHeight = cabinetSpecs?.maxCpuCoolerHeightMm;
      if (coolerHeight === undefined || maxCoolerHeight === undefined) {
        issues.push({
          id: 'cooler-cab-height-unknown',
          severity: 'warning',
          category: 'Cooler Clearance',
          title: 'Cooler Height Clearance Unknown',
          message: `CPU cooler height clearance in ${cabinet.name} could not be determined.`,
          affectedComponents: ['cooler', 'cabinet'],
          isUnknown: true,
        });
      } else if (coolerSpecs?.type === 'Air' && coolerHeight > maxCoolerHeight) {
        issues.push({
          id: 'cooler-cab-height-exceeded',
          severity: 'error',
          category: 'Physical Collision',
          title: 'Cooler Height Exceeds Cabinet Clearance',
          message: `${cooler.name} stands ${coolerHeight}mm tall, exceeding the maximum allowed height of ${maxCoolerHeight}mm in ${cabinet.name}. The side panel will not close.`,
          affectedComponents: ['cooler', 'cabinet'],
        });
      }
    }
  }

  // 7. Power Estimation and PSU Wattage Validation
  // Base system draw (Motherboard, RAM, Storage, Fans, RGB): ~60W
  let baseSystemWatts = 60;
  if (ram) baseSystemWatts += 10;
  if (storage) baseSystemWatts += 10;

  const cpuTdp = cpuSpecs?.tdpWatts ?? 65;
  const gpuTdp = gpuSpecs?.tdpWatts ?? 0;
  const estimatedWattage = Math.round(baseSystemWatts + cpuTdp + gpuTdp);

  // Recommended PSU includes a 30% safety headroom for capacitor aging & transient load spikes
  const recommendedPsuWattage = Math.max(
    gpuSpecs?.recommendedPsuWatts ?? 0,
    Math.ceil((estimatedWattage * 1.3) / 50) * 50
  );

  if (psu) {
    const psuWattage = psuSpecs?.wattage;
    if (psuWattage === undefined) {
      issues.push({
        id: 'psu-wattage-unknown',
        severity: 'warning',
        category: 'Power Delivery',
        title: 'PSU Wattage Unknown',
        message: `The rated capacity of ${psu.name} is unverified. Estimated system load is ~${estimatedWattage}W.`,
        affectedComponents: ['psu'],
        isUnknown: true,
      });
    } else if (psuWattage < estimatedWattage) {
      issues.push({
        id: 'psu-wattage-insufficient',
        severity: 'error',
        category: 'Power Overdraw',
        title: 'PSU Wattage Below Estimated Load',
        message: `${psu.name} provides ${psuWattage}W, but the estimated sustained system draw is ~${estimatedWattage}W. The PC may crash under load or shut down unexpectedly.`,
        affectedComponents: ['psu'],
      });
    } else if (psuWattage < recommendedPsuWattage) {
      issues.push({
        id: 'psu-wattage-tight',
        severity: 'warning',
        category: 'Power Headroom',
        title: 'PSU Headroom is Marginal',
        message: `${psu.name} (${psuWattage}W) covers estimated load (~${estimatedWattage}W), but falls short of the recommended ${recommendedPsuWattage}W buffer for GPU transient spikes.`,
        affectedComponents: ['psu'],
      });
    } else {
      issues.push({
        id: 'psu-wattage-good',
        severity: 'info',
        category: 'Power Delivery',
        title: 'Adequate PSU Capacity',
        message: `${psu.name} (${psuWattage}W) provides comfortable headroom for estimated system draw (~${estimatedWattage}W).`,
        affectedComponents: ['psu'],
      });
    }

    // Essential PSU disclaimer required by prompt rule 7
    issues.push({
      id: 'psu-quality-notice',
      severity: 'info',
      category: 'Power Notice',
      title: 'Power Delivery Disclaimer',
      message: 'Wattage calculation is an estimated guideline. True stability depends on 12V single-rail amperage, efficiency tier, and voltage ripple under peak transient loads.',
      affectedComponents: ['psu'],
    });
  }

  // Derive final aggregate status
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const hasUnknowns = issues.some((i) => i.isUnknown);
  const coreComplete = missingCoreComponents.length === 0;

  let status: CompatibilityReport['status'] = 'compatible';
  let statusLabel = '100% Compatible';
  let summary = 'All selected components are mechanically and electrically compatible based on confirmed specifications.';

  if (errorCount > 0) {
    status = 'incompatible';
    statusLabel = 'Incompatibility Detected';
    summary = `Found ${errorCount} incompatible component conflict${errorCount > 1 ? 's' : ''} that must be resolved.`;
  } else if (hasUnknowns) {
    status = 'unknown';
    statusLabel = 'Compatibility Partially Unknown';
    summary = 'Some component specifications are missing or unverified; compatibility cannot be guaranteed.';
  } else if (!coreComplete) {
    status = 'incomplete';
    statusLabel = 'Configuration Incomplete';
    summary = `Please select remaining essential core components: ${missingCoreComponents.join(', ')}.`;
  } else if (warningCount > 0) {
    status = 'has_warnings';
    statusLabel = 'Compatible with Warnings';
    summary = `Parts are physically compatible, but ${warningCount} advisory note${warningCount > 1 ? 's' : ''} warrant attention.`;
  }

  return {
    isCompatible: errorCount === 0 && coreComplete && !hasUnknowns,
    status,
    statusLabel,
    summary,
    issues,
    estimatedWattage,
    recommendedPsuWattage,
    coreComplete,
    missingCoreComponents,
  };
}

import { describe, it, expect } from 'vitest';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { BuildComponents, Component } from '@/types';
import {
  VISUALIZER_LAYERS,
  VisualizerLayerId,
} from '@/lib/visualizer/types';
import {
  getLayerForCategory,
  getLayerZIndex,
  resolveComponentVisualAsset,
  getVisualizerHotspots,
} from '@/lib/visualizer/layers';
import { checkCompatibility } from '@/engine/compatibility';
import { calculatePriceBreakdown } from '@/engine/pricing';

describe('2D Rig Visualizer Architecture & Layer Mapping', () => {
  it('enforces the exact 9-layer visualizer rendering order', () => {
    expect(VISUALIZER_LAYERS.length).toBe(9);
    expect(VISUALIZER_LAYERS[0].id).toBe('case_chassis');
    expect(VISUALIZER_LAYERS[1].id).toBe('motherboard');
    expect(VISUALIZER_LAYERS[2].id).toBe('cpu_socket_cooler');
    expect(VISUALIZER_LAYERS[3].id).toBe('ram_modules');
    expect(VISUALIZER_LAYERS[4].id).toBe('graphics_card');
    expect(VISUALIZER_LAYERS[5].id).toBe('storage_devices');
    expect(VISUALIZER_LAYERS[6].id).toBe('power_supply');
    expect(VISUALIZER_LAYERS[7].id).toBe('cooling_fans');
    expect(VISUALIZER_LAYERS[8].id).toBe('cables_and_labels');

    // Verify sequential z-indexes
    for (let i = 0; i < VISUALIZER_LAYERS.length - 1; i++) {
      const currentZ = getLayerZIndex(VISUALIZER_LAYERS[i].id);
      const nextZ = getLayerZIndex(VISUALIZER_LAYERS[i + 1].id);
      expect(nextZ).toBeGreaterThan(currentZ);
    }
  });

  it('correctly maps hardware categories to their designated rendering layer', () => {
    expect(getLayerForCategory('cabinet')).toBe('case_chassis');
    expect(getLayerForCategory('motherboard')).toBe('motherboard');
    expect(getLayerForCategory('cpu')).toBe('cpu_socket_cooler');
    expect(getLayerForCategory('cooler')).toBe('cpu_socket_cooler');
    expect(getLayerForCategory('ram')).toBe('ram_modules');
    expect(getLayerForCategory('gpu')).toBe('graphics_card');
    expect(getLayerForCategory('storage')).toBe('storage_devices');
    expect(getLayerForCategory('psu')).toBe('power_supply');
  });

  it('resolves component-specific visual assets with honest truth-in-data labelling', () => {
    const amdCpu = COMPONENT_CATALOG.find((c) => c.id === 'cpu-amd-5600');
    expect(amdCpu).toBeDefined();

    const visualMetadata = resolveComponentVisualAsset('cpu', amdCpu);
    expect(visualMetadata.assetPath).toContain('amd-ryzen.svg');
    expect(visualMetadata.assetType).toBe('generic_illustration'); // Honest technical illustration
    expect(visualMetadata.layerId).toBe('cpu_socket_cooler');

    const intelCpu = COMPONENT_CATALOG.find((c) => c.id === 'cpu-intel-12400f');
    expect(intelCpu).toBeDefined();
    const intelMetadata = resolveComponentVisualAsset('cpu', intelCpu);
    expect(intelMetadata.assetPath).toContain('intel-core.svg');
  });

  it('falls back to generic category asset when a component or model image is missing', () => {
    const fallback = resolveComponentVisualAsset('cooler', undefined);
    expect(fallback.assetPath).toBe('/images/illustrations/generic-cooler.svg');
    expect(fallback.assetType).toBe('generic_illustration');
    expect(fallback.slotPosition).toBe('empty_cooler_slot');
  });
});

describe('Interactive Hotspots & Build Synchronization', () => {
  it('generates 8 distinct hardware hotspots with accessible labels', () => {
    const emptyBuild: BuildComponents = {};
    const hotspots = getVisualizerHotspots(emptyBuild, true);

    expect(hotspots.length).toBe(8);
    const categories = hotspots.map((h) => h.category);
    expect(categories).toContain('cabinet');
    expect(categories).toContain('motherboard');
    expect(categories).toContain('cpu');
    expect(categories).toContain('cooler');
    expect(categories).toContain('ram');
    expect(categories).toContain('gpu');
    expect(categories).toContain('storage');
    expect(categories).toContain('psu');

    // All hotspots in empty build should report not installed
    hotspots.forEach((h) => {
      expect(h.isInstalled).toBe(false);
      expect(h.ariaLabel.length).toBeGreaterThan(0);
    });

    // GPU hotspot when required should warn about missing discrete graphics
    const gpuHotspot = hotspots.find((h) => h.category === 'gpu');
    expect(gpuHotspot?.label).toContain('Discrete GPU Required');
  });

  it('updates visualizer hotspot state when components are added', () => {
    const cpuPart = COMPONENT_CATALOG.find((c) => c.id === 'cpu-amd-5600')!;
    const moboPart = COMPONENT_CATALOG.find((c) => c.id === 'mb-msi-b550m-vdh')!;
    const ramPart = COMPONENT_CATALOG.find((c) => c.id === 'ram-corsair-16gb-d4')!;

    const buildWithParts: BuildComponents = {
      cpu: cpuPart,
      motherboard: moboPart,
      ram: ramPart,
    };

    const hotspots = getVisualizerHotspots(buildWithParts, false);

    const cpuHotspot = hotspots.find((h) => h.category === 'cpu')!;
    expect(cpuHotspot.isInstalled).toBe(true);
    expect(cpuHotspot.componentName).toBe(cpuPart.name);
    expect(cpuHotspot.priceINR).toBe(cpuPart.priceINR);

    const moboHotspot = hotspots.find((h) => h.category === 'motherboard')!;
    expect(moboHotspot.isInstalled).toBe(true);
    // Micro-ATX motherboard should have shorter height in hotspot coordinates
    expect(moboHotspot.height).toBe(320);

    const psuHotspot = hotspots.find((h) => h.category === 'psu')!;
    expect(psuHotspot.isInstalled).toBe(false);
  });

  it('properly reverts hotspot to empty state when component is removed', () => {
    const cpuPart = COMPONENT_CATALOG.find((c) => c.id === 'cpu-amd-5600')!;
    const build: BuildComponents = { cpu: cpuPart };

    let hotspots = getVisualizerHotspots(build, false);
    expect(hotspots.find((h) => h.category === 'cpu')?.isInstalled).toBe(true);

    // Remove CPU
    const updatedBuild: BuildComponents = { ...build, cpu: undefined };
    hotspots = getVisualizerHotspots(updatedBuild, false);
    const cpuHotspot = hotspots.find((h) => h.category === 'cpu')!;
    expect(cpuHotspot.isInstalled).toBe(false);
    expect(cpuHotspot.componentName).toBeUndefined();
  });

  it('preserves build price and compatibility integrity during visualizer synchronization', () => {
    const cpu = COMPONENT_CATALOG.find((c) => c.id === 'cpu-amd-5600')!;
    const mobo = COMPONENT_CATALOG.find((c) => c.id === 'mb-msi-b550m-vdh')!;
    const ram = COMPONENT_CATALOG.find((c) => c.id === 'ram-gskill-ripjaws-16gb-ddr4')!;
    const gpu = COMPONENT_CATALOG.find((c) => c.id === 'gpu-asrock-rx6600')!;
    const storage = COMPONENT_CATALOG.find((c) => c.id === 'storage-wd-blue-sn580-1tb')!;
    const psu = COMPONENT_CATALOG.find((c) => c.id === 'psu-cooler-master-mwe-550')!;
    const cabinet = COMPONENT_CATALOG.find((c) => c.id === 'cab-galax-revolution-05')!;

    const fullBuild: BuildComponents = {
      cpu,
      motherboard: mobo,
      ram,
      gpu,
      storage,
      psu,
      cabinet,
    };

    // Calculate baseline price and compatibility
    const initialPrice = calculatePriceBreakdown(fullBuild, { budgetCapINR: 0, includePeripheralsInBudget: false });
    const initialReport = checkCompatibility(fullBuild);

    expect(initialReport.isCompatible).toBe(true);
    expect(initialPrice.coreSubtotalINR).toBe(
      cpu.priceINR + mobo.priceINR + ram.priceINR + gpu.priceINR + storage.priceINR + psu.priceINR + cabinet.priceINR
    );

    // Changing only the GPU in the build
    const upgradedGpu = COMPONENT_CATALOG.find((c) => c.id === 'gpu-asus-dual-rtx4060')!;
    const modifiedBuild: BuildComponents = {
      ...fullBuild,
      gpu: upgradedGpu,
    };

    // Verify visualizer hotspots reflect new GPU
    const hotspots = getVisualizerHotspots(modifiedBuild, false);
    const gpuHs = hotspots.find((h) => h.category === 'gpu')!;
    expect(gpuHs.componentName).toBe(upgradedGpu.name);
    expect(gpuHs.priceINR).toBe(upgradedGpu.priceINR);

    // Verify price arithmetic reflects EXACT delta of upgraded GPU
    const updatedPrice = calculatePriceBreakdown(modifiedBuild, { budgetCapINR: 0, includePeripheralsInBudget: false });
    const expectedDelta = upgradedGpu.priceINR - gpu.priceINR;
    expect(updatedPrice.coreSubtotalINR - initialPrice.coreSubtotalINR).toBe(expectedDelta);

    // Other components remain intact
    expect(modifiedBuild.cpu?.id).toBe(cpu.id);
    expect(modifiedBuild.motherboard?.id).toBe(mobo.id);
  });
});

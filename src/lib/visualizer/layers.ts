import { Component, ComponentCategory, BuildComponents } from '@/types';
import {
  VisualAssetType,
  VisualizerLayerId,
  VisualizerHotspot,
  ComponentVisualMetadata,
  VISUALIZER_LAYERS,
} from './types';

/**
 * Maps a component category to its official rendering layer order (1 - 9)
 */
export function getLayerZIndex(layerId: VisualizerLayerId): number {
  const layer = VISUALIZER_LAYERS.find((l) => l.id === layerId);
  return layer ? layer.order * 10 : 10;
}

/**
 * Resolves a visual asset path, asset classification, and metadata for a given component.
 * Respects truth-in-data: only returns 'verified_product' if a verified image is available,
 * otherwise returns 'generic_illustration'.
 */
export function resolveComponentVisualAsset(
  category: ComponentCategory,
  component?: Component
): ComponentVisualMetadata {
  if (!component) {
    return {
      assetPath: `/images/illustrations/generic-${category === 'cabinet' ? 'case' : category}.svg`,
      assetType: 'generic_illustration',
      layerId: getLayerForCategory(category),
      slotPosition: `empty_${category}_slot`,
      label: `Empty ${category.toUpperCase()} Slot`,
    };
  }

  // If a legitimate external product image is specified
  if (component.imageUrl && component.imageUrl.startsWith('http')) {
    return {
      assetPath: component.imageUrl,
      assetType: 'verified_product',
      layerId: getLayerForCategory(category),
      slotPosition: `${category}_installed`,
      label: `${component.brand} ${component.name}`,
    };
  }

  // Category-specific local SVG asset mapping
  const brandLower = component.brand.toLowerCase();
  const nameLower = component.name.toLowerCase();
  const specs = (component.specifications || {}) as any;

  let localPath = `/images/illustrations/generic-${category === 'cabinet' ? 'case' : category}.svg`;

  switch (category) {
    case 'cpu':
      if (brandLower.includes('amd') || nameLower.includes('ryzen')) {
        localPath = '/images/components/cpu/amd-ryzen.svg';
      } else if (brandLower.includes('intel') || nameLower.includes('core')) {
        localPath = '/images/components/cpu/intel-core.svg';
      }
      break;

    case 'motherboard':
      if (specs.formFactor === 'Micro-ATX' || nameLower.includes('matx')) {
        localPath = '/images/components/motherboard/matx.svg';
      } else {
        localPath = '/images/components/motherboard/atx.svg';
      }
      break;

    case 'ram':
      if (specs.type === 'DDR5' || nameLower.includes('ddr5')) {
        localPath = '/images/components/ram/ddr5.svg';
      } else {
        localPath = '/images/components/ram/ddr4.svg';
      }
      break;

    case 'gpu':
      if ((specs.lengthMm && specs.lengthMm >= 280) || nameLower.includes('triple') || nameLower.includes('3x')) {
        localPath = '/images/components/gpu/triple-fan.svg';
      } else {
        localPath = '/images/components/gpu/dual-fan.svg';
      }
      break;

    case 'cooler':
      if (specs.type === 'Liquid (AIO)' || nameLower.includes('aio') || nameLower.includes('liquid')) {
        localPath = '/images/components/cooler/liquid-aio.svg';
      } else {
        localPath = '/images/components/cooler/air-tower.svg';
      }
      break;

    case 'storage':
      localPath = '/images/components/storage/nvme-ssd.svg';
      break;

    case 'psu':
      localPath = '/images/components/psu/atx-psu.svg';
      break;

    case 'cabinet':
      localPath = '/images/cases/atx-chassis-side.svg';
      break;

    default:
      localPath = `/images/illustrations/generic-${category}.svg`;
  }

  return {
    assetPath: localPath,
    assetType: 'generic_illustration',
    layerId: getLayerForCategory(category),
    slotPosition: `${category}_installed`,
    label: `${component.brand} ${component.name} (2D Illustration)`,
    widthMm: specs.lengthMm || specs.heightMm,
  };
}

export function getLayerForCategory(category: ComponentCategory): VisualizerLayerId {
  switch (category) {
    case 'cabinet':
      return 'case_chassis';
    case 'motherboard':
      return 'motherboard';
    case 'cpu':
      return 'cpu_socket_cooler';
    case 'cooler':
      return 'cpu_socket_cooler';
    case 'ram':
      return 'ram_modules';
    case 'gpu':
      return 'graphics_card';
    case 'storage':
      return 'storage_devices';
    case 'psu':
      return 'power_supply';
    default:
      return 'cables_and_labels';
  }
}

/**
 * Calculates responsive bounding box hotspots for each component inside the 880x660 canvas.
 */
export function getVisualizerHotspots(
  components: BuildComponents,
  isGpuRequired = false
): VisualizerHotspot[] {
  const { cabinet, motherboard, cpu, cooler, ram, gpu, storage, psu } = components;
  const isMatxMobo = (motherboard?.specifications as any)?.formFactor === 'Micro-ATX';
  const isTripleFanGpu = ((gpu?.specifications as any)?.lengthMm || 240) >= 280;

  return [
    {
      category: 'cabinet',
      layerId: 'case_chassis',
      x: 40,
      y: 30,
      width: 800,
      height: 600,
      label: cabinet ? cabinet.name : 'Select Cabinet / Chassis',
      ariaLabel: `Chassis: ${cabinet ? cabinet.name : 'Empty slot. Click to select PC case'}`,
      isInstalled: Boolean(cabinet),
      componentName: cabinet?.name,
      componentBrand: cabinet?.brand,
      priceINR: cabinet?.priceINR,
      assetType: cabinet?.imageUrl ? 'verified_product' : 'generic_illustration',
    },
    {
      category: 'motherboard',
      layerId: 'motherboard',
      x: 200,
      y: 80,
      width: 440,
      height: isMatxMobo ? 320 : 385,
      label: motherboard ? motherboard.name : 'Select Motherboard',
      ariaLabel: `Motherboard: ${motherboard ? motherboard.name : 'Empty slot. Click to select Motherboard'}`,
      isInstalled: Boolean(motherboard),
      componentName: motherboard?.name,
      componentBrand: motherboard?.brand,
      priceINR: motherboard?.priceINR,
      assetType: motherboard?.imageUrl ? 'verified_product' : 'generic_illustration',
    },
    {
      category: 'cpu',
      layerId: 'cpu_socket_cooler',
      x: 345,
      y: 135,
      width: 110,
      height: 110,
      label: cpu ? cpu.name : 'Select CPU Processor',
      ariaLabel: `CPU: ${cpu ? cpu.name : 'Empty socket. Click to select CPU processor'}`,
      isInstalled: Boolean(cpu),
      componentName: cpu?.name,
      componentBrand: cpu?.brand,
      priceINR: cpu?.priceINR,
      assetType: cpu?.imageUrl ? 'verified_product' : 'generic_illustration',
    },
    {
      category: 'cooler',
      layerId: 'cpu_socket_cooler',
      x: 320,
      y: 100,
      width: 160,
      height: 160,
      label: cooler ? cooler.name : 'Select CPU Cooler',
      ariaLabel: `Cooler: ${cooler ? cooler.name : 'Empty slot. Click to select CPU cooler'}`,
      isInstalled: Boolean(cooler),
      componentName: cooler?.name,
      componentBrand: cooler?.brand,
      priceINR: cooler?.priceINR,
      assetType: cooler?.imageUrl ? 'verified_product' : 'generic_illustration',
    },
    {
      category: 'ram',
      layerId: 'ram_modules',
      x: 470,
      y: 115,
      width: 80,
      height: 150,
      label: ram ? ram.name : 'Select RAM Memory',
      ariaLabel: `RAM: ${ram ? ram.name : 'Empty slots. Click to select RAM memory'}`,
      isInstalled: Boolean(ram),
      componentName: ram?.name,
      componentBrand: ram?.brand,
      priceINR: ram?.priceINR,
      assetType: ram?.imageUrl ? 'verified_product' : 'generic_illustration',
    },
    {
      category: 'gpu',
      layerId: 'graphics_card',
      x: 180,
      y: 255,
      width: isTripleFanGpu ? 450 : 340,
      height: 85,
      label: gpu
        ? gpu.name
        : isGpuRequired
        ? 'Discrete GPU Required!'
        : 'Select Graphics Card (GPU)',
      ariaLabel: `Graphics Card: ${
        gpu ? gpu.name : isGpuRequired ? 'Required discrete GPU missing. Click to select' : 'Empty slot'
      }`,
      isInstalled: Boolean(gpu),
      componentName: gpu?.name,
      componentBrand: gpu?.brand,
      priceINR: gpu?.priceINR,
      assetType: gpu?.imageUrl ? 'verified_product' : 'generic_illustration',
    },
    {
      category: 'storage',
      layerId: 'storage_devices',
      x: 365,
      y: 295,
      width: 155,
      height: 38,
      label: storage ? storage.name : 'Select M.2 SSD Storage',
      ariaLabel: `Storage: ${storage ? storage.name : 'Empty M.2 slot. Click to select storage'}`,
      isInstalled: Boolean(storage),
      componentName: storage?.name,
      componentBrand: storage?.brand,
      priceINR: storage?.priceINR,
      assetType: storage?.imageUrl ? 'verified_product' : 'generic_illustration',
    },
    {
      category: 'psu',
      layerId: 'power_supply',
      x: 100,
      y: 515,
      width: 260,
      height: 75,
      label: psu ? psu.name : 'Select Power Supply (PSU)',
      ariaLabel: `Power Supply: ${psu ? psu.name : 'Empty PSU chamber. Click to select PSU'}`,
      isInstalled: Boolean(psu),
      componentName: psu?.name,
      componentBrand: psu?.brand,
      priceINR: psu?.priceINR,
      assetType: psu?.imageUrl ? 'verified_product' : 'generic_illustration',
    },
  ];
}

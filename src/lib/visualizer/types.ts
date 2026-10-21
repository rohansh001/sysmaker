import { ComponentCategory } from '@/types';

export type VisualAssetType = 'verified_product' | 'generic_illustration';

export type VisualizerLayerId =
  | 'case_chassis'
  | 'motherboard'
  | 'cpu_socket_cooler'
  | 'ram_modules'
  | 'graphics_card'
  | 'storage_devices'
  | 'power_supply'
  | 'cooling_fans'
  | 'cables_and_labels';

export interface VisualizerLayerOrder {
  id: VisualizerLayerId;
  order: number;
  name: string;
  description: string;
}

export const VISUALIZER_LAYERS: VisualizerLayerOrder[] = [
  { id: 'case_chassis', order: 1, name: 'Case & Chassis', description: 'Chassis frame, rear I/O cutout, PSU shroud, and dust filters' },
  { id: 'motherboard', order: 2, name: 'Motherboard', description: 'PCB, VRM heatsinks, chipset, and rear I/O armor' },
  { id: 'cpu_socket_cooler', order: 3, name: 'CPU & Cooler', description: 'Processor socket, heatspreader IHS, and cooling solution' },
  { id: 'ram_modules', order: 4, name: 'RAM Modules', description: 'Populated memory modules in DIMM slots' },
  { id: 'graphics_card', order: 5, name: 'Graphics Card', description: 'PCIe-seated GPU shroud, backplate, and cooling fans' },
  { id: 'storage_devices', order: 6, name: 'Storage Devices', description: 'M.2 NVMe thermal heatsink and drive bays' },
  { id: 'power_supply', order: 7, name: 'Power Supply', description: 'PSU chamber, fan grill, and wattage badge' },
  { id: 'cooling_fans', order: 8, name: 'Cooling Fans', description: 'Front intake, rear exhaust, and top radiator fans' },
  { id: 'cables_and_labels', order: 9, name: 'Cables & Hotspots', description: 'Power harnesses, labels, interactive hotspots, and focus outlines' },
];

export interface VisualizerHotspot {
  category: ComponentCategory;
  layerId: VisualizerLayerId;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  ariaLabel: string;
  isInstalled: boolean;
  componentName?: string;
  componentBrand?: string;
  priceINR?: number;
  assetType: VisualAssetType;
}

export interface ComponentVisualMetadata {
  assetPath: string;
  assetType: VisualAssetType;
  layerId: VisualizerLayerId;
  widthMm?: number;
  heightMm?: number;
  slotPosition: string;
  label: string;
}

export type ZoomLevel = 1 | 1.25 | 1.5;

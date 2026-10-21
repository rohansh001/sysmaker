import React from 'react';
import { ComponentCategory } from '@/types';
import {
  Cpu,
  CircuitBoard,
  Layers,
  Tv,
  HardDrive,
  Zap,
  Box,
  Fan,
  Monitor,
  Keyboard,
  Mouse,
} from 'lucide-react';

interface ComponentIconProps {
  category: ComponentCategory;
  className?: string;
}

export const ComponentIcon: React.FC<ComponentIconProps> = ({ category, className = 'w-5 h-5' }) => {
  switch (category) {
    case 'cpu':
      return <Cpu className={className} />;
    case 'motherboard':
      return <CircuitBoard className={className} />;
    case 'ram':
      return <Layers className={className} />;
    case 'gpu':
      return <Tv className={className} />;
    case 'storage':
      return <HardDrive className={className} />;
    case 'psu':
      return <Zap className={className} />;
    case 'cabinet':
      return <Box className={className} />;
    case 'cooler':
      return <Fan className={className} />;
    case 'monitor':
      return <Monitor className={className} />;
    case 'keyboard':
      return <Keyboard className={className} />;
    case 'mouse':
      return <Mouse className={className} />;
    default:
      return <Box className={className} />;
  }
};

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  cpu: 'Processor (CPU)',
  motherboard: 'Motherboard',
  ram: 'Memory (RAM)',
  gpu: 'Graphic Card (GPU)',
  storage: 'Storage (SSD)',
  psu: 'Power Supply (PSU)',
  cabinet: 'Cabinet (Chassis)',
  cooler: 'CPU Cooler',
  monitor: 'Monitor',
  keyboard: 'Keyboard',
  mouse: 'Mouse',
};

'use client';

import React, { useState } from 'react';
import { Component, ComponentCategory } from '@/types';
import { ComponentIcon } from './ComponentIcon';

interface Component2DImageProps {
  component?: Component;
  category: ComponentCategory;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Resolves a locally stored asset path based on exact component brand and specifications
 * to avoid displaying incorrect model illustrations.
 */
export function getLocalComponentAssetPath(category: ComponentCategory, component?: Component): string {
  const brandLower = component?.brand?.toLowerCase() || '';
  const nameLower = component?.name?.toLowerCase() || '';
  const specs = (component?.specifications || {}) as any;

  switch (category) {
    case 'cpu':
      if (brandLower.includes('amd') || nameLower.includes('ryzen') || nameLower.includes('athlon')) {
        return '/images/components/cpu/amd-ryzen.svg';
      }
      if (brandLower.includes('intel') || nameLower.includes('core') || specs.socket === 'LGA1700') {
        return '/images/components/cpu/intel-core.svg';
      }
      return '/images/components/cpu/amd-ryzen.svg';

    case 'motherboard':
      if (specs.formFactor === 'Micro-ATX' || nameLower.includes('matx') || nameLower.includes('m-atx')) {
        return '/images/components/motherboard/matx.svg';
      }
      return '/images/components/motherboard/atx.svg';

    case 'ram':
      if (specs.type === 'DDR5' || nameLower.includes('ddr5')) {
        return '/images/components/ram/ddr5.svg';
      }
      return '/images/components/ram/ddr4.svg';

    case 'gpu':
      if (
        (specs.lengthMm && specs.lengthMm >= 280) ||
        nameLower.includes('triple') ||
        nameLower.includes('3x') ||
        nameLower.includes('tuf') ||
        nameLower.includes('gaming oc')
      ) {
        return '/images/components/gpu/triple-fan.svg';
      }
      return '/images/components/gpu/dual-fan.svg';

    case 'cooler':
      if (
        specs.type === 'Liquid (AIO)' ||
        nameLower.includes('aio') ||
        nameLower.includes('liquid') ||
        nameLower.includes('240') ||
        nameLower.includes('360')
      ) {
        return '/images/components/cooler/liquid-aio.svg';
      }
      return '/images/components/cooler/air-tower.svg';

    case 'storage':
      return '/images/components/storage/nvme-ssd.svg';

    case 'psu':
      return '/images/components/psu/atx-psu.svg';

    case 'cabinet':
      return '/images/components/cabinet/chassis.svg';

    case 'monitor':
      return '/images/components/monitor/gaming-monitor.svg';

    case 'keyboard':
      return '/images/components/keyboard/mechanical.svg';

    case 'mouse':
      return '/images/components/mouse/gaming-mouse.svg';

    default:
      return '';
  }
}

export const Component2DImage: React.FC<Component2DImageProps> = ({
  component,
  category,
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  // Dimension classes based on size
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const containerSize = sizeMap[size];

  // Primary image source: Remote verified imageUrl or locally stored verified vector asset
  const localAsset = getLocalComponentAssetPath(category, component);
  const imageSrc = (!imageError && component?.imageUrl) ? component.imageUrl : localAsset;

  if (imageSrc && !imageError) {
    return (
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden bg-charcoal-800/90 border border-charcoal-700/60 flex items-center justify-center p-1.5 transition-all group-hover:border-magenta-500/50 ${containerSize} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={component?.name || category}
          className="w-full h-full object-contain select-none"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: Inline vector illustration tailored to the category & brand
  const brandLower = component?.brand?.toLowerCase() || '';

  const renderIllustration = () => {
    switch (category) {
      case 'cpu': {
        const isAmd = brandLower.includes('amd');
        const accent = isAmd ? '#ef4444' : '#38bdf8';
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="10" y="10" width="60" height="60" rx="8" fill="#1c202c" stroke="#333b4e" strokeWidth="2" />
            <rect x="18" y="18" width="44" height="44" rx="4" fill="#2d3447" stroke="#4a5573" strokeWidth="1.5" />
            <rect x="22" y="22" width="36" height="36" rx="2" fill="#202534" />
            <rect x="22" y="22" width="36" height="6" rx="1" fill={accent} opacity="0.9" />
            <text x="40" y="44" fill="#ffffff" fontSize="9" fontWeight="extrabold" textAnchor="middle" letterSpacing="0.5">
              {isAmd ? 'RYZEN' : 'CORE'}
            </text>
            <text x="40" y="53" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
              CPU
            </text>
            <polygon points="12,12 18,12 12,18" fill="#fbbf24" />
          </svg>
        );
      }

      case 'motherboard': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="10" y="8" width="60" height="64" rx="4" fill="#181c26" stroke="#2e3547" strokeWidth="2" />
            <rect x="24" y="16" width="22" height="22" rx="2" fill="#293042" stroke="#3e4963" />
            <rect x="27" y="19" width="16" height="16" fill="#1e2330" />
            <rect x="50" y="16" width="3" height="22" rx="1" fill="#475569" />
            <rect x="55" y="16" width="3" height="22" rx="1" fill="#475569" />
            <rect x="16" y="46" width="48" height="4" rx="1" fill="#0f1117" stroke="#c59b27" strokeWidth="1" />
            <rect x="16" y="56" width="36" height="3" rx="1" fill="#0f1117" stroke="#475569" strokeWidth="1" />
            <rect x="16" y="12" width="6" height="26" rx="1" fill="#e02477" opacity="0.8" />
          </svg>
        );
      }

      case 'ram': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="16" y="15" width="48" height="22" rx="3" fill="#242938" stroke="#3b445c" strokeWidth="1.5" />
            <rect x="18" y="16" width="44" height="5" rx="1" fill="#e02477" opacity="0.9" />
            <line x1="22" y1="37" x2="58" y2="37" stroke="#c59b27" strokeWidth="2.5" strokeDasharray="3,1" />
            <rect x="20" y="38" width="48" height="22" rx="3" fill="#1e2230" stroke="#343c52" strokeWidth="1.5" />
            <rect x="22" y="39" width="44" height="5" rx="1" fill="#06b6d4" opacity="0.9" />
            <line x1="26" y1="60" x2="62" y2="60" stroke="#c59b27" strokeWidth="2.5" strokeDasharray="3,1" />
            <text x="44" y="53" fill="#cbd5e1" fontSize="8" fontWeight="bold" textAnchor="middle">
              DDR RAM
            </text>
          </svg>
        );
      }

      case 'gpu': {
        const isNvidia =
          brandLower.includes('rtx') ||
          brandLower.includes('gtx') ||
          brandLower.includes('nvidia') ||
          brandLower.includes('zotac') ||
          brandLower.includes('galax');
        const accent = isNvidia ? '#22c55e' : '#ef4444';
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="8" y="24" width="6" height="32" rx="1" fill="#64748b" />
            <rect x="14" y="26" width="58" height="28" rx="4" fill="#1c202a" stroke="#353c4f" strokeWidth="1.5" />
            <line x1="16" y1="28" x2="70" y2="28" stroke={accent} strokeWidth="2" strokeLinecap="round" />
            <circle cx="30" cy="40" r="10" fill="#111319" stroke="#384157" />
            <circle cx="30" cy="40" r="4" fill="#e02477" opacity="0.8" />
            <circle cx="56" cy="40" r="10" fill="#111319" stroke="#384157" />
            <circle cx="56" cy="40" r="4" fill="#e02477" opacity="0.8" />
            <line x1="24" y1="54" x2="62" y2="54" stroke="#c59b27" strokeWidth="2" strokeDasharray="2,1" />
          </svg>
        );
      }

      case 'storage': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="12" y="28" width="56" height="24" rx="2" fill="#1b2433" stroke="#2d3a52" strokeWidth="1.5" />
            <line x1="12" y1="32" x2="12" y2="48" stroke="#c59b27" strokeWidth="2.5" strokeDasharray="2,1" />
            <rect x="20" y="32" width="12" height="16" rx="1" fill="#11151e" stroke="#475569" />
            <rect x="36" y="32" width="14" height="16" rx="1" fill="#11151e" stroke="#334155" />
            <rect x="52" y="32" width="14" height="16" rx="1" fill="#11151e" stroke="#334155" />
            <text x="44" y="43" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
              NVMe
            </text>
          </svg>
        );
      }

      case 'psu': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="14" y="18" width="52" height="44" rx="4" fill="#181a22" stroke="#2f3545" strokeWidth="2" />
            <circle cx="36" cy="40" r="14" fill="#101217" stroke="#3f475c" strokeWidth="1.5" />
            <circle cx="36" cy="40" r="6" fill="#252a37" />
            <rect x="54" y="24" width="8" height="12" rx="1" fill="#262c3a" />
            <rect x="54" y="42" width="8" height="6" rx="1" fill="#ef4444" opacity="0.8" />
            <rect x="18" y="22" width="12" height="8" rx="1" fill="#fbbf24" opacity="0.9" />
            <text x="24" y="28" fill="#181a22" fontSize="5" fontWeight="extrabold" textAnchor="middle">
              80+
            </text>
          </svg>
        );
      }

      case 'cabinet': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="18" y="10" width="44" height="60" rx="4" fill="#181b24" stroke="#2e3547" strokeWidth="2" />
            <rect x="22" y="14" width="30" height="42" rx="2" fill="#101218" stroke="#3d465c" strokeWidth="1" opacity="0.9" />
            <circle cx="34" cy="28" r="6" fill="#e02477" opacity="0.7" />
            <rect x="24" y="38" width="22" height="6" rx="1" fill="#06b6d4" opacity="0.7" />
            <rect x="22" y="56" width="36" height="10" rx="1" fill="#12141c" stroke="#252b3a" />
            <rect x="56" y="14" width="4" height="48" rx="1" fill="#242938" />
          </svg>
        );
      }

      case 'cooler': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="22" y="14" width="36" height="38" rx="3" fill="#242a38" stroke="#3e475e" strokeWidth="1.5" />
            {[20, 26, 32, 38, 44].map((y) => (
              <line key={y} x1="24" y1={y} x2="56" y2={y} stroke="#384157" strokeWidth="1.5" />
            ))}
            <circle cx="40" cy="33" r="14" fill="none" stroke="#e02477" strokeWidth="2.5" />
            <circle cx="40" cy="33" r="4" fill="#181b24" />
            <line x1="30" y1="52" x2="30" y2="64" stroke="#b45309" strokeWidth="3" />
            <line x1="50" y1="52" x2="50" y2="64" stroke="#b45309" strokeWidth="3" />
            <rect x="26" y="62" width="28" height="4" rx="1" fill="#cbd5e1" />
          </svg>
        );
      }

      case 'monitor': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="12" y="14" width="56" height="38" rx="3" fill="#131620" stroke="#2e3547" strokeWidth="2" />
            <rect x="15" y="17" width="50" height="32" rx="1" fill="#1c202d" />
            <path d="M 15 36 L 32 25 L 48 38 L 65 28 L 65 49 L 15 49 Z" fill="#e02477" opacity="0.4" />
            <rect x="37" y="52" width="6" height="12" fill="#3b445a" />
            <polygon points="26,68 54,68 50,64 30,64" fill="#262c3b" />
          </svg>
        );
      }

      case 'keyboard': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <rect x="10" y="24" width="60" height="32" rx="3" fill="#181b24" stroke="#2d3447" strokeWidth="1.5" />
            {[28, 36, 44].map((rowY) => (
              <g key={rowY}>
                {[14, 22, 30, 38, 46, 54, 62].map((colX) => (
                  <rect key={colX} x={colX} y={rowY} width="6" height="5" rx="1" fill="#2a3142" />
                ))}
              </g>
            ))}
            <rect x="28" y="50" width="24" height="4" rx="1" fill="#e02477" opacity="0.9" />
          </svg>
        );
      }

      case 'mouse': {
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow">
            <path
              d="M 28 32 C 28 20, 52 20, 52 32 L 52 50 C 52 62, 28 62, 28 50 Z"
              fill="#141722"
              stroke="#2d3448"
              strokeWidth="2"
            />
            <line x1="40" y1="20" x2="40" y2="35" stroke="#333b4e" strokeWidth="1.5" />
            <rect x="38" y="24" width="4" height="9" rx="1.5" fill="#e02477" />
            <path d="M 33 48 C 33 56, 47 56, 47 48" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      }

      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-magenta-400">
            <ComponentIcon category={category} className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden bg-charcoal-800/90 border border-charcoal-700/70 flex items-center justify-center p-1 group-hover:border-magenta-500/50 transition-all ${containerSize} ${className}`}
    >
      {renderIllustration()}
    </div>
  );
};

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Tag, ExternalLink, Zap, ArrowUpRight } from 'lucide-react';
import { InrPrice } from '@/components/common/InrPrice';

interface DealsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DealsModal: React.FC<DealsModalProps> = ({ isOpen, onClose }) => {
  const deals = [
    {
      title: 'AMD Ryzen 5 5600 6-Core Processor',
      category: 'CPU',
      dealPrice: 10499,
      originalPrice: 15999,
      discount: '34% OFF',
      retailer: 'MDComputers',
      url: 'https://mdcomputers.in',
      badge: 'Best Budget CPU',
    },
    {
      title: 'MSI GeForce RTX 4070 Ventus 2X 12GB',
      category: 'GPU',
      dealPrice: 53999,
      originalPrice: 59999,
      discount: '10% OFF',
      retailer: 'Vedant Computers',
      url: 'https://www.vedantcomputers.com',
      badge: '1440p Sweet Spot',
    },
    {
      title: 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz CL36',
      category: 'RAM',
      dealPrice: 8999,
      originalPrice: 11499,
      discount: '22% OFF',
      retailer: 'Amazon India',
      url: 'https://www.amazon.in',
      badge: 'AM5 Ready',
    },
    {
      title: 'Deepcool PM750D 750W 80+ Gold Certified PSU',
      category: 'PSU',
      dealPrice: 5899,
      originalPrice: 7299,
      discount: '19% OFF',
      retailer: 'PrimeABGB',
      url: 'https://www.primeabgb.com',
      badge: 'Gold Efficiency',
    },
    {
      title: 'Kingston KC3000 1TB PCIe 4.0 NVMe M.2 (7000MB/s)',
      category: 'Storage',
      dealPrice: 7499,
      originalPrice: 9999,
      discount: '25% OFF',
      retailer: 'MDComputers',
      url: 'https://mdcomputers.in',
      badge: 'Fast Gen4',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hardware Sales & Deals (India)"
      description="Curated hardware discounts tracked across verified Indian retailers."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-600/40 text-xs text-orange-200 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Prices update daily across verified Indian retailers. No affiliate markup or hidden fees.</span>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {deals.map((deal, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 flex items-center justify-between gap-4 transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-300 border border-charcoal-700">
                    {deal.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                    {deal.discount}
                  </span>
                  <span className="text-[10px] font-semibold text-charcoal-400">
                    {deal.badge}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                  {deal.title}
                </h4>
                <div className="text-xs text-charcoal-400 mt-1 flex items-center gap-2">
                  <span className="text-magenta-400 font-bold">
                    <InrPrice amount={deal.dealPrice} />
                  </span>
                  <span className="line-through text-charcoal-500">
                    <InrPrice amount={deal.originalPrice} />
                  </span>
                  <span>• via {deal.retailer}</span>
                </div>
              </div>

              <a
                href={deal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-magenta-600 hover:text-white text-charcoal-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>View Deal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

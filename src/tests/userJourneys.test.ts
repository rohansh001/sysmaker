import { describe, it, expect, beforeEach } from 'vitest';
import { checkCompatibility } from '@/engine/compatibility';
import { calculatePriceBreakdown } from '@/engine/pricing';
import { getRecommendation } from '@/engine/recommendations';
import { encodeBuildToQueryString, decodeBuildFromQueryString } from '@/engine/shareCodec';
import { LocalBuildStorage, createEmptyBuild } from '@/storage/localStorage';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { Build, BuildComponents, Component } from '@/types';

// Mock browser localStorage for Node testing environment
const mockStorage: Record<string, string> = {};
beforeEach(() => {
  for (const k in mockStorage) delete mockStorage[k];
  (global as any).window = {
    localStorage: {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        for (const k in mockStorage) delete mockStorage[k];
      },
    },
    btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
    atob: (b64: string) => Buffer.from(b64, 'base64').toString('binary'),
  };
});

function getPart(id: string): Component {
  const p = COMPONENT_CATALOG.find((c) => c.id === id);
  if (!p) throw new Error(`Part not found: ${id}`);
  return p;
}

describe('End-to-End User Journeys', () => {
  it('Journey 1: Custom build assembly and price calculation', () => {
    // User starts with empty build
    let build = createEmptyBuild('My First PC');
    expect(build.name).toBe('My First PC');
    expect(Object.keys(build.components)).toHaveLength(0);

    // Initial compatibility report: incomplete
    let report = checkCompatibility(build.components);
    expect(report.status).toBe('incomplete');
    expect(report.coreComplete).toBe(false);

    // User selects AMD Ryzen 5 5600
    build.components.cpu = getPart('cpu-amd-5600');
    // CPU requires GPU since no iGPU
    report = checkCompatibility(build.components);
    expect(report.missingCoreComponents).toContain('gpu');

    // User selects compatible motherboard and RAM
    build.components.motherboard = getPart('mb-msi-b550m-vdh');
    build.components.ram = getPart('ram-gskill-ripjaws-16gb-ddr4');
    build.components.gpu = getPart('gpu-asrock-rx6600');
    build.components.storage = getPart('storage-wd-blue-sn580-1tb');
    build.components.psu = getPart('psu-cooler-master-mwe-550');
    build.components.cabinet = getPart('cab-galax-revolution-05');

    // All core components selected
    report = checkCompatibility(build.components);
    expect(report.isCompatible).toBe(true);
    expect(report.status).toBe('compatible');
    expect(report.coreComplete).toBe(true);

    // Verify price
    const pricing = calculatePriceBreakdown(build.components);
    expect(pricing.grandTotalINR).toBe(
      10499 + 8999 + 2999 + 18999 + 5699 + 3799 + 3299
    );
    expect(pricing.componentCount).toBe(7);
  });

  it('Journey 2: Incompatible CPU / Motherboard combination triggers error', () => {
    const buildComponents: BuildComponents = {
      cpu: getPart('cpu-intel-13600k'), // LGA1700
      motherboard: getPart('mb-msi-b550m-vdh'), // AM4
    };

    const report = checkCompatibility(buildComponents);
    expect(report.isCompatible).toBe(false);
    expect(report.status).toBe('incompatible');
    const socketMismatch = report.issues.find((i) => i.id === 'cpu-mb-socket-mismatch');
    expect(socketMismatch).toBeDefined();
    expect(socketMismatch?.message).toContain('AM4');
    expect(socketMismatch?.message).toContain('LGA1700');
  });

  it('Journey 3: Unknown compatibility state when specs are incomplete', () => {
    const mysteryRam: Component = {
      id: 'ram-custom-unverified',
      category: 'ram',
      brand: 'CustomBrand',
      name: 'Generic RAM Stick',
      priceINR: 2000,
      specifications: {}, // missing type (DDR4/DDR5)
      dataSource: 'demo',
    };

    const report = checkCompatibility({
      motherboard: getPart('mb-msi-b550m-vdh'),
      ram: mysteryRam,
    });

    expect(report.isCompatible).toBe(false);
    expect(report.issues.some((i) => i.isUnknown)).toBe(true);
    expect(report.status).toBe('unknown');
  });

  it('Journey 4: Save build, reload, rename, and persist to LocalStorage', () => {
    const build: Build = {
      id: 'build-delhi-1',
      name: 'Delhi Esports Battlestation',
      components: {
        cpu: getPart('cpu-amd-5600g'),
        motherboard: getPart('mb-msi-b550m-vdh'),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save active build
    LocalBuildStorage.saveActiveBuild(build);
    const activeReloaded = LocalBuildStorage.getActiveBuild();
    expect(activeReloaded.name).toBe('Delhi Esports Battlestation');
    expect(activeReloaded.components.cpu?.id).toBe('cpu-amd-5600g');

    // Save to list
    LocalBuildStorage.saveBuildToSavedList(build);
    let savedList = LocalBuildStorage.getSavedBuilds();
    expect(savedList).toHaveLength(1);

    // Rename
    LocalBuildStorage.renameSavedBuild('build-delhi-1', 'Renamed Beast');
    savedList = LocalBuildStorage.getSavedBuilds();
    expect(savedList[0].name).toBe('Renamed Beast');

    // Delete
    LocalBuildStorage.deleteSavedBuild('build-delhi-1');
    expect(LocalBuildStorage.getSavedBuilds()).toHaveLength(0);
  });

  it('Journey 5: Share URL encoding and strict validation decoding', () => {
    const originalBuild: Build = {
      id: 'test-share-1',
      name: 'Bangalore Dev Rig',
      components: {
        cpu: getPart('cpu-amd-7600'),
        motherboard: getPart('mb-msi-b650m-gaming-wifi'),
        ram: getPart('ram-corsair-vengeance-32gb-ddr5'),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const shareString = encodeBuildToQueryString(originalBuild);
    expect(typeof shareString).toBe('string');
    expect(shareString.length).toBeGreaterThan(0);

    const decoded = decodeBuildFromQueryString(shareString);
    expect(decoded.isValid).toBe(true);
    expect(decoded.name).toBe('Bangalore Dev Rig');
    expect(decoded.components.cpu?.id).toBe('cpu-amd-7600');
    expect(decoded.components.motherboard?.id).toBe('mb-msi-b650m-gaming-wifi');
    expect(decoded.components.ram?.id).toBe('ram-corsair-vengeance-32gb-ddr5');
  });

  it('Journey 6: Budget recommendation rules', () => {
    const under20k = getRecommendation('under-20k', 'study-office');
    expect(under20k.preset).toBeDefined();
    expect(under20k.totalCostINR).toBeLessThanOrEqual(20000);
    expect(under20k.report.isCompatible).toBe(true);

    const midTier = getRecommendation('50k-75k', 'gaming');
    expect(midTier.preset).toBeDefined();
    expect(midTier.totalCostINR).toBeGreaterThanOrEqual(50000);
    expect(midTier.totalCostINR).toBeLessThanOrEqual(75000);
    expect(midTier.report.isCompatible).toBe(true);
  });
});

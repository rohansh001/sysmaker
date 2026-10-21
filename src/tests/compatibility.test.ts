import { describe, it, expect } from 'vitest';
import { checkCompatibility } from '@/engine/compatibility';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { BuildComponents, Component } from '@/types';

function getComp(id: string): Component {
  const found = COMPONENT_CATALOG.find((c) => c.id === id);
  if (!found) throw new Error(`Component with ID ${id} not found in catalog`);
  return found;
}

describe('Hardware Compatibility Engine', () => {
  it('correctly verifies a 100% compatible budget gaming PC (AM4)', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-amd-5600'),
      motherboard: getComp('mb-msi-b550m-vdh'),
      ram: getComp('ram-gskill-ripjaws-16gb-ddr4'),
      gpu: getComp('gpu-asrock-rx6600'),
      storage: getComp('storage-wd-blue-sn580-1tb'),
      psu: getComp('psu-cooler-master-mwe-550'),
      cabinet: getComp('cab-galax-revolution-05'),
    };

    const report = checkCompatibility(build);
    expect(report.isCompatible).toBe(true);
    expect(report.status).toBe('compatible');
    const errors = report.issues.filter((i) => i.severity === 'error');
    expect(errors).toHaveLength(0);
    expect(report.missingCoreComponents).toHaveLength(0);
  });

  it('detects CPU and Motherboard socket mismatch (LGA1700 CPU on AM4 Board)', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-intel-12400f'), // LGA1700
      motherboard: getComp('mb-msi-b550m-vdh'), // AM4
    };

    const report = checkCompatibility(build);
    expect(report.isCompatible).toBe(false);
    expect(report.status).toBe('incompatible');
    const socketError = report.issues.find((i) => i.id === 'cpu-mb-socket-mismatch');
    expect(socketError).toBeDefined();
    expect(socketError?.severity).toBe('error');
  });

  it('detects RAM memory type mismatch (DDR5 RAM on DDR4 Motherboard)', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-amd-5600'),
      motherboard: getComp('mb-msi-b550m-vdh'), // DDR4
      ram: getComp('ram-crucial-16gb-ddr5'), // DDR5
    };

    const report = checkCompatibility(build);
    const ramError = report.issues.find((i) => i.id === 'ram-mb-type-mismatch');
    expect(ramError).toBeDefined();
    expect(ramError?.severity).toBe('error');
  });

  it('flags missing GPU when CPU lacks integrated graphics', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-amd-5600'), // No iGPU
      motherboard: getComp('mb-msi-b550m-vdh'),
      ram: getComp('ram-gskill-ripjaws-16gb-ddr4'),
      storage: getComp('storage-wd-blue-sn580-1tb'),
      psu: getComp('psu-cooler-master-mwe-550'),
      cabinet: getComp('cab-galax-revolution-05'),
    };

    const report = checkCompatibility(build);
    expect(report.isCompatible).toBe(false);
    const gpuError = report.issues.find((i) => i.id === 'gpu-required-missing');
    expect(gpuError).toBeDefined();
    expect(report.missingCoreComponents).toContain('gpu');
  });

  it('permits system without dedicated GPU if CPU has integrated graphics', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-amd-5600g'), // Vega 7 iGPU
      motherboard: getComp('mb-msi-b550m-vdh'),
      ram: getComp('ram-gskill-ripjaws-16gb-ddr4'),
      storage: getComp('storage-wd-blue-sn580-1tb'),
      psu: getComp('psu-cooler-master-mwe-550'),
      cabinet: getComp('cab-galax-revolution-05'),
    };

    const report = checkCompatibility(build);
    const gpuError = report.issues.find((i) => i.id === 'gpu-required-missing');
    expect(gpuError).toBeUndefined();
    expect(report.missingCoreComponents).not.toContain('gpu');
    expect(report.isCompatible).toBe(true);
  });

  it('flags dedicated cooler requirement if CPU does not include stock cooler', () => {
    const build: BuildComponents = {
      cpu: getComp('cpu-amd-7800x3d'), // No stock cooler
      motherboard: getComp('mb-msi-mag-b650-tomahawk'),
    };

    const report = checkCompatibility(build);
    const coolerError = report.issues.find((i) => i.id === 'cpu-missing-cooler');
    expect(coolerError).toBeDefined();
    expect(coolerError?.severity).toBe('error');
  });

  it('flags Motherboard form factor mismatch with Cabinet (ATX board in Micro-ATX case)', () => {
    const build: BuildComponents = {
      motherboard: getComp('mb-msi-mag-b650-tomahawk'), // ATX
      cabinet: getComp('cab-ant-esports-ice-100'), // Micro-ATX & Mini-ITX only
    };

    const report = checkCompatibility(build);
    const formError = report.issues.find((i) => i.id === 'mb-cab-formfactor-mismatch');
    expect(formError).toBeDefined();
    expect(formError?.severity).toBe('error');
  });

  it('flags physical clearance collision when GPU is too long for Cabinet', () => {
    const customLongGpu: Component = {
      ...getComp('gpu-gigabyte-rtx4080-super'),
      specifications: {
        ...getComp('gpu-gigabyte-rtx4080-super').specifications,
        lengthMm: 350,
      },
    };
    const smallCabinet: Component = {
      ...getComp('cab-ant-esports-ice-100'),
      specifications: {
        ...getComp('cab-ant-esports-ice-100').specifications,
        maxGpuLengthMm: 310,
      },
    };

    const report = checkCompatibility({
      gpu: customLongGpu,
      cabinet: smallCabinet,
    });

    const lengthError = report.issues.find((i) => i.id === 'gpu-cab-length-exceeded');
    expect(lengthError).toBeDefined();
    expect(lengthError?.severity).toBe('error');
  });

  it('produces unknown status instead of false pass when specs are missing', () => {
    const unknownCpu: Component = {
      id: 'cpu-mystery',
      category: 'cpu',
      brand: 'MysteryBrand',
      name: 'Experimental CPU',
      priceINR: 10000,
      specifications: {}, // Missing socket and iGPU specs
      dataSource: 'demo',
    };

    const build: BuildComponents = {
      cpu: unknownCpu,
      motherboard: getComp('mb-msi-b550m-vdh'),
    };

    const report = checkCompatibility(build);
    expect(report.isCompatible).toBe(false);
    expect(report.issues.some((i) => i.isUnknown)).toBe(true);
    expect(report.issues.some((i) => i.id === 'cpu-mb-socket-unknown')).toBe(true);
  });

  it('calculates wattage and detects insufficient PSU wattage', () => {
    const hungryBuild: BuildComponents = {
      cpu: getComp('cpu-intel-13600k'), // 125W
      gpu: getComp('gpu-gigabyte-rtx4080-super'), // 320W
      psu: getComp('psu-ant-vs450l'), // 450W
    };

    const report = checkCompatibility(hungryBuild);
    // 60W base + 125W CPU + 320W GPU = 505W > 450W PSU
    expect(report.estimatedWattage).toBeGreaterThan(450);
    const psuError = report.issues.find((i) => i.id === 'psu-wattage-insufficient');
    expect(psuError).toBeDefined();
    expect(psuError?.severity).toBe('error');
  });
});

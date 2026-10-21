import { describe, it, expect } from 'vitest';
import {
  encodeBuildToQueryString,
  decodeBuildFromQueryString,
  validateImportedBuildJson,
} from '@/engine/shareCodec';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { BuildComponents } from '@/types';

function getComp(id: string) {
  const c = COMPONENT_CATALOG.find((x) => x.id === id);
  if (!c) throw new Error(`Not found ${id}`);
  return c;
}

describe('Share Codec and Import Validation', () => {
  it('encodes and decodes build roundtrip successfully', () => {
    const components: BuildComponents = {
      cpu: getComp('cpu-amd-5600'),
      gpu: getComp('gpu-asrock-rx6600'),
    };

    const encoded = encodeBuildToQueryString({
      name: 'Delhi Budget Rig',
      components,
    });

    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(10);

    const decoded = decodeBuildFromQueryString(encoded);
    expect(decoded.isValid).toBe(true);
    expect(decoded.name).toBe('Delhi Budget Rig');
    expect(decoded.components.cpu?.id).toBe('cpu-amd-5600');
    expect(decoded.components.gpu?.id).toBe('gpu-asrock-rx6600');
    expect(decoded.warnings).toHaveLength(0);
  });

  it('rejects invalid or unknown component IDs gracefully without crashing', () => {
    // Inject fake component ID into payload
    const fakePayload = {
      n: 'Hacked Rig',
      p: 'cpu:cpu-nonexistent-999;gpu:gpu-asrock-rx6600',
    };
    const encoded = Buffer.from(encodeURIComponent(JSON.stringify(fakePayload))).toString('base64');

    const decoded = decodeBuildFromQueryString(encoded);
    expect(decoded.isValid).toBe(true); // GPU was valid
    expect(decoded.components.cpu).toBeUndefined(); // non-existent cpu dropped
    expect(decoded.components.gpu?.id).toBe('gpu-asrock-rx6600');
    expect(decoded.warnings.some((w) => w.includes('cpu-nonexistent-999'))).toBe(true);
  });

  it('validates uploaded JSON build files', () => {
    const validJson = {
      name: 'Mumbai Creator Rig',
      components: {
        cpu: { id: 'cpu-intel-12400f' },
      },
    };

    const validResult = validateImportedBuildJson(validJson);
    expect(validResult.isValid).toBe(true);
    expect(validResult.build?.name).toBe('Mumbai Creator Rig');
    expect(validResult.build?.components.cpu?.id).toBe('cpu-intel-12400f');

    const invalidResult = validateImportedBuildJson({ invalidKey: 123 });
    expect(invalidResult.isValid).toBe(false);
  });
});

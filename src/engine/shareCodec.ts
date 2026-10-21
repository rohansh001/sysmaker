import { Build, BuildComponents, ComponentCategory } from '@/types';
import { COMPONENT_CATALOG } from '@/data/catalog';

export interface DecodedShareData {
  name: string;
  components: BuildComponents;
  isValid: boolean;
  warnings: string[];
}

/**
 * Encodes a build configuration into a clean URL-friendly share string.
 * Example: "cpu:cpu-amd-5600|gpu:gpu-asrock-rx6600"
 */
export function encodeBuildToQueryString(build: Build | { name: string; components: BuildComponents }): string {
  const pairs: string[] = [];
  for (const [category, comp] of Object.entries(build.components)) {
    if (comp?.id) {
      pairs.push(`${category}:${comp.id}`);
    }
  }

  const payload = {
    n: build.name || 'Custom PC Build',
    p: pairs.join(';'),
  };

  try {
    const jsonStr = JSON.stringify(payload);
    // Safe Base64 encoding for browsers and Node
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return window.btoa(encodeURIComponent(jsonStr));
    }
    return Buffer.from(encodeURIComponent(jsonStr)).toString('base64');
  } catch (err) {
    return '';
  }
}

/**
 * Decodes and strictly validates a shared build configuration string.
 * Ensures all component IDs exist in the verified local catalog.
 */
export function decodeBuildFromQueryString(encoded: string): DecodedShareData {
  const result: DecodedShareData = {
    name: 'Shared Build',
    components: {},
    isValid: false,
    warnings: [],
  };

  if (!encoded || typeof encoded !== 'string') {
    result.warnings.push('No encoded build string provided.');
    return result;
  }

  try {
    let jsonStr: string;
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      jsonStr = decodeURIComponent(window.atob(encoded));
    } else {
      jsonStr = decodeURIComponent(Buffer.from(encoded, 'base64').toString('utf8'));
    }

    const payload = JSON.parse(jsonStr);
    if (!payload || typeof payload !== 'object') {
      result.warnings.push('Malformed payload structure.');
      return result;
    }

    if (payload.n && typeof payload.n === 'string') {
      result.name = payload.n.slice(0, 100); // sanitize length
    }

    if (typeof payload.p === 'string') {
      const entries = payload.p.split(';').filter(Boolean);
      for (const entry of entries) {
        const [category, compId] = entry.split(':');
        if (!category || !compId) continue;

        // Verify against catalog
        const match = COMPONENT_CATALOG.find((c) => c.id === compId);
        if (match) {
          result.components[category as ComponentCategory] = match;
        } else {
          result.warnings.push(`Component ID "${compId}" was not found in the local catalog and was skipped.`);
        }
      }
    }

    result.isValid = Object.keys(result.components).length > 0;
    return result;
  } catch (err) {
    result.warnings.push('Failed to parse build configuration. Corrupted or invalid string.');
    return result;
  }
}

/**
 * Validates an imported JSON build file.
 */
export function validateImportedBuildJson(jsonData: unknown): {
  isValid: boolean;
  build: Build | null;
  error?: string;
} {
  try {
    if (!jsonData || typeof jsonData !== 'object') {
      return { isValid: false, build: null, error: 'Uploaded file is not a valid JSON object.' };
    }

    const obj = jsonData as any;
    const components: BuildComponents = {};

    if (!obj.components || typeof obj.components !== 'object') {
      return { isValid: false, build: null, error: 'JSON does not contain a components map.' };
    }

    for (const [cat, comp] of Object.entries(obj.components)) {
      if (comp && typeof comp === 'object' && (comp as any).id) {
        const found = COMPONENT_CATALOG.find((c) => c.id === (comp as any).id);
        if (found) {
          components[cat as ComponentCategory] = found;
        }
      }
    }

    if (Object.keys(components).length === 0) {
      return {
        isValid: false,
        build: null,
        error: 'No recognized components from the System Maker Core catalog were found in the uploaded file.',
      };
    }

    const build: Build = {
      id: typeof obj.id === 'string' ? obj.id : `imported-${Date.now()}`,
      name: typeof obj.name === 'string' ? obj.name : 'Imported PC Build',
      components,
      createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      includePeripheralsInBudget: Boolean(obj.includePeripheralsInBudget),
      notes: typeof obj.notes === 'string' ? obj.notes : undefined,
    };

    return { isValid: true, build };
  } catch (err: any) {
    return { isValid: false, build: null, error: err.message || 'Validation error.' };
  }
}

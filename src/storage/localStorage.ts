import { Build, BuildComponents, ComponentCategory } from '@/types';
import { COMPONENT_CATALOG } from '@/data/catalog';

const STORAGE_KEYS = {
  ACTIVE_BUILD: 'pc_dost_active_build_v1',
  SAVED_BUILDS: 'pc_dost_saved_builds_v1',
  PREFERENCES: 'pc_dost_preferences_v1',
  COMPARE_IDS: 'pc_dost_compare_ids_v1',
};

export interface UserPreferences {
  budgetCapINR?: number;
  includePeripheralsInBudget: boolean;
  enableTaxEstimate: boolean;
  enableShippingEstimate: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  budgetCapINR: 0,
  includePeripheralsInBudget: false,
  enableTaxEstimate: false,
  enableShippingEstimate: false,
};

export function createEmptyBuild(name = 'My Custom PC'): Build {
  return {
    id: `build-${Date.now()}`,
    name,
    components: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    includePeripheralsInBudget: false,
  };
}

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Re-hydrates raw stored component IDs from the verified catalog.
 */
function hydrateBuild(raw: any): Build {
  if (!raw || typeof raw !== 'object') {
    return createEmptyBuild();
  }

  const hydratedComponents: BuildComponents = {};
  if (raw.components && typeof raw.components === 'object') {
    for (const [cat, comp] of Object.entries(raw.components)) {
      if (comp && typeof comp === 'object' && (comp as any).id) {
        const found = COMPONENT_CATALOG.find((c) => c.id === (comp as any).id);
        if (found) {
          hydratedComponents[cat as ComponentCategory] = found;
        }
      }
    }
  }

  return {
    id: raw.id || `build-${Date.now()}`,
    name: raw.name || 'My Custom PC',
    components: hydratedComponents,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    includePeripheralsInBudget: Boolean(raw.includePeripheralsInBudget),
    notes: raw.notes,
  };
}

export const LocalBuildStorage = {
  getActiveBuild(): Build {
    if (!isClient()) return createEmptyBuild();
    try {
      const item = window.localStorage.getItem(STORAGE_KEYS.ACTIVE_BUILD);
      if (!item) return createEmptyBuild();
      return hydrateBuild(JSON.parse(item));
    } catch {
      return createEmptyBuild();
    }
  },

  saveActiveBuild(build: Build): void {
    if (!isClient()) return;
    try {
      const serialized = {
        ...build,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(STORAGE_KEYS.ACTIVE_BUILD, JSON.stringify(serialized));
    } catch (err) {
      console.error('Failed to save active build to localStorage', err);
    }
  },

  clearActiveBuild(): void {
    if (!isClient()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_BUILD);
    } catch (err) {
      console.error('Failed to clear active build', err);
    }
  },

  getSavedBuilds(): Build[] {
    if (!isClient()) return [];
    try {
      const item = window.localStorage.getItem(STORAGE_KEYS.SAVED_BUILDS);
      if (!item) return [];
      const list = JSON.parse(item);
      if (!Array.isArray(list)) return [];
      return list.map(hydrateBuild);
    } catch {
      return [];
    }
  },

  saveBuildToSavedList(build: Build): void {
    if (!isClient()) return;
    try {
      const existing = this.getSavedBuilds();
      const index = existing.findIndex((b) => b.id === build.id);
      const updatedBuild = {
        ...build,
        updatedAt: new Date().toISOString(),
      };

      if (index >= 0) {
        existing[index] = updatedBuild;
      } else {
        existing.unshift(updatedBuild);
      }

      window.localStorage.setItem(STORAGE_KEYS.SAVED_BUILDS, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to save build to list', err);
    }
  },

  deleteSavedBuild(id: string): void {
    if (!isClient()) return;
    try {
      const existing = this.getSavedBuilds().filter((b) => b.id !== id);
      window.localStorage.setItem(STORAGE_KEYS.SAVED_BUILDS, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to delete build', err);
    }
  },

  renameSavedBuild(id: string, newName: string): void {
    if (!isClient()) return;
    try {
      const existing = this.getSavedBuilds();
      const found = existing.find((b) => b.id === id);
      if (found) {
        found.name = newName;
        found.updatedAt = new Date().toISOString();
        window.localStorage.setItem(STORAGE_KEYS.SAVED_BUILDS, JSON.stringify(existing));
      }
    } catch (err) {
      console.error('Failed to rename build', err);
    }
  },

  getPreferences(): UserPreferences {
    if (!isClient()) return DEFAULT_PREFERENCES;
    try {
      const item = window.localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!item) return DEFAULT_PREFERENCES;
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(item) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs: Partial<UserPreferences>): void {
    if (!isClient()) return;
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      window.localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  },

  getCompareIds(): string[] {
    if (!isClient()) return [];
    try {
      const item = window.localStorage.getItem(STORAGE_KEYS.COMPARE_IDS);
      if (!item) return [];
      const parsed = JSON.parse(item);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveCompareIds(ids: string[]): void {
    if (!isClient()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.COMPARE_IDS, JSON.stringify(ids.slice(0, 3)));
    } catch (err) {
      console.error('Failed to save compare ids', err);
    }
  },
};

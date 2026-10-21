import { Build, Component, ComponentCategory } from '@/types';
import { COMPONENT_CATALOG } from '@/data/catalog';
import { LocalBuildStorage, UserPreferences } from './localStorage';

export interface ComponentFilterOptions {
  category?: ComponentCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
}

/**
 * Clean data-access layer interface for PC parts.
 * Allows effortless swap with Postgres/Prisma/REST backend in future.
 */
export interface IComponentRepository {
  getAll(): Promise<Component[]>;
  getById(id: string): Promise<Component | null>;
  getByCategory(category: ComponentCategory): Promise<Component[]>;
  filter(options: ComponentFilterOptions): Promise<Component[]>;
  getAllBrands(): Promise<string[]>;
}

export interface IBuildRepository {
  getActiveBuild(): Promise<Build>;
  saveActiveBuild(build: Build): Promise<void>;
  clearActiveBuild(): Promise<void>;
  getSavedBuilds(): Promise<Build[]>;
  saveBuild(build: Build): Promise<void>;
  deleteBuild(id: string): Promise<void>;
  renameBuild(id: string, name: string): Promise<void>;
  getPreferences(): Promise<UserPreferences>;
  savePreferences(prefs: Partial<UserPreferences>): Promise<void>;
}

class CatalogRepositoryImpl implements IComponentRepository {
  async getAll(): Promise<Component[]> {
    return [...COMPONENT_CATALOG];
  }

  async getById(id: string): Promise<Component | null> {
    const found = COMPONENT_CATALOG.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  async getByCategory(category: ComponentCategory): Promise<Component[]> {
    return COMPONENT_CATALOG.filter((c) => c.category === category);
  }

  async getAllBrands(): Promise<string[]> {
    const brands = new Set<string>();
    COMPONENT_CATALOG.forEach((c) => brands.add(c.brand));
    return Array.from(brands).sort();
  }

  async filter(options: ComponentFilterOptions): Promise<Component[]> {
    let results = [...COMPONENT_CATALOG];

    if (options.category) {
      results = results.filter((c) => c.category === options.category);
    }

    if (options.brand) {
      results = results.filter(
        (c) => c.brand.toLowerCase() === options.brand!.toLowerCase()
      );
    }

    if (options.minPrice !== undefined) {
      results = results.filter((c) => c.priceINR >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      results = results.filter((c) => c.priceINR <= options.maxPrice!);
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (options.sortBy) {
      switch (options.sortBy) {
        case 'price-asc':
          results.sort((a, b) => a.priceINR - b.priceINR);
          break;
        case 'price-desc':
          results.sort((a, b) => b.priceINR - a.priceINR);
          break;
        case 'name-asc':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          results.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }

    return results;
  }
}

class LocalStorageBuildRepositoryImpl implements IBuildRepository {
  async getActiveBuild(): Promise<Build> {
    return LocalBuildStorage.getActiveBuild();
  }

  async saveActiveBuild(build: Build): Promise<void> {
    LocalBuildStorage.saveActiveBuild(build);
  }

  async clearActiveBuild(): Promise<void> {
    LocalBuildStorage.clearActiveBuild();
  }

  async getSavedBuilds(): Promise<Build[]> {
    return LocalBuildStorage.getSavedBuilds();
  }

  async saveBuild(build: Build): Promise<void> {
    LocalBuildStorage.saveBuildToSavedList(build);
  }

  async deleteBuild(id: string): Promise<void> {
    LocalBuildStorage.deleteSavedBuild(id);
  }

  async renameBuild(id: string, name: string): Promise<void> {
    LocalBuildStorage.renameSavedBuild(id, name);
  }

  async getPreferences(): Promise<UserPreferences> {
    return LocalBuildStorage.getPreferences();
  }

  async savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    LocalBuildStorage.savePreferences(prefs);
  }
}

export const ComponentRepository: IComponentRepository = new CatalogRepositoryImpl();
export const BuildRepository: IBuildRepository = new LocalStorageBuildRepositoryImpl();

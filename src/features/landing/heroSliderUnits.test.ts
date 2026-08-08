import { describe, expect, it } from 'vitest';
import { resolveHeroSliderUnits } from './heroSliderUnits';

describe('resolveHeroSliderUnits', () => {
  const homepage = [{ id: 'homepage' }];
  const catalog = [{ id: 'catalog' }];
  const featured = [{ id: 'featured' }];

  it('memakai unit dari agregat homepage bila tersedia', () => {
    expect(resolveHeroSliderUnits(homepage, catalog, featured)).toBe(homepage);
  });

  it('memakai endpoint katalog publik untuk kompatibilitas backend lama', () => {
    expect(resolveHeroSliderUnits(undefined, catalog, featured)).toBe(catalog);
    expect(resolveHeroSliderUnits([], catalog, featured)).toBe(catalog);
  });

  it('memakai unit unggulan sebagai fallback terakhir', () => {
    expect(resolveHeroSliderUnits(undefined, [], featured)).toBe(featured);
  });
});

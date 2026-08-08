import { describe, expect, it } from 'vitest';
import { resolveHeroSliderUnits } from './heroSliderUnits';

describe('resolveHeroSliderUnits', () => {
  const homepage = [{ id: 'homepage' }];
  const catalog = [{ id: 'catalog' }];
  const featured = [{ id: 'featured' }];

  it('menggabungkan agregat homepage dan fallback katalog', () => {
    expect(resolveHeroSliderUnits(homepage, catalog, featured)).toEqual([...homepage, ...catalog]);
  });

  it('menghapus duplikat unit dari dua sumber berdasarkan id', () => {
    expect(resolveHeroSliderUnits(homepage, [{ id: 'homepage' }, ...catalog], featured)).toEqual([...homepage, ...catalog]);
  });

  it('memakai endpoint katalog publik untuk kompatibilitas backend lama', () => {
    expect(resolveHeroSliderUnits(undefined, catalog, featured)).toEqual(catalog);
    expect(resolveHeroSliderUnits([], catalog, featured)).toEqual(catalog);
  });

  it('memakai unit unggulan sebagai fallback terakhir', () => {
    expect(resolveHeroSliderUnits(undefined, [], featured)).toBe(featured);
  });
});

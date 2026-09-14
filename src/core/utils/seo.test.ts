import { describe, it, expect, beforeEach } from 'vitest';
import {
  updateSeoMetadata,
  buildAutoDealerSchema,
  buildCarSchema,
  buildFaqSchema,
} from './seo';
import type { CatalogDetail } from '@/features/landing/public.types';

describe('seo utility', () => {
  beforeEach(() => {
    document.title = 'Default Title';
    const oldScript = document.getElementById('seo-json-ld');
    if (oldScript) oldScript.remove();
  });

  it('updates document title, description, and open graph tags', () => {
    updateSeoMetadata({
      title: 'Mobil Bekas Subang Murah | GM Mobilindo',
      description: 'Showroom mobil bekas terpercaya di Subang.',
      ogImage: 'https://gmmobilindo.com/images/avanza.jpg',
      keywords: ['mobil bekas subang', 'avanza subang'],
    });

    expect(document.title).toBe('Mobil Bekas Subang Murah | GM Mobilindo');

    const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(descMeta?.content).toBe('Showroom mobil bekas terpercaya di Subang.');

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    expect(ogTitle?.content).toBe('Mobil Bekas Subang Murah | GM Mobilindo');

    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
    expect(ogImage?.content).toBe('https://gmmobilindo.com/images/avanza.jpg');

    const keywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    expect(keywords?.content).toBe('mobil bekas subang, avanza subang');
  });

  it('generates valid AutoDealer schema', () => {
    const schema = buildAutoDealerSchema({
      companyName: 'GM Mobilindo Subang',
      address: 'Jl. Otomotif No. 10 Subang',
      phone: '08123456789',
    });

    expect(schema['@type']).toBe('AutoDealer');
    expect(schema.name).toBe('GM Mobilindo Subang');
    expect(schema.areaServed).toContain('Subang');
  });

  it('generates valid Car schema', () => {
    const mockUnit: CatalogDetail = {
      id: 'unit-1',
      name: 'Toyota Avanza 1.3 G',
      code: 'AVZ-01',
      tahun: 2021,
      harga: 175000000,
      kilometer: 35000,
      transmisi: 'MT',
      bahanBakar: 'BENSIN',
      warna: 'Putih',
      description: 'Kondisi istimewa, tangan pertama.',
      statusUnit: 'READY_STOCK',
      statusKatalog: 'READY',
      plat: 'D 1234 ABC',
      plate: 'D 1234 ABC',
      variant: 'G',
      brand: 'Toyota',
      model: 'Avanza',
      year: 2021,
      price: 175000000,
      km: 35000,
      transmission: 'MT',
      fuel: 'BENSIN',
      color: 'Putih',
      status: 'ready',
      isNew: false,
      image: null,
      createdAt: '2026-01-01',
      merek: { id: 'm-1', name: 'Toyota' },
      tipe: { id: 't-1', name: 'Avanza' },
      images: [],
      perlengkapan: [],
      dokumen: [],
    };

    const schema = buildCarSchema(mockUnit, 'https://gmmobilindo.com/media/avanza.jpg');

    expect(schema['@type']).toBe('Car');
    expect(schema.name).toBe('Toyota Avanza 1.3 G');
    expect((schema.offers as Record<string, unknown>).price).toBe(175000000);
    expect((schema.offers as Record<string, unknown>).availability).toBe('https://schema.org/InStock');
  });

  it('generates valid FAQPage schema', () => {
    const schema = buildFaqSchema([
      { question: 'Apakah ada garansi?', answer: 'Ya, garansi mesin 1 bulan.' },
    ]);

    expect(schema['@type']).toBe('FAQPage');
    const questions = schema.mainEntity as Array<{ name: string }>;
    expect(questions[0].name).toBe('Apakah ada garansi?');
  });
});

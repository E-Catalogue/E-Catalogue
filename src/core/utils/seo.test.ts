import { describe, it, expect, beforeEach } from 'vitest';
import {
  updateSeoMetadata,
  buildAutoDealerSchema,
  buildCarSchema,
  buildFaqSchema,
  buildWebSiteSchema,
  canonicalUrlFor,
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

  it('canonical dan og:image selalu memakai domain kanonis tanpa query', () => {
    window.history.pushState({}, '', '/katalog/?merek=toyota');
    updateSeoMetadata({ title: 'Katalog', ogImage: '/logo.jpeg' });

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical.getAttribute('href')).toBe('https://gmmobilindo.com/katalog');
    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
    expect(ogImage.content).toBe('https://gmmobilindo.com/logo.jpeg');
    expect(canonicalUrlFor('/')).toBe('https://gmmobilindo.com/');
  });

  it('menghapus JSON-LD halaman sebelumnya bila halaman baru tidak punya', () => {
    updateSeoMetadata({ jsonLd: { '@type': 'FAQPage' } });
    expect(document.getElementById('seo-json-ld')).not.toBeNull();
    updateSeoMetadata({ title: 'Tentang' });
    expect(document.getElementById('seo-json-ld')).toBeNull();
  });

  it('AutoDealer memakai NAP dari CMS dan tidak memakai placeholder', () => {
    const schema = buildAutoDealerSchema({
      companyName: 'GM Mobilindo',
      address: 'Belum diatur',
      phone: null,
      whatsappNumber: '6281221642114',
      operatingHours: [
        { day: 'MONDAY', isOpen: true, openTime: '08:00', closeTime: '17:00' },
        { day: 'SUNDAY', isOpen: false, openTime: null, closeTime: null },
      ],
      social: { instagram: 'https://instagram.com/gm_mobilindo', facebook: null, tiktok: null, website: null },
    } as never);

    expect(schema.telephone).toBe('+6281221642114');
    expect((schema.address as Record<string, unknown>).streetAddress).toBeUndefined();
    expect(schema.openingHoursSpecification).toEqual([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '08:00', closes: '17:00' },
    ]);
    expect(schema.sameAs).toEqual(['https://instagram.com/gm_mobilindo']);
    expect(schema.url).toBe('https://gmmobilindo.com');

    const noPhone = buildAutoDealerSchema({ companyName: 'GM Mobilindo' });
    expect(noPhone.telephone).toBeUndefined();
  });

  it('WebSite schema merujuk ke AutoDealer sebagai publisher', () => {
    const schema = buildWebSiteSchema({ companyName: 'GM Mobilindo' });
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('GM Mobilindo');
    expect(schema.url).toBe('https://gmmobilindo.com/');
    expect(schema.publisher).toEqual({ '@id': 'https://gmmobilindo.com/#showroom' });
  });
});

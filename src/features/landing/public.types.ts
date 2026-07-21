// Tipe response endpoint publik (website customer). Acuan: docs/frontend/cms_module_prd.md.
import type {
  SiteSettings, HomepageHero, HomepageBrands, HomepageWhyUs, HomepageHowItWorks,
  HomepageFeatured, HomepageTestimonialsHeader, HomepageCta,
  AboutHero, AboutStats, AboutVisiMisi, AboutValues, AboutCta,
  CreditSimConfig,
} from '@/features/cms/cms.types';

export type { SiteSettings, CreditSimConfig };

export type PublicTransmisi = 'AT' | 'MT' | 'CVT';
export interface CatalogMainImage { filename: string }
export type PublicCatalogStatus = 'ready' | 'booked';

export interface CatalogCard {
  id: string;
  code: string;
  merek: { id: string; name: string } | null;
  tipe: { id: string; name: string } | null;
  variant: string | null;
  tahun: number;
  harga: number;
  kilometer: number;
  transmisi: PublicTransmisi;
  bahanBakar: string | null;
  warna: string;
  statusKatalog: 'READY' | 'BOOKED';
  isNew: boolean;
  image: CatalogMainImage | null;
  createdAt: string;

  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  transmission: string;
  fuel: string;
  color: string;
  status: PublicCatalogStatus;
}

export interface CatalogImage { id: string; filename: string; sortOrder: number; }

export interface CatalogDetail extends CatalogCard {
  plat: string;
  description: string;
  images: CatalogImage[];
  perlengkapan: string[];
  dokumen: string[];

  plate: string;
}

export interface CatalogBrand { id: string; name: string; count: number; }

/* ── Homepage aggregat ── */
export interface PublicTestimonial {
  id: string; name: string; role: string | null; text: string; rating: number; avatarFilename: string | null;
}
export interface PublicHomepage {
  hero: HomepageHero;
  brands: HomepageBrands & { items: { id: string; name: string }[] };
  whyUs: HomepageWhyUs;
  howItWorks: HomepageHowItWorks;
  featured: HomepageFeatured & { units: CatalogCard[] };
  testimonials: HomepageTestimonialsHeader & { items: PublicTestimonial[] };
  cta: HomepageCta;
}

/* ── About aggregat ── */
export interface PublicAbout {
  hero: AboutHero;
  stats: AboutStats;
  visiMisi: AboutVisiMisi;
  values: AboutValues;
  cta: AboutCta;
}

export interface ContactPageData { eyebrow: string; title: string; subtitle: string; isVisible?: boolean; }

/* ── Simulasi ── */
export interface CreditCalcInput { price: number; dpPercent?: number; tenor: number; rate?: number; }
export interface CreditCalcResult {
  dp: number; pokok: number; totalBunga: number; totalBayar: number; cicilanPerBulan: number;
  method: string; input: { price: number; dpPercent: number; tenor: number; rate: number };
  breakdown: { label: string; value: number }[];
  disclaimer: string;
}

export interface CatalogQuery {
  search?: string;
  merek?: string;
  transmisi?: PublicTransmisi;
  bahanBakar?: string;
  hargaMin?: number;
  hargaMax?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'km_asc';
  page?: number;
  limit?: number;
}

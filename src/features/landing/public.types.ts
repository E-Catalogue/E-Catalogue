// Tipe response endpoint publik (website customer). Acuan: docs/frontend/cms_module_prd.md.
import type {
  SiteSettings, HomepageHero, HomepageBrands, HomepageWhyUs, HomepageHowItWorks,
  HomepageFeatured, HomepageTestimonialsHeader, HomepageLocations, HomepageFaq, HomepageCta,
  AboutHero, AboutStory, AboutStats, AboutVisiMisi, AboutValues, AboutJourney, AboutCta,
  ContactPage, ContactFormContent, ContactLocations, ContactFaq, ContactCta,
  CreditSimConfig, PublicNavMenuItem,
} from '@/features/cms/cms.types';

export type { SiteSettings, CreditSimConfig, PublicNavMenuItem };

export type PublicTransmisi = 'AT' | 'MT' | 'CVT';
export interface CatalogMainImage { filename: string }
export type PublicCatalogStatus = 'ready' | 'booked' | 'sold';

export interface CatalogCard {
  id: string;
  /** Nama Unit (judul kartu/detail publik) — PRD frontend_unit_name_20260722. */
  name: string;
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
  statusKatalog: 'READY' | 'BOOKED' | 'SOLD';
  statusUnit?: string;
  isSold?: boolean;
  branch?: {
    id: string;
    name: string;
    code: string;
    showroom?: string | null;
    contact?: string | null;
  } | null;
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

/** Kontak sales publik (GET /public/sales). */
export interface SalesContact {
  id: string;
  name: string;
  phone: string | null;
  branchName: string | null;
  branchLocation: string | null;
  branchContact: string | null;
}

/* ── Homepage aggregat ── */
export interface PublicTestimonial {
  id: string; name: string; role: string | null; title: string | null; city: string | null; text: string; rating: number;
  avatarFilename: string | null; imageFilename: string | null; videoUrl: string | null; handoverDate: string | null;
  unit: { id: string; name: string; platNomor: string; tahun: number; warna: string; transmisi: string; merek: string | null; tipe: string | null; imageFilename: string | null; branch?: { id: string; name: string; code: string } | null } | null;
}
export interface PublicBranch { id: string; nama: string; code: string; lokasi: string; kontak: string; publicDescription: string | null; businessHours: string | null; mapLat: number; mapLng: number; publicSortOrder: number; images: { id: string; filename: string; url?: string }[]; }
export interface PublicHomepage {
  hero: HomepageHero & { primaryBranch: PublicBranch | null; spotlightUnit: CatalogCard | null };
  brands: HomepageBrands & { items: { id: string; name: string }[] };
  whyUs: HomepageWhyUs;
  howItWorks: HomepageHowItWorks;
  featured: HomepageFeatured & { units: CatalogCard[] };
  testimonials: HomepageTestimonialsHeader & { items: PublicTestimonial[] };
  locations: HomepageLocations & { items: PublicBranch[] };
  faq: HomepageFaq;
  cta: HomepageCta;
}

/* ── About aggregat ── */
export interface PublicAbout {
  hero: AboutHero;
  story: AboutStory;
  stats: AboutStats;
  visiMisi: AboutVisiMisi;
  values: AboutValues;
  standards: AboutValues;
  journey: AboutJourney;
  cta: AboutCta;
}

export interface PublicContact { hero: ContactPage; form: ContactFormContent; locations: ContactLocations & { items: PublicBranch[] }; faq: ContactFaq; cta: ContactCta; }

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

// Tipe data modul CMS (sesuai cms_frontend_integration.md).

export interface CmsIconItem {
  icon: string;   // nama lucide-react, mis. "shield-check"
  title: string;
  desc: string;
}

export interface CmsStat {
  value: string;  // boleh "auto" (di-resolve server untuk publik)
  label: string;
  icon?: string;
}

/* ── Site Settings (singleton) ── */
export interface SiteSettings {
  companyName: string;
  tagline: string;
  logoFilename: string | null;
  faviconFilename: string | null;
  footerDescription: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  mapEmbedUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
  social: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    website: string | null;
  };
  copyrightText: string | null;
}

/** Body PUT site-settings — sosial di-flatten sesuai API. */
export interface SiteSettingsUpdate {
  companyName?: string;
  tagline?: string;
  footerDescription?: string;
  whatsappNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessHours?: string;
  mapEmbedUrl?: string | null;
  mapLat?: number | null;
  mapLng?: number | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
  socialTiktok?: string | null;
  socialWebsite?: string | null;
  copyrightText?: string | null;
}

/* ── Homepage (singleton) ── */
export interface HomepageHero {
  badgeText: string;
  titleHtml: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  imageFilename: string | null;
  stats: CmsStat[];
}
export interface HomepageSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  items?: CmsIconItem[];
  steps?: CmsIconItem[];
}
export interface HomepageFeatured {
  eyebrow: string;
  title: string;
  mode: 'auto' | 'manual';
  limit: number;
  unitIds?: string[];
}
export interface HomepageCta {
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel: string;
  secondaryLink: string;
}
export interface Homepage {
  hero: HomepageHero;
  whyUs: HomepageSection;
  howItWorks: HomepageSection;
  featured: HomepageFeatured;
  cta: HomepageCta;
}

/* ── About (singleton) ── */
export interface AboutHero {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageFilename: string | null;
  ctaLabel: string;
  ctaLink: string;
}
export interface About {
  hero: AboutHero;
  stats: CmsStat[];
  visi: string;
  misi: string;
  values: CmsIconItem[];
  cta: HomepageCta;
}

/* ── Banner (collection) ── */
export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageFilename: string;
  ctaLabel: string | null;
  ctaLink: string | null;
  sortOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}
export type BannerForm = Omit<Banner, 'id'>;

/* ── Testimoni (collection) ── */
export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  text: string;
  rating: number;
  avatarFilename: string | null;
  isPublished: boolean;
  sortOrder: number;
}
export type TestimonialForm = Omit<Testimonial, 'id'>;

/* ── Pesan Kontak (inbox) ── */
export type ContactStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

/* ── Simulasi Kredit (config) ── */
export interface CreditSimConfig {
  tenorOptions: number[];
  dpMinPercent: number;
  dpMaxPercent: number;
  dpDefaultPercent: number;
  dpStep: number;
  rateMin: number;
  rateMax: number;
  rateDefault: number;
  rateStep: number;
  method: 'FLAT';
  disclaimer: string;
}

/* ── Katalog CMS (kelola tayang) ── */
export type StatusKatalog = 'READY' | 'BOOKED';
export interface CmsCatalogImage {
  id: string;
  filename: string;
  sortOrder: number;
}
export interface CmsCatalogRow {
  id: string;
  merek: { id: string; name: string } | null;
  tipe: { id: string; name: string } | null;
  variant: string | null;
  tahun: number;
  platNomor: string;
  warna: string;
  transmisi: string;
  bahanBakar: string | null;
  kilometer: number;
  harga: number;
  statusUnit: string;
  statusKatalog: StatusKatalog;
  isPublished: boolean;
  isNew: boolean;
  deskripsi: string | null;
  imageCount: number;
  images: CmsCatalogImage[];
  updatedAt: string;
}
export interface CmsCatalogPublishBody {
  isPublished?: boolean;
  isNew?: boolean;
  statusKatalog?: StatusKatalog;
  variant?: string;
  bahanBakar?: string;
  deskripsi?: string;
}

export interface CmsListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

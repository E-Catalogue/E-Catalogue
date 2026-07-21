// Tipe data modul CMS v2 (per-section) — sesuai docs/frontend/cms_frontend_integration.md.

export interface CmsIconItem {
  icon: string;   // nama lucide-react, mis. "shield-check"
  title: string;
  desc: string;
}

export interface CmsStat {
  value: string;  // boleh "auto" (di-resolve server)
  label: string;
  icon?: string;
}

export interface SectionMeta {
  isVisible?: boolean;
}

/* ── Site Settings (singleton) ── */
export interface NavLink { label: string; path: string; }

/** Bentuk PUBLIK — sosial dibungkus objek `social`. */
export interface SiteSettings {
  companyName: string;
  tagline: string;
  logoFilename: string | null;
  faviconFilename: string | null;
  footerDescription: string | null;
  navContactLabel: string;
  navLinks: NavLink[];
  whatsappNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  businessHours: string | null;
  mapEmbedUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
  social: { instagram: string | null; facebook: string | null; tiktok: string | null; website: string | null };
  copyrightText: string | null;
}

/** Bentuk ADMIN (GET /cms/site-settings) — sosial FLAT (socialInstagram, dst). */
export interface SiteSettingsRaw {
  companyName: string | null;
  tagline: string | null;
  logoFilename: string | null;
  faviconFilename: string | null;
  footerDescription: string | null;
  navContactLabel: string | null;
  navLinks: NavLink[] | null;
  whatsappNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  businessHours: string | null;
  mapEmbedUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialTiktok: string | null;
  socialWebsite: string | null;
  copyrightText: string | null;
}

export interface SiteSettingsUpdate {
  companyName?: string;
  tagline?: string;
  footerDescription?: string;
  navContactLabel?: string;
  navLinks?: NavLink[];
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

/* ── Homepage sections ── */
export interface HomepageHero extends SectionMeta {
  badgeText: string;
  titleHtml: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  imageFilename: string | null;
  floatingCard: { icon: string; title: string; subtitle: string };
  stats: CmsStat[];
}
export interface HomepageBrands extends SectionMeta {
  label: string;
  mode: 'auto' | 'manual';
  brandIds: string[];
  limit: number;
}
export interface HomepageWhyUs extends SectionMeta {
  eyebrow: string; title: string; subtitle: string;
  items: CmsIconItem[];
}
export interface HomepageHowItWorks extends SectionMeta {
  eyebrow: string; title: string; subtitle: string;
  steps: CmsIconItem[];
}
export interface HomepageFeatured extends SectionMeta {
  eyebrow: string; title: string;
  seeAllLabel: string; seeAllLink: string;
  mode: 'auto' | 'manual';
  unitIds: string[];
  limit: number;
}
export interface HomepageTestimonialsHeader extends SectionMeta {
  eyebrow: string; title: string; subtitle: string; limit: number;
}
export interface HomepageCta extends SectionMeta {
  title: string; subtitle: string;
  primaryLabel: string; primaryLink: string;
  secondaryLabel: string; secondaryLink: string;
}

/* ── About sections ── */
export interface AboutHero extends SectionMeta {
  eyebrow: string; title: string; subtitle: string;
  imageFilename: string | null;
  ctaLabel: string; ctaLink: string;
}
export interface AboutStats extends SectionMeta { items: CmsStat[]; }
export interface AboutVisiMisi extends SectionMeta {
  visiTitle: string; visiIcon: string; visi: string;
  misiTitle: string; misiIcon: string; misi: string;
}
export interface AboutValues extends SectionMeta {
  eyebrow: string; title: string; items: CmsIconItem[];
}
export type AboutCta = HomepageCta;

/* ── Header halaman ── */
export interface ContactPage extends SectionMeta { eyebrow: string; title: string; subtitle: string; }
export interface PriceRange { label: string; min: number; max: number | null; }
export interface CatalogPage extends SectionMeta { eyebrow: string; title: string; subtitle: string; priceRanges: PriceRange[]; }

/* ── Testimoni (koleksi) ── */
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
  method: 'FLAT' | 'EFEKTIF' | 'ANUITAS';
  installmentFromFactor: number;
  disclaimer: string;
}

/* ── Katalog CMS (kelola tayang) ── */
export type StatusKatalog = 'READY' | 'BOOKED';
export interface CmsCatalogImage { id: string; filename: string; sortOrder: number; }
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

export interface CmsListParams { page?: number; limit?: number; search?: string; [key: string]: unknown; }

/** Folder gambar CMS. */
export type CmsUploadFolder = 'page' | 'site' | 'testimoni';

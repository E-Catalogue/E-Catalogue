import { useEffect } from 'react';
import type { CatalogDetail, SiteSettings } from '@/features/landing/public.types';

/**
 * Domain kanonis situs publik. Canonical, og:url, dan JSON-LD selalu memakai domain ini —
 * bukan `window.location` — supaya akses lewat www/IP/preview tidak dianggap halaman terpisah.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://gmmobilindo.com').replace(/\/+$/, '');

/** Ubah path relatif (`/logo.jpeg`) menjadi URL absolut di domain kanonis. */
export const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

/** URL kanonis halaman aktif: domain tetap + pathname, tanpa query string/hash. */
export const canonicalUrlFor = (pathname?: string) => {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : '/';
  return `${SITE_URL}${normalized}`;
};

const SHOWROOM_ID = `${SITE_URL}/#showroom`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export interface SeoMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function updateSeoMetadata(meta: SeoMetadata): void {
  if (typeof document === 'undefined') return;

  // Title
  if (meta.title) {
    document.title = meta.title;
    setMetaTag('property', 'og:title', meta.title);
    setMetaTag('name', 'twitter:title', meta.title);
  }

  // Description
  if (meta.description) {
    setMetaTag('name', 'description', meta.description);
    setMetaTag('property', 'og:description', meta.description);
    setMetaTag('name', 'twitter:description', meta.description);
  }

  // Keywords
  if (meta.keywords && meta.keywords.length > 0) {
    setMetaTag('name', 'keywords', meta.keywords.join(', '));
  }

  // Open Graph Image & Twitter Card
  if (meta.ogImage) {
    const ogImage = absoluteUrl(meta.ogImage);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
  }

  // Type & Locale
  setMetaTag('property', 'og:type', meta.ogType || 'website');
  setMetaTag('property', 'og:locale', 'id_ID');

  // Canonical / URL
  const canonical = meta.canonicalUrl ? absoluteUrl(meta.canonicalUrl) : canonicalUrlFor();
  setMetaTag('property', 'og:url', canonical);
  setLinkTag('canonical', canonical);

  // Structured Data (JSON-LD)
  // JSON-LD per halaman; hapus milik halaman sebelumnya bila halaman ini tidak punya.
  if (meta.jsonLd) setJsonLd('seo-json-ld', meta.jsonLd);
  else document.getElementById('seo-json-ld')?.remove();
}

/** Pasang/ganti satu blok `<script type="application/ld+json">` berdasarkan id. */
export function setJsonLd(id: string, data: Record<string, unknown> | Array<Record<string, unknown>>): void {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function useSeo(meta: SeoMetadata, deps: unknown[] = []): void {
  useEffect(() => {
    updateSeoMetadata(meta);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Nilai CMS yang belum diisi (kosong / "Belum diatur") dianggap tidak ada. */
const filled = (v?: string | null) => {
  const t = v?.trim();
  return t && !/^belum diatur$/i.test(t) ? t : undefined;
};

/** Nomor lokal/62xxx → format internasional `+62…` untuk schema.org. */
const toE164 = (phone?: string | null) => {
  const digits = phone?.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('62')) return `+${digits}`;
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`;
  return `+${digits}`;
};

const SCHEMA_DAY: Record<string, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
  FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

const compact = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)));

/**
 * Schema `AutoDealer` (turunan LocalBusiness → Organization). Semua data NAP diambil dari
 * Site Settings / cabang utama di CMS supaya identik dengan Google Business Profile;
 * field yang belum diisi di CMS dihilangkan, bukan diisi placeholder.
 */
export function buildAutoDealerSchema(
  settings?: Partial<SiteSettings> | null,
  logoUrl?: string | null,
): Record<string, unknown> {
  const branch = settings?.primaryBranch ?? null;
  const name = filled(settings?.companyName) || 'GM Mobilindo';
  const streetAddress = filled(settings?.address) || filled(branch?.lokasi);
  const phone = toE164(filled(settings?.phone) || filled(branch?.phone) || filled(settings?.whatsappNumber));
  const lat = settings?.mapLat ?? branch?.mapLat;
  const lng = settings?.mapLng ?? branch?.mapLng;
  const hours = (settings?.operatingHours ?? branch?.operatingHours ?? [])
    .filter((h) => h.isOpen && h.openTime && h.closeTime && SCHEMA_DAY[h.day]);
  const social = settings?.social;
  const sameAs = [social?.instagram, social?.facebook, social?.tiktok].filter((u): u is string => !!filled(u));
  const logo = logoUrl ? absoluteUrl(logoUrl) : `${SITE_URL}/logo.jpeg`;

  return compact({
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': SHOWROOM_ID,
    name,
    alternateName: `${name} Subang`,
    description:
      filled(settings?.footerDescription) ||
      'Pusat jual beli mobil bekas berkualitas dan bergaransi di Subang. Melayani pembelian cash, kredit syariah/konvensional, dan tukar tambah.',
    url: SITE_URL,
    logo,
    image: logo,
    telephone: phone,
    email: filled(settings?.email),
    priceRange: 'Rp 80.000.000 - Rp 500.000.000',
    address: compact({
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality: 'Subang',
      addressRegion: 'Jawa Barat',
      addressCountry: 'ID',
    }),
    geo: lat != null && lng != null ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } : undefined,
    hasMap: filled(settings?.mapEmbedUrl),
    openingHoursSpecification: hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAY[h.day],
      opens: h.openTime,
      closes: h.closeTime,
    })),
    sameAs,
    areaServed: ['Subang', 'Kalijati', 'Pagaden', 'Pamanukan', 'Purwakarta', 'Karawang', 'Jawa Barat'],
  });
}

/**
 * Schema `WebSite` — sinyal nama situs ("GM Mobilindo") yang ditampilkan Google di atas
 * hasil pencarian. Publisher merujuk ke entitas AutoDealer lewat `@id`.
 */
export function buildWebSiteSchema(settings?: Partial<SiteSettings> | null): Record<string, unknown> {
  const name = filled(settings?.companyName) || 'GM Mobilindo';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name,
    alternateName: [`${name} Subang`, 'gmmobilindo'],
    url: `${SITE_URL}/`,
    inLanguage: 'id-ID',
    publisher: { '@id': SHOWROOM_ID },
  };
}

export function buildCarSchema(unit: CatalogDetail, imageUrl?: string): Record<string, unknown> {
  const merekTipe = `${unit.merek?.name ?? ''} ${unit.tipe?.name ?? ''}`.trim();
  const carName = unit.name?.trim() || merekTipe || 'Mobil Bekas';

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: carName,
    url: `${SITE_URL}/katalog/${unit.id}`,
    description: unit.description || `Jual ${carName} tahun ${unit.tahun || ''} bekas berkualitas di Subang. Surat lengkap dan bergaransi mesin.`,
    image: imageUrl ? absoluteUrl(imageUrl) : undefined,
    brand: unit.merek?.name ? { '@type': 'Brand', name: unit.merek.name } : undefined,
    model: unit.tipe?.name || undefined,
    vehicleModelDate: unit.tahun ? String(unit.tahun) : undefined,
    itemCondition: 'https://schema.org/UsedCondition',
    mileageFromOdometer: unit.kilometer
      ? {
          '@type': 'QuantitativeValue',
          value: unit.kilometer,
          unitCode: 'KMT',
        }
      : undefined,
    vehicleTransmission: unit.transmisi || undefined,
    fuelType: unit.bahanBakar || undefined,
    offers: {
      '@type': 'Offer',
      price: unit.harga || 0,
      priceCurrency: 'IDR',
      availability: unit.statusUnit === 'TERJUAL' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: `${SITE_URL}/katalog/${unit.id}`,
      seller: { '@type': 'AutoDealer', '@id': SHOWROOM_ID, name: 'GM Mobilindo' },
    },
  };
}

export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

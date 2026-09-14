import { useEffect } from 'react';
import type { CatalogDetail, SiteSettings } from '@/features/landing/public.types';

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
    setMetaTag('property', 'og:image', meta.ogImage);
    setMetaTag('name', 'twitter:image', meta.ogImage);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
  }

  // Type & Locale
  setMetaTag('property', 'og:type', meta.ogType || 'website');
  setMetaTag('property', 'og:locale', 'id_ID');

  // Canonical / URL
  const currentUrl =
    meta.canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  if (currentUrl) {
    setMetaTag('property', 'og:url', currentUrl);
    setLinkTag('canonical', currentUrl);
  }

  // Structured Data (JSON-LD)
  if (meta.jsonLd) {
    let script = document.getElementById('seo-json-ld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-json-ld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(meta.jsonLd);
  }
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

export function buildAutoDealerSchema(settings?: Partial<SiteSettings> | null): Record<string, unknown> {
  const name = settings?.companyName || 'GM Mobilindo';
  const address = settings?.address || 'Kabupaten Subang, Jawa Barat, Indonesia';
  const phone = settings?.phone || settings?.whatsappNumber || '+6281234567890';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gmmobilindo.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': `${origin}/#showroom`,
    name,
    description:
      settings?.footerDescription ||
      'Pusat jual beli mobil bekas berkualitas dan bergaransi di Subang. Melayani pembelian cash, kredit syariah/konvensional, dan tukar tambah.',
    url: origin,
    telephone: phone,
    priceRange: 'Rp 80.000.000 - Rp 500.000.000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Subang',
      addressRegion: 'Jawa Barat',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: settings?.mapLat ?? -6.5715,
      longitude: settings?.mapLng ?? 107.7587,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    areaServed: [
      'Subang',
      'Kalijati',
      'Pagaden',
      'Pamanukan',
      'Purwakarta',
      'Karawang',
      'Jawa Barat',
    ],
  };
}

export function buildCarSchema(unit: CatalogDetail, imageUrl?: string): Record<string, unknown> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gmmobilindo.com';
  const merekTipe = `${unit.merek?.name ?? ''} ${unit.tipe?.name ?? ''}`.trim();
  const carName = unit.name?.trim() || merekTipe || 'Mobil Bekas';

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: carName,
    description: unit.description || `Jual ${carName} tahun ${unit.tahun || ''} bekas berkualitas di Subang. Surat lengkap dan bergaransi mesin.`,
    image: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${origin}${imageUrl}`) : undefined,
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
      seller: {
        '@type': 'AutoDealer',
        name: 'GM Mobilindo Subang',
      },
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

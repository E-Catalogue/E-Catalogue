import { apiClient } from '@/core/api/client';
import type { ApiResponse, ApiMeta } from '@/core/api/types';
import type {
  SiteSettings, PublicHomepage, PublicAbout, ContactPageData,
  CatalogCard, CatalogDetail, CatalogBrand, CatalogQuery,
  CreditSimConfig, CreditCalcInput, CreditCalcResult,
} from './public.types';

/** Header + rentang harga halaman katalog publik. */
export interface CatalogPagePublic {
  eyebrow: string; title: string; subtitle: string;
  priceRanges: { label: string; min: number; max: number | null }[];
  isVisible?: boolean;
}

export interface CatalogListResponse { data: CatalogCard[]; meta?: ApiMeta; }

export const landingApi = {
  getSiteSettings: () => apiClient.get<ApiResponse<SiteSettings>>('/public/site-settings').then((r) => r.data.data),
  getHomepage: () => apiClient.get<ApiResponse<PublicHomepage>>('/public/homepage').then((r) => r.data.data),
  getAbout: () => apiClient.get<ApiResponse<PublicAbout>>('/public/about').then((r) => r.data.data),
  getContactPage: () => apiClient.get<ApiResponse<ContactPageData>>('/public/contact-page').then((r) => r.data.data),

  getCatalogPage: () => apiClient.get<ApiResponse<CatalogPagePublic>>('/public/catalog-page').then((r) => r.data.data),
  getCatalog: (params: CatalogQuery): Promise<CatalogListResponse> =>
    apiClient.get<ApiResponse<CatalogCard[]>>('/public/catalog', { params }).then((r) => ({ data: r.data.data, meta: r.data.meta })),
  getCatalogBrands: () => apiClient.get<ApiResponse<CatalogBrand[]>>('/public/catalog/brands').then((r) => r.data.data),
  getCatalogUnit: (id: string) => apiClient.get<ApiResponse<CatalogDetail>>(`/public/catalog/${id}`).then((r) => r.data.data),
  getRelatedUnits: (id: string, limit = 4) => apiClient.get<ApiResponse<CatalogCard[]>>(`/public/catalog/${id}/related`, { params: { limit } }).then((r) => r.data.data),

  getCreditConfig: () => apiClient.get<ApiResponse<CreditSimConfig>>('/public/credit-simulation/config').then((r) => r.data.data),
  calculateCredit: (body: CreditCalcInput) => apiClient.post<ApiResponse<CreditCalcResult>>('/public/credit-simulation/calculate', body).then((r) => r.data.data),

  submitContact: (body: { name: string; phone: string; email?: string; message: string; website?: string }) =>
    apiClient.post<ApiResponse<{ id: string; createdAt: string }>>('/public/contact-messages', body).then((r) => r.data.data),
};

export type { CatalogQuery };

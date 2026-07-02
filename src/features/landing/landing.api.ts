import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { SiteSettings, CreditSimConfig } from '@/features/cms/cms.types';
import type { Unit } from '@/data/types';

export interface PublicHomepage {
  hero: any;
  brands: any;
  whyUs: any;
  howItWorks: any;
  featured: any;
  testimonials: any;
  cta: any;
}

export interface CatalogResponse {
  data: Unit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface CatalogFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  merek?: string;
  transmisi?: string;
  bahanBakar?: string;
  hargaMin?: number;
  hargaMax?: number;
  sort?: string;
}

export const landingApi = {
  getSiteSettings: () => apiClient.get<ApiResponse<SiteSettings>>('/public/site-settings').then((res) => res.data.data),
  
  getHomepage: () => apiClient.get<ApiResponse<PublicHomepage>>('/public/homepage').then((res) => res.data.data),
  
  getCatalog: (params: CatalogFilterParams) => apiClient.get<CatalogResponse>('/public/catalog', { params }).then((res) => res.data),
  
  getCatalogUnit: (id: string) => apiClient.get<ApiResponse<Unit>>(`/public/catalog/${id}`).then((res) => res.data.data),
  
  getRelatedUnits: (id: string, limit = 4) => apiClient.get<ApiResponse<Unit[]>>(`/public/catalog/${id}/related`, { params: { limit } }).then((res) => res.data.data),
  
  getCreditConfig: () => apiClient.get<ApiResponse<CreditSimConfig>>('/public/credit-simulation/config').then((res) => res.data.data),
  
  getAbout: () => apiClient.get<ApiResponse<any>>('/public/about').then((res) => res.data.data),
};

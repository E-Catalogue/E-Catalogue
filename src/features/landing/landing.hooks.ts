import { useQuery } from '@tanstack/react-query';
import { landingApi } from './landing.api';
import type { CatalogFilterParams } from './landing.api';

export const usePublicSiteSettings = () =>
  useQuery({ queryKey: ['public-site-settings'], queryFn: landingApi.getSiteSettings, staleTime: 5 * 60 * 1000 }); // cache 5 mins

export const usePublicHomepage = () =>
  useQuery({ queryKey: ['public-homepage'], queryFn: landingApi.getHomepage, staleTime: 5 * 60 * 1000 });

export const usePublicCatalog = (params: CatalogFilterParams) =>
  useQuery({ queryKey: ['public-catalog', params], queryFn: () => landingApi.getCatalog(params) });

export const usePublicCatalogUnit = (id: string) =>
  useQuery({ queryKey: ['public-catalog-unit', id], queryFn: () => landingApi.getCatalogUnit(id), enabled: !!id });

export const usePublicRelatedUnits = (id: string, limit?: number) =>
  useQuery({ queryKey: ['public-related-units', id, limit], queryFn: () => landingApi.getRelatedUnits(id, limit), enabled: !!id });

export const usePublicCreditConfig = () =>
  useQuery({ queryKey: ['public-credit-config'], queryFn: landingApi.getCreditConfig, staleTime: 60 * 60 * 1000 });

export const usePublicAbout = () =>
  useQuery({ queryKey: ['public-about'], queryFn: landingApi.getAbout, staleTime: 5 * 60 * 1000 });

import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { landingApi } from './landing.api';
import type { CatalogQuery, CreditCalcInput } from './public.types';

const FIVE_MIN = 5 * 60_000;

export const usePublicSiteSettings = () =>
  useQuery({ queryKey: ['public', 'site-settings'], queryFn: landingApi.getSiteSettings, staleTime: FIVE_MIN });

export const usePublicHomepage = () =>
  useQuery({ queryKey: ['public', 'homepage'], queryFn: landingApi.getHomepage, staleTime: FIVE_MIN });

export const usePublicAbout = () =>
  useQuery({ queryKey: ['public', 'about'], queryFn: landingApi.getAbout, staleTime: FIVE_MIN });

export const usePublicContactPage = () =>
  useQuery({ queryKey: ['public', 'contact-page'], queryFn: landingApi.getContactPage, staleTime: FIVE_MIN });

export const usePublicCatalogPage = () =>
  useQuery({ queryKey: ['public', 'catalog-page'], queryFn: landingApi.getCatalogPage, staleTime: FIVE_MIN });

export const usePublicCatalog = (params: CatalogQuery) =>
  useQuery({ queryKey: ['public', 'catalog', params], queryFn: () => landingApi.getCatalog(params), placeholderData: keepPreviousData });

export const usePublicCatalogBrands = () =>
  useQuery({ queryKey: ['public', 'catalog-brands'], queryFn: landingApi.getCatalogBrands, staleTime: FIVE_MIN });

export const usePublicCatalogUnit = (id?: string) =>
  useQuery({ queryKey: ['public', 'catalog', id], queryFn: () => landingApi.getCatalogUnit(id as string), enabled: !!id });

export const usePublicRelatedUnits = (id?: string, limit = 4) =>
  useQuery({ queryKey: ['public', 'catalog', id, 'related', limit], queryFn: () => landingApi.getRelatedUnits(id as string, limit), enabled: !!id });

export const usePublicCreditConfig = () =>
  useQuery({ queryKey: ['public', 'credit-config'], queryFn: landingApi.getCreditConfig, staleTime: FIVE_MIN });

export const useCalculateCredit = () =>
  useMutation({ mutationFn: (body: CreditCalcInput) => landingApi.calculateCredit(body) });

export const useSubmitContact = () =>
  useMutation({ mutationFn: landingApi.submitContact });

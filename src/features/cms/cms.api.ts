import { apiClient, API_ORIGIN } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  SiteSettings, SiteSettingsRaw, SiteSettingsUpdate,
  ContactPage, CatalogPage,
  Testimonial, TestimonialForm,
  ContactMessage, ContactStatus,
  CreditSimConfig,
  CmsCatalogRow, CmsCatalogPublishBody, CmsCatalogImage,
  CmsListParams, CmsUploadFolder,
} from './cms.types';

/** URL gambar CMS: dilayani di root origin. Folder: site|page|unit|testimoni. */
export const cmsImageUrl = (folder: string, filename?: string | null): string | null =>
  filename ? `${API_ORIGIN}/public/${folder}/${filename}` : null;

const uploadCfg = { headers: { 'Content-Type': 'multipart/form-data' } };
const fileForm = (file: File) => { const fd = new FormData(); fd.append('image', file); return fd; };

/* ── Section generik (homepage/about) ── */
export const sectionApi = {
  get: <T>(page: 'homepage' | 'about', section: string) =>
    apiClient.get<ApiResponse<T>>(`/cms/${page}/${section}`).then((r) => r.data.data),
  update: <T>(page: 'homepage' | 'about', section: string, body: Partial<T>) =>
    apiClient.put<ApiResponse<T>>(`/cms/${page}/${section}`, body).then((r) => r.data.data),
  heroImage: (page: 'homepage' | 'about', file: File) =>
    apiClient.post<ApiResponse<{ filename: string }>>(`/cms/${page}/hero-image`, fileForm(file), uploadCfg).then((r) => r.data.data),
};

/**
 * `.prd/update_module_owned_lookup_20260721.md` §4.20 — pilihan merek & unit unggulan homepage
 * memakai `/cms/homepage/lookups` (bukan CRUD Merek/Unit atau CMS Catalog). Unit hanya yang aktif
 * berstatus READY_STOCK.
 */
export interface HomepageLookup {
  brands: { id: string; name: string }[];
  units: { id: string; name?: string | null; branchId?: string; platNomor: string; isPublished?: boolean; merek?: { name: string } | null; tipe?: { name: string } | null }[];
}
export const homepageLookupApi = {
  get: () => apiClient.get<ApiResponse<HomepageLookup>>('/cms/homepage/lookups').then((r) => r.data.data),
};

/** Upload generik → simpan filename ke field *Filename lalu PUT section. */
export const uploadCmsImage = (folder: CmsUploadFolder, file: File) =>
  apiClient.post<ApiResponse<{ filename: string; folder: string; path: string }>>(`/cms/uploads/${folder}`, fileForm(file), uploadCfg).then((r) => r.data.data);

/* ── Site Settings ── */
export const siteSettingsApi = {
  get: () => apiClient.get<ApiResponse<SiteSettingsRaw>>('/cms/site-settings').then((r) => r.data.data),
  getPublic: () => apiClient.get<ApiResponse<SiteSettings>>('/public/site-settings').then((r) => r.data.data),
  update: (body: SiteSettingsUpdate) => apiClient.put<ApiResponse<SiteSettings>>('/cms/site-settings', body).then((r) => r.data.data),
  uploadLogo: (file: File) => apiClient.post<ApiResponse<{ filename: string }>>('/cms/site-settings/logo', fileForm(file), uploadCfg).then((r) => r.data.data),
  uploadFavicon: (file: File) => apiClient.post<ApiResponse<{ filename: string }>>('/cms/site-settings/favicon', fileForm(file), uploadCfg).then((r) => r.data.data),
};

/* ── Header halaman ── */
export const contactPageApi = {
  get: () => apiClient.get<ApiResponse<ContactPage>>('/cms/contact-page').then((r) => r.data.data),
  update: (body: Partial<ContactPage>) => apiClient.put<ApiResponse<ContactPage>>('/cms/contact-page', body).then((r) => r.data.data),
};
export const catalogPageApi = {
  get: () => apiClient.get<ApiResponse<CatalogPage>>('/cms/catalog-page').then((r) => r.data.data),
  update: (body: Partial<CatalogPage>) => apiClient.put<ApiResponse<CatalogPage>>('/cms/catalog-page', body).then((r) => r.data.data),
};

/* ── Testimoni ── */
export const testimonialApi = {
  list: (params: CmsListParams) => apiClient.get<ApiResponse<Testimonial[]>>('/cms/testimonials', { params }).then((r) => r.data),
  create: (body: TestimonialForm) => apiClient.post<ApiResponse<Testimonial>>('/cms/testimonials', body).then((r) => r.data.data),
  update: (id: string, body: Partial<TestimonialForm>) => apiClient.put<ApiResponse<Testimonial>>(`/cms/testimonials/${id}`, body).then((r) => r.data.data),
  setPublish: (id: string, isPublished: boolean) => apiClient.patch<ApiResponse<Testimonial>>(`/cms/testimonials/${id}/publish`, { isPublished }).then((r) => r.data.data),
  uploadAvatar: (id: string, file: File) => apiClient.post<ApiResponse<{ filename: string }>>(`/cms/testimonials/${id}/avatar`, fileForm(file), uploadCfg).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/cms/testimonials/${id}`).then((r) => r.data),
};

/* ── Pesan Kontak (inbox) ── */
export const contactMessageApi = {
  list: (params: CmsListParams) => apiClient.get<ApiResponse<ContactMessage[]>>('/cms/contact-messages', { params }).then((r) => r.data),
  countNew: () => apiClient.get<ApiResponse<{ new: number }>>('/cms/contact-messages/count-new').then((r) => r.data.data),
  setStatus: (id: string, status: ContactStatus) => apiClient.patch<ApiResponse<ContactMessage>>(`/cms/contact-messages/${id}/status`, { status }).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/cms/contact-messages/${id}`).then((r) => r.data),
};

/* ── Simulasi Kredit ── */
export const creditSimApi = {
  get: () => apiClient.get<ApiResponse<CreditSimConfig>>('/cms/credit-simulation/config').then((r) => r.data.data),
  update: (body: Partial<CreditSimConfig>) => apiClient.put<ApiResponse<CreditSimConfig>>('/cms/credit-simulation/config', body).then((r) => r.data.data),
};

/* ── Katalog CMS ── */
export const cmsCatalogApi = {
  list: (params: CmsListParams) => apiClient.get<ApiResponse<CmsCatalogRow[]>>('/cms/catalog', { params }).then((r) => r.data),
  publish: (id: string, body: CmsCatalogPublishBody) => apiClient.patch<ApiResponse<CmsCatalogRow>>(`/cms/catalog/${id}/publish`, body).then((r) => r.data.data),
  uploadImage: (id: string, file: File) => apiClient.post<ApiResponse<CmsCatalogImage>>(`/cms/catalog/${id}/images`, fileForm(file), uploadCfg).then((r) => r.data.data),
  reorderImages: (id: string, orderedIds: string[]) => apiClient.patch<ApiResponse<CmsCatalogRow>>(`/cms/catalog/${id}/images/reorder`, { orderedIds }).then((r) => r.data.data),
  deleteImage: (id: string, imageId: string) => apiClient.delete(`/cms/catalog/${id}/images/${imageId}`).then((r) => r.data),
};

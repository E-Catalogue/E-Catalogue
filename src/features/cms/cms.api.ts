import { apiClient, API_ORIGIN } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type {
  SiteSettings, SiteSettingsUpdate,
  Homepage, About,
  Banner, BannerForm,
  Testimonial, TestimonialForm,
  ContactMessage, ContactStatus,
  CreditSimConfig,
  CmsCatalogRow, CmsCatalogPublishBody, CmsCatalogImage,
  CmsListParams,
} from './cms.types';

/** URL gambar CMS: dilayani di root origin (bukan /api/v1). Folder: site|page|banner|testimoni|unit. */
export const cmsImageUrl = (folder: string, filename?: string | null): string | null =>
  filename ? `${API_ORIGIN}/public/${folder}/${filename}` : null;

const uploadCfg = { headers: { 'Content-Type': 'multipart/form-data' } };
const fileForm = (file: File) => { const fd = new FormData(); fd.append('image', file); return fd; };

/* ── Site Settings ── */
export const siteSettingsApi = {
  get: () => apiClient.get<ApiResponse<SiteSettings>>('/cms/site-settings').then((r) => r.data.data),
  update: (body: SiteSettingsUpdate) => apiClient.put<ApiResponse<SiteSettings>>('/cms/site-settings', body).then((r) => r.data.data),
  uploadLogo: (file: File) => apiClient.post<ApiResponse<{ filename: string }>>('/cms/site-settings/logo', fileForm(file), uploadCfg).then((r) => r.data.data),
  uploadFavicon: (file: File) => apiClient.post<ApiResponse<{ filename: string }>>('/cms/site-settings/favicon', fileForm(file), uploadCfg).then((r) => r.data.data),
};

/* ── Homepage ── */
export const homepageApi = {
  get: () => apiClient.get<ApiResponse<Homepage>>('/cms/homepage').then((r) => r.data.data),
  update: (body: Homepage) => apiClient.put<ApiResponse<Homepage>>('/cms/homepage', body).then((r) => r.data.data),
  uploadHeroImage: (file: File) => apiClient.post<ApiResponse<{ filename: string }>>('/cms/homepage/hero-image', fileForm(file), uploadCfg).then((r) => r.data.data),
};

/* ── About ── */
export const aboutApi = {
  get: () => apiClient.get<ApiResponse<About>>('/cms/about').then((r) => r.data.data),
  update: (body: About) => apiClient.put<ApiResponse<About>>('/cms/about', body).then((r) => r.data.data),
  uploadHeroImage: (file: File) => apiClient.post<ApiResponse<{ filename: string }>>('/cms/about/hero-image', fileForm(file), uploadCfg).then((r) => r.data.data),
};

/* ── Banner ── */
export const bannerApi = {
  list: (params: CmsListParams) => apiClient.get<ApiResponse<Banner[]>>('/cms/banners', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<ApiResponse<Banner>>(`/cms/banners/${id}`).then((r) => r.data.data),
  create: (body: BannerForm) => apiClient.post<ApiResponse<Banner>>('/cms/banners', body).then((r) => r.data.data),
  update: (id: string, body: Partial<BannerForm>) => apiClient.put<ApiResponse<Banner>>(`/cms/banners/${id}`, body).then((r) => r.data.data),
  setActive: (id: string, isActive: boolean) => apiClient.patch<ApiResponse<Banner>>(`/cms/banners/${id}/active`, { isActive }).then((r) => r.data.data),
  uploadImage: (id: string, file: File) => apiClient.post<ApiResponse<{ filename: string }>>(`/cms/banners/${id}/image`, fileForm(file), uploadCfg).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/cms/banners/${id}`).then((r) => r.data),
  upload: (file: File) => apiClient.post<ApiResponse<{ filename: string; path: string }>>('/cms/uploads/banner', fileForm(file), uploadCfg).then((r) => r.data.data),
};

/* ── Testimoni ── */
export const testimonialApi = {
  list: (params: CmsListParams) => apiClient.get<ApiResponse<Testimonial[]>>('/cms/testimonials', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<ApiResponse<Testimonial>>(`/cms/testimonials/${id}`).then((r) => r.data.data),
  create: (body: TestimonialForm) => apiClient.post<ApiResponse<Testimonial>>('/cms/testimonials', body).then((r) => r.data.data),
  update: (id: string, body: Partial<TestimonialForm>) => apiClient.put<ApiResponse<Testimonial>>(`/cms/testimonials/${id}`, body).then((r) => r.data.data),
  setPublish: (id: string, isPublished: boolean) => apiClient.patch<ApiResponse<Testimonial>>(`/cms/testimonials/${id}/publish`, { isPublished }).then((r) => r.data.data),
  uploadAvatar: (id: string, file: File) => apiClient.post<ApiResponse<{ filename: string }>>(`/cms/testimonials/${id}/avatar`, fileForm(file), uploadCfg).then((r) => r.data.data),
  remove: (id: string) => apiClient.delete(`/cms/testimonials/${id}`).then((r) => r.data),
  upload: (file: File) => apiClient.post<ApiResponse<{ filename: string; path: string }>>('/cms/uploads/testimoni', fileForm(file), uploadCfg).then((r) => r.data.data),
};

/* ── Pesan Kontak (inbox) ── */
export const contactMessageApi = {
  list: (params: CmsListParams) => apiClient.get<ApiResponse<ContactMessage[]>>('/cms/contact-messages', { params }).then((r) => r.data),
  countNew: () => apiClient.get<ApiResponse<{ new: number }>>('/cms/contact-messages/count-new').then((r) => r.data.data),
  get: (id: string) => apiClient.get<ApiResponse<ContactMessage>>(`/cms/contact-messages/${id}`).then((r) => r.data.data),
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
  get: (id: string) => apiClient.get<ApiResponse<CmsCatalogRow>>(`/cms/catalog/${id}`).then((r) => r.data.data),
  publish: (id: string, body: CmsCatalogPublishBody) => apiClient.patch<ApiResponse<CmsCatalogRow>>(`/cms/catalog/${id}/publish`, body).then((r) => r.data.data),
  uploadImage: (id: string, file: File) => apiClient.post<ApiResponse<CmsCatalogImage>>(`/cms/catalog/${id}/images`, fileForm(file), uploadCfg).then((r) => r.data.data),
  reorderImages: (id: string, orderedIds: string[]) => apiClient.patch<ApiResponse<CmsCatalogRow>>(`/cms/catalog/${id}/images/reorder`, { orderedIds }).then((r) => r.data.data),
  deleteImage: (id: string, imageId: string) => apiClient.delete(`/cms/catalog/${id}/images/${imageId}`).then((r) => r.data),
};

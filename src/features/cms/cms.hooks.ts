import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import {
  siteSettingsApi, homepageApi, aboutApi,
  bannerApi, testimonialApi, contactMessageApi,
  creditSimApi, cmsCatalogApi,
} from './cms.api';
import type {
  SiteSettingsUpdate, Homepage, About,
  BannerForm, TestimonialForm, ContactStatus,
  CreditSimConfig, CmsCatalogPublishBody, CmsListParams,
} from './cms.types';

const toastOk = (message: string) =>
  store.dispatch(showToast({ type: 'general', title: 'Berhasil', message }));

/* ── Site Settings ── */
export const useSiteSettings = () =>
  useQuery({ queryKey: ['cms', 'site-settings'], queryFn: siteSettingsApi.get });

export const useSiteSettingsMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cms', 'site-settings'] });
  return {
    update: useMutation({
      mutationFn: (body: SiteSettingsUpdate) => siteSettingsApi.update(body),
      onSuccess: () => { inval(); toastOk('Pengaturan situs disimpan'); },
    }),
    uploadLogo: useMutation({ mutationFn: (file: File) => siteSettingsApi.uploadLogo(file), onSuccess: () => { inval(); toastOk('Logo diperbarui'); } }),
    uploadFavicon: useMutation({ mutationFn: (file: File) => siteSettingsApi.uploadFavicon(file), onSuccess: () => { inval(); toastOk('Favicon diperbarui'); } }),
  };
};

/* ── Homepage ── */
export const useHomepage = () =>
  useQuery({ queryKey: ['cms', 'homepage'], queryFn: homepageApi.get });

export const useHomepageMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cms', 'homepage'] });
  return {
    update: useMutation({ mutationFn: (body: Homepage) => homepageApi.update(body), onSuccess: () => { inval(); toastOk('Beranda disimpan'); } }),
    uploadHeroImage: useMutation({ mutationFn: (file: File) => homepageApi.uploadHeroImage(file), onSuccess: () => { inval(); toastOk('Gambar hero diperbarui'); } }),
  };
};

/* ── About ── */
export const useAbout = () =>
  useQuery({ queryKey: ['cms', 'about'], queryFn: aboutApi.get });

export const useAboutMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cms', 'about'] });
  return {
    update: useMutation({ mutationFn: (body: About) => aboutApi.update(body), onSuccess: () => { inval(); toastOk('Halaman Tentang disimpan'); } }),
    uploadHeroImage: useMutation({ mutationFn: (file: File) => aboutApi.uploadHeroImage(file), onSuccess: () => { inval(); toastOk('Gambar hero diperbarui'); } }),
  };
};

/* ── Banner ── */
export const useBanners = (params: CmsListParams) =>
  useQuery({ queryKey: ['cms', 'banners', params], queryFn: () => bannerApi.list(params) });

export const useBannerMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cms', 'banners'] });
  return {
    create: useMutation({ mutationFn: (body: BannerForm) => bannerApi.create(body), onSuccess: () => { inval(); toastOk('Banner ditambahkan'); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<BannerForm> }) => bannerApi.update(v.id, v.body), onSuccess: () => { inval(); toastOk('Banner diperbarui'); } }),
    setActive: useMutation({ mutationFn: (v: { id: string; isActive: boolean }) => bannerApi.setActive(v.id, v.isActive), onSuccess: inval }),
    uploadImage: useMutation({ mutationFn: (v: { id: string; file: File }) => bannerApi.uploadImage(v.id, v.file), onSuccess: () => { inval(); toastOk('Gambar banner diperbarui'); } }),
    remove: useMutation({ mutationFn: (id: string) => bannerApi.remove(id), onSuccess: () => { inval(); toastOk('Banner dihapus'); } }),
  };
};

/* ── Testimoni ── */
export const useTestimonials = (params: CmsListParams) =>
  useQuery({ queryKey: ['cms', 'testimonials', params], queryFn: () => testimonialApi.list(params) });

export const useTestimonialMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cms', 'testimonials'] });
  return {
    create: useMutation({ mutationFn: (body: TestimonialForm) => testimonialApi.create(body), onSuccess: () => { inval(); toastOk('Testimoni ditambahkan'); } }),
    update: useMutation({ mutationFn: (v: { id: string; body: Partial<TestimonialForm> }) => testimonialApi.update(v.id, v.body), onSuccess: () => { inval(); toastOk('Testimoni diperbarui'); } }),
    setPublish: useMutation({ mutationFn: (v: { id: string; isPublished: boolean }) => testimonialApi.setPublish(v.id, v.isPublished), onSuccess: inval }),
    uploadAvatar: useMutation({ mutationFn: (v: { id: string; file: File }) => testimonialApi.uploadAvatar(v.id, v.file), onSuccess: () => { inval(); toastOk('Avatar diperbarui'); } }),
    remove: useMutation({ mutationFn: (id: string) => testimonialApi.remove(id), onSuccess: () => { inval(); toastOk('Testimoni dihapus'); } }),
  };
};

/* ── Pesan Kontak ── */
export const useContactMessages = (params: CmsListParams) =>
  useQuery({ queryKey: ['cms', 'contact-messages', params], queryFn: () => contactMessageApi.list(params) });

export const useContactMessageCount = () =>
  useQuery({ queryKey: ['cms', 'contact-messages', 'count-new'], queryFn: contactMessageApi.countNew });

export const useContactMessageMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cms', 'contact-messages'] });
  return {
    setStatus: useMutation({ mutationFn: (v: { id: string; status: ContactStatus }) => contactMessageApi.setStatus(v.id, v.status), onSuccess: inval }),
    remove: useMutation({ mutationFn: (id: string) => contactMessageApi.remove(id), onSuccess: () => { inval(); toastOk('Pesan dihapus'); } }),
  };
};

/* ── Simulasi Kredit ── */
export const useCreditSimConfig = () =>
  useQuery({ queryKey: ['cms', 'credit-sim'], queryFn: creditSimApi.get });

export const useCreditSimMutations = () => {
  const qc = useQueryClient();
  return {
    update: useMutation({
      mutationFn: (body: Partial<CreditSimConfig>) => creditSimApi.update(body),
      onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms', 'credit-sim'] }); toastOk('Konfigurasi simulasi disimpan'); },
    }),
  };
};

/* ── Katalog CMS ── */
export const useCmsCatalog = (params: CmsListParams) =>
  useQuery({ queryKey: ['cms', 'catalog', params], queryFn: () => cmsCatalogApi.list(params) });

export const useCmsCatalogMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
  return {
    publish: useMutation({ mutationFn: (v: { id: string; body: CmsCatalogPublishBody }) => cmsCatalogApi.publish(v.id, v.body), onSuccess: inval }),
    uploadImage: useMutation({ mutationFn: (v: { id: string; file: File }) => cmsCatalogApi.uploadImage(v.id, v.file), onSuccess: () => { inval(); toastOk('Foto ditambahkan'); } }),
    deleteImage: useMutation({ mutationFn: (v: { id: string; imageId: string }) => cmsCatalogApi.deleteImage(v.id, v.imageId), onSuccess: () => { inval(); toastOk('Foto dihapus'); } }),
    reorderImages: useMutation({ mutationFn: (v: { id: string; orderedIds: string[] }) => cmsCatalogApi.reorderImages(v.id, v.orderedIds), onSuccess: inval }),
  };
};

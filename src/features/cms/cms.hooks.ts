import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import { notifyApiError } from '@/core/api/notify';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import {
  sectionApi, uploadCmsImage, homepageLookupApi,
  siteSettingsApi, contactPageApi, catalogPageApi,
  testimonialApi, contactMessageApi, creditSimApi, cmsCatalogApi,
} from './cms.api';
import type {
  SiteSettingsUpdate, ContactPage, CatalogPage,
  TestimonialForm, ContactStatus, CreditSimConfig,
  CmsCatalogPublishBody, CmsListParams, CmsUploadFolder,
} from './cms.types';

const toastOk = (message: string) => store.dispatch(showToast({ type: 'general', variant: 'success', title: 'Berhasil', message }));

/** `/cms/homepage/lookups` — merek & unit READY_STOCK untuk pilihan manual homepage (PRD §4.20). */
export const useHomepageLookup = (enabled = true) =>
  useQuery({ queryKey: ['lookup', 'cms-homepage', 'featured'], queryFn: () => homepageLookupApi.get(), enabled });

/* ── Section generik homepage/about ── */
export const useCmsSection = <T>(page: 'homepage' | 'about', section: string) =>
  useQuery({ queryKey: ['cms', page, section], queryFn: () => sectionApi.get<T>(page, section) });

export const useUpdateCmsSection = <T>(page: 'homepage' | 'about', section: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<T>) => sectionApi.update<T>(page, section, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms', page, section] }); toastOk('Perubahan disimpan'); },
  });
};

export const useUploadHeroImage = (page: 'homepage' | 'about') =>
  useMutation({ mutationFn: (file: File) => sectionApi.heroImage(page, file) });

export const useUploadCmsImage = (folder: CmsUploadFolder) =>
  useMutation({ mutationFn: (file: File) => uploadCmsImage(folder, file) });

/**
 * Form 1 section (homepage/about): load → seed state lokal → save (PUT partial).
 * Menyederhanakan editor per-section yang berulang.
 */
export function useSectionForm<T extends { isVisible?: boolean }>(page: 'homepage' | 'about', section: string) {
  const q = useCmsSection<T>(page, section);
  const m = useUpdateCmsSection<T>(page, section);
  const confirmAction = useConfirmedAction();
  const [draft, setDraft] = useState<T | null>(null);
  const form = draft ?? q.data ?? null;
  const setForm = setDraft;

  const patch = (p: Partial<T>) => setDraft((prev) => ({ ...(prev ?? q.data) as T, ...p }));
  const save = () => {
    if (!form) return;
    confirmAction({
      title: 'Simpan Perubahan',
      message: 'Perubahan section ini akan langsung tayang di situs publik. Lanjutkan?',
      confirmLabel: 'Simpan',
      tone: 'primary',
      execute: () => m.mutateAsync(form),
      onSuccess: () => setDraft(null),
      onError: (e) => notifyApiError(e),
    });
  };
  const toggleVisible = () => setDraft((prev) => {
    const current = prev ?? q.data;
    return current ? { ...current, isVisible: !current.isVisible } : null;
  });

  return { form, setForm, patch, save, toggleVisible, isLoading: q.isLoading, isError: q.isError, saving: m.isPending };
}

/* ── Site Settings ── */
export const useSiteSettings = () =>
  useQuery({ queryKey: ['cms', 'site-settings'], queryFn: siteSettingsApi.get });

/** Versi publik (tanpa auth) — dipakai layout/dashboard untuk branding. */
export const usePublicSiteSettings = () =>
  useQuery({ queryKey: ['public', 'site-settings'], queryFn: siteSettingsApi.getPublic, staleTime: 5 * 60_000 });

export const useSiteSettingsMutations = () => {
  const qc = useQueryClient();
  const inval = () => { qc.invalidateQueries({ queryKey: ['cms', 'site-settings'] }); qc.invalidateQueries({ queryKey: ['public', 'site-settings'] }); };
  return {
    update: useMutation({ mutationFn: (body: SiteSettingsUpdate) => siteSettingsApi.update(body), onSuccess: () => { inval(); toastOk('Pengaturan situs disimpan'); } }),
    uploadLogo: useMutation({ mutationFn: (file: File) => siteSettingsApi.uploadLogo(file), onSuccess: () => { inval(); toastOk('Logo diperbarui'); } }),
    uploadFavicon: useMutation({ mutationFn: (file: File) => siteSettingsApi.uploadFavicon(file), onSuccess: () => { inval(); toastOk('Favicon diperbarui'); } }),
  };
};

/* ── Header halaman ── */
export const useContactPage = () => useQuery({ queryKey: ['cms', 'contact-page'], queryFn: contactPageApi.get });
export const useUpdateContactPage = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: Partial<ContactPage>) => contactPageApi.update(body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms', 'contact-page'] }); toastOk('Header kontak disimpan'); } });
};
export const useCatalogPage = () => useQuery({ queryKey: ['cms', 'catalog-page'], queryFn: catalogPageApi.get });
export const useUpdateCatalogPage = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: Partial<CatalogPage>) => catalogPageApi.update(body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms', 'catalog-page'] }); toastOk('Header katalog disimpan'); } });
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
    setPublish: useMutation({ mutationFn: (v: { id: string; isPublished: boolean }) => testimonialApi.setPublish(v.id, v.isPublished), onSuccess: (_d, v) => { inval(); toastOk(v.isPublished ? 'Testimoni dipublikasikan' : 'Testimoni disembunyikan'); } }),
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
    setStatus: useMutation({ mutationFn: (v: { id: string; status: ContactStatus }) => contactMessageApi.setStatus(v.id, v.status), onSuccess: (_d, v) => { inval(); toastOk(v.status === 'REPLIED' ? 'Pesan ditandai dibalas' : v.status === 'ARCHIVED' ? 'Pesan diarsipkan' : 'Status pesan diperbarui'); } }),
    remove: useMutation({ mutationFn: (id: string) => contactMessageApi.remove(id), onSuccess: () => { inval(); toastOk('Pesan dihapus'); } }),
  };
};

/* ── Simulasi Kredit ── */
export const useCreditSimConfig = () => useQuery({ queryKey: ['cms', 'credit-sim'], queryFn: creditSimApi.get });
export const useCreditSimMutations = () => {
  const qc = useQueryClient();
  return { update: useMutation({ mutationFn: (body: Partial<CreditSimConfig>) => creditSimApi.update(body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms', 'credit-sim'] }); toastOk('Konfigurasi simulasi disimpan'); } }) };
};

/* ── Katalog CMS ── */
export const useCmsCatalog = (params: CmsListParams) =>
  useQuery({ queryKey: ['cms', 'catalog', params], queryFn: () => cmsCatalogApi.list(params) });
export const useCmsCatalogMutations = () => {
  const qc = useQueryClient();
  const inval = () => qc.invalidateQueries({ queryKey: ['cms', 'catalog'] });
  return {
    publish: useMutation({ mutationFn: (v: { id: string; body: CmsCatalogPublishBody }) => cmsCatalogApi.publish(v.id, v.body), onSuccess: () => { inval(); toastOk('Status publikasi katalog diperbarui'); } }),
    uploadImage: useMutation({ mutationFn: (v: { id: string; file: File }) => cmsCatalogApi.uploadImage(v.id, v.file), onSuccess: () => { inval(); toastOk('Foto ditambahkan'); } }),
    deleteImage: useMutation({ mutationFn: (v: { id: string; imageId: string }) => cmsCatalogApi.deleteImage(v.id, v.imageId), onSuccess: () => { inval(); toastOk('Foto dihapus'); } }),
    reorderImages: useMutation({ mutationFn: (v: { id: string; orderedIds: string[] }) => cmsCatalogApi.reorderImages(v.id, v.orderedIds), onSuccess: () => { inval(); toastOk('Urutan foto diperbarui'); } }),
  };
};

import { useState, type FormEvent } from 'react';
import { Send, CheckCircle2, MessageCircle, Loader2, ChevronDown, PhoneCall, MapPin, Clock3 } from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { buildWhatsAppUrl, waMessages } from '@/core/utils/whatsapp';
import { usePublicSiteSettings, usePublicContactPage, useSubmitContact } from './landing.hooks';
import { notifyApiError } from '@/core/api/notify';
import { Reveal } from '@/shared/components/Reveal';
import { BranchCard, ShowroomMap } from './ShowroomMap';
import { CustomerLoader, CustomerServerError } from './CustomerStates';

const inputClass = 'w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all';

export const KontakPage = () => {
  const { data: settings } = usePublicSiteSettings();
  const { data: page, isLoading, isError, refetch } = usePublicContactPage();
  const submitM = useSubmitContact();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', website: '' });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    submitM.mutate({ name: form.name, phone: form.phone, email: form.email || undefined, message: form.message, website: form.website }, {
      onSuccess: () => { setSent(true); setForm({ name: '', phone: '', email: '', message: '', website: '' }); }, onError: (error) => notifyApiError(error),
    });
  };
  const waUrl = buildWhatsAppUrl(settings?.whatsappNumber, waMessages.generalContact(settings?.companyName));
  const branches = page?.locations?.items ?? [];
  const faq = page?.faq;
  const primaryBranch = page?.primaryBranch ?? branches.find((branch) => branch.isMain) ?? settings?.primaryBranch ?? branches[0];
  const primaryPhone = primaryBranch?.phone || settings?.phone;
  const primaryWhatsapp = primaryBranch?.whatsappNumber || settings?.whatsappNumber;
  const primaryWaUrl = buildWhatsAppUrl(primaryWhatsapp, waMessages.generalContact(settings?.companyName));

  if (isLoading) return <CustomerLoader />;
  if (isError) return <CustomerServerError onRetry={() => refetch()} waUrl={waUrl} />;

  return <>
    <PublicHeader eyebrow={page?.hero?.eyebrow ?? 'Kontak'} title={page?.hero?.title ?? 'Temukan Showroom dan Hubungi Kami'} subtitle={page?.hero?.subtitle ?? ''} breadcrumb={[{ label: 'Beranda', to: '/' }, { label: 'Kontak' }]} />

    <section className="max-w-7xl mx-auto px-4 md:px-6 pt-10">
      <Reveal className="grid gap-4 md:grid-cols-3">
        <a href={primaryWaUrl} target="_blank" rel="noreferrer" className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-accent-green/40 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-accent-green/30">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-green/10 text-accent-green"><MessageCircle size={21} /></div>
          <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[.15em] text-muted">WhatsApp</p>
          <p className="mt-1 text-[15px] font-extrabold text-ink">{primaryWhatsapp || 'Belum diatur'}</p>
          <p className="mt-1 text-[12px] font-medium text-muted">Tanyakan ketersediaan unit langsung ke tim showroom.</p>
        </a>
        <a href={primaryPhone ? `tel:${primaryPhone.replace(/[^+\d]/g, '')}` : undefined} className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-primary"><PhoneCall size={21} /></div>
          <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[.15em] text-muted">Telepon showroom</p>
          <p className="mt-1 text-[15px] font-extrabold text-ink">{primaryPhone || 'Belum diatur'}</p>
          <p className="mt-1 text-[12px] font-medium text-muted">Hubungi pada jam operasional untuk bantuan langsung.</p>
        </a>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-primary"><MapPin size={21} /></div>{settings?.businessHours && <span className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2.5 py-1 text-[10px] font-bold text-muted"><Clock3 size={11} /> {settings.businessHours}</span>}</div>
          <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[.15em] text-muted">Alamat utama</p>
          <p className="mt-1 text-[15px] font-extrabold leading-snug text-ink">{primaryBranch?.lokasi || settings?.address || 'Belum diatur'}</p>
          <p className="mt-1 text-[12px] font-medium text-muted">{branches.length > 1 ? `${branches.length} titik showroom tersedia pada peta.` : 'Lihat titik showroom pada peta di bawah.'}</p>
        </div>
      </Reveal>
    </section>

    {page?.locations?.isVisible !== false && branches.length > 0 && <section className="max-w-7xl mx-auto px-4 md:px-6 py-12"><Reveal className="max-w-2xl mb-7"><p className="text-[12px] font-extrabold uppercase tracking-[.16em] text-primary">{page?.locations?.eyebrow}</p><h2 className="mt-2 text-2xl font-extrabold text-ink">{page?.locations?.title}</h2><p className="mt-2 text-sm font-medium text-muted">{page?.locations?.subtitle}</p></Reveal><ShowroomMap branches={branches} className="h-[360px] sm:h-[460px]" /><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{branches.map((branch) => <BranchCard key={branch.id} branch={branch} />)}</div></section>}

    <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid lg:grid-cols-[.75fr_1.25fr] gap-8 items-start">
      <Reveal className="rounded-[2rem] bg-ink p-7 text-white sticky top-24"><span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold">Respons cepat melalui WhatsApp</span><h2 className="mt-5 text-2xl font-extrabold">{page?.cta?.title ?? 'Butuh jawaban lebih cepat?'}</h2><p className="mt-2 text-sm font-medium leading-6 text-white/70">{page?.cta?.subtitle}</p><a href={waUrl} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent-green px-5 py-3.5 text-sm font-extrabold text-white"><MessageCircle size={18} />{page?.cta?.label ?? 'Konsultasi via WhatsApp'}</a></Reveal>
      <Reveal delay={100} className="bg-surface rounded-[2rem] border border-border p-6 md:p-8">
        {sent ? <div className="text-center py-12"><div className="w-16 h-16 rounded-2xl bg-accent-green/10 text-accent-green grid place-items-center mx-auto mb-4"><CheckCircle2 size={32} /></div><h3 className="text-xl font-extrabold text-ink">{page?.form?.successTitle ?? 'Pesan berhasil dikirim'}</h3><p className="text-muted font-medium mt-2">{page?.form?.successText}</p><button onClick={() => setSent(false)} className="mt-5 text-[13px] font-bold text-primary hover:underline">Kirim pesan lain</button></div> : <form onSubmit={submit} className="space-y-4"><div><h2 className="text-xl font-extrabold text-ink">{page?.form?.title ?? 'Ceritakan unit yang Anda cari'}</h2><p className="text-[13px] text-muted font-medium mt-1">{page?.form?.subtitle}</p></div><input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} className="hidden" aria-hidden="true" /><div className="grid sm:grid-cols-2 gap-4"><label className="text-[11px] font-bold uppercase tracking-wide text-muted">Nama<input required value={form.name} onChange={(e) => set('name', e.target.value)} className={`${inputClass} mt-1.5`} placeholder="Nama Anda" /></label><label className="text-[11px] font-bold uppercase tracking-wide text-muted">No. Telepon<input required value={form.phone} onChange={(e) => set('phone', e.target.value)} className={`${inputClass} mt-1.5`} placeholder="0812-xxxx-xxxx" /></label></div><label className="block text-[11px] font-bold uppercase tracking-wide text-muted">Email (opsional)<input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={`${inputClass} mt-1.5`} placeholder="email@contoh.com" /></label><label className="block text-[11px] font-bold uppercase tracking-wide text-muted">Pesan<textarea required value={form.message} onChange={(e) => set('message', e.target.value)} rows={5} className={`${inputClass} mt-1.5 h-auto py-3 resize-none`} placeholder="Unit seperti apa yang Anda cari?" /></label><button type="submit" disabled={submitM.isPending} className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3.5 shadow-glow disabled:opacity-60">{submitM.isPending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}{submitM.isPending ? 'Mengirim…' : page?.form?.submitLabel ?? 'Kirim Pesan'}</button></form>}
      </Reveal>
    </section>

    {faq?.isVisible !== false && (faq?.items?.length ?? 0) > 0 && <section className="max-w-4xl mx-auto px-4 md:px-6 py-12"><div className="text-center mb-8"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">{faq?.eyebrow}</p><h2 className="mt-2 text-2xl font-extrabold text-ink">{faq?.title}</h2></div><div className="space-y-3">{faq?.items?.map((item) => <details key={item.question} className="group rounded-2xl border border-border bg-surface p-5"><summary className="flex list-none cursor-pointer items-center justify-between font-extrabold text-ink">{item.question}<ChevronDown size={17} className="text-primary group-open:rotate-180" /></summary><p className="mt-3 text-[13px] font-medium leading-6 text-muted">{item.answer}</p></details>)}</div></section>}
  </>;
};

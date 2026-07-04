import { useState, type FormEvent } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { WHATSAPP_URL as DEFAULT_WA } from './publicNav';
import { usePublicSiteSettings, usePublicContactPage, useSubmitContact } from './landing.hooks';
import { notifyApiError } from '@/core/api/notify';
import { Reveal } from '@/shared/components/Reveal';

const inputClass = 'w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all';

export const KontakPage = () => {
  const { data: settings } = usePublicSiteSettings();
  const { data: page } = usePublicContactPage();
  const submitM = useSubmitContact();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', website: '' });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    submitM.mutate(
      { name: form.name, phone: form.phone, email: form.email || undefined, message: form.message, website: form.website },
      { onSuccess: () => { setSent(true); setForm({ name: '', phone: '', email: '', message: '', website: '' }); }, onError: (err) => notifyApiError(err) },
    );
  };

  const info = [
    { icon: MapPin, title: 'Alamat', value: settings?.address },
    { icon: Phone, title: 'Telepon', value: settings?.phone },
    { icon: Mail, title: 'Email', value: settings?.email },
    { icon: Clock, title: 'Jam Buka', value: settings?.businessHours },
  ].filter((i) => i.value);

  const waUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : DEFAULT_WA;
  const mapUrl = settings?.mapEmbedUrl || 'https://www.openstreetmap.org/export/embed.html?bbox=106.78%2C-6.30%2C106.86%2C-6.22&layer=mapnik';

  return (
    <>
      <PublicHeader
        eyebrow={page?.eyebrow ?? 'Kontak'}
        title={page?.title ?? 'Kami Siap Membantu'}
        subtitle={page?.subtitle ?? 'Punya pertanyaan tentang unit, kredit, atau test drive? Hubungi kami kapan saja.'}
        breadcrumb={[{ label: 'Beranda', to: '/' }, { label: 'Kontak' }]}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid lg:grid-cols-2 gap-8 items-start">
        <Reveal className="space-y-5">
          {info.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {info.map((i) => {
                const Icon = i.icon;
                return (
                  <div key={i.title} className="bg-surface rounded-2xl border border-border p-5">
                    <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3"><Icon size={20} strokeWidth={2.2} /></div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{i.title}</p>
                    <p className="text-[14px] font-bold text-ink mt-0.5 leading-snug">{i.value}</p>
                  </div>
                );
              })}
            </div>
          )}
          <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-accent-green text-white font-bold text-[14px] px-5 py-4 hover:brightness-95 transition-all">
            <MessageCircle size={19} /> Chat via WhatsApp
          </a>
          <div className="rounded-2xl overflow-hidden border border-border h-64 bg-surface-soft">
            <iframe title="Lokasi" src={mapUrl} className="w-full h-full" loading="lazy" />
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={100} className="bg-surface rounded-2xl border border-border p-6 md:p-8">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
              <h3 className="text-xl font-extrabold text-ink">Pesan Terkirim!</h3>
              <p className="text-muted font-medium mt-2">Terima kasih. Tim kami akan menghubungi Anda segera.</p>
              <button onClick={() => setSent(false)} className="mt-5 text-[13px] font-bold text-primary hover:underline">Kirim pesan lain</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-ink">Kirim Pesan</h2>
                <p className="text-[13px] text-muted font-medium mt-1">Isi formulir, kami balas secepatnya.</p>
              </div>
              {/* Honeypot anti-spam (harus tetap kosong) */}
              <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} className="hidden" aria-hidden="true" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Nama</label>
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="Nama Anda" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">No. Telepon</label>
                  <input required value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} placeholder="0812-xxxx-xxxx" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Email (opsional)</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Pesan</label>
                <textarea required value={form.message} onChange={(e) => set('message', e.target.value)} rows={5} className={`${inputClass} h-auto py-3 resize-none`} placeholder="Tulis pertanyaan Anda..." />
              </div>
              <button type="submit" disabled={submitM.isPending} className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-white font-bold text-[14px] px-5 py-3.5 shadow-glow hover:bg-primary-dark transition-colors disabled:opacity-60">
                {submitM.isPending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />} {submitM.isPending ? 'Mengirim…' : 'Kirim Pesan'}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </>
  );
};

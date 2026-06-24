import { Building2, User, Bell, Palette } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { CURRENT_USER, APP_NAME, APP_TAGLINE } from '@/shared/constants';

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</label>
    <input
      defaultValue={value}
      className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-surface-soft border border-border text-sm font-semibold text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
    />
  </div>
);

const Toggle = ({ label, desc, on = true }: { label: string; desc: string; on?: boolean }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-[13px] font-bold text-ink">{label}</p>
      <p className="text-[11px] text-muted font-medium">{desc}</p>
    </div>
    <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${on ? 'bg-primary' : 'bg-border'}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </div>
  </div>
);

export const PengaturanPage = () => {
  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Pengaturan" description="Kelola profil showroom, akun, dan preferensi aplikasi" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Profil Showroom" icon={<Building2 size={16} />}>
          <div className="space-y-4">
            <Field label="Nama Showroom" value={`${APP_NAME} — ${APP_TAGLINE}`} />
            <Field label="Cabang" value={CURRENT_USER.branch} />
            <Field label="Alamat" value="Jl. Raya Otomotif No. 88, Jakarta Selatan" />
            <Field label="Telepon" value="021-1500-888" />
          </div>
        </SectionCard>

        <SectionCard title="Akun" icon={<User size={16} />}>
          <div className="flex items-center gap-4 mb-5">
            <img src={CURRENT_USER.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            <div>
              <p className="font-extrabold text-ink">{CURRENT_USER.name}</p>
              <p className="text-[12px] text-muted font-semibold">{CURRENT_USER.role}</p>
              <button className="mt-2 text-[11px] font-bold text-primary hover:underline">Ganti Foto</button>
            </div>
          </div>
          <div className="space-y-4">
            <Field label="Nama Lengkap" value={CURRENT_USER.name} />
            <Field label="Email" value="admin@carsshowroom.id" />
          </div>
        </SectionCard>

        <SectionCard title="Notifikasi" icon={<Bell size={16} />}>
          <div className="divide-y divide-divider">
            <Toggle label="Lead Baru" desc="Notifikasi saat ada prospek masuk" />
            <Toggle label="Test Drive" desc="Pengingat jadwal test drive" />
            <Toggle label="Pembayaran" desc="Notifikasi pembayaran masuk" />
            <Toggle label="Rekondisi Selesai" desc="Saat unit selesai direkondisi" on={false} />
          </div>
        </SectionCard>

        <SectionCard title="Tampilan" icon={<Palette size={16} />}>
          <p className="text-[12px] font-bold text-ink mb-3">Tema Warna</p>
          <div className="flex gap-3">
            {['#D97757', '#2563EB', '#16A34A', '#7C3AED', '#E11933'].map((c, i) => (
              <button
                key={c}
                className={`w-10 h-10 rounded-xl shadow-sm transition-transform hover:scale-110 ${i === 0 ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted font-medium mt-3">Tema aktif: <span className="font-bold text-primary">Claude Orange</span></p>
        </SectionCard>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-5 py-2.5 rounded-xl bg-surface border border-border font-bold text-[13px] text-ink-soft hover:border-primary">Batal</button>
        <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[13px] shadow-glow hover:bg-primary-dark">Simpan Perubahan</button>
      </div>
    </div>
  );
};

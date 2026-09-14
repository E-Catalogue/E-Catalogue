import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/shared/components/Reveal';
import { buildWhatsAppUrl, waMessages } from '@/core/utils/whatsapp';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SUBANG_CAR_FAQS: FaqItem[] = [
  {
    question: 'Apakah bisa kredit mobil bekas di GM Mobilindo Subang dengan DP minim dan cicilan ringan?',
    answer:
      'Tentu bisa! GM Mobilindo bekerjasama dengan berbagai perusahaan pembiayaan (leasing) terkemuka dan terpercaya seperti BCA Finance, Mandiri Utama Finance, Adira Finance, dan leasing syariah. Kami menyediakan paket DP terjangkau mulai 10-15% dengan tenor fleksibel hingga 5 tahun, serta proses persetujuan cepat yang dibantu langsung oleh tim konsultan kami di Subang.',
  },
  {
    question: 'Apakah unit mobil bekas di GM Mobilindo bergaransi mesin dan bebas banjir/tabrakan?',
    answer:
      'Pasti bergaransi! Seluruh unit mobil siap pakai kami telah melewati proses inspeksi ketat lebih dari 100 titik oleh tim mekanik berpengalaman. Kami memberikan garansi mesin 1 bulan serta jaminan tertulis bahwa mobil bukan bekas banjir, bukan bekas tabrakan berat, dan nomor rangka/mesin sesuai dengan dokumen resmi.',
  },
  {
    question: 'Apakah melayani tukar tambah (trade-in) mobil lama segala merek di Subang?',
    answer:
      'Ya, kami menerima tukar tambah segala merek dan tipe mobil. Anda cukup membawa mobil lama Anda ke showroom kami di Subang untuk dilakukan appraisal (taksiran nilai pasar) secara transparan. Selisih harga dapat digunakan sebagai uang muka (DP) kredit atau diselesaikan secara tunai.',
  },
  {
    question: 'Bagaimana jika domisili KTP saya di luar Subang (misal Purwakarta, Karawang, atau Bandung)?',
    answer:
      'Pengajuan tetap dapat diproses dengan mudah! Kami melayani pembelian tunai maupun kredit untuk seluruh pelanggan di wilayah Jawa Barat dan sekitarnya. Syarat dokumen KTP daerah lain dapat dibantu proses survei dan kelengkapannya oleh tim leasing rekanan kami.',
  },
  {
    question: 'Apakah calon pembeli bisa melakukan test drive gratis sebelum membeli?',
    answer:
      'Sangat bisa dan kami anjurkan! Calon pembeli dipersilakan menguji langsung performa mesin, suspensi, dan kenyamanan mobil yang diminati. Anda bisa datang langsung ke showroom GM Mobilindo di Subang pada jam operasional, atau menghubungi tim sales kami via WhatsApp untuk membuat janji temu test drive gratis.',
  },
  {
    question: 'Bagaimana dengan keabsahan dan kelengkapan dokumen (BPKB, STNK, Faktur)?',
    answer:
      'Semua unit mobil dijamin 100% legalitas dokumennya. BPKB, STNK, Faktur, dan blanko kwitansi lengkap dicek keasliannya di Samsat. Kami juga siap membantu proses balik nama kendaraan, mutasi antar-daerah, maupun perpanjangan pajak tahunan untuk kenyamanan Anda.',
  },
];

interface FaqSectionProps {
  whatsappNumber?: string | null;
  companyName?: string;
}

export const FaqSection = ({ whatsappNumber, companyName = 'GM Mobilindo' }: FaqSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const waUrl = buildWhatsAppUrl(
    whatsappNumber,
    waMessages.generalContact(companyName),
  );

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-surface-soft border-t border-border relative overflow-hidden" id="faq">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-[12px] font-extrabold text-primary mb-3">
              <HelpCircle size={14} /> FAQ Mobil Bekas Subang
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-ink tracking-tight">
              Pertanyaan Seputar Beli Mobil Bekas di Subang
            </h2>
            <p className="mt-3 text-[14px] md:text-[15px] text-muted font-medium">
              Informasi lengkap seputar sistem kredit, garansi mesin, tukar tambah, dan syarat pembelian di {companyName}.
            </p>
          </div>
        </Reveal>

        <div className="space-y-3.5">
          {SUBANG_CAR_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={faq.question} delay={idx * 0.05}>
                <div
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-surface border-primary/40 shadow-card'
                      : 'bg-surface border-border hover:border-border-strong'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full py-4.5 px-5 md:px-6 text-left flex items-center justify-between gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[14px] md:text-[15px] font-extrabold text-ink leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'bg-primary text-white rotate-180'
                          : 'bg-surface-soft text-muted border border-border'
                      }`}
                    >
                      <ChevronDown size={17} strokeWidth={2.5} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 md:px-6 pb-5 pt-1 text-[13px] md:text-[14px] text-ink-soft leading-relaxed border-t border-divider/60 font-medium">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Bantuan konsultasi cepat via WhatsApp */}
        <Reveal delay={0.3}>
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-primary-light via-surface to-surface-soft border border-primary/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-glow">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-ink">Masih punya pertanyaan lain seputar mobil idaman?</h3>
                <p className="text-[13px] text-muted font-medium mt-0.5">
                  Konsultasikan simulasi kredit, ketersediaan unit, atau booking test drive bersama tim sales kami di Subang.
                </p>
              </div>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-[13px] font-extrabold text-white shadow-glow transition-all whitespace-nowrap shrink-0"
            >
              <MessageSquare size={16} /> Hubungi Sales via WhatsApp <ArrowRight size={15} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

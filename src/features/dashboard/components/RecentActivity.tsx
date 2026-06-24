import { Car, Wrench, UserPlus, ReceiptText, Wallet, type LucideIcon } from 'lucide-react';
import { ACTIVITIES } from '@/data/mock';
import type { ActivityType } from '@/data/types';

const ICONS: Record<ActivityType, { icon: LucideIcon; bg: string; text: string }> = {
  purchase: { icon: Car, bg: 'bg-primary/10', text: 'text-primary' },
  rekondisi: { icon: Wrench, bg: 'bg-accent-orange/10', text: 'text-accent-orange' },
  lead: { icon: UserPlus, bg: 'bg-accent-blue/10', text: 'text-accent-blue' },
  sale: { icon: ReceiptText, bg: 'bg-accent-green/10', text: 'text-accent-green' },
  payment: { icon: Wallet, bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
};

export const RecentActivity = () => (
  <div className="flex flex-col h-full">
    {ACTIVITIES.slice(0, 5).map((a) => {
      const { icon: Icon, bg, text } = ICONS[a.type];
      return (
        <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-soft transition-colors">
          <div className={`w-9 h-9 rounded-xl ${bg} ${text} flex items-center justify-center shrink-0`}>
            <Icon size={17} strokeWidth={2.3} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-ink leading-snug">{a.title}</p>
            <p className="text-[11px] text-muted font-medium truncate">{a.subtitle}</p>
          </div>
          <span className="text-[9px] text-muted font-semibold whitespace-nowrap pt-0.5">{a.time}</span>
        </div>
      );
    })}
    <button className="w-full mt-auto pt-2 py-2.5 rounded-xl bg-primary-light text-primary text-[11px] font-bold hover:bg-primary hover:text-white transition-colors">
      Lihat Semua Aktivitas
    </button>
  </div>
);

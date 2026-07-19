import {
  ShieldCheck, BadgeCheck, Wrench, HandCoins, FileSearch, Car, CheckCircle2, Star, Quote,
  Eye, Target, Heart, Award, Users, Calendar, Gauge, Fuel, Cog, Palette, Hash, MapPin,
  Sparkles, Clock, Phone, Mail, ThumbsUp, TrendingUp, Zap, Gift, Percent, Building2,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

/** Map nama ikon (kebab-case dari CMS) → komponen lucide-react. */
const MAP: Record<string, ComponentType<LucideProps>> = {
  'shield-check': ShieldCheck, 'badge-check': BadgeCheck, wrench: Wrench, 'hand-coins': HandCoins,
  'file-search': FileSearch, car: Car, 'check-circle-2': CheckCircle2, 'check-circle': CheckCircle2,
  star: Star, quote: Quote, eye: Eye, target: Target, heart: Heart, award: Award, users: Users,
  calendar: Calendar, gauge: Gauge, fuel: Fuel, cog: Cog, palette: Palette, hash: Hash, 'map-pin': MapPin,
  sparkles: Sparkles, clock: Clock, phone: Phone, mail: Mail, 'thumbs-up': ThumbsUp,
  'trending-up': TrendingUp, zap: Zap, gift: Gift, percent: Percent, 'building-2': Building2,
};

/** Render ikon dari string nama CMS (fallback ShieldCheck). */
export const Ic = ({ name, ...props }: { name?: string } & LucideProps) => {
  const Cmp = (name && MAP[name]) || ShieldCheck;
  return <Cmp {...props} />;
};

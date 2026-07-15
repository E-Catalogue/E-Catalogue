import { icons, CircleDot, type LucideIcon } from 'lucide-react';

/**
 * Backend mengirim nama ikon persis seperti nama ikon lucide dalam kebab-case,
 * mis. "layout-dashboard", "package-search", "chart-no-axes-combined".
 *
 * Daripada memelihara peta manual (yang pasti ketinggalan tiap menu baru di-seed),
 * nama itu dikonversi ke PascalCase lalu dicari langsung di registry `icons` lucide.
 */
const toPascalCase = (name: string): string =>
  name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const cache = new Map<string, LucideIcon>();

export const getIconComponent = (iconName?: string | null): LucideIcon => {
  if (!iconName) return CircleDot;

  const cached = cache.get(iconName);
  if (cached) return cached;

  const key = toPascalCase(iconName.trim()) as keyof typeof icons;
  const icon = (icons[key] as LucideIcon | undefined) ?? CircleDot;

  cache.set(iconName, icon);
  return icon;
};

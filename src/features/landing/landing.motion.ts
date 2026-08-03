import type { Variants } from 'framer-motion';

/** Container yang men-stagger anak-anaknya saat masuk viewport. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/** Item naik + fade dengan pegas lembut. */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 16, mass: 0.9 } },
};

/** Item skala + fade (untuk kartu/gambar). */
export const scaleItem: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

/** Container hero dengan cascade lebih terasa. */
export const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

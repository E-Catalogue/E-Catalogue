import { type ReactNode, forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface RevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  /** Delay animasi dalam detik; angka > 10 diperlakukan sebagai milidetik. */
  delay?: number;
  className?: string;
}

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(({ children, delay = 0, className = '', ...rest }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-6% 0px -6% 0px' }}
    transition={{
      type: 'spring', stiffness: 55, damping: 18, mass: 1.05,
      delay: delay > 10 ? delay / 1000 : delay,
    }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
));

Reveal.displayName = 'Reveal';

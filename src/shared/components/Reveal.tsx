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
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
    transition={{
      type: 'spring', stiffness: 70, damping: 15, mass: 1,
      delay: delay > 10 ? delay / 1000 : delay,
    }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
));

Reveal.displayName = 'Reveal';

import { type ReactNode, forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface RevealProps extends Omit<HTMLMotionProps<"div">, "as"> {
  children: ReactNode;
  /** Delay animasi dalam detik (misal: 0.1) untuk efek berurutan. */
  delay?: number;
  className?: string;
  as?: any;
}

export const Reveal = forwardRef<HTMLElement, RevealProps>(({ children, delay = 0, className = '', as = 'div', ...rest }, ref) => {
  // Gunakan motion.create(as) untuk framer-motion versi terbaru
  const MotionComponent = motion.create(as as any) as any;
  
  return (
    <MotionComponent
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ 
        type: 'spring',
        stiffness: 70,
        damping: 15,
        mass: 1,
        delay: delay > 10 ? delay / 1000 : delay,
      }}
      className={className}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
});

Reveal.displayName = 'Reveal';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import { motionTokens } from '../../theme';

type GlassCardProps = PropsWithChildren<
  HTMLMotionProps<'article'> & {
    solid?: boolean;
  }
>;

export function GlassCard({ children, className = '', solid = false, ...props }: GlassCardProps) {
  return (
    <motion.article
      className={`glass-card ${solid ? 'glass-card--solid' : ''} ${className}`}
      whileHover={{ y: motionTokens.liftY }}
      transition={{ duration: motionTokens.normal, ease: motionTokens.easeSoft }}
      {...props}
    >
      {children}
    </motion.article>
  );
}

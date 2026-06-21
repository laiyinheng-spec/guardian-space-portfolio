import { motion } from 'framer-motion';
import { motionTokens } from '../../theme';
import { GlassCard } from './GlassCard';

type StatCardProps = {
  value: string;
  label: string;
  labelCn: string;
  note: string;
};

export function StatCard({ value, label, labelCn, note }: StatCardProps) {
  return (
    <GlassCard className="stat-card" solid>
      <motion.span
        className="stat-card__value"
        initial={{ opacity: 0, y: motionTokens.numberY }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: motionTokens.viewportCardAmount }}
        transition={{ duration: motionTokens.slow, ease: motionTokens.easeSoft }}
      >
        {value}
      </motion.span>
      <span className="stat-card__label">
        {label}
        <span>{labelCn}</span>
      </span>
      <span className="stat-card__note">{note}</span>
    </GlassCard>
  );
}

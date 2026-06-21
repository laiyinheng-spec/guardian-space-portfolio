import type { LucideIcon } from 'lucide-react';
import { motionTokens } from '../../theme';
import { GlassCard } from './GlassCard';

type InfoCardProps = {
  icon: LucideIcon;
  title: string;
  titleCn: string;
  description: string;
  note?: string;
};

export function InfoCard({ icon: Icon, title, titleCn, description, note }: InfoCardProps) {
  return (
    <GlassCard className="info-card" solid>
      <span className="info-card__icon" aria-hidden="true">
        <Icon size={motionTokens.iconDrawSize} strokeWidth={motionTokens.iconStrokeWidth} />
      </span>
      <h3>
        {title}
        <span>{titleCn}</span>
      </h3>
      <p>{description}</p>
      {note ? <span className="info-card__note">{note}</span> : null}
    </GlassCard>
  );
}

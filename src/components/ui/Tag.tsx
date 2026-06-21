import { motion } from 'framer-motion';
import { motionTokens } from '../../theme';

type TagProps = {
  children: string;
};

export function Tag({ children }: TagProps) {
  return (
    <motion.span
      className="tag"
      whileHover={{ y: motionTokens.tagLiftY, scale: motionTokens.tagScaleHover }}
      transition={{ duration: motionTokens.fast, ease: motionTokens.easeSoft }}
    >
      {children}
    </motion.span>
  );
}

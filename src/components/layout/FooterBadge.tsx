import { motion } from 'framer-motion';
import { WavingIndianFlag } from './WavingIndianFlag';

export function FooterBadge() {
  return (
    <motion.div
      className="footer-badge"
      initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient particles */}
      <span className="footer-badge__particle footer-badge__particle--1" aria-hidden />
      <span className="footer-badge__particle footer-badge__particle--2" aria-hidden />
      <span className="footer-badge__particle footer-badge__particle--3" aria-hidden />

      {/* Border shimmer sweep */}
      <span className="footer-badge__shimmer" aria-hidden />
      <span className="footer-badge__glow-ring" aria-hidden />

      <p className="footer-badge__content">
        <span className="footer-badge__text">Made with</span>
        <span className="footer-badge__heart" role="img" aria-label="love">
          <span className="footer-badge__heart-icon" aria-hidden>
            ❤️
          </span>
          <span className="footer-badge__heart-glow" aria-hidden />
        </span>
        <span className="footer-badge__text">by</span>
        <span className="footer-badge__name">Ashish Nandan</span>
        <span className="footer-badge__flag">
          <WavingIndianFlag variant="premium" />
        </span>
      </p>
    </motion.div>
  );
}

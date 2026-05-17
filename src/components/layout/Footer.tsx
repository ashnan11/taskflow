import { motion } from 'framer-motion';
import { WavingIndianFlag } from './WavingIndianFlag';

export function Footer() {
  return (
    <footer
      className="relative shrink-0 border-t border-slate-200/80 bg-white/50 px-4 py-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 sm:py-10"
      role="contentinfo"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent dark:via-violet-500/40"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
      />

      <motion.div
        className="mx-auto flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
      >
        <motion.div
          className="creator-credit group relative flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-2 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/90 via-slate-50/80 to-brand-50/30 px-5 py-3.5 shadow-sm dark:border-slate-700/60 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-brand-950/20 sm:gap-x-2.5 sm:px-7 sm:py-4"
          whileHover={{ scale: 1.02, y: -1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-500/0 via-brand-400/10 to-violet-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:via-brand-500/15"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-brand-400/20 via-transparent to-violet-400/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100 dark:from-brand-500/25 dark:to-violet-500/25"
            aria-hidden
          />

          <p className="relative z-10 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[13px] leading-relaxed tracking-wide text-slate-600 dark:text-slate-400 sm:text-sm">
            <span className="font-medium text-slate-500 dark:text-slate-500">Made with</span>
            <motion.span
              className="inline-flex text-rose-500 drop-shadow-sm dark:text-rose-400"
              aria-hidden
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              ❤️
            </motion.span>
            <span className="font-medium text-slate-500 dark:text-slate-500">by</span>
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-violet-600 bg-clip-text font-semibold text-transparent dark:from-brand-400 dark:via-brand-300 dark:to-violet-400">
              Ashish Nandan
            </span>
            <span className="inline-flex items-center gap-1.5 pl-0.5 sm:pl-1">
              <WavingIndianFlag />
            </span>
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}

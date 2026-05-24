import { FooterBadge } from './FooterBadge';

export function Footer() {
  return (
    <footer
      className="relative flex shrink-0 justify-center border-t border-slate-200/40 bg-transparent px-4 py-8 dark:border-slate-800/40 sm:py-10"
      role="contentinfo"
    >
      <FooterBadge />
    </footer>
  );
}

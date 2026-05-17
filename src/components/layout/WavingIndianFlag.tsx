/** Small stylized Indian flag with a smooth waving animation */
export function WavingIndianFlag() {
  return (
    <span
      className="flag-wave-container inline-flex shrink-0 align-middle"
      role="img"
      aria-label="India"
    >
      <span className="flag-pole" aria-hidden />
      <span className="flag-wave" aria-hidden>
        <svg
          viewBox="0 0 36 24"
          className="h-[18px] w-[27px] sm:h-5 sm:w-[30px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="flag-clip">
              <rect width="36" height="24" rx="1.5" />
            </clipPath>
            <radialGradient id="flag-shine" cx="30%" cy="40%" r="65%">
              <stop offset="0%" stopColor="white" stopOpacity="0.22" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g clipPath="url(#flag-clip)">
            <rect width="36" height="8" fill="#FF9933" />
            <rect y="8" width="36" height="8" fill="#FFFFFF" />
            <rect y="16" width="36" height="8" fill="#138808" />
            <circle cx="18" cy="12" r="3.2" fill="none" stroke="#000080" strokeWidth="0.65" />
            <circle cx="18" cy="12" r="0.9" fill="#000080" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = 18 + 2.2 * Math.cos(angle);
              const y = 12 + 2.2 * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="0.28" fill="#000080" />;
            })}
            <rect width="36" height="24" fill="url(#flag-shine)" />
          </g>
          <rect
            width="36"
            height="24"
            rx="1.5"
            fill="none"
            stroke="currentColor"
            className="text-slate-300/60 dark:text-slate-600/50"
            strokeWidth="0.5"
          />
        </svg>
        <span className="flag-wave-layer flag-wave-layer-2" aria-hidden>
          <svg viewBox="0 0 36 24" className="h-[18px] w-[27px] sm:h-5 sm:w-[30px]" aria-hidden>
            <rect width="36" height="8" fill="#FF9933" opacity="0.15" />
            <rect y="8" width="36" height="8" fill="#FFFFFF" opacity="0.1" />
            <rect y="16" width="36" height="8" fill="#138808" opacity="0.15" />
          </svg>
        </span>
      </span>
    </span>
  );
}

interface BayCarIconProps {
  bodyType: 'SEDAN' | 'SUV';
  className?: string;
}

// Vista superior en contorno, color heredado vía currentColor.
export function BayCarIcon({ bodyType, className }: BayCarIconProps) {
  if (bodyType === 'SUV') {
    return (
      <svg viewBox="0 0 40 64" fill="none" className={className} aria-hidden>
        <rect x="6" y="4" width="28" height="56" rx="8" stroke="currentColor" strokeWidth="2" />
        <rect x="10" y="10" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="42" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="27" x2="0" y2="27" stroke="currentColor" strokeWidth="2" />
        <line x1="6" y1="37" x2="0" y2="37" stroke="currentColor" strokeWidth="2" />
        <line x1="34" y1="27" x2="40" y2="27" stroke="currentColor" strokeWidth="2" />
        <line x1="34" y1="37" x2="40" y2="37" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 64" fill="none" className={className} aria-hidden>
      <rect x="8" y="6" width="24" height="52" rx="10" stroke="currentColor" strokeWidth="2" />
      <rect x="12" y="12" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="42" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="26" x2="2" y2="26" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="36" x2="2" y2="36" stroke="currentColor" strokeWidth="2" />
      <line x1="32" y1="26" x2="38" y2="26" stroke="currentColor" strokeWidth="2" />
      <line x1="32" y1="36" x2="38" y2="36" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

type IconProps = { className?: string };

export function ChipIcon({ label, className }: IconProps & { label: 'CPU' | 'GPU' | 'RAM' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      {label === 'CPU' && <path d="M7 3v3m5-3v3m5-3v3M7 18v3m5-3v3m5-3v3M1 9h2m-2 6h2m18-6h2m-2 6h2" />}
      {label === 'GPU' && <path d="M1 8v8m22-6v4M7 18l-2 3m12-3 2 3M7 4v2m10-2v2" />}
      {label === 'RAM' && <path d="M6 18v3m3-3v3m6-3v3m3-3v3M1 10h2m18 4h2" />}
      <text x="12" y="14.2" textAnchor="middle" fill="currentColor" stroke="none" fontSize="6.2" fontWeight="800">{label}</text>
    </svg>
  );
}

export function WindowsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m2 5 8.5-1.3v7.5H2zm10-1.5L22 2v9.2H12zM2 12.8h8.5v7.5L2 19zm10 0h10V22l-10-1.5z" />
    </svg>
  );
}

export function MotherboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 3h16v15h-4v3H4zM7 16h6m-6 2h4m6-11v6" />
      <rect x="7" y="7" width="6" height="6" rx="1" />
    </svg>
  );
}

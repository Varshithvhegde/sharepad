export default function NotebookMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="4.5" y="2.5" width="18" height="21" fill="#fff" stroke="var(--ink)" strokeWidth="1.8" />
      <line x1="9" y1="2.5" x2="9" y2="23.5" stroke="var(--red)" strokeWidth="1.4" />
      <line x1="12" y1="8" x2="19" y2="8" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="12" x2="19" y2="12" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="16" x2="16" y2="16" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="1.5" y="5" width="4" height="2.6" fill="var(--sticky-y)" stroke="var(--ink)" strokeWidth="1.2" />
      <rect x="1.5" y="11" width="4" height="2.6" fill="var(--sticky-b)" stroke="var(--ink)" strokeWidth="1.2" />
    </svg>
  );
}

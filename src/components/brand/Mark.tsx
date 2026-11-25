/**
 * Símbolo provisório: lua crescente + orelha de lobo costurada.
 * Troque por um logo oficial quando houver (mantenha o viewBox quadrado).
 */
export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M11 29 L14 10 L20 17 L26 10 L29 29 Q20 34 11 29 Z" fill="currentColor" />
      <path d="M15.5 23.5 q1.5 -1.4 3 0 M21.5 23.5 q1.5 -1.4 3 0" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

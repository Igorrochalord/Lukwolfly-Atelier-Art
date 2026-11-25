import type { Slot } from "@/lib/schema";
import { cn } from "@/lib/cn";

/** Indicador de vagas: ponto pulsante verde (abertas) ou cinza (fechadas). */
export function SlotBadge({ slot, className }: { slot: Slot; className?: string }) {
  const label = slot.open ? (slot.slots > 0 ? `${slot.slots} ${slot.slots === 1 ? "vaga aberta" : "vagas abertas"}` : "Vagas abertas") : "Vagas fechadas";
  return (
    <span className={cn("chip bg-ink-3 text-text shadow-[inset_0_0_0_1px_var(--color-line-2)]", className)}>
      <span className={cn("size-2 rounded-full", slot.open ? "animate-pulse-dot bg-lime text-lime" : "bg-mute")} />
      {label}
      {slot.note && <span className="text-mute">· {slot.note}</span>}
    </span>
  );
}

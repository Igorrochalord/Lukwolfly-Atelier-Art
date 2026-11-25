import { SlotsEditor } from "@/components/admin/SlotsEditor";
import { repo } from "@/lib/repo";

export default function AdminSlots() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">Vagas</h1>
        <p className="max-w-md text-sm text-mute">Abre/fecha vagas de cada serviço. Os selos aparecem na home, nas páginas e na agenda.</p>
      </div>
      <SlotsEditor slots={repo.slots.get()} />
    </>
  );
}

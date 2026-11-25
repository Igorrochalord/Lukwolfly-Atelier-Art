import { KanbanEditor } from "@/components/admin/KanbanEditor";
import { repo } from "@/lib/repo";

export default function AdminBoard() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">Quadro de desenhos</h1>
        <p className="max-w-md text-sm text-mute">Arraste os cards entre as colunas (ou use as setas no celular). Tudo aqui aparece em /agenda — use só o apelido do cliente.</p>
      </div>
      <KanbanEditor cards={repo.board.list()} />
    </>
  );
}

import { ProgressEditor } from "@/components/admin/ProgressEditor";
import { repo } from "@/lib/repo";

export default function AdminProgress() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">Progresso</h1>
        <p className="max-w-md text-sm text-mute">Clique na etapa para avançar — salva na hora. Fursuits, pelúcias e acessórios em produção.</p>
      </div>
      <ProgressEditor items={repo.progress.list()} />
    </>
  );
}

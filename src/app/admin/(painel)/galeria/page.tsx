import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { repo } from "@/lib/repo";

export default function AdminGallery() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">Galeria</h1>
        <p className="max-w-md text-sm text-mute">Publique fotos de fursuits, artes, pelúcias e acessórios. A imagem é otimizada automaticamente. Lembre: galeria pública é só SFW.</p>
      </div>
      <GalleryEditor items={repo.gallery.list()} />
    </>
  );
}

import media from "./media.json";
import type { BoardCard, GalleryItem, ProgressItem, Slots } from "@/lib/schema";

/**
 * SEED — dados iniciais gravados no banco na 1ª vez que o site sobe.
 * Depois disso, tudo é editado pelo painel /admin.
 */
type Media = { id: string; category: string; src: string; width: number; height: number; blur: string };
const m = Object.fromEntries((media as Media[]).map((x) => [x.id, x]));

type Seed = Omit<GalleryItem, "src" | "width" | "height" | "blur" | "position" | "featured"> & { featured?: boolean };
const items: Seed[] = [
  { id: "fursuit-heads", category: "fursuit", title: "Coleção de heads", tag: "Heads", status: "entregue", caption: "Sete cabeças, sete personalidades — de lobo a mamute.", alt: "Sete cabeças de fursuit coloridas — lobos, felino, hiena e mamute — sobre fundo de folhas de outono", featured: true },
  { id: "pelucias-colagem", category: "pelucias", title: "Turma das pelúcias", tag: "Coleção", status: "entregue", caption: "Seis personagens em pelúcia de ~60 cm.", alt: "Colagem com seis pelúcias de personagens furry", featured: true },
  { id: "pelucia-01", category: "pelucias", title: "Moicano neon", tag: "60 cm", status: "entregue", caption: "Cinza com detalhes ciano e verde-limão.", alt: "Pelúcia cinza com moicano verde e listras azuis e verdes" },
  { id: "pelucia-02", category: "pelucias", title: "Cachecol azul", tag: "60 cm", status: "entregue", caption: "Preto e branco, olhos heterocromáticos.", alt: "Pelúcia preta e branca com cachecol azul e olhos de cores diferentes" },
  { id: "pelucia-03", category: "pelucias", title: "Lobo de bermuda", tag: "60 cm", status: "entregue", caption: "Marrom, com dentinho e bermuda jeans.", alt: "Pelúcia de lobo marrom com bermuda azul" },
  { id: "pelucia-04", category: "pelucias", title: "Pintas celestes", tag: "60 cm", status: "entregue", caption: "Orelhas enormes e manchas azuis.", alt: "Pelúcia cinza com manchas azul-claro e orelhas grandes" },
  { id: "pelucia-05", category: "pelucias", title: "Raposa de regata", tag: "60 cm", status: "entregue", caption: "Com roupinha e tiara personalizadas.", alt: "Pelúcia de raposa laranja com regata cinza e bermuda" },
  { id: "pelucia-06", category: "pelucias", title: "Cachecol mostarda", tag: "60 cm", status: "entregue", caption: "Patas e nariz verde-limão.", alt: "Pelúcia preta e cinza com cachecol amarelo e patas verdes" },
  { id: "arte-badge-joy", category: "artes", title: "Joy", tag: "Badge física", status: "entregue", caption: "Badge impressa, frente e verso.", alt: "Badge física de mamute chamado Joy, com moldura de bolhas azuis", featured: true },
  { id: "arte-ref-m4jor", category: "artes", title: "M4jor", tag: "Referência", status: "entregue", caption: "Ref sheet completa com paleta.", alt: "Folha de referência de lobo cinza chamado M4jor, frente e costas com paleta de cores" },
  { id: "arte-halfbody-hiena", category: "artes", title: "Hiena", tag: "Halfbody", status: "entregue", caption: "Pose de força, regata de caveira.", alt: "Halfbody de hiena musculosa com regata preta de caveira" },
  { id: "arte-badge-seth", category: "artes", title: "Seth", tag: "Badge digital", status: "entregue", caption: "Versão digital pronta pra impressão.", alt: "Badge digital de felino de óculos chamado Seth com fundo listrado amarelo" },
  { id: "arte-headshot-cavalo", category: "artes", title: "Appaloosa", tag: "Headshot", status: "entregue", caption: "Headshot com fundo geométrico.", alt: "Headshot de cavalo branco com manchas pretas e argola no focinho" },
];

export const seedGallery: GalleryItem[] = items
  .filter((i) => m[i.id])
  .map((i, position) => ({
    ...i,
    featured: i.featured ?? false,
    position,
    src: m[i.id].src,
    width: m[i.id].width,
    height: m[i.id].height,
    blur: m[i.id].blur,
  }));

const now = new Date().toISOString();
export const seedBoard: BoardCard[] = [
  { id: "b1", title: "Headshot — raposa ártica", client: "Neve", kind: "Headshot", column: "fila", position: 0, note: "", updatedAt: now },
  { id: "b2", title: "Badge física", client: "Kito", kind: "Badge física", column: "fila", position: 1, note: "", updatedAt: now },
  { id: "b3", title: "Ref sheet — dragão", client: "Ember", kind: "Referência", column: "rascunho", position: 0, note: "Aprovando pose", updatedAt: now },
  { id: "b4", title: "Fullbody + 1 extra", client: "Tobi", kind: "Fullbody", column: "lineart", position: 0, note: "", updatedAt: now },
  { id: "b5", title: "Halfbody — hiena", client: "Rex", kind: "Halfbody", column: "cor", position: 0, note: "", updatedAt: now },
  { id: "b6", title: "Badge digital", client: "Seth", kind: "Badge digital", column: "finalizado", position: 0, note: "", updatedAt: now },
];

export const seedProgress: ProgressItem[] = [
  { id: "p1", title: "Partial — lobo cinza", client: "M4jor", kind: "fursuit", stage: 2, eta: "Fev/2027", note: "Pelo internacional chegou", position: 0, updatedAt: now },
  { id: "p2", title: "Head — felino", client: "Seth", kind: "fursuit", stage: 0, eta: "Mar/2027", note: "", position: 1, updatedAt: now },
  { id: "p3", title: "Pelúcia 60 cm", client: "Joy", kind: "pelucia", stage: 4, eta: "Dez/2026", note: "", position: 2, updatedAt: now },
];

export const seedSlots: Slots = {
  fursuit: { open: true, slots: 1, note: "Sob consulta" },
  artes: { open: true, slots: 5, note: "" },
  pelucias: { open: true, slots: 1, note: "Vaga com desconto" },
  acessorios: { open: false, slots: 0, note: "Em breve" },
};

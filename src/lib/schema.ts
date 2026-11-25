import { z } from "zod";

/* ─── categorias e estados ─────────────────────────────────── */

export const CATEGORIES = ["fursuit", "artes", "pelucias", "acessorios"] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_LABEL: Record<Category, string> = {
  fursuit: "Fursuit",
  artes: "Arte",
  pelucias: "Pelúcia",
  acessorios: "Acessório",
};

export const ITEM_STATUS = ["portfolio", "disponivel", "producao", "entregue"] as const;
export type ItemStatus = (typeof ITEM_STATUS)[number];
export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  portfolio: "Portfólio",
  disponivel: "Disponível",
  producao: "Em produção",
  entregue: "Entregue",
};

export interface GalleryItem {
  id: string;
  category: Category;
  title: string;
  caption: string;
  alt: string;
  tag: string;
  status: ItemStatus;
  src: string;
  width: number;
  height: number;
  blur: string;
  featured: boolean;
  position: number;
}

/* ─── quadro de desenhos (estilo Trello) ──────────────────── */

export const BOARD_COLUMNS = ["fila", "rascunho", "lineart", "cor", "finalizado"] as const;
export type BoardColumn = (typeof BOARD_COLUMNS)[number];
export const BOARD_COLUMN_LABEL: Record<BoardColumn, string> = {
  fila: "Na fila",
  rascunho: "Rascunho",
  lineart: "Lineart",
  cor: "Cor & sombra",
  finalizado: "Finalizado",
};

export interface BoardCard {
  id: string;
  title: string;
  client: string;
  kind: string;
  column: BoardColumn;
  position: number;
  note: string;
  updatedAt: string;
}

/* ─── progresso de fursuits / pelúcias ────────────────────── */

export const PROGRESS_KINDS = ["fursuit", "pelucia", "acessorio"] as const;
export type ProgressKind = (typeof PROGRESS_KINDS)[number];
export const PROGRESS_KIND_LABEL: Record<ProgressKind, string> = {
  fursuit: "Fursuit",
  pelucia: "Pelúcia",
  acessorio: "Acessório",
};
export const STAGES = ["Base", "Padrão", "Pelo", "Costura", "Detalhes", "Entrega"] as const;

export interface ProgressItem {
  id: string;
  title: string;
  client: string;
  kind: ProgressKind;
  stage: number; // 0..STAGES.length-1 (etapa atual); STAGES.length = concluído
  eta: string;
  note: string;
  position: number;
  updatedAt: string;
}

/* ─── vagas ────────────────────────────────────────────────── */

export interface Slot {
  open: boolean;
  slots: number;
  note: string;
}
export type Slots = Record<"fursuit" | "artes" | "pelucias" | "acessorios", Slot>;

/* ─── pedidos de orçamento ────────────────────────────────── */

export const ORDER_KINDS = ["fursuit", "arte", "pelucia", "acessorio"] as const;
export type OrderKind = (typeof ORDER_KINDS)[number];
export const ORDER_KIND_LABEL: Record<OrderKind, string> = {
  fursuit: "Fursuit",
  arte: "Arte digital",
  pelucia: "Pelúcia",
  acessorio: "Acessório",
};

export const ORDER_STATUS = ["novo", "conversando", "aceito", "recusado", "arquivado"] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  novo: "Novo",
  conversando: "Conversando",
  aceito: "Aceito",
  recusado: "Recusado",
  arquivado: "Arquivado",
};

const opt = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres.`).optional().default("");

export const OrderSchema = z.object({
  kind: z.enum(ORDER_KINDS, { error: "Escolha o tipo de pedido." }),
  name: z.string().trim().min(2, "Diga como podemos te chamar.").max(80, "Nome muito longo."),
  email: z.email({ error: "E-mail inválido." }).trim().max(160),
  telegram: z
    .string()
    .trim()
    .regex(/^@?[A-Za-z0-9_]{4,32}$/, "Use seu @ do Telegram (ex.: @lukwolfly).")
    .transform((v) => (v.startsWith("@") ? v : `@${v}`)),
  option: opt(60),
  fur: opt(30),
  refs: opt(400),
  extras: opt(120),
  message: z.string().trim().min(10, "Conte um pouco mais (mín. 10 caracteres).").max(2000, "Máximo de 2000 caracteres."),
  /** honeypot: humanos não veem este campo */
  website: z.string().max(0).optional().default(""),
});
export type OrderInput = z.infer<typeof OrderSchema>;

export interface Order extends Omit<OrderInput, "website"> {
  id: string;
  status: OrderStatus;
  createdAt: string;
}

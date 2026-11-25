"use server";

import { revalidatePath } from "next/cache";

import { repo } from "@/lib/repo";
import {
  BOARD_COLUMNS,
  CATEGORIES,
  ITEM_STATUS,
  ORDER_STATUS,
  PROGRESS_KINDS,
  type BoardColumn,
  type Category,
  type ItemStatus,
  type OrderStatus,
  type ProgressKind,
  type Slots,
} from "@/lib/schema";
import { requireAdmin } from "@/lib/session";
import { deleteUpload, saveUpload } from "@/lib/upload";

const str = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);
const oneOf = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);

function refresh() {
  revalidatePath("/", "layout");
}

/* ─── pedidos ───────────────────────────────────────────── */
export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  repo.orders.setStatus(str(id, 40), oneOf(ORDER_STATUS, status, "novo"));
  refresh();
}
export async function deleteOrder(id: string) {
  await requireAdmin();
  repo.orders.remove(str(id, 40));
  refresh();
}

/* ─── quadro ────────────────────────────────────────────── */
type CardInput = { title: string; client: string; kind: string; note: string };
const card = (c: CardInput) => ({ title: str(c.title, 120) || "Sem título", client: str(c.client, 60), kind: str(c.kind, 40), note: str(c.note, 300) });

export async function addCard(c: CardInput & { column?: BoardColumn }) {
  await requireAdmin();
  const id = repo.board.add({ ...card(c), column: oneOf(BOARD_COLUMNS, c.column, "fila") });
  refresh();
  return id;
}
export async function updateCard(id: string, c: CardInput) {
  await requireAdmin();
  repo.board.update(str(id, 40), card(c));
  refresh();
}
export async function moveCard(id: string, column: BoardColumn, index: number) {
  await requireAdmin();
  repo.board.move(str(id, 40), oneOf(BOARD_COLUMNS, column, "fila"), Math.max(0, Math.floor(Number(index) || 0)));
  refresh();
}
export async function deleteCard(id: string) {
  await requireAdmin();
  repo.board.remove(str(id, 40));
  refresh();
}

/* ─── progresso ─────────────────────────────────────────── */
type ProgInput = { title: string; client: string; kind: ProgressKind; eta: string; note: string };
const prog = (p: ProgInput) => ({
  title: str(p.title, 120) || "Sem título",
  client: str(p.client, 60),
  kind: oneOf(PROGRESS_KINDS, p.kind, "fursuit"),
  eta: str(p.eta, 30),
  note: str(p.note, 200),
});

export async function addProgress(p: ProgInput) {
  await requireAdmin();
  repo.progress.add(prog(p));
  refresh();
}
export async function updateProgress(id: string, p: ProgInput & { stage: number }) {
  await requireAdmin();
  repo.progress.update(str(id, 40), { ...prog(p), stage: Number(p.stage) || 0 });
  refresh();
}
export async function deleteProgress(id: string) {
  await requireAdmin();
  repo.progress.remove(str(id, 40));
  refresh();
}

/* ─── galeria ───────────────────────────────────────────── */
export type UploadState = { ok?: boolean; error?: string };

export async function uploadItem(_prev: UploadState, form: FormData): Promise<UploadState> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Escolha uma imagem." };
  try {
    const img = await saveUpload(file);
    const title = str(form.get("title"), 80) || "Sem título";
    repo.gallery.add({
      ...img,
      category: oneOf(CATEGORIES, form.get("category"), "fursuit"),
      title,
      caption: str(form.get("caption"), 200),
      alt: str(form.get("alt"), 200) || title,
      tag: str(form.get("tag"), 40),
      status: oneOf(ITEM_STATUS, form.get("status"), "portfolio"),
      featured: form.get("featured") === "on",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha no upload." };
  }
  refresh();
  return { ok: true };
}

export async function updateItem(
  id: string,
  p: { title: string; caption: string; alt: string; tag: string; status: ItemStatus; featured: boolean; category: Category },
) {
  await requireAdmin();
  repo.gallery.update(str(id, 40), {
    title: str(p.title, 80),
    caption: str(p.caption, 200),
    alt: str(p.alt, 200),
    tag: str(p.tag, 40),
    status: oneOf(ITEM_STATUS, p.status, "portfolio"),
    featured: Boolean(p.featured),
    category: oneOf(CATEGORIES, p.category, "fursuit"),
  });
  refresh();
}
export async function moveItem(id: string, dir: -1 | 1) {
  await requireAdmin();
  repo.gallery.move(str(id, 40), dir === -1 ? -1 : 1);
  refresh();
}
export async function deleteItem(id: string) {
  await requireAdmin();
  const it = repo.gallery.remove(str(id, 40));
  if (it) await deleteUpload(it.src);
  refresh();
}

/* ─── vagas ─────────────────────────────────────────────── */
export async function saveSlots(s: Slots) {
  await requireAdmin();
  const clean = Object.fromEntries(
    (["fursuit", "artes", "pelucias", "acessorios"] as const).map((k) => [
      k,
      { open: Boolean(s[k]?.open), slots: Math.max(0, Math.min(99, Math.floor(Number(s[k]?.slots) || 0))), note: str(s[k]?.note, 60) },
    ]),
  ) as Slots;
  repo.slots.set(clean);
  refresh();
}

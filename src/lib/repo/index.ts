import "server-only";

import type { DatabaseSync } from "node:sqlite";

import { db, tx } from "@/lib/db";
import { newId } from "@/lib/id";
import {
  BOARD_COLUMNS,
  STAGES,
  type BoardCard,
  type BoardColumn,
  type Category,
  type GalleryItem,
  type Order,
  type OrderInput,
  type OrderStatus,
  type ProgressItem,
  type Slots,
} from "@/lib/schema";
import { seedSlots } from "@/content/seed";

type Row = Record<string, unknown>;
const S = (v: unknown) => String(v ?? "");
const N = (v: unknown) => Number(v ?? 0);

/* ─── galeria ───────────────────────────────────────────── */

const toItem = (r: Row): GalleryItem => ({
  id: S(r.id),
  category: S(r.category) as Category,
  title: S(r.title),
  caption: S(r.caption),
  alt: S(r.alt),
  tag: S(r.tag),
  status: S(r.status) as GalleryItem["status"],
  src: S(r.src),
  width: N(r.width),
  height: N(r.height),
  blur: S(r.blur),
  featured: N(r.featured) === 1,
  position: N(r.position),
});

export function createRepo(conn: () => DatabaseSync = db) {
  return {
    gallery: {
      list(category?: Category): GalleryItem[] {
        const rows = category
          ? conn().prepare("SELECT * FROM gallery WHERE category = ? ORDER BY position, created_at DESC").all(category)
          : conn().prepare("SELECT * FROM gallery ORDER BY position, created_at DESC").all();
        return rows.map(toItem);
      },
      featured(): GalleryItem[] {
        return conn().prepare("SELECT * FROM gallery WHERE featured = 1 ORDER BY position").all().map(toItem);
      },
      get(id: string): GalleryItem | null {
        const r = conn().prepare("SELECT * FROM gallery WHERE id = ?").get(id);
        return r ? toItem(r) : null;
      },
      add(item: Omit<GalleryItem, "id" | "position">): GalleryItem {
        const id = newId("g");
        const c = conn();
        const { m } = c.prepare("SELECT COALESCE(MIN(position), 0) - 1 AS m FROM gallery WHERE category = ?").get(item.category) as { m: number };
        c.prepare(
          `INSERT INTO gallery (id, category, title, caption, alt, tag, status, src, width, height, blur, featured, position)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).run(id, item.category, item.title, item.caption, item.alt, item.tag, item.status, item.src, item.width, item.height, item.blur, item.featured ? 1 : 0, m);
        return { ...item, id, position: m };
      },
      update(id: string, p: Partial<Pick<GalleryItem, "title" | "caption" | "alt" | "tag" | "status" | "featured" | "category">>) {
        const cur = this.get(id);
        if (!cur) return;
        const n = { ...cur, ...p };
        conn()
          .prepare("UPDATE gallery SET title=?, caption=?, alt=?, tag=?, status=?, featured=?, category=? WHERE id=?")
          .run(n.title, n.caption, n.alt, n.tag, n.status, n.featured ? 1 : 0, n.category, id);
      },
      move(id: string, dir: -1 | 1) {
        const c = conn();
        const cur = this.get(id);
        if (!cur) return;
        const list = this.list(cur.category);
        const i = list.findIndex((x) => x.id === id);
        const j = i + dir;
        if (j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        tx(c, () => list.forEach((x, k) => c.prepare("UPDATE gallery SET position=? WHERE id=?").run(k, x.id)));
      },
      remove(id: string): GalleryItem | null {
        const cur = this.get(id);
        conn().prepare("DELETE FROM gallery WHERE id = ?").run(id);
        return cur;
      },
    },

    /* ─── quadro ─────────────────────────────────────────── */
    board: {
      list(): BoardCard[] {
        return conn()
          .prepare("SELECT * FROM board_cards ORDER BY position, updated_at")
          .all()
          .map((r) => ({
            id: S(r.id),
            title: S(r.title),
            client: S(r.client),
            kind: S(r.kind),
            column: S(r.col) as BoardColumn,
            position: N(r.position),
            note: S(r.note),
            updatedAt: S(r.updated_at),
          }));
      },
      add(c: Pick<BoardCard, "title" | "client" | "kind" | "note"> & { column?: BoardColumn }): string {
        const id = newId("b");
        const col = c.column ?? "fila";
        const { m } = conn().prepare("SELECT COALESCE(MAX(position), -1) + 1 AS m FROM board_cards WHERE col = ?").get(col) as { m: number };
        conn()
          .prepare("INSERT INTO board_cards (id, title, client, kind, col, position, note) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(id, c.title, c.client, c.kind, col, m, c.note);
        return id;
      },
      update(id: string, p: Pick<BoardCard, "title" | "client" | "kind" | "note">) {
        conn()
          .prepare("UPDATE board_cards SET title=?, client=?, kind=?, note=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?")
          .run(p.title, p.client, p.kind, p.note, id);
      },
      /** Move o card para `column` na posição `index` e renumera a coluna. */
      move(id: string, column: BoardColumn, index: number) {
        if (!BOARD_COLUMNS.includes(column)) throw new Error("coluna inválida");
        const c = conn();
        tx(c, () => {
          const ids = (c.prepare("SELECT id FROM board_cards WHERE col = ? AND id <> ? ORDER BY position").all(column, id) as { id: string }[]).map((r) => r.id);
          ids.splice(Math.max(0, Math.min(index, ids.length)), 0, id);
          const up = c.prepare("UPDATE board_cards SET col=?, position=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?");
          const keep = c.prepare("UPDATE board_cards SET position=? WHERE id=?");
          ids.forEach((x, k) => (x === id ? up.run(column, k, x) : keep.run(k, x)));
        });
      },
      remove(id: string) {
        conn().prepare("DELETE FROM board_cards WHERE id = ?").run(id);
      },
    },

    /* ─── progresso ──────────────────────────────────────── */
    progress: {
      list(): ProgressItem[] {
        return conn()
          .prepare("SELECT * FROM progress ORDER BY stage >= ?, position, updated_at")
          .all(STAGES.length)
          .map((r) => ({
            id: S(r.id),
            title: S(r.title),
            client: S(r.client),
            kind: S(r.kind) as ProgressItem["kind"],
            stage: N(r.stage),
            eta: S(r.eta),
            note: S(r.note),
            position: N(r.position),
            updatedAt: S(r.updated_at),
          }));
      },
      add(p: Pick<ProgressItem, "title" | "client" | "kind" | "eta" | "note">): string {
        const id = newId("p");
        const { m } = conn().prepare("SELECT COALESCE(MAX(position), -1) + 1 AS m FROM progress").get() as { m: number };
        conn()
          .prepare("INSERT INTO progress (id, title, client, kind, stage, eta, note, position) VALUES (?, ?, ?, ?, 0, ?, ?, ?)")
          .run(id, p.title, p.client, p.kind, p.eta, p.note, m);
        return id;
      },
      update(id: string, p: Pick<ProgressItem, "title" | "client" | "kind" | "eta" | "note" | "stage">) {
        const stage = Math.max(0, Math.min(STAGES.length, Math.round(p.stage)));
        conn()
          .prepare("UPDATE progress SET title=?, client=?, kind=?, eta=?, note=?, stage=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?")
          .run(p.title, p.client, p.kind, p.eta, p.note, stage, id);
      },
      remove(id: string) {
        conn().prepare("DELETE FROM progress WHERE id = ?").run(id);
      },
    },

    /* ─── pedidos ────────────────────────────────────────── */
    orders: {
      add(o: Omit<OrderInput, "website">): Order {
        const id = newId("o");
        conn()
          .prepare(
            "INSERT INTO orders (id, kind, name, email, telegram, option, fur, refs, extras, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          )
          .run(id, o.kind, o.name, o.email, o.telegram, o.option, o.fur, o.refs, o.extras, o.message);
        return { ...o, id, status: "novo", createdAt: new Date().toISOString() };
      },
      list(): Order[] {
        return conn()
          .prepare("SELECT * FROM orders ORDER BY status = 'arquivado', created_at DESC")
          .all()
          .map((r) => ({
            id: S(r.id),
            kind: S(r.kind) as Order["kind"],
            name: S(r.name),
            email: S(r.email),
            telegram: S(r.telegram),
            option: S(r.option),
            fur: S(r.fur),
            refs: S(r.refs),
            extras: S(r.extras),
            message: S(r.message),
            status: S(r.status) as OrderStatus,
            createdAt: S(r.created_at),
          }));
      },
      setStatus(id: string, status: OrderStatus) {
        conn().prepare("UPDATE orders SET status=? WHERE id=?").run(status, id);
      },
      remove(id: string) {
        conn().prepare("DELETE FROM orders WHERE id = ?").run(id);
      },
      countNew(): number {
        return N((conn().prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'novo'").get() as Row).n);
      },
    },

    /* ─── vagas ──────────────────────────────────────────── */
    slots: {
      get(): Slots {
        const r = conn().prepare("SELECT value FROM settings WHERE key = 'slots'").get() as { value: string } | undefined;
        try {
          return { ...seedSlots, ...(r ? (JSON.parse(r.value) as Partial<Slots>) : {}) };
        } catch {
          return seedSlots;
        }
      },
      set(s: Slots) {
        conn()
          .prepare("INSERT INTO settings (key, value) VALUES ('slots', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
          .run(JSON.stringify(s));
      },
    },
  };
}

export type Repo = ReturnType<typeof createRepo>;
export const repo: Repo = createRepo();

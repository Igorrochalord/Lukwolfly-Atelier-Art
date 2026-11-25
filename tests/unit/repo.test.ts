import { beforeEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";

import { openDb } from "@/lib/db";
import { createRepo, type Repo } from "@/lib/repo";

let conn: DatabaseSync;
let repo: Repo;

beforeEach(() => {
  conn = openDb(":memory:");
  repo = createRepo(() => conn);
});

describe("repositório", () => {
  it("faz seed na primeira abertura", () => {
    expect(repo.gallery.list().length).toBeGreaterThan(0);
    expect(repo.board.list().length).toBeGreaterThan(0);
    expect(repo.slots.get().artes.open).toBe(true);
  });

  it("move card entre colunas e renumera posições", () => {
    const id = repo.board.add({ title: "Teste", client: "X", kind: "Headshot", note: "" });
    repo.board.move(id, "cor", 0);
    const cor = repo.board.list().filter((c) => c.column === "cor").sort((a, b) => a.position - b.position);
    expect(cor[0].id).toBe(id);
    expect(cor.map((c) => c.position)).toEqual(cor.map((_, i) => i));
    expect(() => repo.board.move(id, "invalida" as never, 0)).toThrow();
  });

  it("salva e lista pedidos", () => {
    repo.orders.add({ kind: "pelucia", name: "Ana", email: "a@b.co", telegram: "@ana_1", option: "", fur: "", refs: "", extras: "", message: "Quero uma pelúcia" });
    expect(repo.orders.countNew()).toBe(1);
    const [o] = repo.orders.list();
    repo.orders.setStatus(o.id, "aceito");
    expect(repo.orders.list()[0].status).toBe("aceito");
  });

  it("limita a etapa do progresso", () => {
    const id = repo.progress.add({ title: "Head", client: "Y", kind: "fursuit", eta: "", note: "" });
    repo.progress.update(id, { title: "Head", client: "Y", kind: "fursuit", eta: "", note: "", stage: 99 });
    expect(repo.progress.list().find((p) => p.id === id)!.stage).toBe(6);
  });
});

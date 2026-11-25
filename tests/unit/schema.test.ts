import { describe, expect, it } from "vitest";

import { OrderSchema } from "@/lib/schema";

const base = { kind: "arte", name: "Luk", email: "luk@example.com", telegram: "lukwolfly", message: "Quero um headshot do meu lobo." };

describe("OrderSchema", () => {
  it("aceita pedido válido e normaliza o @ do Telegram", () => {
    const r = OrderSchema.parse(base);
    expect(r.telegram).toBe("@lukwolfly");
    expect(r.option).toBe("");
  });
  it("rejeita e-mail inválido e telegram com espaço", () => {
    const r = OrderSchema.safeParse({ ...base, email: "x@", telegram: "luk wolf" });
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path[0]);
    expect(paths).toContain("email");
    expect(paths).toContain("telegram");
  });
  it("honeypot preenchido falha", () => {
    expect(OrderSchema.safeParse({ ...base, website: "spam" }).success).toBe(false);
  });
  it("mensagem curta falha", () => {
    expect(OrderSchema.safeParse({ ...base, message: "oi" }).success).toBe(false);
  });
});

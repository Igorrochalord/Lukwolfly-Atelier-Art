import { describe, expect, it } from "vitest";

import { checkPassword, signSession, verifySession, SESSION_MAX_AGE_S } from "@/lib/auth";

const KEY = "chave-de-teste-com-32-caracteres!!";

describe("sessão admin", () => {
  it("assina e verifica", async () => {
    const t = await signSession(Date.now(), KEY);
    expect(await verifySession(t, Date.now(), KEY)).toBe(true);
  });
  it("rejeita assinatura adulterada, chave errada e expirada", async () => {
    const now = Date.now();
    const t = await signSession(now, KEY);
    expect(await verifySession(t.slice(0, -2) + "xx", now, KEY)).toBe(false);
    expect(await verifySession(t, now, "outra-chave-qualquer-bem-longa")).toBe(false);
    expect(await verifySession(t, now + (SESSION_MAX_AGE_S + 10) * 1000, KEY)).toBe(false);
    expect(await verifySession("lixo", now, KEY)).toBe(false);
  });
  it("confere a senha", async () => {
    expect(await checkPassword("segredo123", "segredo123")).toBe(true);
    expect(await checkPassword("segredo12", "segredo123")).toBe(false);
    expect(await checkPassword("abc", "abc")).toBe(false); // senha curta demais nunca vale
  });
});

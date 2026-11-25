import { NextResponse } from "next/server";

import { clientIp, createLimiter } from "@/lib/rate-limit";
import { repo } from "@/lib/repo";
import { OrderSchema } from "@/lib/schema";
import { notifyOrder } from "@/lib/telegram";

export type OrderResponse = { ok: true; id?: string } | { ok: false; error: string; fields?: Partial<Record<string, string>> };

const limit = createLimiter(5, 10 * 60_000);

/** Recebe um pedido de orçamento: valida, salva no SQLite e avisa no Telegram (se configurado). */
export async function POST(req: Request) {
  if (!limit(clientIp(req.headers))) {
    return NextResponse.json<OrderResponse>({ ok: false, error: "Muitos envios seguidos. Tente de novo em alguns minutos." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<OrderResponse>({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }
  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
    // honeypot preenchido: finge sucesso para não dar pista ao robô
    if (fields.website) return NextResponse.json<OrderResponse>({ ok: true });
    return NextResponse.json<OrderResponse>({ ok: false, error: "Confira os campos destacados.", fields }, { status: 422 });
  }
  const { website: _hp, ...data } = parsed.data;
  void _hp;
  try {
    const order = repo.orders.add(data);
    void notifyOrder(order);
    return NextResponse.json<OrderResponse>({ ok: true, id: order.id });
  } catch {
    return NextResponse.json<OrderResponse>({ ok: false, error: "Não foi possível salvar agora. Tente de novo." }, { status: 500 });
  }
}

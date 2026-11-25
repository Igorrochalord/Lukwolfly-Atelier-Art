import { NextResponse } from "next/server";

import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";

/**
 * Dados públicos em JSON (somente leitura) — para o futuro bot do Telegram
 * ou qualquer integração: vagas, progresso e quadro de desenhos.
 */
export function GET() {
  return NextResponse.json(
    { slots: repo.slots.get(), progress: repo.progress.list(), board: repo.board.list() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

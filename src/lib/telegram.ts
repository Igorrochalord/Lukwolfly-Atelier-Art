import "server-only";

import { ORDER_KIND_LABEL, type Order } from "@/lib/schema";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function formatOrder(o: Order, siteUrl = process.env.SITE_URL ?? ""): string {
  const lines = [
    `🧵 <b>Novo pedido — ${esc(ORDER_KIND_LABEL[o.kind])}</b>`,
    "",
    `<b>Nome:</b> ${esc(o.name)}`,
    `<b>Telegram:</b> ${esc(o.telegram)}`,
    `<b>E-mail:</b> ${esc(o.email)}`,
  ];
  if (o.option) lines.push(`<b>Opção:</b> ${esc(o.option)}`);
  if (o.fur) lines.push(`<b>Pelo:</b> ${esc(o.fur)}`);
  if (o.extras) lines.push(`<b>Extras:</b> ${esc(o.extras)}`);
  if (o.refs) lines.push(`<b>Refs:</b> ${esc(o.refs)}`);
  lines.push("", esc(o.message));
  if (siteUrl.startsWith("https://")) lines.push("", `<a href="${esc(siteUrl)}/admin">Abrir painel</a>`);
  return lines.join("\n");
}

/**
 * Avisa no Telegram sobre um pedido novo. Opcional: só envia se
 * TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID estiverem no .env.
 * Falha de envio nunca derruba o pedido (ele já está salvo no banco).
 */
export async function notifyOrder(o: Order): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: formatOrder(o), parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

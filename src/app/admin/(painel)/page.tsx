import { OrdersList } from "@/components/admin/OrdersList";
import { repo } from "@/lib/repo";

export default function AdminOrders() {
  const telegram = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">Pedidos</h1>
        <p className="text-sm text-mute">Notificação no Telegram: {telegram ? <span className="text-lime">ativa</span> : "desligada (defina TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no .env)"}</p>
      </div>
      <OrdersList orders={repo.orders.list()} />
    </>
  );
}

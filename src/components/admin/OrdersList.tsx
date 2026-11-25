"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";

import { deleteOrder, setOrderStatus } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { ORDER_KIND_LABEL, ORDER_STATUS, ORDER_STATUS_LABEL, type Order, type OrderStatus } from "@/lib/schema";

const COLOR: Record<OrderStatus, string> = {
  novo: "bg-rose text-ink",
  conversando: "bg-amber text-ink",
  aceito: "bg-lime text-ink",
  recusado: "bg-ink-3 text-mute",
  arquivado: "bg-ink-3 text-mute",
};

export function OrdersList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");
  const [pending, start] = useTransition();
  const shown = filter === "todos" ? orders.filter((o) => o.status !== "arquivado") : orders.filter((o) => o.status === filter);

  return (
    <div className={cn(pending && "opacity-70 transition-opacity")}>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["todos", ...ORDER_STATUS] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn("chip px-3 py-1.5", filter === s ? "bg-paper text-paper-ink" : "text-mute shadow-[inset_0_0_0_1px_var(--color-line-2)]")}
          >
            {s === "todos" ? "Ativos" : ORDER_STATUS_LABEL[s]} · {s === "todos" ? orders.filter((o) => o.status !== "arquivado").length : orders.filter((o) => o.status === s).length}
          </button>
        ))}
      </div>
      {!shown.length && <p className="rounded-2xl border border-dashed border-line-2 p-10 text-center text-mute">Nenhum pedido aqui.</p>}
      <ul className="grid gap-4 lg:grid-cols-2">
        <AnimatePresence initial={false}>
          {shown.map((o) => (
            <motion.li
              key={o.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl bg-ink-2 p-5 shadow-[inset_0_0_0_1px_var(--color-line)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="label text-mute">
                    {ORDER_KIND_LABEL[o.kind]} · {new Date(o.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                  <p className="mt-1 text-xl font-semibold">{o.name}</p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => start(() => setOrderStatus(o.id, e.target.value as OrderStatus))}
                  className={cn("chip appearance-none border-0 py-1.5 outline-none", COLOR[o.status])}
                  aria-label="Status do pedido"
                >
                  {ORDER_STATUS.map((s) => (
                    <option key={s} value={s} className="bg-ink-2 text-text">
                      {ORDER_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a href={`https://t.me/${o.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="rounded-full bg-sky/15 px-3 py-1 text-sky hover:bg-sky/25">
                  {o.telegram} ↗
                </a>
                <a href={`mailto:${o.email}`} className="rounded-full bg-lilac/15 px-3 py-1 text-lilac hover:bg-lilac/25">
                  {o.email}
                </a>
              </div>
              {(o.option || o.fur || o.extras) && (
                <dl className="mt-4 grid gap-1 text-sm">
                  {o.option && <div><dt className="inline text-mute">Opção: </dt><dd className="inline">{o.option}</dd></div>}
                  {o.fur && <div><dt className="inline text-mute">Pelo: </dt><dd className="inline">{o.fur}</dd></div>}
                  {o.extras && <div><dt className="inline text-mute">Extras: </dt><dd className="inline">{o.extras}</dd></div>}
                </dl>
              )}
              <p className="mt-3 text-sm whitespace-pre-wrap text-text/90">{o.message}</p>
              {o.refs && <p className="mt-2 text-sm break-all text-mute">Refs: {o.refs}</p>}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => confirm(`Apagar o pedido de ${o.name}?`) && start(() => deleteOrder(o.id))}
                  className="text-xs text-mute hover:text-rose"
                >
                  Apagar
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

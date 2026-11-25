import type { Metadata } from "next";
import Link from "next/link";

import { AdminNav } from "@/components/admin/AdminNav";
import { Mark } from "@/components/brand/Mark";
import { repo } from "@/lib/repo";
import { requireAdmin } from "@/lib/session";
import { logout } from "../login/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <Mark className="size-7 text-lime" />
            <span className="font-semibold">Bancada</span>
          </Link>
          <div className="order-3 w-full md:order-none md:w-auto">
            <AdminNav newOrders={repo.orders.countNew()} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="rounded-full px-3 py-2 text-mute hover:text-text" target="_blank">
              Ver site ↗
            </Link>
            <form action={logout}>
              <button className="rounded-full px-3 py-2 text-mute shadow-[inset_0_0_0_1px_var(--color-line-2)] hover:text-text">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}

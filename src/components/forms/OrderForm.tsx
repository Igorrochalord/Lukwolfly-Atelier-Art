"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

import type { OrderResponse } from "@/app/api/orders/route";
import { artExtras, artPrices, fursuitTypes, plush, site } from "@/content/site";
import { cn } from "@/lib/cn";
import { ORDER_KIND_LABEL, ORDER_KINDS, OrderSchema, type OrderKind } from "@/lib/schema";

type Errors = Partial<Record<string, string>>;

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Field({ name, label, error, children, className }: { name: string; label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <label htmlFor={name} className="label pointer-events-none absolute top-0 left-0 text-mute">
        {label}
      </label>
      <AnimatePresence>
        {error && (
          <motion.p id={`${name}-err`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-sm text-rose">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Pedido de orçamento. `kind` fixo (nas páginas de serviço) ou escolhível (/orcamento).
 * Campos variam por tipo; para artes mostra estimativa de preço ao vivo.
 */
export function OrderForm({ kind: fixed, className }: { kind?: OrderKind; className?: string }) {
  const uid = useId();
  const [kind, setKind] = useState<OrderKind>(fixed ?? "arte");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [art, setArt] = useState<string>(artPrices[0].name);
  const [extraChars, setExtraChars] = useState(0);
  const [nsfw, setNsfw] = useState(false);

  const artBase = artPrices.find((a) => a.name === art)?.price ?? 0;
  const estimate = artBase + extraChars * artExtras[0].price + (nsfw ? artExtras[1].price : 0);

  const id = (n: string) => `${uid}-${n}`;
  const inv = (n: string) => ({ "aria-invalid": errors[n] ? true : undefined, "aria-describedby": errors[n] ? `${id(n)}-err` : undefined });

  function collect(form: HTMLFormElement) {
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
    d.kind = kind;
    if (kind === "arte") {
      d.option = art;
      const ex = [extraChars ? `${extraChars} personagem(ns) extra` : "", nsfw ? "NSFW" : ""].filter(Boolean).join(" + ");
      d.extras = `${ex || "sem extras"} · estimativa ${brl(estimate)}`;
    }
    return d;
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = collect(form);
    const r = OrderSchema.safeParse(data);
    if (!r.success) {
      const e: Errors = {};
      for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
      setErrors(e);
      form.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setState("sending");
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = (await res.json()) as OrderResponse;
      if (json.ok) {
        setState("sent");
        form.reset();
      } else {
        setErrors({ ...(json.fields ?? {}), form: json.error });
        setState("idle");
      }
    } catch {
      setErrors({ form: "Sem conexão. Tente novamente." });
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("stitch-box rounded-[1.5rem] bg-lime p-10 text-ink", className)}
      >
        <p className="display text-5xl">Pedido na mesa!</p>
        <p className="mt-4 max-w-md">
          Recebi seus dados e respondo pelo Telegram ou e-mail informado. Se tiver pressa, me chama em{" "}
          <a href={site.telegram.url} className="underline" target="_blank" rel="noreferrer">
            {site.telegram.handle}
          </a>
          .
        </p>
        <button type="button" onClick={() => setState("idle")} className="btn btn-ink mt-8">
          Enviar outro pedido
        </button>
      </motion.div>
    );
  }

  const selectArrow = <span aria-hidden className="pointer-events-none absolute right-0 bottom-3 text-mute">↓</span>;

  return (
    <form noValidate onSubmit={onSubmit} className={cn("grid gap-x-8 gap-y-7 md:grid-cols-2", className)}>
      {!fixed && (
        <fieldset className="md:col-span-2">
          <legend className="label mb-3 text-mute">O que você quer encomendar?</legend>
          <div className="flex flex-wrap gap-2">
            {ORDER_KINDS.map((k) => (
              <label key={k} className={cn("chip relative cursor-pointer px-4 py-2.5 transition-colors", kind === k ? "text-ink" : "text-mute hover:text-text")}>
                <input type="radio" name="_kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                {kind === k ? (
                  <motion.span layoutId={`${uid}-kind`} className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                ) : (
                  <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_var(--color-line-2)]" />
                )}
                <span className="relative">{ORDER_KIND_LABEL[k]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Field name={id("name")} label="Nome / apelido" error={errors.name}>
        <input id={id("name")} name="name" autoComplete="nickname" className="field" placeholder="Nome" {...inv("name")} />
      </Field>
      <Field name={id("telegram")} label="Telegram" error={errors.telegram}>
        <input id={id("telegram")} name="telegram" className="field" placeholder="@usuario" autoCapitalize="off" spellCheck={false} {...inv("telegram")} />
      </Field>
      <Field name={id("email")} label="E-mail" error={errors.email} className="md:col-span-2">
        <input id={id("email")} name="email" type="email" autoComplete="email" className="field" placeholder="voce@email.com" {...inv("email")} />
      </Field>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={kind}
          className="grid gap-x-8 gap-y-7 md:col-span-2 md:grid-cols-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {kind === "fursuit" && (
            <>
              <Field name={id("option")} label="Tipo de fursuit">
                <select id={id("option")} name="option" className="field" defaultValue={fursuitTypes[0].name}>
                  {fursuitTypes.map((t) => (
                    <option key={t.name}>{t.name}</option>
                  ))}
                  <option>Ainda não sei</option>
                </select>
                {selectArrow}
              </Field>
              <Field name={id("fur")} label="Pelo">
                <select id={id("fur")} name="fur" className="field" defaultValue="Quero ajuda pra escolher">
                  <option>Nacional</option>
                  <option>Internacional</option>
                  <option>Misto</option>
                  <option>Quero ajuda pra escolher</option>
                </select>
                {selectArrow}
              </Field>
            </>
          )}

          {kind === "pelucia" && (
            <Field name={id("option")} label="Modalidade" className="md:col-span-2">
              <select id={id("option")} name="option" className="field">
                <option value={`Promo ${brl(plush.promo)} (cores em mão)`}>Vaga com desconto — {brl(plush.promo)} ({plush.promoRule})</option>
                <option value={`Padrão ~${brl(plush.regular)}`}>Pelúcia padrão — por volta de {brl(plush.regular)}</option>
              </select>
              {selectArrow}
            </Field>
          )}

          {kind === "acessorio" && (
            <Field name={id("option")} label="Qual acessório?" className="md:col-span-2">
              <input id={id("option")} name="option" className="field" placeholder="Ex.: cauda, orelhas, patas…" />
            </Field>
          )}

          {kind === "arte" && (
            <div className="grid gap-6 md:col-span-2 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="label mb-3 text-mute">Tipo de arte</p>
                <div className="flex flex-wrap gap-2">
                  {artPrices.map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      aria-pressed={art === a.name}
                      onClick={() => setArt(a.name)}
                      className={cn(
                        "chip px-3.5 py-2 transition-colors",
                        art === a.name ? "bg-paper text-paper-ink" : "text-mute shadow-[inset_0_0_0_1px_var(--color-line-2)] hover:text-text",
                      )}
                    >
                      {a.name} · {brl(a.price)}
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-3 text-sm">
                    <span className="text-mute">Personagens extras</span>
                    <span className="flex items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-line-2)]">
                      <button type="button" aria-label="Menos um personagem" onClick={() => setExtraChars((n) => Math.max(0, n - 1))} className="size-9">
                        −
                      </button>
                      <output className="w-6 text-center font-mono">{extraChars}</output>
                      <button type="button" aria-label="Mais um personagem" onClick={() => setExtraChars((n) => Math.min(5, n + 1))} className="size-9">
                        +
                      </button>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input type="checkbox" checked={nsfw} onChange={(e) => setNsfw(e.target.checked)} className="size-4 accent-rose" />
                    <span className="text-mute">Versão NSFW (18+, +{brl(artExtras[1].price)})</span>
                  </label>
                </div>
              </div>
              <div className="rounded-2xl bg-ink-3 px-6 py-4 text-right" aria-live="polite">
                <p className="label text-mute">Estimativa</p>
                <motion.p key={estimate} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="display text-5xl text-lime">
                  {brl(estimate)}
                </motion.p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Field name={id("refs")} label="Referências (links)" error={errors.refs} className="md:col-span-2">
        <input id={id("refs")} name="refs" className="field" placeholder="https://…" {...inv("refs")} />
      </Field>
      <Field name={id("message")} label="Conta pra mim a ideia" error={errors.message} className="md:col-span-2">
        <textarea id={id("message")} name="message" rows={4} className="field resize-y" placeholder="Personagem, cores, prazo…" {...inv("message")} />
      </Field>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
        <p className="max-w-sm text-sm text-mute">Seus dados só são usados para responder este pedido.</p>
        <button type="submit" className="btn btn-lime" disabled={state === "sending"}>
          {state === "sending" ? "Enviando…" : "Enviar pedido"} <span aria-hidden>→</span>
        </button>
      </div>
      {errors.form && (
        <p role="alert" className="text-rose md:col-span-2">
          {errors.form}
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";

import { Mark } from "@/components/brand/Mark";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <section className="grid min-h-svh place-items-center px-4">
      <form action={action} className="w-full max-w-sm rounded-[1.5rem] bg-ink-2 p-8 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <Mark className="size-12 text-lime" />
        <h1 className="display mt-6 text-4xl">Bancada</h1>
        <p className="serif-i text-xl text-mute">painel da Lukwolfly</p>
        <label className="label mt-8 block text-mute" htmlFor="pw">
          Senha
        </label>
        <input id="pw" name="password" type="password" autoComplete="current-password" required className="field" autoFocus />
        {state.error && (
          <p role="alert" className="mt-3 text-sm text-rose">
            {state.error}
          </p>
        )}
        <button className="btn btn-lime mt-8 w-full" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </section>
  );
}

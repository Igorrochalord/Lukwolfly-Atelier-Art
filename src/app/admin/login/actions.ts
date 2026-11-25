"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { checkPassword, clearLoginFailures, loginAllowed, registerLoginFailure, SESSION_COOKIE, SESSION_MAX_AGE_S, signSession } from "@/lib/auth";
import { clientIp } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const ip = clientIp(await headers());
  if (!loginAllowed(ip)) return { error: "Muitas tentativas. Espere 10 minutos." };
  const ok = await checkPassword(String(form.get("password") ?? ""));
  if (!ok) {
    registerLoginFailure(ip);
    return { error: "Senha incorreta." };
  }
  clearLoginFailures(ip);
  (await cookies()).set(SESSION_COOKIE, await signSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.SITE_URL?.startsWith("https://"),
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

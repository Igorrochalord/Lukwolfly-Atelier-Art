/** Id curto, ordenável por tempo e seguro para URL. */
export function newId(prefix = ""): string {
  const t = Date.now().toString(36);
  const r = crypto.getRandomValues(new Uint8Array(5));
  return prefix + t + Array.from(r, (b) => (b % 36).toString(36)).join("");
}

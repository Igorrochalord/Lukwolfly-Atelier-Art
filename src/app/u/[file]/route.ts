import { readFile } from "node:fs/promises";
import path from "node:path";

import { UPLOAD_DIR } from "@/lib/db";

/** Serve as imagens enviadas pelo admin (volume /data/uploads). */
export async function GET(_req: Request, ctx: RouteContext<"/u/[file]">) {
  const { file } = await ctx.params;
  if (!/^[a-z0-9]+\.webp$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

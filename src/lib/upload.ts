import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { UPLOAD_DIR } from "@/lib/db";
import { newId } from "@/lib/id";

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

/**
 * Processa uma imagem enviada pelo admin: corrige rotação, limita a 1800px,
 * converte para WebP e gera um blur minúsculo para o placeholder.
 * O arquivo fica em /data/uploads e é servido por /u/<arquivo>.
 */
export async function saveUpload(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Imagem maior que 12 MB.");
  if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) throw new Error("Formato não suportado (use JPG, PNG ou WebP).");
  const input = Buffer.from(await file.arrayBuffer());
  const base = sharp(input, { failOn: "error" }).rotate();
  const name = `${newId()}.webp`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const out = await base
    .clone()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(path.join(UPLOAD_DIR, name), out.data);
  const blur = await base.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return {
    src: `/u/${name}`,
    width: out.info.width,
    height: out.info.height,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

export async function deleteUpload(src: string) {
  const m = /^\/u\/([a-z0-9]+\.webp)$/.exec(src);
  if (!m) return; // imagens de seed (public/media) não são apagadas
  await unlink(path.join(UPLOAD_DIR, m[1])).catch(() => {});
}

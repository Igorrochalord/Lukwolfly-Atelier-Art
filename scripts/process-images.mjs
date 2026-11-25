#!/usr/bin/env node
/**
 * LUKWOLFLY — pipeline de imagens de seed.
 *
 * Lê os originais de `images/<categoria>/` e gera em `public/media/`:
 *  - <id>.webp  (máx. 1800px, qualidade 82)
 * e um manifesto `src/content/media.json` com largura, altura e blur
 * (placeholder) de cada imagem — usado no seed do banco.
 *
 * Colagens: listadas em SPLITS, são recortadas em várias imagens.
 * Imagens enviadas pelo painel /admin NÃO passam por aqui
 * (são processadas no upload e salvas em /data/uploads).
 *
 * Uso: npm run images
 */
import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "images");
const OUT = path.join(ROOT, "public/media");
const MANIFEST = path.join(ROOT, "src/content/media.json");
const CATEGORIES = ["fursuit", "artes", "pelucias", "acessorios"];

/** Colagem 3×2 das pelúcias → 6 recortes (x, y, w, h no original 1275×1234). */
const SPLITS = {
  "pelucias/photo_2026-11-25_16-43-47.jpg": [
    { id: "pelucia-01", box: [6, 6, 444, 612] },
    { id: "pelucia-02", box: [462, 6, 392, 612] },
    { id: "pelucia-03", box: [870, 6, 399, 612] },
    { id: "pelucia-04", box: [6, 638, 444, 590] },
    { id: "pelucia-05", box: [462, 638, 396, 590] },
    { id: "pelucia-06", box: [870, 638, 399, 590] },
  ],
  // colagem de artes 904×1280 — a peça rosa (sugestiva) fica de fora da galeria SFW
  "artes/photo_2026-11-25_16-48-41.jpg": [
    { id: "arte-badge-seth", box: [16, 12, 476, 366] },
    { id: "arte-halfbody-hiena", box: [520, 14, 372, 368] },
    { id: "arte-badge-joy", box: [412, 457, 480, 318] },
    { id: "arte-ref-m4jor", box: [2, 845, 558, 433] },
    { id: "arte-headshot-cavalo", box: [602, 847, 270, 368] },
  ],
};

async function emit(id, category, pipeline, manifest) {
  const file = path.join(OUT, `${id}.webp`);
  const info = await pipeline
    .clone()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(file);
  const blur = await pipeline.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  manifest.push({
    id,
    category,
    src: `/media/${id}.webp`,
    width: info.width,
    height: info.height,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
  });
  console.log(`  ✓ ${id}.webp ${info.width}×${info.height}`);
}

await mkdir(OUT, { recursive: true });
const manifest = [];

for (const cat of CATEGORIES) {
  let files = [];
  try {
    files = (await readdir(path.join(SRC, cat))).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  } catch {
    continue;
  }
  for (const f of files) {
    const rel = `${cat}/${f}`;
    const base = sharp(path.join(SRC, rel)).rotate();
    // colagem inteira também vira uma imagem (capa)
    const stem = cat === "fursuit" ? "fursuit-heads" : `${cat}-${path.parse(f).name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
    if (SPLITS[rel]) {
      if (cat !== "artes") await emit(`${cat}-colagem`, cat, base, manifest);
      for (const s of SPLITS[rel]) {
        const [left, top, width, height] = s.box;
        await emit(s.id, cat, base.clone().extract({ left, top, width, height }), manifest);
      }
    } else {
      await emit(stem, cat, base, manifest);
    }
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifesto: ${path.relative(ROOT, MANIFEST)} (${manifest.length} imagens)`);

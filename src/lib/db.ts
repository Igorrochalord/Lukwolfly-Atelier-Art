import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { seedBoard, seedGallery, seedProgress, seedSlots } from "@/content/seed";

/**
 * Banco SQLite embutido (node:sqlite, sem dependência extra).
 * Arquivo em `$DATA_DIR/lukwolfly.db` — no Docker, `/data` é um volume,
 * então os dados sobrevivem a rebuilds e updates.
 */
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const MIGRATIONS = [
  `CREATE TABLE gallery (
     id TEXT PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '',
     alt TEXT NOT NULL DEFAULT '', tag TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'portfolio',
     src TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, blur TEXT NOT NULL DEFAULT '',
     featured INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
   );
   CREATE TABLE board_cards (
     id TEXT PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT '',
     col TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0, note TEXT NOT NULL DEFAULT '',
     updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
   );
   CREATE TABLE progress (
     id TEXT PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL,
     stage INTEGER NOT NULL DEFAULT 0, eta TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '',
     position INTEGER NOT NULL DEFAULT 0,
     updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
   );
   CREATE TABLE orders (
     id TEXT PRIMARY KEY, kind TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, telegram TEXT NOT NULL,
     option TEXT NOT NULL DEFAULT '', fur TEXT NOT NULL DEFAULT '', refs TEXT NOT NULL DEFAULT '',
     extras TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'novo',
     created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
   );
   CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
];

function migrate(db: DatabaseSync) {
  const { user_version: v } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  for (let i = v; i < MIGRATIONS.length; i++) {
    db.exec("BEGIN");
    try {
      db.exec(MIGRATIONS[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
    if (i === 0) seed(db);
  }
}

function seed(db: DatabaseSync) {
  const g = db.prepare(
    `INSERT INTO gallery (id, category, title, caption, alt, tag, status, src, width, height, blur, featured, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const i of seedGallery)
    g.run(i.id, i.category, i.title, i.caption, i.alt, i.tag, i.status, i.src, i.width, i.height, i.blur, i.featured ? 1 : 0, i.position);
  const b = db.prepare(`INSERT INTO board_cards (id, title, client, kind, col, position, note) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  for (const c of seedBoard) b.run(c.id, c.title, c.client, c.kind, c.column, c.position, c.note);
  const p = db.prepare(`INSERT INTO progress (id, title, client, kind, stage, eta, note, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const x of seedProgress) p.run(x.id, x.title, x.client, x.kind, x.stage, x.eta, x.note, x.position);
  db.prepare(`INSERT INTO settings (key, value) VALUES ('slots', ?)`).run(JSON.stringify(seedSlots));
}

export function openDb(file = path.join(DATA_DIR, "lukwolfly.db")): DatabaseSync {
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;");
  migrate(db);
  return db;
}

const g = globalThis as unknown as { __lukDb?: DatabaseSync };

/** Conexão única por processo (sobrevive ao hot reload em dev). */
export function db(): DatabaseSync {
  g.__lukDb ??= openDb();
  return g.__lukDb;
}

/** Executa `fn` numa transação. */
export function tx<T>(conn: DatabaseSync, fn: () => T): T {
  conn.exec("BEGIN IMMEDIATE");
  try {
    const r = fn();
    conn.exec("COMMIT");
    return r;
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
}

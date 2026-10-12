import { Database } from 'bun:sqlite';
import { MIGRATIONS } from './migrations';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DATA_DIR = process.env.DATA_DIR || './data';
const DB_PATH = `${DATA_DIR}/generator.db`;

let db: Database;

export function getDb(): Database {
  if (!db) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    for (const migration of MIGRATIONS) {
      try {
        db.run(migration);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("duplicate column name")) {
          continue;
        }
        throw err;
      }
    }
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined as unknown as Database;
  }
}

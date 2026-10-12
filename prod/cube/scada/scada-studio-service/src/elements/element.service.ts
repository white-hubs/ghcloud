import { Injectable, Inject, DatabaseService, DATABASE_SERVICE_TOKEN } from "@dangao/bun-server";

export interface ElementRecord {
  type: string;
  label: string;
  category: string;
  version: string;
  svg_content: string;
  created_at: string;
}

@Injectable()
export class ElementService {
  private initialized = false;
  private initializing: Promise<void> | null = null;

  constructor(@Inject(DATABASE_SERVICE_TOKEN) private readonly db: DatabaseService) {}

  private async initialize() {
    await this.db.initialize();
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS elements (
        type TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'custom',
        version TEXT NOT NULL DEFAULT '1.0.0',
        svg_content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    if (!this.initializing) {
      this.initializing = this.initialize()
        .then(() => {
          this.initialized = true;
        })
        .finally(() => {
          this.initializing = null;
        });
    }
    await this.initializing;
  }

  async findAll(): Promise<Omit<ElementRecord, "svg_content">[]> {
    await this.ensureInitialized();
    return this.db.query("SELECT type, label, category, version, created_at FROM elements ORDER BY category, label");
  }

  async findByType(type: string): Promise<ElementRecord | null> {
    await this.ensureInitialized();
    const rows = await this.db.query<ElementRecord>("SELECT * FROM elements WHERE type = ?", [type]);
    return rows[0] ?? null;
  }

  async upsert(type: string, label: string, category: string, version: string, svgContent: string): Promise<ElementRecord> {
    await this.ensureInitialized();
    await this.db.query(
      `INSERT INTO elements (type, label, category, version, svg_content)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(type) DO UPDATE SET
         label = excluded.label,
         category = excluded.category,
         version = excluded.version,
         svg_content = excluded.svg_content`,
      [type, label, category, version, svgContent],
    );
    return (await this.findByType(type))!;
  }

  async remove(type: string): Promise<boolean> {
    await this.ensureInitialized();
    await this.db.query("DELETE FROM elements WHERE type = ?", [type]);
    return true;
  }
}

import { readLegacySceneScopeFromContent } from "@cube-scada/core";
import { Injectable, Inject, DatabaseService, DATABASE_SERVICE_TOKEN } from "@dangao/bun-server";

export interface PageRecord {
  id: string;
  name: string;
  content: string;
  project_id: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PageService {
  private initialized = false;
  private initializing: Promise<void> | null = null;

  constructor(@Inject(DATABASE_SERVICE_TOKEN) private readonly db: DatabaseService) {}

  private async initialize() {
    await this.db.initialize();
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '{}',
        project_id TEXT,
        thumbnail TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    // Backward-compatible migrations for existing databases
    try {
      await this.db.query("ALTER TABLE pages ADD COLUMN project_id TEXT");
    } catch {
      /* exists */
    }
    try {
      await this.db.query("ALTER TABLE pages ADD COLUMN thumbnail TEXT");
    } catch {
      /* exists */
    }
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

  async findAll(): Promise<PageRecord[]> {
    await this.ensureInitialized();
    // Runtime demos only list pages whose project still exists. This hides
    // legacy pages that retained a deleted project's ID.
    return this.db.query<PageRecord>(
      "SELECT p.id, p.name, p.project_id, p.thumbnail, p.created_at, p.updated_at FROM pages p INNER JOIN projects pr ON pr.id = p.project_id ORDER BY p.created_at DESC, p.name ASC",
    );
  }

  async findById(id: string): Promise<PageRecord | null> {
    await this.ensureInitialized();
    const rows = await this.db.query<PageRecord>("SELECT p.* FROM pages p INNER JOIN projects pr ON pr.id = p.project_id WHERE p.id = ?", [
      id,
    ]);
    return rows[0] ?? null;
  }

  private async findStoredById(id: string): Promise<PageRecord | null> {
    const rows = await this.db.query<PageRecord>("SELECT * FROM pages WHERE id = ?", [id]);
    return rows[0] ?? null;
  }

  async findElectricalCenter(): Promise<{ id: string; name: string } | null> {
    await this.ensureInitialized();
    const pages = await this.listPagesWithContent();
    const legacyCenter = pages.find((page) => readLegacySceneScopeFromContent(page.content) === "electricalCenter");
    return legacyCenter ? { id: legacyCenter.id, name: legacyCenter.name } : null;
  }

  async create(id: string, name: string, content: string, projectId?: string, thumbnail?: string): Promise<PageRecord> {
    await this.ensureInitialized();
    await this.db.query("INSERT INTO pages (id, name, content, project_id, thumbnail) VALUES (?, ?, ?, ?, ?)", [
      id,
      name,
      content,
      projectId ?? null,
      thumbnail ?? null,
    ]);
    // Project detail creates a page before assigning it to the project.
    // Return that newly created record without exposing historic orphaned pages
    // through the public lookup methods above.
    return (await this.findStoredById(id))!;
  }

  async update(
    id: string,
    name: string,
    content: string,
    projectId?: string | null,
    thumbnail?: string | null,
  ): Promise<PageRecord | null> {
    await this.ensureInitialized();
    const sets: string[] = ["name = ?", "content = ?", "updated_at = datetime('now')"];
    const params: unknown[] = [name, content];
    if (projectId !== undefined) {
      sets.push("project_id = ?");
      params.push(projectId);
    }
    if (thumbnail !== undefined) {
      sets.push("thumbnail = ?");
      params.push(thumbnail);
    }
    params.push(id);
    await this.db.query(`UPDATE pages SET ${sets.join(", ")} WHERE id = ?`, params);
    return this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    await this.ensureInitialized();
    await this.db.query("DELETE FROM pages WHERE id = ?", [id]);
    return true;
  }

  async copy(sourceId: string): Promise<PageRecord | null> {
    await this.ensureInitialized();
    const source = await this.findById(sourceId);
    if (!source) return null;
    const newId = `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newName = `${source.name} (副本)`;
    return this.create(newId, newName, source.content, source.project_id ?? undefined, source.thumbnail ?? undefined);
  }

  private async listPagesWithContent(): Promise<Array<{ id: string; name: string; content: string }>> {
    return this.db.query<{ id: string; name: string; content: string }>(
      "SELECT p.id, p.name, p.content FROM pages p INNER JOIN projects pr ON pr.id = p.project_id",
    );
  }
}

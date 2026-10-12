import { Injectable, Inject, DatabaseService, DATABASE_SERVICE_TOKEN } from "@dangao/bun-server";

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PageSummary {
  id: string;
  name: string;
  project_id: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ProjectService {
  private initialized = false;
  private initializing: Promise<void> | null = null;

  constructor(@Inject(DATABASE_SERVICE_TOKEN) private readonly db: DatabaseService) {}

  private async initialize() {
    await this.db.initialize();

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Backward-compatible migrations for pages table
    try {
      await this.db.query("ALTER TABLE pages ADD COLUMN project_id TEXT REFERENCES projects(id)");
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

  async findAll(): Promise<ProjectRecord[]> {
    await this.ensureInitialized();
    return this.db.query<ProjectRecord>(
      "SELECT id, name, description, created_at, updated_at FROM projects ORDER BY created_at DESC, name ASC",
    );
  }

  async findById(id: string): Promise<ProjectRecord | null> {
    await this.ensureInitialized();
    const rows = await this.db.query<ProjectRecord>("SELECT * FROM projects WHERE id = ?", [id]);
    return rows[0] ?? null;
  }

  async create(id: string, name: string, description = ""): Promise<ProjectRecord> {
    await this.ensureInitialized();
    await this.db.query("INSERT INTO projects (id, name, description) VALUES (?, ?, ?)", [id, name, description]);
    return (await this.findById(id))!;
  }

  async update(id: string, name: string, description: string): Promise<ProjectRecord | null> {
    await this.ensureInitialized();
    await this.db.query("UPDATE projects SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?", [
      name,
      description,
      id,
    ]);
    return this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    await this.ensureInitialized();
    // Keep pages as historical records. PageService only exposes pages joined
    // to an existing project, so these records stay hidden from runtime reads.
    await this.db.query("DELETE FROM projects WHERE id = ?", [id]);
    return true;
  }

  async findPages(projectId: string): Promise<PageSummary[]> {
    await this.ensureInitialized();
    return this.db.query<PageSummary>(
      "SELECT id, name, project_id, thumbnail, created_at, updated_at FROM pages WHERE project_id = ? ORDER BY created_at DESC, name ASC",
      [projectId],
    );
  }

  async assignPage(pageId: string, projectId: string | null): Promise<void> {
    await this.ensureInitialized();
    await this.db.query("UPDATE pages SET project_id = ?, updated_at = datetime('now') WHERE id = ?", [projectId, pageId]);
  }
}

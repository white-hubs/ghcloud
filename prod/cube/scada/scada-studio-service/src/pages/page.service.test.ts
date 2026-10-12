import type { DatabaseService } from "@dangao/bun-server";
import { describe, expect, test } from "bun:test";

import { PageService } from "./page.service";

class RecordingDatabase {
  readonly queries: Array<{ sql: string; params?: unknown[] }> = [];

  async initialize(): Promise<void> {}

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    this.queries.push({ sql, params });
    return [];
  }
}

describe("PageService.findAll", () => {
  test("omits orphaned pages from the runtime page list", async () => {
    const database = new RecordingDatabase();
    const service = new PageService(database as unknown as DatabaseService);

    await service.findAll();

    expect(database.queries).toContainEqual({
      sql: "SELECT p.id, p.name, p.project_id, p.thumbnail, p.created_at, p.updated_at FROM pages p INNER JOIN projects pr ON pr.id = p.project_id ORDER BY p.created_at DESC, p.name ASC",
      params: undefined,
    });
  });
});

describe("PageService.findById", () => {
  test("does not expose an orphaned page through a direct API lookup", async () => {
    const database = new RecordingDatabase();
    const service = new PageService(database as unknown as DatabaseService);

    await service.findById("page-from-deleted-project");

    expect(database.queries).toContainEqual({
      sql: "SELECT p.* FROM pages p INNER JOIN projects pr ON pr.id = p.project_id WHERE p.id = ?",
      params: ["page-from-deleted-project"],
    });
  });
});

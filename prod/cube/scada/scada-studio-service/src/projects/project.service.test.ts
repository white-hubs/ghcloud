import type { DatabaseService } from "@dangao/bun-server";
import { describe, expect, test } from "bun:test";

import { ProjectService } from "./project.service";

class RecordingDatabase {
  readonly queries: Array<{ sql: string; params?: unknown[] }> = [];

  async initialize(): Promise<void> {}

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    this.queries.push({ sql, params });
    return [];
  }
}

describe("ProjectService.remove", () => {
  test("keeps the project's pages as hidden history while deleting the project", async () => {
    const database = new RecordingDatabase();
    const service = new ProjectService(database as unknown as DatabaseService);

    await service.remove("project-1");

    expect(database.queries).not.toContainEqual({
      sql: "DELETE FROM pages WHERE project_id = ?",
      params: ["project-1"],
    });
    expect(database.queries).toContainEqual({
      sql: "DELETE FROM projects WHERE id = ?",
      params: ["project-1"],
    });
  });
});

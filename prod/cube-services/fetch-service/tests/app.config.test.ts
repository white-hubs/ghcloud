import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";

import { resolveAppConfigPath } from "../src/config/app.config";

describe("app config path", () => {
  test("uses package config/app.json by default regardless of current working directory", () => {
    const originalCwd = process.cwd();
    const packageRoot = resolve(import.meta.dir, "..");
    const repoRoot = resolve(packageRoot, "../../..");

    process.chdir(repoRoot);
    try {
      expect(resolveAppConfigPath()).toBe(resolve(packageRoot, "config/app.json"));
    } finally {
      process.chdir(originalCwd);
    }
  });

  test("resolves explicit relative config paths from current working directory", () => {
    const originalCwd = process.cwd();
    const packageRoot = resolve(import.meta.dir, "..");

    process.chdir(packageRoot);
    try {
      expect(resolveAppConfigPath("config/app.example.json")).toBe(resolve(packageRoot, "config/app.example.json"));
    } finally {
      process.chdir(originalCwd);
    }
  });
});

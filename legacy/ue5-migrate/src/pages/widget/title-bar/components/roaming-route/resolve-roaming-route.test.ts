import { describe, expect, test } from "bun:test";

import { resolveRoamingRoute } from "./resolve-roaming-route";

const routes = [
  { id: "1", name: "办公区漫游" },
  { id: "2", name: "测试漫游路线" },
];

describe("resolveRoamingRoute", () => {
  test("exact name", () => {
    expect(resolveRoamingRoute(routes, "办公区漫游")?.id).toBe("1");
  });

  test("user says 办公漫游路线 → 办公区漫游", () => {
    expect(resolveRoamingRoute(routes, "办公漫游路线")?.name).toBe("办公区漫游");
    expect(resolveRoamingRoute(routes, "进入办公区漫游路线")?.name).toBe("办公区漫游");
    expect(resolveRoamingRoute(routes, "办公区")?.name).toBe("办公区漫游");
  });

  test("test route", () => {
    expect(resolveRoamingRoute(routes, "测试漫游")?.name).toBe("测试漫游路线");
  });

  test("miss", () => {
    expect(resolveRoamingRoute(routes, "不存在的路线")).toBeUndefined();
  });
});

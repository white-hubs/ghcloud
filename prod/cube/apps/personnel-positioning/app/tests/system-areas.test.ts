import { describe, expect, test } from "bun:test";

import type { listAllArea } from "@ghcloud/cube-services-client/metadata.client";

import { areaForFloor, buildSystemAreaTree, filterSystemAreaTree } from "../src/utils/system-areas";

type SystemArea = Awaited<ReturnType<typeof listAllArea>>[number];

function area(id: string, name: string, children: SystemArea[] = []): SystemArea {
  return { id, name, children, parentId: null, code: id, aliasName: "" };
}

describe("实时定位系统区域树", () => {
  test("保留系统顺序和完整层级，同名区域按系统 ID 区分，并能恢复选中节点的祖先", () => {
    const source = [
      area("park-b", "B 园区", [area("building-b", "办公楼", [area("floor-b", "一层", [area("room-b", "办公室")])])]),
      area("park-a", "A 园区", [area("building-a", "办公楼", [area("floor-a", "一层")])]),
    ];
    const original = structuredClone(source);
    const { tree, byId } = buildSystemAreaTree(source);

    expect(tree.map((node) => node.key)).toEqual(["park-b", "park-a"]);
    expect(byId.size).toBe(7);
    expect(byId.get("room-b")?.path).toBe("B 园区 / 办公楼 / 一层 / 办公室");
    expect(byId.get("room-b")?.ancestorIds).toEqual(["park-b", "building-b", "floor-b"]);
    expect(byId.get("floor-a")?.ancestorIds).toEqual(["park-a", "building-a"]);
    expect(byId.has("f10")).toBe(false);
    expect(source).toEqual(original);
  });

  test("区域为空时不填充本地空间；兼容后端空 children 与数字 ID", () => {
    expect(buildSystemAreaTree([]).tree).toEqual([]);
    const source = [{ ...area("root", "根区域"), id: 123, children: null }] as unknown as SystemArea[];
    const { tree, byId } = buildSystemAreaTree(source);
    expect(tree[0]?.key).toBe("123");
    expect(byId.get("123")?.children).toEqual([]);
  });

  test("按名称模糊搜索，保留所有同名命中及其上级路径，排除不相关分支", () => {
    const { tree } = buildSystemAreaTree([
      area("a", "A 园区", [area("a1", "办公室"), area("a2", "设备间")]),
      area("b", "B 园区", [area("b1", "办公室"), area("b2", "车间")]),
      area("c", "C 园区"),
    ]);
    const original = structuredClone(tree);
    const result = filterSystemAreaTree(tree, " 办公 ");
    expect(result.tree.map((node) => [node.key, node.children.map((child) => child.key)])).toEqual([
      ["a", ["a1"]],
      ["b", ["b1"]],
    ]);
    expect(result.matchCount).toBe(2);
    expect(new Set(result.expandedKeys)).toEqual(new Set(["a", "b"]));
    expect(result.tree[0]?.children[0]?.path).toBe("A 园区 / 办公室");
    expect(tree).toEqual(original);
  });

  test("忽略大小写，命中父级后仍可选择下级；清空恢复完整树，无匹配返回空结果", () => {
    const { tree } = buildSystemAreaTree([area("a", "Building A", [area("a1", "一层", [area("a11", "办公室")])])]);
    const result = filterSystemAreaTree(tree, "BUILDING");
    expect(result.tree[0]?.children[0]?.children[0]?.key).toBe("a11");
    expect(result.matchCount).toBe(1);
    expect(result.expandedKeys).toEqual(["a"]);
    expect(filterSystemAreaTree(tree, "不存在")).toEqual({ tree: [], expandedKeys: [], matchCount: 0 });
    expect(filterSystemAreaTree(tree, "   ").tree).toBe(tree);
  });

  test("人员楼层优先定位到有平面图的区域，避免跳到无图的楼层节点", () => {
    const { byId } = buildSystemAreaTree([
      {
        id: "scene",
        name: "场景",
        floorId: "7",
        floorPlanFileId: "file-1",
        children: [{ id: "floor", name: "一层", floorId: "7" }],
      },
    ]);
    expect(areaForFloor(byId, "7", "floor")?.key).toBe("scene");
    expect(areaForFloor(byId, "7", "scene")?.key).toBe("scene");
    expect(areaForFloor(byId, "8")).toBeUndefined();
  });
});

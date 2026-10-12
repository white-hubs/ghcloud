import { describe, expect, test } from "bun:test";

import { flattenAreaNodes, resolveAreaPerspective } from "./resolve-area-perspective";

const tree = [
  {
    id: "1",
    name: "园区",
    children: [
      { id: "2", name: "华威一号楼", aliasName: "HW1" },
      { id: "3", name: "门诊大楼", aliasName: "MZ" },
      { id: "4", name: "地下室", aliasName: "B1" },
      { id: "5", name: "创新港", aliasName: "CXG" },
    ],
  },
];

describe("resolveAreaPerspective", () => {
  test("flattens tree", () => {
    expect(flattenAreaNodes(tree).map((n) => n.name)).toEqual(["园区", "华威一号楼", "门诊大楼", "地下室", "创新港"]);
  });

  test("exact and fuzzy with 视角 suffix", () => {
    expect(resolveAreaPerspective(tree, "创新港")?.id).toBe("5");
    expect(resolveAreaPerspective(tree, "创新港视角")?.id).toBe("5");
    expect(resolveAreaPerspective(tree, "华威")?.name).toBe("华威一号楼");
  });

  test("miss", () => {
    expect(resolveAreaPerspective(tree, "不存在的楼")).toBeUndefined();
  });
});

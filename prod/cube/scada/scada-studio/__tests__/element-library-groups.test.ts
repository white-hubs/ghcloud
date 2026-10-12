import { describe, expect, it } from "vitest";

import {
  ALL_ELEMENT_GROUPS,
  followRenamedElementGroup,
  retainElementGroupSelection,
  selectElementGroup,
  type ElementGroups,
} from "../../basic/editor/src/panels/element-library/element-library-groups";
import { updateImageElementMetadata } from "../../basic/editor/src/panels/element-library/image-element";

describe("element library group selection", () => {
  const groups = {
    背景图: [{ type: "background" }],
    设备图: [{ type: "device" }],
  } as unknown as ElementGroups;

  it("returns all groups when all is selected", () => {
    expect(selectElementGroup(groups, ALL_ELEMENT_GROUPS)).toBe(groups);
  });

  it("returns only the selected group", () => {
    expect(selectElementGroup(groups, "设备图")).toEqual({ 设备图: groups.设备图 });
  });

  it("returns no groups when the selected group no longer exists", () => {
    expect(selectElementGroup(groups, "已删除分组")).toEqual({});
  });

  it("keeps all groups visible after editing one image", () => {
    expect(retainElementGroupSelection(ALL_ELEMENT_GROUPS, ["背景图", "设备图"])).toBe(ALL_ELEMENT_GROUPS);
    expect(retainElementGroupSelection("设备图", ["背景图", "设备图"])).toBe("设备图");
    expect(retainElementGroupSelection("已删除分组", ["背景图", "设备图"])).toBe(ALL_ELEMENT_GROUPS);
  });

  it("follows a renamed group only when that group is selected", () => {
    expect(followRenamedElementGroup(ALL_ELEMENT_GROUPS, "旧分组", "新分组")).toBe(ALL_ELEMENT_GROUPS);
    expect(followRenamedElementGroup("旧分组", "旧分组", "新分组")).toBe("新分组");
    expect(followRenamedElementGroup("其他分组", "旧分组", "新分组")).toBe("其他分组");
  });

  it("updates persisted image name and group metadata", () => {
    const source = `<svg><metadata><scada:meta type="custom-image-1" category="旧分组" assetKind="image" assetGroup="旧分组"/></metadata></svg>`;

    const updated = updateImageElementMetadata(source, {
      label: ` 新名称 & 图片 `,
      group: ` 新分组 & 设备 `,
    });

    expect(updated.label).toBe("新名称 & 图片");
    expect(updated.group).toBe("新分组 & 设备");
    expect(updated.svgContent).toContain(`label="新名称 &amp; 图片"`);
    expect(updated.svgContent).toContain(`category="新分组 &amp; 设备"`);
    expect(updated.svgContent).toContain(`assetGroup="新分组 &amp; 设备"`);
  });

  it("adds missing image group metadata and defaults blank groups", () => {
    const source = `<svg><scada:meta type="custom-image-1" category="旧分组" assetKind="image"/></svg>`;

    const updated = updateImageElementMetadata(source, { label: "新名称", group: "  " });

    expect(updated.group).toBe("未分组");
    expect(updated.svgContent).toContain(`category="未分组"`);
    expect(updated.svgContent).toContain(`assetGroup="未分组"`);
  });

  it("rejects an empty image name", () => {
    const source = `<svg><scada:meta type="custom-image-1" label="旧名称" assetKind="image"/></svg>`;

    expect(() => updateImageElementMetadata(source, { label: "  ", group: "设备图" })).toThrow("请输入图片名称");
  });
});

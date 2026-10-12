import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteElementAsset } from "../../basic/editor/src/panels/element-library/element-library-api";

describe("element library api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deletes the selected uploaded image by its encoded element type", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(undefined, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await deleteElementAsset("custom image/1");

    expect(fetchMock).toHaveBeenCalledWith("/scada/api/elements/custom%20image%2F1", {
      method: "DELETE",
    });
  });

  it("reports the service error when deletion fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ message: "图片仍在使用" }, { status: 409 })));

    await expect(deleteElementAsset("custom-image-1")).rejects.toThrow("删除图片失败：图片仍在使用");
  });
});

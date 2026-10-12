import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { createPlanDraftRecovery } from "./planDraftRecovery";

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
let values: Map<string, string>;

beforeEach(() => {
  values = new Map([
    ["GH-NowEnterprise", JSON.stringify({ code: "draft-test-tenant" })],
    ["GH-UserInfo", JSON.stringify({ id: crypto.randomUUID() })],
  ]);
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
});

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, "sessionStorage", originalStorage);
  } else {
    Reflect.deleteProperty(globalThis, "sessionStorage");
  }
});

const payload = (name: string) => ({ file: { name, contentFileIds: "71" }, draftStateJson: '{"schemaVersion":1}' });

describe("微应用卸载后的预案进度恢复", () => {
  test("同一用户重建页面可恢复，其他用户无法读取且旧页面不能继续保存", () => {
    const user = values.get("GH-UserInfo")!;
    const recovery = createPlanDraftRecovery<ReturnType<typeof payload>>();
    expect(recovery.save("new", payload("尚未保存"), "", [{ id: "71", name: "已上传附件" }])).toBe(true);
    expect(createPlanDraftRecovery().read("new")?.payload).toEqual(payload("尚未保存"));

    sessionStorage.setItem("GH-UserInfo", JSON.stringify({ id: "different-user" }));
    expect(createPlanDraftRecovery().read("new")).toBeNull();
    expect(recovery.isCurrentScope()).toBe(false);
    sessionStorage.setItem("GH-UserInfo", user);
    expect(createPlanDraftRecovery().read("new")?.files).toEqual([{ id: "71", name: "已上传附件" }]);
  });

  test("首次请求在卸载后返回时保留编号和请求期间更新的内容", async () => {
    let complete!: (id: string) => void;
    const response = new Promise<string>((resolve) => {
      complete = resolve;
    });
    const recovery = createPlanDraftRecovery<ReturnType<typeof payload>>();
    const saving = recovery.persist("new", payload("请求发出时"), response);
    recovery.save("new", payload("卸载前最新编辑"), "", [{ id: "71", name: "新附件" }]);
    const restoredPage = createPlanDraftRecovery();
    const waiting = restoredPage.wait("new");
    complete("910000000000000001");
    await waiting;
    await saving;

    const checkpoint = restoredPage.read("new");
    expect(checkpoint?.id).toBe("910000000000000001");
    expect(checkpoint?.payload).toEqual(payload("卸载前最新编辑"));
    expect(checkpoint?.files).toEqual([{ id: "71", name: "新附件" }]);
    expect(restoredPage.read("910000000000000001")).toEqual(checkpoint);
  });

  test("请求失败仍可恢复并在确认保存后清除缓存", async () => {
    const recovery = createPlanDraftRecovery<ReturnType<typeof payload>>();
    const saving = recovery.persist("new", payload("失败不能丢失"), Promise.reject(new Error("模拟网络中断")));
    await expect(saving).rejects.toThrow("模拟网络中断");
    const restoredPage = createPlanDraftRecovery();
    await restoredPage.wait("new");
    expect(restoredPage.read("new")?.payload).toEqual(payload("失败不能丢失"));
    restoredPage.clear("new");
    expect(restoredPage.read("new")).toBeNull();
  });

  test("缓存附件仅保留编号名称，成功保存编号可清理新建恢复记录", () => {
    const recovery = createPlanDraftRecovery<ReturnType<typeof payload>>();
    const files = [{ id: "71", name: "附件", url: "https://example.invalid/temporary-link" }];
    recovery.save("new", payload("草稿"), "901", files);
    expect(recovery.read("901")?.files).toEqual([{ id: "71", name: "附件" }]);
    expect([...values.values()].join()).not.toContain("temporary-link");
    recovery.clear("901");
    expect(recovery.read("new")).toBeNull();
  });
});

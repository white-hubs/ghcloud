import { afterEach, describe, expect, test } from "bun:test";

import { usePlanDraft } from "./usePlanDraft";

type DraftContent = { name: string; eventCategory: string };
type DraftPayload = DraftContent & { id?: string };

const cleanup: Array<() => void> = [];

afterEach(() => {
  cleanup.splice(0).forEach((dispose) => dispose());
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function createDraft(persist: (payload: DraftPayload) => Promise<unknown>, onCreated: (id: string) => Promise<void> = async () => {}) {
  let content: DraftContent = { name: "", eventCategory: "" };
  const draft = usePlanDraft({ enabled: () => true, capture: () => content, persist, onCreated });
  cleanup.push(draft.invalidate);
  draft.reset();
  return {
    draft,
    read: () => content,
    change: (name: string) => {
      content = { name, eventCategory: "" };
      draft.changed();
    },
  };
}

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

describe("预案草稿保存", () => {
  test("空白草稿可以保存，后续保存复用首次返回的 ID", async () => {
    const calls: DraftPayload[] = [];
    const createdIds: string[] = [];
    const { draft } = createDraft(
      async (payload) => {
        calls.push(payload);
        return "901";
      },
      async (id) => {
        createdIds.push(id);
      },
    );

    expect(await draft.save()).toBe(true);
    expect(calls[0]).toEqual({ name: "", eventCategory: "" });
    expect(await draft.save()).toBe(true);
    expect(calls[1]?.id).toBe("901");
    expect(createdIds).toEqual(["901"]);
    expect(draft.status.value).toBe("saved");
  });

  test("手动保存期间的新修改保持未保存，下一次点击才更新同一草稿", async () => {
    const server = deferred<string>();
    const route = deferred<void>();
    const calls: DraftPayload[] = [];
    const { draft, change } = createDraft(
      async (payload) => {
        calls.push(payload);
        return calls.length === 1 ? server.promise : "902";
      },
      () => route.promise,
    );

    change("初稿");
    const saving = draft.save();
    await flushPromises();
    change("保存请求中的修改");
    server.resolve("902");
    await flushPromises();
    change("地址更新中的最新修改");
    route.resolve();

    expect(await saving).toBe(true);
    expect(calls).toEqual([{ name: "初稿", eventCategory: "" }]);
    expect(draft.dirty.value).toBe(true);
    expect(draft.status.value).toBe("unsaved");

    expect(await draft.save()).toBe(true);
    expect(calls[1]).toEqual({ name: "地址更新中的最新修改", eventCategory: "", id: "902" });
    expect(draft.dirty.value).toBe(false);
    expect(draft.status.value).toBe("saved");
  });

  test("保存失败保留未保存内容，重试使用已有 ID", async () => {
    let fail = true;
    const calls: DraftPayload[] = [];
    const { draft, change, read } = createDraft(async (payload) => {
      calls.push(payload);
      if (fail) throw new Error("模拟网络中断");
      return "903";
    });
    draft.reset("903");
    change("不能丢失的编辑");

    expect(await draft.save()).toBe(false);
    expect(read().name).toBe("不能丢失的编辑");
    expect(draft.status.value).toBe("error");
    expect(draft.error.value).toBe("模拟网络中断");
    expect(draft.dirty.value).toBe(true);

    fail = false;
    expect(await draft.save()).toBe(true);
    expect(calls.map((payload) => payload.id)).toEqual(["903", "903"]);
  });

  test("服务端未返回有效 ID 时不显示已保存", async () => {
    const { draft } = createDraft(async () => ({ code: 200 }));
    expect(await draft.save()).toBe(false);
    expect(draft.status.value).toBe("error");
    expect(draft.id.value).toBe("");
  });

  test("保存微任务开始前切换草稿，旧任务不得发送请求或改变新草稿状态", async () => {
    const calls: DraftPayload[] = [];
    const { draft, change } = createDraft(async (payload) => {
      calls.push(payload);
      return "904";
    });
    change("旧草稿");
    const saving = draft.save();
    change("新草稿");
    draft.reset("905");

    expect(await saving).toBe(false);
    expect(calls).toHaveLength(0);
    expect(draft.id.value).toBe("905");
    expect(draft.status.value).toBe("saved");
    expect(draft.saving.value).toBe(false);
  });

  test("切换草稿后收到旧响应，不修改新草稿 ID 或触发地址更新", async () => {
    const server = deferred<string>();
    const createdIds: string[] = [];
    const { draft, change } = createDraft(
      () => server.promise,
      async (id) => {
        createdIds.push(id);
      },
    );
    change("旧草稿");
    const saving = draft.save();
    await flushPromises();
    change("新草稿");
    draft.reset("905");
    server.resolve("904");

    expect(await saving).toBe(false);
    expect(draft.id.value).toBe("905");
    expect(draft.status.value).toBe("saved");
    expect(createdIds).toHaveLength(0);
  });

  test("编辑和等待都不会自动保存，手动保存允许字段不完整", async () => {
    const calls: DraftPayload[] = [];
    const { draft, change } = createDraft(async (payload) => {
      calls.push(payload);
      return "906";
    });
    change("只填写名称");

    expect(await draft.wait()).toBe(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1300));
    expect(calls).toHaveLength(0);
    expect(draft.status.value).toBe("unsaved");
    expect(await draft.save()).toBe(true);
    expect(calls).toEqual([{ name: "只填写名称", eventCategory: "" }]);
    expect(draft.status.value).toBe("saved");
  });

  test("等待正在进行的手动保存不会额外发送草稿请求", async () => {
    const server = deferred<string>();
    const calls: DraftPayload[] = [];
    const { draft, change } = createDraft(async (payload) => {
      calls.push(payload);
      return server.promise;
    });
    change("点击时进度");
    const saving = draft.save();
    await flushPromises();
    const waiting = draft.wait();
    change("等待期间继续编辑");
    server.resolve("907");

    expect(await waiting).toBe(true);
    expect(await saving).toBe(true);
    expect(calls).toEqual([{ name: "点击时进度", eventCategory: "" }]);
    expect(draft.dirty.value).toBe(true);
    expect(draft.id.value).toBe("907");
  });
});

import { beforeEach, describe, expect, it } from "bun:test";

import { readHostUserProfile } from "./assistant-host-user-profile";

function installMemorySessionStorage(): void {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string): string | null => store.get(key) ?? null,
      setItem: (key: string, value: string): void => {
        store.set(key, value);
      },
      removeItem: (key: string): void => {
        store.delete(key);
      },
      clear: (): void => {
        store.clear();
      },
    },
  });
}

describe("readHostUserProfile", () => {
  beforeEach(() => {
    installMemorySessionStorage();
  });

  it("matches top-bar content: fileVO.path + name", () => {
    sessionStorage.setItem(
      "GH-UserInfo",
      JSON.stringify({
        name: "张三",
        username: "zhangsan",
        fileVO: { path: "/files/avatar.png" },
      }),
    );
    expect(readHostUserProfile()).toEqual({
      name: "张三",
      avatarSrc: "/files/avatar.png",
      hasFileVO: true,
    });
  });

  it("falls back to username when name is empty, like top bar", () => {
    sessionStorage.setItem(
      "GH-UserInfo",
      JSON.stringify({
        name: "",
        username: "zhangsan",
        fileVO: null,
      }),
    );
    expect(readHostUserProfile()).toEqual({
      name: "zhangsan",
      avatarSrc: "",
      hasFileVO: false,
    });
  });

  it("treats missing fileVO as no avatar src branch", () => {
    sessionStorage.setItem(
      "GH-UserInfo",
      JSON.stringify({
        name: "李四",
      }),
    );
    expect(readHostUserProfile()).toEqual({
      name: "李四",
      avatarSrc: "",
      hasFileVO: false,
    });
  });

  it("returns empty profile when storage is missing or invalid", () => {
    sessionStorage.removeItem("GH-UserInfo");
    expect(readHostUserProfile()).toEqual({ name: "", avatarSrc: "", hasFileVO: false });
    sessionStorage.setItem("GH-UserInfo", "{");
    expect(readHostUserProfile()).toEqual({ name: "", avatarSrc: "", hasFileVO: false });
  });
});

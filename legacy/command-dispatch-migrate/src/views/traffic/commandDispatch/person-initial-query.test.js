import { parse } from "@vue/compiler-sfc";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRenderer, defineComponent, h, nextTick, ref } from "vue";
import { createStore } from "vuex";

let PersonList;
let temporaryModuleDirectory;

const renderer = createRenderer({
  patchProp: (node, key, _previous, next) => {
    node.props[key] = next;
  },
  insert: (child, parent) => {
    child.parent = parent;
    parent.children.push(child);
  },
  remove: (child) => {
    if (!child.parent) return;
    child.parent.children = child.parent.children.filter((item) => item !== child);
  },
  createElement: (type) => ({ type, props: {}, children: [], parent: null }),
  createText: (text) => ({ type: "#text", props: {}, children: [], parent: null, text }),
  createComment: (text) => ({ type: "#comment", props: {}, children: [], parent: null, text }),
  setText: (node, text) => {
    node.text = text;
  },
  setElementText: (node, text) => {
    node.children = [{ type: "#text", props: {}, children: [], parent: node, text }];
  },
  parentNode: (node) => node.parent,
  nextSibling: () => null,
  setScopeId: () => undefined,
  insertStaticContent: (content, parent) => {
    const node = { type: "#static", props: {}, children: [], parent, text: content };
    parent.children.push(node);
    return [node, node];
  },
});

beforeAll(async () => {
  const componentPath = path.join(import.meta.dir, "person.vue");
  const componentSource = await readFile(componentPath, "utf8");
  const { descriptor } = parse(componentSource, { filename: componentPath });
  const vueUrl = import.meta.resolve("vue");
  const vuexUrl = import.meta.resolve("vuex");
  const scriptSource = descriptor.script.content
    .replace('from "vue";', `from "${vueUrl}";`)
    .replace('from "vuex";', `from "${vuexUrl}";`)
    .replace('import { isInRadius } from "../../../utils/common";', "const isInRadius = () => true;");
  temporaryModuleDirectory = await mkdtemp(path.join(os.tmpdir(), "command-dispatch-person-test-"));
  const componentModulePath = path.join(temporaryModuleDirectory, "person-script.mjs");
  await writeFile(componentModulePath, scriptSource, "utf8");
  PersonList = (await import(pathToFileURL(componentModulePath).href)).default;
});

afterAll(async () => {
  if (temporaryModuleDirectory) {
    await rm(temporaryModuleDirectory, { recursive: true });
  }
});

describe("command dispatch online-person panel", () => {
  it("uses the map person list instead of querying an independent data source", async () => {
    const store = createStore({
      state: () => ({ hasConfig: true, userInfo: { id: "current-user" } }),
      getters: {
        hasConfig: (state) => state.hasConfig,
        userInfo: (state) => state.userInfo,
        webrtcInstance: () => null,
      },
    });
    let onlineQueryCount = 0;
    const mapPersonList = ref([]);
    const personListRef = ref();
    const Root = defineComponent({
      setup: () => () =>
        h(PersonList, {
          ref: personListRef,
          compact: true,
          onlineMode: true,
          onlinePersonList: mapPersonList.value,
        }),
    });
    const host = { type: "root", props: {}, children: [], parent: null };
    const app = renderer.createApp(Root);
    app.config.warnHandler = () => undefined;
    app.config.globalProperties.$api = {
      getOrganizations: async () => [],
      getCommunicateUserList: async () => {
        onlineQueryCount += 1;
        return [];
      },
    };
    app.use(store);

    const originalWindow = globalThis.window;
    globalThis.window = {
      setInterval: () => 1,
      clearInterval: () => undefined,
    };
    try {
      app.mount(host);
      await Promise.resolve();
      mapPersonList.value = [
        {
          id: "person-1",
          name: "现场人员一",
          account: "account-1",
          isOnline: true,
          gps: { lng: 116.4, lat: 39.9 },
        },
      ];
      await nextTick();
      await Promise.resolve();
      expect(onlineQueryCount).toBe(0);
      expect(personListRef.value.list.map((item) => item.id)).toEqual(["person-1"]);
    } finally {
      app.unmount();
      globalThis.window = originalWindow;
    }
  });

  it("loads map personnel in batches of ten while keeping the full list scrollable", async () => {
    const store = createStore({
      getters: {
        webrtcInstance: () => null,
      },
    });
    const mapPersonList = ref([]);
    const personListRef = ref();
    const Root = defineComponent({
      setup: () => () =>
        h(PersonList, {
          ref: personListRef,
          compact: true,
          onlineMode: true,
          onlinePersonList: mapPersonList.value,
        }),
    });
    const host = { type: "root", props: {}, children: [], parent: null };
    const app = renderer.createApp(Root);
    app.config.warnHandler = () => undefined;
    app.config.globalProperties.$api = {
      getOrganizations: async () => [],
    };
    app.use(store);

    try {
      app.mount(host);
      mapPersonList.value = Array.from({ length: 25 }, (_, index) => ({
        id: `person-${index + 1}`,
        name: `现场人员${index + 1}`,
        account: `account-${index + 1}`,
        isOnline: true,
      }));
      await nextTick();

      expect(personListRef.value.list).toHaveLength(10);
      personListRef.value.handleCompactScroll({
        target: { scrollTop: 500, clientHeight: 500, scrollHeight: 1000 },
      });
      await nextTick();
      expect(personListRef.value.list).toHaveLength(20);

      mapPersonList.value = [...mapPersonList.value];
      await nextTick();
      expect(personListRef.value.list).toHaveLength(20);

      personListRef.value.handleCompactScroll({
        target: { scrollTop: 500, clientHeight: 500, scrollHeight: 1000 },
      });
      await nextTick();
      expect(personListRef.value.list).toHaveLength(25);
    } finally {
      app.unmount();
    }
  });
});

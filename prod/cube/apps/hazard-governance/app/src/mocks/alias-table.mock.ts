import { registerMock } from "./index";

/**
 * `@ghcloud/cube-app-design` 的 `useCubeTable({ tableCode })` 会自动挂载 `AliasTable`，
 * 进而调用 `@ghcloud/cube-dictionary-service` 的以下接口加载 tenant / user 列配置：
 *
 * - `GET /api/dictionary/getDataDictionaryByItem`
 * - `GET /api/dictionary/user-dictionary/list`
 *
 * 在 dev + mock 场景下这些请求没有真实后端，必须提供默认空响应，
 * 否则会走 Vite SPA fallback 拿到 `index.html`，被 `CubeRequestImpl.parseResponse` 喂给
 * `JSON.parse` 抛出 `SyntaxError: Unexpected token '<'`。
 *
 * **列顺序/显隐**：`user-dictionary/list` 若恒为空，保存后 `getAliasTableColumn` 读不到配置，表格不会变。
 * 因此对 user-dictionary 的增删改查做**内存持久化**，仅用于本地 mock。
 */
interface MockUserDictionaryRecord {
  id: string;
  itemCode: string;
  name: string;
  code: string;
  variable: string;
}

const userDictionaryStore = new Map<string, MockUserDictionaryRecord>();

let mockUserDictIdSeq = 1;

function nextMockUserDictId(): string {
  const n = mockUserDictIdSeq;
  mockUserDictIdSeq += 1;
  return `mock-ud-${n}`;
}

function compositeKey(name: string, code: string): string {
  return code.length > 0 ? code : name;
}

export function registerAliasTableMocks(): void {
  registerMock("GET", /^\/api\/dictionary\/getDataDictionaryByItem/, () => []);
  registerMock("GET", /^\/api\/dictionary\/admin\/getDataDictionaryByItem/, () => []);
  registerMock("GET", /^\/api\/dictionary\/getSysDictionaryByItem/, () => []);
  registerMock("GET", /^\/api\/dictionary\/getDictionaryItemByCode\//, () => []);
  registerMock("GET", /^\/api\/dictionary\/user-dictionary\/list/, (req) => {
    const url = new URL(req.url, "http://mock.local");
    const itemCode = url.searchParams.get("itemCode") ?? "";
    const name = url.searchParams.get("name") ?? "";
    const code = url.searchParams.get("code") ?? "";
    const key = compositeKey(name, code);
    if (key.length === 0) {
      return [];
    }
    const rec = userDictionaryStore.get(key);
    if (!rec || rec.itemCode !== itemCode) {
      return [];
    }
    return [rec];
  });
  registerMock("POST", /^\/api\/dictionary\/user-dictionary\/add/, async (req) => {
    const body = (await req.json()) as {
      itemCode: string;
      name?: string;
      code?: string;
      variable?: string;
    };
    const key = compositeKey(body.name ?? "", body.code ?? "");
    if (key.length === 0) {
      return {};
    }
    const rec: MockUserDictionaryRecord = {
      id: nextMockUserDictId(),
      itemCode: body.itemCode,
      name: body.name ?? "",
      code: body.code ?? "",
      variable: body.variable ?? "[]",
    };
    userDictionaryStore.set(key, rec);
    return rec;
  });
  registerMock("PUT", /^\/api\/dictionary\/user-dictionary\/update/, async (req) => {
    const body = (await req.json()) as {
      id: string;
      itemCode?: string;
      name?: string;
      code?: string;
      variable?: string;
    };
    for (const rec of userDictionaryStore.values()) {
      if (rec.id !== body.id) {
        continue;
      }
      if (body.variable !== undefined) {
        rec.variable = body.variable;
      }
      if (body.name !== undefined) {
        rec.name = body.name;
      }
      if (body.code !== undefined) {
        rec.code = body.code;
      }
      if (body.itemCode !== undefined) {
        rec.itemCode = body.itemCode;
      }
      break;
    }
    return {};
  });
  registerMock("DELETE", /^\/api\/dictionary\/user-dictionary\/delete\//, (req) => {
    const url = new URL(req.url, "http://mock.local");
    const parts = url.pathname.split("/").filter((s) => s.length > 0);
    const id = parts[parts.length - 1];
    for (const [key, rec] of userDictionaryStore) {
      if (rec.id === id) {
        userDictionaryStore.delete(key);
        break;
      }
    }
    return {};
  });
}

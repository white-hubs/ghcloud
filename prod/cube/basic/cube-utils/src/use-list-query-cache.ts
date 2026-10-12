import { type LocationQuery, type LocationQueryRaw, useRoute, useRouter } from "vue-router";

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];
type QueryState = Record<string, QueryValue>;

type UseListQueryCacheOptions<T extends QueryState> = {
  /**
   * 返回页面当前最新的查询状态。
   */
  getState: () => T;
  /**
   * 在 URL 回填/重置时更新页面状态。
   */
  setState: (next: Partial<T>) => void;
  /**
   * 默认查询值，用于重置和空参数兜底。
   */
  defaults: T;
  /**
   * 可选：将 route.query 解析为业务状态。
   * 当页面字段需要自定义转换时使用，例如时间段数组。
   */
  decode?: (query: LocationQuery) => Partial<T>;
  /**
   * 可选：将业务状态序列化为 route.query。
   * 当页面字段需要自定义序列化时使用。
   */
  encode?: (state: T) => LocationQueryRaw;
};

type UseListQueryCacheResult = {
  hydrate: () => void;
  sync: () => Promise<void>;
  reset: () => Promise<void>;
  hydrateAndQuery: (query: () => void | Promise<void>) => Promise<void>;
};

function firstQueryValue(value: string | string[] | null | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? undefined;
}

function isEmptyQueryValue(value: QueryPrimitive): boolean {
  return value === "" || value === null || value === undefined;
}

function defaultEncode<T extends QueryState>(state: T): LocationQueryRaw {
  const query: LocationQueryRaw = {};
  Object.keys(state).forEach((key) => {
    const value = state[key];
    if (Array.isArray(value)) {
      const cleaned = value.filter((item) => !isEmptyQueryValue(item));
      if (cleaned.length > 0) {
        query[key] = cleaned.join(",");
      }
      return;
    }

    if (!isEmptyQueryValue(value)) {
      query[key] = String(value);
    }
  });
  return query;
}

function defaultDecode<T extends QueryState>(query: LocationQuery): Partial<T> {
  const patch: Record<string, unknown> = {};
  Object.keys(query).forEach((key) => {
    const value = firstQueryValue(query[key]);
    if (value !== undefined) {
      patch[key] = value;
    }
  });
  return patch as Partial<T>;
}

export function useListQueryCache<T extends QueryState>(options: UseListQueryCacheOptions<T>): UseListQueryCacheResult {
  const route = useRoute();
  const router = useRouter();

  const decode = options.decode ?? defaultDecode<T>;
  const encode = options.encode ?? defaultEncode<T>;

  const hydrate = (): void => {
    const patch = decode(route.query);
    options.setState({
      ...options.defaults,
      ...patch,
    });
  };

  const sync = async (): Promise<void> => {
    const encodedQuery = encode(options.getState());
    const passthroughQuery: LocationQueryRaw = {};

    Object.keys(route.query).forEach((key) => {
      if (!(key in options.defaults)) {
        passthroughQuery[key] = route.query[key];
      }
    });

    await router.replace({
      query: {
        ...passthroughQuery,
        ...encodedQuery,
      },
    });
  };

  const reset = async (): Promise<void> => {
    options.setState({ ...options.defaults });
    await sync();
  };

  const hydrateAndQuery = async (query: () => void | Promise<void>): Promise<void> => {
    hydrate();
    await query();
    await sync();
  };

  return {
    hydrate,
    sync,
    reset,
    hydrateAndQuery,
  };
}

/**
 * 列表页 URL 缓存辅助方法（适用于未使用公共表单/列表组件的页面）。
 *
 * 适用场景：
 * - 手写 Form + Table + Pagination 的列表页
 * - 需要“返回列表后恢复筛选条件/分页”的页面
 * - 需要地址栏可回显查询参数的页面
 *
 * 入参说明：
 * - `defaults`：默认查询状态（用于首次兜底和重置）
 * - `getState`：读取页面当前查询状态（用于同步到 URL）
 * - `setState`：将 URL 状态回填到页面状态
 * - `decode`：可选，自定义 URL -> 页面状态转换
 * - `encode`：可选，自定义 页面状态 -> URL 转换
 *
 * 标准接入步骤：
 * 1. 定义查询状态对象（keyword、筛选项、pageNumber、pageSize、tab 等）。
 * 2. 创建 `queryCache = useListQueryCache({ defaults, getState, setState, encode/decode })`。
 * 3. 在 `onMounted` 中调用 `await queryCache.hydrateAndQuery(query)`。
 * 4. 每次查询成功后调用 `await queryCache.sync()`。
 * 5. 查询按钮触发前必须先重置 `pageNumber = 1`，再执行 `query()`。
 *
 * 注意事项：
 * - `query()` 内部不要再无条件重置 `pageNumber`，否则会覆盖分页切换行为。
 * - 复杂字段（如时间段、级联数组、tab 的 null 值）请使用 `encode/decode` 统一转换。
 * - `sync()` 使用 `router.replace`，不会新增历史记录，适合频繁筛选场景。
 */

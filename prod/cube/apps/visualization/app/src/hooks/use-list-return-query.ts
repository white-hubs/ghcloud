import type { LocationQueryRaw } from "vue-router";

/** 进入配置页前缓存列表查询条件，返回时恢复 */
const STORAGE_KEY = "visualization:project-list-query";

export type ProjectListQueryCache = {
  keyword?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
};

const toQueryValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(value);
};

/** 保存当前列表查询态 */
export const saveProjectListQuery = (query: ProjectListQueryCache): void => {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  const payload: Record<string, string> = {};
  const keyword = toQueryValue(query.keyword);
  const pageNumber = toQueryValue(query.pageNumber);
  const pageSize = toQueryValue(query.pageSize);
  if (keyword) {
    payload.keyword = keyword;
  }
  if (pageNumber) {
    payload.pageNumber = pageNumber;
  }
  if (pageSize) {
    payload.pageSize = pageSize;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

/** 读取并返回可用于 router.push 的 query（不清除，多次返回仍可用） */
export const readProjectListQuery = (): LocationQueryRaw => {
  if (typeof sessionStorage === "undefined") {
    return {};
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as ProjectListQueryCache;
    const query: LocationQueryRaw = {};
    const keyword = toQueryValue(parsed.keyword);
    const pageNumber = toQueryValue(parsed.pageNumber);
    const pageSize = toQueryValue(parsed.pageSize);
    if (keyword) {
      query.keyword = keyword;
    }
    if (pageNumber) {
      query.pageNumber = pageNumber;
    }
    if (pageSize) {
      query.pageSize = pageSize;
    }
    return query;
  } catch {
    return {};
  }
};

/** 返回项目管理（带缓存查询条件） */
export const buildProjectListLocation = (): { name: "ProjectList"; query: LocationQueryRaw } => ({
  name: "ProjectList",
  query: readProjectListQuery(),
});

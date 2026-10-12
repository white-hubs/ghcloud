import type { Pagination } from "@ghcloud/cube-service-interface/base";

/** 兼容分页对象与 options 接口直接返回数组 */
export function unwrapPageRecords<T>(page: Pagination<T> | T[] | null | undefined): T[] {
  if (Array.isArray(page)) {
    return page;
  }
  return page?.records ?? [];
}

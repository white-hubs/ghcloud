/** 设备列表弹窗查询缓存（挂 globalThis；刷新页面自然清空） */

export type EquipmentTableQueryCache = {
  /** 写入时的业务菜单，用于校验是否仍有效 */
  sceneType: string;
  keyword: string;
  pageNumber: number;
  pageSize: number;
  total: number;
};

const GLOBAL_KEY = "__ue5_modal_equipment_table_query_cache__";

type CacheStore = {
  current: EquipmentTableQueryCache | null;
};

const getStore = (): CacheStore => {
  const globalRef = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: CacheStore;
  };
  if (!globalRef[GLOBAL_KEY]) {
    globalRef[GLOBAL_KEY] = { current: null };
  }
  return globalRef[GLOBAL_KEY]!;
};

export const getEquipmentTableQueryCache = (): EquipmentTableQueryCache | null => {
  return getStore().current;
};

export const setEquipmentTableQueryCache = (next: EquipmentTableQueryCache): void => {
  getStore().current = { ...next };
};

export const clearEquipmentTableQueryCache = (): void => {
  getStore().current = null;
};

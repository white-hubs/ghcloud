import type { GetDictionaryByItem } from "@ghcloud/cube-dictionary-service";

import { AliasItemCode, checkAliasItemCode } from "../alias-manage";
import { cubeDictionaryService } from "../api/service";

export async function saveAliasConfigForTableColumn(payload: {
  scope: "tenant" | "user";
  /** 应用Code */
  applicationCode: string;
  /** 表格code 通常由路由code代替 若一个页面有多个表格则要区分 */
  tableCode: string;
  columnConfig: {
    code: string;
    sort: number;
    visible: boolean;
  }[];
}): Promise<void> {
  const saveCode = `${payload.applicationCode}::${payload.tableCode}`;
  const params = {
    itemCode: AliasItemCode.TABLE_COLUMN,
    name: saveCode,
    code: saveCode,
    changeNotice: "REDIS",
    variable: JSON.stringify(payload.columnConfig),
  };
  await checkAliasItemCode(AliasItemCode.TABLE_COLUMN);
  const findConfig = await getAliasConfigForTableColumnByCode({
    applicationCode: payload.applicationCode,
    tableCode: payload.tableCode,
    scope: payload.scope,
  });
  try {
    if (findConfig.data) {
      if (payload.scope === "tenant") {
        await cubeDictionaryService.updateDataDictionary({ ...params, id: findConfig.data.id });
      } else {
        await cubeDictionaryService.updateUserDictionary({ ...params, id: findConfig.data.id });
      }
    } else {
      if (payload.scope === "tenant") {
        await cubeDictionaryService.addDataDictionary(params);
      } else {
        await cubeDictionaryService.addUserDictionary(params);
      }
    }
  } catch (error) {
    throw new Error("访问端别名配置失败");
  }
}

export async function getAliasConfigForTableColumnByCode(payload: {
  /** 应用Code */
  applicationCode: string;
  /** 表格code 通常由路由code代替 若一个页面有多个表格则要区分 */
  tableCode: string;
  /** 若不指定scope 则默认为用户级覆盖租户级 */
  scope?: "tenant" | "user";
}): Promise<{ data: GetDictionaryByItem | null; scope: "tenant" | "user" }> {
  let tenantAlias: GetDictionaryByItem | null = null;
  let userAlias: GetDictionaryByItem | null = null;
  const code = `${payload.applicationCode}::${payload.tableCode}`;
  const tenantConfig = await cubeDictionaryService.getDictionaryByItem({
    itemCode: AliasItemCode.TABLE_COLUMN,
    name: code,
    code,
  });
  tenantAlias = tenantConfig?.length ? tenantConfig[0] : null;
  const userConfig = await cubeDictionaryService.getUserDictionaryList({
    itemCode: AliasItemCode.TABLE_COLUMN,
    name: code,
    code,
  });
  userAlias = userConfig.length ? userConfig[0] : null;

  if (payload.scope) {
    return {
      data: payload.scope === "tenant" ? tenantAlias : userAlias,
      scope: payload.scope,
    };
  } else {
    return {
      data: userAlias ?? tenantAlias,
      scope: userAlias ? "user" : "tenant",
    };
  }
}

/** 查表格配置，并返回新的 columns */
export async function getAliasTableColumn(payload: {
  /** 应用Code */
  applicationCode: string;
  /** 表格code 通常由路由code代替 若一个页面有多个表格则要区分 */
  tableCode: string;
  columns: (Record<string, unknown> & { code: string; title: string; fixed?: boolean | string; defaultVisible?: boolean })[];
  filter?: boolean;
  sort?: boolean;
}): Promise<{
  columns: (Record<string, unknown> & { code: string; title: string; visible: boolean; sort: number })[];
  scope: "tenant" | "user";
}> {
  payload.filter = payload.filter ?? true;
  payload.sort = payload.sort ?? true;
  // TODO(zhangzheng) 暂时只放开个人配置等权限做好了，开放tenant
  const aliasConfig = await getAliasConfigForTableColumnByCode({ ...payload, scope: "user" });
  // 如果设置默认可见字段，则配置为空时只显示默认的
  const findDefaultVisible = payload.columns.some((e) => e.defaultVisible);
  let columnsList = payload.columns.map((e, i) => {
    const aliasItems = (aliasConfig.data ? JSON.parse(aliasConfig.data.variable) : []) as {
      code: string;
      sort: number;
      visible: boolean;
    }[];
    const findItem = aliasItems.find((ele) => ele.code === e.code);
    return {
      ...e,
      title: e.title,
      code: e.code,
      fixed: e.fixed,
      visible: findItem?.visible ?? (findDefaultVisible ? !!e.defaultVisible : true),
      sort: findItem?.sort ?? i,
    };
  });
  if (payload.sort) {
    columnsList = columnsList.sort((a, b) => a.sort - b.sort);
  }
  if (payload.filter) {
    columnsList = columnsList.filter((e) => e.visible);
  }
  columnsList.forEach((column) => {
    const original = payload.columns.find((item) => item.code === column.code);
    column.fixed = original?.fixed;
  });
  // Ant Design 固定列需按 left → 普通 → right 排列，否则右侧固定列不会贴在最右边
  const leftFixed = columnsList.filter((column) => column.fixed === "left" || column.fixed === true);
  const rightFixed = columnsList.filter((column) => column.fixed === "right");
  const normal = columnsList.filter((column) => column.fixed !== "left" && column.fixed !== true && column.fixed !== "right");
  columnsList = [...leftFixed, ...normal, ...rightFixed];
  return {
    columns: columnsList,
    scope: aliasConfig.scope,
  };
}

/** 尝试删除个人配置 */
export async function deleteUserConfig(payload: {
  /** 应用Code */
  applicationCode: string;
  /** 表格code 通常由路由code代替 若一个页面有多个表格则要区分 */
  tableCode: string;
}): Promise<void> {
  const code = `${payload.applicationCode}::${payload.tableCode}`;
  const userConfig = await cubeDictionaryService.getUserDictionaryList({
    itemCode: AliasItemCode.TABLE_COLUMN,
    name: code,
    code,
  });
  if (userConfig.length) {
    await cubeDictionaryService.deleteUserDictionary(userConfig[0].id);
  }
}

/** 尝试删除租户 配置 */
export async function deleteTenantConfig(payload: {
  /** 应用Code */
  applicationCode: string;
  /** 表格code 通常由路由code代替 若一个页面有多个表格则要区分 */
  tableCode: string;
}): Promise<void> {
  const code = `${payload.applicationCode}::${payload.tableCode}`;
  const config = await cubeDictionaryService.getDictionaryByItem({
    itemCode: AliasItemCode.TABLE_COLUMN,
    name: code,
    code,
  });
  if (config.length) {
    await cubeDictionaryService.deleteDataDictionary({ id: config[0].id });
  }
}

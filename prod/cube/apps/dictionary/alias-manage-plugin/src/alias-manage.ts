import { cubeDictionaryService } from './api/service'

/** 别名名称枚举 */
export enum AliasItemCode {
  /** 应用别名(图标) */
  APPLICATION = 'APPLICATION_ALIAS',
  /** 菜单 */
  ROUTE = 'MENU_ALIAS',
  /** 列表页字段显隐&排序 */
  TABLE_COLUMN = 'TABLE_COLUMN_ALIAS',
  /** 字段名称 */
  FIELD = 'FIELD_ALIAS',
  /** 访问端入口名称 */
  TERMINAL = 'TERMINAL_ALIAS'
}

/** 检查字典项是否存在 */
export async function checkAliasItemCode (code: string): Promise<void> {
  const dictionaryItem = await cubeDictionaryService.getDictionaryItemByCode({
    code
  })
  if (!dictionaryItem) {
    await cubeDictionaryService.addDataDictionaryItem({
      code,
      remarks: '系统别名配置'
    })
  }
}

export * from './alias-achieve/application'
export * from './alias-achieve/terminal'
export * from './alias-achieve/route'
export * from './alias-achieve/table-column'

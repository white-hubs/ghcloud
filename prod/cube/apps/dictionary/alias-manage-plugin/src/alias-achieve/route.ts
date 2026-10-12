import { AliasItemCode, checkAliasItemCode } from '../alias-manage'
import { cubeDictionaryService } from '../api/service'

export async function saveAliasConfigForRoute (payload: {
  terminalCode: string;
  applicationCode: string;
  alias: {
    code: string;
    name: string;
    icon: string;
    sort: number;
  }[];
}): Promise<void> {
  const saveCode = `${payload.terminalCode}::${payload.applicationCode}`
  const params = {
    itemCode: AliasItemCode.ROUTE,
    name: saveCode,
    code: saveCode,
    changeNotice: 'REDIS',
    variable: JSON.stringify(payload.alias)
  }
  await checkAliasItemCode(AliasItemCode.ROUTE)
  const findConfig = await cubeDictionaryService.getDictionaryByItem({
    itemCode: AliasItemCode.ROUTE,
    name: saveCode,
    code: saveCode
  })
  try {
    if (findConfig?.length) {
      await cubeDictionaryService.updateDataDictionary({ ...params, id: findConfig[0].id })
    } else {
      await cubeDictionaryService.addDataDictionary(params)
    }
  } catch (error) {
    throw new Error('访问端别名配置失败')
  }
}

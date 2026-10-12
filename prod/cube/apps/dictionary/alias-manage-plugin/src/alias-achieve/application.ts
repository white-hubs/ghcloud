import { AliasItemCode, checkAliasItemCode } from '../alias-manage'
import { cubeDictionaryService } from '../api/service'

export async function saveAliasConfigForApplication (payload: {
  code: string;
  icon: string;
  name: string;
}): Promise<void> {
  const params = {
    itemCode: AliasItemCode.APPLICATION,
    name: payload.code,
    code: payload.code,
    changeNotice: 'REDIS',
    variable: JSON.stringify({
      name: payload.name,
      icon: payload.icon
    })
  }
  await checkAliasItemCode(AliasItemCode.APPLICATION)
  const findConfig = await cubeDictionaryService.getDictionaryByItem({
    itemCode: AliasItemCode.APPLICATION,
    name: payload.code,
    code: payload.code
  })
  try {
    if (findConfig?.length) {
      await cubeDictionaryService.updateDataDictionary({ ...params, id: findConfig[0].id })
    } else {
      await cubeDictionaryService.addDataDictionary(params)
    }
  } catch (error) {
    throw new Error('应用别名配置失败')
  }
}

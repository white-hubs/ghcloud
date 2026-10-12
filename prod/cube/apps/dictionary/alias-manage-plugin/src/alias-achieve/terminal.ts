import { AliasItemCode, checkAliasItemCode } from '../alias-manage'
import { cubeDictionaryService } from '../api/service'

export async function saveAliasConfigForTerminal (payload: {
  code: string;
  name: string;
  path: string;
}): Promise<void> {
  const params = {
    itemCode: AliasItemCode.TERMINAL,
    name: payload.code,
    code: payload.code,
    changeNotice: 'REDIS',
    variable: JSON.stringify({
      name: payload.name,
      path: payload.path
    })
  }
  await checkAliasItemCode(AliasItemCode.TERMINAL)
  const findConfig = await cubeDictionaryService.getDictionaryByItem({
    itemCode: AliasItemCode.TERMINAL,
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
    throw new Error('访问端别名配置失败')
  }
}

export async function getAliasConfigForTerminal (): Promise<{ id: string; name: string; code: string; alias: { name: string; path: string; }; }[]> {
  const findConfig = await cubeDictionaryService.getDictionaryByItem({
    itemCode: AliasItemCode.TERMINAL,
  })
  return findConfig.map(e => {
    return {
      id: e.id,
      name: e.variable ? (JSON.parse(e.variable) as { name: string; }).name ?? '' : '',
      code: e.code,
      alias: e.variable ? JSON.parse(e.variable) : {}
    }
  })
}

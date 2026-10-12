import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import type { CubeTerminalEnum } from '@ghcloud/cube-protocol'
const ITEM_CODE = 'FIELD_CONFIG'
export const KEYWORD_ALIAS: Record<string, string> = {
  staff: '员工',
  company: '公司'
}
const initKeyWord = [
  { key: 'staff', fieldName: '员工', alias: '' },
  { key: 'company', fieldName: '公司', alias: '' },
]
export const getConfigList = async (auth: { tenant: string; token: string; }): Promise<void>=>{
  const authStore = {
    tenant: '',
    terminal: 'bimops-manage-web',
    token: ""
  }
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  const cubeDictionaryService = new CubeDictionaryService(authStore as { tenant: string; terminal: CubeTerminalEnum; token: string; })
  const fieldConfig = await cubeDictionaryService.getDictionaryItemByCode({ code: ITEM_CODE })

  if (fieldConfig){
    const dictionaryItem = await cubeDictionaryService.getDictionaryByItem({ itemCode: ITEM_CODE })
    if (!dictionaryItem || dictionaryItem?.length === 0){
      return
    }
    dictionaryItem.forEach((item: { code: string; variable: string; }) => {
      const config = item.variable
      const fieldConfig = ((config && JSON.parse(config).keywords) ?? initKeyWord)
      // 获取别名
      const nameList = fieldConfig.map((item: { alias: string; }, index: string | number)=>{
        let obj
        if (item.alias){
          obj = {
            key: fieldConfig[index].key,
            name: item.alias
          }
        } else {
          obj = {
            key: fieldConfig[index].key,
            name: fieldConfig[index].fieldName
          }
        }
        return obj
      })
      const aliasMap = nameList.reduce((acc: Record<string, string>, curr: { key: string | number; name: string; }) => {
        acc[curr.key] = curr.name
        return acc
      }, {} as Record<string, string>)
      Object.assign(KEYWORD_ALIAS, aliasMap)
    })
  }
}
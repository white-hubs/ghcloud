

import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { getAuthInfoByGLobal } from '@ghcloud/cube-auth-utils'
import { message } from '@ghcloud/cube-ui'
import type { Agent } from './type'

class ApiProxy extends GatewayProxy {
  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    this.getAuthInfo()
    return this.createProxiedInstance(new CubeDictionaryService(this._authInfo))
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
  private getAuthInfo (): void {
    const res = getAuthInfoByGLobal()
    if (res){
      this._authInfo.token = res.token
      this._authInfo.tenant = res.tenant
      this._authInfo.terminal = res.terminal
    }
  }
}

export const apiProxy = new ApiProxy()

const ITEM_CODE = 'AI_CENTER'

const AGENT_LIST_CODE = 'AGENT_LIST'

export const checkDictionary = async (): Promise<void> => {
  const dictionaryItem = await apiProxy.cubeDictionaryServiceProxy.getDictionaryItemByCode({
    code: ITEM_CODE
  })
  if (!dictionaryItem) {
    await apiProxy.cubeDictionaryServiceProxy.addDataDictionaryItem({
      code: ITEM_CODE,
      remarks: 'AI中心配置'
    })
  }
}

// 查询智能体列表
export const getAgentList = async (): Promise<Agent[]> => {
  const res = await apiProxy.cubeDictionaryServiceProxy.getDictionaryByItem({ itemCode: ITEM_CODE, code: AGENT_LIST_CODE })
  if (res.length === 0) {
    await apiProxy.cubeDictionaryServiceProxy.addDataDictionary({
      itemCode: ITEM_CODE,
      code: AGENT_LIST_CODE,
      name: '智能体列表',
      variable: JSON.stringify([])
    })
    return []
  }
  return JSON.parse(res[0].variable)
}

// 创建智能体
export const addAgent = async (agent: Agent): Promise<void>=>{
  // 查询现有的配置
  const res = await apiProxy.cubeDictionaryServiceProxy.getDictionaryByItem({ itemCode: ITEM_CODE, code: AGENT_LIST_CODE })
  const payload = [...JSON.parse(res[0].variable), agent]
  await apiProxy.cubeDictionaryServiceProxy.updateDataDictionary({
    id: res[0].id,
    name: res[0].name,
    variable: JSON.stringify(payload),
  })
}

// 更新智能体
export const updateAgent = async (agent: Agent): Promise<void>=>{
  // 查询现有的配置
  const res = await apiProxy.cubeDictionaryServiceProxy.getDictionaryByItem({ itemCode: ITEM_CODE, code: AGENT_LIST_CODE })
  const payload = JSON.parse(res[0].variable)
  const index = payload.findIndex((e: Agent) => e.id === agent.id)
  if (index === -1) {
    throw new Error('智能体不存在')
  }
  payload[index] = agent
  await apiProxy.cubeDictionaryServiceProxy.updateDataDictionary({
    id: res[0].id,
    name: res[0].name,
    variable: JSON.stringify(payload),
  })
}

// 保存智能体排序
export const saveAgentList = async (agentList: Agent[]): Promise<void> => {
  const res = await apiProxy.cubeDictionaryServiceProxy.getDictionaryByItem({ itemCode: ITEM_CODE, code: AGENT_LIST_CODE })
  await apiProxy.cubeDictionaryServiceProxy.updateDataDictionary({
    id: res[0].id,
    name: res[0].name,
    variable: JSON.stringify(agentList),
  })
  message.success('保存成功')
}


// 删除智能体
export const deleteAgent = async (id: string): Promise<void> => {
  const res = await apiProxy.cubeDictionaryServiceProxy.getDictionaryByItem({ itemCode: ITEM_CODE, code: AGENT_LIST_CODE })
  const payload = JSON.parse(res[0].variable)
  const index = payload.findIndex((e: Agent) => e.id === id)
  if (index === -1) {
    throw new Error('智能体不存在')
  }
  payload.splice(index, 1)
  await apiProxy.cubeDictionaryServiceProxy.updateDataDictionary({
    id: res[0].id,
    name: res[0].name,
    variable: JSON.stringify(payload),
  })
  message.success('删除成功')
}
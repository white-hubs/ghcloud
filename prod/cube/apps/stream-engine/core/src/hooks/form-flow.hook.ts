import { FormItemPermission, type ApprovalOpinion, type FlowFormData, type FormFlowInstance, type FormOption, type FormPerms } from '../type'
import { cubeFlowService } from '../api/server'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'

// 获取权限 隐藏 / 只读
export const getPermission = (item: FormOption, flowJson: string | undefined, nodeId: string): { show: boolean; readonly: boolean; } => {
  const res = {
    show: false,
    readonly: false,
  }
  if (flowJson === '' || typeof flowJson === 'undefined') {
    return res
  }
  // 流程结束情况 全部显示 全部只读
  if (nodeId === '') {
    res.show = true
    res.readonly = true
    return res
  }

  const formPerms = getFormPerms(flowJson, nodeId)
  const findIndex = formPerms.findIndex(e => e.id === item.id)
  // 如果没有获取到权限数据的情况
  if (formPerms.length === 0 || findIndex === -1) {
    res.show = true
    res.readonly = nodeId !== 'root'
    return res
  }

  res.show = formPerms[findIndex].perm !== FormItemPermission.HIDE
  res.readonly = formPerms[findIndex].perm === FormItemPermission.READONLY
  return res
}
// 通过当前节点获取表单组件权限
const getFormPerms = (flowJson: string, nodeId: string): FormPerms[] => {
  if (nodeId !== '') {
    const nowNode = getNode(JSON.parse(flowJson), nodeId)
    return (nowNode != null) ? nowNode.props.formPerms : []
  }
  return []
}
// 获取节点配置
export function getNode (obj: any, nodeId: string | null): any {
  if (obj.id === nodeId) return obj

  let findNode = null

  if (typeof obj.branchs !== 'undefined' && obj.branchs.length > 0) {
    let branchsRes = null
    for (let index = 0; index < obj.branchs.length; index++) {
      branchsRes = getNode(obj.branchs[index], nodeId)
      if (branchsRes != null) {
        break
      }
    }
    findNode = branchsRes
  }

  if ((findNode == null) && typeof obj.children !== 'undefined') {
    findNode = getNode(obj.children, nodeId)
  }

  return findNode
}
/** 获取当前流程节点信息 */
export const getNowNode = (flowInstance: FormFlowInstance): any => {
  const flowObj = JSON.parse(flowInstance.properties.processJson)
  const nowNode = getNode(flowObj, flowInstance.key)
  if (nowNode && isUndefined(nowNode.props.sign)) {
    nowNode.props.sign = true
  }
  if (nowNode && isUndefined(nowNode.props.opinion)) {
    nowNode.props.opinion = true
  }
  return nowNode
  function isUndefined (obj: any): boolean {
    return typeof obj === 'undefined'
  }
}

class FormFlowService {
  public async getFormFlowProcess (formInstanceId: string): Promise<FormFlowInstance> {
    return cubeFlowService.getTaskForm(formInstanceId)
  }

  /** 流程同意/通过 */
  public async processApprove (taskId: string, formData: FlowFormData, approvalOpinion: ApprovalOpinion | null, formFlowProcess: FormFlowInstance): Promise<void> {
    const branchArr = this.getBranches(JSON.parse(formFlowProcess.properties.processJson))
    const conditions = this.getConditions(branchArr)
    const variables = this.convertConditions(conditions, formData)

    // 表单内联系人
    const appRovalNodes = this.getApprovalAndCCNode(JSON.parse(formFlowProcess.properties.processJson))
    appRovalNodes.forEach(e => {
      if (e.props.assignedType === 'FORM_USER' && e.props.formUser !== '' && formData[e.props.formUser] !== undefined) {
        const formUserValue = JSON.parse(JSON.stringify(formData[e.props.formUser])) ?? ''
        if (formUserValue !== '') {
          variables[e.props.formUser] = formUserValue
        }
      }
    })
    // 判断外链
    const underCubeEnvironment = getEnvironment() === 'cubeApp' // 判断是否是出处于CubeAPP环境，是否外链
    !underCubeEnvironment && (variables.resource = 'EXTERNAL_CHAIN_APPROVAL')
    const body: Record<string, any> = {
      // 流程处理人，null 代表为当前鉴权用户
      account: underCubeEnvironment ? null : '381496',
      data: JSON.stringify(formData),
      result: 'PASS',
      taskId,
      variables
    }
    if (approvalOpinion != null) {
      body.approvalOpinion = approvalOpinion
    }
    await cubeFlowService.taskComplete(body)
    !underCubeEnvironment && window.location.reload()
  }

  public getBranches (obj: any, arr: any[] = []): any[] {
    if (typeof obj.branchs !== 'undefined' && obj.branchs.length > 0) {
      for (const key in obj.branchs) {
        arr.push(obj.branchs[key])
        if (typeof obj.branchs[key].children !== 'undefined') {
          this.getBranches(obj.branchs[key].children, arr)
        }
      }
    }
    if (typeof obj.children !== 'undefined') {
      this.getBranches(obj.children, arr)
    }
    return arr
  }

  public getConditions (arr: any): any[] {
    let res: any[] = []
    arr.forEach((e: any) => {
      if (typeof e.props.groups !== 'undefined') {
        e.props.groups.forEach((ele: any) => {
          res = [...res, ...ele.conditions]
        })
      }
    })
    return res
  }

  public convertConditions (arr: any[], formData: FlowFormData): Record<string, any> {
    const obj: Record<string, any> = {}
    arr.forEach(e => {
      const key = e.id
      let value = formData[key]
      obj[key] = value
      if (key !== 'root') {
        obj[key] = value ?? ''
      }
      // 值需要转换
      if (e.name === 'OvertimeLength') { // 加班时长，目前单位都是小时 需要转换成天
        value = Math.floor((formData[key].name / 8) * 100) / 100
        obj[key] = parseFloat(value)
      }
      if (e.name === 'VacationLength') { // 请假时长，DAY 天 HOUR 小时 HALF_DAY半天
        value = Math.floor(formData[key] / 8 * 100) / 100
        obj[key] = parseFloat(value)
      }
      if (e.name === 'DepartureTimeLength') { // 离岗时长
        value = Math.floor((formData[key] / 8) * 100) / 100
        obj[key] = parseFloat(value)
      }
    })
    return obj
  }

  // 获取审批节点
  public getApprovalAndCCNode (obj: any, arr: any[] = []): any[] {
    if (obj.type === 'APPROVAL' || obj.type === 'CC') {
      arr.push(obj)
    }
    if (typeof obj.branchs !== 'undefined' && obj.branchs.length > 0) {
      for (const key in obj.branchs) {
        if (obj.branchs[key].type === 'APPROVAL' || obj.branchs[key].type === 'CC') {
          arr.push(obj.branchs[key])
        }
        if (typeof obj.branchs[key].children !== 'undefined') {
          this.getApprovalAndCCNode(obj.branchs[key].children, arr)
        }
      }
    }
    if (typeof obj.children !== 'undefined') {
      this.getApprovalAndCCNode(obj.children, arr)
    }
    return arr
  }
}

export const formFlowService = new FormFlowService()

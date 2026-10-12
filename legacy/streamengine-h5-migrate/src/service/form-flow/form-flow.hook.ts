import { FormFlowInstance, FormOption } from '../../domain/form-flow'

// 当前表单权限 只读 可编辑 隐藏
enum FormItemPermission {
  READONLY = 'R',
  EDIT = 'E',
  HIDE = 'H'
}

interface FormPerms {
  id: string;
  perm: FormItemPermission;
  required: boolean;
  title: string;
  props: any;
}

// 通过当前节点获取表单组件权限
const getFormPerms = (flowJson: string, nodeId: string,callType:string): FormPerms[] => {
  const instance=JSON.parse(sessionStorage.getItem('instance') as string)
  const status=instance?.processInstanceRunningInfo?.status??''
  const formPerms=instance?.processInstanceRunningInfo?.formPerms as FormPerms[]??[]
  if(['REJECT','UNDO'].includes(status)){
    return formPerms
  }
  if (nodeId !== '') {
    const nowNode = getNode(JSON.parse(flowJson), nodeId)
    if(callType==='EXTERNAL'){
      return (nowNode != null) ? nowNode.props.outerFormPerms : []
    }else{
    return (nowNode != null) ? nowNode.props.formPerms : []
    }
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

// 获取权限 隐藏 / 只读
export const getPermission = (item: FormOption, flowJson: string | undefined, nodeId: string,callType?:string): { show: boolean; readonly: boolean; } => {
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

  const formPerms = getFormPerms(flowJson, nodeId,callType??'')
  const findIndex = formPerms?.findIndex(e => e.id === item.id)
  // 如果没有获取到权限数据的情况
  if (formPerms&&(formPerms.length === 0 || findIndex === -1)) {
    res.show = true
    res.readonly = nodeId !== 'root'
    return res
  }
  res.show = formPerms&&formPerms[findIndex].perm !== FormItemPermission.HIDE
  res.readonly = formPerms&&formPerms[findIndex].perm === FormItemPermission.READONLY
  return res
}


/** 获取当前流程节点信息 */ 
export const getNowNode = (flowInstance:FormFlowInstance) => {
  const flowObj = JSON.parse(flowInstance.properties.processJson)
  const nowNode = getNode(flowObj, flowInstance.key)
  if (nowNode && isUndefined(nowNode.props.sign)) {
    nowNode.props.sign = true
  }
  if (nowNode && isUndefined(nowNode.props.opinion)) {
    nowNode.props.opinion = true
  }
  return nowNode
  function isUndefined(obj: any) {
    return typeof obj === 'undefined'
  }
}


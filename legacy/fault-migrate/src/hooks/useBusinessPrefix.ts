import { getCurrentApplicationCode } from './useCurrentApplication'

export function getBusinessPrefix() {
  const applicationCode = getCurrentApplicationCode()
  let businessPrefix = (import.meta as unknown as {env:{VITE_BUSINESS_PREFIX?:string}}).env.VITE_BUSINESS_PREFIX
  if(businessPrefix){
    return businessPrefix
  }
  businessPrefix = '故障'
  if(applicationCode === 'COMPLAINT'){
    businessPrefix = '投诉'
  }
  return businessPrefix
}

export const getUrgencyLevelColumnText = (): string=>{
  const text = '紧急程度'
  return text
}

export const getInstanceNameColumnText = (): string=>{
  return '工单名称'
}

export const getObjectNameColumnText = (): string=>{
  const applicationCode = getCurrentApplicationCode()
  const businessPrefix = getBusinessPrefix()
  let text =  `${businessPrefix}对象`
  if(applicationCode === 'COMPLAINT'){
    text = '投诉内容'
  }
  return text
}
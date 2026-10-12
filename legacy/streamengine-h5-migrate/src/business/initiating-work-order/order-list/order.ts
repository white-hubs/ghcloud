export const BusinessType=new Map([
  ['FAULT','故障报修'],
  ['HIDDENDANGER','隐患排查'],
  ['OUTSOURCE_REPAIR','委外维修'],
  ['RETROFIT','更新改造'],
])
export const BusinessApi=new Map([
  ['FAULT_PERSONAL','/maintain/fault/apply/personal'],
  ['HIDDENDANGER_PERSONAL','/maintain/hidden/apply/personal'],
  ['FAULT','/maintain/fault/apply/all'],
  ['HIDDENDANGER','/maintain/hidden/apply/all'],
  ['OUTSOURCE_REPAIR','/maintain/outsource/apply/personal'],
  ['RETROFIT','/maintain/retrofit-order/page'],
])
export const assetStatus: { label: string; value: string; }[] = [
  { label: '闲置', value: 'LEAVE_UNUSED' },
  { label: '在用', value: 'MAKE_USE_OF' },
  { label: '报废', value: 'WEED_OUT' },
  { label: '报修', value: 'REPAIR_REPORT' }
]


export const CheckStatusList = [
  { label: '未盘', value: 'INCOMPLETE' },
  { label: '已盘', value: 'COMPLETED' },
  { label: '盘赢', value: 'WIN' },
  { label: '盘亏', value: 'LOSS' },
  { label: '异常', value: 'ABNORMAL' },
]
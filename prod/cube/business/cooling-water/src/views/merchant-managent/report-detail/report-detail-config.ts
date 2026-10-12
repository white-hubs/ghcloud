const month = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
const monthClounms = month.map((item, index) => {
  return {
    title: `${index + 1}月`,
    dataIndex: item,
    key: item
  }
})
export const columnsForYear = [
  {
    title: '档主编号',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '档主姓名',
    dataIndex: 'shiftMaster',
    key: 'shiftMaster',
  },
  {
    title: '档位号',
    dataIndex: 'gearPositionCode',
    key: 'gearPositionCode',
  },
  {
    title: '位置',
    dataIndex: 'gearPositionArea',
    key: 'gearPositionArea',
  },
  {
    title: '管理部门',
    dataIndex: 'departmentName',
    key: 'departmentName',
  },
  {
    title: '钛泡编号',
    dataIndex: 'deviceCode',
    key: 'deviceCode',
  },
  {
    title: '冷媒单位流量（m³/h)',
    dataIndex: 'unitTraffic',
    key: 'unitTraffic',
  },
  ...monthClounms,
  {
    title: '总计',
    dataIndex: 'total',
    key: 'total',
  },
]
export const columnsForMonth = [
  {
    title: '统计月份',
    dataIndex: 'statisticalFlag',
    key: 'statisticalFlag',
  },
  {
    title: '统计周期',
    dataIndex: 'statisticalCycle',
    key: 'statisticalCycle',
  },
  {
    title: '档主编号',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '档主姓名',
    dataIndex: 'shiftMaster',
    key: 'shiftMaster',
  },
  {
    title: '档主联系电话',
    dataIndex: 'shiftMasterPhone',
    key: 'shiftMasterPhone',
  },
  {
    title: '钛泡编号',
    dataIndex: 'deviceCode',
    key: 'deviceCode',
  },
  {
    title: '档位号',
    dataIndex: 'gearPositionCode',
    key: 'gearPositionCode',
  },
  {
    title: '管理部门',
    dataIndex: 'departmentName',
    key: 'departmentName',
  },
  {
    title: '所属区域',
    dataIndex: 'gearPositionArea',
    key: 'gearPositionArea',
  },
  {
    title: '冷媒单位流量（m³/h)',
    dataIndex: 'unitTraffic',
    key: 'unitTraffic',
  },
  {
    title: '使用时长（小时）',
    dataIndex: 'duration',
    key: 'duration',
  },
  {
    title: '冷媒流量（m³）',
    dataIndex: 'flow',
    key: 'flow',
  },
  {
    title: '单价（元/m³）',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
  },
  {
    title: '费用合计（元）',
    dataIndex: 'total',
    key: 'total',
  },
]
export const columnsForDay = [
  {
    title: '统计日期',
    dataIndex: 'statisticalFlag',
    key: 'statisticalFlag',
  },
  {
    title: '档主编号',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '档主姓名',
    dataIndex: 'shiftMaster',
    key: 'shiftMaster',
  },
  {
    title: '档位号',
    dataIndex: 'gearPositionCode',
    key: 'gearPositionCode',
  },

  {
    title: '钛泡编号',
    dataIndex: 'deviceCode',
    key: 'deviceCode',
  },

  {
    title: '管理部门',
    dataIndex: 'departmentName',
    key: 'departmentName',
  },
  {
    title: '所属区域',
    dataIndex: 'gearPositionArea',
    key: 'gearPositionArea',
  },
  {
    title: '冷媒单位流量（m³/h)',
    dataIndex: 'unitTraffic',
    key: 'unitTraffic',
  },
  {
    title: '使用时长（小时）',
    dataIndex: 'duration',
    key: 'duration',
  },
  {
    title: '冷媒流量（m³）',
    dataIndex: 'flow',
    key: 'flow',
  },
  {
    title: '单价（元/m³）',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
  },
  {
    title: '费用合计（元）',
    dataIndex: 'total',
    key: 'total',
  },
]

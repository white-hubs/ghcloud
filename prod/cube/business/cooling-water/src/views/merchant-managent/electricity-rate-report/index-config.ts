export const columnsElectricity = [
  {
    title: '序号',
    dataIndex: '',
    customRender: ({ index }: { index: number; }): number => {
      return index + 1
    },
    align: 'center',
    width: 80,
  },
  {
    title: '档主编号',
    dataIndex: 'code',
    width: 100,
    key: 'code',
  },
  {
    title: '档主姓名',
    dataIndex: 'shiftMaster',
    key: 'shiftMaster',
    width: 100,
  },
  {
    title: '档位号',
    dataIndex: 'gearPositionCode',
    key: 'gearPositionCode',
    width: 100,
  },
  {
    title: '管理部门',
    dataIndex: 'departmentName',
    key: 'departmentName',
    width: 100,
  },
  {
    title: '钛泡编号',
    dataIndex: 'deviceCode',
    key: 'deviceCode',
    ellipsis: true,
    width: 250,
  },
  {
    title: '冷媒单位流量（m³/h)',
    dataIndex: 'unitTraffic',
    key: 'unitTraffic',
    ellipsis: true,
    width: 180,
  },
  {
    title: '使用时长（小时）',
    dataIndex: 'duration',
    key: 'duration',
    ellipsis: true,
    width: 150,
  },
  {
    title: '冷媒流量（m³）',
    dataIndex: 'flow',
    key: 'flow',
    ellipsis: true,
    width: 140,
  },
  {
    title: '单价（元/m³）',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    ellipsis: true,
    width: 140,
  },
  {
    title: '费用合计（元）',
    dataIndex: 'total',
    ellipsis: true,
    key: 'total',
    width: 140,
  },
  {
    title: '环比金额',
    dataIndex: 'totalQOQ',
    key: 'total',
    ellipsis: true,
    width: 100,
  },
  {
    title: '环比流量',
    dataIndex: 'flowQOQ',
    ellipsis: true,
    key: 'flowQOQ',
    width: 100,
  },
  {
    title: '环比时长',
    dataIndex: 'durationQOQ',
    key: 'durationQOQ',
    ellipsis: true,
    width: 100,
  },
  {
    title: '环比金额比例(%)',
    dataIndex: 'totalQOQRatio',
    key: 'totalQOQRatio',
    ellipsis: true,
    width: 140,
    customRender: ({ text }: { text: string; }): string => {
      return `${text}%`
    }
  },
  {
    title: '环比流量比例(%)',
    dataIndex: 'flowQOQRatio',
    ellipsis: true,
    key: 'flowQOQRatio',
    width: 140,
    customRender: ({ text }: { text: string; }): string => {
      return `${text}%`
    }
  },
  {
    title: '环比时长比例(%)',
    dataIndex: 'durationQOQRatio',
    ellipsis: true,
    key: 'durationQOQRatio',
    width: 140,
    customRender: ({ text }: { text: string; }): string => {
      return `${text}%`
    }
  },
  {
    title: '同比金额',
    dataIndex: 'totalYOY',
    key: 'totalYOY',
    ellipsis: true,
    width: 100,
  },
  {
    title: '同比流量',
    dataIndex: 'flowYOY',
    key: 'flowYOY',
    ellipsis: true,
    width: 100,
  },
  {
    title: '同比时长',
    dataIndex: 'durationYOY',
    ellipsis: true,
    key: 'durationYOY',
  },
  {
    title: '同比金额比例(%)',
    dataIndex: 'totalYOYRatio',
    ellipsis: true,
    key: 'totalYOYRatio',
    width: 140,
    customRender: ({ text }: { text: string; }): string => {
      return `${text}%`
    }
  },
  {
    title: '同比流量比例(%)',
    dataIndex: 'flowYOYRatio',
    ellipsis: true,
    key: 'flowYOYRatio',
    width: 140,
    customRender: ({ text }: { text: string; }): string => {
      return `${text}%`
    }
  },
  {
    title: '同比时长比例(%)',
    ellipsis: true,
    dataIndex: 'durationYOYRatio',
    key: 'durationYOYRatio',
    width: 140,
    customRender: ({ text }: { text: string; }): string => {
      return `${text}%`
    }
  },
]

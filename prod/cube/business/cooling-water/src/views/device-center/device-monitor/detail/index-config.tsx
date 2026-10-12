import { Image } from '@ghcloud/cube-ui'
export const basicInfoState = [
  {
    label: '设备名称',
    field: 'deviceName',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '设备类型',
    field: 'genreName',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '设备状态',
    field: 'status',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '所属区域',
    field: 'areaName',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },

  {
    label: '钛泡编号',
    field: 'code',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '冷媒单位流量',
    field: 'unitTraffic',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '设备照片',
    field: 'images',
    span: 8,
    render: (val: unknown): JSX.Element | string => {
      const value = val as { path: string; }[]
      if (!value) return '--'
      return (
        <>
          {value.map(item => {
            return <Image src={item.path} width={100} key={item.path} />
          })}
        </>
      )
    }
  },
]
export const deviceRuningState = [
  {
    label: '控制终端开关机',
    field: 'controlBox',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '水流状态',
    field: 'waterFlow',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '制冷电磁阀',
    field: 'reFrigeration',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '报警器',
    field: 'alarm',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '今日制冷运行时长',
    field: 'dayTime',
    span: 8,
    render: (val: string): string => {
      return val ? val + ' h' : '--'
    }
  },
  {
    label: '本月制冷运行时长',
    field: 'monthTime',
    span: 8,
    render: (val: string): string => {
      return val ? val + ' h' : '--'
    }
  }
]

import moment from 'moment'
import { Image, ImagePreviewGroup, Button } from '@ghcloud/cube-ui'
const handleClick = (record: Record<string, unknown>): void => {
  history.pushState({ current: location.pathname + location.search }, '', `/portal/cooling-water/device-monitor/${record.alarmTargetKey}`)
}
export const alarmInfoConfig = [
  {
    label: '报警时间',
    field: 'alarmTime',
    span: 8,
    render: (val: number): string => {
      return val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '报警设备',
    field: 'alarmTargetName',
    span: 8,
    render: (val: string, record: Record<string, unknown>): JSX.Element => {
      return <Button type='link' onClick={() => {
        handleClick(record)
      }}>{val}</Button>
    }
  },
  {
    label: '报警级别',
    field: 'alarmLevelName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '报警规则',
    field: 'alarmEventName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '报警区域',
    field: 'areaName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '处理时限',
    field: 'timeoutProcessTimesName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '处理人',
    field: 'alarmHandlerName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '报警通知人',
    field: 'alarmNotifyUsername',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '超时状态',
    field: 'alarmHandlerTimeoutStatusName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '处理状态',
    field: 'alarmStatusName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  }
]
export const alarmHandleConfig = [
  {
    label: '处理结果',
    field: 'alarmHandlerResultName',
    span: 8,
    render: (val: string): string => {
      return val
    }
  },
  {
    label: '处理说明',
    field: 'alarmHandlerResultRemark',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '现场图片',
    field: 'fileVOS',
    span: 8,
    render: (val: { path: string; }[]): JSX.Element | string => {
      const value = val as { path: string; }[]
      if (!value) return '--'
      if (!value.length) return '--'
      return (
        <>
          <ImagePreviewGroup>
            {value.map(item => {
              return <Image src={item.path} width={100} key={item.path} />
            })}
          </ImagePreviewGroup>
        </>
      )
    }
  },
  {
    label: '处理时间',
    field: 'createTime',
    span: 8,
    render: (val: number): string => {
      return val ? moment(val as number).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '处理人员',
    field: 'createUserName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
]
export const alarmPendingConfig = [
  {
    label: '预计处理时间',
    field: 'estimatedProcessTime',
    span: 8,
    render: (val: number): string => {
      return val ? moment(val as number).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '挂起原因',
    field: 'remark',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
  {
    label: '现场图片',
    field: 'fileVOS',
    span: 8,
    render: (val: { path: string; }[]): JSX.Element | string => {
      const value = val as { path: string; }[]
      if (!value) return '--'
      if (!value.length) return '--'
      return (
        <>
          <ImagePreviewGroup>
            {value.map(item => {
              return <Image src={item.path} width={100} key={item.path} />
            })}
          </ImagePreviewGroup>
        </>
      )
    }
  },
  {
    label: '挂起时间',
    field: 'createTime',
    span: 8,
    render: (val: number): string => {
      return val ? moment(val as number).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '操作挂起人员',
    field: 'createUserName',
    span: 8,
    render: (val: string): string => {
      return val ?? '--'
    }
  },
]

import moment from 'moment'
import { Image, ImagePreviewGroup } from '@ghcloud/cube-ui'
const formateTime = (time: number): string => {
  const h = parseInt(String(time / 3600))
  const minute = parseInt(String(time / 60 % 60))
  const second = Math.ceil(time % 60)

  const hours = h < 10 ? '0' + h : h
  const formatSecond = second > 59 ? 59 : second
  return `${h > 0 ? `${hours}时` : ''}${minute < 10 ? '0' + minute : minute}分${formatSecond < 10 ? '0' + formatSecond : formatSecond}秒`
}
export const alarmInfoConfig = [
  {
    label: '报警事件',
    field: 'alarmEventName',
    span: 8,
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
  {
    label: '报警市场',
    field: 'marketName',
    span: 8,
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
  {
    label: '报警时间',
    field: 'alarmTime',
    span: 8,
    render: (val: string): string => {
      return val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '报警级别',
    field: 'alarmLevelName',
    span: 8,
    render: (val: string): string=> {
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
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
  {
    label: '报警通知人',
    field: 'alarmNotifyUsername',
    span: 8,
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
  {
    label: '超时状态',
    field: 'alarmHandlerTimeoutStatusName',
    span: 8,
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
  {
    label: '处理状态',
    field: 'alarmStatusName',
    span: 8,
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
  {
    label: '详细位置',
    span: 8,
    field: 'alarmTargetAddress',
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
  {
    label: '任务耗时',
    span: 8,
    field: 'processingTime',
    render: (val: unknown): string=> {
      return val ? formateTime(val as number) : '--'
    }
  },
]
export const marketAlarmInfoConfig = [
  {
    label: '报警事件',
    field: 'alarmEventName',
    span: 8,
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
  {
    label: '报警市场',
    field: 'marketName',
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
    label: '报警级别',
    field: 'alarmLevelName',
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
    label: '报警时间',
    field: 'alarmTime',
    span: 8,
    render: (val: string): string => {
      return val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '处理人',
    field: 'alarmHandlerName',
    span: 8,
    render: (val: string): string=> {
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
  },
  {
    label: '超时状态',
    field: 'alarmHandlerTimeoutStatusName',
    span: 8,
    render: (val: string): string=> {
      return val ?? '--'
    }
  },
]
export const alarmHandleConfig = [
  {
    label: '处理结果',
    field: 'alarmHandlerResultName',
    span: 8,
    render: (val: unknown): unknown=> {
      return val
    }
  },
  {
    label: '处理说明',
    field: 'alarmHandlerResultRemark',
    span: 8,
    render: (val: unknown): string | unknown=> {
      return val ?? '--'
    }
  },
  {
    label: '现场图片',
    field: 'fileVOS',
    span: 8,
    render: (val: unknown): string | unknown=> {
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
    render: (val: unknown): string | unknown=> {
      return val ? moment(val as number).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '处理人员',
    field: 'createUserName',
    span: 8,
    render: (val: unknown): string | unknown => {
      return val ?? '--'
    }
  },
]
export const alarmPendingConfig = [
  {
    label: '预计处理时间',
    field: 'estimatedProcessTime',
    span: 8,
    render: (val: unknown): string | unknown=> {
      return val ? moment(val as number).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '挂起原因',
    field: 'remark',
    span: 8,
    render: (val: unknown): string | unknown=> {
      return val ?? '--'
    }
  },
  {
    label: '现场图片',
    field: 'fileVOS',
    span: 8,
    render: (val: unknown): JSX.Element | string=> {
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
    render: (val: unknown): string | unknown=> {
      return val ? moment(val as number).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
  },
  {
    label: '操作挂起人员',
    field: 'createUserName',
    span: 8,
    render: (val: unknown): string | unknown => {
      return val ?? '--'
    }
  },
]

import type { ReactNode } from 'react'
import { Descriptions, Empty, Tag } from 'antd'
import type { TargetModifyParams } from '../select-notice/select-notice.model'

export const EMPTY_TEXT = '-'

interface ReadonlyItem {
  label: string;
  value: ReactNode;
  span?: number;
}

interface OptionItem {
  label: ReactNode;
  value: string | number | boolean | null;
}

export function getOptionLabel(options: OptionItem[], value: string | number | boolean | null | undefined): ReactNode {
  return options.find((item) => item.value === value)?.label ?? value ?? EMPTY_TEXT
}

export function getOptionLabels(options: OptionItem[], values: Array<string | number | boolean> | undefined): ReactNode[] {
  if (!values?.length) {
    return []
  }
  return values.map((value) => getOptionLabel(options, value))
}

export function displayValue(value: ReactNode): ReactNode {
  if (value === undefined || value === null || value === '') {
    return EMPTY_TEXT
  }
  return value
}

export function ReadonlyDescriptions(props: { items: ReadonlyItem[]; column?: number }): JSX.Element {
  return (
    <Descriptions className='alarm-detail-descriptions' size='small' column={props.column ?? 4} colon>
      {props.items.map((item) => (
        <Descriptions.Item key={item.label} label={item.label} {...(item.span ? { span: item.span } : {})}>
          {displayValue(item.value)}
        </Descriptions.Item>
      ))}
    </Descriptions>
  )
}

export function BooleanTag(props: { value?: boolean; trueText?: string; falseText?: string }): JSX.Element {
  const checked = !!props.value
  return <Tag color={checked ? 'success' : 'default'}>{checked ? (props.trueText ?? '是') : (props.falseText ?? '否')}</Tag>
}

export function ReadonlyTags(props: { values?: ReactNode[] }): JSX.Element {
  const values = props.values?.filter((value) => value !== undefined && value !== null && value !== '')
  if (!values?.length) {
    return <>{EMPTY_TEXT}</>
  }
  return (
    <span className='alarm-detail-tags'>
      {values.map((value, index) => (
        <Tag key={`${String(value)}-${index}`}>{value}</Tag>
      ))}
    </span>
  )
}

export function ReadonlyEmpty(props: { description: string }): JSX.Element {
  return <Empty className='alarm-detail-empty' description={props.description} image={Empty.PRESENTED_IMAGE_SIMPLE} />
}

export function getNoticeTargetLabel(type: TargetModifyParams['messageTargetNotify']): string {
  if (type === 'DEPARTMENT') {
    return '部门'
  }
  if (type === 'ROLE') {
    return '角色'
  }
  return '用户'
}

export function getNoticeTargetNames(item: TargetModifyParams): string[] {
  return item.targetConfig
    .map((target) => {
      if (item.messageTargetNotify === 'DEPARTMENT') {
        return target.departmentName
      }
      if (item.messageTargetNotify === 'ROLE') {
        return target.roleName
      }
      return target.userName
    })
    .filter((name): name is string => !!name)
}

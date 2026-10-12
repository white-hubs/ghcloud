import { cubeTodoTaskStatService } from '@/api/server'
import { Select } from 'antd'
import { useEffect, useState } from 'react'

interface Props {
  value: string | undefined;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

/** 待办任务类型下拉选择 */
export const TodoTaskTypeSelect = (props: Props): JSX.Element => {
  const [options, setOptions] = useState<{ label: string; value: string; }[]>([])
  useEffect(() => {
    cubeTodoTaskStatService.getTodoTaskType().then((res) => {
      const data = res.map(e => {
        return {
          label: e.name,
          value: e.code
        }
      })
      setOptions(data)
    })
  }, [])

  return (
    <Select
      value={props.value}
      placeholder='请选择'
      onChange={props.onChange}
      options={options}
      style={props.style}
      allowClear
    />
  )
}

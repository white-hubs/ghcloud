import { Input, Select, Textarea } from '@ghcloud/cube-ui'

export const basicInfoConfig = [
  {
    label: '规则名称:',
    value: 'name',
    component: (formState: Record<string, unknown>, value: string): JSX.Element => {
      return <Input placeholder='请输入规则名称' showCount={false} v-model:value={formState[value]} style={{ maxWidth: '300px' }} />
    }
  },
  {
    label: '报警级别:',
    value: 'alarmLevelId',
    component: (formState: Record<string, unknown>, value: string): JSX.Element => {
      return <Select placeholder='请选择报警级别' options={formState.levelsOption} fieldNames={{ value: 'id', label: 'name' }} v-model:value={formState[value]} style={{ maxWidth: '300px' }} allowClear />
    }
  },
  {
    label: '去重周期:',
    value: 'repeatTime',
    component: (formState: Record<string, unknown>, value: string): JSX.Element => {
      const inputSlots = {
        addonAfter: (): string => {
          return '分钟'
        }
      }
      return <Input placeholder='请输入去重周期' v-slots={inputSlots} showCount={false} v-model:value={formState[value]} style={{ maxWidth: '300px' }} />
    }
  },
  {
    label: '处理时限:',
    value: 'estimatedHandlerTime',
    component: (formState: Record<string, unknown>, value: string): JSX.Element => {
      const timeUnit = [
        {
          label: '分钟',
          value: 'MINUTE',
        },
        {
          label: '小时',
          value: 'HOUR',
        },
      ]
      const inputSlots = {
        addonAfter: (): JSX.Element => {
          return <Select options={timeUnit} v-model:value={formState.estimatedHandlerUnit} style={{ width: '90px' }} />
        }
      }
      return <Input placeholder='请输入处理时限' showCount={false} v-slots={inputSlots} v-model:value={formState[value]} style={{ maxWidth: '300px' }} />
    }
  },
  {
    label: '说明:',
    value: 'remark',
    component: (formState: Record<string, unknown>, value: string): JSX.Element => {
      return <Textarea placeholder='请输入备注信息,最多200字' maxlength={200} v-model:value={formState[value]} style={{ maxWidth: '300px' }} />
    }
  },
]

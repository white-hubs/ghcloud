import { InputNumber, Select } from '@ghcloud/cube-ui'
import { defineComponent, ref, type VNode } from 'vue'

interface Props {
  title: string;
  value: {
    upperLimitCycle: string | undefined;
    upperLimitDuration: string | undefined;
  };
}

/** 加班规则 其他配置 */
export const OvertimeConfigOther = defineComponent({
  props: ['title', 'value'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const value = ref({
      upperLimitCycle: props.value.upperLimitCycle ?? undefined,
      upperLimitDuration: props.value.upperLimitDuration ?? null,
    })

    const emitValue = (): void => {
      emit('update:value', value.value)
    }

    return (): VNode =>
      <div>
        <div style='font-weight:600;font-size:14px;padding-left:50px;margin-bottom:20px'>{props.title}</div>
        <div style='margin-left:30px'>
          <div style='display:flex;white-space:nowrap;align-items:center;margin-left:50px'>
            加班限制
            <Select
              style='margin:0 15px'
              options={[
                { label: '每天', value: 'EVERY_DAY' },
                { label: '每周', value: 'EVERY_WEEK' },
                { label: '每月', value: 'EVERY_MONTH' },
              ]}
              v-model:value={value.value.upperLimitCycle}
              getPopupContainer={() => document.querySelector('.attendance-layout-content')}
              onChange={emitValue}
            />
            加班累计时长超过
            <InputNumber style='margin:0 10px' min={0} max={999} placeholder='请输入' v-model:value={value.value.upperLimitDuration} onChange={emitValue} />
            小时，不能再发起加班审批
          </div>
        </div>
      </div>
  }
})

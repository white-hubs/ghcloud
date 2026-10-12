import { InputNumber } from '@ghcloud/cube-ui'
import { defineComponent, type VNode } from 'vue'
import style from './leave-time-translate.module.less'

interface Props {
  unit: 'HOUR' | 'HALF_DAY' | 'DAY';
}

/** 请假规则-时间折算组件 */
export const LeaveTimeTranslate = defineComponent({
  props: ['unit'],
  setup: (props: Props) => {
    return (): VNode =>
      <>
        {
          props.unit !== 'DAY' &&
            <div class={style['leave-time-translate']}>
              <span>半天折算时长</span>
              <div style='width:120px;margin:0 10px'>
                <InputNumber min={1} />
              </div>
              <span>小时=上午</span>
            </div>
        }
        {
          props.unit !== 'DAY' &&
            <div class={style['leave-time-translate']}>
              <span>半天折算时长</span>
              <div style='width:120px;margin:0 10px'>
                <InputNumber min={1} />
              </div>
              <span>小时=上午</span>
            </div>
        }
        {
          props.unit !== 'HALF_DAY' &&
            <div class={style['leave-time-translate']}>
              <span>一天折算时长</span>
              <div style='width:120px;margin:0 10px'>
                <InputNumber min={1} />
              </div>
              <span>小时=1天</span>
            </div>
        }

      </>
  }
})

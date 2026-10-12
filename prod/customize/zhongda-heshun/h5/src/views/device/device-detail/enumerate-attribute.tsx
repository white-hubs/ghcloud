import { defineComponent, inject, reactive, watch, type PropType } from 'vue'
import { RadioGroup, Radio, showNotify, Button } from 'vant'
import styles from './enumerate.module.less'

import { cubeDeviceCenterService } from '@/api/server'
interface AttributeItemType {
  dataConstraint: { value: string; label: string; }[];
  propCode: string;
}
export default defineComponent({
  props: {
    curValue: {
      type: String,
    },
    attributeItem: {
      type: Object as PropType<AttributeItemType>,
      default: () => {
        return {}
      },
    },
    deviceId: {
      type: String,
      default: null,
    },
  },
  setup (props) {
    const isAdmin: boolean | undefined = inject('isAdmin')
    const valueState = reactive<{ value: string ;timer: NodeJS.Timeout | null; }>({
      value: props.curValue ?? '',
      timer: null
    })
    const changeValue = (value:string): void => {
      if (!isAdmin) return
      valueState.value = value
      if (valueState.timer) clearTimeout(valueState.timer)
      valueState.timer = setTimeout(() => {
        const params = {
          deviceId: props.deviceId,
          propWriteValues: [
            {
              code: props.attributeItem.propCode,
              expectedValue: valueState.value
            }
          ]
        }
        cubeDeviceCenterService.controlWithPermission(params).then(() => {
          showNotify({ type: 'success', message: '下发指令成功' })
        })
      }, 0)
    }
    watch(
      () => props.curValue,
      () => {
        valueState.value = props.curValue ?? ''
      },
    )
    return () =>
    //   <div  class={[styles.item_option, option.active? styles.actives : '']} onClick={()=>itemActive(index,optionIndex)}>
    //   {option.label}
    // </div>
    <div class={styles.item_container}>
        {props.attributeItem?.dataConstraint?.map((item: { value: string; label: string; }, index: number) =>
          <div  class={[styles.item_option, valueState.value === item.value ? styles.actives : '']} onClick={()=>changeValue(item.value)}>
          {item.label}
        </div>
        )}
</div>
      // <RadioGroup v-model={valueState.value} onChange={changeValue} direction='horizontal'>
      //   {props.attributeItem?.dataConstraint?.map((item: { value: string; label: string; }, index: number) =>
      //     <Radio key={index} name={item.value} v-slots={{ icon: () =>

      //       //  <Button size='small' type={valueState.value === item.value ? 'primary' : 'default'}>{item.label}</Button>
      //     <div  class={['item_option', valueState.value === item.value? 'actives' : '']} >
      //         {item.label}
      //       </div>
      //       }} />
      //   )}
      // </RadioGroup>
  },
})

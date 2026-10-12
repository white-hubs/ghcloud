import { cubeDeviceCenterService } from '@/api/api/service'
import { Button, Radio, RadioGroup, showNotify } from 'vant'
import { defineComponent, reactive, watch, type PropType } from 'vue'
interface AttributeItemType {
  dataConstraint: { value: string; label: string; }[];
  propCode: string;
}
export default defineComponent({
  props: {
    curValue: {
      type: Number
    },
    attributeItem: {
      type: Object as PropType<AttributeItemType>,
      default: () => {
        return {}
      }
    },
    deviceId: {
      type: String,
      default: null
    }
  },

  setup (props) {
    const valueState = reactive<{ value: string | number | null ;timer: NodeJS.Timeout | null; }>({
      value: props.curValue ? Number(props.curValue) : null,
      timer: null
    })
    const changeValue = (): void => {
      if (valueState.timer)clearTimeout(valueState.timer)
      valueState.timer = setTimeout(() => {
        const params = {
          deviceId: props.deviceId,
          propWriteValues: [
            {
              code: props.attributeItem.propCode,
              expectedValue: valueState.value as string
            }
          ]
        }
        cubeDeviceCenterService.controlWithPermission(params).then(() => {
          showNotify({ type: 'success', message: '下发指令成功' })
        }).catch(() => {
          showNotify({ type: 'danger', message: '下发指令失败' })
        })
      }, 0)
    }
    watch(() => props.curValue, () => {
      valueState.value = props.curValue ?? null
    })
    return () =>
      <RadioGroup v-model={valueState.value} onChange={changeValue} direction='horizontal'>
        {props.attributeItem?.dataConstraint?.map((item: { value: string; label: string; }, index: number) =>
          <Radio key={index} name={item.value} v-slots={{ icon: () => <Button size='small' type={valueState.value === item.value ? 'primary' : 'default'}>{item.label}</Button> }} />
        )}
      </RadioGroup>
  }
})

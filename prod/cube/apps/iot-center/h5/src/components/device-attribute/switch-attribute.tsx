import { cubeDeviceCenterService } from '../../api/server'
import { Button, Radio, RadioGroup, showNotify } from 'vant'
import { defineComponent, reactive, watch } from 'vue'
export default defineComponent({
  props: {
    curValue: {
      type: Number
    },
    attributeItem: {
      type: Object,
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
    const valueState = reactive<{ value: string | number | boolean | null ;timer: NodeJS.Timeout | null; }>({
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
              code: props.attributeItem.attributeCode,
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
    return (): JSX.Element =>
      <RadioGroup style={{ marginLeft: '6px', height: '38px', lineHeight: '38px' }} v-model={valueState.value} onChange={changeValue} direction='horizontal'>
        {props.attributeItem?.attributeKeyValueVos?.map((item: { value: string; label: string; }, index: string | number | symbol) =>
          <Radio key={index} name={item.value} v-slots={{ icon: () => <Button size='small' type={valueState.value === item.value ? 'primary' : 'default'}>{item.label}</Button> }} />)}
      </RadioGroup>
  }
})

import { defineComponent, reactive, watch } from 'vue'
import { RadioGroup, Radio, showNotify, Button } from 'vant'
import { cubeDeviceCenterService } from '../../api/server'

export default defineComponent({
  props: {
    curValue: {
      type: String,
    },
    attributeItem: {
      type: Object,
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
    const valueState = reactive<{ value: string ;timer: NodeJS.Timeout | null; }>({
      value: props.curValue ?? '',
      timer: null
    })
    const changeValue = (): void => {
      if (valueState.timer) clearTimeout(valueState.timer)
      valueState.timer = setTimeout(() => {
        const params = {
          deviceId: props.deviceId,
          propWriteValues: [
            {
              code: props.attributeItem.attributeCode,
              expectedValue: valueState.value
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
    watch(
      () => props.curValue,
      () => {
        valueState.value = props.curValue ?? ''
      },
    )
    return (): JSX.Element =>
      <RadioGroup style={{ marginLeft: '6px' }} v-model={valueState.value} onChange={changeValue} direction='horizontal'>
        {props.attributeItem?.attributeKeyValueVos?.map((item: { value: string; label: string; }, index: string | number | symbol) =>
          <Radio key={index} name={item.value} v-slots={{ icon: () => <Button size='small' type={valueState.value === item.value ? 'primary' : 'default'}>{item.label}</Button> }} />)}
      </RadioGroup>
  },
})

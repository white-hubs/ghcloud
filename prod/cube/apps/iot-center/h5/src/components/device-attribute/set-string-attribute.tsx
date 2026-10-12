import { defineComponent, reactive, watch } from 'vue'
import { Field, showNotify } from 'vant'
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
      }
    },
    deviceId: {
      type: String,
      default: null
    }
  },

  setup (props) {
    const valueState = reactive<{ value: string ;timer: NodeJS.Timeout | null; }>({
      value: props.curValue ?? '',
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
    watch(() => props.curValue, () => {
      valueState.value = props.curValue ?? ''
    })
    return (): JSX.Element=>
      <Field
        style={{ paddingLeft: '13px' }}
        label={props.attributeItem.attributeName}
        v-model={valueState.value}
        onBlur={changeValue}
        placeholder='请输入'
      />
  }
})

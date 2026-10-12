import { defineComponent, inject, reactive, watch } from 'vue'
import './device-attribute.less'
import { Field, showNotify } from 'vant'
import { cubeDeviceCenterService } from '@/api/server'
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
    const isAdmin: boolean | undefined = inject('isAdmin')
    const valueState = reactive<{ value: string ;timer: NodeJS.Timeout | null; }>({
      value: props.curValue ?? '',
      timer: null
    })
    const changeValue = (): void => {
      if (!isAdmin) return
      if (valueState.timer)clearTimeout(valueState.timer)
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
    watch(() => props.curValue, () => {
      valueState.value = props.curValue ?? ''
    })
    return () =>
      <Field
        label={props.attributeItem.propName}
        v-model={valueState.value}
        onBlur={changeValue}
        placeholder='请输入'
      />
  }
})

import { defineComponent, ref, watch } from 'vue'

import { attributeWriteValue } from '@/apis/business/device'
import { RadioGroup, useMessage } from '@ghcloud/visual-view-ui'
export default defineComponent({
  props: {
    curValue: {
      type: [Boolean, String, Number]
    },
    attributeItem: {
      type: Object,
      default: () => {
        return {}
      }
    },
    deviceId: {
      type: [Number, String],
      default: null
    }
  },

  setup (props) {
    const keyName = ref()
    const state = ref()
    const message = useMessage()
    watch(() => props.curValue, () => {
      state.value.value = props.curValue
    })
    watch(() => keyName.value, (value) => {
      if (state.value.value === value) {
        return
      }
      clearTimeout(state.value.timer)
      state.value.timer = setTimeout(() => {
        const params = {
          deviceInstanceId: props.deviceId,
          keyValues: [
            {
              attributeCode: props.attributeItem.attributeCode,
              originalValue: {
                name: props.attributeItem.attributeName,
                value: props.curValue
              },
              expectedValue: {
                name: props.attributeItem.attributeName,
                value: value.target.value
              }
            }
          ]
        }
        attributeWriteValue(params).then(() => {
          message.success('下发指令成功')
        })
      }, 1000)
    })
    return () =>
      <div class='row flex-start'>
        <span class='label'>{props.attributeItem.attributeName}：</span>
        <RadioGroup button-style='solid' v-model:value={keyName.value} options={props.attributeItem.attributeKeyValueVos} />
      </div>
  }
})

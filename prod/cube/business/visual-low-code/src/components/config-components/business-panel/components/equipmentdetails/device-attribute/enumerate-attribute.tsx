import { defineComponent, watch, type PropType, ref } from 'vue'
import RadioGroup from '@ghcloud/visual-view-ui/src/components/radio-group/radio-group'
import { attributeWriteValue } from '@/apis/business/device'
import { useMessage } from '@ghcloud/visual-view-ui'
import styles from './styles/enumerate-attribute.module.less'
type CurValueType = boolean | string | number | null
export default defineComponent({
  props: {
    curValue: {
      type: Boolean as PropType<CurValueType>
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
    const state = ref()
    const message = useMessage()
    const keyName = ref()
    watch(() => props.curValue, () => {
      state.value.value = props.curValue
    })
    watch(() => keyName.value, (value) => {
      if (state.value.value === value) {
        return
      }
      clearTimeout(state.value.timer)
      setTimeout(() => {
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
      <div class={`${styles.row} ${styles['flex-start']}`}>
        <span class={styles.label}>{props.attributeItem.attributeName}：</span>
        <RadioGroup checked v-model:value={keyName.value} options={props.attributeItem.attributeKeyValueVos} />
      </div>
  }
})

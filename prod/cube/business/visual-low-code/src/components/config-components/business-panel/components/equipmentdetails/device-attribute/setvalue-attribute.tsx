import { defineComponent, reactive, watch, type PropType } from 'vue'
import { useMessage } from '@ghcloud/visual-view-ui'
import { attributeWriteValue } from '@/apis/business/device'
import InputNumber from '@ghcloud/visual-view-ui/src/components/input-number/input-number'
import styles from './styles/setvalue-attribute.module.less'
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
    const message = useMessage()
    const state: {
      value: string | number;
      timer?: any ;
    } = reactive({
      value: 0,
      timer: null
    })
    const changeValue = (value: string): void => {
      clearTimeout(state.timer)
      state.timer = setTimeout(() => {
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
                value
              }
            }
          ]
        }
        attributeWriteValue(params).then(() => {
          message.success('下发指令成功')
        })
      }, 500)
    }
    watch(() => props.curValue, () => {
      state.value = props.curValue as string
    })
    return () =>
      <div class={`${styles.row} ${styles['flex-start']}`}>
        <span class={styles.label}>{props.attributeItem.attributeName}：</span>
        <div class={styles['flex-start']}>
          <div class={styles['flex-start']} v-show={props.attributeItem.valueMin || props.attributeItem.valueMax} style={{ width: '250px', marginRight: '16px' }}>
            <div>
              <span style='color:#B7C5D3'>{Number(props.attributeItem.valueMin)}&nbsp;</span>
            </div>
            <div style='width: 200px'>
              {/* <a-slider v-model:value="value" :min="Number(attributeItem.valueMin)"
                        :max="Number(attributeItem.valueMax)" @change="changeValue" /> */}
            </div>
            <div>
              <span style='color:#B7C5D3'>&nbsp;{Number(props.attributeItem.valueMax)}</span>
            </div>
          </div>
          <div>
            {props.attributeItem.valueMin || props.attributeItem.valueMax
              ? <InputNumber
                  v-model:value={state.value} min={Number(props.attributeItem.valueMin)}
                  max={Number(props.attributeItem.valueMax)} style='width: 80px' onChange={changeValue}
                />
              : <InputNumber
                  v-model:value={state.value} min={0}
                  style='width: 80px' onChange={changeValue}
                />}

          </div>
        </div>
      </div>
  }
})

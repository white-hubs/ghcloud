import { defineComponent, reactive, watch, type VNode } from 'vue'
import { Slider, showNotify } from 'vant'
import { cubeDeviceCenterService } from '../../api/server'
import './device-attribute.less'
export default defineComponent({
  props: {
    curValue: {
      type: Number,
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
    const valueState = reactive<{ value: number | string ;timer: NodeJS.Timeout | null; }>({
      value: props.curValue ?? 0,
      timer: null
    })
    const changeValue = (value: string): void => {
      if (valueState.timer)clearTimeout(valueState.timer)
      valueState.timer = setTimeout(() => {
        const params = {
          deviceId: props.deviceId,
          propWriteValues: [
            {
              code: props.attributeItem.attributeCode,
              expectedValue: value
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
      valueState.value = props.curValue ?? 0
    })
    const sliderDom = (): VNode =>
      <div>
        <div>
          <label>{props.attributeItem.attributeName}：</label>
          <span>{valueState.value}{props.attributeItem.unitName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '30px' }}>
          <span>{props.attributeItem ? Number(props.attributeItem.valueMin) : '--'}&nbsp;</span>
          <span>&nbsp;{props.attributeItem ? Number(props.attributeItem.valueMax) : '--'}</span>
        </div>
        <div style={{ width: '85vw', height: '30px' }}>
          <Slider
            button-size='22px'
            v-model={valueState.value}
            min={Number(props.attributeItem.valueMin)}
            max={Number(props.attributeItem.valueMax)}
            onChange={changeValue}
          />
        </div>
      </div>
    return (): JSX.Element=>
      <div style={{ margin: '0px 14px', display: 'flex', justifyContent: 'space-between' }}>
        {Number(props.attributeItem.valueMin) !== Number(props.attributeItem.valueMax) ? sliderDom() : null}
      </div>
  }
})

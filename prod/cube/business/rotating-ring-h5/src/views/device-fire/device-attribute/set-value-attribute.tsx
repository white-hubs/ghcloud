import { computed, defineComponent, ref, watch, type VNode } from 'vue'
import { Slider, showNotify } from 'vant'
import { cubeDeviceCenterService } from '@/api/api/service'
import './device-attribute.less'
export default defineComponent({
  props: {
    curValue: {
      type: String,
      default: ''
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
    const timer = ref< NodeJS.Timeout | null>(null)
    const num = ref(props.curValue ? Number(props.curValue) : 0)
    const min = computed(() => {
      return props.attributeItem.dataConstraint ? Number(props.attributeItem.dataConstraint[0]) : 0
    })
    const max = computed(() => {
      return props.attributeItem.dataConstraint ? Number(props.attributeItem.dataConstraint[1]) : 0
    })
    const changeValue = (): void => {
      if (timer.value)clearTimeout(timer.value)
      timer.value = setTimeout(() => {
        const params = {
          deviceId: props.deviceId,
          propWriteValues: [
            {
              code: props.attributeItem.propCode,
              expectedValue: String(num.value)
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
      num.value = props.curValue ? Number(props.curValue) : 0
    }, { immediate: true, deep: true })
    const sliderDom = (): VNode =>
      <div>
        <div class='monitor-item'>
          <label>{props.attributeItem.propName}：</label>
          <span>{num.value}{props.attributeItem.unitName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '30px' }}>
          <span>{props.attributeItem ? min.value : '--'}&nbsp;</span>
          <span>&nbsp;{props.attributeItem ? max.value : '--'}</span>
        </div>
        <div style={{ width: '85vw', height: '30px' }}>
          <Slider
            button-size='22px'
            v-model={num.value}
            min={min.value}
            max={max.value}
            onChange={changeValue}
          />
        </div>
      </div>
    return () =>
      <div style={{ margin: '0px 14px', display: 'flex', justifyContent: 'space-between' }}>
        {Number(props.attributeItem.valueMin) !== Number(props.attributeItem.valueMax) ? sliderDom() : null}
      </div>
  }
})

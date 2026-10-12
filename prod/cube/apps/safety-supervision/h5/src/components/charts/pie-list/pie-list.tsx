import { defineComponent, type PropType } from 'vue'
import './pie-list.less'
interface PieData {
  label: string;
  color: string;
  value: number;
  ratio: string;
  id?: string;
}
export default defineComponent({
  name: 'PlanList',
  props: {
    pieClass: {
      type: String,
      default: ''
    },
    roundPieData: {
      type: Array as PropType<PieData[]>,
      default: []
    },
    unit: {
      type: String,
      default: ''
    }
  },
  emits: ['change'],
  setup: (props, { emit }) => {
    const emitAlarmType = (data: PieData): void => {
      emit('change', data.id)
    }
    return (): JSX.Element => {
      return (
        <>
          <div class={['policeList', props.pieClass]}>
            {
              props.roundPieData.map(item =>
                <div
                  class='thePolice'
                  key={item.color}
                  onClick={() => {
                    emitAlarmType(item)
                  }}
                >
                  <div title={item.label}>
                    <div class='thePoliceColor'>
                      <span style={{ background: item.color }} class='outside-thePoliceColor' />
                      <span style={{ background: item.color }} class='within-thePoliceColor' />
                    </div>
                    <span class='thePoliceLeft'>{item.label}</span>
                  </div>
                  <div>
                    <span>{item.ratio}%</span>
                    <span style='font-size: 12px;display: inline-block;margin-left: 5px;'>{props.unit}</span>
                  </div>
                </div>)
            }
          </div>
        </>
      )
    }
  }

})

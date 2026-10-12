import { defineComponent, type PropType } from 'vue'
import './pie-list.less'
interface PieData {
  label: string;
  color: string;
  value: number;
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
  setup: (props) => {
    return () => {
      return (
        <>
          <div class={['policeList', props.pieClass]}>
            {
              props.roundPieData.map(item =>
                <div
                  class='thePolice'
                  key={item.color}
                >
                  <div title={item.label}>
                    <div class='thePoliceColor'>
                      <span style={{ background: item.color }} class='outside-thePoliceColor' />
                      <span style={{ background: item.color }} class='within-thePoliceColor' />
                    </div>
                    <span class='thePoliceLeft'>{item.label}</span>
                  </div>
                  <div>
                    <span>{item.value}</span>
                  </div>
                </div>
              )
            }
          </div>
        </>
      )
    }
  }

})

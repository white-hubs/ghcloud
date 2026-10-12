import { defineComponent, ref } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import DateInlineForm from '@/components/common/business/date-inline-form'
import '@/components/config-components/business-panel/style/alarm-situation.less'
import PlanPie from '@/components/common/business/echarts/plan-pie.tsx'
import PieList from '@/components/common/business/pie-list'
interface Itemize {
  color: string;
  value: number;
  label: string;
  ratio: number;
  applicationCode: string;
}
export default defineComponent({
  name: 'AlarmSituation',
  props: ['style'],
  setup: (props) => {
    const alarmSituationStatistic = ref<{
      label: string;
      value: number;
      img: string;
      color: string;
      key: string;
      alarmHandleResult: string;
    }[]>([
      {
        label: '报警总数',
        value: 0,
        img: "/resource/v1/visual-low-code/images/exception/over-view1.png",
        color: '#D0DEEE',
        key: 'alarmNum',
        alarmHandleResult: '',
      },
      {
        label: '真实数',
        value: 0,
        img: "/resource/v1/visual-low-code/images/exception/over-view2.png",
        color: '#F14545',
        key: 'alarmActualNum',
        alarmHandleResult: 'ALARM_ACTUAL',
      },
      {
        label: '误报数',
        value: 0,
        img: "/resource/v1/visual-low-code/images/exception/over-view3.png",
        color: '#FFC700',
        key: 'alarmImpracticalNum',
        alarmHandleResult: 'ALARM_IMPRACTICAL',
      },
    ])
    const alarmSituationPieData = ref<Itemize[]>([
      {
        label: '111',
        value: 10,
        ratio: 20,
        color: '#FFAB10',
        applicationCode: ''
      }, {
        label: '222',
        value: 20,
        ratio: 20,
        color: '#2F8DFF',
        applicationCode: ''
      }, {
        label: '333',
        value: 30,
        ratio: 20,
        color: '#F14545',
        applicationCode: ''
      }, {
        label: '444',
        value: 40,
        ratio: 20,
        color: '#19F8F7',
        applicationCode: ''
      },
    ])
    const alarmTotal = ref<number>(0)

    return () => {
      return (

        <div style={{ ...props.style }}>
          <SubPanelTemplate title='报警态势' v-slots={{ extra: <DateInlineForm /> }}>
            <div class='statistic flex-between'>
              {
              alarmSituationStatistic.value.map((item, index) =>
                <div key={index} class='statistic-item flex-center'>
                  <div class='left'>
                    <img src={item.img} />
                  </div>
                  <div class='right'>
                    <div>{item.value}</div>
                    <div style='white-space: nowrap;'>{item.label}</div>
                  </div>
                </div>
              )
             }
            </div>
            <div class='flex-between'>
              <PlanPie pieData={alarmSituationPieData} class='alarm-total-pie' pie-class='alarm-total-pie-chart'>
                <div class='content'>
                  <div class='total-num'>{alarmTotal.value}</div>
                  <div>报警总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={alarmSituationPieData.value} class='alarm-total-list' />
            </div>
          </SubPanelTemplate>
        </div>

      )
    }
  }
})

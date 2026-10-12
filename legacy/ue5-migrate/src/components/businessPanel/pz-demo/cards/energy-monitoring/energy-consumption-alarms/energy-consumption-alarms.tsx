import { defineComponent, reactive, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import styles from './energy-consumption-alarms.module.less'
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

export const EnergyConsumptionAlarms = defineComponent({
  setup () {
    const alarmNum = ref<number>(132);
    // const chainRatio = ref<number>(10);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [10, 21, 18, 7, 11, 17, 8],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getEnergyAlarm();
      alarmNum.value = res.totalCount
      series[0].data = res.records.map(item=>item.alarmCount)
      xData.arr = res.records.map(item=>dayjs(item.recordTime).format('HH:mm'))
    }
    getData()
    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3'>
          <OperateDays value={alarmNum.value} title="报警总数">
            <div class={styles.ringRatio}>
              {/* <span>环比</span>
              <div class={`downtriangle ${chainRatio.value ? "uptriangle" : ""}`}></div>
              <div class={`${chainRatio.value ? 'up' : 'down'}`}>{ chainRatio.value + "%" }</div> */}
            </div>
          </OperateDays>
          <LineChart xData={xData.arr} series={series} title="次"></LineChart>
        </div>
      </SubPanelTemplate>
    )
  }
})
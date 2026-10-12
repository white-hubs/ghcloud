import { computed, defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import PieGuidance from "@/components/businessPanel/public/charts/pie/pie-guidance.vue"
import { PZService } from '../../../card-service/service'

export const DeviceStatusDistribution = defineComponent({
  setup () {
    const deviceTotal = ref(0);
    const deviceStatistic = ref([
      {
        alarmStatusName: "正常",
        color: '#2F8DFF',
        alarmNum: 0
      },
      {
        alarmStatusName: "故障",
        color: '#19F8F7',
        alarmNum: 0
      },
      {
        alarmStatusName: "离线",
        color: '#7786a3',
        alarmNum: 0
      },
      {
        alarmStatusName: "报警",
        color: '#FFAB10',
        alarmNum: 0
      },
    ]);

    const pieData = computed(()=>{
      return deviceStatistic.value.map(item => {
        return {
          name: item.alarmStatusName,
          value: item.alarmNum,
          itemStyle: { color: item.color }
        }
      })
    })
    PZService.laboratory.getDeviceStatusDistribution().then(res => {
      deviceTotal.value = res.deviceCount;
      deviceStatistic.value[0].alarmNum = res.normalCount;
      deviceStatistic.value[1].alarmNum = res.faultCount;
      deviceStatistic.value[2].alarmNum = res.offlineCount;
      deviceStatistic.value[3].alarmNum = res.alarmCount
    })

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-2'>
          <OperateDays title="设备总数" value={deviceTotal.value}></OperateDays>
          <GridContainer data={deviceStatistic.value}></GridContainer>
          <div>
            <PieGuidance yData={pieData.value} height="100%"></PieGuidance>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})
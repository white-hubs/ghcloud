import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import DeviceModule from "@/components/businessPanel/public/deviceModule.vue";
import { PZService } from '../../../card-service/service'

export const AlarmProcessingDurationStatistics = defineComponent({
  setup () {
    const avgProcessingTime = 45
    const maxProcessingTime = 120
    const dataList = ref([
      {
        title: "最大处理时长",
        value: maxProcessingTime,
        ringRatio: false,
        label: 90,
        unit: "小时",
      },
      {
        title: "平均处理时长",
        value: avgProcessingTime,
        ringRatio: false,
        label: avgProcessingTime,
        unit: "小时",
      },
    ]);
    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getAlarmProcessingDurationStatistics()
      dataList.value[0].value = result.maxDuration
      dataList.value[1].value = result.avgDuration
    }
    onMounted(()=>{
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-2' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
          <DeviceModule dataList={dataList.value} style={{ marginBottom: '20px' }} />
          <WaterPolo title="" value={dataList.value[1].value} unit="h" bgColor="rgba(59, 130, 246, 0.8)" color="rgba(59, 130, 246, 0.8)" style={{ marginTop: '10px' }} />
        </div>
      </SubPanelTemplate>
    )
  }
})
import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceModule from "@/components/businessPanel/public/deviceModule.vue";
import { PZService } from '../../../card-service/service'

export const DeviceUtilizationAnalysis = defineComponent({
  setup () {
    const dataList = ref([
      {
        label: "已使用",
        title: "设备总数",
        value: 0,
        ringRatio: false,
        unit: "台",
      },
      {
        title: "使用率",
        value: '0',
        ringRatio: false,
        label: 0,
        unit: "%",
      },
    ]);
    PZService.laboratory.getDeviceUtilizationAnalysis().then(res => {
      dataList.value[0].value = res.deviceCount
      dataList.value[1].value = res.usageRate + '%'
      dataList.value[1].label = res.increaseRate
    })
    return (): JSX.Element => (
      <SubPanelTemplate>
        <DeviceModule dataList={dataList.value}></DeviceModule>
      </SubPanelTemplate>
    )
  }
})
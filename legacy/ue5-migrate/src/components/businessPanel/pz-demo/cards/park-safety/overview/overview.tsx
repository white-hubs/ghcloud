import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceModule from "@/components/businessPanel/public/deviceModule.vue";
import { PZService } from '../../../card-service/service'
// todo: 接口暂时缺失数据
export const Overview = defineComponent({
  setup () {

    const dataList = ref([
      {
        label: "已使用",
        title: "事件总数",
        value: 320,
        ringRatio: false,
        unit: "个",
      },
      {
        title: "处理率",
        value: 100,
        ringRatio: true,
        label: 32,
        unit: "%",
      },
    ]);
    const getData = async (): Promise<void>=>{
      const result = await PZService.parkSafety.getSecurityEventOverview()
      dataList.value[0].value = result.count
      dataList.value[1].value = result.processingCount
    }
    onMounted(()=>{
      getData()
    })
    return (): JSX.Element => (
      <SubPanelTemplate>
        <DeviceModule dataList={dataList.value}></DeviceModule>
      </SubPanelTemplate>
    )
  }
})
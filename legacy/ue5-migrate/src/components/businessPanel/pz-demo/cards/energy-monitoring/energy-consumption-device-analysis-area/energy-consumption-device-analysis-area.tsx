import { defineComponent, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { PZService } from '../../../card-service/service'

export const EnergyConsumptionDeviceAnalysisArea = defineComponent({
  setup () {
    const countType = ref({
      timeType: "WATER", // 水
    })
    const columns = ref([
      {
        title: "一级区域",
        dataIndex: "area",
      },
      {
        title: "设备总量",
        dataIndex: "total",
      },
    ]);
    const data = ref([]);
    const getData = async (): Promise<void> => {
      // @ts-ignore
      const res = await PZService.energy.getDeviceAreaStatistics(countType.value.timeType);
      data.value = res.map((item) => ({
        area: item.areaName,
        total: item.deviceTotal,
      }));
    }
    // 监听 countType 的变化
    watch(() => countType.value.timeType, getData, { immediate: true });

    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={countType.value} timeList={[
            { label: "水", value: "WATER" },
            { label: "电", value: "ELECTRIC" },
            { label: "气", value: "GAS" }
          ]}></DateInlineForm>
        )
      }}>
        <div class='card-container-4' >
          <RollTable column={columns.value} data={data.value}> </RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})
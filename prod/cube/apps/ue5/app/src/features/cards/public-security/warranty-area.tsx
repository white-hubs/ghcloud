import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getFaultyEquipmentTop, getHazardStatistics } from "@/infrastructure/api/merchant";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./warranty-area.module.less";

export const WarrantyArea = defineComponent({
  name: "WarrantyArea",
  setup(_props, ctx) {
    const workOrderTime = ref<ModelValueItf>();
    const xData = ref<string[]>([]);
    const yData = ref<number[]>([]);
    const changeHandleworkOrderTime = async () => {
      const res = await getFaultyEquipmentTop({ period: workOrderTime.value.dateRange.join(",") });
      xData.value.length = 0;
      yData.value.length = 0;
      res.forEach((item) => {
        xData.value.push(item.name);
        yData.value.push(item.value);
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="报修工单统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={workOrderTime.value}
              onUpdate:modelValue={(v) => {
                workOrderTime.value = v;
              }}
              onSearch={changeHandleworkOrderTime}
            ></DateInlineForm>
          </template>
          <div class="charts">
            {" "}
            <barChart title={""} x-data={xData.value} data={[{ color: "#1890FF", name: "", data: yData }]} class="columnBox" />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default WarrantyArea;

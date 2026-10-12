import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { canteenConsumptionWindowStat } from "@/infrastructure/api/onecard";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import noData from "@/shared-ui/panel/noData";

import styles from "./proportion-consumption-amount.module.less";

export const ProportionConsumptionAmount = defineComponent({
  name: "ProportionConsumptionAmount",
  setup(_props, ctx) {
    const pieData = ref<any[]>([]);
    const getDataTotal = () => {
      return pieData.value.reduce((sum, item) => sum + item.value, 0);
    };

    const workOrderTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });

    const fetchData = async () => {
      try {
        const res = await canteenConsumptionWindowStat({
          period: workOrderTime.value.dateRange.join(","),
          type: workOrderTime.value.timeType,
        });
        if (Array.isArray(res)) {
          const total = res.reduce((sum: number, item: any) => sum + Number(item.amount || item.value || 0), 0);
          const colors = ["#306CCA", "#19F8F7", "#7885A0", "#F0C857", "#DE846C", "#FF6B6B", "#4ECDC4"];

          pieData.value = res.map((item: any, index: number) => {
            const value = Number(item.amount || item.value || 0);
            return {
              name: item.windowName || item.name || "",
              value: value,
              color: colors[index % colors.length],
              ratio: total ? ((value / total) * 100).toFixed(1) + "%" : "0%",
            };
          });
        }
      } catch (error) {}
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="场所消费金额占比">
          <template>
            {" "}
            <DateInlineForm
              modelValue={workOrderTime.value}
              onUpdate:modelValue={(v) => {
                workOrderTime.value = v;
              }}
              onSearch={fetchData}
            ></DateInlineForm>
          </template>
          {pieData.length > 0 && (
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie pieData={pieData.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> {getDataTotal()}</div>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 消费金额(元)</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList contentList={pieData.value} style="margin-left: 10px;"></elevatorAnalysisList>
            </div>
          )}
          <div class="elevator-analysis" style="min-height: 150px">
            {" "}
            <noData />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ProportionConsumptionAmount;

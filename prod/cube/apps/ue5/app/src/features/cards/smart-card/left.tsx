import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { eventNameStat, trendStat, useStatusStat } from "@/infrastructure/api/door";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import pieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const roundPieData = ref([
      {
        value: 10,
        label: "正常",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 10,
        label: "挂失",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);
    const deviceTotal = ref(0);
    const handleTime = ref<ModelValueItf>();
    const takeNotes = ref<ModelValueItf>();
    const areaAlarmRank = ref([]);
    const periodTime = reactive<{ xData: string[]; yData: number[] }>({
      xData: [],
      yData: [],
    });

    const getUseStatusStat = async () => {
      const res = await useStatusStat();
      roundPieData.value[0].value = res.normalNum;
      roundPieData.value[1].value = res.lossNum;
      deviceTotal.value = res.normalNum + res.lossNum;
    };
    const getPlayRecordTop = async () => {
      const res = await trendStat({ type: takeNotes.value.timeType, period: takeNotes.value.dateRange.join(",") });
      periodTime.xData = res.map((item) => {
        if (takeNotes.value.timeType === "TODAY") {
          return item.name + "时";
        } else {
          return item.name;
        }
      });
      periodTime.yData = res.map((item) => item.value);
    };
    const getPassengerFlowRegions = async () => {
      const res = await eventNameStat({ period: handleTime.value.dateRange.join(",") });
      areaAlarmRank.value = res;
    };
    onMounted(() => {
      getUseStatusStat();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="智能卡状态统计">
            <div class="equipmentAlarm">
              <PlanPie pieData={roundPieData.value}>
                <div class="content">
                  <div class="total-num"> {deviceTotal.value}</div>
                  <div> 智能卡总数</div>
                </div>
              </PlanPie>
              <pieList roundPieData={roundPieData.value}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="来访人员趋势图">
            <template>
              {" "}
              <DateInlineForm
                modelValue={takeNotes.value}
                onUpdate:modelValue={(v) => {
                  takeNotes.value = v;
                }}
                onSearch={getPlayRecordTop}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <LineChart
                x-data={periodTime.xData}
                series={[{ data: periodTime.yData }]}
                showLegend={true}
                showBackground={true}
                titles={[""]}
                gridTop="5"
                unit={{ x: "", y: "" }}
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="门禁事件Top10">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={getPassengerFlowRegions}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px">
              {areaAlarmRank.map((item, index) => (
                <EventAlarmItem sn={false} sort={index + 1} name={item.name} count={item.value} />
              ))}
            </div>
            <div class="body" style="min-height: 250px">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;

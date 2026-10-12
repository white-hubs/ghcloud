import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolLocationTop, patrolLocationTrend, patrolPersonLocationNew } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right_hk.module.less";

export const RightHk = defineComponent({
  name: "RightHk",
  setup(_props, ctx) {
    const columns = [
      {
        title: "时间",
        dataIndex: "datetime",
      },
      {
        title: "人员",
        dataIndex: "personName",
      },
      {
        title: "点位",
        dataIndex: "location",
      },
    ];
    const intercomTime = ref<ModelValueItf>();
    const trendTime = ref<ModelValueItf>();
    const intercomRank = ref([]);
    const xData = ref<string[]>(["1", "2", "3", "4"]);
    const yDataTrend = ref<number[]>([1, 2, 3, 4, 5, 6]);

    const personnelLocationData = ref([]);

    const getIntercomEvent = async () => {
      intercomRank.value = await patrolLocationTop({ period: intercomTime.value.dateRange.join(",") });
    };
    const getTrendEvent = async () => {
      const res = await patrolLocationTrend({ period: trendTime.value.dateRange.join(","), type: trendTime.value.timeType });
      xData.value = [];
      yDataTrend.value = [];
      res.forEach((item) => {
        xData.value.push(item.key);
        yDataTrend.value.push(item.value);
      });
    };
    const getPatrolPersonLocationNew = async () => {
      const res = await patrolPersonLocationNew({ type: "TODAY" });
      personnelLocationData.value = res.map((e) => {
        return {
          ...e,
          datetime: moment(e.datetime).format("YYYY-MM-DD 00:00:00"),
        };
      });
    };
    onMounted(() => {
      getPatrolPersonLocationNew();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="今日巡更人员最新位置">
            {" "}
            <div style="height: 200px;">
              {" "}
              <RollTable column={columns} data={personnelLocationData.value}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="巡更点位排行榜Top10">
            <template>
              {" "}
              <DateInlineForm
                modelValue={intercomTime.value}
                onUpdate:modelValue={(v) => {
                  intercomTime.value = v;
                }}
                onSearch={getIntercomEvent}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px">
              {intercomRank.map((item, index) => (
                <EventAlarmItem sn={false} sort={index + 1} name={item.key} count={item.value} />
              ))}
            </div>
            <div class="body" style="min-height: 250px">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="巡更点位趋势图">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trendTime.value}
                onUpdate:modelValue={(v) => {
                  trendTime.value = v;
                }}
                onSearch={getTrendEvent}
              ></DateInlineForm>
            </template>
            <div class="chart">
              <LineChart
                unit={{ x: "", y: "" }}
                gridTop={"5"}
                x-data={xData.value}
                series={[
                  {
                    data: yDataTrend,
                    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
                  },
                ]}
              />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default RightHk;

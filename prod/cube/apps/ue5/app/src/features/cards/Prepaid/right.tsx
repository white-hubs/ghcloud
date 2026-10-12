import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { waterMeterPage, waterUserDayStat } from "@/infrastructure/api/prepaid";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const through = ref();
    const deviceTotal = ref(0);
    const roundPieData = ref([
      {
        value: 0,
        label: "未失联",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 0,
        label: "已失联",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);
    const arrearsData = ref([
      {
        value: 0,
        label: "未欠费",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 0,
        label: "已欠费",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);
    const column = reactive([
      {
        title: "水表编号",
        dataIndex: "meterId",
        width: 120,
      },
      {
        title: "商品号",
        dataIndex: "roomId",
      },
      {
        title: "失联状态",
        dataIndex: "lostState",
      },
    ]);
    const listData = ref([]);
    const charsData = reactive({
      xData: [],
      yData: [],
    });

    const abnormalPassageInfo = async () => {
      const time = {
        TODAY: "day",
        THIS_WEEK: "week",
        THIS_MONTH: "month",
        THIS_YEAR: "year",
      };
      const res = await waterUserDayStat({ period: through.value.dateRange.join(","), type: time[through.value.timeType] });
      charsData.xData = [];
      charsData.yData = [];
      res.forEach((item) => {
        charsData.xData.push(moment(item.useDate).format(through.value.timeType !== "THIS_YEAR" ? "YYYY-MM-DD" : "YYYY-MM"));
        charsData.yData.push(item.pv);
      });
    };
    const getWaterMeterPage = async () => {
      const contact = await waterMeterPage({ unConnect: true, pageSize: 50, pageNumber: 1 });
      const noContact = await waterMeterPage({ unConnect: true, pageSize: 50, pageNumber: 1 });
      listData.value = contact.records.map((item) => {
        return {
          ...item,
          lostState: "已失联",
        };
      });
      roundPieData.value[1].value = contact.total;
      roundPieData.value[0].value = noContact.total;
    };
    const getArrearsOfFeesPage = async () => {
      const contact = await waterMeterPage({ oweMoney: true, pageSize: 1, pageNumber: 1 });
      const noContact = await waterMeterPage({ oweMoney: false, pageSize: 1, pageNumber: 1 });
      arrearsData.value[1].value = contact.total || 0;
      arrearsData.value[0].value = noContact.total || 0;
    };
    onMounted(() => {
      getWaterMeterPage();
      getArrearsOfFeesPage();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="水表日用能趋势图">
            <template>
              {" "}
              <DateInlineForm
                modelValue={through.value}
                onUpdate:modelValue={(v) => {
                  through.value = v;
                }}
                onSearch={abnormalPassageInfo}
              ></DateInlineForm>
            </template>
            {charsData.xData.length && (
              <div class="chart">
                <LineChart
                  x-data={charsData.xData}
                  series={[
                    {
                      data: charsData.yData,
                      linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                    },
                  ]}
                />
              </div>
            )}
            <div class="chart">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="失联水表实时统计">
            <div class="equipmentAlarm">
              <PlanPie pieData={roundPieData.value}>
                <div class="content">
                  <div class="total-num"> {roundPieData[1].value + roundPieData[0].value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <pieList roundPieData={roundPieData.value}></pieList>
            </div>
            <div class="footer">
              <div class="header"> 失联水表明细</div>
              <RollTable column={column} data={listData.value}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="欠费水表占比">
            <div class="equipmentAlarm">
              <PlanPie pieData={roundPieData.value}>
                <div class="content">
                  <div class="total-num"> {arrearsData[1].value + arrearsData[0].value}</div>
                  <div> 水表总数</div>
                </div>
              </PlanPie>
              <pieList roundPieData={roundPieData.value}></pieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;

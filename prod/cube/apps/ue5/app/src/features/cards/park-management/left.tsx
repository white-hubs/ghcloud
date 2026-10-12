import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmRate } from "@/infrastructure/api/models/alarm";
import { buildingUtilizationRate, statisticsEnterprises, utilizationRate } from "@/infrastructure/api/park";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import stackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import PieList from "@/shared-ui/panel/pieList";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    let alarmRateData = reactive<AlarmRate>({
      proportion: 0,
      deviceTotal: "",
      alarmNum: "",
      chainRatio: "",
    });
    const dataList = reactive([
      {
        title: "总面积",
        value: 0,
        unit: "㎡",
      },
      {
        title: "可用面积",
        value: 0,
        unit: "㎡",
      },
    ]);
    const buildUtilization = reactive({
      xData: ["1", "2", "3", "4", "5", "6", "7"],
      yData: [
        {
          name: "使用面积",
          data: [1, 2, 3, 4, 5, 6, 7],
        },
        {
          name: "停用面积",
          data: [10, 12, 3, 4, 15, 16, 7],
        },
      ],
    });
    const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
    const levelPieData = ref([]);
    const columns = ref([
      {
        title: "行业类型",
        dataIndex: "industry",
        width: 120,
      },
      {
        title: "使用",
        dataIndex: "num",
      },
      {
        title: "占比",
        dataIndex: "rate",
      },
    ]);
    const industryStatistics = ref([]);
    const throughNum = ref(0);
    const getUtilizationRate = async () => {
      const res = await utilizationRate();
      dataList[0].value = res.total;
      dataList[1].value = res.useArea;
      alarmRateData.proportion = res.utilizationRate;
    };
    const getBuildingUtilizationRate = async () => {
      const res = await buildingUtilizationRate();
      buildUtilization.xData = res.map((item) => {
        return item.areaName;
      });
      buildUtilization.yData[0].data = res.map((item) => {
        return item.useArea;
      });
      buildUtilization.yData[1].data = res.map((item) => {
        return item.disabledArea;
      });
    };
    const getStatisticsEnterprises = async () => {
      const res = await statisticsEnterprises();
      throughNum.value = res.total;
      industryStatistics.value = res.industryStatisticsEnterprises.map((e) => {
        return {
          ...e,
          rate: e.rate + "%",
        };
      });
      levelPieData.value = res.industryStatisticsEnterprises.map((item, index) => {
        return {
          name: item.industry,
          color: colors[index],
          value: item.num,
        };
      });
    };
    onMounted(() => {
      getUtilizationRate();
      getBuildingUtilizationRate();
      getStatisticsEnterprises();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="空间利用率" class="alarm-event">
            <div class="equipmentInfo">
              <div class="deviceList">
                {dataList.map((item) => (
                  <div class="device-box">
                    <span> {item.title}</span>
                    <span style="margin-left: 4px;">
                      <count-to startVal={0} endVal={item.value} duration={4000}></count-to>
                      <span class="unit"> {item.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
              <waterPolo title value={alarmRateData.proportion} unit="%" bgColor="#2989FF" color="#2989FF"></waterPolo>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="楼栋空间利用率" class="alarm-event">
            {" "}
            <div class="charts">
              {" "}
              <stackedColumn xData={buildUtilization.xData} yData={buildUtilization.yData}></stackedColumn>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="租赁企业行业情况统计" class="alarm-event">
            <div class="flex-between mg-10">
              <PlanPie pieData={levelPieData.value}>
                <div class="content">
                  <div class="pie-center"> {throughNum.value}</div>
                  <div> 通行总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={levelPieData.value}></PieList>
            </div>
            <RollTable column={columns.value} data={industryStatistics.value} showLength={8}></RollTable>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;

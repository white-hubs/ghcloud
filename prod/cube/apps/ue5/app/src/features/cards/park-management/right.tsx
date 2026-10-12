import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAreaList } from "@/infrastructure/api/mdata";
import { parkFloors, parkLeasing, rentalTrends } from "@/infrastructure/api/park";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import stackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const levelPieData = ref([
      {
        name: "已租赁",
        color: "#29C2FF",
        value: 0,
      },
      {
        name: "未租赁",
        color: "#74AEE7",
        value: 0,
      },
    ]);
    const columns = ref([
      {
        title: "租赁情况",
        dataIndex: "name",
        width: 120,
      },
      {
        title: "面积",
        dataIndex: "useArea",
      },
      {
        title: "占比",
        dataIndex: "useAreaRate",
      },
    ]);
    const areaList = ref([]);
    const areaData = ref();
    const industryStatistics = ref([]);
    const xData = ref<string[]>(["1", "2", "3", "4", "5", "6", "7"]);
    const yData = ref<{ name: string; data: number[] }[]>([
      {
        name: "",
        data: [],
      },
    ]);
    const buildUtilization = reactive({
      xData: [],
      yData: [
        {
          name: "已租赁",
          data: [],
        },
        {
          name: "未租赁",
          data: [],
        },
      ],
    });
    const getAreaListData = async () => {
      const res = await getAreaList();
      areaList.value = res[0].children;
      areaData.value = areaList.value[0].id;
    };
    const getParkLeasing = async () => {
      const res = await parkLeasing();
      const color = ["#29C2FF", "#74AEE7"];
      levelPieData.value = res.leased.map((item, index) => {
        return {
          name: item.name,
          color: color[index],
          value: item.useArea,
        };
      });
      industryStatistics.value = res.leased.map((item) => {
        return {
          name: item.name,
          useArea: item.useArea + "㎡",
          useAreaRate: item.useAreaRate + "%",
        };
      });
    };
    const getRentalTrends = async () => {
      const res = await rentalTrends();
      xData.value = res.xtitle.map((item) => {
        return (item += "月");
      });
      yData.value[0].data = res.xtitle.map((xItem) => {
        return res.rentalTrends.find((item) => item.timeFlag === xItem) ? res.rentalTrends.find((item) => item.timeFlag === xItem).num : 0;
      });
    };
    const getParkFloors = async () => {
      const res = await parkFloors(areaData.value);
      buildUtilization.xData = res.map((item) => {
        return item.areaName;
      });
      buildUtilization.yData[0].data = res.map((item) => {
        return item.rentedAreaRate;
      });
      buildUtilization.yData[1].data = res.map((item) => {
        return item.unleasedAreaRate;
      });
    };
    onMounted(async () => {
      await getAreaListData();
      getParkLeasing();
      getRentalTrends();
      getParkFloors();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="园区租赁总情况">
            <div class="flex-between mg-10">
              <PlanPie pieData={levelPieData.value}></PlanPie>
              <PieList roundPieData={levelPieData.value}></PieList>
            </div>
            <RollTable column={columns.value} data={industryStatistics.value} showLength={8}></RollTable>
          </SubPanelTemplate>
          <SubPanelTemplate title="园区租赁趋势">
            {" "}
            <div class="charts">
              {" "}
              <LineChart
                x-data={xData.value}
                series={yData.value}
                showLegend={true}
                showBackground={true}
                titles={[""]}
                gridTop="5"
                unit={{ x: "", y: "" }}
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="园区楼层租赁比情况">
            <template>
              <a-select
                ref="select"
                value={areaData.value}
                onUpdate:value={(v) => {
                  areaData.value = v;
                }}
                style="width: 80px"
                onChange={getParkFloors}
              >
                {areaList.map((item) => (
                  <a-select-option value={item.id}> {item.name}</a-select-option>
                ))}
              </a-select>
            </template>
            <div class="charts">
              {" "}
              <stackedColumn unit={"%"} xData={buildUtilization.xData} yData={buildUtilization.yData}></stackedColumn>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;

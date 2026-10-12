import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import stackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { GetParkingOverview } from "@/infrastructure/api/models/park-management";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { parkingData, trafficFlowTrend, vehicleAnalysisData } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import changeBar from "@/shared-ui/panel/changeBar";
import circlePie from "@/shared-ui/panel/charts/circlePie/circlePie";
import lineAndPillar from "@/shared-ui/panel/charts/lineAndPillar/lineAndPillar";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import traffic from "@/shared-ui/panel/traffic";
import { storeArea } from "@/visualization-core/stores/area";

import styles from "./stop-manage-left.module.less";

export const StopManageLeft = defineComponent({
  name: "StopManageLeft",
  setup(_props, ctx) {
    let parkingLotTotal = reactive<GetParkingOverview>({
      empty: 0,
      total: 0,
      used: 0,
    });
    let dataList = reactive([]);
    let timeType = ref();

    const lineData = reactive({
      title: "辆",
      xData: [],
      yData: [
        {
          data: [],
          name: "驶入",
          colors: [
            {
              offset: 0,
              color: "rgba(41, 137, 255, 1)",
            },
            {
              offset: 1,
              color: "rgba(41, 137, 255, 0.20)",
            },
          ],
        },
      ],
    });
    const lineAndPillarData = reactive({
      title: "辆",
      xdata: [],
      yData: [
        {
          name: "滞留车辆数",
          data: [],
          color: "#FFC700",
        },
        {
          name: "滞留车辆占比",
          data: [],
          color: "#2981EA",
        },
      ],
    });
    const circlePieData = reactive({
      percent: 0,
      selectedColor: "#2989FF",
      blgColor: "#19F8F7",
    });

    function changeDate() {
      trafficFlowTrendData();
    }
    // 获取车位信息
    const parkingLotInfo = async () => {
      let res = await parkingData();
      parkingLotTotal = res.parkingLotTotal;
      circlePieData.percent = res.circlePieData;
      dataList = res.dataList;
    };
    // 获取车流趋势信息
    const trafficFlowTrendData = async () => {
      let res = await trafficFlowTrend({ dimension: timeType.value.timeType });
      lineData.xData = res.xdata;
      lineData.yData[0].data = res.series[0].value;
    };
    // 滞留车辆分析
    const vehicleAnalysisInfo = async () => {
      let res = await vehicleAnalysisData();
      lineAndPillarData.xdata = res.xdata;
      lineAndPillarData.yData[0].data = res.series[0].value;
      lineAndPillarData.yData[1].data = res.series[1].value;
    };

    onMounted(() => {
      parkingLotInfo();
      trafficFlowTrendData();
      vehicleAnalysisInfo();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="车位总览">
            <OperateDays value={parkingLotTotal.value.total} title="车位总数" unit={"个"}></OperateDays>
            <div class="parkingLot">
              <circlePie percent={circlePieData.percent} selectedColor={circlePieData.selectedColor} blgColor={circlePieData.blgColor}>
                {" "}
                <div class="backgroundBox">
                  {" "}
                  <img src={getAssetsImage("vehicle.png")} />
                </div>
              </circlePie>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="车流驶入趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={timeType.value}
                onUpdate:modelValue={(v) => {
                  timeType.value = v;
                }}
                onSearch={changeDate}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <stackedLine title={lineData.title} yData={lineData.yData} xData={lineData.xData} color={["#2989FF"]}></stackedLine>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="滞留车辆分析">
            {" "}
            <div class="chart">
              {" "}
              <lineAndPillar
                title={lineAndPillarData.title}
                xData={lineAndPillarData.xdata}
                yData={lineAndPillarData.yData}
              ></lineAndPillar>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default StopManageLeft;

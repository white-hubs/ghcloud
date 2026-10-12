import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import stackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { GetParkingOverview } from "@/infrastructure/api/models/park-management";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { parkingData, trafficFlowTrend, parkingDuration } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import circlePie from "@/shared-ui/panel/charts/circlePie/circlePie";
import pillar from "@/shared-ui/panel/charts/pillar/pillar";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import traffic from "@/shared-ui/panel/traffic";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./stop-manage-left1.module.less";

export const StopManageLeft1 = defineComponent({
  name: "StopManageLeft1",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    let parkingLotTotal = reactive<GetParkingOverview>({
      empty: 0,
      total: 0,
      used: 0,
    });
    let dataList = reactive([]);
    let timeType = ref();
    let duration = ref();
    let timer: any = reactive(null);

    const trafficList = reactive([
      {
        color: "#2989FF",
        label: "驶入",
        value: 0,
      },
      {
        color: "#FF6E23",
        label: "驶出",
        value: 0,
      },
    ]);
    const lineData = reactive({
      title: "辆",
      xData: ["2月", "4月", "6月", "8月", "10月", "12月"],
      yData: [
        {
          data: [120, 132, 101, 134, 90, 230, 210],
          colors: [
            {
              offset: 0,
              color: "rgba(255, 222, 165, 1)",
            },
            {
              offset: 1,
              color: "rgba(255, 162, 0, 1)",
            },
          ],
        },
        {
          data: [220, 182, 191, 234, 290, 330, 310],
          colors: [
            {
              offset: 0,
              color: "rgba(25, 248, 247, 1)",
            },
            {
              offset: 1,
              color: "rgba(25, 248, 247, 0)",
            },
          ],
        },
      ],
    });
    const barData = reactive({
      xData: ["1月", "2月", "3月", "4月", "5月", "6月"],
      yData: [120, 200, 150, 80, 70, 110],
    });
    const circlePieData = reactive({
      percent: 50,
      selectedColor: "#2989FF",
      blgColor: "#19F8F7",
    });

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
      trafficList[0].value = res.series[0].total;
      trafficList[1].value = res.series[1].total;
      lineData.yData[0].data = res.series[0].value;
      lineData.yData[1].data = res.series[1].value;
    };
    // 停车时长分布
    const vehicleAnalysisInfo = async () => {
      let res = await parkingDuration({ dimension: duration.value.timeType });
      barData.xData = res.xdata;
      barData.yData = res.series[0].value;
    };
    const init = () => {
      parkingLotInfo();
      trafficFlowTrendData();
      vehicleAnalysisInfo();
    };

    onMounted(() => {
      trafficFlowTrendData();
      vehicleAnalysisInfo();
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
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
                  <img src={getAssetsImage("vehicle.png")}></img>
                </div>
              </circlePie>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="车位总览">
            <DateInlineForm
              modelValue={timeType.value}
              onUpdate:modelValue={(v) => {
                timeType.value = v;
              }}
              onSearch={trafficFlowTrendData}
            ></DateInlineForm>
            <div class="trafficBox">
              {trafficList.map((item) => (
                <traffic key={item.color} trafficInfo={item}></traffic>
              ))}
            </div>
            <stackedLine smooth={0.5} title={lineData.title} yData={lineData.yData} xData={lineData.xData}></stackedLine>
          </SubPanelTemplate>
          <SubPanelTemplate title="停车时长分布">
            <DateInlineForm
              modelValue={timeType.value}
              onUpdate:modelValue={(v) => {
                timeType.value = v;
              }}
              onSearch={vehicleAnalysisInfo}
            ></DateInlineForm>
            <pillar x-data={barData.xData} y-data={barData.yData} blg-color={"rgba(33, 94, 167, 0.20)"} bar-color={"#2981EA"}></pillar>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default StopManageLeft1;

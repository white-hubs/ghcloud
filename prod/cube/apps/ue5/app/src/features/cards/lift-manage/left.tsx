import { defineComponent } from "vue";
import { ref, reactive, toRefs, onMounted, onUnmounted } from "vue";

import overviewChartBar from "../hospital/overview-chartBar";
import stackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { operationsAnalysisData } from "@/infrastructure/api/securitymanagement";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panel";
import pieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const roundPieData = reactive([
      { label: "报警", color: "#19F8F7", value: 0 },
      { label: "故障", color: "#FFC700", value: 0 },
      { label: "离线", color: "#EF424A", value: 0 },
    ]);
    const devicesNum = ref(0);
    const contentList = ref([]);
    const operationsAnalysis = reactive<{
      operationsAnalysisTime: ModelValueItf;
      operationsAnalysisXdata: string[];
      operationsAnalysisYdata: any;
    }>({
      operationsAnalysisTime: {
        timeType: "TODAY",
        dateRange: [""],
      },
      operationsAnalysisXdata: ["4:00", "8:00", "12:00", "16:00", "20:00", "24:00"],
      operationsAnalysisYdata: [
        {
          data: [10, 20, 30, 40],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const barData = reactive({
      xData: [],
      yData: [
        {
          data: [10, 20, 30, 40],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });

    const { getEquipmentNumber } = useCommon();
    // 设备实时数据
    const deviceDataInfo = async () => {
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      roundPieData.length = 0;
      devicesNum.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        devicesNum.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        roundPieData.push(obj);
      });
      contentList.value = res.deviceGenreNums.map((item) => {
        return {
          name: item.genreName,
          value: item.num,
        };
      });
    };
    const lineData = reactive({
      title: "次",
      xData: ["4", "8", "12", "16", "20", "24"],
      yData: [
        {
          data: [1, 2, 4, 5, 6, 8, 7],
          name: "维修次数",
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
        {
          data: [10, 12, 14, 5, 86, 8, 7],
          name: "告警次数",
          colors: [
            {
              offset: 0,
              color: "rgba(255, 110, 35, 1)",
            },
            {
              offset: 1,
              color: "rgba(255, 110, 35, 0.02)",
            },
          ],
        },
      ],
    });
    const faultTime = ref<ModelValueItf>();
    const changeHandleOperationsAnalysis = async () => {
      const params = {
        type: operationsAnalysis.operationsAnalysisTime.timeType,
        period: operationsAnalysis.operationsAnalysisTime.dateRange.join(","),
      };
      const res = await operationsAnalysisData(params);
      barData.xData = res.xtitle;
      barData.yData[0].data = res.xtitle.map((xItem) => {
        return res.operationsAnalysis.find((item) => item.timeFlag === xItem)
          ? res.operationsAnalysis.find((item) => item.timeFlag === xItem).dataValue
          : 0;
      });
    };
    onMounted(() => {
      deviceDataInfo();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="电梯统计" class="supply-merchant">
            {" "}
            <displayPanel bg-img={"overView16.png"} content-list={contentList.value}></displayPanel>
          </SubPanelTemplate>
          <SubPanelTemplate title="运行分析">
            <template>
              {" "}
              <DateInlineForm
                modelValue={operationsAnalysis.operationsAnalysisTime}
                onUpdate:modelValue={(v) => {
                  operationsAnalysis.operationsAnalysisTime = v;
                }}
                onSearch={changeHandleOperationsAnalysis}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <overviewChartBar title={"次"} xData={barData.xData} yData={barData.yData} x-font-size={10.5}></overviewChartBar>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="电梯状态监测">
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData} eventNum={devicesNum.value}>
                <div class="content">
                  <span> {devicesNum.value}</span>
                  <br />
                  设备总数
                </div>
              </RoundPie>
              <pieList roundPieData={roundPieData}></pieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;

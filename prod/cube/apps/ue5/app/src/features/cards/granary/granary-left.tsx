import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import monitorPanel from "@/features/cards/hospital/monitor-panel";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./granary-left.module.less";

export const GranaryLeft = defineComponent({
  name: "GranaryLeft",
  setup(_props, ctx) {
    const overviewTime = ref<ModelValueItf>();
    const overviewTime1 = ref<ModelValueItf>();
    const monitorPanelData = ref([
      {
        imgPath: "overView29.png",
        value: "2342/1231",
        name: "总容量/已用(吨)",
      },
      {
        imgPath: "overView5.png",
        value: 6,
        name: "粮仓数",
      },
    ]);
    const granaryData = [
      {
        name: "粮仓1",
        value: "236/342",
      },
      {
        name: "粮仓2",
        value: "236/342",
      },
      {
        name: "粮仓3",
        value: "236/342",
      },
      {
        name: "粮仓4",
        value: "236/342",
      },
      {
        name: "粮仓5",
        value: "236/342",
      },
      {
        name: "粮仓6",
        value: "236/342",
      },
    ];
    const titles = ref<string[]>(["出库", "入库"]);
    const xData = ref<string[]>(["11-18", "11-19", "11-20", "11-21", "11-22", "11-23"]);
    const yData = ref<
      {
        name: string;
        data: number[];
        linearGradientColor?: string[];
        lineColor?: string;
        showSymbol?: boolean;
        smooth?: boolean;
        symbolSize?: number;
      }[]
    >([
      {
        name: "出库",
        data: [20, 40, 2, 21, 5, 31, 11, 34, 22, 11, 34, 22],
        smooth: true,
        symbolSize: 8,
        showSymbol: false,
        lineColor: "rgba(55, 167, 232, 0.7)",
        linearGradientColor: ["rgba(132, 167, 255, 0.7)", "rgba(55, 167, 232, 0.7)"],
      },
      {
        name: "入库",
        data: [26, 50, 38, 21, 45, 38, 18, 15, 30, 40, 30],
        smooth: true,
        symbolSize: 8,
        showSymbol: false,
        lineColor: "#2989FF",
        linearGradientColor: ["#02C6FF", "rgba(41, 137, 255, 0.2)"],
      },
    ]);
    const listData = [
      {
        name: "武侯区",
        value: 54,
      },
      {
        name: "成华区",
        value: 50,
      },
      {
        name: "锦江区",
        value: 48,
      },
      {
        name: "新都区",
        value: 45,
      },
      {
        name: "天府新区",
        value: 40,
      },
      {
        name: "金牛区",
        value: 38,
      },
      {
        name: "龙泉驿区",
        value: 30,
      },
      {
        name: "郫都区",
        value: 26,
      },
      {
        name: "青羊区",
        value: 22,
      },
      {
        name: "双流区",
        value: 18,
      },
    ];

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="粮仓库存">
          <div class="monitorPanelBox">
            {monitorPanelData.map((item, index) => (
              <monitorPanel key={item.name} monitorPanelData={item}></monitorPanel>
            ))}
          </div>
          <div class="granary-box">
            {granaryData.map((item) => (
              <div class="granary-item" key={item.name}>
                <div class="granary-value">
                  <img src={getAssetsImage("overView118.png")} alt></img>
                  <span> {item.value}</span>
                </div>
                <div class="granary-title"> {item.name}</div>
              </div>
            ))}
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="粮仓出入库趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={overviewTime.value}
              onUpdate:modelValue={(v) => {
                overviewTime.value = v;
              }}
            ></DateInlineForm>
          </template>
          <div class="echart">
            {" "}
            <LineChart
              x-data={xData.value}
              series={yData.value}
              showLegend={true}
              showBackground={true}
              titles={titles.value}
              gridTop="15"
              unit={{ x: "", y: "" }}
              axisPointer={true}
            />
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="粮仓粮食质量排名">
          <template>
            {" "}
            <DateInlineForm
              modelValue={overviewTime1.value}
              onUpdate:modelValue={(v) => {
                overviewTime1.value = v;
              }}
            ></DateInlineForm>
          </template>
          <div class="eventAlarmItem-body">
            {listData.map((item, index) => (
              <EventAlarmItem sort={index + 1} sn={false} name={item.name} count={item.value} modes={"次"} />
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default GranaryLeft;

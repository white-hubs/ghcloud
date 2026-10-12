import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import overviewPanel from "./components/overview-panel";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const energyOverviewTime = ref<ModelValueItf>();
    const xData = ref<string[]>(["旧存", "新收", "结案", "未结"]);
    const titles = ref<string[]>(["民事", "刑事", "行政", "执行"]);
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
        name: "民事",
        data: [2700, 13000, 9000, 4000],
        showSymbol: false,
        smooth: true,
      },
      {
        name: "行政",
        data: [400, 3000, 3000, 2500],
        showSymbol: false,
        smooth: true,
      },
      {
        name: "刑事",
        data: [200, 300, 2700, 2000],
        showSymbol: false,
        smooth: true,
      },
      {
        name: "执行",
        data: [900, 8000, 7000, 3500],
      },
    ]);
    const listData = ref<{ name: string; ratio: string; value: number }[]>([
      {
        name: "高新法院",
        value: 1000,
        ratio: "100%",
      },
      {
        name: "锦江法院",
        value: 900,
        ratio: "90%",
      },
      {
        name: "青羊法院",
        value: 800,
        ratio: "80%",
      },
      {
        name: "成华法院",
        value: 700,
        ratio: "70%",
      },
      {
        name: "武侯法院",
        value: 600,
        ratio: "60%",
      },
    ]);
    const caseList = [
      { id: "1", time: "2024-09-10 12:35", label: "成都十大最佳！成都中院改革案例入选" },
      { id: "2", time: "2024-09-10 14:05", label: "成都中院召开党组（扩大）会议，专题传达学习" },
      { id: "3", time: "2024-09-10 12:00", label: "成都市中级人民法院关于2024年成都市法院系统" },
      { id: "4", time: "2024-09-10 09:30", label: "成都中院传达学习贯彻张军院长来川来蓉调研精神" },
      { id: "5", time: "2024-09-10 11:40", label: "邓修明在四川法院调研时强调：持续学深悟透做实." },
    ];
    const monitorPanelData = ref([
      {
        imgPath: "overView100.png",
        value: "260",
        unit: "m²",
        name: "占地面积",
      },
      {
        imgPath: "overView99.png",
        value: "200",
        unit: "m²",
        name: "建筑面积",
      },
    ]);
    const topTimeFrame = ref<ModelValueItf>({
      timeType: "jiucun",
      dateRange: [],
    });
    const timeList = [
      { label: "旧存", value: "jiucun" },
      { label: "新收", value: "xinshou" },
      { label: "结案", value: "jiean" },
      { label: "未结", value: "weijie" },
    ];
    const detectionData = ref([
      {
        name: "法庭",
        value: 33,
        color: "#29C2FF",
      },
      {
        name: "调解室",
        value: 33,
        color: "#FFAB10",
      },
      {
        name: "诉服大厅（立案）",
        value: 33,
        color: "#2989FF",
      },
      {
        name: "信访大厅",
        value: 33,
        color: "#19F8F7",
      },
      {
        name: "其他",
        value: 33,
        color: "#2AE8BD",
      },
    ]);
    const overPanelData = reactive({
      panelData1: 300,
      panelName1: "旧存数",
      panelRatio1: -1,

      panelData2: 405,
      panelRatio2: 2,
      panelName2: "新收数",

      panelData3: 623,
      panelRatio3: -2,
      panelName3: "结案数",

      panelData4: 524,
      panelRatio4: -1,
      panelName4: "未结数",
    });
    const changeHandleEnergyOverviewTime = () => {};
    const changeTopTimeFrame = () => {};

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="安检收结存趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={energyOverviewTime.value}
              onUpdate:modelValue={(v) => {
                energyOverviewTime.value = v;
              }}
              onSearch={changeHandleEnergyOverviewTime}
            ></DateInlineForm>
          </template>
          <overviewPanel overPanelData={overPanelData}></overviewPanel>
          <div class="line-chart">
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
        <SubPanelTemplate title={"全市法院收结存Top5"}>
          <template>
            {" "}
            <div>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={topTimeFrame.value}
                onUpdate:modelValue={(v) => {
                  topTimeFrame.value = v;
                }}
                onSearch={changeTopTimeFrame}
              ></DateInlineForm>
            </div>
          </template>
          <div class="eventAlarmItem-body">
            {listData.map((item, index) => (
              <EventAlarmItem sort={index + 1} sn={false} name={item.name} count={item.value} ratio={item.ratio} modes={"次"} />
            ))}
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="审管动态" class="alarm-event">
          <div class="case">
            <Vue3SeamlessScroll list={caseList} step={0.5} hover singleHeight={64} waitTime={1000}>
              {caseList.map((item) => (
                <div class="row" key={item.id}>
                  <div class="time"> {item.time}</div>
                  <div class="desc two-line"> {item.label}</div>
                </div>
              ))}
            </Vue3SeamlessScroll>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default Left;

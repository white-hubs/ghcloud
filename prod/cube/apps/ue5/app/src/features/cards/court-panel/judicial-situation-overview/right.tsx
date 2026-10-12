import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import AssessmentIndicators from "./components/assessment-indicators";
import monitorPanel from "./components/monitor-panel";
import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import childLevelSubPanel from "@/shared-ui/panel/childLevelSubPanel";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const barData = reactive({
      xData: ["1-2年未结案", "2-3年未结案", "3年及以上"],
      yData: [
        {
          data: [789, 543, 311],
          name: "案件预案数",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const overPanelData = ref({
      title: "受理数",
      rate: 6.8,
      total: 2.62,
      valueData: [
        {
          label: "优于区间",
          value: 6,
        },
        {
          label: "位于区间",
          value: 13,
        },
        {
          label: "劣于区间",
          value: 6,
        },
      ],
    });
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
    const monitorPanelData = ref([
      {
        imgPath: "overView105.png",
        value: "18",
        unit: "",
        name: "未结总数",
      },
      {
        imgPath: "overView113.png",
        value: "5",
        unit: "",
        name: "新增未结",
      },
      {
        imgPath: "overView111.png",
        value: "26",
        unit: "",
        name: "已化解未结",
      },
      {
        imgPath: "overView112.png",
        value: "1.45",
        unit: "%",
        name: "未结案化解率",
      },
    ]);

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="未结案件实时统计">
          <div class="monitorPanelBox">
            {monitorPanelData.map((item, index) => (
              <monitorPanel key={item.name} monitorPanelData={item}></monitorPanel>
            ))}
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="案件积压预警">
          {" "}
          <div class="bar-chart">
            {" "}
            <overviewChartBar bottom={"0%"} xData={barData.xData} yData={barData.yData}></overviewChartBar>
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="审判质效分析">
          <childLevelSubPanel title="重点考核指标分析" style="margin-top: 12px;" class="child-level">
            {" "}
            <AssessmentIndicators overPanelData={overPanelData.value} />
          </childLevelSubPanel>
          <childLevelSubPanel title="各基层法院在全市的排名TOP5" style="margin-top: 12px;" class="child-level">
            <div class="eventAlarmItem-body">
              {listData.map((item, index) => (
                <EventAlarmItem sort={index + 1} sn={false} name={item.name} count={item.value} ratio={item.ratio} modes={"次"} />
              ))}
            </div>
          </childLevelSubPanel>
        </SubPanelTemplate>
      </>
    );
  },
});

export default Right;

import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import monitorPanel from "@/features/cards/court-panel/court-overview/components/monitor-panel";
import AssessmentIndicators from "@/features/cards/court-panel/judicial-situation-overview/components/assessment-indicators";
import stackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import childLevelSubPanel from "@/shared-ui/panel/childLevelSubPanel";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const listData = ref<{ name: string; ratio: string; value: number }[]>([
      {
        name: "婚姻家庭、继承纠纷",
        value: 1000,
        ratio: "100%",
      },
      {
        name: "物权纠纷",
        value: 900,
        ratio: "90%",
      },
      {
        name: "知识产权与竞争纠纷",
        value: 800,
        ratio: "80%",
      },
      {
        name: "侵权责任纠纷",
        value: 700,
        ratio: "70%",
      },
    ]);
    const courtListData = ref<{ name: string; ratio: string; value: number }[]>([
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
    const lineData = reactive({
      title: "次",
      xData: ["1月", "4月", "7月", "10月"],
      yData: [
        {
          data: [1244, 989, 1151, 1039],
          name: "收案标的",
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
          data: [973.8, 686, 909, 853],
          name: "结案标的",
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
    const energyOverviewTime = ref<ModelValueItf>({
      timeType: "1",
      dateRange: [],
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
    const timeList = [
      { label: "案件比", value: "1" },
      { label: "纠结在院同时", value: "2" },
      { label: "上诉率", value: "3" },
      { label: "一审裁判被改判率", value: "4" },
      { label: "一审裁判发回重审率", value: "5" },
      { label: "申诉申请再审率", value: "6" },
      { label: "裁定再审率", value: "7" },
      { label: "生效裁判被改判率", value: "8" },
      { label: "生效裁判被发回重审率", value: "9" },
      { label: "二审开庭率", value: "10" },
    ];
    const monitorPanelData = ref([
      {
        imgPath: "overView105.png",
        value: "4423",
        unit: "万",
        name: "收案标的",
      },
      {
        imgPath: "overView104.png",
        value: "3421",
        unit: "万",
        name: "结案标的",
      },
    ]);
    const changeHandleEnergyOverviewTime = () => {};

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="重点案由案件排名">
          <div class="eventAlarmItem-body">
            {listData.map((item, index) => (
              <EventAlarmItem sort={index + 1} sn={false} name={item.name} count={item.value} ratio={item.ratio} modes={"次"} />
            ))}
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="案件标的分析">
          <div class="monitorPanelBox">
            {monitorPanelData.map((item, index) => (
              <monitorPanel key={item.name} monitorPanelData={item}></monitorPanel>
            ))}
          </div>
          <div class="line-chart">
            {" "}
            <stackedLine title={lineData.title} yData={lineData.yData} xData={lineData.xData} color={["#2989FF", "#FF6E23"]}></stackedLine>
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="审判质效分析">
          <childLevelSubPanel title="基础法院综合指标" class="child-level">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={energyOverviewTime.value}
                onUpdate:modelValue={(v) => {
                  energyOverviewTime.value = v;
                }}
                onSearch={changeHandleEnergyOverviewTime}
              ></DateInlineForm>
            </template>
            <AssessmentIndicators overPanelData={overPanelData.value} />
          </childLevelSubPanel>
          <childLevelSubPanel title="各基层法院在全市的排名TOP5" class="child-level">
            <div class="eventAlarmItem-body">
              {courtListData.map((item, index) => (
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

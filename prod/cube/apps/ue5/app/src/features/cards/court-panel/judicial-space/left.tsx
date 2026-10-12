import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import Tabs from "./components/tabs";
import monitorPanel from "@/features/cards/court-panel/court-overview/components/monitor-panel";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const tabState = reactive({
      active: "court",
      tabList: [
        {
          label: "法院",
          value: "court",
        },
        {
          label: "调解室",
          value: "mediation",
        },
        {
          label: "诉服大厅",
          value: "litigation",
        },
        {
          label: "信访大厅",
          value: "petition",
        },
      ],
    });
    const handleTabChange = (value: string, tab) => {
      spaceAreaData.value = spaceAreaDataList.find((e) => e.type === value);
    };

    // 司法空间数据
    const monitorPanelData = ref([
      {
        imgPath: "judicial-space-fating.png",
        value: "89",
        name: "法庭",
      },
      {
        imgPath: "judicial-space-tiaojie.png",
        value: "37",
        name: "调解室",
      },
      {
        imgPath: "judicial-space-sufu.png",
        value: "1",
        name: "诉服大厅(立案)",
      },
      {
        imgPath: "judicial-space-xinfang.png",
        value: "1",
        name: "信访大厅",
      },
    ]);

    // 司法空间占比数据
    const spaceProportionData = ref([
      {
        name: "法庭",
        value: 89,
        color: "#29C2FF",
      },
      {
        name: "调解室",
        value: 37,
        color: "#FFAB10",
      },
      {
        name: "诉服大厅（立案）",
        value: 1,
        color: "#2989FF",
      },
      {
        name: "信访大厅",
        value: 1,
        color: "#19F8F7",
      },
    ]);

    // 司法空间区域数据
    const spaceAreaData = ref({
      type: "court",
      name: "法庭",
      value: 89,
      data: [
        {
          name: "办公1区",
          value: 39,
          color: "#29C2FF",
        },
        {
          name: "办公2区",
          value: 25,
          color: "#FFAB10",
        },
        {
          name: "办公3区",
          value: 19,
          color: "#2989FF",
        },
        {
          name: "其他",
          value: 6,
          color: "#19F8F7",
        },
      ],
    });

    const spaceAreaDataList = [
      {
        type: "court",
        name: "法庭",
        value: 89,
        data: [
          {
            name: "办公1区",
            value: 39,
            color: "#29C2FF",
          },
          {
            name: "办公2区",
            value: 25,
            color: "#FFAB10",
          },
          {
            name: "办公3区",
            value: 19,
            color: "#2989FF",
          },
          {
            name: "其他",
            value: 6,
            color: "#19F8F7",
          },
        ],
      },
      {
        type: "mediation",
        name: "调解室",
        value: 30,
        data: [
          {
            name: "办公1区",
            value: 7,
            color: "#29C2FF",
          },
          {
            name: "办公2区",
            value: 7,
            color: "#FFAB10",
          },
          {
            name: "办公3区",
            value: 23,
            color: "#2989FF",
          },
          {
            name: "其他",
            value: 0,
            color: "#19F8F7",
          },
        ],
      },
      {
        type: "litigation",
        name: "诉服大厅（立案）",
        value: 1,
        data: [
          {
            name: "办公1区",
            value: 1,
            color: "#29C2FF",
          },
        ],
      },
      {
        type: "petition",
        name: "信访大厅",
        value: 1,
        data: [
          {
            name: "办公1区",
            value: 1,
            color: "#29C2FF",
          },
        ],
      },
    ];

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="司法空间">
            <div class="monitorPanelBox">
              {monitorPanelData.map((item, index) => (
                <monitorPanel key={item.name} monitorPanelData={item}></monitorPanel>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="司法空间占比情况">
            <div class="elevator-analysis">
              <div class="chart">
                <elevatorAnalysisPie pieData={spaceProportionData.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 128</div>
                  <div style="color: #fff;text-align: center;font-size: 10px;"> 法庭数(间)</div>
                </elevatorAnalysisPie>
              </div>
              <elevatorAnalysisList showRatio={true} contentList={spaceProportionData.value} class="pie_list"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="司法空间区域分布">
            <div class="tab-container">
              {" "}
              <Tabs
                tabsList={tabState.tabList}
                active={tabState.active}
                onUpdate:active={(v) => {
                  tabState.active = v;
                }}
                onChange={handleTabChange}
              />
            </div>
            <div class="elevator-analysis">
              <div class="chart">
                <elevatorAnalysisPie pieData={spaceAreaData.data}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> {spaceAreaData.value}</div>
                  <div style="color: #fff;text-align: center;font-size: 10px;"> {spaceAreaData.name}</div>
                </elevatorAnalysisPie>
              </div>
              <elevatorAnalysisList showRatio={true} contentList={spaceAreaData.data} class="pie_list"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;

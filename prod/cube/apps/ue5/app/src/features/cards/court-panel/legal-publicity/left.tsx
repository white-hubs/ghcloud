import { defineComponent } from "vue";
import { ref } from "vue";

import monitorPanel from "@/features/cards/court-panel/court-overview/components/monitor-panel";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const activeKey = ref("1");
    const topTimeFrame = ref({
      timeType: "quarter",
    });
    const timeList = [
      { label: "本月度", value: "mouth" },
      { label: "本季度", value: "quarter" },
      { label: "本年度", value: "year" },
    ];
    const activityList = ref<{ name: string; value: number; color: string }[]>([
      { name: "活动类型1", value: 30000, color: "#FFAB10" },
      { name: "活动类型2", value: 2000, color: "#2F8DFF" },
      { name: "活动类型3", value: 748, color: "#F14545" },
      { name: "活动类型4", value: 6000, color: "#19F8F7" },
      { name: "活动类型5", value: 6000, color: "#2AE8BD" },
    ]);

    const monitorPanelData = ref([
      {
        imgPath: "legal-3.png",
        value: "20",
        unit: "个",
        name: "党支部数",
      },
      {
        imgPath: "legal-4.png",
        value: "2151",
        unit: "个",
        name: "党员人数",
      },
    ]);
    const workList = ref([
      {
        name: "总分90-100",
        value: 33,
        color: "#29C2FF",
      },
      {
        name: "总分80-90",
        value: 13,
        color: "#FFAB10",
      },
      {
        name: "总分70-80",
        value: 10,
        color: "#2989FF",
      },
      {
        name: "总分60-70",
        value: 26,
        color: "#19F8F7",
      },
      {
        name: "60以下",
        value: 18,
        color: "#2AE8BD",
      },
    ]);
    const studyList = [
      { id: "1", label: "中央和国家机关部门机关党委书记学习贯彻习近平…" },
      { id: "2", label: "紧紧依靠群众 真诚服务群众" },
      { id: "3", label: "凝神聚力抓改革促发展" },
      { id: "4", label: "深入学习贯彻习近平总书记关于社会工作的重要论述…" },
      { id: "5", label: "做好新时代流动党员管理工作的指导性文件" },
    ];
    const informationList = [
      { id: "1", time: "2024-09-10 12:35", label: "紧紧依靠群众 真诚服务群众" },
      { id: "2", time: "2024-09-10 12:35", label: "凝神聚力抓改革促发展" },
      { id: "3", time: "2024-09-10 12:35", label: "深入学习贯彻习近平总书记关于社会工作的重要论述…" },
      { id: "4", time: "2024-09-10 12:35", label: "做好新时代流动党员管理工作的指导性文件" },
    ];
    const topXData = ref<string[]>([]);
    const topYData = ref<number[]>([]);
    const changeTopTimeFrame = () => {};

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="党建要闻及制度">
            <div class="information">
              <div class="demoTab">
                <a-tabs
                  activeKey={activeKey.value}
                  onUpdate:activeKey={(v) => {
                    activeKey.value = v;
                  }}
                  style="position: absolute; right: 20px"
                >
                  <a-tab-pane key="1" tab="党建要闻"></a-tab-pane>
                  <a-tab-pane key="2" tab="党建规章制度" force-render></a-tab-pane>
                </a-tabs>
              </div>
              <div class="content">
                <img class="hostImg" src={getAssetsImage("legal-1.png")} alt></img>
                <div class="desc">
                  <div class="title">
                    <img class="icon" src={getAssetsImage("legal-6.png")} alt></img>
                    <div class="one-line"> 中央和国家机关部门机关党委书记学习贯彻习近平</div>
                  </div>
                  <div class="info"> 为及时对外发布、解读相关政策和建政策直通、增强政策认同感…</div>
                </div>
              </div>
              <div class="list">
                <Vue3SeamlessScroll list={studyList} step={0.5} hover singleHeight={50} waitTime={1000}>
                  {informationList.map((item) => (
                    <div class="item two-line" key={item.id}>
                      {" "}
                      {item.label}
                    </div>
                  ))}
                </Vue3SeamlessScroll>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title={"党组织活动"}>
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
            <div class="activity-data">
              <PlanPie pieData={activityList.value}>
                {" "}
                <img src={getAssetsImage("legal-2.png")} />
              </PlanPie>
              <elevatorAnalysisList contentList={activityList.value}></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="党员考核统计分析">
            <div class="monitorPanelBox">
              {monitorPanelData.map((item, index) => (
                <monitorPanel key={item.name} monitorPanelData={item}></monitorPanel>
              ))}
            </div>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie pieData={workList.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 2171</div>
                  <div style="color: #fff;text-align: center;font-size: 10px;"> 党员人数</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList showRatio={true} contentList={workList.value} class="pie_list"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;

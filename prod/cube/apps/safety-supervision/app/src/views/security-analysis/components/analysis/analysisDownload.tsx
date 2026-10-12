import { defineComponent, ref, onMounted, watch } from "vue";

import style from "./analysis.module.less";
const analysisLoading = "/resource/v1/safety-supervision/img/analysis-mini-loading.png";
import dayjs from "dayjs";

import type { HistoryScore, HistoryScoreChildren } from "@ghcloud/cube-safety-management-service/src/type";

import { AnalysisComponents } from "./analysis-components";
import { buildDisplayMetricCharts, buildDisplayMetricTexts } from "./display-metrics";
import { makeDom } from "./mock";
import type { AnalysisInfo } from "./type";
interface Props {
  requestId: string;
  data: HistoryScore;
  originalData: AnalysisInfo[];
}

export const AnalysisDownload = defineComponent({
  emits: ["cancel"],
  props: ["requestId", "data", "originalData"],
  setup(props: Props) {
    const analysisInfo = ref<AnalysisInfo[]>([]);
    const analysisHeaderData = ref({
      title: "",
      value: "0%",
    });
    const analysisResultInfo = ref({
      status: "Analyzing",
      errorItem: 0,
      score: 100,
      projectItem: 0,
      color: "#3fbe53",
      time: "",
      suggestions: "",
      starttime: "",
      endtime: "",
    });
    const pdf = ref();

    const getData = (res: HistoryScore): void => {
      if (!res) {
        return;
      }
      analysisResultInfo.value.status = "Analyzed";
      analysisResultInfo.value.score = Number(res.score.toFixed(2));
      analysisResultInfo.value.time = dayjs(res.createTime).format("YYYY-MM-DD HH:mm:ss");
      analysisResultInfo.value.starttime = dayjs(res.beginTime).format("YYYY-MM-DD");
      analysisResultInfo.value.endtime = dayjs(res.endTime).format("YYYY-MM-DD");
      analysisResultInfo.value.suggestions = res.suggestion;
      analysisHeaderData.value.value = "100%";
      if (res.score < 80) {
        analysisResultInfo.value.color = "#FAAD14";
        if (res.score < 60) {
          analysisResultInfo.value.color = "red";
        }
      }
      analysisInfo.value = res.items.map((dataItem: HistoryScoreChildren) => {
        return {
          name: dataItem.topicName,
          analysisStatus: "Analyzed",
          fraction: dataItem.score,
          expanded: true,
          code: dataItem.topic,
          children: dataItem.subTopicCalculateScores?.map((dataChildren: HistoryScoreChildren) => {
            return {
              name: dataChildren.topicName,
              analysisStatus: "Analyzed",
              fraction: dataChildren.score,
              expanded: true,
              code: dataItem.topic,
              children: dataChildren.subTopicCalculateScores?.map((dataGrandson: HistoryScoreChildren) => {
                dataChange(dataGrandson);
                return {
                  name: dataGrandson.topicName,
                  analysisStatus: "Analyzed",
                  fraction: dataGrandson.score,
                  title: dataGrandson.suggestion,
                  code: dataItem.topic,
                  data: makeDom(dataGrandson.contentTemplate ?? "", dataGrandson.contentVariables ?? {}, dataGrandson.topicConcat ?? ""),
                  displayCharts: buildDisplayMetricCharts(dataGrandson),
                  displayTexts: buildDisplayMetricTexts(dataGrandson),
                  expanded: true,
                };
              }),
            };
          }),
        };
      });
    };

    // 数据转换
    const dataChange = (res: HistoryScoreChildren): void => {
      const fraction = res.score;
      if (fraction !== undefined && fraction !== null && fraction < 80) {
        analysisResultInfo.value.errorItem = analysisResultInfo.value.errorItem + 1;
      }
      analysisResultInfo.value.projectItem = analysisResultInfo.value.projectItem + 1;
    };
    onMounted(() => {
      getData(props.data);
    });
    watch(
      () => props.data,
      () => {
        getData(props.data);
      },
    );

    // ref={el => itemRefs.value[index] = el as HTMLElement}
    return (): JSX.Element => (
      <div class={style["analysis-pdf-body"]} ref={pdf}>
        <div class={style["analysis-body-header"]} data-pdf-block>
          <div class={style["animationPdf"]}>
            <img src={analysisLoading} alt="" />
          </div>
          <div class={style["analysis-body-header-text-main"]}>
            <div class={style["analysis-body-header-text-main-text"]}>
              {analysisResultInfo.value.status === "Analyzed" && (
                <>
                  <span>
                    共分析{analysisResultInfo.value.projectItem}项,发现
                    <span
                      class={style["security-analysis-title-result-text"]}
                      style={{
                        color: analysisResultInfo.value.errorItem > 0 ? "red" : "#3fbe53",
                        fontSize: "50px",
                        fontWeight: "bold",
                        lineHeight: "30px",
                      }}
                    >
                      {analysisResultInfo.value.errorItem}
                    </span>
                    项问题，分析得分
                    <span style={{ color: analysisResultInfo.value.color, fontSize: "50px", fontWeight: "bold" }}>
                      {analysisResultInfo.value.score}
                    </span>
                    分{" "}
                  </span>
                  <div class={style["security-analysis-result-button"]}></div>
                </>
              )}
            </div>
            {analysisResultInfo.value.suggestions && (
              <div class={style["analysis-body-header-text-main-suggestion"]}>
                AI建议: <span>{analysisResultInfo.value.suggestions}</span>
              </div>
            )}
            <div class={style["analysis-body-header-text-main-progress"]}>
              {analysisResultInfo.value.status === "Analyzing" && <span>正在分析：{analysisHeaderData.value.title}</span>}
              {analysisResultInfo.value.status === "Analyzed" && (
                <>
                  <span>
                    分析范围: {analysisResultInfo.value.starttime} - {analysisResultInfo.value.endtime}
                  </span>
                  <span style={{ marginLeft: "30px" }}>分析时间: {analysisResultInfo.value.time}</span>
                </>
              )}

              {analysisResultInfo.value.status === "Analyzing" && (
                <div class={style["analysis-body-header-text-main-progress-bar"]}>
                  <div
                    class={style["analysis-body-header-text-main-progress-bar-progress"]}
                    style={{ width: analysisHeaderData.value.value }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div class={style["analysis-body-pdf-main"]}>
          <AnalysisComponents data={analysisInfo.value} currentKey={0} />
        </div>
      </div>
    );
  },
});

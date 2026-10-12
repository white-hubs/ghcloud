import { defineComponent, ref, onMounted, nextTick } from "vue";

import style from "./analysis.module.less";
const analysisLoading = "/resource/v1/safety-supervision/img/analysis-mini-loading.png";

import { Button, message } from "ant-design-vue";
import dayjs from "dayjs";

import type { RuleTemplate, ScoreTemplate } from "@ghcloud/cube-safety-management-service/src/type";
import { downloadPDFWithoutTextBreak } from "@ghcloud/cube-utils";

import { cubeSafetyManagementAnalysisService } from "../../../../api/server";
import { AnalysisComponents } from "./analysis-components";
import { AnalysisDownload } from "./analysisDownload";
import { buildDisplayMetricCharts, buildDisplayMetricTexts } from "./display-metrics";
import { makeDom } from "./mock";
import type { AnalysisInfo } from "./type";
interface Props {
  timer: [string, string];
  requestId: string;
  originalData: AnalysisInfo[];
  embedded?: boolean;
}

interface AnalysisResultInfo {
  status: string;
  errorNumber: number;
  score: number;
  projectItem: number;
  color: string;
  time: string;
  suggestion: string;
}

export const Analysis = defineComponent({
  emits: ["cancel"],
  props: ["timer", "requestId", "originalData", "embedded"],
  setup(props: Props, { emit }) {
    const analysisInfo = ref<AnalysisInfo[]>([]);
    const analysisHeaderData = ref({
      title: "",
      value: "0%",
    });
    // 报告状态
    // 'ToBeAnalyzed' | 'Analyzed' | 'Analyzing';
    const analysisResultInfo = ref<AnalysisResultInfo>({
      status: "Analyzing",
      errorNumber: 0,
      score: 100,
      projectItem: 0,
      color: "#3fbe53",
      time: "",
      suggestion: "",
    });
    // 一轮中重复调用次数
    const resetNum = ref(0);
    // 内部一轮中重复调用次数
    const resetInternalNum = ref(0);

    const step = ref(1);

    // ai诊断是否中断
    const interrupt = ref(false);

    const pdfData = ref();
    const buttonLoading = ref(false);
    const pdf = ref();

    // 一级
    const itemIndex = ref(0);
    const itemLength = ref(0);

    // 二级
    const childrenIndex = ref(0);
    const childrenLength = ref(0);
    // 三级
    const grandsonIndex = ref(0);
    const grandsonLength = ref(0);

    // 请求进行中
    const requesting = ref(true);
    const queryData = ref({
      requestId: props.requestId,
      itemCodeConcat: "SECURITY_MONITORING",
      period: `${props.timer[0]} 00:00:00,${props.timer[1]} 23:59:59`,
    });
    const toArray = <T,>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);
    const normalizeAnalysisTree = (items: AnalysisInfo[] | null | undefined): AnalysisInfo[] =>
      toArray(items).map((item) => ({
        ...item,
        children: normalizeAnalysisTree(item.children),
      }));
    const analysisClick = (): void => {
      if (step.value === 1) {
        requesting.value = false;
        interrupt.value = false;
        emit("cancel", 1);
      } else {
        step.value = 1;
        analysisResultInfo.value.status = "Analyzed";
        interrupt.value = true;
        changeStatus();
        requesting.value = false;
      }
    };
    const analysisRestClick = (): void => {
      analysisInfo.value = normalizeAnalysisTree(JSON.parse(JSON.stringify(props.originalData ?? [])) as AnalysisInfo[]);
      itemIndex.value = 0;
      childrenIndex.value = 0;
      grandsonIndex.value = 0;
      analysisResultInfo.value.status = "Analyzing";
      analysisResultInfo.value.errorNumber = 0;
      analysisResultInfo.value.projectItem = 0;
      step.value = 1;
      updateLength();
      requesting.value = true;
      analysisMethods();
    };
    const analysisPdfClick = (): void => {
      getAlarmsScoreToPdfMethods();
    };
    const analysisAIClick = (): void => {
      updateLength();
      step.value = 2;
      analysisResultInfo.value.status = "Analyzing";
      requesting.value = true;
      analysisMethods();
    };

    // 获取总ai建议
    const analysisAISuggestionMethods = async (): Promise<void> => {
      const res = await cubeSafetyManagementAnalysisService.getReportsSuggestion(queryData.value);
      analysisResultInfo.value.suggestion = res.suggestion;
    };
    // 获取报告信息
    const getAlarmsScoreToPdfMethods = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        const res = await cubeSafetyManagementAnalysisService.getAlarmsHistoryScore(queryData.value);
        if (res) {
          pdfData.value = res;
          nextTick(() => {
            analysisDownload();
          });
        }
      } catch {
        message.error("获取失败");
      }
    };
    const analysisDownload = async (): Promise<void> => {
      await downloadPDFWithoutTextBreak(pdf.value, pdfData.value.name);
      buttonLoading.value = false;
    };

    // 获取父级分数
    const getChildScore = async (): Promise<void> => {
      if (!requesting.value) {
        return;
      }
      try {
        const res = await cubeSafetyManagementAnalysisService.getParentScore(queryData.value);
        if (res) {
          resetInternalNum.value = 0;
          const children = toArray(analysisInfo.value[itemIndex.value]?.children);
          const child = children[childrenIndex.value];
          if (child) {
            child.analysisStatus = "Analyzed";
            child.fraction = res.score;
            childrenIndex.value += 1;
            if (childrenIndex.value === childrenLength.value) {
              childrenIndex.value = 0;
              queryData.value.itemCodeConcat = analysisInfo.value[itemIndex.value]?.code ?? "";
              resetInternalNum.value = 0;
              try {
                resetInternalNum.value += 1;
                await getAppScore();
              } catch {
                if (!requesting.value) {
                  return;
                }
                if (resetInternalNum.value === 3) {
                  message.error("分析失败，请重试");
                  analysisClick();
                } else {
                  getAppScore();
                }
              }
            } else {
              updateLength();
              analysisMethods();
            }
          }
        }
      } catch {}
    };
    // 获取应用分数

    const getAppScore = async (): Promise<void> => {
      if (!requesting.value) {
        return;
      }
      try {
        const res = await cubeSafetyManagementAnalysisService.getParentScore(queryData.value);
        if (res) {
          resetInternalNum.value = 0;
          const item = analysisInfo.value[itemIndex.value];
          if (!item) {
            getAlarmsScoreMethods();
            return;
          }
          item.analysisStatus = "Analyzed";
          item.fraction = res.score;
          if (itemIndex.value < analysisInfo.value.length - 1) {
            itemIndex.value += 1;
            childrenIndex.value = 0;
            updateLength();
            analysisMethods();
          } else {
            getAlarmsScoreMethods();
          }
        }
      } catch {}
    };
    // 获取报告分数
    const getAlarmsScoreMethods = async (): Promise<void> => {
      if (!requesting.value) {
        return;
      }
      try {
        const res = await cubeSafetyManagementAnalysisService.getAlarmsScore(queryData.value);
        if (res) {
          analysisResultInfo.value.status = "Analyzed";
          analysisResultInfo.value.score = Number(res.score.toFixed(2));
          analysisResultInfo.value.time = dayjs(res.createTime).format("YYYY-MM-DD HH:mm:ss");
          analysisHeaderData.value.value = "100%";
          if (res.score < 80) {
            analysisResultInfo.value.color = "#FAAD14";
            if (res.score < 60) {
              analysisResultInfo.value.color = "red";
            }
          }
          changeExpanded();
          itemIndex.value = 0;
          childrenIndex.value = 0;
          grandsonIndex.value = 0;
          if (step.value === 1) {
            analysisAIClick();
          } else {
            analysisAISuggestionMethods();
          }
        }
      } catch {
        message.error("获取报告分数失败");
      }
    };

    // 切换展开状态
    const changeExpanded = (): void => {
      const newInfo = [...analysisInfo.value];
      newInfo.map((item: AnalysisInfo) => {
        item.expanded = false;
        item.children?.map((children: AnalysisInfo) => {
          children.expanded = false;
        });
      });
      newInfo.map((item: AnalysisInfo) => {
        if (item.fraction !== undefined && item.fraction !== null && item.fraction < 80) {
          item.expanded = true;
        }
        item.children?.map((children: AnalysisInfo) => {
          children.children?.map((grandson: AnalysisInfo) => {
            if (grandson.fraction !== undefined && grandson.fraction !== null && grandson.fraction < 80) {
              children.expanded = true;
            }
          });
        });
      });
      analysisInfo.value = newInfo;
    };
    // 切换状态
    const changeStatus = (): void => {
      const newInfo = [...analysisInfo.value];
      newInfo.map((item: AnalysisInfo) => {
        item.analysisStatus = "Analyzed";
        item.children?.map((children: AnalysisInfo) => {
          children.analysisStatus = "Analyzed";
          children.children?.map((grandson: AnalysisInfo) => {
            grandson.analysisStatus = "Analyzed";
          });
        });
      });
      analysisInfo.value = newInfo;
    };
    const updateLength = (): void => {
      const item = analysisInfo.value[itemIndex.value];
      const children = toArray(item?.children);
      const child = children[childrenIndex.value];
      childrenLength.value = children.length;
      grandsonLength.value = toArray(child?.children).length;
      itemLength.value = analysisInfo.value.length;
    };
    const analysisMethods = async (): Promise<void> => {
      if (!requesting.value) {
        return;
      }
      if (itemLength.value === 0 || itemIndex.value >= itemLength.value) {
        getAlarmsScoreMethods();
        return;
      }
      if (itemLength.value !== 0 && grandsonLength.value !== 0 && childrenLength.value !== 0) {
        const item = analysisInfo.value[itemIndex.value];
        const children = toArray(item?.children);
        const child = children[childrenIndex.value];
        const grandson = toArray(child?.children);
        if (item && child && grandson.length > 0) {
          // 状态改变
          if (step.value === 1) {
            analysisInfo.value[itemIndex.value].analysisStatus = "Analyzing";
            child.analysisStatus = "Analyzing";
            grandson[grandsonIndex.value].analysisStatus = "Analyzing";
          } else {
            grandson[grandsonIndex.value].analysisStatus = "AIAnalyzing";
          }

          analysisInfo.value[itemIndex.value].expanded = true;
          child.expanded = true;

          queryData.value.itemCodeConcat = grandson[grandsonIndex.value]?.code ?? "";
          // 计算进度与分析项目
          if (analysisInfo.value[itemIndex.value].code) {
            analysisHeaderData.value.title = `${item.name}-${child.name}-${grandson[grandsonIndex.value].name}`;
          }
          analysisHeaderData.value.value = `${(itemIndex.value / itemLength.value) * 100 + (childrenIndex.value / childrenLength.value) * 10 + (grandsonIndex.value + 1) / grandsonLength.value}%`;
          await analysisRequest();
        }
      } else if (childrenLength.value === 0) {
        queryData.value.itemCodeConcat = analysisInfo.value[itemIndex.value]?.code ?? "";
        resetInternalNum.value = 0;
        try {
          resetInternalNum.value += 1;
          await getAppScore();
        } catch {
          if (!requesting.value) {
            return;
          }
          if (resetInternalNum.value === 3) {
            message.error("分析失败，请重试");
            analysisClick();
          } else {
            getAppScore();
          }
        }
      } else if (grandsonLength.value === 0) {
        childrenIndex.value += 1;
        if (childrenLength.value > childrenIndex.value) {
          updateLength();
          analysisMethods();
        } else if (childrenIndex.value === childrenLength.value) {
          childrenIndex.value = 0;
          queryData.value.itemCodeConcat = analysisInfo.value[itemIndex.value]?.code ?? "";
          resetInternalNum.value = 0;
          try {
            resetInternalNum.value += 1;
            await getAppScore();
          } catch {
            if (!requesting.value) {
              return;
            }
            if (resetInternalNum.value === 3) {
              message.error("分析失败，请重试");
              analysisClick();
            } else {
              getAppScore();
            }
          }
        }
      }
    };

    const analysisRequest = async (): Promise<void> => {
      try {
        resetNum.value += 1;
        let res;
        let content;
        let suggestion;
        if (step.value === 1) {
          res = await cubeSafetyManagementAnalysisService.getCalculateMetricScore(queryData.value);
          content = await cubeSafetyManagementAnalysisService.getCalculateMetricContent(queryData.value);
        } else {
          suggestion = await cubeSafetyManagementAnalysisService.getCalculateRuleAI(queryData.value);
        }
        if (step.value === 1) {
          analysisResultInfo.value.projectItem = analysisResultInfo.value.projectItem + 1;
        }
        resetNum.value = 0;
        const children = toArray(analysisInfo.value[itemIndex.value]?.children);
        const grandson = toArray(children[childrenIndex.value]?.children);

        if (grandson.length > 0) {
          grandson[grandsonIndex.value].analysisStatus = "Analyzed";
          if (step.value === 1) {
            dataChange(grandson[grandsonIndex.value], res, content);
          } else {
            grandson[grandsonIndex.value].title = suggestion?.suggestion ?? "";
          }
          updateLength();
        }
        if (grandsonIndex.value !== grandsonLength.value - 1) {
          grandsonIndex.value += 1;
          analysisMethods();
        } else {
          grandsonIndex.value = 0;
          if (childrenIndex.value !== childrenLength.value) {
            const child = children[childrenIndex.value];
            if (child) {
              queryData.value.itemCodeConcat = child.code ?? "";
              try {
                resetInternalNum.value += 1;
                await getChildScore();
              } catch {
                if (!requesting.value) {
                  return;
                }
                if (resetInternalNum.value === 3) {
                  message.error("分析失败，请重试");
                  analysisClick();
                } else {
                  getChildScore();
                }
              }
            }
          }
        }
      } catch {
        if (!requesting.value) {
          return;
        }
        if (resetNum.value === 3) {
          message.error("分析失败，请重试");
          analysisClick();
        } else {
          resetNum.value += 1;
          analysisMethods();
        }
      }
    };
    // 数据转换
    const dataChange = (grandsonInfo: AnalysisInfo, res?: ScoreTemplate, content?: RuleTemplate): void => {
      grandsonInfo.fraction = res?.score ?? 0;
      grandsonInfo.data = makeDom(content?.contentTemplate ?? "", content?.contentVariables ?? {}, content?.topicConcat ?? "");
      grandsonInfo.displayCharts = buildDisplayMetricCharts(content);
      grandsonInfo.displayTexts = buildDisplayMetricTexts(content);
      const fraction = res?.score;
      if (fraction !== undefined && fraction !== null && fraction < 80) {
        analysisResultInfo.value.errorNumber = analysisResultInfo.value.errorNumber + 1;
      }
    };
    onMounted(() => {
      analysisRestClick();
    });
    return (): JSX.Element => (
      <div class={[style["analysis-body"], props.embedded ? style["analysis-body-embedded"] : ""]}>
        <div class={style["analysis-body-header"]}>
          <div class={analysisResultInfo.value.status === "Analyzing" ? style["animation"] : style["notAnimation"]}>
            <img src={analysisLoading} alt="" />
          </div>
          <div class={style["analysis-body-header-text-main"]}>
            <div class={style["analysis-body-header-text-main-text"]}>
              {(analysisResultInfo.value.status === "Analyzing" || analysisResultInfo.value.status === "AIAnalyzing") && (
                <>
                  {step.value === 1 ? (
                    <span>
                      {" "}
                      <span>(1/2)</span> 安全分析中...
                    </span>
                  ) : (
                    <span>
                      {" "}
                      <span>(2/2)</span> AI诊断中...
                    </span>
                  )}
                  {step.value === 1 ? (
                    <Button type="primary" onClick={analysisClick} class={style["security-analysis-btn"]}>
                      取消分析
                    </Button>
                  ) : (
                    <Button type="primary" onClick={analysisClick} class={style["security-analysis-btn"]}>
                      取消诊断
                    </Button>
                  )}
                </>
              )}

              {analysisResultInfo.value.status === "Analyzed" && (
                <>
                  <span>
                    共分析
                    <span style={{ color: "#3fbe53", fontSize: "45px", fontWeight: "bold", lineHeight: "30px" }}>
                      {analysisResultInfo.value.projectItem}
                    </span>
                    项,发现
                    <span
                      class={style["security-analysis-title-result-text"]}
                      style={{
                        color: analysisResultInfo.value.errorNumber > 0 ? "red" : "#3fbe53",
                        fontSize: "45px",
                        fontWeight: "bold",
                        lineHeight: "30px",
                      }}
                    >
                      {analysisResultInfo.value.errorNumber}
                    </span>
                    项问题，分析得分
                    <span style={{ color: analysisResultInfo.value.color, fontSize: "45px", fontWeight: "bold" }}>
                      {analysisResultInfo.value.score}
                    </span>
                    分{" "}
                  </span>
                  <div class={style["security-analysis-result-button"]}>
                    <Button type="link" onClick={analysisRestClick} class={style["security-analysis-link-btn"]}>
                      重新分析
                    </Button>
                    {step.value === 1 && (
                      <Button
                        type="primary"
                        onClick={analysisAIClick}
                        class={style["security-analysis-btn"]}
                        style={{ marginRight: "20px" }}
                      >
                        {interrupt.value ? "继续诊断" : "AI诊断"}
                      </Button>
                    )}
                    <Button type="primary" onClick={analysisPdfClick} class={style["security-analysis-btn"]} loading={buttonLoading.value}>
                      获取报告
                    </Button>
                  </div>
                </>
              )}
            </div>
            {analysisResultInfo.value.suggestion && (
              <div class={style["analysis-body-header-text-main-suggestion"]}>
                AI建议: <span>{analysisResultInfo.value.suggestion}</span>
              </div>
            )}
            <div class={style["analysis-body-header-text-main-progress"]}>
              {(analysisResultInfo.value.status === "Analyzing" || analysisResultInfo.value.status === "AIAnalyzing") && (
                <span>
                  正在{step.value === 1 ? "分析" : "诊断"}：{analysisHeaderData.value.title}
                </span>
              )}
              {analysisResultInfo.value.status === "Analyzed" && (
                <>
                  <span>
                    分析范围: {dayjs(queryData.value.period.split(",")[0]).format("YYYY-MM-DD ")} -{" "}
                    {dayjs(queryData.value.period.split(",")[1]).format("YYYY-MM-DD")}
                  </span>
                  <span style={{ marginLeft: "30px" }}>分析时间: {analysisResultInfo.value.time}</span>
                </>
              )}
              {(analysisResultInfo.value.status === "Analyzing" || analysisResultInfo.value.status === "AIAnalyzing") && (
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
        <div class={style["analysis-body-main"]}>
          <AnalysisComponents data={analysisInfo.value} currentKey={itemIndex.value} />
        </div>
        <div class={style["analysis-body-pdf-body-main"]}>
          <div ref={pdf} class={style["analysis-body-pdf-hidden"]}>
            <AnalysisDownload requestId={props.requestId} data={pdfData.value} originalData={props.originalData} />
          </div>
        </div>
      </div>
    );
  },
});

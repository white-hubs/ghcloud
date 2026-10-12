import { Modal } from "ant-design-vue";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";

import type { HistoryScore, RuleLibraries } from "@ghcloud/cube-safety-management-service/src/type.ts";
import { Button, message, PopOver, Table } from "@ghcloud/cube-ui";
import { Layout } from "@ghcloud/generic-component";

import { cubeSafetyManagementAnalysisService } from "../../../api/server.ts";
import { DateSelect } from "../../../components/date-select/date-select.tsx";
import { Analysis } from "../components/analysis/analysis.tsx";
import { AnalysisView } from "../components/analysis/analysisView.tsx";
import type { AnalysisInfo } from "../components/analysis/type.ts";
import { RadarScan } from "../components/radar-scan/radar-scan.tsx";

import styles from "./security-analysis-report.module.less";
interface Props {
  otherHeight?: number;
}
export const SecurityAnalysisReport = defineComponent({
  props: ["otherHeight"],
  setup(props: Props) {
    // const marketApp = window.location.pathname.includes('safety-manage-head')
    const otherHeight = 86;
    const screenHeight = ref<number>(window.innerHeight);
    onMounted(() => {
      window.addEventListener("resize", updateHeight);
    });
    const originalData = ref();
    const step = ref(1);
    const requestId = ref("");
    const searchDate = ref<[string, string]>([dayjs().startOf("month").format("YYYY-MM-DD"), dayjs(new Date()).format("YYYY-MM-DD")]);
    const showDateModal = ref(false);
    const tempSearchDate = ref<[string, string]>([dayjs().startOf("month").format("YYYY-MM-DD"), dayjs(new Date()).format("YYYY-MM-DD")]);

    const analysisClick = (): void => {
      showDateModal.value = true;
    };

    const confirmAnalysis = (): void => {
      searchDate.value = [...tempSearchDate.value];
      requestId.value = Date.now() + Math.random().toString(36).substring(2, 9);
      step.value = 2;
      showDateModal.value = false;
    };

    const cancelDateSelection = (): void => {
      showDateModal.value = false;
      tempSearchDate.value = [...searchDate.value];
    };
    const updateHeight = (): void => {
      screenHeight.value = window.innerHeight;
    };
    const loading = ref(false);
    const queryData = ref({
      pageSize: 10,
      pageNumber: 1,
      keyword: "",
    });
    const viewReportData = ref();
    const historyReportList = ref<HistoryScore[]>([]);
    const viewTitle = ref();
    // 获取报告列表
    const getAlarmsListMethods = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await cubeSafetyManagementAnalysisService.getAlarmsList(queryData.value);
        if (res) {
          const records = Array.isArray(res.records) ? res.records : [];
          if (records.length > 5) {
            historyReportList.value = records.slice(0, 5);
          } else {
            historyReportList.value = records;
          }
        }
      } catch {
        message.error("获取失败");
      } finally {
        loading.value = false;
      }
    };
    const getTreeData = async (): Promise<void> => {
      try {
        const data = await cubeSafetyManagementAnalysisService.getRuleLibrariesList();
        changeTreeData(Array.isArray(data) ? data : []);
      } catch {
      } finally {
      }
    };
    const changeTreeData = (data: RuleLibraries[]): void => {
      const newTreeData = convertToTreeData(Array.isArray(data) ? data : []);
      // 筛选子项和孙子项，判断 level === 3 的项是否存在
      const filteredData = newTreeData.filter((item) => {
        if (item.children) {
          item.children = item.children.filter((child) => {
            if (child.children) {
              return child.children.some((grandchild) => grandchild.level === 3);
            }
            return false;
          });
          return item.children.length > 0;
        }
        return false;
      });
      originalData.value = filteredData;
    };
    const convertToTreeData = (items: RuleLibraries[]): AnalysisInfo[] => {
      return (Array.isArray(items) ? items : []).map((item: RuleLibraries) => {
        const treeNode: AnalysisInfo = {
          analysisStatus: "ToBeAnalyzed",
          name: item.itemName,
          expanded: false,
          code: item.itemCodeConcat ?? "",
          metric: item.itemCode ?? "",
          data: "",
          level: item.level ?? 0,
        };

        // 递归处理子节点
        if (item.children && item.children.length > 0) {
          treeNode.children = convertToTreeData(item.children);
        }

        return treeNode;
      });
    };
    onMounted(() => {
      getTreeData();
      window.addEventListener("resize", updateHeight);
      getAlarmsListMethods();
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateHeight);
    });
    const columns = [
      {
        title: "报告名称",
        align: "center",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "生成时间",
        align: "center",
        dataIndex: "createTime",
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        align: "center",
        dataIndex: "action",
        customRender: ({ record }: { record: HistoryScore }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  viewReportData.value = record;
                  viewTitle.value = record.name;
                  step.value = 3;
                }}
              >
                查看
              </Button>
            </>
          );
        },
      },
    ];
    const layoutViewSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <AnalysisView
              data={viewReportData.value}
              originalData={originalData.value}
              style={{
                height: `${props.otherHeight ? screenHeight.value * 0.8 - 145 : screenHeight.value - 200}px`,
                overflowY: "auto",
                backgroundColor: "#fff",
              }}
              onCancel={() => {
                step.value = 1;
              }}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Button
            onClick={() => {
              step.value = 1;
            }}
          >
            返回
          </Button>
        );
      },
    };
    return (): JSX.Element => (
      <div class={styles["security-analysis-body"]}>
        {step.value === 1 && (
          <div
            class={props.otherHeight ? "security-analysis-embedded-surface" : undefined}
            style={{
              height: `${props.otherHeight ? screenHeight.value * 0.8 - props.otherHeight : screenHeight.value - otherHeight - 10}px`,
              backgroundColor: props.otherHeight ? "transparent" : "#fff",
            }}
          >
            <div class={styles["security-analysis-content"]}>
              <div class={styles["security-analysis-cards-header"]}>
                <RadarScan class={styles["security-analysis-cards-main"]} />
              </div>
              <div class={styles["security-analysis-title-header"]}>
                <div class={styles["security-analysis-header"]}>
                  <div class={styles["security-analysis-title"]}>多维问题监测，全域安全守护</div>
                  <Button type="primary" onClick={analysisClick} class={styles["security-analysis-btn"]}>
                    安全分析
                  </Button>
                </div>

                <div class={styles["security-analysis-cards"]}>
                  <div class={styles["security-analysis-card"]}>
                    <div class={styles["card-icon"] + " " + styles["person-icon"]}></div>
                    <div class={styles["card-content"]}>
                      <div class={styles["card-header"]}>
                        <div class={styles["card-title"]}>人员协同</div>
                      </div>
                      <div class={styles["card-content"]}>持续跟进员工处理情况，发现人员协同零死角</div>
                    </div>
                  </div>
                  <div class={styles["security-analysis-card"]}>
                    <div class={styles["card-icon"] + " " + styles["device-icon"]}></div>
                    <div class={styles["card-content"]}>
                      <div class={styles["card-header"]}>
                        <div class={styles["card-title"]}>物联防线</div>
                      </div>
                      <div class={styles["card-content"]}>全链路检测设备安全，力争物联防线无漏洞。</div>
                    </div>
                  </div>
                  <div class={styles["security-analysis-card"]}>
                    <div class={styles["card-icon"] + " " + styles["security-icon"]}></div>
                    <div class={styles["card-content"]}>
                      <div class={styles["card-header"]}>
                        <div class={styles["card-title"]}>安全屏障</div>
                      </div>
                      <div class={styles["card-content"]}>多维度预警安全隐患，构建园区安全壁垒。</div>
                    </div>
                  </div>
                  <div class={styles["security-analysis-card"]}>
                    <div class={styles["card-icon"] + " " + styles["dashboard-icon"]}></div>
                    <div class={styles["card-content"]}>
                      <div class={styles["card-header"]}>
                        <div class={styles["card-title"]}>智慧中枢</div>
                      </div>
                      <div class={styles["card-content"]}>集中分析安全数据，驱动安全智能化管控升级</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class={styles["history-report-title"]}>历史报告</div>

            <Table
              rowKey="requestId"
              columns={columns}
              loading={loading.value}
              dataSource={historyReportList.value}
              pagination={false}
              size="middle"
            />

            {/* <div class={styles["history-report"]} >
            <Spin spinning={loading.value}>
              {
                historyReportList.value.map((item: HistoryScore, key: number)=>{
                  return (
                    <div class={styles["history-report-content"]} key={key}>
                      <div class={styles["history-report-content-body"]}>
                        {item.name}
                      </div>
                      <div class={styles["history-report-content-operate"]} onClick={ ()=>{
                        viewReportData.value = item
                        viewTitle.value = item.name
                        step.value = 3
                      }}>
                        <img src={downloadImg} alt="" />
                        {`查看报告>>`}
                      </div>
                    </div>
                  )
                })
              }
            </Spin>
          </div> */}
          </div>
        )}
        {step.value === 2 && (
          <div
            class={props.otherHeight ? "security-analysis-embedded-surface" : undefined}
            style={{
              height: `${props.otherHeight ? screenHeight.value * 0.8 - props.otherHeight : screenHeight.value - otherHeight}px`,
              overflow: props.otherHeight ? "hidden" : "auto",
              backgroundColor: props.otherHeight ? "transparent" : "#fff",
            }}
          >
            <Analysis
              embedded={Boolean(props.otherHeight)}
              requestId={requestId.value}
              originalData={originalData.value}
              timer={searchDate.value}
              style={props.otherHeight ? undefined : { height: "100%", backgroundColor: "#fff" }}
              onCancel={() => {
                step.value = 1;
              }}
            />
          </div>
        )}
        {step.value === 3 && <Layout title={viewTitle.value ?? "安全分析报告"} v-slots={layoutViewSlots} />}

        {/* 时间选择弹窗 */}
        <Modal
          title="选择分析时间"
          visible={showDateModal.value}
          onCancel={cancelDateSelection}
          wrapClassName="security-analysis-modal"
          getContainer={false}
          centered
          footer={[
            <Button key="cancel" onClick={cancelDateSelection}>
              取消
            </Button>,
            <Button key="confirm" type="primary" onClick={confirmAnalysis}>
              开始分析
            </Button>,
          ]}
          // width={600}
        >
          <div style={{ padding: "0px 0", display: "flex", justifyContent: "center", gap: "16px" }}>
            <DateSelect
              onChange={(value: [Dayjs, Dayjs]) => {
                tempSearchDate.value = [value[0].format("YYYY-MM-DD"), value[1].format("YYYY-MM-DD")];
              }}
            />
          </div>
        </Modal>
      </div>
    );
  },
});

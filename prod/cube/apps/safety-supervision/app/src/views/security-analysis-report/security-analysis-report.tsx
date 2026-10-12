import dayjs from "dayjs";
import { defineComponent, nextTick, onMounted, reactive, ref } from "vue";

import type { HistoryScore } from "@ghcloud/cube-safety-management-service";
import { Button, Form, FormItem, Input, Page, PopOver, Table, message } from "@ghcloud/cube-ui";
import {
  downloadPDFWithoutTextBreak,
  downloadMultiplePDFsWithoutTextBreakAsZip,
  usePageName,
  useListQueryCache,
} from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { AnalysisDownload } from "../security-analysis/components/analysis/analysisDownload";
import { AnalysisView } from "../security-analysis/components/analysis/analysisView";
import type { AnalysisInfo } from "../security-analysis/components/analysis/type";
import { cubeDictionaryService, cubeSafetyManagementAnalysisService } from "@/api/server";
import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/monthly-report.less";

import analysisStyle from "../security-analysis/components/analysis/analysis.module.less";
interface TreeDataItem {
  itemCode: string;
  itemCodeConcat: string;
  itemName: string;
  itemType: string;
  subItems?: TreeDataItem[];
  describe?: string;
  weightAllot?: string;
}
export const SecurityAnalysisReport = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const formState = reactive({
      keyword: "",
    });
    const columns = [
      {
        title: "序号",
        align: "center",
        width: 70,
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "标题",
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
                  preview(record);
                }}
              >
                查看
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  download(record);
                }}
              >
                导出
              </Button>
            </>
          );
        },
      },
    ];
    const step = ref(1);
    const screenHeight = ref<number>(window.innerHeight);
    const viewReportData = ref();
    const downloadView = ref(false);
    const pdf = ref();
    const loading = ref(false);
    const viewTitle = ref();
    const selectedRowData = ref<HistoryScore[]>([]);
    const dataSource = ref<HistoryScore[]>([]);
    const originalData = ref();
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const queryCache = useListQueryCache({
      defaults: {
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        keyword: formState.keyword,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        formState.keyword = (next.keyword ?? "") as string;
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const selectedRowKeys = ref<string[]>([]);
    const updateHeight = (): void => {
      screenHeight.value = window.innerHeight;
    };
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const { records, total } = await cubeSafetyManagementAnalysisService.getAlarmsList({
          keyword: formState.keyword,
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
        });
        pagination.value.total = total;
        dataSource.value = records;
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const preview = async (record: HistoryScore): Promise<void> => {
      //
      viewReportData.value = record;
      viewTitle.value = record.name;
      step.value = 2;
    };
    const download = async (record: HistoryScore): Promise<void> => {
      viewReportData.value = record;
      downloadView.value = true;
      nextTick(() => {
        analysisDownload();
      });
    };
    const analysisDownload = async (): Promise<void> => {
      loading.value = true;
      await downloadPDFWithoutTextBreak(pdf.value, viewReportData.value.name);
      loading.value = false;
    };
    const downloadLoading = ref(false);

    const batchDownload = async (): Promise<unknown> => {
      if (selectedRowData.value.length === 0) {
        return message.warn("请选择需要导出的内容");
      }
      downloadLoading.value = true;

      const itemsToExport = selectedRowData.value.map((item: HistoryScore) => {
        return {
          fileName: item.name,
          data: item,
        };
      });
      const validItemsToExport = itemsToExport.filter((item) => item !== null) as { fileName: string; data: HistoryScore }[];

      if (validItemsToExport.length === 0) {
        message.warn("没有可成功获取数据的报告用于导出。");
        downloadLoading.value = false;
        return;
      }

      // 定义更新 DOM 的函数
      const updateDomWithData = async (domElement: HTMLElement, reportData: HistoryScore): Promise<void> => {
        return new Promise((resolve) => {
          viewReportData.value = reportData;
          nextTick(() => {
            // 确保 AnalysisDownload 组件已经用新的数据渲染完成
            // 您可能需要更可靠的方式来确认渲染完成，例如 AnalysisDownload 内部发出一个事件
            setTimeout(resolve, 500); // 简单的延时，根据实际渲染时间调整
          });
        });
      };

      if (!pdf.value) {
        message.error("PDF 渲染容器未找到！");
        downloadLoading.value = false;
        return;
      }

      try {
        await downloadMultiplePDFsWithoutTextBreakAsZip(
          pdf.value, // 将用于渲染每个报告的 DOM 元素
          validItemsToExport,
          updateDomWithData,
          "安全分析报告合集", // ZIP 文件名
        );
      } catch {
        message.error("批量导出 PDF 失败，请查看控制台了解详情。");
      } finally {
        viewReportData.value = null;
        downloadLoading.value = false;
      }
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };

    const queryForm = async (): Promise<void> => {
      pagination.value.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    const { scorllY } = useTableScroll();
    const selectionChange = (keys: string[], selectedRows: HistoryScore[]): void => {
      selectedRowKeys.value.length = 0;
      selectedRowData.value.length = 0;
      selectedRowKeys.value.push(...keys);
      selectedRowData.value.push(...selectedRows);
    };
    const getTreeData = async (): Promise<void> => {
      try {
        const data = await cubeDictionaryService.getDictionaryByItem({
          itemCode: "SERVICE_CONFIGURATION",
          code: "SAFETY_REPORT_SCORE_RULES",
        });
        if (data && data.length) {
          let realData = JSON.parse(data[0].variable).scoreItems;
          changeTreeData(realData);
        }
      } catch {
      } finally {
      }
    };
    const changeTreeData = (data: TreeDataItem[]): void => {
      const newTreeData = convertToTreeData(data);
      originalData.value = newTreeData;
    };
    const convertToTreeData = (items: TreeDataItem[]): AnalysisInfo[] => {
      return items?.map((item: TreeDataItem) => {
        const treeNode: AnalysisInfo = {
          analysisStatus: "ToBeAnalyzed",
          name: item.itemName,
          expanded: false,
          code: item.itemCodeConcat,
          metric: item.itemCode,
          data: "",
        };

        // 递归处理子节点
        if (item.subItems && item.subItems.length > 0) {
          treeNode.children = convertToTreeData(item.subItems);
        }

        return treeNode;
      });
    };
    onMounted(() => {
      window.addEventListener("resize", updateHeight);
      void queryCache.hydrateAndQuery(getTableData);
      getTreeData();
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "16px 0" }}>
              <FormItem class="search-item">
                <Input v-model:value={formState.keyword} placeholder="请输入标题" showCount={false} />
              </FormItem>
              <FormItem class="search-item">
                <Button type="primary" onClick={queryForm}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={reset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <Table
              rowKey="requestId"
              rowSelection={{ selectedRowKeys, selectedRowData, onChange: selectionChange }}
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              size="middle"
              scrollY={scorllY.value}
            />
          </>
        );
      },
      "layout-header": (): JSX.Element => {
        return (
          <Button loading={downloadLoading.value} type="primary" onClick={batchDownload}>
            批量导出
          </Button>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    const layoutViewSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <AnalysisView
              data={viewReportData.value}
              originalData={originalData.value}
              style={{ height: `${screenHeight.value - 200}px`, overflowY: "auto", backgroundColor: "#fff" }}
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
      <>
        {step.value === 1 ? (
          <>
            {" "}
            <Layout title={pageTitle ?? "安全分析报告"} v-slots={layoutSlots} />
            <div ref={pdf} class={analysisStyle["analysis-body-pdf-hidden"]}>
              {downloadView.value && <AnalysisDownload data={viewReportData.value} originalData={originalData.value} />}
            </div>
          </>
        ) : (
          <Layout title={viewTitle.value ?? "安全分析报告"} v-slots={layoutViewSlots} />
        )}
      </>
    );
  },
});

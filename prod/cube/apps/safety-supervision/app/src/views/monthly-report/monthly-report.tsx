import axios from "axios";
import dayjs from "dayjs";
import JSZip from "jszip";
import { defineComponent, onMounted, reactive, ref } from "vue";

import { Button, Form, FormItem, Input, Modal, Page, PopOver, Table, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { getExcelFileObjet, initExcel } from "../all/components/excel-head-hook";
import { loadLuckysheet } from "../all/components/luckysheet-loader";
import { getAllMarketListByReportId, getMarketListByReportIdNonWindUp, getMarketListByReportIdWindUp, queryByPage } from "@/api/report";
import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/monthly-report.less";

export const MonthlyReport = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const formState = reactive({
      keyword: "",
    });
    const showCountModal = ref(false);
    const modalLoading = ref(false);
    const modalType = ref("");
    const modalTitle = ref("");
    const modalDataSource = ref([]);
    const openModal = async (type: string, monthlyReportId: string): Promise<void> => {
      showCountModal.value = true;
      modalType.value = type;
      if (type === "all") {
        modalTitle.value = "汇总市场列表";
      } else if (type === "windUp") {
        modalTitle.value = "已上报市场列表";
      } else {
        modalTitle.value = "未上报市场列表";
      }
      modalDataSource.value = [];
      try {
        modalLoading.value = true;
        if (type === "all") {
          const { data } = await getAllMarketListByReportId(monthlyReportId);
          modalDataSource.value = data as unknown as never[];
        } else if (type === "windUp") {
          const { data } = await getMarketListByReportIdWindUp(monthlyReportId);
          modalDataSource.value = data as unknown as never[];
        } else {
          const { data } = await getMarketListByReportIdNonWindUp(monthlyReportId);
          modalDataSource.value = data as unknown as never[];
        }
      } catch {
      } finally {
        modalLoading.value = false;
      }
    };
    const modalColumns = [
      {
        title: "序号",
        width: 100,
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "公司名称",
        dataIndex: "marketName",
        width: 400,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "上报人",
        dataIndex: "reportUserName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "上报时间",
        dataIndex: "reportTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const res = text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "--";
          return <PopOver content={res || "--"}>{res || "--"}</PopOver>;
        },
      },
    ];
    const columns = [
      {
        title: "序号",
        align: "center",
        width: 100,
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "标题",
        align: "center",
        dataIndex: "title",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "状态",
        align: "center",
        dataIndex: "status",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text === "NOT_STARTED" ? "未完成" : "已完成填报"}>{text === "NOT_STARTED" ? "未完成" : "已完成填报"}</PopOver>
        ),
      },
      {
        title: "汇总市场数",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: any }): JSX.Element => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              openModal("all", record.id);
            }}
          >
            {record.reportStatistics.marketCount}
          </Button>
        ),
      },
      {
        title: "已上报市场",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: any }): JSX.Element => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              openModal("windUp", record.id);
            }}
          >
            {record.reportStatistics.windUpCount}
          </Button>
        ),
      },
      {
        title: "未上报市场",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: any }): JSX.Element => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              openModal("nonWindUp", record.id);
            }}
          >
            {record.reportStatistics.nonWindUpCount}
          </Button>
        ),
      },
      {
        title: "操作",
        align: "center",
        dataIndex: "action",
        customRender: ({ record }: { record: { reportUrl: string; title: string; id: string; monthDate: number } }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                viewReport(record);
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
        ),
      },
    ];

    const loading = ref(false);
    const selectedRowData = ref<any>([]);
    const dataSource = ref<unknown[]>([]);
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
        formState.keyword = (next.keyword as string) ?? "";
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const selectedRowKeys = ref<string[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res: any = await queryByPage({
          keyword: formState.keyword,
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
        });
        pagination.value.total = res.data.total;
        dataSource.value = res.data.records;
        console.log(dataSource.value, "dataSource.valuedataSource.value");
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const viewReport = (record: { id: string; title: string; monthDate: number }): void => {
      window.open(`/apps/safety-manage-head/excel-viewer?type=head&id=${record.id}&title=${record.title}&monthDate=${record.monthDate}`);
    };
    const download = (record: { id: string; title: string; monthDate: number }): void => {
      window.open(
        `/apps/safety-manage-head/excel-viewer?type=head&id=${record.id}&title=${record.title}&download=true&monthDate=${record.monthDate}`,
      );
    };
    const batchDownload = async (): Promise<void> => {
      if (selectedRowData.value.length === 0) {
        message.warn("请选择需要导出的内容!");
        return;
      }

      const zip = new JSZip();
      message.loading("导出中", 0);
      try {
        await loadLuckysheet();
        const reports = await Promise.all(
          selectedRowData.value.map(async (record: { id: string; title: string; monthDate: string }) => {
            const { data } = await axios.get<{ title: string; reportData: string; marketName: string }[]>(
              `/api/safety-management/public/market-monthly-reports/wind-up/${record.id}/by-monthly-report`,
            );
            const marketData = data
              .filter((element) => Boolean(element.reportData))
              .map((element) => ({
                marketName: element.marketName || element.title,
                marketData: JSON.parse(element.reportData),
              }));
            return { record, marketData };
          }),
        );

        // Luckysheet 使用全局单例，必须逐份创建并导出，避免批量任务互相覆盖。
        for (const { record, marketData } of reports) {
          initExcel(record.title, marketData, record.monthDate);
          await new Promise<void>((resolve) => {
            globalThis.setTimeout(resolve, 1500);
          });
          const file = await getExcelFileObjet(record.title);
          zip.file(`${file.name}.xlsx`, file);
        }

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "月报链接.zip";
        document.body.append(downloadLink);
        downloadLink.click();
        URL.revokeObjectURL(url);
        downloadLink.remove();
        message.destroy();
        message.success("导出成功");
      } catch (error) {
        console.error("批量导出失败", error);
        message.destroy();
        message.error("导出失败");
      }
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => {
        queryCache.sync();
      });
    };

    const handleSearch = async (): Promise<void> => {
      pagination.value.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const handleReset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    const { scorllY } = useTableScroll();
    const selectionChange = (keys: string[], selectedRows: { id: string }[]): void => {
      selectedRowKeys.value.length = 0;
      selectedRowData.value.length = 0;
      selectedRowKeys.value.push(...keys);
      selectedRowData.value.push(...selectedRows);
    };
    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "16px 0" }}>
            <FormItem class="search-item">
              <Input v-model:value={formState.keyword} placeholder="请输入月报标题" showCount={false} />
            </FormItem>
            <FormItem class="search-item">
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={handleReset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <Table
            rowKey="id"
            rowSelection={{ selectedRowKeys, onChange: selectionChange }}
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            size="middle"
            scrollY={scorllY.value}
          />
        </>
      ),
      "layout-header": (): JSX.Element => (
        <Button type="link" size="small" onClick={batchDownload}>
          批量导出
        </Button>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={pagination.value.pageNumber}
          v-model:pageSize={pagination.value.pageSize}
          v-model:total={pagination.value.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        <div id="excel-dom" style={{ display: "none" }} />
        <Modal
          title={modalTitle.value}
          width="900px"
          v-model:visible={showCountModal.value}
          cancelButtonProps={{ style: { display: "none" } }}
          onOk={() => {
            showCountModal.value = false;
          }}
        >
          <Table columns={modalColumns} dataSource={modalDataSource.value} loading={modalLoading.value} size="small" />
        </Modal>
      </>
    );
  },
});

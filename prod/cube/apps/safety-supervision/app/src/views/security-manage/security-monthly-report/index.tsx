import dayjs from "dayjs";
import JSZip from "jszip";
import { defineComponent, onMounted, reactive, ref } from "vue";

import type { FileState } from "@ghcloud/cube-file-service";
import type { AlarmSecurityReportVO } from "@ghcloud/cube-safety-management-service";
import { Button, Form, FormItem, Input, Page, PopOver, Table, message } from "@ghcloud/cube-ui";
import { kkFilePreview, useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { cubeFileService, cubeSafetyManagementStatService } from "@/api/server";
import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/monthly-report.less";

export const SecurityMonthlyReport = defineComponent({
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
        customRender: ({ record }: { record: AlarmSecurityReportVO }): JSX.Element => {
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

    const loading = ref(false);
    const selectedRowData = ref<AlarmSecurityReportVO[]>([]);
    const dataSource = ref<AlarmSecurityReportVO[]>([]);
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
        const { records, total } = await cubeSafetyManagementStatService.getSecurityReportPage({
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

    const preview = async (record: AlarmSecurityReportVO): Promise<void> => {
      if (!record.fileId) return message.warn("附件不存在");
      const file: FileState = await cubeFileService.getFileInfo(record.fileId as unknown as string);
      if (!file?.path) return message.warn("附件不存在");
      file.name = `${record.name}.${file.type}`;
      kkFilePreview(file);
    };
    const download = async (record: AlarmSecurityReportVO): Promise<void> => {
      if (!record.fileId) return message.warn("附件不存在");
      const file: FileState = await cubeFileService.getFileInfo(record.fileId as unknown as string);
      if (!file?.path) return message.warn("附件不存在");
      const fileName = `${record.name}.${file.type}`;
      await fetch(file?.path).then(async (res) =>
        res.blob().then((blob) => {
          const link = document.createElement("a");
          const url = window.URL.createObjectURL(blob);
          link.style.display = "none";
          link.href = url;
          link.setAttribute("download", fileName ?? "安全报告附件下载");
          document.body.appendChild(link);
          link.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }),
      );
    };
    const downloadLoading = ref(false);
    const batchDownload = async (): Promise<unknown> => {
      if (selectedRowData.value.length === 0) {
        return message.warn("请选择需要导出的内容");
      }
      downloadLoading.value = true;
      const zip = new JSZip();
      try {
        const taskList = selectedRowData.value.map(async (record, index) => {
          return new Promise((resolve) => {
            cubeFileService.getFileInfo(record.fileId as unknown as string).then(async (file: FileState) => {
              if (!file?.path) return message.warn("附件不存在");
              const curIndex = selectedRowData.value.findIndex((f) => f.name === record.name);
              const fileName = `${record.name}${curIndex === index ? "" : index + 1}.${file.type}`;
              fetch(file?.path).then(async (res) =>
                res.blob().then((blob) => {
                  zip.file(fileName, blob);
                  resolve(file);
                }),
              );
            });
          });
        });
        await Promise.all(taskList).then(() => {
          zip.generateAsync({ type: "blob" }).then((content) => {
            const zipFile = new Blob([content]);
            const url = window.URL.createObjectURL(zipFile);
            const link = document.createElement("a");
            link.href = url;
            link.download = "安全报告.zip";
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            downloadLoading.value = false;
          });
        });
      } catch (error) {
        downloadLoading.value = false;
        message.error((error as { errorMessage: string })?.errorMessage ?? "导出失败");
      }
      setTimeout(() => {
        downloadLoading.value = false;
      }, 2000);
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
    const selectionChange = (keys: string[], selectedRows: AlarmSecurityReportVO[]): void => {
      selectedRowKeys.value.length = 0;
      selectedRowData.value.length = 0;
      selectedRowKeys.value.push(...keys);
      selectedRowData.value.push(...selectedRows);
    };
    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
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
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
    );
  },
});

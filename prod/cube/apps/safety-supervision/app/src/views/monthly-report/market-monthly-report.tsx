import axios from "axios";
import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";

import { Button, Form, FormItem, Input, Page, PopOver, Table, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/monthly-report.less";

export const MarketMonthlyReport = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const columns = [
      {
        title: "序号",
        width: 70,
        align: "center",
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "标题",
        dataIndex: "title",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "状态",
        align: "center",
        dataIndex: "statusName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "上报时间",
        dataIndex: "reportTime",
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        customRender: ({
          record,
        }: {
          record: {
            id: string;
            status: string;
            reportUrl: string;
            title: string;
          };
        }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                checkReport(record);
              }}
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                editReport(record);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                escalationData(record);
              }}
            >
              上报
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                exportData(record);
              }}
            >
              导出
            </Button>
          </>
        ),
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const sessionCode = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") as any).code;
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      keyword: "",
      total: 0,
      marketTenant: sessionCode,
    });
    const queryCache = useListQueryCache({
      defaults: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
        marketTenant: sessionCode,
      },
      getState: () => ({
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
        keyword: pagination.value.keyword,
      }),
      setState: (state) => {
        pagination.value.pageNumber = Number(state.pageNumber ?? 1);
        pagination.value.pageSize = Number(state.pageSize ?? 10);
        pagination.value.keyword = state.keyword ?? "";
      },
    });

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await axios.get("/api/centerApi/safety-management/public/market-monthly-report/queryByPage", {
          params: pagination.value,
        });
        const { data } = res;
        dataSource.value = data.records;
        pagination.value.total = data.total;
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };

    const checkReport = (record: { id: string; title: string }): void => {
      window.open(`/apps/safety-manage-head/excel-viewer/?type=market&id=${record.id}&title=${record.title}&readonly=true&from=market`);
    };
    const editReport = (record: { title: string; id: string }): void => {
      window.open(`/apps/safety-manage-head/excel-viewer/?type=market&id=${record.id}&title=${record.title}&from=market`);
    };

    const escalationData = async (record: { id: string }): Promise<void> => {
      try {
        loading.value = true;
        await axios.put(`/api/centerApi/safety-management/public/market-monthly-report/escalation/${record.id}`);
        message.success("上报成功");
      } catch (error) {
        const { response } = error as { response: { data: { message: string } } };
        message.error(response.data.message || "上报错误");
      } finally {
        loading.value = false;
        queryForm();
      }
    };
    const exportData = async (record: { id: string; title: string }): Promise<void> => {
      window.open(`/apps/safety-manage-head/excel-viewer/?type=market&id=${record.id}&title=${record.title}&download=true&from=market`);
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

    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={pagination.value.keyword} placeholder="请输入月报标题" showCount={false} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <Table
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            size="small"
            scrollY={scorllY.value}
          />
        </>
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
      </>
    );
  },
});

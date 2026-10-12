import axios from "axios";
import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { Button, Form, FormItem, Input, Page, PopOver, Table, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { PageOff } from "@/components/page-off/page-off";
import { useTableScroll } from "@/hook/use-table-scroll";
import { themeManager, antd3LegacyThemeManager } from "@/utils/theme";

import "@/styles/monthly-report.less";

/** 月报外链 */
export const MonthlyReport = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRoute();
    const { marketTenant, linkId } = router.query;

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
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "状态",
        align: "center",
        dataIndex: "statusName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
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
            reportExpired: boolean;
          };
        }): JSX.Element => {
          return (
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
                disabled={record.reportExpired}
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
          );
        },
      },
    ];
    const pageOff = ref(false);
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      keyword: "",
      total: 0,
      marketTenant,
    });

    const queryCache = useListQueryCache({
      defaults: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      },
      getState: () => ({
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
        keyword: pagination.value.keyword,
      }),
      setState: (next) => {
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
        pagination.value.keyword = (next.keyword as string) ?? "";
      },
    });

    const getTableData = (): Promise<void> => {
      loading.value = true;
      return axios("/api/safety-management/public/market-monthly-report/queryByPage", {
        params: {
          ...pagination.value,
        },
      })
        .then((res) => {
          const data = res.data;
          dataSource.value = data.records;
          pagination.value.total = data.total;
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };

    const checkReport = (record: { id: string; title: string }): void => {
      window.open(`/apps/safety-manage-head/excel-viewer/?type=market&id=${record.id}&title=${record.title}&readonly=true`);
    };
    const editReport = (record: { reportUrl: string; title: string; id: string }): void => {
      window.open(`/apps/safety-manage-head/excel-viewer/?type=market&id=${record.id}&title=${record.title}`);
    };

    /** 上报 */
    const escalationData = async (record: { id: string; reportExpired: boolean }): Promise<void> => {
      if (record.reportExpired) {
        message.warning("已过上报截止日期");
        return;
      }
      loading.value = true;
      await axios.put(`/api/safety-management/public/market-monthly-report/escalation/${record.id}`);
      message.success("上报成功");
      loading.value = false;
      queryForm();
    };

    const exportData = async (record: { id: string; title: string }): Promise<void> => {
      window.open(`/apps/safety-manage-head/excel-viewer/?type=market&id=${record.id}&title=${record.title}&download=true`);
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
      themeManager.mount();
      antd3LegacyThemeManager.mount();
      themeManager.use("极光绿");
      antd3LegacyThemeManager.use("极光绿");
      if (linkId) {
        const res = await axios(`/api/safety-management/public/market_month_report_url/${linkId}`).catch(() => {
          message.error("获取配置错误");
        });
        // @ts-ignore
        if (!res.data?.enabled) {
          pageOff.value = true;
        }
      }

      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
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
            <div id="excel-dom" style={{ display: "none" }} />
          </>
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
    return (): JSX.Element => <>{!pageOff.value ? <Layout title={pageTitle} v-slots={layoutSlots} /> : <PageOff />}</>;
  },
});

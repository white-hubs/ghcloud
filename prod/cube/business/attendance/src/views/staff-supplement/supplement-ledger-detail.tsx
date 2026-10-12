import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Table, message } from "@ghcloud/cube-ui";
import { useListQueryCache } from "@ghcloud/cube-utils";

import { supplementLedgerDetailExport, supplementLedgerDetail } from "@/api/staff-supplement";
import { Layout } from "@/components/layout/layout";
import { usePageName } from "@/hook/use-page-name";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";

/** 补卡台账详情 */
export const SupplementLedgerDetail = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName();
    const { userId, period } = useRoute().query;
    const defaultPeriod = period
      ? period.toString().split(",")
      : [dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().endOf("month").format("YYYY-MM-DD")];
    const formState = reactive({
      userId,
      period: defaultPeriod,
    });

    const exportLoading = ref(false);
    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        await supplementLedgerDetailExport({ ...formState, period: formState.period.join(",") })
          .then((res) => {
            const { data } = res;
            const link = document.createElement("a");
            const blob = new Blob([data as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "补卡台账.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((res) => {
            logger.debug(res);
            message.warn("未查询到数据，无法导出");
          });
      } catch (error) {
        logger.error(error);
      } finally {
        setTimeout(() => {
          exportLoading.value = false;
        }, 1000);
      }
    };

    const columns = [
      {
        title: `${KEYWORD_ALIAS.staff}姓名`,
        dataIndex: "userName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "补卡申请时间",
        dataIndex: "createTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "补卡处理时间",
        dataIndex: "updateTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "补卡日期",
        dataIndex: "clockInDate",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          const time = dayjs(text).format("YYYY-MM-DD");
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "补卡班次",
        dataIndex: "classesName",
        ellipsis: true,
        customRender: ({ record }: { record: { startWorkTime: string; endWorkTime: string } }): VNode => {
          const res = record.startWorkTime ? `${record.startWorkTime}-${record.endWorkTime}` : "--";
          return <PopOver content={res || "--"}>{res || "--"}</PopOver>;
        },
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const queryCache = useListQueryCache({
      defaults: {
        userId,
        period: defaultPeriod,
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        userId: formState.userId,
        period: formState.period,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        const period = next.period;
        formState.period = Array.isArray(period) ? period : period ? String(period).split(",") : defaultPeriod;
        formState.userId = next.userId;
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await supplementLedgerDetail({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
          period: formState.period.join(","),
        });
        if (res.data) {
          const { records, total } = res.data;
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch (error) {
        logger.debug(error);
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => {
        queryCache.sync();
      });
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
      if (userId || period) {
        await getTableData();
        await queryCache.sync();
      } else {
        await queryCache.hydrateAndQuery(getTableData);
      }
    });

    const layoutSlots = {
      "layout-header": (): VNode => {
        return (
          <Button type="primary" onClick={exportExcel} loading={exportLoading.value}>
            导出
          </Button>
        );
      },
      "layout-content": (): VNode => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="日期">
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
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
        );
      },
      "footer-page": (): VNode => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        );
      },
      "footer-btn": (): VNode => {
        return (
          <Button
            onClick={() => {
              window.history.back();
            }}
          >
            返回
          </Button>
        );
      },
    };
    return (): VNode => (
      <>
        <Layout title={(pageTitle ?? "补卡台账") + "-详情"} v-slots={layoutSlots} />
      </>
    );
  },
});

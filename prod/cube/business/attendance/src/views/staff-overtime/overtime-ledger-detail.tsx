import dayjs from "dayjs";
import { defineComponent, reactive, ref, onMounted, type VNode } from "vue";
import { useRoute } from "vue-router";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { Button, Form, FormItem, type PickerMode, Table, Page, message, DateRangePicker, PopOver } from "@ghcloud/cube-ui";
import { useListQueryCache } from "@ghcloud/cube-utils";

import { overtimeDetailExport, overtimeDetailPage } from "@/api/staff-overtime";
import { Layout } from "@/components/layout/layout";

import "./overtime-ledger.less";

/** 加班台账 */
export const OverTimeLedgerDetail = defineComponent({
  setup: () => {
    const { userId, date, type } = useRoute().query;
    const searchData = reactive<{
      timeType: PickerMode;
    }>({
      timeType: "month",
    });
    const dateTime: string = date as string;
    const ledgerDate = ref<string[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const dataSource = ref([]);
    const queryCache = useListQueryCache({
      defaults: {
        period: dateTime ? dateTime.split(",") : ([] as string[]),
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        period: ledgerDate.value,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        const period = next.period;
        ledgerDate.value = Array.isArray(period) ? period : period ? String(period).split(",") : [];
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => {
        queryCache.sync();
      });
    };
    const getTableData = async (): Promise<void> => {
      const { data } = await overtimeDetailPage({
        userId,
        workType: type,
        period: ledgerDate.value.length > 0 ? ledgerDate.value.join(",") : "",
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      });
      dataSource.value = data.records as never[];
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
    const exportExcel = async (): Promise<void> => {
      exportLoading.value = true;
      try {
        exportLoading.value = true;

        await overtimeDetailExport({
          userId,
          workType: type,
          period: ledgerDate.value.length > 0 ? ledgerDate.value.join(",") : "",
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
        })
          .then((res) => {
            const { data } = res;
            const link = document.createElement("a");
            const blob = new Blob([data as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "请假台账详情.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch(() => {
            message.warn("未查询到数据，无法导出");
          });
      } catch (error) {
      } finally {
        setTimeout(() => {
          exportLoading.value = false;
        }, 1000);
      }
    };
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
            <div class="classes-Summary-form">
              <div class="search">
                <Form layout="inline" model={searchData}>
                  <FormItem>
                    <DateRangePicker v-model:value={ledgerDate.value} valueFormat="YYYY-MM-DD" allowClear={false} />
                  </FormItem>
                  <FormItem>
                    <Button type="primary" onClick={queryForm}>
                      查询
                    </Button>
                    <Button type="default" style={{ marginLeft: "10px" }} onClick={reset}>
                      重置
                    </Button>
                  </FormItem>
                </Form>
              </div>
              <div class="search">
                <Table pagination={false} columns={columns} dataSource={dataSource.value} size="small" scrollX={2500} />
              </div>
            </div>
          </>
        );
      },
      "footer-page": (): VNode => {
        return (
          <>
            <Page
              v-model:current={pagination.value.pageNumber}
              v-model:pageSize={pagination.value.pageSize}
              v-model:total={pagination.value.total}
              onPageChange={pageChange}
            />
          </>
        );
      },
    };
    const exportLoading = ref(false);
    const columns = [
      {
        title: `${KEYWORD_ALIAS.staff}姓名`,
        dataIndex: "userName",
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      // {
      //   title: '加班申请时间',
      //   dataIndex: 'department',

      // },
      // {
      //   title: '加班处理时间',
      //   dataIndex: 'department',
      // },
      {
        title: "加班类型",
        dataIndex: "workType",
        customRender: ({ text }: { text: string }): string => {
          return text === "REST" ? "休息日加班" : text === "WORK" ? "工作日加班" : text === "FESTIVAL" ? "节假日加班" : "";
        },
      },
      {
        title: "加班开始时间",
        dataIndex: "startTime",
        customRender: ({ text }: { text: number }): string => {
          return dayjs(text).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        title: "加班结束时间",
        dataIndex: "endTime",
        customRender: ({ text }: { text: number }): string => {
          return dayjs(text).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        title: "加班时长(小时)",
        dataIndex: "actualDuration",
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
    ];
    return (): VNode => <Layout title="加班台账" v-slots={layoutSlots} />;
  },
});

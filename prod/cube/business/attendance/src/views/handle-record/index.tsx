import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Select, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { exportHandleLog, getHandleLogPage } from "@/api/handle-record";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";

import style from "@/assets/style.module.less";
export const HandleRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const permission = appFunctionCodes.attendanceHandleLogRecord;
    const defaultPeriod = [dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().endOf("month").format("YYYY-MM-DD")];
    const formState = reactive({
      userName: "",
      period: defaultPeriod,
      keyword: "",
      objType: undefined,
    });

    const exportLoading = ref(false);
    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        await exportHandleLog({
          ...formState,
          period: formState.period.join(","),
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
            link.setAttribute("download", "操作日志记录.xlsx");
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
        title: "操作时间",
        dataIndex: "operationTime",
        ellipsis: true,
        width: 180,
        fixed: "left",
        customRender: ({ text }: { text: string }): VNode => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "操作人",
        dataIndex: "userName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "业务应用",
        dataIndex: "businessType",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "operationType",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作对象",
        dataIndex: "operationObj",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作内容",
        dataIndex: "operationContent",
        ellipsis: true,
        width: 400,
        customRender: ({ text }: { text: string }): VNode => {
          const tag = text ? <p style={{ maxWidth: "400px" }} v-html={text} /> : "--";
          return <PopOver content={tag as string}>{tag}</PopOver>;
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
    const queryCache = useListQueryCache<{
      userName: string;
      period: string[];
      keyword: string;
      objType: string | undefined;
      pageNumber: number;
      pageSize: number;
    }>({
      defaults: {
        userName: "",
        period: defaultPeriod,
        keyword: "",
        objType: undefined,
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        userName: formState.userName,
        period: formState.period,
        keyword: formState.keyword,
        objType: formState.objType,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        formState.userName = (next.userName as string) ?? "";
        formState.period = Array.isArray(next.period)
          ? (next.period as string[])
          : typeof next.period === "string"
            ? next.period.split(",")
            : defaultPeriod;
        formState.keyword = (next.keyword as string) ?? "";
        formState.objType = next.objType as string | undefined;
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const objTypeOptions = [
      { value: "ATTENDANCE_SECTION", label: "考勤组" },
      { value: "CLASSES", label: "班次" },
      { value: "ARRANGE_WORK", label: "人员排班" },
      { value: "BE_ON_DUTY", label: "人员值班" },
      { value: "HOLIDAY_BALANCE", label: "假期余额" },
      { value: "HOLIDAY_TYPE", label: "假期类型" },
      { value: "OVERTIME_RULE", label: "加班规则" },
      { value: "SUPPLEMENT_CARD_RULE", label: "补卡规则" },
    ];

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await getHandleLogPage({
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
        logger.error(error);
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
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-header": (): VNode => {
        return (
          <div>
            {hasPermission(permission.export) && (
              <Button type="primary" onClick={exportExcel} loading={exportLoading.value}>
                导出
              </Button>
            )}
          </div>
        );
      },
      "layout-content": (): VNode => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="日期">
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="操作人">
                <Input v-model:value={formState.userName} placeholder="请输入操作人姓名" showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="操作对象">
                <Select v-model:value={formState.objType} placeholder="请选择操作对象" options={objTypeOptions} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="操作内容">
                <Input v-model:value={formState.keyword} placeholder="请输入操作内容" showCount={false} />
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
            <AliasTable
              class={style["clock-in-record-table"]}
              rowKey="id"
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              scrollY={scorllY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
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
    };
    return (): VNode => (
      <>
        <Layout title={pageTitle ?? "操作日志记录"} v-slots={layoutSlots} />
      </>
    );
  },
});

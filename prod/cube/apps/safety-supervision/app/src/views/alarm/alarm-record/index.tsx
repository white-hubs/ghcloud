import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, onBeforeMount } from "vue";
import { useRoute } from "vue-router";

import { Button, Table, Form, FormItem, Select, DateRangePicker, Input, PopOver, message, Page, Space } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { alarmHandleOptions, alarmHandlerResultOptions } from "./index.i";
import { getAlarmRecord, getMarketList, getAlarmTypes, exportAlarmRecord, getAlarmLevels } from "@/api/alarm";
import { useTableScroll } from "@/hook/use-table-scroll";

import styles from "./index.module.less";
export const AlarmRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const state = reactive({
      dataSource: [],
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
        alarmStatus: null,
        alarmHandlerResult: null,
        alarmHandlerTimeoutStatus: null,
        alarmLevelId: null,
        marketTenant: null,
        alarmTypeCode: null,
        total: 0,
        period: null,
      },
      selectRow: "",
    });
    const alarmLevelList = ref([]);
    const color: Record<string, string> = {
      一级: "rgb(255, 59, 52)",
      二级: "rgb(255, 110, 52)",
      三级: "rgb(255, 194, 52)",
      四级: "rgb(24, 144, 255)",
    };
    const status: Record<string, string> = {
      超时: "#D9001B",
      正常: "#70B603",
    };
    const handstatus: Record<string, string> = {
      已挂起: "#02A7F0",
      待接收: "#D9001B",
      处理中: "#F59A23",
      已关闭: "#7F7F7F",
      已处理: "#70B603",
    };
    const { scorllY } = useTableScroll();
    const route = useRoute();
    const alarmPeriod = ref<string[]>([]);
    const queryCache = useListQueryCache({
      defaults: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
        alarmStatus: null,
        alarmHandlerResult: null,
        alarmHandlerTimeoutStatus: null,
        alarmLevelId: null,
        marketTenant: null,
        alarmTypeCode: null,
        period: [] as string[],
      },
      getState: () => ({
        pageNumber: state.searchParams.pageNumber,
        pageSize: state.searchParams.pageSize,
        keyword: state.searchParams.keyword,
        alarmStatus: state.searchParams.alarmStatus,
        alarmHandlerResult: state.searchParams.alarmHandlerResult,
        alarmHandlerTimeoutStatus: state.searchParams.alarmHandlerTimeoutStatus,
        alarmLevelId: state.searchParams.alarmLevelId,
        marketTenant: state.searchParams.marketTenant,
        alarmTypeCode: state.searchParams.alarmTypeCode,
        period: alarmPeriod.value,
      }),
      setState: (next) => {
        state.searchParams.pageNumber = Number(next.pageNumber ?? 1);
        state.searchParams.pageSize = Number(next.pageSize ?? 10);
        state.searchParams.keyword = (next.keyword as string) ?? "";
        state.searchParams.alarmStatus = (next.alarmStatus as null) ?? null;
        state.searchParams.alarmHandlerResult = (next.alarmHandlerResult as null) ?? null;
        state.searchParams.alarmHandlerTimeoutStatus = (next.alarmHandlerTimeoutStatus as null) ?? null;
        state.searchParams.alarmLevelId = (next.alarmLevelId as null) ?? null;
        state.searchParams.marketTenant = (next.marketTenant as null) ?? null;
        state.searchParams.alarmTypeCode = (next.alarmTypeCode as null) ?? null;
        alarmPeriod.value = Array.isArray(next.period)
          ? (next.period as string[])
          : typeof next.period === "string"
            ? next.period.split(",")
            : ([] as string[]);
      },
    });
    const columns = [
      {
        dataIndex: "alarmEventTypeName",
        title: "序号",
        width: 70,
        ellipsis: true,
        fixed: "left",
        customRender: ({ index }: { text: string; index: number }): JSX.Element => {
          return <span>{index + 1}</span>;
        },
      },
      {
        dataIndex: "alarmEventName",
        title: "报警事件",
        fixed: "left",
        width: 200,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "marketName",
        title: "报警市场",
        width: 120,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "areaName",
        title: "报警区域",
        width: 200,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmTargetAddress",
        title: "详细位置",
        width: 200,
        ellipsis: true,
        customRender: ({ text }: { text: string }): string => {
          return text || "--";
        },
      },
      {
        dataIndex: "alarmTime",
        title: "报警时间",
        width: 200,
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmLevelName",
        title: "报警级别",
        width: 80,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <span style={{ color: color[text] }}>{text || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "timeoutProcessTimesName",
        title: "处理时限",
        width: 120,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmHandlerTimeoutStatusName",
        title: "超时状态",
        width: 80,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <span style={{ color: status[text] }}>{text || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "alarmStatusName",
        title: "处理状态",
        width: 80,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <span style={{ color: handstatus[text] }}>{text || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "estimateHandlerTime",
        title: "预计处理时间",
        width: 200,
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmHandlerName",
        title: "处理人",
        width: 80,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        width: 80,
        title: "操作",
        fixed: "right",
        customRender: ({ record }: { record: Record<string, string> }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                onClick={() => {
                  handleInfo(record);
                }}
              >
                详情
              </Button>
            </>
          );
        },
      },
    ];
    const handleInfo = (record: Record<string, string>): void => {
      const { id, businessKey, marketTenant, marketName } = record;
      history.pushState(
        {},
        "",
        `/portal/safety-manage-head/alarm-detail?id=${id}&marketName=${marketName}&businessKey=${businessKey}&searchValue=${JSON.stringify(state.searchParams)}&isFromReport=${isFromReport.value}&marketTenant=${marketTenant}`,
      );
    };
    interface SearchState {
      pageNumber: number;
      pageSize: number;
      keyword: string;
      alarmStatus: null;
      alarmHandlerResult: null;
      alarmHandlerTimeoutStatus: null;
      alarmLevelId: null;
      marketTenant: null;
      alarmTypeCode: null;
      period: null;
      total: number;
    }
    const isFromReport = ref(false);
    onBeforeMount(() => {
      if (route.query.searchValue) {
        isFromReport.value = true;
        state.searchParams = JSON.parse(route.query.searchValue as string) as unknown as SearchState;
        alarmPeriod.value = (state.searchParams.period as unknown as string[]) ?? ([] as string[]);
      } else {
        isFromReport.value = false;
      }
    });
    const goBack = (): void => {
      history.pushState({}, "", `/portal/safety-manage-head/safety-report?searchValue=${route.query.searchValue as string}`);
    };
    const alarmRecordExport = (): void => {
      const date = state.searchParams?.period ?? alarmPeriod.value;
      const params: Record<string, string | boolean | number | null> = {
        ...state.searchParams,

        period: date.join(","),
        "period.begin": date[0],
        "period.end": date[1],
      };
      exportAlarmRecord(params)
        .then((res) => {
          const { data } = res;
          const link = document.createElement("a");
          const blob = new Blob([data as BlobPart], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "安全月报-报警记录.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(() => {
          message.warn("未查询到数据，无法导出");
        });
    };
    const getList = async (): Promise<void> => {
      state.loading = true;
      try {
        const date = state.searchParams?.period ?? alarmPeriod.value;
        const params: Record<string, string | boolean | number | null> = {
          ...state.searchParams,

          period: date.join(","),
          "period.begin": date[0],
          "period.end": date[1],
        };
        const { data } = await getAlarmRecord(params);
        state.dataSource = data.records;
        state.searchParams.total = data.total;
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const getAlarmLevel = async (): Promise<void> => {
      const { data } = await getAlarmLevels();
      alarmLevelList.value = data;
    };
    const marketTenantList = ref<Record<string, string>[]>([]);
    const alarmTypesList = ref<Record<string, string>[]>([]);
    const getAlarmTypesOptions = async (): Promise<void> => {
      const { data } = await getAlarmTypes();
      alarmTypesList.value = data;
    };
    const getMarketOptions = async (): Promise<void> => {
      const { data } = await getMarketList();
      marketTenantList.value = data;
    };
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page;
      state.searchParams.pageSize = pageSize;
      getList().then(() => {
        queryCache.sync();
      });
    };
    onMounted(async () => {
      getAlarmLevel();
      getAlarmTypesOptions();
      getMarketOptions();
      if (route.query.searchValue) {
        await getList();
        await queryCache.sync();
      } else {
        await queryCache.hydrateAndQuery(getList);
      }
    });
    const handlePickerChange = (val: string[]): void => {
      alarmPeriod.value = val;
    };
    const handleSearch = async (): Promise<void> => {
      state.searchParams.pageNumber = 1;
      await getList();
      await queryCache.sync();
    };
    const handleReset = async (): Promise<void> => {
      await queryCache.reset();
      state.searchParams.total = 0;
      await getList();
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element | boolean => {
        return (
          isFromReport.value && (
            <Button type="primary" onClick={alarmRecordExport}>
              导出
            </Button>
          )
        );
      },
      "layout-content": (): JSX.Element => (
        <>
          {!isFromReport.value && (
            <Form layout="inline" style="margin-top:10px">
              <FormItem label="报警市场" class={styles["search-item"]}>
                <Select
                  placeholder="请选择报警市场"
                  allowClear
                  options={marketTenantList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "marketName", value: "marketTenant" }}
                  v-model:value={state.searchParams.marketTenant}
                />
              </FormItem>
              <FormItem label="报警级别" class={styles["search-item"]}>
                <Select
                  placeholder="请选择报警分类"
                  allowClear
                  options={alarmLevelList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "name", value: "id" }}
                  v-model:value={state.searchParams.alarmLevelId}
                />
              </FormItem>
              <FormItem label="报警分类" class={styles["search-item"]}>
                <Select
                  placeholder="请选择报警分类"
                  allowClear
                  options={alarmTypesList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "alarmTypeName", value: "alarmTypeCode" }}
                  v-model:value={state.searchParams.alarmTypeCode}
                />
              </FormItem>
              <FormItem label="处理状态" class={styles["search-item"]}>
                <Select
                  placeholder="请选择处理状态"
                  allowClear
                  options={alarmHandleOptions}
                  style={{ width: "140px" }}
                  v-model:value={state.searchParams.alarmStatus}
                />
              </FormItem>
              <FormItem label="处理结果" class={styles["search-item"]}>
                <Select
                  placeholder="请选择"
                  allowClear
                  options={alarmHandlerResultOptions}
                  style={{ width: "140px" }}
                  v-model:value={state.searchParams.alarmHandlerResult}
                />
              </FormItem>
              <FormItem label="报警时间" class={styles["search-item"]}>
                <DateRangePicker
                  v-model:value={alarmPeriod.value}
                  allowClear
                  onChangePicker={handlePickerChange}
                  picker="date"
                  valueFormat="YYYY-MM-DD"
                />
              </FormItem>
              <FormItem>
                <Input
                  placeholder="请输入设备名称/报警规则"
                  v-model:value={state.searchParams.keyword}
                  showCount={false}
                  style="width:250px "
                />
              </FormItem>
              <FormItem label="" class={styles["search-item"]}>
                <Space>
                  <Button type="primary" onClick={handleSearch}>
                    查询
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </FormItem>
            </Form>
          )}
          <Table
            dataSource={state.dataSource}
            columns={columns}
            loading={state.loading}
            pagination={false}
            size="small"
            scrollY={scorllY.value - 25}
          />
        </>
      ),
      "footer-page": (): JSX.Element => {
        return (
          <>
            <Page
              v-model:current={state.searchParams.pageNumber}
              v-model:pageSize={state.searchParams.pageSize}
              v-model:total={state.searchParams.total}
              onPageChange={changePage}
            />
          </>
        );
      },
      "footer-btn": (): JSX.Element => {
        return (
          <>
            {isFromReport.value && (
              <Button onClick={goBack} type="primary">
                返回
              </Button>
            )}
          </>
        );
      },
    };
    return (): JSX.Element => (
      <div class={styles["alarm-record"]}>
        <Layout title={isFromReport.value ? "安全报表-报警记录" : pageTitle} v-slots={layoutSlots} />
      </div>
    );
  },
});

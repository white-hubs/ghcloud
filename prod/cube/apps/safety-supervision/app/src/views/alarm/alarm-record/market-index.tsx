import dayjs from "dayjs";
import { defineComponent, onBeforeMount, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import type { AlarmRecord, AlarmType } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { Button, Table, Form, FormItem, Select, DateRangePicker, Input, PopOver, message, Page, Space } from "@ghcloud/cube-ui";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { alarmHandleOptions, alarmHandlerResultOptions } from "./index.i";
import { getAlarmLevels } from "@/api/alarm";
import { cubeAlarmCenterService, cubeAlarmStatService } from "@/api/server";
import { filterObject } from "@/utils/common";

import styles from "./index.module.less";

export const MarketAlarmRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const state = reactive({
      dataSource: [] as AlarmRecord[],
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
        alarmTypeId: null,
        applicationCode: null,
        total: 0,
        period: null,
      },
      selectRow: "",
    });
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
    const route = useRoute();
    const alarmPeriod = ref<string[]>([]);
    const queryCache = useListQueryCache<{
      pageNumber: number;
      pageSize: number;
      keyword: string;
      alarmStatus: string | null;
      alarmHandlerResult: string | null;
      alarmHandlerTimeoutStatus: string | null;
      alarmLevelId: string | null;
      marketTenant: string | null;
      alarmTypeCode: string | null;
      alarmTypeId: string | null;
      applicationCode: string | null;
      period: string[];
    }>({
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
        alarmTypeId: null,
        applicationCode: null,
        period: [],
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
        alarmTypeId: state.searchParams.alarmTypeId,
        applicationCode: state.searchParams.applicationCode,
        period: alarmPeriod.value,
      }),
      setState: (next) => {
        state.searchParams.keyword = (next.keyword as string) ?? "";
        state.searchParams.alarmStatus = (next.alarmStatus as string | null) ?? null;
        state.searchParams.alarmHandlerResult = (next.alarmHandlerResult as string | null) ?? null;
        state.searchParams.alarmHandlerTimeoutStatus = (next.alarmHandlerTimeoutStatus as string | null) ?? null;
        state.searchParams.alarmLevelId = (next.alarmLevelId as string | null) ?? null;
        state.searchParams.marketTenant = (next.marketTenant as string | null) ?? null;
        state.searchParams.alarmTypeCode = (next.alarmTypeCode as string | null) ?? null;
        state.searchParams.alarmTypeId = (next.alarmTypeId as string | null) ?? null;
        state.searchParams.applicationCode = (next.applicationCode as string | null) ?? null;
        state.searchParams.pageNumber = Number(next.pageNumber ?? 1);
        state.searchParams.pageSize = Number(next.pageSize ?? 10);
        alarmPeriod.value = Array.isArray(next.period) ? next.period : typeof next.period === "string" ? next.period.split(",") : [];
      },
    });
    const alarmLevelList = ref([]);

    /**
     * 根据来源类型获取标题前缀
     */
    const getReportTitlePrefix = (from: string | undefined): string => {
      const titleMap: Record<string, string> = {
        dept: "部门",
        user: "人员",
        alarm: "报警",
      };
      return titleMap[from || ""] || "安全";
    };

    const getAlarmLevel = async (): Promise<void> => {
      const { data } = await getAlarmLevels();
      alarmLevelList.value = data;
    };
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
        ellipsis: true,
        width: 180,
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "areaName",
        title: "报警区域",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmTargetAddress",
        title: "详细位置",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): string => {
          return text || "--";
        },
      },
      {
        dataIndex: "alarmTime",
        title: "报警时间",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmLevelName",
        title: "报警级别",
        ellipsis: true,
        width: 180,
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
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmHandlerTimeoutStatusName",
        title: "超时状态",
        ellipsis: true,
        width: 180,
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
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <span style={{ color: handstatus[text] }}>{text || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "alarmHandlerResultName",
        title: "处理结果",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "estimateHandlerTime",
        title: "预计处理时间",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmHandlerName",
        title: "处理人",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        width: 180,
        customRender: ({ record }: { record: Record<string, string> }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                onClick={() => {
                  handleDetail(record);
                }}
              >
                详情
              </Button>
            </>
          );
        },
      },
    ];
    const handleDetail = (record: Record<string, string>): void => {
      let target = "";
      if (record.url) {
        target = `${record.url}?id=${record.id}&businessKey=${record.businessKey}&type=detail`;
      } else {
        target = `/portal/genericEquipmentMonitor/alarmDetail?businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&type=detail&id=${record.id}`;
      }
      history.pushState({ current: location.pathname + location.search }, "", target);
    };
    const goBack = (): void => {
      let target = "";
      if (route.query.from === "alarm") {
        target = "alarm-report";
      }
      if (route.query.from === "dept") {
        target = "dept-report";
      }
      if (route.query.from === "user") {
        target = "user-report";
      }
      history.pushState(
        {},
        "",
        `/portal/safety-manage-market/${target}?searchValue=${JSON.stringify(JSON.parse(route.query.searchValue as string))}`,
      );
    };
    const exportLoading = ref(false);
    const alarmRecordExport = (): void => {
      exportLoading.value = true;
      const date = state.searchParams?.period ?? alarmPeriod.value;
      const params: Record<string, string | boolean | number | null> = {
        ...state.searchParams,

        period: date.join(","),
        "period.begin": date[0],
        "period.end": date[1],
      };
      if (!params.alarmHandlerTimeoutStatus) delete params.alarmHandlerTimeoutStatus;
      if (!params.alarmHandlerResult) delete params.alarmHandlerResult;
      if (!params.alarmStatus) delete params.alarmStatus;
      cubeAlarmStatService
        .alarmRecordExport(params)
        .then((res) => {
          exportLoading.value = false;
          if (res) {
            const link = document.createElement("a");
            const blob = new Blob([res as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            const fileName = `${getReportTitlePrefix(route.query.from as string)}统计-报警记录`;
            link.setAttribute("download", `${fileName}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        })
        .catch(() => {
          exportLoading.value = false;
          message.warn("未查询到数据，无法导出");
        });
    };
    const getList = async (): Promise<void> => {
      state.loading = true;
      try {
        const date = state.searchParams?.period ?? alarmPeriod.value;
        const params = {
          ...state.searchParams,

          period: date.join(","),
          "period.begin": date[0],
          "period.end": date[1],
          applicationCode: state.searchParams.applicationCode ?? "",
        };
        const p = filterObject(params);
        const data = await cubeAlarmCenterService.getAlarmRecordsPage(p);
        state.dataSource = data.records;
        state.searchParams.total = data.total;
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const alarmTypesList = ref<AlarmType[]>([]);
    const getAlarmTypesOptions = async (): Promise<void> => {
      const data = await cubeAlarmCenterService.getSatAlarmTypes();
      alarmTypesList.value = data;
    };
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page;
      state.searchParams.pageSize = pageSize;
      getList().then(() => {
        queryCache.sync();
      });
    };
    const isFromReport = ref(false);
    onBeforeMount(() => {
      if (route.query.searchValue) {
        isFromReport.value = true;
        state.searchParams = JSON.parse(route.query.searchValue as string);
      } else {
        isFromReport.value = false;
      }
    });
    onMounted(async () => {
      getAlarmTypesOptions();
      getAlarmLevel();
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
      await getList();
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element | false => {
        return (
          isFromReport.value && (
            <Button type="primary" loading={exportLoading.value} onClick={alarmRecordExport}>
              导出
            </Button>
          )
        );
      },
      "layout-content": (): JSX.Element => (
        <>
          {!isFromReport.value && (
            <Form layout="inline" style="margin: 16px 0;">
              <FormItem label="报警分类" style="margin-bottom: 10px">
                <Select
                  placeholder="请选择报警分类"
                  allowClear
                  options={alarmTypesList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "name", value: "id" }}
                  v-model:value={state.searchParams.alarmTypeId}
                />
              </FormItem>
              <FormItem label="处理状态" style="margin-bottom: 10px">
                <Select
                  placeholder="请选择处理状态"
                  allowClear
                  options={alarmHandleOptions}
                  style={{ width: "140px" }}
                  v-model:value={state.searchParams.alarmStatus}
                />
              </FormItem>
              <FormItem label="报警级别" style="margin-bottom: 10px">
                <Select
                  placeholder="请选择报警分类"
                  allowClear
                  options={alarmLevelList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "name", value: "id" }}
                  v-model:value={state.searchParams.alarmLevelId}
                />
              </FormItem>
              <FormItem label="处理结果" style="margin-bottom: 10px">
                <Select
                  placeholder="请选择"
                  allowClear
                  options={alarmHandlerResultOptions}
                  style={{ width: "140px" }}
                  v-model:value={state.searchParams.alarmHandlerResult}
                />
              </FormItem>
              <FormItem label="报警时间" style="margin-bottom: 10px">
                <DateRangePicker
                  v-model:value={alarmPeriod.value}
                  allowClear
                  onChangePicker={handlePickerChange}
                  picker="date"
                  valueFormat="YYYY-MM-DD"
                />
              </FormItem>
              <FormItem>
                <Input placeholder="请输入设备名称/报警规则" v-model:value={state.searchParams.keyword} showCount={false} />
              </FormItem>
              <FormItem>
                <Space>
                  <Button type="primary" onClick={handleSearch}>
                    查询
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </FormItem>
            </Form>
          )}
          <Table dataSource={state.dataSource} columns={columns} loading={state.loading} pagination={false} size="small" scrollX={1000} />
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
        <Layout
          title={isFromReport.value ? `${getReportTitlePrefix(route.query.from as string)}统计-报警记录` : pageTitle}
          v-slots={layoutSlots}
        />
      </div>
    );
  },
});

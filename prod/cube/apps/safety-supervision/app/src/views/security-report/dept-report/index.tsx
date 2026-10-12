import moment from "moment";
import { defineComponent, onBeforeMount, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import type { AlarmStatusTotalPageVO } from "@ghcloud/cube-alarm-center-service";
import type { EmergencyEventTypes } from "@ghcloud/cube-emergency-service/src/type";
import type { AlarmTypesResponse } from "@ghcloud/cube-safety-management-service";
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table, message } from "@ghcloud/cube-ui";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { cubeAlarmStatService, cubeEmergencyService, cubeSafetyManagementStatService } from "@/api/server";
import { useTableScroll } from "@/hook/use-table-scroll";
import { filterObject } from "@/utils/common";

import "@/styles/monthly-report.less";

export const DeptReport = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const columns = [
      {
        title: "部门名称",
        dataIndex: "departmentName",
        ellipsis: true,
        width: "120px",
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "报警总数",
        dataIndex: "alarmTotalNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "0"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "报警总数");
                }}
              >
                {text || "0"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "部门报警数",
        dataIndex: "totalNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "0"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "部门报警数");
                }}
              >
                {text || "0"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "未响应报警数",
        dataIndex: "unconfirmedNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "0"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "未响应报警数");
                }}
              >
                {text || "0"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "处理中报警数",
        dataIndex: "progressConfirmedNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "0"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "处理中报警数");
                }}
              >
                {text || "0"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "已处理报警数",
        dataIndex: "handlerNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "0"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "已处理报警数");
                }}
              >
                {text || "0"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "已挂起报警数",
        dataIndex: "suspendNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "0"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "已挂起报警数");
                }}
              >
                {text || "0"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "超时报警数",
        dataIndex: "timeoutNum",
        ellipsis: true,
        width: "120px",
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "0"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "超时报警数");
                }}
              >
                {text || "0"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "部门报警占比",
        dataIndex: "ratio",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "报警处理率",
        dataIndex: "handlerRate",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "报警响应率",
        dataIndex: "confirmedRate",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "报警超时率",
        dataIndex: "timeoutRate",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "处理平均耗时",
        dataIndex: "averageProcessing",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "0"}>{text || "0"}</PopOver>;
        },
      },
    ];
    // 获取上一个月的开始时间
    const prevMonthStartDate = moment().clone().subtract(1, "months").startOf("month").format("YYYY-MM-DD");
    const prevMonthEndDate = moment().clone().subtract(1, "months").endOf("month").format("YYYY-MM-DD");

    const alarmPeriod = ref<string[]>([]);
    const state = reactive({
      dataSource: [] as AlarmStatusTotalPageVO[],
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
        applicationCode: null,
        alarmEventTypeCode: null,
        total: 0,
      },
      selectRow: "",
    });
    const getTableData = async (): Promise<void> => {
      state.loading = true;
      try {
        const params: Record<string, string | boolean | number | null> = {
          ...state.searchParams,
          period: alarmPeriod.value ? alarmPeriod.value.join(",") : "",
        };
        delete params.total;
        const p = filterObject(params);
        const { records, total } = await cubeAlarmStatService.alarmSafetyReportDepartmentPage(p);
        state.dataSource = records;
        state.searchParams.total = total;
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const handleLink = (record: Record<string, string>, code: string): void => {
      let alarmStatus = "";
      let alarmHandlerTimeoutStatus = "";
      let alarmHandlerResult = "";
      let departmentId = "";
      switch (code) {
        case "报警总数":
          departmentId = "";
          break;
        case "部门报警数":
          departmentId = record.departmentId;
          break;
        case "未响应报警数":
          alarmStatus = "ALARM_UN_CONFIRMED";
          departmentId = record.departmentId;
          break;
        case "处理中报警数":
          alarmStatus = "ALARM_PROGRESS_CONFIRMED";
          departmentId = record.departmentId;
          break;
        case "已处理报警数":
          alarmStatus = "ALARM_HANDLER";
          departmentId = record.departmentId;
          break;
        case "已挂起报警数":
          alarmStatus = "ALARM_SUSPEND";
          departmentId = record.departmentId;
          break;
        case "超时报警数":
          alarmHandlerTimeoutStatus = "TIMED_OUT";
          departmentId = record.departmentId;
          break;
        case "真实报警数":
          alarmHandlerResult = "ALARM_ACTUAL";
          departmentId = record.departmentId;
          break;
        case "误报数":
          alarmHandlerResult = "ALARM_IMPRACTICAL";
          departmentId = record.departmentId;
          break;
      }
      const prames = {
        alarmStatus,
        alarmHandlerTimeoutStatus,
        alarmHandlerResult,
        applicationCode: state.searchParams.applicationCode,
        alarmEventTypeId: state.searchParams.alarmEventTypeCode,
        departmentId,
        period: alarmPeriod.value,
      };
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/safety-manage-market/alarm-record?from=dept&searchValue=${JSON.stringify(prames)}`,
      );
    };
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page;
      state.searchParams.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };
    const handleSearch = async (): Promise<void> => {
      state.searchParams.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    const { scorllY } = useTableScroll();
    const handlePickerChange = (val: string[]): void => {
      alarmPeriod.value = val;
    };
    const alarmTypesList = ref<AlarmTypesResponse[]>([]);
    const getAlarmTypesOptions = async (): Promise<void> => {
      const data = await cubeSafetyManagementStatService.alarmTypes();
      alarmTypesList.value = data;
    };
    const eventTypesList = ref<EmergencyEventTypes[]>([]);
    const getEventTypesOptions = async (): Promise<void> => {
      const data = await cubeEmergencyService.getEventTypes();
      eventTypesList.value = data;
    };
    const exportLoading = ref(false);
    const alarmRecordExport = (): void => {
      exportLoading.value = true;
      const params: Record<string, string | boolean | number | null> = {
        ...state.searchParams,
        period: alarmPeriod.value ? alarmPeriod.value.join(",") : "",
      };
      delete params.total;
      cubeAlarmStatService
        .alarmDepartmentPageExport(params)
        .then((res) => {
          exportLoading.value = false;
          if (res) {
            const link = document.createElement("a");
            const blob = new Blob([res as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "部门统计.xlsx");
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

    const route = useRoute();
    const queryCache = useListQueryCache({
      defaults: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
        applicationCode: null,
        alarmEventTypeCode: null,
        period: [],
      },
      getState: () => ({
        pageNumber: state.searchParams.pageNumber,
        pageSize: state.searchParams.pageSize,
        keyword: state.searchParams.keyword,
        applicationCode: state.searchParams.applicationCode,
        alarmEventTypeCode: state.searchParams.alarmEventTypeCode,
        period: alarmPeriod.value,
      }),
      setState: (values) => {
        state.searchParams.pageNumber = Number(values.pageNumber ?? 1);
        state.searchParams.pageSize = Number(values.pageSize ?? 10);
        state.searchParams.keyword = values.keyword ?? "";
        state.searchParams.applicationCode = values.applicationCode ?? null;
        state.searchParams.alarmEventTypeCode = values.alarmEventTypeCode ?? null;
        alarmPeriod.value = values.period ?? [];
      },
    });

    onBeforeMount(() => {
      if (route.query.searchValue) {
        const searchVal = JSON.parse(route.query.searchValue as string);
        state.searchParams.applicationCode = searchVal.applicationCode;
        state.searchParams.alarmEventTypeCode = searchVal.alarmEventTypeCode ?? searchVal.alarmEventTypeId;
        alarmPeriod.value = searchVal.period;
      }
    });

    onMounted(async () => {
      getAlarmTypesOptions();
      getEventTypesOptions();
      if (route.query.searchValue) {
        await getTableData();
        await queryCache.sync();
      } else {
        await queryCache.hydrateAndQuery(getTableData);
      }
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <Button type="primary" loading={exportLoading.value} onClick={alarmRecordExport}>
            导出
          </Button>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0" }}>
              <FormItem label="报警分类" class="search-item">
                <Select
                  placeholder="请选择报警分类"
                  allowClear
                  options={alarmTypesList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "alarmTypeName", value: "alarmTypeCode" }}
                  v-model:value={state.searchParams.applicationCode}
                />
              </FormItem>
              <FormItem label="报警事件" class="search-item">
                <Select
                  placeholder="请选择报警事件"
                  allowClear
                  options={eventTypesList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "name", value: "code" }}
                  v-model:value={state.searchParams.alarmEventTypeCode}
                />
              </FormItem>
              <FormItem class="search-item">
                <DateRangePicker
                  v-model:value={alarmPeriod.value}
                  allowClear
                  onChangePicker={handlePickerChange}
                  picker="date"
                  valueFormat="YYYY-MM-DD"
                />
              </FormItem>
              <FormItem class="search-item">
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={reset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <Table
              dataSource={state.dataSource}
              columns={columns}
              loading={state.loading}
              pagination={false}
              size="middle"
              scrollX={1000}
              scrollY={scorllY.value}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={state.searchParams.pageNumber}
            v-model:pageSize={state.searchParams.pageSize}
            v-model:total={state.searchParams.total}
            onPageChange={changePage}
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

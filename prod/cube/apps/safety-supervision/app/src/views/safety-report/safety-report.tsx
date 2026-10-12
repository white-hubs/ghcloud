import { defineComponent, onBeforeMount, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { getAlarmTypes, getMarketList, getAlarmReport, exportAlarmReport } from "@/api/alarm";
import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/monthly-report.less";

export const SafetyReport = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const columns = [
      {
        title: "市场名称",
        dataIndex: "marketName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "报警总数",
        dataIndex: "totalNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "报警总数");
                }}
              >
                {text || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "未响应报警数",
        dataIndex: "unConfirmedNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "未响应报警数");
                }}
              >
                {text || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "处理中报警数",
        dataIndex: "progressConfirmedNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "处理中报警数");
                }}
              >
                {text || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "已处理报警数",
        dataIndex: "handlerNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "已处理报警数");
                }}
              >
                {text || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "已挂起报警数",
        dataIndex: "suspendNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "已挂起报警数");
                }}
              >
                {text || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "超时报警数",
        dataIndex: "timeoutNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "超时报警数");
                }}
              >
                {text || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "真实报警数",
        dataIndex: "actualNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "真实报警数");
                }}
              >
                {text || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "误报数",
        dataIndex: "impracticalNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, string> }): JSX.Element => {
          return (
            <PopOver content={text || "--"}>
              <Button
                type="link"
                onClick={() => {
                  handleLink(record, "误报数");
                }}
              >
                {text || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "报警正确率",
        dataIndex: "actualRatio",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text ? text + "%" : "--"}>{text ? text + "%" : "--"}</PopOver>;
        },
      },
      {
        title: "报警处理率",
        dataIndex: "handlerRatio",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text ? text + "%" : "--"}>{text ? text + "%" : "--"}</PopOver>;
        },
      },
      {
        title: "报警响应率",
        dataIndex: "confirmedRatio",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text ? text + "%" : "--"}>{text ? text + "%" : "--"}</PopOver>;
        },
      },
      {
        title: "报警超时率",
        dataIndex: "timeOutRatio",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text ? text + "%" : "--"}>{text ? text + "%" : "--"}</PopOver>;
        },
      },
      {
        title: "处理平均耗时",
        dataIndex: "averageProcessing",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
    ];
    const alarmPeriod = ref<string[]>([]);
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
        marketTenant: null,
        alarmTypeCode: null,
        total: 0,
      },
      selectRow: "",
    });
    const route = useRoute();
    const queryCache = useListQueryCache({
      defaults: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
        marketTenant: null,
        alarmTypeCode: null,
        period: [] as string[],
      },
      getState: () => ({
        pageNumber: state.searchParams.pageNumber,
        pageSize: state.searchParams.pageSize,
        keyword: state.searchParams.keyword,
        marketTenant: state.searchParams.marketTenant,
        alarmTypeCode: state.searchParams.alarmTypeCode,
        period: alarmPeriod.value,
      }),
      setState: (values) => {
        state.searchParams.pageNumber = Number(values.pageNumber ?? 1);
        state.searchParams.pageSize = Number(values.pageSize ?? 10);
        state.searchParams.keyword = values.keyword ?? "";
        state.searchParams.marketTenant = values.marketTenant ?? null;
        state.searchParams.alarmTypeCode = values.alarmTypeCode ?? null;
        const period = values.period;
        alarmPeriod.value = Array.isArray(period) ? period : period ? String(period).split(",") : [];
      },
    });
    const getTableData = async (): Promise<void> => {
      state.loading = true;
      try {
        const params: Record<string, string | boolean | number | null> = {
          ...state.searchParams,
          period: alarmPeriod.value ? alarmPeriod.value.join(",") : "",
          "period.begin": alarmPeriod.value ? alarmPeriod.value[0] : "",
          "period.end": alarmPeriod.value ? alarmPeriod.value[1] : "",
        };

        const { data } = await getAlarmReport(params);
        state.dataSource = data.records;
        state.searchParams.total = data.total;
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const handleLink = (record: Record<string, string>, code: string): void => {
      const { marketTenant } = record;
      let alarmStatus = "";
      let alarmHandlerTimeoutStatus = "";
      let alarmHandlerResult = "";
      switch (code) {
        case "报警总数":
          alarmStatus = "";
          break;
        case "未响应报警数":
          alarmStatus = "ALARM_UN_CONFIRMED";
          break;
        case "处理中报警数":
          alarmStatus = "ALARM_PROGRESS_CONFIRMED";
          break;
        case "已处理报警数":
          alarmStatus = "ALARM_HANDLER";
          break;
        case "已挂起报警数":
          alarmStatus = "ALARM_SUSPEND";
          break;
        case "超时报警数":
          alarmHandlerTimeoutStatus = "TIMED_OUT";
          break;
        case "真实报警数":
          alarmHandlerResult = "ALARM_ACTUAL";
          break;
        case "误报数":
          alarmHandlerResult = "ALARM_IMPRACTICAL";
          break;
      }
      const prames = {
        marketTenant,
        alarmStatus,
        alarmHandlerTimeoutStatus,
        alarmHandlerResult,
        alarmTypeCode: state.searchParams.alarmTypeCode,
        period: alarmPeriod.value,
      };
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/safety-manage-head/alarm-record?searchValue=${JSON.stringify(prames)}`,
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
    const alarmRecordExport = (): void => {
      const params: Record<string, string | boolean | number | null> = {
        ...state.searchParams,
        period: alarmPeriod.value ? alarmPeriod.value.join(",") : "",
        "period.begin": alarmPeriod.value ? alarmPeriod.value[0] : "",
        "period.end": alarmPeriod.value ? alarmPeriod.value[1] : "",
      };
      exportAlarmReport(params)
        .then((res) => {
          const { data } = res;
          const link = document.createElement("a");
          const blob = new Blob([data as BlobPart], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "安全月报.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(() => {
          message.warn("未查询到数据，无法导出");
        });
    };
    onMounted(async () => {
      getAlarmTypesOptions();
      getMarketOptions();
      if (route.query.searchValue) {
        await getTableData();
        await queryCache.sync();
      } else {
        await queryCache.hydrateAndQuery(getTableData);
      }
    });
    interface SearchState {
      pageNumber: number;
      pageSize: number;
      keyword: string;
      marketTenant: null;
      alarmTypeCode: null;
      period: string[];
      total: number;
    }
    onBeforeMount(() => {
      if (route.query.searchValue) {
        const searchVal = JSON.parse(route.query.searchValue as string) as unknown as SearchState;
        state.searchParams.marketTenant = searchVal.marketTenant;
        state.searchParams.alarmTypeCode = searchVal.alarmTypeCode;
        alarmPeriod.value = searchVal.period;
      }
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <Button type="primary" onClick={alarmRecordExport}>
            导出
          </Button>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0" }}>
              <FormItem label="市场" class="search-item">
                <Select
                  placeholder="请选择市场"
                  allowClear
                  options={marketTenantList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "marketName", value: "marketTenant" }}
                  v-model:value={state.searchParams.marketTenant}
                />
              </FormItem>
              <FormItem label="报警分类" class="search-item">
                <Select
                  placeholder="请选择报警分类"
                  allowClear
                  options={alarmTypesList.value}
                  style={{ width: "140px" }}
                  fieldNames={{ label: "alarmTypeName", value: "alarmTypeCode" }}
                  v-model:value={state.searchParams.alarmTypeCode}
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

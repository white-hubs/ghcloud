import { ASSIST_CONFIRM_RESULT_OPTIONS, getAssistConfirmResultText } from "./assist-confirm-result";
import { cubeLinkageService } from "@/api/service";
import type { AlarmEventRecord } from "@ghcloud/cube-alarm-center-service";
import { AlarmLevelSelect, CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, DateRangePicker, Page, PopOver, Select } from "@ghcloud/cube-ui";
import { useApplicationInfo, usePageName } from "@ghcloud/cube-utils";
import dayjs from "dayjs";
import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

function getQueryString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getPositiveNumberQuery(value: unknown, defaultValue: number): number {
  const numberValue = Number(getQueryString(value));
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : defaultValue;
}

export const AlarmEventRecords = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const { getCurrentApplicationStore } = useApplicationInfo();
    const applicationCode = getCurrentApplicationStore().code;
    const route = useRoute();
    const router = useRouter();
    const tableCode = route.path.replaceAll("/", "");
    const initialLevel = getQueryString(route.query.level);
    const initialAlarmStartTime = getQueryString(route.query.alarmStartTime);
    const initialAlarmEndTime = getQueryString(route.query.alarmEndTime);
    const initialAssistConfirmResult = getQueryString(route.query.assistConfirmResult);
    const initialKeyword = getQueryString(route.query.keyword);
    let queryTable = (): void => {};
    const page = reactive({
      pageNumber: getPositiveNumberQuery(route.query.pageNumber, 1),
      pageSize: getPositiveNumberQuery(route.query.pageSize, 10),
      total: 0,
    });

    const searchFormSchema = [
      {
        component: AlarmLevelSelect,
        label: "报警级别",
        fieldName: "level",
        defaultValue: initialLevel || undefined,
        componentProps: {
          fieldNames: { label: "name", value: "code" },
          placeholder: "报警级别",
        },
      },
      {
        component: DateRangePicker,
        label: "报警时间",
        fieldName: "alarmTime",
        defaultValue: initialAlarmStartTime && initialAlarmEndTime ? [initialAlarmStartTime, initialAlarmEndTime] : null,
        componentProps: {
          // 与同模块 alarm-record 一致：仅选日期，避免 showTime 带来的「先日期再时间」交互
          valueFormat: "YYYY-MM-DD",
        },
      },
      {
        component: Select,
        label: "报警研判",
        fieldName: "assistConfirmResult",
        defaultValue: initialAssistConfirmResult || undefined,
        componentProps: {
          placeholder: "报警研判",
          allowClear: true,
          options: ASSIST_CONFIRM_RESULT_OPTIONS,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        defaultValue: initialKeyword || undefined,
        componentProps: {
          allowClear: true,
          placeholder: "设备名称、报警事件",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        page.pageNumber = 1;
        queryTable();
      },
      handleReset: () => {
        formApi.setFieldValue("level", undefined);
        formApi.setFieldValue("alarmTime", null);
        formApi.setFieldValue("assistConfirmResult", undefined);
        formApi.setFieldValue("keyword", undefined);
        page.pageNumber = 1;
        queryTable();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const buildReturnUrl = (): string => {
      const { level, alarmTime, assistConfirmResult, keyword } = formApi.formValues;
      const query = new URLSearchParams();
      if (level) {
        query.set("level", String(level));
      }
      if (Array.isArray(alarmTime) && alarmTime[0] && alarmTime[1]) {
        query.set("alarmStartTime", String(alarmTime[0]));
        query.set("alarmEndTime", String(alarmTime[1]));
      }
      if (assistConfirmResult) {
        query.set("assistConfirmResult", String(assistConfirmResult));
      }
      if (keyword) {
        query.set("keyword", String(keyword));
      }
      query.set("pageNumber", `${page.pageNumber}`);
      query.set("pageSize", `${page.pageSize}`);
      const queryString = query.toString();
      return `${route.path}${queryString ? `?${queryString}` : ""}`;
    };

    const toDetail = (record: AlarmEventRecord): void => {
      router.push({
        path: "/alarm-event-record-detail",
        query: {
          id: record.id,
          returnUrl: buildReturnUrl(),
        },
      });
    };

    const columns = [
      {
        title: "序号",
        dataIndex: "index",
        ellipsis: true,
        align: "center",
        customRender: ({ index }: { index: number }): JSX.Element => <PopOver content={index + 1 || "--"}>{index + 1 || "--"}</PopOver>,
      },
      {
        title: "事件时间",
        dataIndex: "eventTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "事件设备",
        dataIndex: "eventDevice",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: AlarmEventRecord }): JSX.Element => {
          const deviceName = record.eventDevice.name || "--";
          return <PopOver content={deviceName}>{deviceName}</PopOver>;
        },
      },
      {
        title: "事件级别",
        dataIndex: "eventLevel",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: AlarmEventRecord }): JSX.Element => {
          const levelName = record.eventLevel.name || "--";
          return <PopOver content={levelName}>{levelName}</PopOver>;
        },
      },
      {
        title: "事件",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "事件区域",
        dataIndex: "eventDevice",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: AlarmEventRecord }): JSX.Element => {
          const areaName = record.eventDevice.areaName || "--";
          return <PopOver content={areaName}>{areaName}</PopOver>;
        },
      },
      {
        title: "设备位置",
        dataIndex: "eventDevice",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: AlarmEventRecord }): JSX.Element => {
          const address = record.eventDevice.address || "--";
          const lntAndLat = record.eventDevice.lntAndLat || "--";
          return <PopOver content={`${address} ${lntAndLat}`}>{`${address} ${lntAndLat}`}</PopOver>;
        },
      },
      {
        title: "报警研判",
        dataIndex: "assistConfirmResult",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: AlarmEventRecord }): JSX.Element => {
          const text = getAssistConfirmResultText(record.assistConfirmResult?.result);
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: AlarmEventRecord }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                toDetail(record);
              }}
            >
              详情
            </Button>
          </>
        ),
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const { level, alarmTime, assistConfirmResult, keyword } = formApi.formValues;
        const period =
          Array.isArray(alarmTime) && alarmTime[0] && alarmTime[1]
            ? `${String(alarmTime[0])} 00:00:00,${String(alarmTime[1])} 23:59:59`
            : "";
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          applicationCode,
          level: (level as string) ?? "",
          period: (period as string) ?? "",
          assistConfirmResult: (assistConfirmResult as string) ?? "",
          keyword: (keyword as string) ?? "",
        };
        return cubeLinkageService.getAlarmEventRecordPage(params);
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });
    queryTable = tableApi.query;

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };
    const slots = {
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
      ),
    };
    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots}></CubeLayout>;
  },
});

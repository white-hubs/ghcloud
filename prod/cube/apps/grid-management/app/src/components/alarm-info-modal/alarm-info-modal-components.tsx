import { cubeAlarmCenterService } from "@/api/server";
import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { AlarmLevelSelect, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver, Select } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { computed, defineComponent, onMounted, reactive } from "vue";
export const AlarmRecords = defineComponent({
  props: {
    areaId: {
      type: String,
      default: "",
    },
  },
  setup: (props) => {
    const formState = reactive<{
      keyword: string;
      alarmStatus: string;
      alarmLevelId: undefined | string;
      alarmTime: undefined | string;
    }>({
      keyword: "",
      alarmStatus: "ALL",
      alarmLevelId: undefined,
      alarmTime: undefined,
    });
    const pagination = reactive<{
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const period = computed(() => {
      if (formState?.alarmTime?.[0] && formState?.alarmTime?.[1]) {
        return `${formState.alarmTime[0] + " 00:00:00"},${formState.alarmTime[1] + " 23:59:59"}`;
      }
      return undefined;
    });

    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: AlarmLevelSelect,
        label: "报警级别",
        fieldName: "alarmLevelId",
        componentProps: {
          placeholder: "请选择",
          onChange: (value: string): void => {
            formState.alarmLevelId = value;
          },
        },
      },
      {
        component: "RangePicker",
        label: "报警时间",
        fieldName: "alarmTime",
        componentProps: {
          format: "YYYY-MM-DD",
          valueFormat: "YYYY-MM-DD",
          onChange: (value: string): void => {
            formState.alarmTime = value;
          },
        },
      },
      {
        component: Select,
        label: "处理状态",
        fieldName: "alarmStatus",
        componentProps: {
          placeholder: "请选择",
          allowClear: true,
          options: [
            { label: "所有", value: "ALL" },
            { label: "待接收", value: "ALARM_UN_CONFIRMED" },
            { label: "处理中", value: "ALARM_PROGRESS_CONFIRMED" },
            { label: "已挂起", value: "ALARM_SUSPEND" },
            { label: "已处理", value: "ALARM_HANDLER" },
          ],
          onChange: (value: string): void => {
            formState.alarmStatus = value;
          },
        },
      },
      {
        component: "Input",
        label: "报警事件/报警对象",
        fieldName: "keyword",
        componentProps: {
          placeholder: "请输入",
          onChange: (value: string): void => {
            formState.keyword = value;
          },
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        pagination.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        pagination.pageNumber = 1;
        formState.keyword = "";
        formState.alarmStatus = "ALL";
        formState.alarmLevelId = undefined;
        formState.alarmTime = undefined;
        tableApi.query();
      },
      schema: formSchema,
      showCollapseButton: true,
    });
    formApi.setFormValues({ ...formState });

    const color: Record<string, string> = {
      一级: "rgb(255, 59, 52)",
      二级: "rgb(255, 110, 52)",
      三级: "rgb(255, 194, 52)",
      四级: "rgb(24, 144, 255)",
    };
    const handleStatus: Record<string, string> = {
      已挂起: "#02A7F0",
      待接收: "#D9001B",
      处理中: "#F59A23",
      已关闭: "#7F7F7F",
      已处理: "#70B603",
    };
    const columns = [
      {
        dataIndex: "alarmEventName",
        title: "报警事件",
        fixed: "left",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTargetName",
        title: "报警对象",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTypeName",
        title: "报警类型",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "areaName",
        title: "报警区域",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTime",
        title: "报警时间",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmLevelName",
        title: "报警级别",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span style={{ color: color[text] }}>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        dataIndex: "alarmStatusName",
        title: "处理状态",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span style={{ color: handleStatus[text] }}>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        dataIndex: "alarmHandlerResultName",
        title: "处理结果",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span>{text}</span>
          </PopOver>
        ),
      },
      {
        dataIndex: "alarmHandlerName",
        title: "处理人",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "action",
        width: 180,
        title: "操作",
        fixed: "right",
        customRender: ({ record }: { record: AlarmRecord }): JSX.Element => (
          <>
            <Button
              type="link"
              onClick={() => {
                let target = "";
                target = `/portal/genericEquipmentMonitor/alarmDetail?businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&type=detail&id=${record.id}`;
                history.pushState({ current: location.pathname + location.search }, "", target);
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
      tableCode: "alarm-record",
      rowKey: "id",
      fetchApi: async () =>
        cubeAlarmCenterService.getAlarmRecordsPage({
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          keyword: formState.keyword as string,
          alarmStatus: formState.alarmStatus === "ALL" ? "" : (formState.alarmStatus as string),
          alarmLevelId: formState.alarmLevelId as string,
          period: period.value || "",
          areaId: props.areaId || "",
        }),
      fetchLoaded: (data) => {
        pagination.total = data.total;
      },
    });

    onMounted(function(){});

    return (): JSX.Element => (
      <div style={{ padding: "20px", paddingTop: "0", boxSizing: "border-box" }}>
        <CubeForm />
        <CubeTable />
        <div style={{ paddingTop: "10px", display: "flex", justifyContent: "flex-end" }}>
          <Page
            v-model:current={pagination.pageNumber}
            v-model:pageSize={pagination.pageSize}
            v-model:total={pagination.total}
            onPageChange={(pageNumber: number, pageSize: number): void => {
              pagination.pageNumber = pageNumber || 1;
              pagination.pageSize = pageSize;
              tableApi.query();
            }}
          />
        </div>
      </div>
    );
  },
});

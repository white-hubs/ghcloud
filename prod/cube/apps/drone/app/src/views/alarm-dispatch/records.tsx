import dayjs from "dayjs";
import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { DroneAlarmDispatchRecordModel } from "@ghcloud/cube-drone-service";
import { Button, message, Page, PopOver } from "@ghcloud/cube-ui";

import { cubeDroneService } from "@/api/server";

import styles from "./alarm-dispatch-records.module.less";

const statusTextMap: Record<number, string> = {
  1: "成功",
  2: "失败",
};

const renderText = (text?: number | string): JSX.Element => {
  const content = text === 0 ? "0" : text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

const formatDateTime = (value?: number | string): string => {
  if (value == null || value === "") {
    return "--";
  }
  const raw = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  const normalized = typeof raw === "number" && raw < 10000000000 ? raw * 1000 : raw;
  return dayjs(normalized).format("YYYY-MM-DD HH:mm:ss");
};

export const AlarmDispatchRecords = defineComponent({
  name: "AlarmDispatchRecords",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const tableCode = route.path.replaceAll("/", "");
    const search = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      dispatchStatus: undefined as number | undefined,
    });

    const handleAlarmDetail = async (record: DroneAlarmDispatchRecordModel): Promise<void> => {
      if (!record.alarmRecordId) {
        message.warning("当前派飞日志缺少报警记录ID");
        return;
      }
      const detail = await cubeDroneService.getAlarmDetails(String(record.alarmRecordId));
      const query = new URLSearchParams({
        businessKey: detail.businessKey ?? "",
        alarmStatus: detail.alarmStatus ?? "",
        type: "detail",
        id: detail.id ?? String(record.alarmRecordId),
      });
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/genericEquipmentMonitor/alarmDetail?${query.toString()}`,
      );
    };

    const [CubeTable, tableApi] = useCubeTable({
      tableCode,
      rowKey: "id",
      columns: [
        {
          title: "报警对象",
          dataIndex: "alarmTargetName",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "报警级别",
          dataIndex: "alarmLevelName",
          width: 130,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "报警类型",
          dataIndex: "alarmTypeName",
          width: 160,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "无人机设备",
          dataIndex: "droneDeviceName",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "状态",
          dataIndex: "dispatchStatus",
          width: 100,
          align: "center",
          customRender: ({ text }: { text: number }) => (
            <span class={[styles.status, text === 1 ? styles.success : styles.fail]}>{statusTextMap[text] ?? "--"}</span>
          ),
        },
        {
          title: "失败原因",
          dataIndex: "failReason",
          width: 220,
          align: "center",
          customRender: ({ text }: { text: string }) => renderText(text),
        },
        {
          title: "派飞时间",
          dataIndex: "dispatchTime",
          width: 180,
          align: "center",
          customRender: ({ text }: { text: number | string }) => renderText(formatDateTime(text)),
        },
        {
          title: "操作",
          dataIndex: "action",
          fixed: "right",
          width: 170,
          align: "center",
          customRender: ({ record }: { record: DroneAlarmDispatchRecordModel }) => (
            <>
              <Button
                type="link"
                size="small"
                class={styles.detailButton}
                onClick={() => void router.push({ path: "/alarm-dispatch-record-detail", query: { id: record.id } })}
              >
                详情
              </Button>
              <Button type="link" size="small" class={styles.detailButton} onClick={() => void handleAlarmDetail(record)}>
                报警详情
              </Button>
            </>
          ),
        },
      ],
      fetchApi: async () =>
        cubeDroneService.getAlarmDispatchRecordPage({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: search.keyword,
          dispatchStatus: search.dispatchStatus,
        }),
      fetchLoaded: (data) => {
        search.total = data.total;
      },
    });

    const formSchema = [
      { component: "Input", label: "", fieldName: "keyword", componentProps: { placeholder: "报警编号/对象/任务名称" } },
      {
        component: "Select",
        label: "",
        fieldName: "dispatchStatus",
        componentProps: {
          placeholder: "派飞状态",
          options: [
            { label: "成功", value: 1 },
            { label: "失败", value: 2 },
          ],
          allowClear: true,
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      showCollapseButton: true,
      syncStateRef: search,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data: Record<string, unknown>) => {
        search.keyword = String(data.keyword ?? "");
        search.dispatchStatus = data.dispatchStatus ? Number(data.dispatchStatus) : undefined;
        search.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        search.keyword = "";
        search.dispatchStatus = undefined;
        search.pageNumber = 1;
        tableApi.query();
      },
    });
    formApi.updateSchema(formSchema);

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      search.pageNumber = pageNumber;
      search.pageSize = pageSize;
      tableApi.query();
    };

    const slots = {
      "layout-header": (): JSX.Element => <Button onClick={() => void router.push({ path: "/alarm-dispatch-config" })}>派飞配置</Button>,
      "layout-content": (): JSX.Element => (
        <div class={styles.content}>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={search.pageNumber} pageSize={search.pageSize} total={search.total} onPageChange={handlePageChange} />
      ),
    };

    return (): JSX.Element => <CubeLayout class={styles.container} title="报警派飞日志" v-slots={slots} showTableXScroll />;
  },
});

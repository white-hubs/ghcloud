import dayjs from "dayjs";
import { defineComponent, onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";

import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, Form, FormItem, Select, DateRangePicker, Input, PopOver, Page, PopConfirm, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { Layout, AliasTable } from "@ghcloud/generic-component";

import { cubeAlarmCenterService, cubeLinkageService } from "@/api/service";
import { useLoopExportExcel } from "@/hook/use-loop-export-excel";
import { appFunctionCodes } from "@/permission";

import styles from "./index.module.less";

export const AlarmRecords = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");

    const { exportLoading, exportData } = useLoopExportExcel();
    const queryState = useCubeQueryState<{
      alarmHandlerResult: string | undefined;
      alarmHandlerTimeoutStatus: string | undefined;
      keyword: string;
      alarmStatus: string;
      alarmLevelId: string | undefined;
      alarmTypeId: string | undefined;
      alarmTime: string[];
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      storage: "url",
      initialState: {
        alarmHandlerResult: undefined,
        alarmHandlerTimeoutStatus: undefined,
        keyword: "",
        alarmStatus: "ALL",
        alarmLevelId: undefined,
        alarmTypeId: undefined,
        alarmTime: [],
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: [
        "alarmHandlerResult",
        "alarmHandlerTimeoutStatus",
        "keyword",
        "alarmStatus",
        "alarmLevelId",
        "alarmTypeId",
        "alarmTime",
        "pageNumber",
        "pageSize",
      ],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        if (field === "alarmTime") {
          return raw ? raw.split(",") : [];
        }
        if (
          field === "alarmHandlerResult" ||
          field === "alarmHandlerTimeoutStatus" ||
          field === "alarmLevelId" ||
          field === "alarmTypeId"
        ) {
          return raw || undefined;
        }
        return raw;
      },
    });
    const loading = ref(false);
    const dataSource = ref<AlarmRecord[]>([]);

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
    const timeoutStatus: Record<string, string> = {
      超时: "#D9001B",
      正常: "#70B603",
    };
    const columns = [
      {
        dataIndex: "alarmEventName",
        title: "报警事件",
        fixed: "left",
        width: 180,
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTargetName",
        title: "报警对象",
        width: 180,
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTypeName",
        title: "报警类型",
        width: 180,
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "areaName",
        title: "报警区域",
        width: 180,
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTime",
        title: "报警时间",
        width: 180,
        ellipsis: true,
        align: "center",
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
        align: "center",
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
        align: "center",
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
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span>{text}</span>
          </PopOver>
        ),
      },
      {
        dataIndex: "alarmHandlerTimeoutStatusName",
        title: "超时状态",
        width: 100,
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span style={{ color: timeoutStatus[text] }}>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        dataIndex: "alarmHandlerName",
        title: "处理人",
        width: 100,
        ellipsis: true,
        align: "center",
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
                handleInfo(record);
              }}
            >
              详情
            </Button>
            <PopConfirm
              title="再次推送该报警？"
              ok-text="确定"
              cancel-text="取消"
              onConfirm={async () => {
                handleRepeatPush(record);
              }}
            >
              <Button type="link">再次推送</Button>
            </PopConfirm>
          </>
        ),
      },
    ];
    const handleInfo = (record: AlarmRecord): void => {
      let target = "";
      target = `/portal/genericEquipmentMonitor/alarmDetail?businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&type=detail&id=${record.id}`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    };
    // 获取删除权限
    const isDeletePermission = computed(() => {
      const permission = appFunctionCodes.alarmRecord;
      return hasPermission(permission?.delete);
    });
    // 批量删除
    const useRemoved = (deleteList: unknown[]): void => {
      let pageNumber = queryState.state.pageNumber;
      if (pageNumber && pageNumber > 1 && deleteList.length >= dataSource.value.length) {
        pageNumber = pageNumber - 1;
      }
      queryState.setPage(pageNumber, queryState.state.pageSize);
      getTableData();
    };
    const selectedRowKeysData = ref<string[]>([]);
    const rowSelection = ref({
      onChange: (selectedRowKeys: string[]) => {
        selectedRowKeysData.value = selectedRowKeys;
      },
    });
    const batchDeleteLoading = ref(false);
    const handleBatchDelete = async (): Promise<void> => {
      try {
        batchDeleteLoading.value = true;
        const ids = selectedRowKeysData.value ?? [];
        await cubeAlarmCenterService.deleteAlarmRecord(ids);
        message.success("删除成功");
        batchDeleteLoading.value = false;
        useRemoved(ids);
      } catch {}
    };
    const handleRepeatPush = async (record: AlarmRecord): Promise<void> => {
      try {
        await cubeLinkageService.repeatPushAlarm(`${record?.businessKey ?? ""}`);
        message.success("操作成功");
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "操作失败");
      }
    };
    const queryExportData = async (pageNumber: number, pageSize: number): Promise<{ records: AlarmRecord[] }> => {
      try {
        const params = {
          keyword: queryState.state.keyword,
          alarmStatus: alarmStatusValue.value,
          alarmLevelId: queryState.state.alarmLevelId,
          alarmTypeId: queryState.state.alarmTypeId,
          period: period.value || "",
          pageNumber,
          pageSize,
          alarmHandlerResult: queryState.state.alarmHandlerResult,
          alarmHandlerTimeoutStatus: queryState.state.alarmHandlerTimeoutStatus,
        };
        const res = await cubeAlarmCenterService.getAlarmRecordsPage(params);
        return res as { records: AlarmRecord[] };
      } catch {
        return { records: [] };
      }
    };
    const downloadExcel = async (): Promise<void> => {
      exportData({
        fileName: `${pageTitle ?? "报警记录"}`,
        exportTotal: Number(queryState.state.total),
        pageSize: 1000,
        columns: columns.slice(0, -1),
        getExportDataFunc: async (pageNumber: number, pageSize: number) => queryExportData(pageNumber, pageSize),
      });
    };

    const period = computed(() => {
      if (queryState.state.alarmTime?.[0] && queryState.state.alarmTime?.[1]) {
        return `${queryState.state.alarmTime[0] + " 00:00:00"},${queryState.state.alarmTime[1] + " 23:59:59"}`;
      }
      return undefined;
    });
    const alarmStatusValue = computed(() => {
      if (queryState.state.alarmStatus === "ALL") {
        return "";
      }
      return queryState.state.alarmStatus;
    });
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeAlarmCenterService.getAlarmRecordsPage({
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          keyword: queryState.state.keyword,
          alarmStatus: alarmStatusValue.value,
          alarmLevelId: queryState.state.alarmLevelId,
          alarmTypeId: queryState.state.alarmTypeId,
          period: period.value || "",
          alarmHandlerResult: queryState.state.alarmHandlerResult,
          alarmHandlerTimeoutStatus: queryState.state.alarmHandlerTimeoutStatus,
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        alarmHandlerResult: undefined,
        alarmHandlerTimeoutStatus: undefined,
        keyword: "",
        alarmStatus: "ALL",
        alarmLevelId: undefined,
        alarmTypeId: undefined,
        alarmTime: [],
      });
      queryState.resetPage();
      queryState.clearCache();
      queryForm();
    };
    const alarmTypesList = ref<{ label: string; value: string }[]>([]);
    const alarmLevelList = ref<{ label: string; value: string }[]>([]);
    const getAlarmTypesOptions = async (): Promise<void> => {
      const data = await cubeAlarmCenterService.getSatAlarmTypes();
      alarmTypesList.value = data?.map((e) => ({ label: e.name, value: e.id }));
    };
    const getAlarmLevelOptions = async (): Promise<void> => {
      const data = await cubeAlarmCenterService.getSatAlarmLevels();
      alarmLevelList.value = data?.map((e) => ({ label: e.name, value: e.id }));
    };
    onMounted(() => {
      getAlarmTypesOptions();
      getAlarmLevelOptions();
      getTableData();
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <div>
          {isDeletePermission.value && (
            <PopConfirm title="确定删除当前数据？" onConfirm={handleBatchDelete}>
              <Button
                disabled={selectedRowKeysData.value.length === 0}
                type="primary"
                loading={batchDeleteLoading.value}
                danger
                style={{ margin: "0 10px" }}
              >
                批量删除
              </Button>
            </PopConfirm>
          )}
          <Button
            type="primary"
            loading={exportLoading.value}
            disabled={Number(queryState.state.total) === 0}
            onClick={downloadExcel}
            style={{ margin: "0 10px" }}
          >
            导出
          </Button>
        </div>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style="margin-top:10px">
            <FormItem class={styles["search-item"]} label="状态">
              <Select
                placeholder="请选择状态"
                v-model:value={queryState.state.alarmStatus}
                options={[
                  { label: "所有", value: "ALL" },
                  { label: "待接收", value: "ALARM_UN_CONFIRMED" },
                  { label: "处理中", value: "ALARM_PROGRESS_CONFIRMED" },
                  { label: "已挂起", value: "ALARM_SUSPEND" },
                  { label: "已处理", value: "ALARM_HANDLER" },
                ]}
                style={{ width: "100px" }}
              />
            </FormItem>
            <FormItem label="报警级别" class={styles["search-item"]}>
              <Select
                placeholder="请选择报警级别"
                v-model:value={queryState.state.alarmLevelId}
                options={alarmLevelList.value}
                style={{ width: "140px" }}
              />
            </FormItem>
            <FormItem label="报警类型" class={styles["search-item"]}>
              <Select
                placeholder="请选择报警类型"
                v-model:value={queryState.state.alarmTypeId}
                options={alarmTypesList.value}
                style={{ width: "140px" }}
              />
            </FormItem>
            <FormItem label="处理结果" class={styles["search-item"]}>
              <Select
                placeholder="请选择处理结果"
                v-model:value={queryState.state.alarmHandlerResult}
                options={[
                  {
                    label: "实报",
                    value: "ALARM_ACTUAL",
                  },
                  {
                    label: "误报",
                    value: "ALARM_IMPRACTICAL",
                  },
                ]}
                style={{ width: "140px" }}
              />
            </FormItem>
            <FormItem label="超时状态" class={styles["search-item"]}>
              <Select
                placeholder="请选择超时状态"
                v-model:value={queryState.state.alarmHandlerTimeoutStatus}
                options={[
                  {
                    label: "超时",
                    value: "TIMED_OUT",
                  },
                  {
                    label: "正常",
                    value: "NORMAL",
                  },
                ]}
                style={{ width: "140px" }}
              />
            </FormItem>
            <FormItem label="报警时间" class={styles["search-item"]}>
              <DateRangePicker v-model:value={queryState.state.alarmTime} valueFormat="YYYY-MM-DD" />
            </FormItem>
            <FormItem>
              <Input placeholder="报警事件/报警对象" v-model:value={queryState.state.keyword} showCount={false} />
            </FormItem>
            <FormItem label="" class={styles["search-item"]}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          {isDeletePermission.value ? (
            <AliasTable
              rowKey="id"
              rowSelection={rowSelection.value}
              dataSource={dataSource.value}
              columns={columns}
              loading={loading.value}
              pagination={false}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          ) : (
            <AliasTable
              rowKey="id"
              dataSource={dataSource.value}
              columns={columns}
              loading={loading.value}
              pagination={false}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          )}
        </>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Page
            v-model:current={queryState.state.pageNumber}
            v-model:pageSize={queryState.state.pageSize}
            v-model:total={queryState.state.total}
            onPageChange={pageChange}
          />
        </>
      ),
      "footer-btn": (): JSX.Element =>
        isDeletePermission.value || selectedRowKeysData.value.length > 0 ? (
          <span>已选：{selectedRowKeysData.value.length} 条数据</span>
        ) : (
          <span></span>
        ),
    };
    return (): JSX.Element => (
      <div class={styles["alarm-record"]}>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </div>
    );
  },
});

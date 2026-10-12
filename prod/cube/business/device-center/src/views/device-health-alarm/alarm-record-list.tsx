import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Page, PopOver, DateRangePicker, RadioGroup, PopConfirm, message } from "@ghcloud/cube-ui";
import { AliasTable, AreaCascaderSelect, UserPickerModal } from "@ghcloud/generic-component";

import { BatchHandleAlarmModal } from "./components/batch-handle-alarm-modal";
import { SuspendModal } from "./components/suspend-modal";
import { cubeDeviceSuperviseService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";

interface DeviceHealthAlarmRecordQueryState {
  status: string;
  area: string[];
  period: string[];
  pageNumber: number;
  pageSize: number;
  total: number;
}

export const DeviceHealthAlarmRecordList = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");

    const queryState = useCubeQueryState<DeviceHealthAlarmRecordQueryState>({
      initialState: {
        status: "",
        area: [],
        period: [],
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["status", "area", "period", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") return Number(raw);
        if (field === "area" || field === "period") return raw ? raw.split(",").filter(Boolean) : [];
        return raw;
      },
    });
    const batchHandleAlarmModalRef = ref<{ openModal: () => void }>();
    const userPickerModalRef = ref<{ openModal: () => void }>();
    const suspendModalRef = ref<{ openModal: () => void }>();
    const users = ref<{ id: string; name: string }[]>([]);

    const rowId = ref();
    // 移交
    const transferRow = async (record: { id: string; businessKey: string; alarmStatus: string }): Promise<void> => {
      userPickerModalRef.value?.openModal();
      rowId.value = record.id;
    };
    const usersHandle = async (val: { id: string; name: string; organizations: { id: string; name: string }[] }[]): Promise<void> => {
      const params = {
        departmentId: val[0].organizations[0].id,
        departmentName: val[0].organizations[0].name,
        userId: val[0].id,
        userName: val[0].name,
      };
      await cubeDeviceSuperviseService.alarmHandleTransfer(rowId.value, params);
      message.success("操作成功");
      getTableData();
    };
    // 挂起
    const suspendRow = async (record: { id: string; businessKey: string; alarmStatus: string }): Promise<void> => {
      suspendModalRef.value?.openModal();
      rowId.value = record.id;
    };
    // 处理
    const handleRow = async (record: { id: string; businessKey: string; alarmStatus: string }): Promise<void> => {
      batchHandleAlarmModalRef.value?.openModal();
      rowId.value = record.id;
    };
    const submitHandleAlarm = async (formState: {
      alarmHandlerResult: string;
      alarmHandlerResultRemark: string;
      picUrl: { id: string }[];
      videoUrl: { id: string }[];
    }): Promise<void> => {
      const imgList = formState.picUrl.length > 0 ? formState.picUrl.map((item: { id: string }) => item.id) : [];
      const videoList = formState.videoUrl.length > 0 ? formState.videoUrl.map((item: { id: string }) => item.id) : [];
      const params = {
        alarmHandlerResult: formState.alarmHandlerResult,
        alarmHandlerResultRemark: formState.alarmHandlerResultRemark,
        fileVOS: [...imgList, ...videoList],
      };
      await cubeDeviceSuperviseService.alarmHandle(rowId.value, params);
      message.success("操作成功");
      getTableData();
    };
    const saveSuspend = async (formState: { estimatedProcessTime: string; remark: string; fileVOS: { id: string }[] }): Promise<void> => {
      const params = {
        estimatedProcessTime: formState.estimatedProcessTime,
        remark: formState.remark,
        fileVOS: formState.fileVOS.length > 0 ? formState.fileVOS.map((item: { id: string }) => item.id) : [],
      };
      await cubeDeviceSuperviseService.alarmHandleSuspend(rowId.value, params);
      message.success("操作成功");
      getTableData();
    };
    const editRow = (record: { id: string; businessKey: string; alarmStatus: string }, detail?: boolean): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/device-center/health-alarm-detail?id=${record.id}&businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&action=${detail ? "detail" : "edit"}`,
      );
    };
    const alarmHandleConfirm = async (record: { id: string; businessKey: string; alarmStatus: string }): Promise<void> => {
      await cubeDeviceSuperviseService.alarmHandleConfirm(record.id);
      message.success("操作成功");
      getTableData();
    };

    const columns = [
      {
        title: "报警编号",
        dataIndex: "code",
        ellipsis: true,
        width: 180,
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        ellipsis: true,
        width: 180,
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "报警对象",
        dataIndex: "alarmTargetName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备健康值",
        dataIndex: "alarmThreshold",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "处理状态",
        dataIndex: "alarmStatusName",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 180,
        fixed: "right",
        customRender: ({ record }: { record: { id: string; businessKey: string; alarmStatus: string } }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                editRow(record);
              }}
            >
              详情
            </Button>
            {record.alarmStatus === "ALARM_UN_CONFIRMED" && (
              <>
                <PopConfirm
                  title="是否确认该报警？"
                  onConfirm={() => {
                    alarmHandleConfirm(record);
                  }}
                >
                  <Button type="link" size="small" danger>
                    确认
                  </Button>
                </PopConfirm>
              </>
            )}
            {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" && (
              <>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    transferRow(record);
                  }}
                >
                  移交
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    suspendRow(record);
                  }}
                >
                  挂起
                </Button>
              </>
            )}
            {(record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" || record.alarmStatus === "ALARM_SUSPEND") && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleRow(record);
                }}
              >
                处理
              </Button>
            )}
          </>
        ),
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeDeviceSuperviseService.getAlarmRecordsPage({
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          alarmStatus: queryState.state.status,
          areaIds: queryState.state.area ? queryState.state.area.join("-") : "",
          period: queryState.state.period ? queryState.state.period.join(",") : queryState.state.period,
          applicationCode: "EQUIPMENT_SUPERVISION",
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch (error) {
        logger.debug(error);
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
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        status: "",
        area: [],
        period: [],
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };
    const { scrollY } = useTableScroll();

    onMounted(() => {
      getTableData();
    });
    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <RadioGroup
                v-model:value={queryState.state.status}
                buttonStyle="solid"
                options={[
                  { label: "所有", value: "" },
                  { label: "待接收", value: "ALARM_UN_CONFIRMED" },
                  { label: "处理中", value: "ALARM_PROGRESS_CONFIRMED" },
                  { label: "已挂起", value: "ALARM_SUSPEND" },
                  { label: "已处理", value: "ALARM_HANDLER" },
                ]}
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="所属区域">
              <AreaCascaderSelect v-model:value={queryState.state.area} style="width:180px" placeholder="请选择所属区域" />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="报警时间">
              <DateRangePicker v-model:value={queryState.state.period} allowClear={false} />
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
            rowKey="id"
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            tableCode={tableCode}
            pagination={false}
            scrollY={scrollY.value}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={queryState.state.pageNumber}
          v-model:pageSize={queryState.state.pageSize}
          v-model:total={queryState.state.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="通知列表" v-slots={layoutSlots} />
        <BatchHandleAlarmModal ref={batchHandleAlarmModalRef} onSuccess={submitHandleAlarm} />
        <SuspendModal ref={suspendModalRef} onSuccess={saveSuspend} />
        <UserPickerModal ref={userPickerModalRef} v-model:value={users.value} onUpdate:value={usersHandle} />
      </>
    );
  },
});

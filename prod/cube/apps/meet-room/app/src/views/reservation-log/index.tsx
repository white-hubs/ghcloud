import { cubeMeetRoomService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useLoopExportExcel } from "@/hook/use-loop-export-excel";
import { useTableScroll } from "@/hook/use-table-scroll";
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Select, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 预约记录 */
export const ReservationLog = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { exportLoading, exportData } = useLoopExportExcel();
    const flowCode = "MEETING_ROOM_RESERVATION";
    const formState = reactive<{
      keyword: string | undefined;
      status: string | undefined;
      date: number[] | undefined;
    }>({
      keyword: undefined,
      status: undefined,
      date: [],
    });
    const options = ref([
      { value: "APPOINTMENT", label: "已预约" },
      { value: "APPOINTMENT_IN", label: "预约中" },
      { value: "CANCEL_RESERVATION", label: "已取消" },
    ]);

    const columns = [
      {
        title: "序号",
        dataIndex: "idx",
        width: 70,
        align: "center",
        fixed: "left",
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "姓名",
        dataIndex: "userName",
        ellipsis: true,
        width: 180,
        fixed: "left",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "部门",
        dataIndex: "departmentName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作时间",
        dataIndex: "createTime",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
        },
      },
      {
        title: "预约状态",
        dataIndex: "operate",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? options.value.find((e) => e.value === text)?.label : "";
          return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
        },
      },
      {
        title: "会议室名称",
        dataIndex: "conferenceName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "会议时间",
        dataIndex: "timeInterval",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "会议物品登记",
        dataIndex: "goodsNames",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "会议取消理由",
        dataIndex: "cancelReason",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: unknown }): JSX.Element => {
          const { processInstanceId, currentTaskId } = record as { processInstanceId: string; currentTaskId: string; status: string };
          const isDetail = processInstanceId || currentTaskId;
          return (
            <>
              {isDetail ? (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    goDetail(record);
                  }}
                >
                  详情
                </Button>
              ) : (
                "--"
              )}
            </>
          );
        },
      },
    ];
    const goDetail = (record: unknown): void => {
      const { processInstanceId, currentTaskId, status } = record as { processInstanceId: string; currentTaskId: string; status: string };
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/stream-engine-render/index?businessType=${flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${pageTitle}`,
      );
    };
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeMeetRoomService.getAppointmentPage({
          keyword: formState.keyword || "",
          status: formState.status || "",
          date: formState.date?.length ? formState.date.join(",") : "",
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
    };

    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
    };
    const reset = (): void => {
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined;
      }
      dataSource.value = [];
      queryForm();
    };
    onMounted(() => {
      queryForm();
    });
    const { scrollY } = useTableScroll();
    const getExportData = async (pageNumber: number, pageSize: number): Promise<{ records: unknown[] }> => {
      try {
        const res = await cubeMeetRoomService.getAppointmentPage({
          keyword: formState.keyword || "",
          status: formState.status || "",
          date: formState.date?.length ? formState.date.join(",") : "",
          pageNumber,
          pageSize,
        });
        return res;
      } catch {
        return { records: [] };
      }
    };
    const downloadExcel = async (): Promise<void> => {
      await exportData({
        fileName: "会议预约记录",
        exportTotal: pagination.value.total,
        pageSize: 999,
        columns,
        getExportDataFunc: async (pageNumber: number, pageSize: number) => getExportData(pageNumber, pageSize),
      });
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button type="primary" loading={exportLoading.value} disabled={dataSource.value.length === 0} onClick={downloadExcel}>
              导出
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem label="预约状态" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Select v-model:value={formState.status} options={options} placeholder="请选择" style={{ width: "150px" }} />
            </FormItem>
            <FormItem label="选择日期" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <DateRangePicker v-model:value={formState.date} valueFormat="YYYY-MM-DD" />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.keyword} placeholder="会议室名称" showCount={false} />
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
            pagination={false}
            scrollY={scrollY.value}
            tableCode={tableCode}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={pagination.value.pageNumber}
          v-model:pageSize={pagination.value.pageSize}
          v-model:total={pagination.value.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
    );
  },
});

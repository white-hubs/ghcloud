import axios from "axios";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { hasPermission } from "@ghcloud/cube-permission-codes";
import { AntModal, Button, DateRangePicker, Form, FormItem, Image, Input, Page, PopOver, Select, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable, DeptTreeSelect } from "@ghcloud/generic-component";

import { authStore } from "@/api/auth-store";
import { clockInRecordPage, clockInRecordStatusUpdate } from "@/api/staff-clock-in";
import { AddClockInRecordModal } from "@/components/business/add-clock-in-record-modal/add-clock-in-record-modal";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";

import style from "@/assets/style.module.less";

export const ClockInRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const clockInAuthority = [
      { label: "撤销", value: "PC_CLOCK" },
      { label: "取消作废", value: "DISCARD_CLOCK" },
      { label: "作废", value: "MY_CLOCK" },
    ];
    const permission = appFunctionCodes.attendanceClockInRecord;
    const defaultPeriod = [dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().endOf("month").format("YYYY-MM-DD")];
    const formState = reactive<{
      userName: string;
      period: string[];
      orgId: string | undefined;
      ways: string | undefined;
    }>({
      userName: "",
      period: defaultPeriod,
      orgId: undefined,
      ways: undefined,
    });

    const exportLoading = ref(false);
    const exportExcel = async (): Promise<void> => {
      exportLoading.value = true;
      axios({
        url: "/api/attendance/clockIn/getClockInLogExcel",
        responseType: "blob",
        method: "get",
        params: { ...formState, period: formState.period.join(",") },
        headers: {
          tenant: authStore.tenant,
          terminal: authStore.terminal,
          token: authStore.token,
          Authorization: `Bearer ${authStore.token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          const link = document.createElement("a");
          const blob = new Blob([res.data], { type: "application/vnd.ms-excel" }); // 文件流处理
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "打卡记录.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          message.error(error?.message || "操作失败");
        })
        .finally(() => {
          exportLoading.value = false;
        });
    };

    const imgPrevpath = ref("");
    const imgPrev = ref(false);
    /** 查看图片 */
    const viewPhoto = (record: { photoFileId: string | null; img: { path: string | undefined } }): void => {
      if (!record.photoFileId) {
        message.warn("抱歉系统暂无数据，无法查看");
        return;
      }
      if (!record.img.path) {
        message.warn("无法查看，照片数据已清理");
        return;
      }
      imgPrevpath.value = record.img.path;
      imgPrev.value = true;
    };
    const imgPreviewChange = (value: boolean): void => {
      imgPrev.value = value;
    };

    /** 记录变更 */
    const recordCancel = (record: { id: string; clockInAuthority: string }): void => {
      AntModal.confirm({
        centered: true,
        content: `确定${clockInAuthority.find((e) => e.value === record.clockInAuthority)?.label}该条打卡记录吗?`,
        async onOk() {
          await clockInRecordStatusUpdate(record.id);
          AntModal.destroyAll();
          message.success("操作成功");
          getTableData();
        },
        onCancel() {
          AntModal.destroyAll();
        },
      });
    };

    const addClockInRecordModalRef = ref<{ openModal: () => void }>();
    /** 新增记录 */
    const addRecord = (): void => {
      addClockInRecordModalRef.value?.openModal();
    };
    const columns = [
      {
        title: "日期",
        dataIndex: "actualClockInTime",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { clockInAuthority: string } }): VNode => {
          const time = text ? dayjs(text).format("YYYY-MM-DD") : "--";
          const beGray = record.clockInAuthority === "DISCARD_CLOCK";
          return (
            <PopOver content={time || "--"} class={beGray ? style["gray-color"] : ""}>
              {time || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "姓名",
        dataIndex: "userName",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { clockInAuthority: string } }): VNode => {
          const beGray = record.clockInAuthority === "DISCARD_CLOCK";
          return (
            <PopOver content={text || "--"} class={beGray ? style["gray-color"] : ""}>
              {text || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "部门",
        dataIndex: "orgName",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { clockInAuthority: string } }): VNode => {
          const beGray = record.clockInAuthority === "DISCARD_CLOCK";
          return (
            <PopOver content={text || "--"} class={beGray ? style["gray-color"] : ""}>
              {text || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "打卡时间",
        dataIndex: "actualClockInTime2",
        ellipsis: true,
        customRender: ({ record }: { record: { actualClockInTime: string; clockInAuthority: string } }): VNode => {
          const time = record.actualClockInTime ? dayjs(record.actualClockInTime).format("HH:mm:ss") : "--";
          const beGray = record.clockInAuthority === "DISCARD_CLOCK";
          return (
            <PopOver content={time || "--"} class={beGray ? style["gray-color"] : ""}>
              {time || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "打卡方式",
        dataIndex: "ways",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { clockInAuthority: string } }): VNode => {
          let way = "";
          if (!text) {
            way = "--";
          } else {
            way = text === "GPS" ? "GPS打卡" : "考勤机打卡";
          }
          const beGray = record.clockInAuthority === "DISCARD_CLOCK";
          return (
            <PopOver content={way || "--"} class={beGray ? style["gray-color"] : ""}>
              {way || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "打卡地点",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { clockInAuthority: string } }): VNode => {
          const beGray = record.clockInAuthority === "DISCARD_CLOCK";
          return (
            <PopOver content={text || "--"} class={beGray ? style["gray-color"] : ""}>
              {text || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        customRender: ({
          record,
        }: {
          record: { id: string; img: { path: string }; clockInAuthority: string; photoFileId: string | null };
        }): VNode => {
          return (
            <>
              {hasPermission(permission.viewPic) && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    viewPhoto(record);
                  }}
                >
                  查看图片
                </Button>
              )}
              {record.clockInAuthority && hasPermission(permission.update) && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    recordCancel(record);
                  }}
                  danger
                >
                  {clockInAuthority.find((e) => e.value === record.clockInAuthority)?.label ?? "未知状态"}
                </Button>
              )}
            </>
          );
        },
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const queryCache = useListQueryCache<{
      userName: string;
      period: string[];
      orgId: string | undefined;
      ways: string | undefined;
      pageNumber: number;
      pageSize: number;
    }>({
      defaults: {
        userName: "",
        period: defaultPeriod,
        orgId: undefined,
        ways: undefined,
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        userName: formState.userName,
        period: formState.period,
        orgId: formState.orgId,
        ways: formState.ways,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        const nextPeriod = next.period as string[] | string | undefined;
        formState.userName = next.userName ?? "";
        formState.period = Array.isArray(nextPeriod)
          ? nextPeriod
          : typeof nextPeriod === "string" && nextPeriod
            ? nextPeriod.split(",")
            : defaultPeriod;
        formState.orgId = next.orgId;
        formState.ways = next.ways;
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await clockInRecordPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
          period: formState.period.join(","),
        });
        if (res.data) {
          const { records, total } = res.data;
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };

    const queryForm = async (): Promise<void> => {
      pagination.value.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    const { scorllY } = useTableScroll();

    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-header": (): VNode => {
        return (
          <div>
            {hasPermission(permission.add) && (
              <Button type="primary" onClick={addRecord} style="margin-right:10px">
                新增
              </Button>
            )}
            {hasPermission(permission.export) && (
              <Button type="primary" disabled={dataSource.value.length === 0} onClick={exportExcel} loading={exportLoading.value}>
                导出
              </Button>
            )}
          </div>
        );
      },
      "layout-content": (): VNode => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="日期">
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={formState.userName} placeholder="请输入人员姓名" showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="部门">
                <DeptTreeSelect v-model:value={formState.orgId} style={{ width: "223px" }} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="打卡方式">
                <Select
                  v-model:value={formState.ways}
                  style={{ width: "223px" }}
                  options={[
                    { label: "考勤机打卡", value: "DEVICE" },
                    { label: "GPS地点打卡", value: "GPS" },
                  ]}
                />
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
              class={style["clock-in-record-table"]}
              rowKey="id"
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              scrollY={scorllY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        );
      },
      "footer-page": (): VNode => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    return (): VNode => (
      <>
        <Layout title={pageTitle ?? "打卡记录"} v-slots={layoutSlots} />
        <AddClockInRecordModal ref={addClockInRecordModalRef} onSuccess={reset} />
        <Image style="display:none" src={imgPrevpath.value} preview={{ visible: imgPrev.value, onVisibleChange: imgPreviewChange }} />
      </>
    );
  },
});

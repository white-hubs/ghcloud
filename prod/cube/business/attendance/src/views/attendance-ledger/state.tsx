import dayjs from "dayjs";
import { defineComponent, reactive, ref, onMounted, type VNode } from "vue";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { Button, DatePicker, Form, FormItem, Input, type PickerMode, Table, Page, message, Modal } from "@ghcloud/cube-ui";
import { useListQueryCache } from "@ghcloud/cube-utils";
import { DeptTreeSelect } from "@ghcloud/generic-component";

import { SequentialPage, SequentialLedgerExport, SequentialDetail } from "@/api/attendance-ledger";
import { Layout } from "@/components/layout/layout";
import { logger } from "@/logger";

import "./index.less";
interface TableTitle {
  day: string;
  week: string;
}

// interface TypeValueList {
//   /** 余额 */
//   availableBalance: string;
//   /** 假期类型id，假期规则id */
//   holidayRuleId: number;
//   /** 员工id */
//   staffId: string;
// }
export const State = defineComponent({
  setup: () => {
    const columns = [
      {
        title: `${KEYWORD_ALIAS.staff}姓名`,
        dataIndex: "staffName",
        fixed: "left",
        width: 180,
      },
      {
        title: "部门",
        dataIndex: "deptName",
        fixed: "left",
        width: 180,
      },
    ];
    const statusColumns = [
      {
        title: `${KEYWORD_ALIAS.staff}姓名`,
        dataIndex: "staffName",
        fixed: "left",
        width: 180,
      },
      {
        title: "状态",
        dataIndex: "status",
        fixed: "left",
        width: 180,
        customRender: ({ text }: { text: string }): VNode => {
          return statusList[text].title;
        },
      },
      {
        title: "开始时间",
        dataIndex: "startTime",
        fixed: "left",
        width: 180,
        customRender: ({ text }: { text: string }): string => {
          return dayjs(text).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        title: "结束时间",
        dataIndex: "endTime",
        fixed: "left",
        width: 180,
        customRender: ({ text }: { text: string }): string => {
          return dayjs(text).format("YYYY-MM-DD HH:mm:ss");
        },
      },
    ];
    const tableColumns = ref<any>([]);
    const NumColumns = ref<any>([]);
    // const = useRoute()
    const time = dayjs().startOf("month").format("YYYY-MM");
    const searchData = reactive<{
      timeType: PickerMode;
      staffName: string;
      deptId: string;
      groupId: string;
      yearMonth: string;
    }>({
      yearMonth: time,
      timeType: "month",
      staffName: "",
      deptId: "",
      groupId: "",
    });
    const currentMouth = ref(time);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const queryCache = useListQueryCache<{
      yearMonth: string;
      timeType: PickerMode;
      staffName: string;
      deptId: string;
      groupId: string;
      pageNumber: number;
      pageSize: number;
    }>({
      defaults: {
        yearMonth: time,
        timeType: "month",
        staffName: "",
        deptId: "",
        groupId: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        yearMonth: searchData.yearMonth,
        timeType: searchData.timeType,
        staffName: searchData.staffName,
        deptId: searchData.deptId,
        groupId: searchData.groupId,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        searchData.yearMonth = (next.yearMonth as string) ?? time;
        searchData.timeType = (next.timeType as PickerMode) ?? "month";
        searchData.staffName = (next.staffName as string) ?? "";
        searchData.deptId = (next.deptId as string) ?? "";
        searchData.groupId = (next.groupId as string) ?? "";
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => {
        queryCache.sync();
      });
    };

    const statusList: any = {
      LEAVE: { title: "请假", color: "#b886f8" },
      POST: { title: "离岗", color: "#eba552" },
      AWAY: { title: "出差", color: "#e8a9b0" },
      REST: { title: "休息", color: "#96d3f4" },
      WORKING: { title: "在岗", color: "#c3c3c3" },
    };
    const ElementDiv: {
      workSum: (sunStatus: { day: string; count: string }[], day: string) => string;
      leaveSum: (sunStatus: { day: string; count: string }[], day: string) => string;
      postSum: (sunStatus: { day: string; count: string }[], day: string) => string;
      awaySum: (sunStatus: { day: string; count: string }[], day: string) => string;
      restSum: (sunStatus: { day: string; count: string }[], day: string) => string;
    } = {
      workSum: (sunStatus: { day: string; count: string }[], day: string) => {
        const number = sunStatus.find((ele) => ele.day === day);
        if (!number) return "--";
        return number?.count;
      },
      leaveSum: (sunStatus: { day: string; count: string }[], day: string) => {
        const number = sunStatus.find((ele) => ele.day === day);
        if (!number) return "--";
        return number?.count;
      },
      postSum: (sunStatus: { day: string; count: string }[], day: string) => {
        const number = sunStatus.find((ele) => ele.day === day);
        if (!number) return "--";
        return number?.count;
      },
      awaySum: (sunStatus: { day: string; count: string }[], day: string) => {
        const number = sunStatus.find((ele) => ele.day === day);
        if (!number) return "--";
        return number?.count;
      },
      restSum: (sunStatus: { day: string; count: string }[], day: string) => {
        const number = sunStatus.find((ele) => ele.day === day);
        if (!number) return "--";
        return number?.count;
      },
    };
    const getTableData = async (): Promise<void> => {
      logger.info(currentMouth.value);
      const { data } = await SequentialPage({ ...searchData, ...pagination.value });
      const { records, total, dateTableList, sumStatus } = data as unknown as {
        records: unknown[];
        total: number;
        dateTableList: TableTitle[];
        sumStatus: {
          awaySum: { day: string; count: string }[];
          leaveSum: { day: string; count: string }[];
          postSum: { day: string; count: string }[];
          restSum: { day: string; count: string }[];
          workSum: { day: string; count: string }[];
        };
      };
      dataSource.value = records;

      NumColumns.value = [
        {
          title: `${KEYWORD_ALIAS.staff}状态`,
          dataIndex: "title",
          fixed: "left",
          width: 180,
        },
        ...dateTableList.map((item) => {
          return {
            title: `${item.week}(${item.day})`,
            dataIndex: "",
            ellipsis: true,
            width: 180,
            customRender: (record: {
              record: {
                type: string;
              };
            }): VNode => {
              return (ElementDiv as any)[record.record.type]((sumStatus as any)[record.record.type], item.day);
            },
          };
        }),
      ];
      tableColumns.value = [
        ...columns,
        ...dateTableList.map((item) => {
          return {
            title: `${item.week}(${item.day})`,
            dataIndex: "",
            ellipsis: true,
            width: 180,
            customRender: (record: {
              record: {
                staffId: string;
                dateList: {
                  day: string;
                  statusList: string[];
                }[];
              };
            }): VNode[] | string => {
              logger.info(record);
              const day = item.day;
              const number = record.record.dateList.find((ele) => ele.day === day);
              if (!number) return "--";
              logger.info(number, 7878);
              const list = number?.statusList.length > 1 ? number?.statusList.filter((item) => item !== "REST") : number.statusList;
              return list.map((info) => {
                return (
                  <span
                    key={info}
                    onClick={() => {
                      detailsList(record.record.staffId, day);
                    }}
                    style={{ color: statusList[info]?.color, marginRight: "10px", cursor: "pointer" }}
                  >
                    {statusList[info]?.title}
                  </span>
                );
              });
            },
          };
        }),
      ];

      pagination.value.total = total;
    };
    const statusDetailsList = ref<any>([]);
    const detailsList = async (staffId: string, day: string): Promise<void> => {
      const { data } = await SequentialDetail({
        staffId,
        day: +new Date(searchData.yearMonth + "-" + day),
      });

      visible.value = true;
      statusDetailsList.value = data;
      // logger.info(res)
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      currentMouth.value = time;
      await getTableData();
    };
    const queryForm = async (): Promise<void> => {
      pagination.value.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        await SequentialLedgerExport({ ...searchData })
          .then((res) => {
            const { data } = res;
            const link = document.createElement("a");
            const blob = new Blob([data as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "汇总统计.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((res) => {
            logger.debug(res);
            message.error("导出失败");
          });
      } catch (error) {
        logger.error(error);
      } finally {
        setTimeout(() => {
          exportLoading.value = false;
        }, 1000);
      }
    };
    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });
    const visible = ref(false);
    const layoutSlots = {
      "layout-header": (): VNode => {
        return (
          <Button type="primary" onClick={exportExcel} loading={exportLoading.value}>
            导出
          </Button>
        );
      },
      "layout-content": (): VNode => {
        return (
          <>
            <div class="classes-Summary-form">
              <div class="search">
                <Form layout="inline" model={searchData}>
                  <FormItem label={`${KEYWORD_ALIAS.staff}`}>
                    <Input v-model:value={searchData.staffName} />
                  </FormItem>
                  <FormItem label="部门">
                    <DeptTreeSelect style={{ width: "200px" }} v-model:value={searchData.deptId} />
                  </FormItem>
                  {/* <FormItem label='考勤组'>
                    <Select />
                  </FormItem> */}
                  <FormItem>
                    <DatePicker picker="month" v-model:value={searchData.yearMonth} valueFormat="YYYY-MM" format="YYYY-MM" />
                  </FormItem>
                  <FormItem>
                    <Button type="primary" onClick={queryForm}>
                      查询
                    </Button>
                    <Button type="default" style={{ marginLeft: "10px" }} onClick={reset}>
                      重置
                    </Button>
                  </FormItem>
                </Form>
              </div>
              <div class="search">
                <Table
                  pagination={false}
                  columns={tableColumns.value}
                  dataSource={dataSource.value}
                  size="small"
                  scrollX={tableColumns.value.length * 200}
                />
                <Table
                  pagination={false}
                  columns={NumColumns.value}
                  dataSource={numSource.value}
                  size="small"
                  scrollX={NumColumns.value.length * 200}
                />
              </div>
            </div>
            <Modal
              title={`${KEYWORD_ALIAS.staff}状态明细`}
              v-model:visible={visible.value}
              width={800}
              onOk={() => {
                visible.value = false;
              }}
            >
              <Table pagination={false} columns={statusColumns} dataSource={statusDetailsList.value} size="small" />
            </Modal>
          </>
        );
      },
      "footer-page": (): VNode => {
        return (
          <>
            <Page
              v-model:current={pagination.value.pageNumber}
              v-model:pageSize={pagination.value.pageSize}
              v-model:total={pagination.value.total}
              onPageChange={pageChange}
            />
          </>
        );
      },
    };
    const exportLoading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const numSource = ref<unknown[]>([
      { title: "在岗", type: "workSum" },
      { title: "请假", type: "leaveSum" },
      { title: "离岗", type: "postSum" },
      { title: "出差", type: "awaySum" },
      { title: "休息", type: "restSum" },
    ]);

    return (): VNode => <Layout title={`${KEYWORD_ALIAS.staff}状态表`} v-slots={layoutSlots} />;
  },
});

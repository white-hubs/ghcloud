import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, DatePicker, Form, FormItem, Input, Page, PopOver, Table, Tag, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { DeptTreeSelect } from "@ghcloud/generic-component";

import { clockInLedgerPage, type AttClockInLedgerDetailsResult, clockInLedgerExport } from "@/api/staff-clock-in";
import { Layout } from "@/components/layout/layout";
import { convertToChineseWeekday } from "@/hook/calendar";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";
import { ClockInStatusOptions, ClockInStatus, ClockInStatusColor, ClockInClassesStatus } from "@/types/classes";

import style from "@/assets/style.module.less";

export const ClockInLedger = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const permission = appFunctionCodes.attendanceclockInLedger;
    const formState = reactive({
      userName: "",
      ledgerDate: dayjs().format("YYYY-MM"),
      orgId: undefined,
    });
    const exportLoading = ref(false);
    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        await clockInLedgerExport({ ...formState })
          .then((res) => {
            const { data } = res;
            const link = document.createElement("a");
            const blob = new Blob([data as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "打卡台账.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((res) => {
            logger.debug(res);
            message.warn("未查询到数据，无法导出");
          });
      } catch (error) {
        logger.error(error);
      } finally {
        setTimeout(() => {
          exportLoading.value = false;
        }, 1000);
      }
    };

    const columns = [
      {
        title: `${KEYWORD_ALIAS.staff}姓名`,
        dataIndex: "userName",
        ellipsis: true,
        width: 120,
        align: "center",
        fixed: "left",
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "部门",
        dataIndex: "orgName",
        ellipsis: true,
        width: 120,
        align: "center",
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
    ];

    const tableColumns = ref([...columns]);
    const tableSolt = {
      headerCell: ({
        column,
      }: {
        column: { calendar: true; detail: AttClockInLedgerDetailsResult; title: string; date: string };
      }): VNode | string => {
        if (column.calendar) {
          return (
            <div class={style["calendar-tabel-header"]}>
              <span>
                {dayjs(column.date).format("MM")}-{`${column.detail.today < 10 ? 0 : ""}${column.detail.today}`}
              </span>
              <span>{column.detail.week}</span>
            </div>
          );
        }
        return column.title;
      },
    };

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const queryCache = useListQueryCache({
      defaults: {
        userName: "",
        ledgerDate: dayjs().format("YYYY-MM"),
        orgId: undefined,
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        userName: formState.userName,
        ledgerDate: formState.ledgerDate,
        orgId: formState.orgId,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        formState.userName = (next.userName as string) ?? "";
        formState.ledgerDate = (next.ledgerDate as string) ?? dayjs().format("YYYY-MM");
        formState.orgId = next.orgId as undefined;
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await clockInLedgerPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
        });
        if (res.data) {
          // 默认显示表头日期
          const endDate = dayjs(formState.ledgerDate).endOf("month").date();
          const defaultDetails = [];
          for (let index = 1; index <= endDate; index++) {
            const today = dayjs(formState.ledgerDate)
              .startOf("month")
              .add(index - 1, "day");
            defaultDetails.push({
              week: convertToChineseWeekday(today.day()),
              today: today.date(),
              details: [],
            });
          }
          const details = res.data.records.length
            ? (res.data.records[0] as { details: AttClockInLedgerDetailsResult[] }).details
            : defaultDetails;
          const calendarColumns = details.map((e) => {
            return {
              title: e.week,
              ellipsis: true,
              calendar: true,
              detail: e,
              width: 220,
              date: formState.ledgerDate,
              today: e.today,
              customRender: ({
                record,
                column,
              }: {
                record: { id: string; details: AttClockInLedgerDetailsResult[] };
                index: number;
                column: { today: number };
              }): VNode[] | VNode => {
                const detail = record.details[column.today - 1];
                if (detail.details.length === 0 || detail.details.find((e) => e.state === ClockInClassesStatus.NO_CLOCK)) {
                  return (
                    <div class={style["scheduling-item"]}>
                      <Tag color="green" class={style["cell-classes-tag"]} style="height:100%">
                        --
                      </Tag>
                    </div>
                  );
                }
                if (detail.details.find((e) => e.state === ClockInClassesStatus.REST)) {
                  return (
                    <div class={style["scheduling-item"]}>
                      <Tag color="green" class={style["cell-classes-tag"]} style="height:100%">
                        --
                      </Tag>
                    </div>
                  );
                }

                return detail.details.map((e) => {
                  const statusArr: JSX.Element[] = [];
                  if (e.state === ClockInClassesStatus.NORMAL) {
                    statusArr.push(<span style={{ color: "green" }}>正常</span>);
                  } else if (e.state === ClockInClassesStatus.NEGLECT_WORK) {
                    statusArr.push(<span style={{ color: "red" }}>上班缺卡、下班缺卡</span>);
                  } else {
                    e.stateDetails.forEach((status, i) => {
                      let text = ClockInStatusOptions.find((op) => op.value === status.name)?.label;
                      if (status.name === ClockInStatus.ABNORMAL_WORK) {
                        // 异常状态把异常的值反显出来
                        text = status.value;
                      }
                      const color = ClockInStatusColor.find((op) => op.value === status.name)?.color ?? "";
                      statusArr.push(<span style={{ color }}>{text}</span>);
                      if (e.stateDetails.length > 1 && i !== e.stateDetails.length - 1) {
                        statusArr.push(<span>,</span>);
                      }
                    });
                  }
                  let timeDom = (
                    <span>
                      {`(${e.startWorkTime || "-"}${e.startWorkOmit ? "补卡" : ""}${e.startWorkOut ? "外勤" : ""},${e.endWorkTime || "-"}${e.endWorkOmit ? "补卡" : ""}${e.endWorkOut ? "外勤" : ""})`}
                    </span>
                  );
                  if (e.state === ClockInClassesStatus.NEGLECT_WORK) {
                    timeDom = <span>(-,-)</span>;
                  }

                  return (
                    <div class={style["clock-in-legder-status"]} key={Math.floor(Math.random() * parseInt(record.id) + 1)}>
                      <span>{statusArr}</span>
                      {timeDom}
                    </div>
                  );
                });
              },
            };
          });
          tableColumns.value = [...columns, ...calendarColumns] as never[];
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
      getTableData().then(() => {
        queryCache.sync();
      });
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
      "layout-header": (): VNode | boolean => {
        return (
          hasPermission(permission.export) && (
            <Button type="primary" onClick={exportExcel} loading={exportLoading.value}>
              导出
            </Button>
          )
        );
      },
      "layout-content": (): VNode => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="日期">
                <DatePicker
                  v-model:value={formState.ledgerDate}
                  picker="month"
                  placeholder="请选择年月"
                  valueFormat="YYYY-MM"
                  allowClear={false}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={formState.userName} placeholder="请输入人员姓名" showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="部门">
                <DeptTreeSelect v-model:value={formState.orgId} style={{ width: "223px" }} />
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
            <Table
              v-slots={tableSolt}
              columns={tableColumns.value}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              size="small"
              class="ledger-table"
              scrollY={scorllY.value - 22}
              scrollX={1000}
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
    return (): VNode => <Layout title={pageTitle ?? "打卡台账"} v-slots={layoutSlots} class={style["clock-in-table"]} />;
  },
});

import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, Form, FormItem, Input, Page, PopOver, message } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable, DeptTreeSelect } from "@ghcloud/generic-component";

import { leaveBalanceExport, leaveBalancePage } from "@/api/staff-leave";
import { AttendanceGroupSelect } from "@/components/business/attendance-group-select/attendance-group-select";
import { BatchUpdateModel } from "@/components/business/vacation-balance-modal/batch-update-modal";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";

interface TableTitle {
  id: number;
  name: string;
  notLimit: boolean;
  unit: "天" | "小时";
}

interface TypeValueList {
  /** 余额 */
  availableBalance: string;
  /** 假期类型id，假期规则id */
  holidayRuleId: number;
  /** 员工id */
  staffId: string;
}

/** 员工假期余额 */
export const VacationBalance = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const permission = appFunctionCodes.attendanceVacationBalance;
    const formState = reactive({
      staffName: "",
      deptId: undefined,
      groupId: undefined,
    });
    const exportLoading = ref(false);
    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        await leaveBalanceExport({ ...formState })
          .then((res) => {
            const { data } = res;
            const link = document.createElement("a");
            const blob = new Blob([data as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "假期余额.xlsx");
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

    const toDetail = (record: { staffId: string }, holidayRuleId?: number): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/attendance-management/leave-balance-detail?id=${record.staffId}&holidayRuleId=${holidayRuleId}`,
      );
    };

    /**
     * 跳转详情-新窗口
     * @param record
     */
    const toDetailWindow = (record: { staffId: string }): void => {
      window.open(`/portal/attendance-management/leave-balance-detail?id=${record.staffId}&holidayRuleId=undefined`, "_blank");
    };

    const columns = [
      {
        title: "姓名",
        dataIndex: "staffName",
        ellipsis: true,
        fixed: "left",
        width: 180,
        customRender: ({ record }: { record: { staffName: string; staffId: string } }): VNode => {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => {
                toDetailWindow(record);
              }}
            >
              {record.staffName}
            </Button>
          );
        },
      },
      {
        title: "考勤组",
        dataIndex: "groupName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "部门",
        dataIndex: "deptName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "入职时间",
        dataIndex: "enterDate",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): VNode => {
          const time = text ? dayjs(text).format("YYYY-MM-DD") : "--";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
    ];
    const tableSlot = {
      headerCell: ({ column }: { column: { title: string } }): string => {
        return column.title;
      },
    };
    const tableColumns = ref([...columns]);
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const queryCache = useListQueryCache({
      defaults: {
        staffName: "",
        deptId: undefined,
        groupId: undefined,
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        staffName: formState.staffName,
        deptId: formState.deptId,
        groupId: formState.groupId,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        formState.staffName = (next.staffName as string) ?? "";
        formState.deptId = next.deptId as undefined;
        formState.groupId = next.groupId as undefined;
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await leaveBalancePage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
        });
        if (res.data) {
          const { records, total, tableTitle } = res.data as unknown as { records: unknown[]; total: number; tableTitle: TableTitle[] };

          // @ts-expect-error
          tableColumns.value = [
            ...columns,
            ...tableTitle.map((e) => {
              return {
                title: `${e.name}(${e.unit})`,
                dataIndex: `${e.name}(${e.unit})`,
                ellipsis: true,
                width: 180,
                customRender: ({ record }: { record: { typeValueList: TypeValueList[]; staffId: string } }): VNode | string => {
                  const holidayRuleId = e.id;
                  // 判断你是否有这个假期
                  if (!record.typeValueList.find((ele) => ele.holidayRuleId === holidayRuleId)) {
                    return "--";
                  }
                  if (e.notLimit) {
                    return "不限额";
                  }
                  const res = record.typeValueList.find((ele) => ele.holidayRuleId === e.id);
                  if (res) {
                    return (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          toDetail(record, holidayRuleId);
                        }}
                      >
                        {res.availableBalance}
                      </Button>
                    );
                  }
                  return "--";
                },
              };
            }),
          ];
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch (error) {
        logger.debug(error);
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
    const updateModelRef = ref<{ openModal: () => void }>();
    const actionType = ref<"add" | "update">("update");
    const batchUpdate = (action: "add" | "update"): void => {
      actionType.value = action;
      updateModelRef.value?.openModal();
    };
    const layoutSlots = {
      "layout-header": (): VNode => {
        return (
          <div>
            {hasPermission(permission.batchUpdate) && (
              <Button
                style={{ marginRight: "16px" }}
                type="primary"
                onClick={() => {
                  batchUpdate("update");
                }}
              >
                批量修改
              </Button>
            )}
            {hasPermission(permission.batchAdd) && (
              <Button
                style={{ marginRight: "16px" }}
                type="primary"
                onClick={() => {
                  batchUpdate("add");
                }}
              >
                批量新增
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
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={formState.staffName} placeholder="人员姓名" showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="部门">
                <DeptTreeSelect v-model:value={formState.deptId} style="width:180px" />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="考勤组">
                <AttendanceGroupSelect v-model:value={formState.groupId} style="width:180px" />
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
              v-slots={tableSlot}
              columns={tableColumns.value}
              loading={loading.value}
              dataSource={dataSource.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
              scrollY={scorllY.value}
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
    return (): VNode => (
      <>
        <Layout title={pageTitle ?? `${KEYWORD_ALIAS.staff}假期余额`} v-slots={layoutSlots} />
        <BatchUpdateModel ref={updateModelRef} action={actionType.value} onEnter={getTableData} />
      </>
    );
  },
});

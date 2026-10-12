import dayjs from "dayjs";
import { computed, defineComponent, onMounted, reactive, ref, type VNode } from "vue";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { AntModal, Button, DatePicker, Form, FormItem, Input, Page, PopOver, Table, Tag, message } from "@ghcloud/cube-ui";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { UserPickerModal } from "@ghcloud/generic-component";

import {
  staffDutyExport,
  staffDutyPage,
  getDutyStaffListByMonth,
  staffDutyInsert,
  staffDutyhand,
  staffDutyRemove,
  staffDutyDownLoad,
} from "@/api/scheduling-manage";
import { ClassesSelectModal } from "@/components/business/classes-select-modal/classes-select-modal";
import { ImportDutyTemplate } from "@/components/business/import-duty-template/import-duty-template";
import { Layout } from "@/components/layout/layout";
import { getCalendarData } from "@/hook/calendar";
import { useCtrlEvent } from "@/hook/use-ctrl-event";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";
import { type ClassesType, classesColor } from "@/types/classes";

import style from "@/assets/style.module.less";
interface TableRow {
  staffId: string;
  staffName: string;
  staffDeptId: string;
  staffDeptName: string;
  dateClassList: {
    classesId: string;
    classesName: string;
    classesNickName: string;
    classesRealEndTime: number;
    classesRealStartTime: number;
    dutyDate: number;
    yearMonth: string;
    classesType: ClassesType;
    classesEndTimeIsMorrow: boolean;
  }[];
}

interface DutyAction {
  yearMonth: string; // 2023-09
  dutyStaffList: {
    staffId: string;
    staffName: string;
    staffDeptId: string;
    staffDeptName: string;
    staffDateList: {
      dutyDate: string;
      dateClassList:
        | {
            classId: string;
            className: string;
            classType: string;
            startWorkTime: string;
            endWorkTime: string;
          }[]
        | undefined;
    }[];
  }[];
}

interface CellDate {
  date: string;
  weekday: number;
  weekdayChinese: string;
}

interface Classes {
  id: string;
  name: string;
  nickName: string;
  classesType: ClassesType;
  startWorkTime: string;
  endWorkTime: string;
  endTimeIsMorrow: boolean;
}

/** 员工值班 */
export const StaffDuty = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const { scorllY } = useTableScroll();
    const permission = appFunctionCodes.attendanceStaffDuty;
    const formState = reactive({
      keyword: "",
      yearMonth: dayjs().format("YYYY-MM"),
    });
    const queryCache = useListQueryCache<{
      keyword: string;
      yearMonth: string;
      pageNumber: number;
      pageSize: number;
    }>({
      defaults: {
        keyword: "",
        yearMonth: dayjs().format("YYYY-MM"),
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        keyword: formState.keyword,
        yearMonth: formState.yearMonth,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        formState.keyword = (next.keyword as string) ?? "";
        formState.yearMonth = (next.yearMonth as string) ?? dayjs().format("YYYY-MM");
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const selectedRowKeys = ref<string[]>([]);
    const exportLoading = ref(false);
    const downLoading = ref(false);
    /** 班次集合 */
    const classes = ref<Classes[]>([]);
    const classesSelectModalRef = ref<{ openModal: () => void }>();
    /** 人员集合 */
    const staffs = ref<{ id: string; name: string }[]>([]);
    const staffSelectModalRef = ref<{ openModal: () => void }>();
    const chooseStaff = async (): Promise<void> => {
      message.loading("请稍后");
      // 获取当月已值班的人员集合
      staffs.value = (await getDutyStaffListByMonth({ yearMonth: formState.yearMonth })).data ?? [];
      message.destroy();
      staffSelectModalRef.value?.openModal();
    };
    /** 选择人员回调  插入 */
    const insertStaff = async (val: { id: string; name: string; organizations: { id: string; name: string }[] }[]): Promise<void> => {
      staffs.value = (await getDutyStaffListByMonth({ yearMonth: formState.yearMonth })).data ?? [];
      const insertStaffs = [];
      for (const item of val) {
        const find = staffs.value.findIndex((e) => e.id === item.id) !== -1;
        if (!find) {
          insertStaffs.push({
            staffId: item.id,
            staffName: item.name,
            staffDeptId: item.organizations.length ? item.organizations[item.organizations.length - 1].id : "",
            staffDeptName: item.organizations.length ? item.organizations[item.organizations.length - 1].name : "",
          });
        }
      }
      if (insertStaffs.length) {
        await staffDutyInsert({
          yearMonth: formState.yearMonth,
          staffList: insertStaffs,
        });
        queryForm();
      }
    };

    useCtrlEvent({
      onKeyDown: (): void => {
        changePathStatus(true);
      },
      onKeyUp: (): void => {
        openPatch.value = false;
      },
    });

    /** 导出 */
    const exportExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        await staffDutyExport({ ...formState })
          .then((res) => {
            const { data } = res;
            const link = document.createElement("a");
            const blob = new Blob([data as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", `${KEYWORD_ALIAS.staff}值班.xlsx`);
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

    /** 下载 */
    const download = async (): Promise<void> => {
      try {
        downLoading.value = true;
        await staffDutyDownLoad({ ...formState })
          .then((res) => {
            const { data } = res;
            const link = document.createElement("a");
            const blob = new Blob([data as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", `${KEYWORD_ALIAS.staff}值班.xlsx`);
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
          downLoading.value = false;
        }, 1000);
      }
    };

    /** 批量操作状态 */
    const openPatch = ref(false);
    const changePathStatus = (patchStatus?: boolean): void => {
      openPatch.value = patchStatus ?? !openPatch.value;
      if (!openPatch.value) {
        selectCells.value.length = 0;
      }
    };
    /** 选中单元格集合 */
    const selectCells = ref<
      {
        staffId: string;
        staffName: string;
        staffDeptId: string;
        staffDeptName: string;
        date: string;
        weekday: number;
        weekdayChinese: string;
      }[]
    >([]);
    /** 选中单元格事件 */
    const clickCell = (record: TableRow, cellDate: CellDate): void => {
      const item = {
        staffId: record.staffId,
        staffName: record.staffName,
        ...cellDate,
        staffDeptId: record.staffDeptId,
        staffDeptName: record.staffDeptName,
      };
      if (!openPatch.value) {
        selectCells.value = [item];
        return;
      }
      const findIndex = selectCells.value.findIndex((e) => e.staffId === record.staffId && e.date === cellDate.date);
      if (findIndex !== -1) {
        selectCells.value.splice(findIndex, 1);
      } else {
        selectCells.value.push(item);
      }
    };
    const handleUpdate = async (action: "empty" | "remove" | "insert", classes?: Classes): Promise<void> => {
      const params: DutyAction = {
        yearMonth: formState.yearMonth,
        dutyStaffList: [],
      };
      selectCells.value.forEach((cell) => {
        const findStaff = params.dutyStaffList.find((e) => e.staffId === cell.staffId);
        if (!findStaff) {
          params.dutyStaffList.push({
            staffId: cell.staffId,
            staffName: cell.staffName,
            staffDeptId: cell.staffDeptId,
            staffDeptName: cell.staffDeptName,
            staffDateList: [],
          });
        }
      });

      params.dutyStaffList.forEach((staff) => {
        selectCells.value.forEach((cell) => {
          const record = dataSource.value.find((e) => e.staffId === staff.staffId);
          // 当前选择的班次
          const handClassList =
            classes?.id && action === "insert"
              ? [
                  {
                    classId: classes.id,
                    className: classes.name,
                    classNickName: classes.nickName,
                    classType: classes.classesType,
                    startWorkTime: classes.startWorkTime,
                    endWorkTime: classes.endWorkTime,
                    endTimeIsMorrow: classes.endTimeIsMorrow,
                  },
                ]
              : [];
          // 历史手动值班数据
          record?.dateClassList.forEach((e) => {
            let condition = dayjs(e.dutyDate).format("YYYY-MM-DD") === dayjs(cell.date).format("YYYY-MM-DD") && !!e.classesId;
            action === "remove" && (condition = condition && classes?.id !== e.classesId);
            condition &&
              handClassList.push({
                classId: e.classesId,
                className: e.classesName,
                classNickName: e.classesNickName,
                classType: e.classesType,
                startWorkTime: dayjs(e.classesRealStartTime).format("HH:mm"),
                endWorkTime: dayjs(e.classesRealEndTime).format("HH:mm"),
                endTimeIsMorrow: false,
              });
          });
          // 数据插入
          if (cell.staffId === staff.staffId) {
            staff.staffDateList.push({
              dutyDate: cell.date,
              dateClassList: action === "empty" ? undefined : handClassList,
            });
          }
        });
      });

      try {
        await staffDutyhand(params);
      } catch (error) {
        logger.error(error);
      } finally {
        getTableData();
      }
    };
    /** 选中班次 tag */
    const clickClassesTag = async (tag: Classes): Promise<void> => {
      if (selectCells.value.length === 0) {
        message.warn("请先选中单元格");
        return;
      }
      handleUpdate("insert", { ...tag });
    };
    /** 清空单元格 */
    const clearCell = async (): Promise<void> => {
      if (selectCells.value.length) {
        AntModal.confirm({
          title: "清空前确认",
          content: "是否清空选中单元格的所有班次",
          okText: "确认",
          cancelText: "取消",
          centered: true,
          onOk: async () => handleUpdate("empty"),
        });
      } else {
        message.warn("请先选中单元格");
      }
    };
    /** 删除行 */
    const deleteRow = async (): Promise<void> => {
      if (selectedRowKeys.value.length) {
        AntModal.confirm({
          title: "删除前确认",
          content: "是否删除选中行",
          okText: "确认",
          cancelText: "取消",
          centered: true,
          onOk: async () => {
            try {
              await staffDutyRemove({
                yearMonth: formState.yearMonth,
                staffIdList: selectedRowKeys.value,
              });
              selectedRowKeys.value = [];
            } catch (error) {
              logger.error(error);
            } finally {
              getTableData();
            }
          },
        });
      } else {
        message.warn("请先选中要删除的行");
      }
    };
    /** 单元格标签删除 */
    const cellTagRemove = async (record: TableRow, dateData: CellDate, removeClass: Classes): Promise<void> => {
      openPatch.value = false; // 清除多选状态
      clickCell(record, dateData);
      AntModal.confirm({
        title: "删除前确认",
        content: "是否删除选中单元格的" + removeClass.name,
        okText: "确认",
        cancelText: "取消",
        centered: true,
        onOk: async () => handleUpdate("remove", removeClass),
      });
    };
    /** 单元格回显内容 */
    const cellConent = computed(() => {
      return (record: TableRow, dateData: CellDate): VNode => {
        const dutyClass: JSX.Element[] = [];
        record.dateClassList.forEach((item) => {
          if (dayjs(item.dutyDate).format("YYYY-MM-DD") === dayjs(dateData.date).format("YYYY-MM-DD")) {
            const color = classesColor.find((e) => e.value === item.classesType)?.color ?? "";
            const paramClasses = {
              id: item.classesId,
              name: item.classesName,
              nickName: item.classesNickName,
              classesType: item.classesType,
              startWorkTime: dayjs(item.classesRealEndTime).format("HH:mm"),
              endWorkTime: dayjs(item.classesRealEndTime).format("HH:mm"),
              endTimeIsMorrow: item.classesEndTimeIsMorrow,
            };
            dutyClass.push(
              <Tag
                color={color}
                class={style["cell-classes-tag"]}
                closable
                onClose={async () => cellTagRemove(record, dateData, paramClasses)}
              >
                {item.classesNickName || item.classesName}
              </Tag>,
            );
          }
        });
        const res = <>{...dutyClass}</>;
        return dutyClass.length ? (
          res
        ) : (
          <>
            <Tag color="green" class={style["cell-classes-tag"]}>
              无
            </Tag>
          </>
        );
      };
    });

    const getTableColumns = (): unknown[] => {
      const calendar = getCalendarData(
        dayjs(formState.yearMonth).startOf("month").format("YYYY-MM-DD"),
        dayjs(formState.yearMonth).endOf("month").format("YYYY-MM-DD"),
      );
      const calendarColumns = calendar.map((e) => {
        return {
          title: e.date,
          dataIndex: e.date,
          ellipsis: true,
          calendar: true,
          date: dayjs(e.date).format("MM-DD"),
          week: e.weekdayChinese,
          width: 120,
          customRender: ({ record }: { record: TableRow }): VNode => {
            const cssClass: Record<string, boolean> = {};
            cssClass[style["scheduling-item"]] = true;
            cssClass[style["scheduling-item-active"]] = !!selectCells.value.find(
              (item) => item.staffId === record.staffId && item.date === e.date,
            );
            return (
              <div
                class={cssClass}
                onClick={() => {
                  clickCell(record, e);
                }}
              >
                {cellConent.value(record, e)}
              </div>
            );
          },
        };
      });
      return [
        {
          title: `${KEYWORD_ALIAS.staff}姓名`,
          dataIndex: "staffName",
          ellipsis: true,
          width: 120,
          align: "center",
          fixed: "left",
          customRender: ({ text }: { text: string }): VNode => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        ...calendarColumns,
      ];
    };
    const tableColumns = ref([]);
    const tableSolt = {
      headerCell: ({ column }: { column: { calendar: boolean; title: string; date: string; week: string } }): VNode | string => {
        if (column.calendar) {
          return (
            <div class={style["calendar-tabel-header"]}>
              <span>{column.date}</span>
              <span>{column.week}</span>
            </div>
          );
        }
        return column.title;
      },
    };

    const loading = ref(false);
    const dataSource = ref<TableRow[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const getTableData = async (): Promise<void> => {
      try {
        tableColumns.value = getTableColumns() as never[];
        loading.value = true;
        selectCells.value.length = 0;
        const res = await staffDutyPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
          keyword: formState.keyword || undefined,
        });
        if (res.data) {
          const { records, total } = res.data;
          dataSource.value = records as TableRow[];
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
      selectedRowKeys.value = [];
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (month?: string): Promise<void> => {
      await queryCache.reset();
      if (month) {
        formState.yearMonth = month;
      }
      await getTableData();
      await queryCache.sync();
    };

    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-header": (): VNode => {
        return (
          <div>
            {hasPermission(permission.download) && (
              <Button type="primary" style="margin-left:10px" onClick={download} loading={downLoading.value}>
                下载值班模板
              </Button>
            )}
            {hasPermission(permission.import) && (
              <ImportDutyTemplate
                onSuccess={(month: string) => {
                  reset(month);
                }}
              />
            )}
            {hasPermission(permission.export) && (
              <Button type="primary" style="margin-left:10px" onClick={exportExcel} loading={exportLoading.value}>
                导出值班表
              </Button>
            )}
          </div>
        );
      },
      "layout-content": (): VNode => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="选择月份">
                <DatePicker
                  v-model:value={formState.yearMonth}
                  picker="month"
                  placeholder="请选择年月"
                  valueFormat="YYYY-MM"
                  allowClear={false}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label={`${KEYWORD_ALIAS.staff}`}>
                <Input v-model:value={formState.keyword} placeholder={`请输入${KEYWORD_ALIAS.staff}姓名`} showCount={false} />
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
            <div class={style["duty-action"]}>
              <div class={style.step}>
                <span class={style.title}>1、选择人员</span>
                <Button style={{ marginLeft: "10px" }} size="small" type="primary" onClick={chooseStaff}>
                  选择人员
                </Button>
                <UserPickerModal ref={staffSelectModalRef} v-model:value={staffs.value} multiple onUpdate:value={insertStaff} />
              </div>
              <div class={style.step}>
                <span class={style.title} style="white-space:nowrap">
                  2、选择可用班次
                </span>
                <div class={style["classes-items"]} style={{ marginLeft: "10px" }}>
                  {classes.value.map((e) => {
                    const color = classesColor.find((ele) => ele.value === e.classesType)?.color ?? "";
                    return (
                      <Tag
                        color={color}
                        class={style["clasess-item-tag"]}
                        key={e.id}
                        onclick={() => {
                          clickClassesTag(e);
                        }}
                      >
                        {e.nickName}：{e.name}{" "}
                        <span style="margin-left:5px">
                          {e.startWorkTime}-{e.endWorkTime}
                        </span>
                      </Tag>
                    );
                  })}
                  <Button size="small" type="primary" onClick={() => classesSelectModalRef.value?.openModal()}>
                    选择班次
                  </Button>
                  <ClassesSelectModal ref={classesSelectModalRef} v-model:value={classes.value} />
                </div>
              </div>
              <div style="display:flex">
                <Button type="primary" onClick={changePathStatus}>
                  {openPatch.value ? "单个" : "批量"}值班
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={clearCell}>
                  清空
                </Button>
                <Button style={{ marginLeft: "10px" }} danger onClick={deleteRow}>
                  删除
                </Button>
              </div>
            </div>
            <Table
              v-slots={tableSolt}
              columns={tableColumns.value}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              size="small"
              scrollY={scorllY.value - 135}
              scrollX={1000}
              class="scheduling-table"
              row-selection={{
                selectedRowKeys: selectedRowKeys.value,
                preserveSelectedRowKeys: true,
                onChange: (selectedRowKeyList: string[]) => {
                  selectedRowKeys.value = selectedRowKeyList;
                },
              }}
              rowKey="staffId"
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
    return (): VNode => <Layout title={pageTitle ?? `${KEYWORD_ALIAS.staff}值班`} v-slots={layoutSlots} class={style["clock-in-table"]} />;
  },
});

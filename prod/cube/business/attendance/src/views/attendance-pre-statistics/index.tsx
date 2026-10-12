import dayjs from "dayjs";
import { defineComponent, reactive, ref, onMounted, type VNode } from "vue";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, DatePicker, Form, FormItem, Input, Select, type PickerMode, Table, Page, message, PopOver } from "@ghcloud/cube-ui";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { DeptTreeSelect } from "@ghcloud/generic-component";

import { beforeStatPage, beforeStatExport } from "@/api/attendance-pre";
import { Layout } from "@/components/layout/layout";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";
interface TableTitle {
  id: string;
  name: string;
  notLimit: boolean;
  unit: "天" | "小时";
}
interface Row {
  staffId: string;
  staffName: string;
  id: string;
}

export const Pre = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const permission = appFunctionCodes.attendanceAttendanceStatisticsPre;
    const columns = [
      {
        title: `${KEYWORD_ALIAS.staff}姓名`,
        dataIndex: "staffName",
        fixed: "left",
        width: "150px",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "部门",
        dataIndex: "deptName",
        fixed: "left",
        width: "150px",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "应出勤天数",
        dataIndex: "legalWorkDays",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "实际出勤天数",
        dataIndex: "realWorkDays",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "排班出勤天数",
        children: [
          {
            title: "合计",
            dataIndex: "sumShiftNum",
            key: "sumShiftNum",
            ellipsis: true,
            customRender: ({ text }: { text: string }): VNode => {
              return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
            },
          },
          {
            title: "白班",
            dataIndex: "morningNum",
            key: "morningNum",
            ellipsis: true,
            customRender: ({ text }: { text: string }): VNode => {
              return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
            },
          },
          {
            title: "中班",
            dataIndex: "middleNum",
            key: "middleNum",
            ellipsis: true,
            customRender: ({ text }: { text: string }): VNode => {
              return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
            },
          },
          {
            title: "夜班",
            dataIndex: "nightNum",
            key: "nightNum",
            ellipsis: true,
            customRender: ({ text }: { text: string }): VNode => {
              return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
            },
          },
        ],
      },
      {
        title: "离岗(天）",
        dataIndex: "leavePostDuration",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "离岗");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },
      {
        title: "出差(天）",
        dataIndex: "awayBusinessDuration",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "出差");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },
      {
        title: "旷工天数",
        dataIndex: "skipWorkDay",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "缺卡次数",
        dataIndex: "noClockNum",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "补卡次数",
        dataIndex: "repairClockNum",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "补卡次数");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },
      {
        title: "迟到次数",
        dataIndex: "lateNum",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "迟到时长(分钟)",
        dataIndex: "lateTotalTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "早退次数",
        dataIndex: "earlyNum",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "早退时长(分钟)",
        dataIndex: "earlyTotalTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text ?? 0}>{text ?? 0}</PopOver>;
        },
      },
      {
        title: "工作日加班(小时）",
        dataIndex: "overtimeWorkDuration",
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "工作日加班");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },
      {
        title: "休息日加班(小时）",
        dataIndex: "overtimeRestDuration",
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "休息日加班");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },
      {
        title: "节假日加班(小时）",
        dataIndex: "overtimeFestDuration",
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "节假日加班");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },

      {
        title: "工作日计加班费的时长(小时)",
        dataIndex: "overtimeWorkCostDuration",
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "工作日计加班费的时长");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },
      {
        title: "休息日计加班费的时长(小时）",
        dataIndex: "overtimeRestCostDuration",
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "休息日计加班费的时长");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },
      {
        title: "节假日计加班费的时长(小时)",
        dataIndex: "overtimeFestCostDuration",
        customRender: ({ text, record }: { text: string; record: Row }): VNode => {
          return (
            <PopOver content={text ?? "0"}>
              {text !== "0" && Number(text) > 0 ? (
                <Button
                  type="link"
                  onClick={() => {
                    handleLink(record, "节假日计加班费的时长");
                  }}
                >
                  {text ?? "0"}
                </Button>
              ) : (
                <div style="margin-left:20px">{text ?? 0}</div>
              )}
            </PopOver>
          );
        },
      },
    ];
    const tableColumns = ref<unknown[]>(columns);
    // const = useRoute()
    const time = dayjs().startOf("month").format("YYYY-MM");
    const defaultPeriod = `${time}-01 00:00:00,${time}-31 23:59:59`;
    const searchData = reactive<{
      timeType: PickerMode;
      staffName: string;
      deptId: string | undefined;
      groupId: string;
      period: string;
    }>({
      timeType: "month",
      staffName: "",
      deptId: undefined,
      groupId: "",
      period: defaultPeriod,
    });
    const currentMouth = ref(time);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const queryCache = useListQueryCache<{
      timeType: PickerMode;
      staffName: string;
      deptId: string | undefined;
      groupId: string;
      period: string;
      pageNumber: number;
      pageSize: number;
    }>({
      defaults: {
        timeType: "month",
        staffName: "",
        deptId: undefined,
        groupId: "",
        period: defaultPeriod,
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        timeType: searchData.timeType,
        staffName: searchData.staffName,
        deptId: searchData.deptId,
        groupId: searchData.groupId,
        period: searchData.period,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        searchData.timeType = (next.timeType as PickerMode) ?? "month";
        searchData.staffName = (next.staffName as string) ?? "";
        searchData.deptId = next.deptId as string | undefined;
        searchData.groupId = (next.groupId as string) ?? "";
        searchData.period = (next.period as string) ?? defaultPeriod;

        const start = searchData.period.split(",")[0];
        if (searchData.timeType === "month") {
          currentMouth.value = dayjs(start).format("YYYY-MM");
        } else {
          currentMouth.value = dayjs(start).format("YYYY");
        }

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
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const { data } = await beforeStatPage({ ...searchData, ...pagination.value });
        const { records, total, tableTitle } = data as unknown as { records: unknown[]; total: number; tableTitle: TableTitle[] };
        dataSource.value = records;
        tableColumns.value = [
          ...columns,
          ...tableTitle.map((item) => {
            return {
              title: `${item.name} (${item.unit})`,
              dataIndex: "",
              ellipsis: true,
              width: 180,
              customRender: (record: {
                record: { staffId: string; statLeaveValueList: { holidayRuleId: string; number: string }[] };
              }): VNode => {
                const holidayRuleId: string = item.id;
                const number = record.record.statLeaveValueList.find((ele) => ele.holidayRuleId === holidayRuleId)?.number;
                let result = "0";
                if (record.record.statLeaveValueList.length > 0) {
                  if (number) {
                    result = number;
                  } else {
                    result = "0";
                  }
                }
                if (!number) {
                  result = "0";
                }
                return (
                  <PopOver content={result ?? "0"}>
                    {result !== "0" && Number(result) > 0 ? (
                      <Button
                        type="link"
                        onClick={() => {
                          handleLink({ id: holidayRuleId, staffId: record.record?.staffId } as unknown as Row, "动态类型");
                        }}
                      >
                        {result ?? "0"}
                      </Button>
                    ) : (
                      <div style="margin-left:20px">{result ?? 0}</div>
                    )}
                  </PopOver>
                );
              },
            };
          }),
        ];
        pagination.value.total = total;
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
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
        await beforeStatExport({ ...searchData })
          .then((res: { data: unknown }) => {
            const { data } = res;
            const link = document.createElement("a");
            const blob = new Blob([data as BlobPart], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "考勤汇总预统计.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((res) => {
            logger.debug(res);
            message.error(res?.message || "操作失败");
          });
      } catch (error) {
        logger.error(error);
      } finally {
        setTimeout(() => {
          exportLoading.value = false;
        }, 1000);
      }
    };
    const handleLink = (record: Row, code: string): void => {
      const params = {
        period: searchData.period,
        businessType: "",
        sceneCode: "",
        userId: record.staffId ?? "",
      };
      switch (code) {
        case "离岗":
          params.businessType = "LEAVE_THE_POST";
          params.sceneCode = "";
          break;
        case "出差":
          params.businessType = "AWAY_BUSINESS";
          params.sceneCode = "";
          break;
        case "补卡次数":
          params.businessType = "REPAIR_CLOCK";
          params.sceneCode = "";
          break;
        case "工作日加班":
          params.businessType = "OVERTIME";
          params.sceneCode = "WORK";
          break;
        case "休息日加班":
          params.businessType = "OVERTIME";
          params.sceneCode = "REST";
          break;
        case "节假日加班":
          params.businessType = "OVERTIME";
          params.sceneCode = "FESTIVAL";
          break;
        case "工作日计加班费的时长":
          params.businessType = "OVERTIME";
          params.sceneCode = "WORK";
          break;
        case "休息日计加班费的时长":
          params.businessType = "OVERTIME";
          params.sceneCode = "REST";
          break;
        case "节假日计加班费的时长":
          params.businessType = "OVERTIME";
          params.sceneCode = "FESTIVAL";
          break;
        case "动态类型":
          params.businessType = "LEAVE";
          params.sceneCode = record.id;
          break;
      }
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/attendance-management/attendance-record?title=考勤汇总预统计&searchValue=${JSON.stringify(params)}`,
      );
    };
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
            <div class="classes-Summary-form">
              <Form layout="inline" model={searchData}>
                <FormItem label={`${KEYWORD_ALIAS.staff}`} style="margin: 10px 0;">
                  <Input v-model:value={searchData.staffName} placeholder="请输入人员姓名" />
                </FormItem>
                <FormItem label="部门" style="margin: 10px 0;">
                  <DeptTreeSelect style={{ width: "200px" }} v-model:value={searchData.deptId} />
                </FormItem>
                <FormItem label="时间选择" style="margin: 10px 0;">
                  <div style="display:flex;">
                    <Select
                      style={{ width: "100px", marginRight: "10px" }}
                      v-model:value={searchData.timeType}
                      options={[
                        { label: "按月", value: "month" },
                        { label: "按年", value: "year" },
                      ]}
                      onChange={(value) => {
                        if (value === "month") {
                          currentMouth.value = dayjs().startOf("month").format("YYYY-MM");
                          searchData.period = `${currentMouth.value}-01 00:00:00,${currentMouth.value}-31 23:59:59`;
                        } else {
                          currentMouth.value = dayjs().startOf("year").format("YYYY");
                          searchData.period = `${currentMouth.value}-01-01 00:00:00,${currentMouth.value}-12-31 23:59:59`;
                        }
                      }}
                    />
                    <DatePicker
                      picker={searchData.timeType}
                      v-model:value={currentMouth.value}
                      valueFormat={searchData.timeType === "month" ? "YYYY-MM" : "YYYY"}
                      format={searchData.timeType === "month" ? "YYYY-MM" : "YYYY"}
                      onChange={(value) => {
                        if (searchData.timeType === "month") {
                          searchData.period = `${value}-01 00:00:00,${value}-31 23:59:59`;
                        } else {
                          searchData.period = `${value}-01-01 00:00:00,${value}-12-31 23:59:59`;
                        }
                      }}
                    />
                  </div>
                </FormItem>
                <FormItem style="margin: 10px 0;">
                  <Button type="primary" onClick={queryForm}>
                    查询
                  </Button>
                  <Button type="default" style={{ marginLeft: "10px" }} onClick={reset}>
                    重置
                  </Button>
                </FormItem>
              </Form>
              <div class="search">
                <Table
                  pagination={false}
                  loading={loading.value}
                  columns={tableColumns.value}
                  dataSource={dataSource.value}
                  size="small"
                  scrollX={tableColumns.value.length * 200}
                />
              </div>
            </div>
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
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    return (): VNode => <Layout title={pageTitle} v-slots={layoutSlots} />;
  },
});

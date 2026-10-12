import CheckModel from "./components/check-accept-model";
import FeedbackModel from "./components/feedback-model";
import { cubeSmallEngineeringService } from "@/api/server";
import { getdept, getschedule, schedulefeedback, type AcceptType, type ScheduleType, Accept } from "@/api/supervise";
import { appFunctionCodes } from "@/permission/index";
import "./index.less";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import {
  DateRangePicker,
  Button,
  PopOver,
  Page,
  FormItem,
  Select,
  Space,
  PopConfirm,
  message,
  type ColumnType,
  Input,
} from "@ghcloud/cube-ui";
import { tableExportExcel, usePageName } from "@ghcloud/cube-utils";
import { AliasTable, Layout } from "@ghcloud/generic-component";
import dayjs from "dayjs";
import { defineComponent, reactive, ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";

const STORAGE_KEY = "supervise-list-state";
const FROM_EDIT_FLAG = "supervise-from-edit";

export const Supervise = defineComponent({
  setup: () => {
    const route = useRoute();
    const { pageTitle } = usePageName();
    const permission = appFunctionCodes.projectSupervise;
    const feedback = ref(false);
    const time = ref([]);
    const currentDetail = ref<{
      id: string;
      schedule: number;
    }>({
      id: "",
      schedule: 0,
    });
    const modalInfoState = computed(() => {
      return {
        scheduleId: currentDetail.value.id,
        schedule: currentDetail.value.schedule,
      };
    });
    const feedbackEvent = (record: { id: string; schedule: number }): void => {
      currentDetail.value = record;
      feedback.value = true;
    };
    // 保存状态到 sessionStorage
    const saveState = (): void => {
      const state = {
        pagination: { ...pagination },
        time: time.value,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    // 从 sessionStorage 恢复状态
    const restoreState = (): void => {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.pagination) {
            Object.assign(pagination, state.pagination);
          }
          if (state.time) {
            time.value = state.time;
            if (state.time.length === 2) {
              pagination.period = state.time.join(",");
            }
          }
        } catch (_ignore) {
          // 恢复状态失败，忽略错误，使用默认状态
        }
      }
    };

    const toDetail = (id: string): void => {
      saveState();
      sessionStorage.setItem(FROM_EDIT_FLAG, "detail");
      history.pushState({}, "", `/portal/small-engineering/edit-supervise?id=${id}`);
    };
    const toEdit = (id: string): void => {
      saveState();
      sessionStorage.setItem(FROM_EDIT_FLAG, "edit");
      history.pushState({}, "", `/portal/small-engineering/edit-supervise?id=${id}&edit=true`);
    };
    const deleteRow = async (id: string): Promise<void> => {
      await cubeSmallEngineeringService.deleteProjectSupervise([id]);
      message.success("操作成功");
      getList();
    };
    const checkVisible = ref(false);
    const check = (record: { id: string; schedule: number }): void => {
      currentDetail.value = record;
      checkVisible.value = true;
    };
    const cancel = (): void => {
      feedback.value = false;
    };
    const checkCancel = (): void => {
      checkVisible.value = false;
    };
    const createPatrol = async (record: Record<string, string>): Promise<void> => {
      history.pushState({}, "", `/portal/small-engineering/engineering-patrol-plan-edit?type=create&objectId=${record.id}`);
    };
    const tableData = reactive<{
      dataSource: unknown[];
      columns: ColumnType[];
      loading: boolean;
      exportLoading: boolean;
    }>({
      columns: [
        {
          title: "工程编号",
          align: "center",
          dataIndex: "projectNum",
          fixed: "left",
          customRender: ({ text }: { text: string }): string => text,
        },
        {
          title: "小散工程名称",
          dataIndex: "projectName",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "工程类型",
          dataIndex: "projectTypeName",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "监管人",
          dataIndex: "superviseUserName",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            const value = text === "null" ? "--" : text;
            return <PopOver content={value}>{value}</PopOver>;
          },
        },
        {
          title: "监管部门",
          dataIndex: "depName",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "工程时间",
          dataIndex: "completionTime",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            const time = text ? dayjs(text).format("YYYY-MM-DD") : "--";
            return <PopOver content={time}>{time}</PopOver>;
          },
        },
        {
          title: "施工方",
          dataIndex: "partyB",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "施工地点",
          dataIndex: "constructionSite",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "工程状态",
          dataIndex: "status",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "完成进度情况",
          dataIndex: "schedule",
          align: "center",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "操作",
          align: "center",
          dataIndex: "action",
          customRender: ({ record }: { record: { id: string; schedule: number; status: string } }): JSX.Element => {
            return (
              <>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    toDetail(record.id);
                  }}
                >
                  详情
                </Button>
                {record.status !== "已完成" && hasPermission(permission.update) && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      toEdit(record.id);
                    }}
                  >
                    编辑
                  </Button>
                )}
                {record.status === "进行中" ? (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      feedbackEvent(record);
                    }}
                  >
                    反馈
                  </Button>
                ) : (
                  <span />
                )}
                {record.status === "待验收" ? (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      check(record);
                    }}
                  >
                    验收
                  </Button>
                ) : (
                  <span />
                )}
                {hasPermission(permission.createPatrol) && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      createPatrol(record as unknown as Record<string, string>);
                    }}
                  >
                    创建巡检
                  </Button>
                )}
                {hasPermission(permission.deleted) && (
                  <PopConfirm
                    title="确认删除该项？"
                    onConfirm={() => {
                      deleteRow(record.id);
                    }}
                  >
                    <Button type="link" size="small" danger>
                      删除
                    </Button>
                  </PopConfirm>
                )}
              </>
            );
          },
        },
      ],
      loading: false,
      exportLoading: false,
      dataSource: [],
    });
    const escalationOptions = [
      {
        label: "进行中",
        value: "UNDERWAY",
      },
      {
        label: "待验收",
        value: "WAIT_ACCEPT",
      },
      {
        label: "已完成",
        value: "COMPLETED",
      },
    ];
    const pagination = reactive({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
      depId: undefined,
      status: undefined,
      keyword: "",
      period: "",
      typeId: undefined,
    });

    const getList = async (): Promise<void> => {
      try {
        tableData.loading = true;
        const { data } = await getschedule(pagination);
        pagination.total = data.total;
        tableData.dataSource = data.records;
        tableData.loading = false;
      } finally {
        tableData.loading = false;
      }
    };

    const changePicker = (value?: string[]): void => {
      pagination.period = value ? value.join(",") : "";
    };
    const query = (): void => {
      getList();
    };
    const reset = (): void => {
      time.value = [];
      Object.assign(pagination, {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        depId: undefined,
        status: undefined,
        keyword: "",
        period: "",
        typeId: undefined,
      });
      getList();
    };
    const deptList = ref([]);
    const typeList = ref<
      {
        id: string;
        name: string;
      }[]
    >([]);

    // 监听 popstate 事件（浏览器前进后退）
    const handlePopState = (): void => {
      // 延迟执行，确保路由已经更新
      setTimeout(() => {
        const currentPath = window.location.pathname;
        // 检测是否返回到列表页面
        if (currentPath.includes("/supervise") && !currentPath.includes("/edit-supervise")) {
          const fromEdit = sessionStorage.getItem(FROM_EDIT_FLAG);
          // 如果是从编辑或新增页面返回，刷新列表
          if (fromEdit === "edit" || fromEdit === "add") {
            getList();
          }
          // 清除标记
          sessionStorage.removeItem(FROM_EDIT_FLAG);
        }
      }, 100);
    };

    // 监听路由变化（使用 Vue Router）
    watch(
      () => route.path,
      (newPath) => {
        // 如果路由变为 /supervise，且之前有编辑标记，则刷新列表
        if (newPath === "/supervise") {
          const fromEdit = sessionStorage.getItem(FROM_EDIT_FLAG);
          if (fromEdit === "edit" || fromEdit === "add") {
            getList();
            sessionStorage.removeItem(FROM_EDIT_FLAG);
          }
        }
      },
    );

    onMounted(async () => {
      // 恢复状态
      restoreState();
      // 获取列表数据
      getList();
      cubeSmallEngineeringService.getProjectTypeList().then((res) => {
        typeList.value = res;
      });
      const { data } = await getdept();

      deptList.value = data;
      // 监听 popstate 事件
      window.addEventListener("popstate", handlePopState);
    });

    onBeforeUnmount(() => {
      // 清理事件监听
      window.removeEventListener("popstate", handlePopState);
    });
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.pageNumber = pageNumber || 1;
      pagination.pageSize = pageSize;
      getList();
    };
    const handleAdd = (): void => {
      saveState();
      sessionStorage.setItem(FROM_EDIT_FLAG, "add");
      history.pushState({}, "", "/portal/small-engineering/edit-supervise");
    };
    const getAllData = async (): Promise<unknown[]> => {
      const params = {
        pageSize: 10,
        depId: pagination.depId,
        status: pagination.status,
        keyword: pagination.keyword,
        period: pagination.period,
      };
      let currentPage = 1;
      let totalPages = 1;
      let allData: unknown[] = [];
      while (currentPage <= totalPages) {
        const {
          data: { records, pages },
        } = await getschedule({ ...params, pageNumber: currentPage });
        const handleRecords = records.map((item) => {
          return {
            ...item,
            completionTime: dayjs(item.completionTime).format("YYYY-MM-DD"),
          };
        });
        allData = [...allData, ...handleRecords];
        currentPage++;
        totalPages = pages;
      }
      return allData;
    };
    const handleExport = async (): Promise<void> => {
      try {
        tableData.exportLoading = true;
        const dataSource = await getAllData();
        const columns = tableData.columns.slice(0, tableData.columns.length - 1).map((item) => {
          return {
            header: item.title as string,
            key: item.dataIndex as string,
          };
        });
        await tableExportExcel({
          dataSource,
          columns,
          fileName: "工程监管",
        });
      } finally {
        tableData.exportLoading = false;
      }
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <Space>
            {hasPermission(permission.createSupervise) && (
              <Button type="primary" onClick={handleAdd}>
                新增
              </Button>
            )}
            {hasPermission(permission.downloadSupervise) && (
              <Button type="primary" loading={tableData.exportLoading} onClick={handleExport}>
                导出
              </Button>
            )}
          </Space>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <div class="top">
              <FormItem label="工程状态">
                <Select style="width:200px" v-model:value={pagination.status} options={escalationOptions} allowClear />
              </FormItem>
              <FormItem label="监管部门">
                <Select
                  style="width:200px"
                  v-model:value={pagination.depId}
                  options={deptList.value}
                  field-names={{ label: "name", value: "id" }}
                />
              </FormItem>
              <FormItem label="工程类型">
                <Select
                  style="width:200px"
                  v-model:value={pagination.typeId}
                  options={typeList.value}
                  field-names={{ label: "name", value: "id" }}
                  allowClear
                />
              </FormItem>
              <FormItem label="完成时间">
                <DateRangePicker v-model:value={time.value} style="width:300px" onChangePicker={changePicker} />
              </FormItem>
              <FormItem>
                <Input
                  v-model:value={pagination.keyword}
                  placeholder="工程名称、工程编号、监管人人、施工方"
                  style="width:300px"
                  showCount={false}
                />
              </FormItem>
              <FormItem>
                <div style="display:flex">
                  <Button type="primary" onClick={query}>
                    查询
                  </Button>
                  <Button style="margin-left:10px" onClick={reset}>
                    重置
                  </Button>
                </div>
              </FormItem>
            </div>
            <AliasTable
              columns={tableData.columns}
              loading={tableData.loading}
              tableCode="SUPERVISE"
              scrollX={400}
              applicationCode="SMALLENFINEERING"
              dataSource={tableData.dataSource}
              pagination={false}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.pageNumber}
            v-model:pageSize={pagination.pageSize}
            v-model:total={pagination.total}
            onPageChange={pageChange}
          />
        );
      },
    };

    const ok = async (data: ScheduleType): Promise<void> => {
      await schedulefeedback(data);
      getList();
      feedback.value = false;
    };
    const checkOk = async (data: AcceptType): Promise<void> => {
      await Accept(data);
      getList();
      checkVisible.value = false;
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        <FeedbackModel visible={feedback.value} onCancel={cancel} onOk={ok} feedbackInfo={modalInfoState.value} />
        <CheckModel visible={checkVisible.value} onCancel={checkCancel} onOk={checkOk} checkInfo={modalInfoState.value} />
      </>
    );
  },
});

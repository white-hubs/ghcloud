import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, watch, type VNode } from "vue";
import { useRoute } from "vue-router";

import { Button, DateRangePicker, Form, FormItem, Page, PopOver } from "@ghcloud/cube-ui";
import { useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable, Layout } from "@ghcloud/generic-component";

import { attendanceApprovePage } from "@/api/attendance-record";

import "./index.less";

export const AttendanceRecord = defineComponent({
  setup: () => {
    const statusText = (str: string): string => {
      const statusMap = new Map([
        ["SUBMIT", "提交"],
        ["UNDO", "撤销"],
        ["REPEAT", "重新提交"],
        ["APPROVAL", "审批"],
        ["BACK", "撤回"],
        ["COPY", "抄送"],
        ["REJECT", "驳回"],
        ["FINISHED", "完成"],
      ]);
      return statusMap.get(str) || "处理中";
    };
    const formState = reactive<{
      period: string[];
    }>({
      period: [],
    });
    const columns = [
      {
        title: "编号",
        dataIndex: "formNo",
        ellipsis: true,
        width: "120px",
        fixed: "left",
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "申请名称",
        dataIndex: "instanceName",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "发起部门",
        dataIndex: "startUserInfo",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: { organizationName: string } }): VNode => {
          const val = text.organizationName ? text.organizationName : "";
          return <PopOver content={val || "--"}>{val || "--"}</PopOver>;
        },
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): VNode => {
          const val = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
          return <PopOver content={val || "--"}>{val || "--"}</PopOver>;
        },
      },
      {
        title: "处理状态",
        dataIndex: "status",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): VNode => {
          const val = text ? statusText(text) : "";
          return <PopOver content={val || "--"}>{val || "--"}</PopOver>;
        },
      },
      {
        title: "处理进度",
        dataIndex: "activeNodeName",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }): VNode => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        width: "120px",
        customRender: ({ record }: { record: Record<string, string> }): VNode => {
          return (
            <>
              <Button
                type="link"
                onClick={() => {
                  handleDetail(record);
                }}
              >
                详情
              </Button>
            </>
          );
        },
      },
    ];
    const dataSource = ref<unknown[]>([]);

    const handleDetail = (record: Record<string, string>): void => {
      const target = `/portal/stream-engine-render/index?businessType=${record.businessType}&processInstanceId=${record.processInstanceId}&type=detail&title=工作汇报&appName=考勤管理`;
      history.pushState({ current: location.pathname + location.search }, "", decodeURIComponent(target));
    };
    const state = reactive({
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      selectRow: "",
    });
    const queryCache = useListQueryCache<{
      period: string[];
      pageNumber: number;
      pageSize: number;
    }>({
      defaults: {
        period: [],
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        period: formState.period,
        pageNumber: state.searchParams.pageNumber,
        pageSize: state.searchParams.pageSize,
      }),
      setState: (next) => {
        formState.period = Array.isArray(next.period)
          ? (next.period as string[])
          : typeof next.period === "string"
            ? next.period.split(",")
            : [];
        state.searchParams.pageNumber = Number(next.pageNumber ?? 1);
        state.searchParams.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const getTableData = async (): Promise<void> => {
      state.loading = true;
      try {
        const params = {
          ...state.searchParams,
          ...searchVal.value,
          period: formState.period.length > 0 ? `${formState.period[0]},${formState.period[1]}` : "",
        };
        const { data } = await attendanceApprovePage(params);
        dataSource.value = data.records;
        state.searchParams.total = data.total;
      } catch (error) {
      } finally {
        state.loading = false;
      }
    };
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page;
      state.searchParams.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const searchVal = ref();
    const title = ref("考勤汇总统计");
    watch(
      () => route,
      async () => {
        if (route.query.searchValue) {
          searchVal.value = JSON.parse(route.query.searchValue as string);
          formState.period = (searchVal.value as { period: string }).period
            ? (searchVal.value as { period: string }).period.split(",")
            : [];
        }
        if (route.query.title) {
          title.value = route.query.title as string;
        }
        await getTableData();
        await queryCache.sync();
      },
      { deep: true },
    );
    onMounted(async () => {
      if (route.query.searchValue) {
        await getTableData();
        await queryCache.sync();
      } else {
        await queryCache.hydrateAndQuery(getTableData);
      }
    });
    const queryForm = async (): Promise<void> => {
      state.searchParams.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };

    const scrollY = ref(500);
    const searchForm = (): JSX.Element => {
      return (
        <>
          <div>
            <Form layout="inline" style={{ margin: "0 0 10px 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="时间范围">
                <DateRangePicker v-model:value={formState.period} allowClear={false} showTime valueFormat="YYYY-MM-DD HH:mm:ss" />
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
          </div>
        </>
      );
    };

    const layoutSlots = {
      "layout-content": (): VNode => {
        return (
          <>
            {searchForm()}
            <AliasTable
              rowKey="id"
              columns={columns}
              loading={state.loading}
              dataSource={dataSource.value}
              scrollX={1000}
              scrollY={scrollY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        );
      },
      "footer-page": (): VNode => {
        return (
          <div class="footer-content">
            <Page
              v-model:current={state.searchParams.pageNumber}
              v-model:pageSize={state.searchParams.pageSize}
              v-model:total={state.searchParams.total}
              onPageChange={changePage}
            />
            <Button
              onClick={() => {
                history.back();
              }}
            >
              返回
            </Button>
          </div>
        );
      },
    };
    return (): VNode => (
      <>
        <Layout title={`${title.value}明细`} v-slots={layoutSlots} />
      </>
    );
  },
});

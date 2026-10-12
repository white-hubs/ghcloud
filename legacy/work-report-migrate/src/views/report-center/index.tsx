import { getReportCenterPage, getReportTypePage } from "@/api/work-report/index";
import { useTableScroll } from "@/hook/use-table-scroll";
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Select, Table } from "@ghcloud/cube-ui";
import { queryParameter } from "@ghcloud/cube-utils";
import "./index.less";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable, DeptTreeSelect, Layout } from "@ghcloud/generic-component";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
export const ReportCenter = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const applicationCode = __ENV__.applicationCode;
    const statusOptions = [
      { value: "ACTIVE", label: "处理中" },
      { value: "REJECT", label: "驳回" },
      { value: "UNDO", label: "撤销" },
      { value: "FINISHED", label: "完成" },
    ];
    const reportTypeOption = ref([]);
    const statusText = (str: string) => {
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
    const columns = [
      {
        title: "编号",
        dataIndex: "formNo",
        ellipsis: true,
        width: "120px",
        fixed: "left",
        customRender: ({ text }: { text: string }) => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "申请名称",
        dataIndex: "instanceName",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }) => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }) => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "发起部门",
        dataIndex: "startUserInfo",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: { organizationName: string } }) => {
          const val = text.organizationName ? text.organizationName : "";
          return <PopOver content={val || "--"}>{val || "--"}</PopOver>;
        },
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }) => {
          const val = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
          return <PopOver content={val || "--"}>{val || "--"}</PopOver>;
        },
      },
      {
        title: "处理状态",
        dataIndex: "status",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }) => {
          const val = text ? statusText(text) : "";
          return <PopOver content={val || "--"}>{val || "--"}</PopOver>;
        },
      },
      {
        title: "处理进度",
        dataIndex: "activeNodeName",
        ellipsis: true,
        width: "120px",
        customRender: ({ text }: { text: string }) => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "action",
        title: "操作",
        width: "120px",
        customRender: ({ record }: { record: Record<string, string> }) => (
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
        ),
      },
    ];
    const dataSource = ref<unknown[]>([]);

    const handleDetail = (record: Record<string, string>): void => {
      const target = `/portal/stream-engine-render/index?businessType=REPORT&processInstanceId=${record.processInstanceId}&type=detail&title=工作汇报&appName=工作汇报`;
      history.pushState({ current: location.pathname + location.search }, "", decodeURIComponent(target));
    };

    const searchPeriod = ref<string[]>(queryParameter.getQuery()?.period ? (queryParameter.getQuery()!.period as string).split(",") : []);
    const state = reactive({
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: (queryParameter.getQuery()?.pageNumber as number) ?? 1,
        pageSize: (queryParameter.getQuery()?.pageSize as number) ?? 10,
        username: (queryParameter.getQuery()?.username as string) ?? "",
        organization:
          (queryParameter.getQuery()?.organization as string[]) && queryParameter.getQuery()?.organization !== ""
            ? queryParameter.getQuery()?.organization
            : [],
        status:
          (queryParameter.getQuery()?.status as unknown as Record<string, unknown>) && queryParameter.getQuery()?.status !== ""
            ? queryParameter.getQuery()?.status
            : null,
        reportTypeId:
          (queryParameter.getQuery()?.reportTypeId as unknown as Record<string, unknown>) && queryParameter.getQuery()?.reportTypeId !== ""
            ? queryParameter.getQuery()?.reportTypeId
            : null,
        total: (queryParameter.getQuery()?.total as number) ?? 0,
      },
      selectRow: "",
    });
    const getTableData = async (urlCache = false): Promise<void> => {
      state.loading = true;
      try {
        const params = {
          ...state.searchParams,
          organizationId: state.searchParams.organization,
          submitTime: searchPeriod.value ? searchPeriod.value.join(",") : "",
        };
        const data = await getReportCenterPage(params as any);
        // @ts-expect-error
        // 类型对不上，这里不确定具体内容，先这样处理
        dataSource.value = data.data.records;
        // @ts-expect-error
        // 类型对不上，这里不确定具体内容，先这样处理
        state.searchParams.total = data.total;
        urlCache && setUrl();
      } catch (error) {
      } finally {
        state.loading = false;
      }
    };
    const setUrl = (): void => {
      queryParameter.setAddressQuery({
        ...state.searchParams,
        period: searchPeriod.value ? searchPeriod.value.join(",") : "",
      });
    };
    const getReportType = async (): Promise<void> => {
      try {
        const result = await getReportTypePage({
          pageNumber: 1,
          pageSize: 1000,
        });
        reportTypeOption.value = result.records.map((item: Record<string, string>) => ({
          label: item.name,
          value: item.id,
        }));
      } catch (error) {}
    };
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page;
      state.searchParams.pageSize = pageSize;
      getTableData(true);
    };
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1;
      getTableData(true);
    };
    const reset = (): void => {
      const initParams = {
        pageNumber: 1,
        pageSize: 10,
        reportTypeId: null,
        username: "",
        organization: [],
        status: null,
        total: 0,
      };
      state.searchParams = initParams;
      searchPeriod.value = [];
      getTableData(true);
    };
    const { scrollY } = useTableScroll();
    onMounted(() => {
      getReportType();
      getTableData();
    });

    const layoutSlots = {
      "layout-content": () => (
        <>
          <Form layout="inline" style={{ margin: "10px 0" }}>
            <FormItem label="汇报类型" class="search-item" style={{ marginBottom: "10px" }}>
              <Select
                placeholder="请选择汇报类型"
                v-model:value={state.searchParams.reportTypeId}
                options={reportTypeOption}
                style="min-width: 150px;"
              />
            </FormItem>
            <FormItem label="部门" class="search-item">
              <DeptTreeSelect placeholder="请选择部门" v-model:value={state.searchParams.organization} style="min-width: 150px;" />
            </FormItem>
            <FormItem label="汇报时间" class="search-item">
              <DateRangePicker v-model:value={searchPeriod.value} allowClear picker="date" valueFormat="YYYY-MM-DD" />
            </FormItem>
            <FormItem label="状态" class="search-item">
              <Select
                placeholder="请选择状态"
                v-model:value={state.searchParams.status}
                options={statusOptions}
                style="min-width: 150px;"
              />
            </FormItem>
            <FormItem label="汇报人" class="search-item">
              <Input
                placeholder="请输入汇报人名称"
                v-model:value={state.searchParams.username}
                showCount={false}
                maxlength={200}
                allowClear
                style={{ width: "200px" }}
              />
            </FormItem>
            <FormItem class="search-item">
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <AliasTable
            dataSource={dataSource.value}
            columns={columns}
            loading={state.loading}
            scrollY={scrollY.value}
            applicationCode={applicationCode}
            tableCode="WORK_REPORT_CENTER"
          />
        </>
      ),
      "footer-page": () => (
        <Page
          v-model:current={state.searchParams.pageNumber}
          v-model:pageSize={state.searchParams.pageSize}
          v-model:total={state.searchParams.total}
          onPageChange={changePage}
        />
      ),
    };
    return () => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
    );
  },
});

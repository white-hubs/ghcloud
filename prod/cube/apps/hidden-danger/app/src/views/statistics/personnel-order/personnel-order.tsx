import styles from "./personnel-order.module.less";
import { cubeOuaaService, cubeFlowService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import type { DeptList } from "@ghcloud/cube-ouaa-service";
import type { FormFlowStatVO } from "@ghcloud/cube-stream-engine-service/src/type";
import { Button, Form, FormItem, message, PopOver, DateRangePicker, Page, Select, Space, Input } from "@ghcloud/cube-ui";
import { tableExportExcel, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, watch } from "vue";
interface StateVo {
  dataSource: FormFlowStatVO[];
  deptList: DeptList[];
  loading: boolean;
  exportLoading: boolean;
  searchState: {
    organizationId: string;
    period: string[];
    keyword: string;
  };
  page: {
    pageSize: number;
    pageNumber: number;
    total: number;
  };
}
export const PersonnelOrder = defineComponent({
  // 组件的setup函数
  setup: () => {
    // 使用usePageName函数获取页面名称
    const { pageTitle } = usePageName();
    const businessType = "HIDDENDANGER";

    const state = reactive<StateVo>({
      exportLoading: false,
      dataSource: [],
      deptList: [],
      searchState: {
        organizationId: "",
        keyword: "",
        period: [dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")],
      },
      loading: false,
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      },
    });

    const getDataList = async (): Promise<void> => {
      try {
        state.loading = true;
        const result = await cubeFlowService.getFlowProcessStatList({
          applicationCode: businessType,
          ...state.searchState,
          ...state.page,
          period: state.searchState.period
            ? state.searchState.period.map((item) => dayjs(item).format("YYYY-MM-DD 00:00:00")).join(",")
            : "",
        });
        state.dataSource = result.records;
        state.page.total = result.total;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      } finally {
        state.loading = false;
      }
    };
    // 获取部门列表
    const getDeptList = async (): Promise<void> => {
      try {
        const result = await cubeOuaaService.getDeptList();
        state.deptList = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const pageChange = (page: number, pageSize: number): void => {
      state.page.pageNumber = page;
      state.page.pageSize = pageSize;
      getDataList();
    };
    onMounted(() => {
      getDataList();
      getDeptList();
    });
    const handleSearch = (): void => {
      state.page.pageNumber = 1;
      getDataList();
    };
    const handleReset = (): void => {
      state.searchState.organizationId = "";
      state.searchState.period = [dayjs().startOf("month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")];
      state.page.pageNumber = 1;
      getDataList();
    };

    watch(
      () => state.searchState.organizationId,
      () => {
        getDataList();
      },
    );

    const columns = [
      {
        title: "序号",
        key: "index",
        width: 70,
        dataIndex: "tableIndex",
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "人员",
        dataIndex: "userName",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "organizationName",
        title: "部门",
        width: 200,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        dataIndex: "totalNumber",
        title: "工单数",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        dataIndex: "waitNumber",
        title: "待处理",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        dataIndex: "dealNumber",
        title: "已处理",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        dataIndex: "dealRate",
        title: "处理率",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "平均处理时长",
        dataIndex: "avgWaitTime",
        key: "avgWaitTime",
        fixed: "right",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];
    const getAllData = async (): Promise<unknown[]> => {
      const params = {
        pageSize: 100,
        businessType,
        ...state.searchState,
        period: state.searchState.period ? state.searchState.period.join(",") : "",
      };
      let currentPage = 1;
      let totalPages = 1;
      let allData: unknown[] = [];
      while (currentPage <= totalPages) {
        const { records, pages } = await cubeFlowService.getFlowProcessStatList({ ...params, pageNumber: currentPage });
        const handleRecords = records.map((item) => ({
          ...item,
        }));
        allData = [...allData, ...handleRecords];
        currentPage++;
        totalPages = pages;
      }
      return allData;
    };
    const handleExport = async (): Promise<void> => {
      try {
        state.exportLoading = true;
        const dataSource = await getAllData();
        const exportColumns = columns.slice(1, columns.length).map((item, index) => ({
          header: item.title,
          key: item.dataIndex,
          dataIndex: index + 1,
        }));
        await tableExportExcel({
          dataSource,
          columns: exportColumns,
          fileName: "隐患工单统计",
        });
      } finally {
        state.exportLoading = false;
      }
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button disabled={!state.dataSource.length} type="primary" onClick={handleExport} loading={state.exportLoading}>
            导出
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div class={styles.content}>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="部门">
              <Select
                allowClear
                v-model:value={state.searchState.organizationId}
                style={{ width: "200px" }}
                options={state.deptList}
                fieldNames={{
                  label: "name",
                  value: "id",
                }}
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="时间">
              <DateRangePicker v-model:value={state.searchState.period} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="人员">
              <Input v-model:value={state.searchState.keyword} placeholder="人员名称" showCount={false} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={handleReset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <AliasTable
            rowKey="id"
            dataSource={state.dataSource}
            columns={columns}
            loading={state.loading}
            applicationCode={businessType}
            tableCode="PROBLEMS_ORDER_STAT"
          />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-show={state.page.total > 0}
          v-model:current={state.page.pageNumber}
          v-model:pageSize={state.page.pageSize}
          v-model:total={state.page.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => <Layout v-slots={layoutSlots} class={styles.container} title={pageTitle} />;
  },
});

import { cubeDailyTaskService } from "../../../api/service";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import styles from "./index.module.less";
import type { StandardItemModel } from "@ghcloud/cube-daily-task-service";
import { DailyTaskTargetCategoryOptions, getCurrentDailyType } from "@ghcloud/cube-daily-task-service";
import { PopOver, Select } from "@ghcloud/cube-ui";
import { Button, Input, Space } from "ant-design-vue";
import { defineComponent, reactive } from "vue";

export const DailyStandardItemTable = defineComponent({
  setup: (props, { expose }) => {
    const columns = [
      {
        title: "标准项名称",
        dataIndex: "itemName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "标准项内容",
        dataIndex: "itemContent",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "结果项",
        dataIndex: "resultId",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: StandardItemModel }): JSX.Element => {
          const text = record.resultLabelList.map((item) => item.label).join(" ");
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "适用对象",
        dataIndex: "targetTypes",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: StandardItemModel }): JSX.Element => {
          const text = record.targetTypes
            .map((item) => DailyTaskTargetCategoryOptions.find((option) => option.value === item)?.label || "--")
            .join("、");
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
    ];
    const state = reactive({
      keyword: "",
      targetType: "",
    });
    const [StandardItemTable, tableApi] = useCubeTable({
      columns,
      rowSelection: "checkbox",
      rowKey: "itemId",
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        size: "default", // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          tableApi.setState({
            pagination: {
              ...(tableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current,
            },
          });
          tableApi.query();
        },
      },
      fetchApi: async (params?: Record<string, unknown>) =>
        cubeDailyTaskService.getStandardItemPage({
          pageNumber: (params?.current as number) || 1,
          pageSize: (params?.pageSize as number) || 10,
          dailyType: getCurrentDailyType(),
          itemName: state.keyword ?? "",
          targetType: state.targetType ?? "",
        }),
    });
    expose({
      getStandardItemSelectedRows: () => tableApi.getSelectedRows(),
      setStandardItemSelectedKeys: (keys: string[]) => {
        tableApi.setSelectedRowKeys(keys);
      },
      setStandardItemSelectedRows: (rows: StandardItemModel[]) => {
        tableApi.setSelectedRows(rows);
        tableApi.setSelectedRowKeys(rows.map((row) => row.itemId));
      },
    });
    return (): JSX.Element => (
      <>
        <Space>
          <Input v-model:value={state.keyword} placeholder="名称" />
          <Select
            v-model:value={state.targetType}
            placeholder="适用对象类型"
            allowClear={true}
            options={DailyTaskTargetCategoryOptions}
            class={styles["wide-select"]}
          />
          <Button
            type="primary"
            onClick={() => {
              tableApi.resetFetch();
            }}
          >
            搜索
          </Button>
          <Button
            onClick={() => {
              state.keyword = "";
              state.targetType = "";
              tableApi.resetFetch();
            }}
          >
            重置
          </Button>
        </Space>
        <div style={{ marginTop: "12px" }}>
          <StandardItemTable />
        </div>
      </>
    );
  },
});

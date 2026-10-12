import styles from "./grid-detail-task-list.module.less";
import { cubeGridManagementService } from "@/api/server";
import useListOperate from "@/components/task-info-modal/use-list-operate";
import { useCubeTable } from "@ghcloud/cube-app-design";
import { VerticalLine } from "@ghcloud/cube-app-design/src/base-components/vertical-line/vertical-line";
import type { GridTaskDTO } from "@ghcloud/cube-grid-management-service";
import { Button, PopOver, Space } from "@ghcloud/cube-ui";
import type { TaskRecord } from "@ghcloud/cube-work-center-service";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";

export const GridDetailTaskList = defineComponent({
  name: "GridDetailTaskList",
  setup() {
    const { operate } = useListOperate();
    const route = useRoute();
    const state = reactive<{
      taskStat: {
        totalNum: number;
        doneTotalNum: number;
      };
      taskList: GridTaskDTO[];
    }>({
      taskStat: {
        totalNum: 0,
        doneTotalNum: 0,
      },
      taskList: [],
    });
    const getTaskStat = async () => {
      const result = await cubeGridManagementService.getMyGridTaskStat({
        gridAreaId: route.query.id as string,
        dailyType: "GRID_MANAGE",
      });
      state.taskStat = {
        totalNum: result.totalNum,
        doneTotalNum: result.doneTotalNum,
      };
    };
    const getMyTaskList = async () => {
      const result = await cubeGridManagementService.getMyGridTaskList({
        pageNumber: 1,
        pageSize: 9999,
        gridAreaId: route.query.id as string,
        dailyType: "GRID_MANAGE",
      });
      tableApi.setDataSource(result.records);
      tableApi.setState({
        pagination: {
          total: result.total,
        },
      });
    };
    const columns = [
      {
        sort: 0,
        title: "任务时间",
        dataIndex: "taskTime",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || ""}>{dayjs(text).format("YYYY-MM-DD HH:mm:ss") || "--"}</PopOver>
        ),
      },
      {
        sort: 1,
        title: "任务名称",
        dataIndex: "taskName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        sort: 2,
        title: "业务来源",
        dataIndex: "businessTypeName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        sort: 3,
        title: "任务状态",
        dataIndex: "status",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text === "TODO" ? "进行中" : "已完成"}>{text === "TODO" ? "进行中" : "已完成"}</PopOver>
        ),
      },
      {
        sort: 4,
        title: "操作",
        dataIndex: "action",
        fixed: "right",
        align: "center",
        defaultVisible: true,
        customRender: ({ record }: { record: TaskRecord }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                const type = record?.status === "TODO" ? "waiting" : record?.status === "DONE" ? "done" : "waiting";
                operate(record, type);
              }}
            >
              详情
            </Button>
          </>
        ),
      },
    ];
    onMounted(() => {
      getTaskStat();
      getMyTaskList();
    });

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "",
      rowKey: "id",
      dataSource: [],
    });

    return () => (
      <div class={styles["task-list"]}>
        <div class={styles["task-list-title"]}>
          <VerticalLine title={"任务事项"} />
          <Space>
            <div>任务数：{state.taskStat?.totalNum || 0}</div>
            <div>进行中：{state.taskStat?.totalNum - state.taskStat?.doneTotalNum || 0}</div>
            <div>已完成：{state.taskStat?.doneTotalNum || 0}</div>
          </Space>
        </div>
        <CubeTable />
      </div>
    );
  },
});

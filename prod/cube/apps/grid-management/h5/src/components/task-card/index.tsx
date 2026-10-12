import { defineComponent, type PropType } from "vue";

import type { GridTaskDTO, GridTaskStatDTO } from "@ghcloud/cube-grid-management-service";

import { Card } from "../card";
import { TaskUI } from "./task-ui";
export const TaskCard = defineComponent({
  props: {
    title: {
      type: String,
      default: "任务事项",
    },
    gridAreaId: {
      type: String,
      default: () => "",
    },
    fromOverview: {
      type: Boolean,
      default: false,
    },
    userIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: true,
    },
    taskInfo: {
      type: Object as PropType<{
        taskList: GridTaskDTO[];
        taskStat: GridTaskStatDTO;
      }>,
      default: () => {},
    },
  },
  emits: ["loadMore"],
  setup: (props, { emit }) => {
    return (): JSX.Element => (
      <Card title={props.title}>
        <TaskUI
          taskInfo={props.taskInfo}
          userIds={props.userIds}
          gridAreaId={props.gridAreaId}
          fromOverview={props.fromOverview}
          loading={props.loading}
          finished={props.finished}
          onLoadMore={() => emit("loadMore")}
        />
      </Card>
    );
  },
});

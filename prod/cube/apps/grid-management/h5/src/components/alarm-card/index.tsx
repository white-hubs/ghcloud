import { defineComponent, type PropType } from "vue";

import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import type { GridTaskStatDTO } from "@ghcloud/cube-grid-management-service";

import { Card } from "../card";
import { AlarmUI } from "./alarm-ui";
export const AlarmCard = defineComponent({
  props: {
    title: {
      type: String,
      default: "告警信息",
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
    alarmInfo: {
      type: Object as PropType<{
        alarmList: AlarmRecord[];
        alarmStat: GridTaskStatDTO;
      }>,
      default: () => {},
    },
  },
  emits: ["loadMore"],
  setup(props, { emit }) {
    return () => (
      <Card title={props.title}>
        <AlarmUI
          alarmInfo={props.alarmInfo}
          userIds={props.userIds}
          loading={props.loading}
          finished={props.finished}
          onLoadMore={() => emit("loadMore")}
        />
      </Card>
    );
  },
});

import styles from "./record-card.module.less";
import type { handoverRecordDTO } from "@ghcloud/cube-grid-management-service";
import dayjs from "dayjs";
import { Button, Cell, CellGroup, Tag } from "vant";
import { defineComponent, type PropType } from "vue";

const handoverStatusText: Record<string, string> = {
  WAIT_HANDOVER: "待接班",
  HAND_OVERED: "已交班",
  TAKE_OVERED: "已接班",
  CANCEL: "已取消",
};

const statusColors: Record<string, { color: string; textColor: string }> = {
  WAIT_HANDOVER: { color: "rgba(21, 120, 255, 0.10)", textColor: "#1578ff" },
  HAND_OVERED: { color: "rgba(7, 193, 96, 0.10)", textColor: "#07c160" },
  TAKE_OVERED: { color: "rgba(7, 193, 96, 0.10)", textColor: "#07c160" },
  CANCEL: { color: "rgba(127, 127, 127, 0.12)", textColor: "#7f7f7f" },
};

const formatTime = (time?: string | number): string => {
  if (!time) {
    return "--";
  }
  return dayjs(time).isValid() ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : String(time);
};

type HandoverRecordTabType = "all" | "pending" | "created";

export const HandoverRecordCard = defineComponent({
  name: "HandoverRecordCard",
  props: {
    record: {
      type: Object as PropType<handoverRecordDTO>,
      required: true,
    },
    tabType: {
      type: String as PropType<HandoverRecordTabType>,
      default: "all",
    },
  },
  emits: {
    detail: (_record: handoverRecordDTO) => true,
    takeover: (_record: handoverRecordDTO) => true,
    cancel: (_record: handoverRecordDTO) => true,
  },
  setup(props, { emit }) {
    const stopAndEmit = (event: Event, type: "takeover" | "cancel"): void => {
      event.stopPropagation();
      emit(type, props.record);
    };

    return (): JSX.Element => {
      const color = statusColors[props.record.status] ?? statusColors.WAIT_HANDOVER;
      return (
        <CellGroup
          class={styles["record-card"]}
          onClick={() => {
            emit("detail", props.record);
          }}
        >
          <Cell
            is-link
            clickable
            center
            v-slots={{
              title: () => (
                <div class={styles["title"]}>
                  <Tag color={color.color} text-color={color.textColor} size="medium">
                    {handoverStatusText[props.record.status] ?? props.record.status}
                  </Tag>
                  <div class={styles["name"]}>{props.record.recordName || "网格交接"}</div>
                </div>
              ),
            }}
          />
          <div class={styles["content"]}>
            {props.record.gridAreaName && <div class={styles["line"]}>交接网格：{props.record.gridAreaName}</div>}
            {props.tabType !== "pending" && <div class={styles["line"]}>接班人：{props.record.takeOverUserName || "--"}</div>}
            {props.tabType !== "created" && ["CANCEL", "WAIT_HANDOVER"].includes(props.record.status) && (
              <>
                <div class={styles["line"]}>交班人：{props.record.shiftOverUserName || "--"}</div>
                <div class={styles["line"]}>交班时间：{formatTime(props.record.shiftOverTime)}</div>
              </>
            )}
            {props.record.status === "HAND_OVERED" && (
              <>
                <div class={styles["line"]}>接班时间：{formatTime(props.record.takeOverTime)}</div>
              </>
            )}
            {props.record.status === "WAIT_HANDOVER" && (
              <div class={styles["actions"]}>
                {props.record.revoke ? (
                  <Button type="primary" size="small" onClick={(event: Event) => stopAndEmit(event, "cancel")}>
                    撤销
                  </Button>
                ) : (
                  <Button type="primary" size="small" onClick={(event: Event) => stopAndEmit(event, "takeover")}>
                    接班
                  </Button>
                )}
              </div>
            )}
          </div>
        </CellGroup>
      );
    };
  },
});

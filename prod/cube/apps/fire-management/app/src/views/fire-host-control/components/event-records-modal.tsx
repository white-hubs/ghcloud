import { computed, defineComponent, watch, type PropType } from "vue";

import { useCubeTable } from "@ghcloud/cube-app-design";
import { Tag } from "@ghcloud/cube-ui";

import { useControlledCubeModal } from "../composables/use-controlled-cube-modal";
import type { FireEventViewModel } from "../models";
import { RecordsEmptyState } from "./records-empty-state";
import { FIRE_EVENT_TAG_COLOR } from "@/utils/fire-event";

const hasEventContent = (event: FireEventViewModel): boolean =>
  [event.deviceInfo, event.pointName, event.time, event.location].some((value) => String(value ?? "").trim().length > 0);

export const EventRecordsModal = defineComponent({
  name: "EventRecordsModal",
  props: {
    visible: { type: Boolean, required: true },
    events: { type: Array as PropType<FireEventViewModel[]>, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: { close: () => true },
  setup(props, { emit }) {
    const visibleEvents = computed(() => props.events.filter(hasEventContent));
    const columns = [
      {
        title: "类型",
        dataIndex: "eventName",
        key: "eventName",
        customRender: ({ text, record }: { text: string; record: FireEventViewModel }) => (
          <Tag color={FIRE_EVENT_TAG_COLOR[record.eventType]}>{text}</Tag>
        ),
      },
      { title: "回路/地址/编号", dataIndex: "deviceInfo", key: "deviceInfo" },
      { title: "报警时间", dataIndex: "time", key: "time" },
      { title: "位置", dataIndex: "location", key: "location" },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      pagination: false,
      scrollY: 260,
      autoFetch: false,
    });
    const [CubeModal] = useControlledCubeModal(() => props.visible, {
      title: "报警与事件记录",
      width: "800px",
      onClosed: () => emit("close"),
    });
    watch(visibleEvents, (events) => tableApi.setDataSource(events), { immediate: true });
    watch(
      () => props.loading,
      (loading) => (tableApi.loading.value = loading),
      { immediate: true },
    );
    return () => (
      <CubeModal
        v-slots={{
          footer: () => null,
          default: () => (
            <div>{props.loading || visibleEvents.value.length > 0 ? <CubeTable /> : <RecordsEmptyState description="暂无事件记录" />}</div>
          ),
        }}
      />
    );
  },
});

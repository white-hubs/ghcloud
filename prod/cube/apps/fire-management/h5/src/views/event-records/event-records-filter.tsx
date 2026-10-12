import { DropdownItem, DropdownMenu, Search } from "vant";
import { defineComponent, reactive, type PropType } from "vue";

import type { EventRecordFilters } from "./event-records.model";
import { DateRangeFilter } from "@/components/date-range-filter/date-range-filter";
import type { MobileSelectOption } from "@/composables/use-fire-host-options";

import styles from "./event-records.module.less";

export const EventRecordsFilter = defineComponent({
  name: "EventRecordsFilter",
  props: {
    initialFilters: {
      type: Object as PropType<EventRecordFilters>,
      required: true,
    },
    hostOptions: {
      type: Array as PropType<MobileSelectOption[]>,
      required: true,
    },
    eventOptions: {
      type: Array as PropType<MobileSelectOption[]>,
      required: true,
    },
  },
  emits: {
    change: (filters: EventRecordFilters) => Boolean(filters),
  },
  setup: (props, { emit }) => {
    const draft = reactive<EventRecordFilters>({ ...props.initialFilters });
    const apply = (): void => emit("change", { ...draft });

    return (): JSX.Element => (
      <section class={styles.filterPanel} aria-label="事件记录筛选条件">
        <DropdownMenu class={styles.dropdownMenu} swipeThreshold={4}>
          <DropdownItem v-model={draft.eventCode} options={props.eventOptions} onChange={apply} />
          <DropdownItem v-model={draft.hostId} options={props.hostOptions} onChange={apply} />
        </DropdownMenu>

        <Search
          class={styles.search}
          v-model={draft.location}
          shape="round"
          placeholder="搜索点位名称/位置"
          onSearch={apply}
          onClear={apply}
        />

        <DateRangeFilter
          startDate={draft.startDate}
          endDate={draft.endDate}
          onChange={(startDate, endDate) => {
            draft.startDate = startDate;
            draft.endDate = endDate;
            apply();
          }}
        />
      </section>
    );
  },
});

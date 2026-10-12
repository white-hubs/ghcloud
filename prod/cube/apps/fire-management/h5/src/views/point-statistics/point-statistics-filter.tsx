import { DropdownItem, DropdownMenu, Search } from "vant";
import { defineComponent, reactive, type PropType } from "vue";

import type { PointStatisticsFilters } from "./point-statistics.model";
import { DateRangeFilter } from "@/components/date-range-filter/date-range-filter";
import type { MobileSelectOption } from "@/composables/use-fire-host-options";

import styles from "./point-statistics.module.less";

export const PointStatisticsFilter = defineComponent({
  name: "PointStatisticsFilter",
  props: {
    initialFilters: {
      type: Object as PropType<PointStatisticsFilters>,
      required: true,
    },
    hostOptions: {
      type: Array as PropType<MobileSelectOption[]>,
      required: true,
    },
  },
  emits: {
    change: (filters: PointStatisticsFilters) => Boolean(filters),
  },
  setup: (props, { emit }) => {
    const draft = reactive<PointStatisticsFilters>({ ...props.initialFilters });
    const apply = (): void => emit("change", { ...draft });

    return (): JSX.Element => (
      <section class={styles.filterPanel} aria-label="点位统计筛选条件">
        <DropdownMenu class={styles.dropdownMenu} swipeThreshold={4}>
          <DropdownItem v-model={draft.hostId} options={props.hostOptions} onChange={apply} />
        </DropdownMenu>

        <Search class={styles.search} v-model={draft.location} shape="round" placeholder="搜索所属位置" onSearch={apply} onClear={apply} />

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

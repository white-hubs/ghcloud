import { DropdownItem, DropdownMenu, Search } from "vant";
import { defineComponent, reactive, type PropType, type VNode } from "vue";

import { OPERATION_RESULT_OPTIONS, OPERATION_TYPE_OPTIONS, type OperationRecordFilters } from "./operation-records.model";
import { DateRangeFilter } from "@/components/date-range-filter/date-range-filter";
import type { MobileSelectOption } from "@/composables/use-fire-host-options";

import styles from "./operation-records.module.less";

export const OperationRecordsFilter = defineComponent({
  name: "OperationRecordsFilter",
  props: {
    initialFilters: {
      type: Object as PropType<OperationRecordFilters>,
      required: true,
    },
    hostOptions: {
      type: Array as PropType<MobileSelectOption[]>,
      required: true,
    },
  },
  emits: {
    change: (filters: OperationRecordFilters) => Boolean(filters),
  },
  setup: (props, { emit }) => {
    const draft = reactive<OperationRecordFilters>({ ...props.initialFilters });
    const apply = (): void => emit("change", { ...draft });

    return (): VNode => (
      <section class={styles.filterPanel} aria-label="操作记录筛选条件">
        <DropdownMenu class={styles.dropdownMenu} swipeThreshold={4}>
          <DropdownItem v-model={draft.operationType} options={OPERATION_TYPE_OPTIONS} onChange={apply} />
          <DropdownItem v-model={draft.result} options={OPERATION_RESULT_OPTIONS} onChange={apply} />
        </DropdownMenu>

        <div class={styles.secondaryFilters}>
          <DropdownMenu class={[styles.dropdownMenu, styles.hostDropdown]} swipeThreshold={4}>
            <DropdownItem v-model={draft.hostId} options={props.hostOptions} onChange={apply} />
          </DropdownMenu>
          <Search
            class={styles.operatorSearch}
            v-model={draft.operator}
            shape="round"
            placeholder="搜索操作人"
            onSearch={apply}
            onClear={apply}
          />
        </div>

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

import { defineComponent, onMounted, onUnmounted, reactive, shallowRef } from "vue";

import { getAlarmEventStatusPage } from "@ghcloud/cube-services-client/alarm-center.client";
import { Select } from "@ghcloud/cube-ui";

interface EventOption {
  label: string;
  value: string;
}

const PAGE_SIZE = 20;
const SEARCH_DELAY = 250;
const DEFAULT_APPLICATION_CODE = "FIRECONTROL";

/** 使用报警统计 event-status-page 接口的异常类型下拉，支持滚动分页加载。 */
export const AlarmEventNameSelect = defineComponent({
  name: "AlarmEventNameSelect",
  props: {
    value: { type: String, default: "" },
    placeholder: { type: String, default: "全部异常" },
    allowClear: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    pageSize: { type: Number, default: PAGE_SIZE },
    applicationCode: { type: String, default: DEFAULT_APPLICATION_CODE },
  },
  emits: ["update:value", "change"],
  setup(props, { emit, attrs }) {
    const options = shallowRef<EventOption[]>([]);
    const state = reactive({ pageNumber: 0, pages: 0, total: 0, keyword: "", loading: false });
    let requestVersion = 0;
    let searchTimer: ReturnType<typeof setTimeout> | undefined;

    const hasMore = (): boolean => state.pageNumber === 0 || state.pageNumber < state.pages;

    const loadPage = async (reset = false): Promise<void> => {
      if (reset) {
        requestVersion += 1;
        state.pageNumber = 0;
        state.pages = 0;
        state.total = 0;
        options.value = [];
      } else if (state.loading || !hasMore()) {
        return;
      }
      const currentVersion = requestVersion;
      const pageNumber = state.pageNumber + 1;
      state.loading = true;
      try {
        const page = await getAlarmEventStatusPage({
          pageNumber,
          pageSize: props.pageSize,
          applicationCode: props.applicationCode,
          ...(state.keyword ? { keyword: state.keyword } : {}),
        });
        if (currentVersion !== requestVersion) return;
        const nextOptions = (page.records ?? [])
          .map((record) => {
            const name = String(record.alarmEventName ?? "").trim();
            return name ? { label: name, value: name } : null;
          })
          .filter((option): option is EventOption => option != null);
        const merged = reset ? nextOptions : [...options.value, ...nextOptions];
        options.value = [...new Map(merged.map((option) => [option.value, option])).values()];
        state.pageNumber = pageNumber;
        state.pages = Number(page.pages ?? Math.ceil(Number(page.total ?? 0) / props.pageSize));
        state.total = Number(page.total ?? options.value.length);
      } catch (error) {
        console.error("Failed to load alarm event options:", error);
      } finally {
        if (currentVersion === requestVersion) state.loading = false;
      }
    };

    const handleSearch = (keyword: string): void => {
      state.keyword = keyword.trim();
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => void loadPage(true), SEARCH_DELAY);
    };

    const handlePopupScroll = (event: Event): void => {
      const target = event.target as HTMLElement;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) void loadPage();
    };

    onMounted(() => void loadPage(true));
    onUnmounted(() => {
      requestVersion += 1;
      if (searchTimer) clearTimeout(searchTimer);
    });

    return () => (
      <Select
        {...attrs}
        value={props.value?.trim() || undefined}
        options={options.value}
        placeholder={props.placeholder}
        allowClear={props.allowClear}
        disabled={props.disabled}
        showSearch
        filterOption={false}
        optionFilterProp="label"
        onSearch={handleSearch}
        onPopupScroll={handlePopupScroll}
        onChange={(value: unknown, option: unknown) => emit("change", String(value ?? ""), option)}
        onUpdate:value={(value: unknown) => emit("update:value", String(value ?? ""))}
      />
    );
  },
});

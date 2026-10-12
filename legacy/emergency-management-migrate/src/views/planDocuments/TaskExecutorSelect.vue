<script setup lang="ts">
import { CheckOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { computed, getCurrentInstance, reactive, watch } from "vue";

type DepartmentNode = {
  id: string | number;
  name: string;
  children?: DepartmentNode[];
};

type UserOption = {
  label: string;
  value: string;
};

type UserRecord = {
  id: string | number;
  name?: string;
  organizations?: Array<{ id: string | number }>;
};

const props = withDefaults(
  defineProps<{
    value?: string;
    userName?: string;
    departments: DepartmentNode[];
    departmentsLoading?: boolean;
    disabled?: boolean;
  }>(),
  {
    value: "",
    userName: "",
    departmentsLoading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (event: "update:value", value: string): void;
  (event: "open-departments"): void;
}>();

const { proxy } = getCurrentInstance()!;
const state = reactive({
  open: false,
  departmentId: undefined as string | number | undefined,
  options: [] as UserOption[],
  pageNumber: 0,
  hasMore: true,
  loading: false,
  keyword: "",
});
const departmentTreeFieldNames = { title: "name", key: "id", children: "children" };
let usersRequestId = 0;
let selectedUserRequestId = 0;

const modelValue = computed({
  get: () => props.value || undefined,
  set: (value: string | undefined) => emit("update:value", value || ""),
});

const selectedOptions = computed(() => {
  if (!props.value) {
    return [];
  }
  return [state.options.find((option) => option.value === props.value) || { label: props.userName || props.value, value: props.value }];
});

const visibleDepartments = computed(() => {
  const keyword = state.departmentId === undefined ? state.keyword.trim().toLowerCase() : "";
  if (!keyword) {
    return props.departments;
  }
  const filter = (departments: DepartmentNode[]): DepartmentNode[] =>
    departments.flatMap((department) => {
      if (department.name.toLowerCase().includes(keyword)) {
        return [department];
      }
      const children = filter(department.children || []);
      return children.length ? [{ ...department, children }] : [];
    });
  return filter(props.departments);
});

const load = async (reset: boolean, keyword = state.keyword): Promise<void> => {
  if (state.departmentId === undefined || (!reset && (state.loading || !state.hasMore))) {
    return;
  }
  const requestId = ++usersRequestId;
  const pageNumber = reset ? 1 : state.pageNumber + 1;
  state.loading = true;
  try {
    const response = (await proxy.$api.tenantUserList({
      enabled: true,
      organizationId: state.departmentId,
      keyword,
      pageNumber,
      pageSize: 50,
    })) as { records?: UserRecord[]; pages?: number };
    if (requestId !== usersRequestId) {
      return;
    }
    const records = response?.records || [];
    const pageOptions = records.map((user) => ({
      label: user.name || String(user.id),
      value: String(user.id),
    }));
    const previousOptions = reset ? state.options.filter((option) => option.value === props.value) : state.options;
    state.options = [...previousOptions, ...pageOptions.filter((option) => !previousOptions.some((item) => item.value === option.value))];
    state.pageNumber = pageNumber;
    state.hasMore = response?.pages ? pageNumber < response.pages : records.length === 50;
  } catch {
    if (requestId === usersRequestId) {
      message.error("人员列表加载失败，请重试");
    }
  } finally {
    if (requestId === usersRequestId) {
      state.loading = false;
    }
  }
};

const loadSelectedUser = async (id: string): Promise<void> => {
  const requestId = ++selectedUserRequestId;
  try {
    const user = (await proxy.$api.userId({ id }, "get")) as UserRecord | null;
    if (requestId !== selectedUserRequestId || props.value !== id || !user) {
      return;
    }
    state.options = [{ label: user.name || props.userName || id, value: id }];
    const departmentId = user.organizations?.at(-1)?.id ?? undefined;
    if (departmentId !== undefined) {
      state.departmentId = departmentId;
      state.keyword = "";
      void load(true);
    }
  } catch {
    // Keep the saved executor visible even if its department cannot be resolved.
  }
};

watch(
  () => props.value,
  (id) => {
    if (!id) {
      selectedUserRequestId += 1;
      return;
    }
    if (state.departmentId !== undefined && state.options.some((option) => option.value === id)) {
      return;
    }
    usersRequestId += 1;
    state.departmentId = undefined;
    state.options = [];
    state.loading = false;
    void loadSelectedUser(id);
  },
  { immediate: true },
);

const onDepartmentChange = (departmentId: string | number | null | undefined): void => {
  selectedUserRequestId += 1;
  usersRequestId += 1;
  state.departmentId = departmentId ?? undefined;
  state.options = [];
  state.pageNumber = 0;
  state.hasMore = true;
  state.loading = false;
  state.keyword = "";
  if (props.value) {
    emit("update:value", "");
  }
  if (state.departmentId !== undefined) {
    void load(true);
  }
};

const onDepartmentSelect = (keys: Array<string | number>): void => {
  const departmentId = keys[0];
  if (departmentId !== undefined && String(departmentId) !== String(state.departmentId)) {
    onDepartmentChange(departmentId);
  }
};

const onDropdownVisibleChange = (open: boolean): void => {
  state.open = open;
  if (!open) {
    state.keyword = "";
    return;
  }
  if (!props.departments.length) {
    emit("open-departments");
  }
  if (state.departmentId !== undefined && (state.keyword || state.pageNumber === 0)) {
    state.keyword = "";
    void load(true);
  }
};

const onSearch = (keyword: string): void => {
  state.keyword = keyword;
  if (state.departmentId !== undefined) {
    void load(true, keyword);
  }
};

const onUserSelect = (option: UserOption): void => {
  emit("update:value", option.value);
  state.keyword = "";
  state.open = false;
};

const onClear = (): void => {
  onDepartmentChange(undefined);
};

const onPopupScroll = (event: Event): void => {
  const target = event.target as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
    void load(false);
  }
};
</script>

<template>
  <a-select
    v-model:value="modelValue"
    :disabled="disabled"
    :filter-option="false"
    :open="state.open"
    :options="selectedOptions"
    :search-value="state.keyword"
    aria-label="执行人员"
    allow-clear
    show-search
    placeholder="请选择执行人员"
    @clear="onClear"
    @dropdown-visible-change="onDropdownVisibleChange"
    @search="onSearch"
  >
    <template #dropdownRender>
      <div class="executor-dropdown" @mousedown.prevent>
        <div class="department-panel">
          <div class="panel-heading">部门</div>
          <a-spin :spinning="departmentsLoading">
            <a-tree
              v-if="visibleDepartments.length"
              :key="state.departmentId === undefined ? state.keyword : 'all'"
              :tree-data="visibleDepartments"
              :field-names="departmentTreeFieldNames"
              :selected-keys="state.departmentId === undefined ? [] : [state.departmentId]"
              block-node
              default-expand-all
              @select="onDepartmentSelect"
            />
            <div v-else class="panel-empty">{{ departmentsLoading ? "加载中..." : "暂无部门" }}</div>
          </a-spin>
        </div>
        <div class="person-panel">
          <div class="panel-heading">人员</div>
          <div v-if="state.departmentId === undefined" class="panel-empty">请选择部门</div>
          <a-spin v-else :spinning="state.loading">
            <div v-if="state.options.length" class="person-list" role="listbox" aria-label="部门人员" @scroll="onPopupScroll">
              <button
                v-for="option in state.options"
                :key="option.value"
                type="button"
                class="person-option"
                :class="{ 'person-option-selected': option.value === value }"
                :aria-selected="option.value === value"
                :title="option.label"
                role="option"
                @click.stop="onUserSelect(option)"
              >
                <span>{{ option.label }}</span>
                <CheckOutlined v-if="option.value === value" />
              </button>
              <a-button v-if="state.hasMore" type="link" size="small" :loading="state.loading" @click.stop="load(false)">加载更多</a-button>
            </div>
            <div v-else class="panel-empty">{{ state.loading ? "加载中..." : "暂无人员" }}</div>
          </a-spin>
        </div>
      </div>
    </template>
  </a-select>
</template>

<style lang="less" scoped>
.executor-dropdown {
  display: grid;
  grid-template-columns: minmax(0, 40%) minmax(0, 1fr);
  min-height: 250px;
}

.department-panel,
.person-panel {
  min-width: 0;
  max-height: 280px;
  overflow-y: auto;
}

.department-panel {
  border-right: 1px solid #e5e7eb;
}

.panel-heading {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 12px;
  background: #fafafa;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
}

.department-panel :deep(.ant-tree) {
  padding: 6px 4px;
}

.person-list {
  max-height: 244px;
  overflow-y: auto;
}

.person-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 6px 12px;
  border: 0;
  background: #fff;
  color: #374151;
  text-align: left;
  cursor: pointer;
}

.person-option span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-option:hover,
.person-option-selected {
  background: #e6f4ff;
}

.panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 196px;
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 640px) {
  .executor-dropdown {
    grid-template-columns: 1fr;
  }

  .department-panel {
    max-height: 150px;
    border-right: 0;
    border-bottom: 1px solid #e5e7eb;
  }
}
</style>

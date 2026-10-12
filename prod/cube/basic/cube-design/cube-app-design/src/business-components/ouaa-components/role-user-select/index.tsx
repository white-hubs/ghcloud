import { Select } from "ant-design-vue";
import { computed, defineComponent, onMounted, reactive, watch, type PropType } from "vue";

import type { PersonItem, RoleItem } from "@ghcloud/cube-ouaa-service";

import { cubeOuaaService } from "../../../api/service";

import styles from "./index.module.less";

interface RoleUserValue {
  roleId?: string;
  userId?: string | string[];
  roleName?: string;
  userName?: string | string[];
}

interface UserOption {
  id: string;
  name: string;
}

const roleOptionsCache: Record<string, { options: RoleItem[]; loaded: boolean; loading: boolean }> = {};

const getRoleCacheKey = (filterEnabled: boolean): string => {
  const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") ?? "{}");
  return `enabled:${filterEnabled}:${tenant?.code ?? "default"}`;
};

const toUserOption = (record: PersonItem): UserOption => ({
  id: record.id,
  name: record.name,
});

const fetchUserOptionsByRole = async (roleId: string, filterEnabled: boolean): Promise<UserOption[]> => {
  const pageSize = 200;
  const first = await cubeOuaaService.getStaffPage({
    pageNumber: 1,
    pageSize,
    enabled: filterEnabled,
    roleId,
  });
  const options = first.records.map(toUserOption);
  const pages = first.pages ?? 1;
  for (let pageNumber = 2; pageNumber <= pages; pageNumber++) {
    const page = await cubeOuaaService.getStaffPage({
      pageNumber,
      pageSize,
      enabled: filterEnabled,
      roleId,
    });
    options.push(...page.records.map(toUserOption));
  }
  return options;
};

export const RoleUserSelect = defineComponent({
  props: {
    value: {
      type: Object as PropType<RoleUserValue>,
      default: undefined,
    },
    roleId: {
      type: String,
      default: undefined,
    },
    userId: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    filterEnabled: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    roleDisabled: {
      type: Boolean,
      default: false,
    },
    userDisabled: {
      type: Boolean,
      default: false,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
    rolePlaceholder: {
      type: String,
      default: "请选择角色",
    },
    userPlaceholder: {
      type: String,
      default: "请选择人员",
    },
    maxTagCount: {
      type: Number,
      default: undefined,
    },
  },
  emits: ["update:value", "update:roleId", "update:userId", "change"],
  setup: (props, { emit }) => {
    const state = reactive({
      roleId: props.roleId ?? props.value?.roleId ?? "",
      userId: props.userId ?? props.value?.userId ?? (props.multiple ? [] : ""),
      roleOptions: [] as RoleItem[],
      userOptions: [] as UserOption[],
      userLoading: false,
    });

    const roleValue = computed(() => props.roleId ?? props.value?.roleId ?? state.roleId);
    const userValue = computed(() => props.userId ?? props.value?.userId ?? state.userId);

    const getEmptyUserValue = (): string | string[] => (props.multiple ? [] : "");

    const normalizeUserValue = (value: string | string[] | undefined): string | string[] => {
      if (props.multiple) {
        if (Array.isArray(value)) {
          return value.map((item) => String(item)).filter(Boolean);
        }
        return value ? [String(value)] : [];
      }
      if (Array.isArray(value)) {
        return value[0] ?? "";
      }
      return value ?? "";
    };

    const hasUserValue = (value: string | string[]): boolean => (Array.isArray(value) ? value.length > 0 : Boolean(value));

    const filterSelectedUsers = (value: string | string[]): string | string[] => {
      const optionIds = new Set(state.userOptions.map((item) => item.id));
      if (Array.isArray(value)) {
        return value.filter((id) => optionIds.has(id));
      }
      return optionIds.has(value) ? value : "";
    };

    const getSelectedRoleName = (): string | undefined => state.roleOptions.find((item) => item.id === state.roleId)?.name;

    const getSelectedUserName = (value: string | string[]): string | string[] | undefined => {
      if (Array.isArray(value)) {
        const names = value.map((id) => state.userOptions.find((item) => item.id === id)?.name).filter(Boolean) as string[];
        return names.length > 0 ? names : undefined;
      }
      return state.userOptions.find((item) => item.id === value)?.name;
    };

    const emitValue = (): void => {
      const normalizedUserId = normalizeUserValue(state.userId);
      const value = {
        roleId: state.roleId || undefined,
        userId: hasUserValue(normalizedUserId) ? normalizedUserId : undefined,
        roleName: getSelectedRoleName(),
        userName: hasUserValue(normalizedUserId) ? getSelectedUserName(normalizedUserId) : undefined,
      };
      emit("update:roleId", value.roleId);
      emit("update:userId", value.userId);
      emit("update:value", value);
      emit("change", value);
    };

    const fetchRoles = async (): Promise<void> => {
      const cacheKey = getRoleCacheKey(props.filterEnabled);
      const cache = roleOptionsCache[cacheKey];
      if (cache?.loaded) {
        state.roleOptions = cache.options;
        return;
      }
      if (!roleOptionsCache[cacheKey]) {
        roleOptionsCache[cacheKey] = { options: [], loaded: false, loading: false };
      }
      const currentCache = roleOptionsCache[cacheKey];
      if (currentCache.loading) {
        while (currentCache.loading) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        state.roleOptions = currentCache.options;
        return;
      }
      currentCache.loading = true;
      try {
        const options = await cubeOuaaService.getRole({ enabled: props.filterEnabled });
        currentCache.options = options;
        currentCache.loaded = true;
        state.roleOptions = options;
      } finally {
        currentCache.loading = false;
      }
    };

    const fetchUsersByRole = async (roleId: string): Promise<void> => {
      if (!roleId) {
        state.userOptions = [];
        return;
      }
      state.userLoading = true;
      try {
        state.userOptions = await fetchUserOptionsByRole(roleId, props.filterEnabled);
      } finally {
        state.userLoading = false;
      }
    };

    watch(roleValue, async (value) => {
      state.roleId = value ?? "";
      await fetchUsersByRole(state.roleId);
      const nextUserId = filterSelectedUsers(normalizeUserValue(state.userId));
      if (JSON.stringify(nextUserId) !== JSON.stringify(state.userId)) {
        state.userId = nextUserId;
        emitValue();
      }
    });

    watch(userValue, (value) => {
      state.userId = normalizeUserValue(value);
    });

    onMounted(async () => {
      await fetchRoles();
      await fetchUsersByRole(state.roleId);
    });

    const handleRoleChange = (value: string | undefined): void => {
      state.roleId = value ?? "";
      state.userId = getEmptyUserValue();
      emitValue();
    };

    const handleUserChange = (value: string | string[] | undefined): void => {
      state.userId = normalizeUserValue(value);
      emitValue();
    };

    const handleRoleFilterOption = (input: string, option: unknown): boolean => {
      const optionNode = option as RoleItem;
      return optionNode.name.toLowerCase().includes(input.toLowerCase());
    };

    const handleUserFilterOption = (input: string, option: unknown): boolean => {
      const optionNode = option as UserOption;
      return optionNode.name.toLowerCase().includes(input.toLowerCase());
    };

    return (): JSX.Element => (
      <div class={styles.container}>
        <Select
          class={styles.roleSelect}
          value={state.roleId || undefined}
          disabled={props.disabled || props.roleDisabled}
          allowClear={props.allowClear}
          show-search={props.showSearch}
          placeholder={props.rolePlaceholder}
          options={state.roleOptions}
          fieldNames={{ label: "name", value: "id" }}
          filterOption={props.showSearch ? handleRoleFilterOption : undefined}
          onUpdate:value={(value: string | undefined) => {
            handleRoleChange(value);
          }}
        />
        <Select
          class={styles.userSelect}
          value={hasUserValue(normalizeUserValue(state.userId)) ? state.userId : undefined}
          mode={props.multiple ? "multiple" : undefined}
          disabled={props.disabled || props.userDisabled || !state.roleId}
          allowClear={props.allowClear}
          maxTagCount={props.maxTagCount}
          show-search={props.showSearch}
          placeholder={state.roleId ? props.userPlaceholder : "请先选择角色"}
          options={state.userOptions}
          fieldNames={{ label: "name", value: "id" }}
          loading={state.userLoading}
          filterOption={props.showSearch ? handleUserFilterOption : undefined}
          onUpdate:value={handleUserChange}
        />
      </div>
    );
  },
});

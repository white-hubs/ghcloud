import { Select, Spin } from "ant-design-vue";
import { computed, defineComponent, onMounted, reactive, watch } from "vue";

import type { PersonItem } from "@ghcloud/cube-ouaa-service";

import { cubeOuaaService } from "../../../api/service";

type UserSelectValue = string | string[] | null | undefined;

const normalizeSelectedUserId = (value: UserSelectValue): string | undefined => {
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : undefined;
  }
  return value || undefined;
};

/**
 * 人员选择组件-分页-单选
 */
export const UserSelectPage = defineComponent({
  props: {
    value: {
      type: String || Array,
      default: null,
    },
    filterEnabled: {
      type: Boolean,
      default: true,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
    maxTagCount: {
      type: Number,
    },
    selectedValue: {
      type: String,
      default: null,
    },
  },
  emits: ["update:value", "change"],
  setup: (props, { emit }) => {
    const state = reactive<{
      options: PersonItem[];
      selectUser: PersonItem | null;
      loading: boolean;
      keyword: string;
      pagination: {
        pageNumber: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
      };
    }>({
      options: [],
      loading: false,
      keyword: "",
      selectUser: null,
      pagination: {
        pageNumber: 1,
        pageSize: 20,
        total: 0,
        hasMore: true,
      },
    });
    const selectOptions = computed(() => {
      if (state.selectUser) {
        const newOptions = [state.selectUser, ...state.options];

        return Array.from(new Map(newOptions.map((item: PersonItem) => [String(item.id), item])).values()) as PersonItem[];
      }

      return state.options;
    });

    const selectedUserId = computed(() => props.selectedValue || normalizeSelectedUserId(props.value as UserSelectValue));
    let selectedUserRequestId = 0;

    const getSelectedUser = async (userId: string): Promise<void> => {
      const requestId = ++selectedUserRequestId;
      const existsInOptions = state.options.some((item) => String(item.id) === userId);

      if (existsInOptions) {
        state.selectUser = null;
        return;
      }

      if (state.selectUser?.id && String(state.selectUser.id) === userId) {
        return;
      }

      try {
        const data = await cubeOuaaService.getPersonInfo(userId);
        if (requestId === selectedUserRequestId && selectedUserId.value === userId) {
          state.selectUser = data as unknown as PersonItem;
        }
      } catch {
        if (requestId === selectedUserRequestId) {
          state.selectUser = null;
        }
      }
    };

    const syncSelectedUser = async (): Promise<void> => {
      const userId = selectedUserId.value;
      if (!userId) {
        selectedUserRequestId++;
        state.selectUser = null;
        return;
      }
      await getSelectedUser(userId);
    };

    watch(selectedUserId, () => {
      void syncSelectedUser();
    });

    /**
     * 获取用户列表数据（分页）
     */
    const fetchUserList = async (isReset = false): Promise<void> => {
      if (state.loading) return;

      try {
        state.loading = true;

        if (isReset) {
          state.pagination.pageNumber = 1;
          state.options = [];
        }

        const { records, total } = await cubeOuaaService.getStaffPage({
          pageNumber: state.pagination.pageNumber,
          pageSize: state.pagination.pageSize,
          keyword: state.keyword || undefined,
          enabled: props.filterEnabled,
        });

        if (isReset) {
          state.options = records;
        } else {
          state.options = [...state.options, ...records];
        }

        state.pagination.total = total;
        state.pagination.hasMore = state.options.length < total;
        state.pagination.pageNumber++;
      } finally {
        state.loading = false;
      }
    };

    /**
     * 处理搜索关键字变化
     */
    const handleSearch = (value: string): void => {
      state.keyword = value;
      fetchUserList(true);
    };

    /**
     * 处理滚动加载更多
     */
    const handlePopupScroll = (e: Event): void => {
      const target = e.target as HTMLElement;
      if (!state.loading && state.pagination.hasMore && target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
        fetchUserList();
      }
    };

    onMounted(() => {
      void fetchUserList().then(() => syncSelectedUser());
    });

    return (): JSX.Element => (
      <Select
        {...props}
        placeholder="请选择人员"
        onChange={(value: unknown, option: unknown) => {
          emit("change", value, option);
        }}
        options={selectOptions.value}
        fieldNames={{
          label: "name",
          value: "id",
        }}
        v-model:value={props.value}
        show-search={props.showSearch}
        filterOption={false}
        onSearch={handleSearch}
        onPopupScroll={handlePopupScroll}
        loading={state.loading}
        notFoundContent={state.loading ? <Spin size="small" /> : null}
        onUpdate:value={(value) => {
          emit("update:value", value);
        }}
      />
    );
  },
});

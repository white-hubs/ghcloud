import { cubeCloudQrCodeService } from "@/api/server";
import type { ProjectEntity } from "@ghcloud/cube-ghcloud-cloud-qr-code-service";
import { Select } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref, computed, watch, nextTick } from "vue";

interface OptionItem {
  label: string;
  value: string;
}

export const GrantProjectSelect = defineComponent({
  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: undefined,
    },
    options: {
      type: Array as () => OptionItem[],
      default: undefined,
    },
  },
  emits: ["update:value", "change", "select"],
  setup(props, { emit }) {
    const projects = ref<ProjectEntity[]>([]);
    const searchValue = ref<string>("");

    // 计算选项列表
    const options = computed<OptionItem[]>(() => {
      let baseOptions: OptionItem[] = [];

      if (props.options) {
        baseOptions = props.options;
      } else {
        // 确保projects.value是数组
        baseOptions = Array.isArray(projects.value)
          ? projects.value.map((item) => ({
              label: item.name,
              value: item.id.toString(),
            }))
          : [];
      }

      // 如果有搜索值，进行过滤
      if (searchValue.value) {
        return baseOptions.filter((option) => option.label.toLowerCase().includes(searchValue.value.toLowerCase()));
      }

      return baseOptions;
    });

    // 获取原始项目数据
    const getProjectData = (selectedValue: string): ProjectEntity | undefined => {
      if (!Array.isArray(projects.value)) {
        return undefined;
      }
      return projects.value.find((item) => item.id.toString() === selectedValue);
    };

    // 获取显示标签
    const getDisplayLabel = (selectedValue?: string): string => {
      if (!selectedValue) {
        return "--";
      }
      return options.value.find((option) => option.value === selectedValue)?.label ?? "--";
    };

    // 获取项目列表
    const fetchGrantCients = async (): Promise<void> => {
      if (props.options) {
        return;
      }

      try {
        const response = await cubeCloudQrCodeService.getProjects({
          pageNumber: 1,
          pageSize: 100,
        });
        // 确保response是数组
        projects.value = response.records || [];
      } catch {
        projects.value = [];
      }
    };

    // 处理值变化
    const handleValueChange = async (newValue: string | undefined): Promise<void> => {
      // 先更新值
      emit("update:value", newValue);

      // 等待下一个tick确保值已经更新到父组件
      await nextTick();

      // 再触发change事件
      const originalData = newValue ? getProjectData(newValue) : undefined;
      emit("change", newValue, originalData);
    };

    // 处理选择事件
    const handleSelect = (selectedValue: string): void => {
      const originalData = getProjectData(selectedValue);
      emit("select", selectedValue, originalData);
    };

    // 处理搜索
    const handleSearch = (value: string): void => {
      searchValue.value = value;
    };

    // 监听外部value变化
    const internalValue = ref(props.value);
    watch(
      () => props.value,
      (newValue) => {
        internalValue.value = newValue;
      },
      { immediate: true },
    );

    // 移除对internalValue的watch，避免重复触发
    // 直接在Select组件的change事件中处理
    const handleSelectChange = (newValue: string | undefined): void => {
      internalValue.value = newValue;
      handleValueChange(newValue);
    };

    onMounted(() => {
      fetchGrantCients();
    });

    return (): JSX.Element | string => {
      if (props.readonly) {
        return getDisplayLabel(props.value);
      }

      return (
        <Select
          options={options.value}
          placeholder="请选择项目"
          value={internalValue.value}
          allowClear
          showSearch
          filterOption={false}
          onSelect={handleSelect}
          onChange={handleSelectChange}
          onSearch={handleSearch}
        />
      );
    };
  },
});

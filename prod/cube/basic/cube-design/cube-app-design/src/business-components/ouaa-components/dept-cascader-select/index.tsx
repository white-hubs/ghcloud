import { defineComponent, ref, watch } from "vue";

import type { AreaTree, DeptList } from "@ghcloud/cube-ouaa-service";
import { TreeSelect } from "@ghcloud/cube-ui";

import { cubeOuaaService } from "../../../api/service";

interface Props {
  multiple: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
  maxTagCount: number;
  filterEnabled: boolean;
  treeDefaultExpandAll: boolean;
}

/** 部门选择 */

// 部门树数据全局缓存，按租户 + enabled 维度缓存，避免多个 DeptCascaderSelect 重复请求
const deptTreeCacheMap: Record<string, { options: DeptList[]; loaded: boolean; loading: boolean }> = {};
const getDeptCacheKey = (filterEnabled: boolean): string => {
  const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") ?? "{}");
  return `enabled:${filterEnabled}:${tenant?.code ?? "default"}`;
};

export const DeptCascaderSelect = defineComponent({
  props: ["multiple", "value", "placeholder", "readonly", "maxTagCount", "filterEnabled", "treeDefaultExpandAll"],
  emits: ["update:value", "change"],
  setup(props: Props, { emit }) {
    const select = ref(props.value);
    const filterEnabled = props.filterEnabled ?? true;
    const deptOptions = ref<DeptList[]>([]);

    const fetchDeptTreeWithCache = async (): Promise<void> => {
      const cacheKey = getDeptCacheKey(filterEnabled);
      const cache = deptTreeCacheMap[cacheKey];

      // 命中缓存
      if (cache?.loaded) {
        deptOptions.value = cache.options;
        return;
      }

      // 初始化缓存
      if (!deptTreeCacheMap[cacheKey]) {
        deptTreeCacheMap[cacheKey] = { options: [], loaded: false, loading: false };
      }
      const currentCache = deptTreeCacheMap[cacheKey];

      // 其他实例正在加载，等待完成后复用结果
      if (currentCache.loading) {
        while (currentCache.loading) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        deptOptions.value = currentCache.options;
        return;
      }

      // 当前实例发起加载
      currentCache.loading = true;
      try {
        const res = await cubeOuaaService.getDept({ enabled: filterEnabled });
        currentCache.options = res;
        currentCache.loaded = true;
        deptOptions.value = res;
      } finally {
        currentCache.loading = false;
      }
    };

    fetchDeptTreeWithCache();

    watch(
      () => props.value,
      () => {
        select.value = props.value ?? (props.multiple ? [] : "");
      },
    );
    return (): JSX.Element => (
      <TreeSelect
        {...props}
        fieldNames={{ label: "name", value: "id", children: "children" }}
        placeholder={props.placeholder ?? "请选择"}
        allow-clear
        multiple={props.multiple ?? false}
        treeData={deptOptions.value}
        v-model:value={select.value}
        onChange={(val: string[], selectedOptions: AreaTree[]) => {
          emit("update:value", val);
          emit("change", selectedOptions);
        }}
        disabled={props.readonly}
        showSearch
        maxTagCount={props.maxTagCount}
        treeDefaultExpandAll={props.treeDefaultExpandAll}
      />
    );
  },
});

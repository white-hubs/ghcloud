import { computed, defineComponent, onMounted, ref, shallowRef, watch } from "vue";

import type { HazardCategoryTreeVO } from "@ghcloud/cube-service-interface/hazard-governance";
import type { RiskObjectVO, RiskUnitVO } from "@ghcloud/cube-service-interface/risk-graded-control";
import { Cascader, Select, message } from "@ghcloud/cube-ui";

import { getHazardCategoryTree, pageRiskObjects, pageRiskUnits } from "@/api/hazard-report-service";

interface HazardCategorySelectedOption {
  label?: string;
  value?: string;
}

type OptionSource = RiskUnitVO | RiskObjectVO;

interface SelectOption<T extends OptionSource = OptionSource> {
  label: string;
  value: string;
  source?: T;
}

type PopupContainerResolver = () => HTMLElement;

let cachedCategoryOptions: HazardCategoryTreeVO[] | undefined;
let loadingCategoryPromise: Promise<HazardCategoryTreeVO[]> | undefined;

const PAGE_SIZE = 500;

const normalizeHazardCategoryTree = (nodes: HazardCategoryTreeVO[]): HazardCategoryTreeVO[] =>
  [...nodes]
    .sort((left, right) => (left.sortNo ?? 0) - (right.sortNo ?? 0))
    .map((node) => ({
      ...node,
      id: String(node.id),
      ...(node.parentId === undefined || node.parentId === null ? {} : { parentId: String(node.parentId) }),
      ...(node.children ? { children: normalizeHazardCategoryTree(node.children) } : {}),
    }));

const resolveHazardCategoryPath = (value: unknown, options: HazardCategoryTreeVO[]): string[] => {
  const currentPath = Array.isArray(value) ? value.map(String) : [];
  const targetId = currentPath.at(-1);
  if (!targetId) {
    return [];
  }
  const findPath = (nodes: HazardCategoryTreeVO[], parentPath: string[]): string[] | undefined => {
    for (const node of nodes) {
      const nodePath = [...parentPath, String(node.id)];
      if (String(node.id) === targetId) {
        return nodePath;
      }
      const childPath = node.children ? findPath(node.children, nodePath) : undefined;
      if (childPath) {
        return childPath;
      }
    }
    return undefined;
  };
  return findPath(options, []) ?? currentPath;
};

const loadHazardCategoryOptions = async (): Promise<HazardCategoryTreeVO[]> => {
  if (cachedCategoryOptions) {
    return cachedCategoryOptions;
  }
  loadingCategoryPromise ??= getHazardCategoryTree()
    .then((response) => {
      cachedCategoryOptions = normalizeHazardCategoryTree(Array.isArray(response) ? response : []);
      return cachedCategoryOptions;
    })
    .finally(() => {
      loadingCategoryPromise = undefined;
    });
  return loadingCategoryPromise;
};

const readText = (...values: Array<string | number | undefined | null>): string => {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  return value === undefined || value === null ? "" : String(value);
};

const createUniqueOptions = <T extends OptionSource>(options: Array<SelectOption<T>>): Array<SelectOption<T>> => {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (!option.value || seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};

const mapUnitOption = (unit: RiskUnitVO): SelectOption<RiskUnitVO> => {
  const value = readText(unit.id, unit.unitId);
  const name = readText(unit.unitName, unit.name, unit.code, value);
  return {
    label: unit.code ? `${name}（${unit.code}）` : name,
    value,
    source: unit,
  };
};

const mapRiskObjectOption = (object: RiskObjectVO): SelectOption<RiskObjectVO> => {
  const value = readText(object.id, object.objectId);
  const name = readText(object.objectName, object.name, object.objectCode, object.code, value);
  const code = readText(object.objectCode, object.code);
  return {
    label: code && code !== name ? `${name}（${code}）` : name,
    value,
    source: object,
  };
};

const readOption = <T extends OptionSource>(option: unknown): SelectOption<T> | undefined => {
  if (Array.isArray(option)) return option[0] as SelectOption<T> | undefined;
  return option as SelectOption<T> | undefined;
};

const readSelectValue = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  return String(value);
};

const toSelectDisplayValue = (value: string): string | undefined => {
  return value || undefined;
};

export const DroneHazardCategoryCascader = defineComponent({
  name: "DroneHazardCategoryCascader",
  props: {
    value: { type: Array, default: () => [] },
    placeholder: { type: String, default: "请选择一级 / 二级 / 三级类型" },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    requiredLevel: { type: Number, default: 3 },
    getPopupContainer: { type: Function, default: undefined },
  },
  emits: ["update:value", "change"],
  setup: (props, { emit }) => {
    const options = ref<HazardCategoryTreeVO[]>(cachedCategoryOptions ?? []);
    const loading = ref(false);
    const displayValue = computed(() => resolveHazardCategoryPath(props.value, options.value));

    const loadOptions = async (): Promise<void> => {
      loading.value = true;
      try {
        options.value = await loadHazardCategoryOptions();
      } catch {
        message.error("隐患类型加载失败");
      } finally {
        loading.value = false;
      }
    };

    const handleChange = (value: unknown, selectedOptions?: HazardCategorySelectedOption[]): void => {
      const categoryPath = Array.isArray(value) ? value.map(String) : [];
      const categoryOptions = selectedOptions ?? [];
      if (categoryPath.length === 0) {
        emit("update:value", []);
        emit("change", [], categoryOptions);
        return;
      }
      if (categoryOptions.length > 0 && categoryOptions.length !== props.requiredLevel) {
        message.warning(`请选择到第${props.requiredLevel}级隐患类型`);
        return;
      }
      emit("update:value", categoryPath);
      emit("change", categoryPath, categoryOptions);
    };

    onMounted(() => {
      if (options.value.length === 0) {
        void loadOptions();
      }
    });

    return () => (
      <Cascader
        value={displayValue.value}
        fieldNames={{ label: "name", value: "id", children: "children" }}
        options={options.value}
        placeholder={loading.value ? "隐患类型加载中" : props.placeholder}
        allowClear={props.allowClear}
        showSearch
        disabled={props.disabled || loading.value}
        getPopupContainer={props.getPopupContainer as PopupContainerResolver | undefined}
        onChange={handleChange}
      />
    );
  },
});

export const DroneRiskUnitObjectSelect = defineComponent({
  name: "DroneRiskUnitObjectSelect",
  props: {
    unitValue: { type: String, default: "" },
    objectValue: { type: String, default: "" },
    unitName: { type: String, default: "" },
    objectName: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    getPopupContainer: { type: Function, default: undefined },
  },
  emits: ["update:unitValue", "update:objectValue", "update:unitName", "update:objectName"],
  setup: (props, { emit }) => {
    const unitOptions = shallowRef<Array<SelectOption<RiskUnitVO>>>([]);
    const objectOptions = shallowRef<Array<SelectOption<RiskObjectVO>>>([]);
    const unitLoading = shallowRef(false);
    const objectLoading = shallowRef(false);

    const allUnitOptions = computed(() =>
      createUniqueOptions(
        [props.unitValue ? { label: props.unitName || props.unitValue, value: props.unitValue } : undefined, ...unitOptions.value].filter(
          Boolean,
        ) as Array<SelectOption<RiskUnitVO>>,
      ),
    );

    const allObjectOptions = computed(() =>
      createUniqueOptions(
        [
          props.objectValue ? { label: props.objectName || props.objectValue, value: props.objectValue } : undefined,
          ...objectOptions.value,
        ].filter(Boolean) as Array<SelectOption<RiskObjectVO>>,
      ),
    );

    const loadUnits = async (keyword = ""): Promise<void> => {
      unitLoading.value = true;
      try {
        const page = await pageRiskUnits({
          pageNumber: 1,
          pageSize: PAGE_SIZE,
          ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
          view: "option",
        });
        unitOptions.value = (page.records ?? []).map(mapUnitOption).filter((option) => option.value);
      } catch {
        message.error("加载风险单元失败");
      } finally {
        unitLoading.value = false;
      }
    };

    const loadRiskObjects = async (unitId: string, keyword = ""): Promise<void> => {
      if (!unitId) {
        objectOptions.value = [];
        return;
      }
      objectLoading.value = true;
      try {
        const page = await pageRiskObjects({
          unitId,
          pageNumber: 1,
          pageSize: PAGE_SIZE,
          ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
          view: "option",
        });
        objectOptions.value = (page.records ?? []).map(mapRiskObjectOption).filter((option) => option.value);
      } catch {
        message.error("加载风险对象失败");
      } finally {
        objectLoading.value = false;
      }
    };

    const updateUnit = (value: unknown, option?: SelectOption<RiskUnitVO>): void => {
      const unitId = readSelectValue(value);
      const unitName = option?.label || "";
      emit("update:unitValue", unitId);
      emit("update:unitName", unitName);
      emit("update:objectValue", "");
      emit("update:objectName", "");
      objectOptions.value = [];
      if (unitId) void loadRiskObjects(unitId);
    };

    const updateObject = (value: unknown, option?: SelectOption<RiskObjectVO>): void => {
      const objectId = readSelectValue(value);
      const objectName = option?.label || "";
      emit("update:objectValue", objectId);
      emit("update:objectName", objectName);
    };

    watch(
      () => props.unitValue,
      (unitId) => {
        if (!unitId) {
          objectOptions.value = [];
          return;
        }
        void loadRiskObjects(unitId);
      },
    );

    onMounted(() => {
      void loadUnits();
      if (props.unitValue) void loadRiskObjects(props.unitValue);
    });

    return () => (
      <div class="drone-risk-unit-object-select">
        <div class="drone-risk-unit-object-field">
          <div class="drone-risk-unit-object-label">风险单元</div>
          <Select
            value={toSelectDisplayValue(props.unitValue)}
            options={allUnitOptions.value}
            loading={unitLoading.value}
            disabled={props.disabled}
            allowClear={props.allowClear}
            showSearch
            filterOption={false}
            placeholder="请选择风险单元"
            getPopupContainer={props.getPopupContainer as PopupContainerResolver | undefined}
            onSearch={(keyword: string) => void loadUnits(keyword)}
            onChange={(value: unknown, option: unknown) => updateUnit(value, readOption<RiskUnitVO>(option))}
          />
        </div>
        <div class="drone-risk-unit-object-field">
          <div class="drone-risk-unit-object-label">风险对象</div>
          <Select
            value={toSelectDisplayValue(props.objectValue)}
            options={allObjectOptions.value}
            loading={objectLoading.value}
            disabled={props.disabled || !props.unitValue}
            allowClear={props.allowClear}
            showSearch
            filterOption={false}
            placeholder={props.unitValue ? "请选择风险对象" : "请先选择风险单元"}
            getPopupContainer={props.getPopupContainer as PopupContainerResolver | undefined}
            onSearch={(keyword: string) => void loadRiskObjects(props.unitValue, keyword)}
            onChange={(value: unknown, option: unknown) => updateObject(value, readOption<RiskObjectVO>(option))}
          />
        </div>
      </div>
    );
  },
});

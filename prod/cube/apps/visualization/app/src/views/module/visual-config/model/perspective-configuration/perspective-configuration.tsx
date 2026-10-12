import { computed, defineComponent, inject, onMounted, reactive, ref, Teleport, watch } from "vue";

import type { BusinessAreaNode } from "@ghcloud/cube-service-interface/mdata";
import { listBusinessAreas } from "@ghcloud/cube-services-client/mdata.client";
import { Button, Cascader, Empty, Form, FormItem, Input, Modal, Spin, Textarea, message } from "@ghcloud/cube-ui";

import { CONFIG_SHELL_TITLE_EXTRA_ID, CONFIG_SHELL_TITLE_META_ID } from "../../config-shell";
import { MODEL_CONFIGURATION_KEY, type ModelConfigurationApi } from "../composables/use-model-configuration";
import { validateImportedModelConfiguration, type ModelConfig } from "../types";
import { createConfigId, isGisEntry, isScadaEntry, isThreeEntry, isUe5Entry } from "../utils/entry";
import { PerspectiveAreaTree } from "./perspective-area-tree";
import {
  buildAreaPerspectiveMarkers,
  classifyUe5Perspective,
  normalizeAreaPath,
  type AreaPerspectiveMarker,
  type PerspectiveAreaSelection,
  type PerspectiveScope,
} from "./perspective-association";
import { PerspectiveList, type PerspectiveViewRow } from "./perspective-list";
import {
  applyPerspectiveMigration,
  createPerspectiveMigrationReport,
  MIGRATION_REASON_LABEL,
  type PerspectiveMigrationChange,
  type PerspectiveMigrationReport,
} from "./perspective-migration";
import { useAuthRequest } from "@/hooks/auth-request";

import styles from "./perspective-configuration.module.less";

const PARK_AREA_ID = "1111111";
const UNRESOLVED_AREA_ID = "__perspective_unresolved__";
const DEFAULT_PAGE_SIZE = 10;

/**
 * Cascader 开启 changeOnSelect 时，默认会按整条路径匹配：
 * 父级名称含关键字时，所有子孙都会出现在搜索结果中。
 * 隐藏楼栋按数字搜索时尤其明显，这里改为只匹配当前节点名称/别名。
 */
const areaCascaderShowSearch = {
  limit: 100,
  filter: (inputValue: string, path: BusinessAreaNode[]): boolean => {
    const keyword = inputValue.trim().toLocaleLowerCase();
    if (!keyword) {
      return true;
    }
    const current = path[path.length - 1];
    if (!current) {
      return false;
    }
    const name = String(current.name ?? "").toLocaleLowerCase();
    const alias = String(current.aliasName ?? "").toLocaleLowerCase();
    return name.includes(keyword) || alias.includes(keyword);
  },
};

const buildAreaSelectionMap = (nodes: BusinessAreaNode[]): Map<string, PerspectiveAreaSelection> => {
  const result = new Map<string, PerspectiveAreaSelection>([
    [
      PARK_AREA_ID,
      {
        id: PARK_AREA_ID,
        name: "园区",
        ue5Path: "园区",
        threePath: "园区",
        scope: "park",
      },
    ],
  ]);

  const visit = (items: BusinessAreaNode[], parentNames: string[]): void => {
    for (const item of items) {
      const pathNames = [...parentNames, item.name];
      result.set(item.id, {
        id: item.id,
        name: item.name,
        ue5Path: pathNames.join("-"),
        threePath: pathNames.join("/"),
        scope: "area",
      });
      visit(item.children ?? [], pathNames);
    }
  };

  visit(nodes, []);
  result.set(UNRESOLVED_AREA_ID, {
    id: UNRESOLVED_AREA_ID,
    name: "待绑定历史配置",
    ue5Path: "待绑定历史配置",
    threePath: "待绑定历史配置",
    scope: "unresolved",
  });
  return result;
};

const buildAreaAliasPathMap = (nodes: BusinessAreaNode[]): Map<string, string[]> => {
  const result = new Map<string, string[]>();

  const visit = (items: BusinessAreaNode[], parentPath: string[]): void => {
    for (const item of items) {
      const alias = item.aliasName || item.name;
      const path = [...parentPath, alias];
      result.set(alias, path);
      visit(item.children ?? [], path);
    }
  };

  visit(nodes, []);
  return result;
};

const areaMatches = (
  area: string,
  rowAreaId: string | undefined,
  rowId: string | undefined,
  selection: PerspectiveAreaSelection,
): boolean => {
  if (rowAreaId === selection.id || rowId === selection.id) {
    return true;
  }
  const rowPath = normalizeAreaPath(area);
  const ue5Path = normalizeAreaPath(selection.ue5Path);
  const threePath = normalizeAreaPath(selection.threePath);
  return rowPath === ue5Path || rowPath === threePath;
};

/**
 * 视角配置：按业务区域选择、筛选和维护园区/区域视角。
 */
export const PerspectiveConfiguration = defineComponent({
  name: "PerspectiveConfiguration",
  setup() {
    const modelApi = inject(MODEL_CONFIGURATION_KEY) as ModelConfigurationApi | undefined;
    const areaLoading = ref(false);
    const titleMountReady = ref(false);
    const areaOptions = ref<BusinessAreaNode[]>([]);
    const selectedAreaKeys = ref<string[]>([PARK_AREA_ID]);
    const modal = reactive({
      open: false,
      scope: "park" as Exclude<PerspectiveScope, "unresolved">,
      mode: "create" as "create" | "edit",
      sourceIndex: -1,
      submitting: false,
    });
    const rebindModal = reactive({
      open: false,
      sourceIndex: -1,
      oldArea: "",
      targetPath: [] as string[],
      submitting: false,
    });
    const migrationModal = reactive({
      open: false,
      submitting: false,
      report: null as PerspectiveMigrationReport | null,
    });
    const importModal = reactive({
      open: false,
      text: "",
      error: "",
      submitting: false,
      summary: "" as string,
    });
    const importFileInputRef = ref<HTMLInputElement | null>(null);
    const search = reactive({
      keywordInput: "",
      keyword: "",
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    const formState = reactive({
      area: "园区",
      areaId: PARK_AREA_ID,
      label: "",
      camera: "",
      id: "",
      buildTagLocation: "",
      hideActors: [] as string[][],
    });

    const entry = computed(() => modelApi?.modelConfig.value.entry ?? "views");
    const unsupported = computed(() => isGisEntry(entry.value) || isScadaEntry(entry.value));
    const areaSelectionMap = computed(() => buildAreaSelectionMap(areaOptions.value));
    const ue5AreaSelections = computed(() => [...areaSelectionMap.value.values()].filter((area) => area.scope === "area"));
    const ue5Associations = computed(() =>
      (modelApi?.modelConfig.value.ue5.perspective ?? []).map((item, sourceIndex) => ({
        item,
        sourceIndex,
        association: classifyUe5Perspective(item, ue5AreaSelections.value),
      })),
    );
    const unresolvedAssociations = computed(() =>
      ue5Associations.value.filter(({ association }) => association.source === "unresolved" || association.source === "ambiguous"),
    );
    const areaTreeData = computed<BusinessAreaNode[]>(() => [
      {
        id: PARK_AREA_ID,
        name: "园区",
        aliasName: "园区",
        level: 0,
        children: [
          ...areaOptions.value,
          ...(isUe5Entry(entry.value) && unresolvedAssociations.value.length > 0
            ? [
                {
                  id: UNRESOLVED_AREA_ID,
                  name: `待绑定历史配置（${unresolvedAssociations.value.length}）`,
                  aliasName: "待绑定历史配置",
                  level: 1,
                  children: [],
                },
              ]
            : []),
        ],
      },
    ]);
    const areaAliasPathMap = computed(() => buildAreaAliasPathMap(areaOptions.value));
    const selectedArea = computed(() => areaSelectionMap.value.get(selectedAreaKeys.value[0] ?? ""));

    const configuredAreaIds = computed(() => {
      const ids = new Set<string>();
      if (!modelApi) {
        return ids;
      }
      const config = modelApi.modelConfig.value;
      if (isUe5Entry(entry.value)) {
        for (const { association } of ue5Associations.value) {
          if ("area" in association) {
            ids.add(association.area.id);
          }
        }
        return ids;
      }
      if (isThreeEntry(entry.value)) {
        for (const item of config.three.perspective) {
          for (const selection of ue5AreaSelections.value) {
            if (areaMatches(item.area, item.areaId, item.id, selection)) {
              ids.add(selection.id);
              break;
            }
          }
        }
      }
      return ids;
    });

    const areaMarkerMap = computed<Map<string, AreaPerspectiveMarker>>(() =>
      buildAreaPerspectiveMarkers(areaOptions.value, configuredAreaIds.value, PARK_AREA_ID),
    );

    const areaRows = computed<PerspectiveViewRow[]>(() => {
      if (!modelApi || !selectedArea.value) {
        return [];
      }
      const config = modelApi.modelConfig.value;
      const selection = selectedArea.value;

      if (selection.scope === "unresolved") {
        return unresolvedAssociations.value.map(({ item, sourceIndex, association }) => ({
          key: `unresolved-${sourceIndex}-${item.id || item.area}`,
          scope: "unresolved",
          sourceIndex,
          id: item.id || "",
          areaId: item.areaId || "",
          area: item.area || "--",
          label: item.label || "默认",
          camera: item.camera || "",
          buildTagLocation: item.buildTagLocation,
          hideActors: item.hideActors,
          associationSource: association.source,
        }));
      }

      if (selection.scope === "park") {
        if (isUe5Entry(entry.value)) {
          return config.ue5.modelPerspective.map((item, sourceIndex) => ({
            key: `park-${sourceIndex}-${item.id || item.label}`,
            scope: "park",
            sourceIndex,
            id: item.id || "",
            areaId: PARK_AREA_ID,
            area: item.area || "园区",
            label: item.label || "--",
            camera: item.value || "",
          }));
        }
        if (isThreeEntry(entry.value)) {
          return config.three.modelPerspective.map((item, sourceIndex) => ({
            key: `park-${sourceIndex}-${item.id || item.label}`,
            scope: "park",
            sourceIndex,
            id: item.id || "",
            areaId: item.areaId || PARK_AREA_ID,
            area: item.area || "园区",
            label: item.label || "--",
            camera: item.value || "",
          }));
        }
        return [];
      }

      if (isUe5Entry(entry.value)) {
        return ue5Associations.value.flatMap(({ item, sourceIndex, association }) =>
          "area" in association && association.area.id === selection.id
            ? [
                {
                  key: `area-${sourceIndex}-${item.id || item.area}`,
                  scope: "area" as const,
                  sourceIndex,
                  id: item.id || "",
                  areaId: association.area.id,
                  area: association.area.ue5Path,
                  label: item.label || "默认",
                  camera: item.camera || "",
                  buildTagLocation: item.buildTagLocation,
                  hideActors: item.hideActors,
                  associationSource: association.source,
                },
              ]
            : [],
        );
      }
      if (isThreeEntry(entry.value)) {
        return config.three.perspective.flatMap((item, sourceIndex) =>
          areaMatches(item.area, item.areaId, item.id, selection)
            ? [
                {
                  key: `area-${sourceIndex}-${item.id || item.area}`,
                  scope: "area" as const,
                  sourceIndex,
                  id: item.id || "",
                  areaId: item.areaId || selection.id,
                  area: item.area || selection.threePath,
                  label: item.label || "默认",
                  camera: item.camera || item.value || "",
                  buildTagLocation: item.buildTagLocation,
                  hideActors: item.hideActors,
                },
              ]
            : [],
        );
      }
      return [];
    });

    const filteredRows = computed(() => {
      const keyword = search.keyword.trim().toLowerCase();
      if (!keyword) {
        return areaRows.value;
      }
      return areaRows.value.filter((row) => row.label.toLowerCase().includes(keyword));
    });
    const pagedRows = computed(() => {
      const start = (search.pageNumber - 1) * search.pageSize;
      return filteredRows.value.slice(start, start + search.pageSize);
    });

    const loadAreas = async (): Promise<void> => {
      areaLoading.value = true;
      try {
        areaOptions.value = await useAuthRequest(() => listBusinessAreas());
      } catch {
        areaOptions.value = [];
        message.error("加载业务区域失败");
      } finally {
        areaLoading.value = false;
      }
    };

    const resetSearch = (): void => {
      search.keywordInput = "";
      search.keyword = "";
      search.pageNumber = 1;
    };

    const handleAreaSelect = (keys: string[]): void => {
      selectedAreaKeys.value = keys;
      resetSearch();
    };

    const handleQuery = (): void => {
      search.keyword = search.keywordInput.trim();
      search.pageNumber = 1;
    };

    const resetForm = (selection: PerspectiveAreaSelection): void => {
      formState.area = isThreeEntry(entry.value) ? selection.threePath : selection.ue5Path;
      formState.areaId = selection.id;
      formState.label = "";
      formState.camera = "";
      formState.id = createConfigId();
      formState.buildTagLocation = "";
      formState.hideActors = [];
    };

    const openCreate = (): void => {
      const selection = selectedArea.value;
      if (!selection || selection.scope === "unresolved") {
        message.warning("请先选择区域");
        return;
      }
      resetForm(selection);
      modal.scope = selection.scope;
      modal.mode = "create";
      modal.sourceIndex = -1;
      modal.open = true;
    };

    const openEdit = (row: PerspectiveViewRow): void => {
      if (row.scope === "unresolved") {
        return;
      }
      modal.scope = row.scope;
      modal.mode = "edit";
      modal.sourceIndex = row.sourceIndex;
      formState.area = row.area;
      formState.areaId = row.areaId;
      formState.label = row.label === "--" ? "" : row.label;
      formState.camera = row.camera;
      formState.id = row.id || createConfigId();
      formState.buildTagLocation = row.buildTagLocation || "";
      formState.hideActors = (row.hideActors ?? []).map((alias) => areaAliasPathMap.value.get(alias) ?? [alias]);
      modal.open = true;
    };

    const openRebind = (row: PerspectiveViewRow): void => {
      rebindModal.sourceIndex = row.sourceIndex;
      rebindModal.oldArea = row.area;
      rebindModal.targetPath = [];
      rebindModal.open = true;
    };

    const persist = async (): Promise<boolean> => {
      if (!modelApi) {
        return false;
      }
      modelApi.markDirty();
      return modelApi.save();
    };

    const handleSubmit = async (): Promise<void> => {
      if (!modelApi) {
        return;
      }
      const label = formState.label.trim();
      const camera = formState.camera.trim();
      if (!camera) {
        message.warning("请输入视角参数");
        return;
      }

      modal.submitting = true;
      try {
        if (modal.scope === "park") {
          if (isUe5Entry(entry.value)) {
            const list = [...modelApi.modelConfig.value.ue5.modelPerspective];
            const row: ModelConfig["ue5"]["modelPerspective"][number] = {
              label,
              value: camera,
              area: "园区",
              id: formState.id || createConfigId(),
            };
            if (modal.mode === "edit" && modal.sourceIndex >= 0) {
              list[modal.sourceIndex] = row;
            } else {
              list.push(row);
            }
            modelApi.modelConfig.value.ue5.modelPerspective = list;
          } else if (isThreeEntry(entry.value)) {
            const list = [...modelApi.modelConfig.value.three.modelPerspective];
            const row: ModelConfig["three"]["modelPerspective"][number] = {
              label,
              value: camera,
              area: "园区",
              areaId: PARK_AREA_ID,
              id: formState.id || createConfigId(),
            };
            if (modal.mode === "edit" && modal.sourceIndex >= 0) {
              list[modal.sourceIndex] = row;
            } else {
              list.push(row);
            }
            modelApi.modelConfig.value.three.modelPerspective = list;
          }
        } else {
          const hideActors = [
            ...new Set(
              formState.hideActors
                .flat()
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          ];
          if (isUe5Entry(entry.value)) {
            const list = [...modelApi.modelConfig.value.ue5.perspective];
            const row: ModelConfig["ue5"]["perspective"][number] = {
              id: modal.mode === "create" ? formState.areaId : formState.id || formState.areaId,
              areaId: formState.areaId,
              area: formState.area,
              camera,
              label,
              buildTagLocation: formState.buildTagLocation.trim() || undefined,
              hideActors: hideActors.length > 0 ? hideActors : undefined,
            };
            if (modal.mode === "edit" && modal.sourceIndex >= 0) {
              list[modal.sourceIndex] = row;
            } else {
              list.push(row);
            }
            modelApi.modelConfig.value.ue5.perspective = list;
            modelApi.modelConfig.value.ue5.correct = true;
          } else if (isThreeEntry(entry.value)) {
            const list = [...modelApi.modelConfig.value.three.perspective];
            const row: ModelConfig["three"]["perspective"][number] = {
              id: formState.id || createConfigId(),
              areaId: formState.areaId,
              area: formState.area,
              camera,
              value: camera,
              label,
              buildTagLocation: formState.buildTagLocation.trim() || undefined,
              hideActors: hideActors.length > 0 ? hideActors : undefined,
            };
            if (modal.mode === "edit" && modal.sourceIndex >= 0) {
              list[modal.sourceIndex] = row;
            } else {
              list.push(row);
            }
            modelApi.modelConfig.value.three.perspective = list;
          }
        }

        const ok = await persist();
        if (ok) {
          modal.open = false;
        }
      } finally {
        modal.submitting = false;
      }
    };

    const handleRebind = async (): Promise<void> => {
      if (!modelApi || rebindModal.sourceIndex < 0) {
        return;
      }
      const targetId = rebindModal.targetPath.at(-1);
      const target = targetId ? areaSelectionMap.value.get(targetId) : undefined;
      if (!target || target.scope !== "area") {
        message.warning("请选择需要绑定的当前区域");
        return;
      }

      rebindModal.submitting = true;
      try {
        const list = [...modelApi.modelConfig.value.ue5.perspective];
        const original = list[rebindModal.sourceIndex];
        if (!original) {
          message.error("历史配置不存在，请刷新后重试");
          return;
        }
        list[rebindModal.sourceIndex] = { ...original, areaId: target.id, area: target.ue5Path };
        modelApi.modelConfig.value.ue5.perspective = list;
        modelApi.modelConfig.value.ue5.correct = true;
        const ok = await persist();
        if (ok) {
          rebindModal.open = false;
          message.success("历史配置已重新绑定");
        }
      } finally {
        rebindModal.submitting = false;
      }
    };

    const openMigration = (): void => {
      if (!modelApi) {
        return;
      }
      migrationModal.report = createPerspectiveMigrationReport(modelApi.modelConfig.value.ue5.perspective, ue5AreaSelections.value);
      migrationModal.open = true;
    };

    const downloadOriginalConfiguration = (): void => {
      if (!modelApi) {
        return;
      }
      const blob = new Blob([JSON.stringify(modelApi.modelConfig.value, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `model-configuration-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    };

    const refreshImportSummary = (text: string): void => {
      const result = validateImportedModelConfiguration(text);
      if (!result.ok) {
        importModal.error = result.error;
        importModal.summary = "";
        return;
      }
      importModal.error = "";
      const perspectiveCount = Array.isArray(result.config.ue5?.perspective) ? result.config.ue5.perspective.length : 0;
      const threeCount = Array.isArray(result.config.three?.perspective) ? result.config.three.perspective.length : 0;
      importModal.summary = `校验通过：渲染类型 ${result.config.entry || "--"}，UE5 区域视角 ${perspectiveCount} 条，WebGL 区域视角 ${threeCount} 条`;
    };

    const openImportConfiguration = (): void => {
      importModal.open = true;
      importModal.text = "";
      importModal.error = "";
      importModal.summary = "";
      importModal.submitting = false;
    };

    const handleImportFileChange = async (event: Event): Promise<void> => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = "";
      if (!file) {
        return;
      }
      if (!/\.json$/iu.test(file.name)) {
        message.error("请选择 .json 配置文件");
        return;
      }
      try {
        const text = await file.text();
        importModal.text = text;
        refreshImportSummary(text);
      } catch {
        message.error("读取文件失败");
      }
    };

    const handleImportTextChange = (value: string): void => {
      importModal.text = value ?? "";
      if (!importModal.text.trim()) {
        importModal.error = "";
        importModal.summary = "";
        return;
      }
      refreshImportSummary(importModal.text);
    };

    const handleConfirmImport = async (): Promise<void> => {
      if (!modelApi) {
        return;
      }
      const result = validateImportedModelConfiguration(importModal.text);
      if (!result.ok) {
        importModal.error = result.error;
        importModal.summary = "";
        message.error(result.error);
        return;
      }
      importModal.submitting = true;
      try {
        modelApi.modelConfig.value = result.config;
        modelApi.markDirty();
        const ok = await persist();
        if (ok) {
          importModal.open = false;
          migrationModal.report = createPerspectiveMigrationReport(modelApi.modelConfig.value.ue5.perspective, ue5AreaSelections.value);
          message.success("配置已导入并保存");
        }
      } finally {
        importModal.submitting = false;
      }
    };

    const handleMigration = async (): Promise<void> => {
      if (!modelApi || !migrationModal.report || migrationModal.report.upgradeable === 0) {
        message.info("没有需要自动升级的历史配置");
        return;
      }
      migrationModal.submitting = true;
      try {
        const result = applyPerspectiveMigration(modelApi.modelConfig.value.ue5.perspective, ue5AreaSelections.value);
        modelApi.modelConfig.value.ue5.perspective = result.perspectives;
        modelApi.modelConfig.value.ue5.correct = true;
        const ok = await persist();
        if (ok) {
          migrationModal.open = false;
          message.success(`已升级 ${result.changed} 条历史配置`);
        }
      } finally {
        migrationModal.submitting = false;
      }
    };

    const handleDelete = async (row: PerspectiveViewRow): Promise<void> => {
      if (!modelApi || row.sourceIndex < 0) {
        return;
      }
      if (row.scope === "park") {
        if (isUe5Entry(entry.value)) {
          const list = [...modelApi.modelConfig.value.ue5.modelPerspective];
          list.splice(row.sourceIndex, 1);
          modelApi.modelConfig.value.ue5.modelPerspective = list;
        } else if (isThreeEntry(entry.value)) {
          const list = [...modelApi.modelConfig.value.three.modelPerspective];
          list.splice(row.sourceIndex, 1);
          modelApi.modelConfig.value.three.modelPerspective = list;
        }
      } else if (isUe5Entry(entry.value)) {
        const list = [...modelApi.modelConfig.value.ue5.perspective];
        list.splice(row.sourceIndex, 1);
        modelApi.modelConfig.value.ue5.perspective = list;
        modelApi.modelConfig.value.ue5.correct = true;
      } else if (isThreeEntry(entry.value)) {
        const list = [...modelApi.modelConfig.value.three.perspective];
        list.splice(row.sourceIndex, 1);
        modelApi.modelConfig.value.three.perspective = list;
      }
      await persist();
    };

    watch(entry, () => {
      selectedAreaKeys.value = [PARK_AREA_ID];
      resetSearch();
    });

    watch([() => filteredRows.value.length, () => search.pageSize], ([total]) => {
      const maxPage = Math.max(1, Math.ceil(total / search.pageSize));
      if (search.pageNumber > maxPage) {
        search.pageNumber = maxPage;
      }
    });

    onMounted(() => {
      titleMountReady.value = Boolean(
        document.querySelector(`#${CONFIG_SHELL_TITLE_META_ID}`) && document.querySelector(`#${CONFIG_SHELL_TITLE_EXTRA_ID}`),
      );
      void loadAreas();
    });

    return () => {
      if (!modelApi) {
        return <div class={styles.root}>模型配置上下文缺失</div>;
      }

      return (
        <div class={styles.root}>
          {titleMountReady.value ? (
            <>
              <Teleport to={`#${CONFIG_SHELL_TITLE_META_ID}`}>
                <div class={styles.entryBadge} title={`当前渲染类型：${modelApi.entryLabel.value}`}>
                  <span class={styles.entryDivider} aria-hidden="true" />
                  <span class={styles.entryLabel}>当前渲染类型</span>
                  <span class={styles.entryValue}>{modelApi.entryLabel.value}</span>
                </div>
              </Teleport>
              <Teleport to={`#${CONFIG_SHELL_TITLE_EXTRA_ID}`}>
                {!unsupported.value && (
                  <div class={styles.titleActions}>
                    {isUe5Entry(entry.value) && <Button onClick={openMigration}>检查历史配置</Button>}
                    <Button type="primary" disabled={!selectedArea.value || selectedArea.value.scope === "unresolved"} onClick={openCreate}>
                      新增视角
                    </Button>
                  </div>
                )}
              </Teleport>
            </>
          ) : undefined}

          {unsupported.value ? (
            <Empty
              class={styles.unsupported}
              description={isGisEntry(entry.value) ? "WebGIS 视角配置暂未开放" : "二维组态无需配置视角，请切换到「其他设置」"}
            />
          ) : (
            <Spin spinning={modelApi.loading.value || modelApi.saving.value || areaLoading.value}>
              <div class={styles.workspace}>
                <PerspectiveAreaTree
                  treeData={areaTreeData.value}
                  selectedKeys={selectedAreaKeys.value}
                  markerMap={areaMarkerMap.value}
                  onSelect={handleAreaSelect}
                />
                <PerspectiveList
                  rows={pagedRows.value}
                  keywordInput={search.keywordInput}
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={filteredRows.value.length}
                  onKeywordChange={(value: string) => {
                    search.keywordInput = value;
                  }}
                  onQuery={handleQuery}
                  onReset={resetSearch}
                  onEdit={openEdit}
                  onRebind={openRebind}
                  onRemove={(row: PerspectiveViewRow) => void handleDelete(row)}
                  onPageChange={(pageNumber: number, pageSize: number) => {
                    search.pageNumber = pageNumber;
                    search.pageSize = pageSize;
                  }}
                />
              </div>
            </Spin>
          )}

          <Modal
            visible={modal.open}
            title={`${modal.mode === "create" ? "新增" : "编辑"}视角`}
            confirmLoading={modal.submitting}
            destroyOnClose
            okText="保存"
            width={760}
            onOk={() => void handleSubmit()}
            onCancel={() => {
              modal.open = false;
            }}
          >
            <Form layout="horizontal" labelCol={{ style: { width: "96px" } }} class={styles.form}>
              <FormItem label="区域">
                <span class={styles.areaText}>{formState.area}</span>
              </FormItem>
              <FormItem label="视角名称">
                <Input
                  value={formState.label}
                  maxlength={50}
                  showCount
                  placeholder="请输入视角名称"
                  onUpdate:value={(value: string) => {
                    formState.label = value ?? "";
                  }}
                />
              </FormItem>
              <FormItem label="视角参数" required>
                <Textarea
                  value={formState.camera}
                  rows={4}
                  placeholder="请粘贴或输入相机视角参数"
                  onUpdate:value={(value: string) => {
                    formState.camera = value ?? "";
                  }}
                />
              </FormItem>
              {modal.scope === "area" && isUe5Entry(entry.value) && (
                <>
                  <FormItem label="中心点位置">
                    <Textarea
                      value={formState.buildTagLocation}
                      rows={4}
                      placeholder="请粘贴或输入楼栋中心点参数"
                      onUpdate:value={(value: string) => {
                        formState.buildTagLocation = value ?? "";
                      }}
                    />
                  </FormItem>
                  <FormItem label="隐藏楼栋">
                    <Cascader
                      value={formState.hideActors}
                      options={areaOptions.value}
                      multiple
                      changeOnSelect
                      allowClear
                      showSearch={areaCascaderShowSearch}
                      placeholder="请选择楼栋"
                      style={{ width: "100%" }}
                      fieldNames={{ label: "name", value: "aliasName", children: "children" }}
                      onUpdate:value={(value: string[][]) => {
                        formState.hideActors = value ?? [];
                      }}
                    />
                  </FormItem>
                </>
              )}
            </Form>
          </Modal>

          <Modal
            visible={rebindModal.open}
            title="重新绑定历史配置"
            confirmLoading={rebindModal.submitting}
            destroyOnClose
            okText="确认绑定"
            width={620}
            onOk={() => void handleRebind()}
            onCancel={() => {
              rebindModal.open = false;
            }}
          >
            <Form layout="horizontal" labelCol={{ style: { width: "110px" } }} class={styles.form}>
              <FormItem label="历史区域">
                <span class={styles.areaText}>{rebindModal.oldArea || "--"}</span>
              </FormItem>
              <FormItem label="绑定到" required>
                <Cascader
                  value={rebindModal.targetPath}
                  options={areaOptions.value}
                  changeOnSelect
                  allowClear
                  showSearch={areaCascaderShowSearch}
                  placeholder="请选择当前区域"
                  style={{ width: "100%" }}
                  fieldNames={{ label: "name", value: "id", children: "children" }}
                  onUpdate:value={(value: string[]) => {
                    rebindModal.targetPath = value ?? [];
                  }}
                />
              </FormItem>
            </Form>
            <div class={styles.rebindTip}>确认后只更新区域 ID 和最新区域名称，视角参数及其他业务配置保持不变。</div>
          </Modal>

          <Modal
            visible={migrationModal.open}
            title="历史视角配置检查"
            confirmLoading={migrationModal.submitting}
            destroyOnClose
            okText={`确认升级（${migrationModal.report?.upgradeable ?? 0}条）`}
            width={760}
            onOk={() => void handleMigration()}
            onCancel={() => {
              migrationModal.open = false;
            }}
          >
            {migrationModal.report && (
              <div class={styles.migrationContent}>
                <div class={styles.migrationSummary}>
                  {[
                    { key: "total", label: "总计", value: migrationModal.report.total, tone: "default" as const },
                    { key: "current", label: "已是最新", value: migrationModal.report.current, tone: "success" as const },
                    { key: "upgradeable", label: "可自动升级", value: migrationModal.report.upgradeable, tone: "primary" as const },
                    { key: "unresolved", label: "待绑定", value: migrationModal.report.unresolved, tone: "warning" as const },
                    { key: "ambiguous", label: "存在歧义", value: migrationModal.report.ambiguous, tone: "warning" as const },
                  ].map((item) => (
                    <div
                      key={item.key}
                      class={[
                        styles.migrationStat,
                        item.tone === "success" ? styles.migrationStatSuccess : undefined,
                        item.tone === "primary" ? styles.migrationStatPrimary : undefined,
                        item.tone === "warning" ? styles.migrationStatWarning : undefined,
                      ]}
                    >
                      <span class={styles.migrationStatValue}>{item.value}</span>
                      <span class={styles.migrationStatLabel}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div class={styles.migrationTip}>
                  自动升级只处理能够通过区域 ID 或唯一完整名称确定归属的记录；待绑定和歧义记录不会被修改。名称相同的记录通常表示仅补齐区域
                  ID，区域显示名未变化。
                </div>
                {migrationModal.report.changes.length > 0 && (
                  <div class={styles.migrationPreview}>
                    <div class={styles.migrationPreviewHead}>
                      <span>原区域</span>
                      <span>变更说明</span>
                      <span>目标区域</span>
                    </div>
                    {migrationModal.report.changes.map((change: PerspectiveMigrationChange) => (
                      <div
                        key={change.sourceIndex}
                        class={[styles.migrationRow, change.nameUnchanged ? styles.migrationRowSame : undefined]}
                      >
                        <span title={change.fromArea || "--"}>{change.fromArea || "--"}</span>
                        <span class={styles.migrationReason} title={MIGRATION_REASON_LABEL[change.reason]}>
                          {MIGRATION_REASON_LABEL[change.reason]}
                        </span>
                        <span title={change.toArea}>
                          {change.nameUnchanged ? (
                            <>
                              {change.toArea}
                              <em class={styles.migrationSameHint}>名称未变</em>
                            </>
                          ) : (
                            change.toArea
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div class={styles.migrationActions}>
                  <Button onClick={downloadOriginalConfiguration}>导出原配置</Button>
                  <Button type="primary" ghost onClick={openImportConfiguration}>
                    导入配置
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          <Modal
            visible={importModal.open}
            title="导入模型配置"
            confirmLoading={importModal.submitting}
            destroyOnClose
            okText="确认导入并保存"
            okButtonProps={{ disabled: !importModal.text.trim() || Boolean(importModal.error) }}
            width={820}
            onOk={() => void handleConfirmImport()}
            onCancel={() => {
              importModal.open = false;
            }}
          >
            <div class={styles.importContent}>
              <div class={styles.migrationTip}>
                支持导入此前导出的模型配置 JSON。可先选择文件，再在下方预览或修改后导入；导入会覆盖当前模型配置并立即保存。
              </div>
              <div class={styles.importToolbar}>
                <Button
                  onClick={() => {
                    importFileInputRef.value?.click();
                  }}
                >
                  选择 JSON 文件
                </Button>
                <span class={styles.importToolbarHint}>也可直接粘贴或编辑下方 JSON</span>
              </div>
              <Textarea
                value={importModal.text}
                rows={16}
                maxlength={2_000_000}
                showCount={false}
                placeholder='请粘贴或导入配置 JSON，例如 { "entry": "views", "ue5": { ... } }'
                class={styles.importEditor}
                onUpdate:value={handleImportTextChange}
              />
              {importModal.error ? <div class={styles.importError}>{importModal.error}</div> : null}
              {!importModal.error && importModal.summary ? <div class={styles.importSummary}>{importModal.summary}</div> : null}
            </div>
          </Modal>

          <input
            ref={importFileInputRef}
            type="file"
            accept="application/json,.json"
            class={styles.hiddenFileInput}
            onChange={(event) => void handleImportFileChange(event)}
          />
        </div>
      );
    };
  },
});

export default PerspectiveConfiguration;

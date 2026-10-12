import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import type {
  EndpointTypeItem,
  ModelItem,
  ModelUpsertPayload,
  ProviderItem,
  ProviderSettingsPayload,
  ProviderTypeItem,
  RemoteModelCandidate,
} from "@ghcloud/cube-ai-application-service";
import { CubeLayout, FileUpload } from "@ghcloud/cube-app-design";
import { AntModal, Button, Form, FormItem, Input, Select, Space, Spin, Switch, message } from "@ghcloud/cube-ui";

import { cubeAiApplicationService } from "@/api/service";
import { useModelManagementStore } from "@/store/model-management.store";

import styles from "./model-management.module.less";

const buildModelPayload = (form: {
  modelCode: string;
  displayName: string;
  groupName: string;
  sortOrder: string;
  remark: string;
  endpointType: string;
  iconUrl: string;
  modelTypes: string[];
  isFree: boolean;
}): ModelUpsertPayload => {
  const payload: ModelUpsertPayload = {
    modelCode: form.modelCode.trim(),
    displayName: form.displayName.trim(),
    modelTypes: form.modelTypes,
    isFree: form.isFree,
  };
  if (form.groupName.trim()) {
    payload.groupName = form.groupName.trim();
  }
  if (form.sortOrder.trim()) {
    payload.sortOrder = Number(form.sortOrder);
  }
  if (form.remark.trim()) {
    payload.remark = form.remark.trim();
  }
  if (form.endpointType.trim()) {
    payload.endpointType = form.endpointType.trim();
  }
  if (form.iconUrl.trim()) {
    payload.iconUrl = form.iconUrl.trim();
  }
  return payload;
};

const MODEL_TYPE_OPTIONS = [
  { value: "image_generation", label: "文生图" },
  { value: "vision", label: "视觉" },
  { value: "web_search", label: "联网" },
  { value: "reasoning", label: "推理" },
  { value: "tool", label: "工具" },
  { value: "rerank", label: "重排" },
  { value: "embedding", label: "嵌入" },
];

const REMOTE_FILTER_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "image_generation", label: "文生图" },
  { value: "reasoning", label: "推理" },
  { value: "vision", label: "视觉" },
  { value: "web_search", label: "联网" },
  { value: "free", label: "免费" },
  { value: "embedding", label: "嵌入" },
  { value: "rerank", label: "重排" },
  { value: "tool", label: "工具" },
];

const resolveProviderName = (provider: Pick<ProviderItem, "name" | "providerCode">): string =>
  provider.name?.trim() || provider.providerCode?.trim() || "未命名";

const getProviderInitial = (name?: string | null): string => {
  const value = (name ?? "").trim();
  if (!value) {
    return "P";
  }
  return value.slice(0, 1).toUpperCase();
};

const API_KEY_MASK = "****";

const isMaskedApiKeyValue = (value: string): boolean => value.includes(API_KEY_MASK);

const getApiKeyPlaceholder = (value: string): string => (isMaskedApiKeyValue(value) ? "已配置API密钥" : "输入API密钥");

const browserAutofillOffProps = {
  autocomplete: "off",
  autoComplete: "off",
  autocorrect: "off",
  autocapitalize: "off",
  spellcheck: false,
};

const secretAutofillOffProps = {
  ...browserAutofillOffProps,
  autocomplete: "new-password",
  autoComplete: "new-password",
  name: "ai-application-api-key",
};

/** 远程模型列表弹窗默认 z-index 为 1000；嵌套打开「添加模型」时需显式抬高，避免被遮挡 */
const MODEL_MODAL_Z_INDEX_WHEN_REMOTE_OPEN = 1050;

export const ModelManagement = defineComponent({
  name: "ModelManagement",
  setup() {
    const store = useModelManagementStore();
    const loading = ref(false);
    const actionLoading = ref(false);
    const providerKeyword = ref("");
    const providerTypes = ref<ProviderTypeItem[]>([]);
    const endpointTypes = ref<EndpointTypeItem[]>([]);
    const providers = ref<ProviderItem[]>([]);
    const modelGroups = ref<{ groupName: string; items: ModelItem[] }[]>([]);
    const allModels = computed(() => modelGroups.value.flatMap((group) => group.items ?? []));
    const selectedProvider = computed(() => providers.value.find((item) => item.id === store.selectedProviderId));
    const filteredProviders = computed(() =>
      providers.value.filter((item) => {
        const keyword = providerKeyword.value.trim().toLowerCase();
        if (!keyword) {
          return true;
        }
        const displayName = resolveProviderName(item).toLowerCase();
        const providerCode = (item.providerCode ?? "").toLowerCase();
        return displayName.includes(keyword) || providerCode.includes(keyword);
      }),
    );

    const providerForm = reactive({
      id: "",
      providerCode: "",
      name: "",
      typeCode: "",
      apiKey: "",
      apiBaseUrl: "",
      enabled: true,
    });
    const modelForm = reactive({
      id: "",
      modelCode: "",
      displayName: "",
      groupName: "",
      sortOrder: "",
      remark: "",
      endpointType: "",
      iconUrl: "",
      modelTypes: [] as string[],
      isFree: false,
    });
    const providerCreateForm = reactive({
      name: "",
      typeCode: "",
      iconFiles: [] as { id?: string; path?: string }[],
    });
    const providerModalVisible = ref(false);
    const providerModalMode = ref<"create" | "edit">("create");
    const providerContextMenuVisible = ref(false);
    const providerContextMenuPosition = reactive({ x: 0, y: 0 });
    const contextMenuProviderId = ref("");
    const modelModalVisible = ref(false);
    const modelDetectModalVisible = ref(false);
    const remoteModelModalVisible = ref(false);
    const modelModalTitle = ref("添加模型");
    const modelKeyword = ref("");
    const detectModelId = ref("");
    const remoteModelKeyword = ref("");
    const remoteModelFilter = ref("all");
    const remoteModels = ref<RemoteModelCandidate[]>([]);
    const remoteImportFromModelCode = ref("");
    const savedProviderApiKeyValue = ref("");
    const apiKeyInputType = computed<"text" | "password">(() =>
      providerForm.apiKey === savedProviderApiKeyValue.value && isMaskedApiKeyValue(providerForm.apiKey) ? "text" : "password",
    );
    const filteredModelGroups = computed(() => {
      const keyword = modelKeyword.value.trim().toLowerCase();
      if (!keyword) {
        return modelGroups.value;
      }
      return modelGroups.value
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => item.modelCode.toLowerCase().includes(keyword) || item.displayName.toLowerCase().includes(keyword),
          ),
        }))
        .filter((group) => group.items.length > 0);
    });

    /** 按分组名收起右侧模型列表（仅主面板 groupCard，弹窗内分组不受影响） */
    const collapsedModelGroups = ref<Set<string>>(new Set());

    const toggleModelGroupCollapse = (groupName: string): void => {
      const next = new Set(collapsedModelGroups.value);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      collapsedModelGroups.value = next;
    };

    const isModelGroupCollapsed = (groupName: string): boolean => collapsedModelGroups.value.has(groupName);
    const filteredRemoteModels = computed(() => {
      const keyword = remoteModelKeyword.value.trim().toLowerCase();
      const filterCode = remoteModelFilter.value;
      return remoteModels.value.filter((item) => {
        const matchesKeyword =
          !keyword || item.modelCode.toLowerCase().includes(keyword) || item.displayName.toLowerCase().includes(keyword);
        if (!matchesKeyword) {
          return false;
        }
        if (filterCode === "all") {
          return true;
        }
        if (filterCode === "free") {
          return item.isFree;
        }
        return item.modelTypes.includes(filterCode);
      });
    });
    const remoteGroupedModels = computed(() => {
      const groups = new Map<string, RemoteModelCandidate[]>();
      for (const item of filteredRemoteModels.value) {
        const groupName = item.groupName || "未分组";
        if (!groups.has(groupName)) {
          groups.set(groupName, []);
        }
        groups.get(groupName)?.push(item);
      }
      return Array.from(groups.entries()).map(([groupName, items]) => ({ groupName, items }));
    });
    const modelModalZIndex = computed(() =>
      remoteModelModalVisible.value && modelModalVisible.value ? MODEL_MODAL_Z_INDEX_WHEN_REMOTE_OPEN : undefined,
    );

    const isProviderSaved = computed(() => Boolean(providerForm.id));
    const isProviderConnectionConfigured = (): boolean => providerForm.apiKey.trim() !== "" && providerForm.apiBaseUrl.trim() !== "";
    const createProviderInitial = computed(() => getProviderInitial(providerCreateForm.name));
    const createProviderIcon = computed(() => providerCreateForm.iconFiles[0]?.path ?? "");

    const resetModelForm = (): void => {
      modelForm.id = "";
      modelForm.modelCode = "";
      modelForm.displayName = "";
      modelForm.groupName = "";
      modelForm.sortOrder = "";
      modelForm.remark = "";
      modelForm.endpointType = "";
      modelForm.iconUrl = "";
      modelForm.modelTypes = [];
      modelForm.isFree = false;
    };

    const fillProviderForm = (provider?: ProviderItem): void => {
      providerForm.id = provider?.id ?? "";
      providerForm.providerCode = provider?.providerCode ?? "";
      providerForm.name = provider?.name ?? "";
      providerForm.typeCode = provider?.typeCode ?? store.providerType;
      providerForm.apiKey = provider?.apiKey ?? "";
      savedProviderApiKeyValue.value = providerForm.apiKey;
      providerForm.apiBaseUrl = provider?.apiBaseUrl ?? "";
      providerForm.enabled = provider?.enabled ?? true;
    };

    const runAction = async (handler: () => Promise<void>, successText?: string): Promise<void> => {
      actionLoading.value = true;
      try {
        await handler();
        if (successText) {
          message.success(successText);
        }
      } finally {
        actionLoading.value = false;
      }
    };

    const loadModelsAndGroups = async (): Promise<void> => {
      if (!store.selectedProviderId) {
        modelGroups.value = [];
        return;
      }
      const groups = await cubeAiApplicationService.listModelGroups(store.selectedProviderId);
      modelGroups.value = groups;
    };

    const loadProviderSecrets = async (providerId: string): Promise<void> => {
      if (!providerId) {
        return;
      }
      try {
        const providerDetail = await cubeAiApplicationService.getProvider(providerId);
        if (providerForm.id !== providerId) {
          return;
        }
        providerForm.apiKey = providerDetail.apiKey ?? "";
        savedProviderApiKeyValue.value = providerForm.apiKey;
        providerForm.apiBaseUrl = providerDetail.apiBaseUrl ?? "";
        const hasConnection = isProviderConnectionConfigured();
        providerForm.enabled = providerDetail.enabled && hasConnection;
        if (providerDetail.enabled && !hasConnection) {
          message.warning("该提供商未配置完整的 API 密钥与 API 地址，已保持关闭状态");
        }
      } catch {
        // 详情接口失败时保留列表快照，避免阻断整页初始化
      }
    };

    const loadProviders = async (): Promise<void> => {
      const rows = await cubeAiApplicationService.listProviders();
      providers.value = rows;
      if (!providers.value.find((item) => item.id === store.selectedProviderId)) {
        store.setSelectedProviderId(providers.value[0]?.id ?? "");
      }
      fillProviderForm(selectedProvider.value);
      if (store.selectedProviderId) {
        await loadProviderSecrets(store.selectedProviderId);
      }
      await loadModelsAndGroups();
    };

    const init = async (): Promise<void> => {
      loading.value = true;
      try {
        providerTypes.value = await cubeAiApplicationService.listProviderTypes();
        endpointTypes.value = await cubeAiApplicationService.listEndpointTypes();
        if (!store.providerType && providerTypes.value.length > 0) {
          store.setProviderType(providerTypes.value[0].code);
        }
        await loadProviders();
      } finally {
        loading.value = false;
      }
    };

    const onSelectProvider = async (providerId: string): Promise<void> => {
      store.setSelectedProviderId(providerId);
      fillProviderForm(selectedProvider.value);
      await loadProviderSecrets(providerId);
      resetModelForm();
      await loadModelsAndGroups();
    };

    const onCreateProvider = (): void => {
      providerModalMode.value = "create";
      providerCreateForm.name = "";
      providerCreateForm.typeCode = store.providerType;
      providerCreateForm.iconFiles = [];
      providerModalVisible.value = true;
    };

    const onEditProvider = (provider: ProviderItem): void => {
      providerModalMode.value = "edit";
      providerCreateForm.name = provider.name;
      providerCreateForm.typeCode = provider.typeCode;
      providerCreateForm.iconFiles = provider.iconUrl ? [{ path: provider.iconUrl }] : [];
      store.setSelectedProviderId(provider.id);
      providerModalVisible.value = true;
    };

    const onDeleteProvider = async (provider: ProviderItem): Promise<void> => {
      AntModal.confirm({
        title: "删除提供商",
        content: `确认删除供应商「${resolveProviderName(provider)}」？删除后该提供商及其模型将不可恢复。`,
        okText: "确定",
        cancelText: "取消",
        centered: true,
        onOk: async () => {
          await runAction(async () => {
            await cubeAiApplicationService.deleteProvider(provider.id);
            await loadProviders();
          }, "供应商已删除");
        },
      });
    };

    const closeProviderContextMenu = (): void => {
      providerContextMenuVisible.value = false;
      contextMenuProviderId.value = "";
    };

    const onContextMenuProvider = (event: MouseEvent, provider: ProviderItem): void => {
      if (!provider.isCustom) {
        closeProviderContextMenu();
        return;
      }
      event.preventDefault();
      store.setSelectedProviderId(provider.id);
      providerContextMenuPosition.x = event.clientX;
      providerContextMenuPosition.y = event.clientY;
      contextMenuProviderId.value = provider.id;
      providerContextMenuVisible.value = true;
    };

    const onClickContextMenuEdit = (): void => {
      const provider = providers.value.find((item) => item.id === contextMenuProviderId.value);
      if (!provider || !provider.isCustom) {
        closeProviderContextMenu();
        return;
      }
      onEditProvider(provider);
      closeProviderContextMenu();
    };

    const onClickProviderAvatarUpload = (): void => {
      const input = document.querySelector(`.${styles.providerIconUploader} input[type="file"]`) as HTMLInputElement | null;
      input?.click();
    };

    const onProviderEnabledChange = async (checked: boolean): Promise<void> => {
      if (checked && !isProviderConnectionConfigured()) {
        providerForm.enabled = false;
        message.warning("请先配置 API 密钥和 API 地址后再开启");
        return;
      }
      providerForm.enabled = checked;
      await onSaveProviderSettings();
    };

    const buildProviderSettingsPayload = (): ProviderSettingsPayload => {
      const apiKey = providerForm.apiKey.trim();
      const payload: ProviderSettingsPayload = {
        apiBaseUrl: providerForm.apiBaseUrl.trim() || null,
        enabled: providerForm.enabled,
      };
      if (apiKey !== savedProviderApiKeyValue.value.trim()) {
        payload.apiKey = apiKey || null;
      }
      return payload;
    };

    const applyProviderSettingsResponse = (updated: ProviderItem): void => {
      providerForm.apiKey = updated.apiKey ?? "";
      savedProviderApiKeyValue.value = providerForm.apiKey;
      providerForm.apiBaseUrl = updated.apiBaseUrl ?? "";
      providerForm.enabled = updated.enabled;
      providers.value = providers.value.map((item) => (item.id === updated.id ? updated : item));
    };

    const saveProviderSettings = async (): Promise<void> => {
      if (!providerForm.id) {
        return;
      }
      const updated = await cubeAiApplicationService.updateProviderSettings(providerForm.id, buildProviderSettingsPayload());
      applyProviderSettingsResponse(updated);
    };

    const onSaveProviderSettings = async (showSuccess = false): Promise<void> => {
      if (!providerForm.id) {
        return;
      }
      if (providerForm.enabled && !isProviderConnectionConfigured()) {
        providerForm.enabled = false;
        message.warning("未配置完整的 API 密钥与 API 地址，无法保持开启");
      }
      await runAction(saveProviderSettings, showSuccess ? "设置已保存" : undefined);
    };

    const onFetchRemote = async (): Promise<void> => {
      if (!providerForm.id) {
        message.warning("请先保存供应商");
        return;
      }
      await runAction(async () => {
        remoteModels.value = await cubeAiApplicationService.previewRemoteModels(providerForm.id);
        remoteModelKeyword.value = "";
        remoteModelFilter.value = "all";
        remoteModelModalVisible.value = true;
      });
    };

    const onImportRemoteModel = async (modelCode: string, endpointType?: string): Promise<void> => {
      if (!providerForm.id) {
        return;
      }
      await runAction(async () => {
        await cubeAiApplicationService.importRemoteModels(providerForm.id, [modelCode], endpointType);
        remoteModels.value = remoteModels.value.map((item) => {
          if (item.modelCode !== modelCode) {
            return item;
          }
          return {
            ...item,
            alreadyAdded: true,
          };
        });
        if (remoteImportFromModelCode.value) {
          remoteModels.value = remoteModels.value.map((item) =>
            item.modelCode === remoteImportFromModelCode.value ? { ...item, alreadyAdded: true } : item,
          );
          remoteImportFromModelCode.value = "";
        }
        await loadModelsAndGroups();
      }, "模型已添加");
    };

    const onClickImportRemoteModel = (modelCode: string): void => {
      const remote = remoteModels.value.find((item) => item.modelCode === modelCode);
      if (!remote) {
        return;
      }
      if (selectedProvider.value?.isCustom) {
        modelForm.id = "";
        modelForm.modelCode = remote.modelCode;
        modelForm.displayName = remote.displayName;
        modelForm.groupName = remote.groupName || "";
        modelForm.sortOrder = "";
        modelForm.remark = "";
        modelForm.endpointType = "";
        modelForm.iconUrl = remote.iconUrl ?? "";
        modelForm.modelTypes = [...(remote.modelTypes ?? [])];
        modelForm.isFree = Boolean(remote.isFree);
        modelModalTitle.value = "添加模型";
        remoteImportFromModelCode.value = remote.modelCode;
        modelModalVisible.value = true;
        return;
      }
      void onImportRemoteModel(modelCode, remote.endpointType);
    };

    const onEditModel = (item: ModelItem): void => {
      modelForm.id = item.id;
      modelForm.modelCode = item.modelCode;
      modelForm.displayName = item.displayName;
      modelForm.groupName = item.groupName;
      modelForm.sortOrder = String(item.sortOrder);
      modelForm.remark = item.remark ?? "";
      modelForm.endpointType = item.endpointType ?? "";
      modelForm.iconUrl = item.iconUrl ?? "";
      modelForm.modelTypes = [...(item.modelTypes ?? [])];
      modelForm.isFree = item.isFree;
    };

    const onSaveModel = async (): Promise<void> => {
      if (!providerForm.id) {
        message.warning("请先保存供应商");
        return;
      }
      if (!modelForm.modelCode.trim() || !modelForm.displayName.trim()) {
        message.warning("请输入模型编码和显示名");
        return;
      }
      if (selectedProvider.value?.isCustom && !modelForm.endpointType.trim()) {
        message.warning("自定义提供商请先选择端点类型");
        return;
      }
      const payload = buildModelPayload(modelForm);
      await runAction(async () => {
        if (modelForm.id) {
          await cubeAiApplicationService.updateModel(providerForm.id, modelForm.id, payload);
        } else {
          await cubeAiApplicationService.createModel(providerForm.id, payload);
        }
        resetModelForm();
        modelModalVisible.value = false;
        if (remoteImportFromModelCode.value) {
          remoteModels.value = remoteModels.value.map((item) =>
            item.modelCode === remoteImportFromModelCode.value ? { ...item, alreadyAdded: true } : item,
          );
          remoteImportFromModelCode.value = "";
        }
        await loadModelsAndGroups();
      }, "模型已保存");
    };

    const onDeleteModel = async (modelId: string): Promise<void> => {
      if (!providerForm.id) {
        return;
      }
      AntModal.confirm({
        title: "删除模型",
        content: "确认删除该模型？删除后不可恢复。",
        okText: "确定",
        cancelText: "取消",
        centered: true,
        onOk: async () => {
          await runAction(async () => {
            await cubeAiApplicationService.deleteModel(providerForm.id, modelId);
            await loadModelsAndGroups();
          }, "模型已删除");
        },
      });
    };

    const onSubmitCreateProvider = async (): Promise<void> => {
      if (!providerCreateForm.name.trim()) {
        message.warning("请输入提供商名称");
        return;
      }
      if (!providerCreateForm.typeCode.trim()) {
        message.warning("请选择提供商类型");
        return;
      }
      if (providerModalMode.value === "create") {
        await runAction(async () => {
          const created = await cubeAiApplicationService.createProvider({
            providerCode: `custom-${Date.now()}`,
            typeCode: providerCreateForm.typeCode.trim(),
            name: providerCreateForm.name.trim(),
            iconUrl: providerCreateForm.iconFiles[0]?.path ?? null,
            iconFileId: providerCreateForm.iconFiles[0]?.id ? String(providerCreateForm.iconFiles[0]?.id) : null,
          });
          store.setProviderType(providerCreateForm.typeCode.trim());
          providerModalVisible.value = false;
          await loadProviders();
          store.setSelectedProviderId(created.id);
          fillProviderForm(created);
          await loadModelsAndGroups();
        }, "提供商已新增");
        return;
      }
      if (!store.selectedProviderId) {
        message.warning("请选择要编辑的供应商");
        return;
      }
      await runAction(async () => {
        await cubeAiApplicationService.updateProvider(store.selectedProviderId, {
          typeCode: providerCreateForm.typeCode.trim(),
          name: providerCreateForm.name.trim(),
          iconUrl: providerCreateForm.iconFiles[0]?.path ?? null,
          iconFileId: providerCreateForm.iconFiles[0]?.id ? String(providerCreateForm.iconFiles[0]?.id) : null,
        });
        providerModalVisible.value = false;
        await loadProviders();
      }, "供应商已更新");
    };

    const onOpenCreateModel = (): void => {
      resetModelForm();
      modelModalTitle.value = "添加模型";
      remoteImportFromModelCode.value = "";
      modelModalVisible.value = true;
    };

    const onOpenEditModel = (item: ModelItem): void => {
      onEditModel(item);
      modelModalTitle.value = "编辑模型";
      remoteImportFromModelCode.value = "";
      modelModalVisible.value = true;
    };

    const onSubmitModelDetect = async (): Promise<void> => {
      if (!providerForm.id || !detectModelId.value) {
        message.warning("请选择要检测的模型");
        return;
      }
      await runAction(async () => {
        await saveProviderSettings();
        const result = await cubeAiApplicationService.testModelConnection(providerForm.id, detectModelId.value);
        if (result.ok) {
          message.success(result.message);
          modelDetectModalVisible.value = false;
          return;
        }
        message.warning(result.message);
      });
    };

    const onClickModelDetect = (modelId?: string): void => {
      if (!providerForm.id) {
        message.warning("请先保存供应商");
        return;
      }
      if (allModels.value.length === 0) {
        message.warning("暂无可检测模型");
        return;
      }
      detectModelId.value = modelId ?? allModels.value.find((item) => item.supportsTest)?.id ?? allModels.value[0]?.id ?? "";
      modelDetectModalVisible.value = true;
    };

    const toggleModelType = (typeCode: string): void => {
      if (modelForm.modelTypes.includes(typeCode)) {
        modelForm.modelTypes = modelForm.modelTypes.filter((item) => item !== typeCode);
        return;
      }
      modelForm.modelTypes = [...modelForm.modelTypes, typeCode];
    };

    onMounted(() => {
      void init();
      window.addEventListener("click", closeProviderContextMenu);
      window.addEventListener("scroll", closeProviderContextMenu, true);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("click", closeProviderContextMenu);
      window.removeEventListener("scroll", closeProviderContextMenu, true);
    });

    return (): JSX.Element => (
      <CubeLayout title="模型管理" showFooter={false}>
        {{
          "layout-content": () => (
            <Spin spinning={loading.value || actionLoading.value}>
              <div class={styles.page}>
                <div class={[styles.panel, styles.leftPanel]}>
                  <Input
                    class={styles.search}
                    {...browserAutofillOffProps}
                    value={providerKeyword.value}
                    showCount={false}
                    placeholder="搜索"
                    onUpdate:value={(v: string) => {
                      providerKeyword.value = v;
                    }}
                  />
                  <div class={styles.providerList}>
                    {filteredProviders.value.length === 0 && <div class={styles.empty}>当前类型暂无提供商</div>}
                    {filteredProviders.value.map((item) => (
                      <div
                        key={item.id}
                        class={[styles.providerItem, item.id === store.selectedProviderId ? styles.providerItemActive : ""]}
                        onClick={() => {
                          void onSelectProvider(item.id);
                        }}
                        onContextmenu={(event: MouseEvent) => {
                          onContextMenuProvider(event, item);
                        }}
                      >
                        <div class={styles.providerItemInner}>
                          <span class={styles.providerBadge}>{getProviderInitial(resolveProviderName(item))}</span>
                          <div class={styles.providerName}>{resolveProviderName(item)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button block class={styles.addProviderButton} size="small" onClick={onCreateProvider}>
                    + 添加
                  </Button>
                </div>

                <div class={[styles.panel, styles.rightPanel]}>
                  <div class={styles.panelHeader}>
                    <div class={styles.providerHeaderMain}>
                      <p class={styles.sectionTitle}>
                        {providerForm.name || (selectedProvider.value ? resolveProviderName(selectedProvider.value) : "未选择供应商")}
                      </p>
                    </div>
                    <div class={styles.providerHeaderAside}>
                      <Switch
                        v-model:checked={providerForm.enabled}
                        onChange={(checked: boolean) => {
                          void onProviderEnabledChange(checked);
                        }}
                      />
                    </div>
                  </div>
                  <div class={styles.formGrid}>
                    <div class={styles.row}>
                      <span class={styles.rowLabel}>API密钥</span>
                      <div class={styles.rowControl}>
                        <Input
                          class={[styles.input, styles.detectInput]}
                          {...secretAutofillOffProps}
                          value={providerForm.apiKey}
                          type={apiKeyInputType.value}
                          maxLength={300}
                          showCount={false}
                          placeholder={getApiKeyPlaceholder(providerForm.apiKey)}
                          addonAfter={
                            <Button
                              type="link"
                              data-api-key-control="true"
                              class={styles.detectAddonButton}
                              onClick={() => {
                                onClickModelDetect();
                              }}
                            >
                              检测
                            </Button>
                          }
                          onUpdate:value={(v: string) => {
                            providerForm.apiKey = v;
                          }}
                          onBlur={async (event: FocusEvent) => {
                            const nextFocus = event.relatedTarget as HTMLElement | null;
                            if (nextFocus?.dataset.apiKeyControl === "true") {
                              return;
                            }
                            await onSaveProviderSettings();
                          }}
                        />
                      </div>
                    </div>
                    <div class={styles.row}>
                      <span class={styles.rowLabel}>API地址</span>
                      <div class={styles.rowControl}>
                        <Input
                          class={styles.input}
                          {...browserAutofillOffProps}
                          value={providerForm.apiBaseUrl}
                          maxLength={300}
                          showCount={false}
                          placeholder="输入API地址"
                          onUpdate:value={(v: string) => {
                            providerForm.apiBaseUrl = v;
                          }}
                          onBlur={async () => {
                            await onSaveProviderSettings();
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div class={styles.panelHeader}>
                    <p class={[styles.sectionTitle, styles.modelSectionTitle]}>模型</p>
                    <div class={styles.headerActions}>
                      <Button
                        class={[styles.iconActionButton, styles.fetchModelButton]}
                        disabled={!isProviderSaved.value}
                        onClick={() => {
                          void onFetchRemote();
                        }}
                      >
                        <span class={[styles.actionIcon, styles.getModelIcon]} />
                        <span>获取模型列表</span>
                      </Button>
                      <Button
                        class={[styles.iconActionButton, styles.addModelButton]}
                        disabled={!isProviderSaved.value}
                        onClick={onOpenCreateModel}
                      >
                        <span class={[styles.actionIcon, styles.addModelIcon]} />
                        <span>添加</span>
                      </Button>
                    </div>
                  </div>
                  <Input
                    class={styles.search}
                    {...browserAutofillOffProps}
                    value={modelKeyword.value}
                    showCount={false}
                    placeholder="搜索模型"
                    onUpdate:value={(v: string) => {
                      modelKeyword.value = v;
                    }}
                  />
                  <div class={styles.groups}>
                    {filteredModelGroups.value.length === 0 && <div class={styles.empty}>暂无模型数据</div>}
                    {filteredModelGroups.value.map((group, groupIdx) => (
                      <div key={group.groupName} class={styles.groupCard}>
                        <button
                          type="button"
                          class={[styles.groupCardHeader, !isModelGroupCollapsed(group.groupName) && styles.groupCardHeaderExpanded]}
                          aria-expanded={!isModelGroupCollapsed(group.groupName)}
                          aria-controls={`model-group-panel-${groupIdx}`}
                          onClick={() => {
                            toggleModelGroupCollapse(group.groupName);
                          }}
                        >
                          <span
                            class={[
                              styles.groupCollapseCaret,
                              isModelGroupCollapsed(group.groupName) && styles.groupCollapseCaretCollapsed,
                            ]}
                            aria-hidden
                          />
                          <span class={styles.groupTitle}>
                            {group.groupName}（{group.items.length}）
                          </span>
                        </button>
                        {!isModelGroupCollapsed(group.groupName) && (
                          <div id={`model-group-panel-${groupIdx}`} class={styles.groupCardBody} role="group">
                            {group.items.map((item) => (
                              <div key={item.id} class={styles.modelRow}>
                                <div class={styles.modelRowMain}>
                                  <img
                                    class={styles.modelRowIcon}
                                    src={item.iconUrl || "/resource/v1/ai-application/getModel.png"}
                                    alt={item.displayName}
                                  />
                                  <div class={styles.modelRowText}>
                                    <div class={styles.modelRowName}>{item.displayName}</div>
                                    <div class={styles.modelRowCode}>{item.modelCode}</div>
                                    {item.modelTypes?.length > 0 && (
                                      <div class={styles.modelTypeTagWrap}>
                                        {item.modelTypes.map((type) => {
                                          const matched = MODEL_TYPE_OPTIONS.find((option) => option.value === type);
                                          return (
                                            <span key={type} class={styles.modelTypeTag}>
                                              {matched?.label ?? type}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Space>
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => {
                                      onOpenEditModel(item);
                                    }}
                                  >
                                    编辑
                                  </Button>
                                  <Button
                                    type="link"
                                    size="small"
                                    danger
                                    onClick={() => {
                                      void onDeleteModel(item.id);
                                    }}
                                  >
                                    删除
                                  </Button>
                                </Space>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {providerContextMenuVisible.value && (
                  <div
                    class={styles.providerContextMenu}
                    style={{
                      left: `${providerContextMenuPosition.x}px`,
                      top: `${providerContextMenuPosition.y}px`,
                    }}
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation();
                    }}
                  >
                    <button type="button" class={styles.providerContextMenuItem} onClick={onClickContextMenuEdit}>
                      编辑
                    </button>
                    <button
                      type="button"
                      class={[styles.providerContextMenuItem, styles.providerContextMenuItemDanger]}
                      onClick={() => {
                        const provider = providers.value.find((item) => item.id === contextMenuProviderId.value);
                        if (!provider || !provider.isCustom) {
                          closeProviderContextMenu();
                          return;
                        }
                        closeProviderContextMenu();
                        void onDeleteProvider(provider);
                      }}
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>

              <AntModal
                v-model:visible={remoteModelModalVisible.value}
                title={`${selectedProvider.value ? resolveProviderName(selectedProvider.value) : ""}模型`}
                width={760}
                maskClosable={false}
                footer={null}
                onCancel={() => {
                  remoteModelModalVisible.value = false;
                }}
              >
                <div class={styles.remoteModalBody}>
                  <div class={styles.remoteToolbar}>
                    <Input
                      class={styles.remoteSearch}
                      {...browserAutofillOffProps}
                      value={remoteModelKeyword.value}
                      showCount={false}
                      placeholder="搜索模型ID或名称"
                      onUpdate:value={(v: string) => {
                        remoteModelKeyword.value = v;
                      }}
                    />
                    <Button
                      class={styles.remoteRefreshButton}
                      onClick={() => {
                        void onFetchRemote();
                      }}
                    >
                      刷新
                    </Button>
                  </div>
                  <div class={styles.remoteFilterTabs}>
                    {REMOTE_FILTER_OPTIONS.map((item) => (
                      <Button
                        key={item.value}
                        type="link"
                        class={[styles.remoteFilterTab, remoteModelFilter.value === item.value ? styles.remoteFilterTabActive : ""]}
                        onClick={() => {
                          remoteModelFilter.value = item.value;
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  <div class={styles.remoteList}>
                    {remoteGroupedModels.value.length === 0 && <div class={styles.empty}>暂无可添加模型</div>}
                    {remoteGroupedModels.value.map((group) => (
                      <div key={group.groupName} class={styles.remoteGroup}>
                        <div class={styles.groupTitle}>{group.groupName}</div>
                        {group.items.map((item) => (
                          <div key={item.modelCode} class={styles.remoteItem}>
                            <div class={styles.remoteItemMain}>
                              <img class={styles.remoteItemIcon} src={item.iconUrl} alt={item.displayName} />
                              <div class={styles.remoteItemText}>
                                <div class={styles.remoteItemCodeRow}>
                                  <span class={styles.remoteItemCode}>{item.modelCode}</span>
                                  {item.isFree && <span class={styles.remoteFreeTag}>免费</span>}
                                </div>
                                <div class={styles.remoteItemName}>{item.displayName}</div>
                                <div class={styles.remoteTypeWrap}>
                                  {item.modelTypes.map((type) => {
                                    const matched = MODEL_TYPE_OPTIONS.find((option) => option.value === type);
                                    return (
                                      <span key={type} class={styles.remoteTypeTag}>
                                        {matched?.label ?? type}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <div class={styles.remoteItemActions}>
                              {item.alreadyAdded ? (
                                <span class={styles.remoteAddedText}>已添加</span>
                              ) : (
                                <Button
                                  type="link"
                                  size="small"
                                  class={styles.remoteAddBtn}
                                  onClick={() => {
                                    onClickImportRemoteModel(item.modelCode);
                                  }}
                                >
                                  <span class={styles.remotePlus}>+</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </AntModal>

              <AntModal
                v-model:visible={providerModalVisible.value}
                title={providerModalMode.value === "create" ? "添加" : "编辑供应商"}
                width={500}
                maskClosable={false}
                okText="确认"
                cancelText="取消"
                onOk={() => {
                  void onSubmitCreateProvider();
                }}
                onCancel={() => {
                  providerModalVisible.value = false;
                }}
              >
                <div class={styles.providerModalHeader}>
                  <div class={styles.providerAvatar} onClick={onClickProviderAvatarUpload}>
                    {createProviderIcon.value ? (
                      <img class={styles.providerAvatarImage} src={createProviderIcon.value} alt="provider icon" />
                    ) : (
                      createProviderInitial.value
                    )}
                  </div>
                </div>
                <Form labelCol={{ style: { width: "100px" } }} class={styles.providerModalForm}>
                  <FormItem label="提供商名称：">
                    <Input
                      {...browserAutofillOffProps}
                      value={providerCreateForm.name}
                      showCount={false}
                      onUpdate:value={(v: string) => {
                        providerCreateForm.name = v;
                      }}
                    />
                  </FormItem>
                  <FormItem label="提供商类型：">
                    <Select
                      class={styles.select}
                      value={providerCreateForm.typeCode || undefined}
                      options={providerTypes.value.map((item) => ({ label: item.displayName, value: item.code }))}
                      placeholder="请选择"
                      onUpdate:value={(value: string) => {
                        providerCreateForm.typeCode = value ?? "";
                      }}
                    />
                  </FormItem>
                </Form>
                <div class={styles.providerIconUploader}>
                  <FileUpload
                    sceneCode="OUAA::APP"
                    v-model:value={providerCreateForm.iconFiles}
                    maxCount={1}
                    type="picture-card"
                    size={72}
                    showText={false}
                    customText="请上传图片|单个附件最大支持100MB"
                    typeList={[".png", ".jpg", ".jpeg", ".svg", ".webp"]}
                  />
                </div>
              </AntModal>

              <AntModal
                v-model:visible={modelDetectModalVisible.value}
                title="请选择要检测的模型"
                width={500}
                maskClosable={false}
                okText="确定"
                cancelText="取消"
                onOk={() => {
                  void onSubmitModelDetect();
                }}
                onCancel={() => {
                  modelDetectModalVisible.value = false;
                }}
              >
                <div class={styles.detectModalBody}>
                  <Select
                    class={styles.select}
                    value={detectModelId.value || undefined}
                    options={allModels.value.map((item) => ({
                      label: `${item.modelCode}${item.supportsTest ? "" : "（暂不支持检测）"}`,
                      value: item.id,
                    }))}
                    placeholder="请选择"
                    onUpdate:value={(value: string) => {
                      detectModelId.value = value ?? "";
                    }}
                  />
                  {!allModels.value.find((item) => item.id === detectModelId.value)?.supportsTest && detectModelId.value && (
                    <p class={styles.testHint}>当前模型类型暂不支持检测，通常为重排模型。</p>
                  )}
                </div>
              </AntModal>

              <AntModal
                v-model:visible={modelModalVisible.value}
                title={modelModalTitle.value}
                width={500}
                zIndex={modelModalZIndex.value}
                destroyOnClose
                maskClosable={false}
                okText="保存"
                cancelText="取消"
                onOk={() => {
                  void onSaveModel();
                }}
                onCancel={() => {
                  modelModalVisible.value = false;
                  remoteImportFromModelCode.value = "";
                  resetModelForm();
                }}
              >
                <Form labelCol={{ style: { width: "90px" } }}>
                  <FormItem label="模型ID：">
                    <Input
                      {...browserAutofillOffProps}
                      disabled={Boolean(modelForm.id)}
                      value={modelForm.modelCode}
                      showCount={false}
                      onUpdate:value={(v: string) => {
                        modelForm.modelCode = v;
                      }}
                    />
                  </FormItem>
                  <FormItem label="模型名称：">
                    <Input
                      {...browserAutofillOffProps}
                      value={modelForm.displayName}
                      showCount={false}
                      onUpdate:value={(v: string) => {
                        modelForm.displayName = v;
                      }}
                    />
                  </FormItem>
                  <FormItem label="分组名称：">
                    <Input
                      {...browserAutofillOffProps}
                      value={modelForm.groupName}
                      showCount={false}
                      onUpdate:value={(v: string) => {
                        modelForm.groupName = v;
                      }}
                    />
                  </FormItem>
                  {selectedProvider.value?.isCustom && (
                    <FormItem label="端点类型：">
                      <Select
                        class={styles.select}
                        value={modelForm.endpointType || undefined}
                        options={endpointTypes.value.map((item) => ({ label: item.displayName, value: item.code }))}
                        placeholder="请选择"
                        onUpdate:value={(value: string) => {
                          modelForm.endpointType = value ?? "";
                        }}
                      />
                    </FormItem>
                  )}
                  <FormItem label="模型类型：">
                    <div class={styles.modelTypeWrap}>
                      {MODEL_TYPE_OPTIONS.map((item) => (
                        <Button
                          key={item.value}
                          type="default"
                          size="small"
                          class={[styles.typePill, modelForm.modelTypes.includes(item.value) ? styles.typePillActive : ""]}
                          onClick={() => {
                            toggleModelType(item.value);
                          }}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </FormItem>
                  <FormItem label="是否免费：">
                    <Switch v-model:checked={modelForm.isFree} />
                  </FormItem>
                  <FormItem label="测试能力：">
                    <span class={styles.testHint}>
                      {modelForm.modelTypes.includes("rerank") ? "不支持测试调用（重排模型）" : "支持测试调用"}
                    </span>
                  </FormItem>
                </Form>
              </AntModal>
            </Spin>
          ),
        }}
      </CubeLayout>
    );
  },
});
